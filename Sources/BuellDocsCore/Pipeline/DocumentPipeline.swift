import Foundation

/// Orchestrates the full capture → export pipeline. Each stage is injected so
/// tests can substitute fakes without touching real VisionKit or the network.
public actor DocumentPipeline {
    public let preprocessor: ImagePreprocessing
    public let multiForm: MultiFormDetector
    public let recognizer: TextRecognizing
    public let classifier: DocumentClassifying
    public let extractor: ExtractionEngine
    public let rules: RulesEngine
    public let schemas: SchemaRegistry

    public init(
        preprocessor: ImagePreprocessing = CoreImagePreprocessor(),
        multiForm: MultiFormDetector = MultiFormDetector(),
        recognizer: TextRecognizing = VisionTextRecognizer(),
        classifier: DocumentClassifying = HeuristicClassifier(),
        extractor: ExtractionEngine = LayoutAwareExtractionEngine(),
        rules: RulesEngine = .standard,
        schemas: SchemaRegistry = SchemaRegistry()
    ) {
        self.preprocessor = preprocessor
        self.multiForm = multiForm
        self.recognizer = recognizer
        self.classifier = classifier
        self.extractor = extractor
        self.rules = rules
        self.schemas = schemas
    }

    public func process(_ scanned: ScannedDocument) async throws -> ProcessedDocument {
        var classifications: [PageClassification] = []
        var records: [Record] = []
        var exceptions: [Exception] = []

        // Expand any multi-form pages and preprocess in parallel to keep
        // latency down on multi-page PDFs.
        let expanded = try await expandPages(scanned.pages)
        let preprocessor = self.preprocessor
        let cleaned = try await withThrowingTaskGroup(of: ScannedPage.self) { group in
            for page in expanded {
                group.addTask { try await preprocessor.process(page) }
            }
            var out: [ScannedPage] = []
            for try await page in group { out.append(page) }
            return out.sorted { $0.index < $1.index }
        }

        for page in cleaned {
            let ocr = try await recognizer.recognize(page: page)
            let classification = try await classifier.classify(page: page, ocr: ocr)
            classifications.append(classification)

            guard classification.documentType != .unknown,
                  let schema = schemas.schema(for: classification.schemaID) ?? schemas.schema(for: classification.documentType) else {
                exceptions.append(
                    Exception(
                        pageIndex: page.index,
                        severity: .warning,
                        kind: .unknownDocumentType,
                        message: "Could not classify page \(page.index + 1)"
                    )
                )
                continue
            }

            let extraction = try await extractor.extract(
                page: page,
                ocr: ocr,
                classification: classification,
                schema: schema,
                documentID: scanned.id
            )
            var pageRecords = extraction.records
            let ruleExceptions = rules.apply(records: &pageRecords, schema: schema)
            records.append(contentsOf: pageRecords)
            exceptions.append(contentsOf: ruleExceptions)

            // Turn remaining uncertain regions (AI didn't help) into review items.
            for region in extraction.uncertainRegions {
                exceptions.append(
                    Exception(
                        recordID: region.recordID,
                        pageIndex: region.pageIndex,
                        fieldKey: region.fieldKey,
                        severity: .warning,
                        kind: .lowConfidence,
                        message: region.reason
                    )
                )
            }
        }

        return ProcessedDocument(
            scanned: scanned,
            pages: classifications,
            records: records,
            exceptions: exceptions
        )
    }

    private func expandPages(_ pages: [ScannedPage]) async throws -> [ScannedPage] {
        var result: [ScannedPage] = []
        for page in pages {
            let slices = try await multiForm.split(page)
            result.append(contentsOf: slices)
        }
        return result
    }
}
