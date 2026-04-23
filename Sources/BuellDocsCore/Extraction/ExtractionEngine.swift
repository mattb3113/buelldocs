import Foundation
import CoreGraphics

/// Output of a single-page extraction pass.
public struct PageExtraction: Sendable {
    public var headerFields: [String: AnyField]
    public var records: [Record]
    public var uncertainRegions: [UncertainRegion]

    public init(
        headerFields: [String: AnyField] = [:],
        records: [Record] = [],
        uncertainRegions: [UncertainRegion] = []
    ) {
        self.headerFields = headerFields
        self.records = records
        self.uncertainRegions = uncertainRegions
    }
}

/// A zone where the template extractor was unsure — handed to the AI pass.
public struct UncertainRegion: Sendable, Hashable {
    public let fieldKey: String
    public let recordID: UUID?
    public let pageIndex: Int
    public let box: CGRect
    public let reason: String
    public init(fieldKey: String, recordID: UUID?, pageIndex: Int, box: CGRect, reason: String) {
        self.fieldKey = fieldKey
        self.recordID = recordID
        self.pageIndex = pageIndex
        self.box = box
        self.reason = reason
    }
}

public protocol ExtractionEngine: Sendable {
    func extract(
        page: ScannedPage,
        ocr: OCRResult,
        classification: PageClassification,
        schema: ExtractionSchema,
        documentID: UUID
    ) async throws -> PageExtraction
}

/// Two-pass extractor:
///   1. Template pass scans schema regions and parses values from OCR text.
///   2. Low-confidence fields are sent to the `VisionLanguageExtractor` for
///      semantic reconciliation (handwriting, crossed-out cells, etc.).
public struct LayoutAwareExtractionEngine: ExtractionEngine {
    public let parser: ValueParser
    public let visionLanguage: VisionLanguageExtracting?
    public let lowConfidenceThreshold: Confidence

    public init(
        parser: ValueParser = ValueParser(),
        visionLanguage: VisionLanguageExtracting? = nil,
        lowConfidenceThreshold: Confidence = Confidence(0.70)
    ) {
        self.parser = parser
        self.visionLanguage = visionLanguage
        self.lowConfidenceThreshold = lowConfidenceThreshold
    }

    public func extract(
        page: ScannedPage,
        ocr: OCRResult,
        classification: PageClassification,
        schema: ExtractionSchema,
        documentID: UUID
    ) async throws -> PageExtraction {
        let templatePass = templateExtract(
            page: page,
            ocr: ocr,
            schema: schema,
            documentID: documentID
        )

        guard let visionLanguage, !templatePass.uncertainRegions.isEmpty else {
            return templatePass
        }

        let reconciled = try await visionLanguage.reconcile(
            page: page,
            uncertain: templatePass.uncertainRegions,
            schema: schema
        )
        return merge(template: templatePass, reconciled: reconciled)
    }

    // MARK: - Template pass

    private func templateExtract(
        page: ScannedPage,
        ocr: OCRResult,
        schema: ExtractionSchema,
        documentID: UUID
    ) -> PageExtraction {
        var headerFields: [String: AnyField] = [:]
        var uncertain: [UncertainRegion] = []

        for spec in schema.headerFields {
            let (field, uncertainRegion) = extractField(
                spec: spec,
                region: spec.region,
                ocr: ocr,
                pageIndex: page.index,
                recordID: nil
            )
            headerFields[spec.key] = field
            if let uncertainRegion { uncertain.append(uncertainRegion) }
        }

        var records: [Record] = []
        if let rowBand = schema.rowBand {
            let rowCount = Int((rowBand.region.height / CGFloat(rowBand.rowHeightNormalized)).rounded(.down))
            for rowIndex in 0..<rowCount {
                let rowOrigin = CGPoint(
                    x: rowBand.region.minX,
                    y: rowBand.region.minY + CGFloat(Double(rowIndex) * rowBand.rowHeightNormalized)
                )
                let rowRect = CGRect(
                    x: rowOrigin.x, y: rowOrigin.y,
                    width: rowBand.region.width,
                    height: CGFloat(rowBand.rowHeightNormalized)
                )

                // Skip rows that are entirely blank in OCR — avoids churning
                // empty lines at the bottom of half-full forms.
                if ocr.observations(in: rowRect, minOverlap: 0.3).isEmpty { continue }

                var fields: [String: AnyField] = [:]
                let record = Record(
                    documentID: documentID,
                    pageIndex: page.index,
                    rowIndex: rowIndex
                )

                for column in rowBand.columns {
                    let colRect = CGRect(
                        x: rowRect.minX + CGFloat(column.xStart) * rowRect.width,
                        y: rowRect.minY,
                        width: CGFloat(column.xEnd - column.xStart) * rowRect.width,
                        height: rowRect.height
                    )
                    let spec = FieldSpec(
                        key: column.key,
                        displayName: column.displayName,
                        region: colRect,
                        kind: column.kind,
                        required: column.required
                    )
                    let (field, uncertainRegion) = extractField(
                        spec: spec,
                        region: colRect,
                        ocr: ocr,
                        pageIndex: page.index,
                        recordID: record.id
                    )
                    fields[column.key] = field
                    if let uncertainRegion { uncertain.append(uncertainRegion) }
                }

                for inherit in rowBand.inheritFromHeader {
                    if let header = headerFields[inherit] {
                        fields[inherit] = header
                    }
                }
                var finished = record
                finished.fields = fields
                records.append(finished)
            }
        }

        return PageExtraction(
            headerFields: headerFields,
            records: records,
            uncertainRegions: uncertain
        )
    }

    private func extractField(
        spec: FieldSpec,
        region: CGRect,
        ocr: OCRResult,
        pageIndex: Int,
        recordID: UUID?
    ) -> (AnyField, UncertainRegion?) {
        let rawText = ocr.text(in: region)
        let ocrConfidence = ocr
            .observations(in: region)
            .map(\.confidence)
            .min() ?? .zero
        let (value, parseConfidence) = parser.parse(rawText, kind: spec.kind)
        // Joint confidence = multiplicative (weakest link dominates).
        let combined = Confidence(ocrConfidence.value * parseConfidence.value)
        let field = AnyField(
            value: value,
            rawText: rawText.isEmpty ? nil : rawText,
            confidence: combined,
            pageIndex: pageIndex,
            boundingBox: region,
            extractor: .template
        )
        let needsAI = combined < lowConfidenceThreshold
        let uncertain = needsAI
            ? UncertainRegion(
                fieldKey: spec.key,
                recordID: recordID,
                pageIndex: pageIndex,
                box: region,
                reason: rawText.isEmpty ? "no OCR text" : "low confidence \(combined.value)"
            )
            : nil
        return (field, uncertain)
    }

    // MARK: - Reconciliation

    private func merge(template: PageExtraction, reconciled: [ReconciledField]) -> PageExtraction {
        var header = template.headerFields
        var records = template.records
        let recordIndex = Dictionary(uniqueKeysWithValues: records.enumerated().map { ($0.element.id, $0.offset) })

        for fix in reconciled where fix.confidence >= lowConfidenceThreshold {
            if let recordID = fix.recordID, let idx = recordIndex[recordID] {
                var fields = records[idx].fields
                if var existing = fields[fix.fieldKey] {
                    existing.value = fix.value
                    existing.rawText = fix.rawText ?? existing.rawText
                    existing.confidence = fix.confidence
                    existing.extractor = .visionLanguage
                    fields[fix.fieldKey] = existing
                }
                records[idx].fields = fields
            } else if var existing = header[fix.fieldKey] {
                existing.value = fix.value
                existing.rawText = fix.rawText ?? existing.rawText
                existing.confidence = fix.confidence
                existing.extractor = .visionLanguage
                header[fix.fieldKey] = existing
            }
        }
        return PageExtraction(
            headerFields: header,
            records: records,
            uncertainRegions: template.uncertainRegions.filter { region in
                !reconciled.contains { $0.fieldKey == region.fieldKey && $0.recordID == region.recordID }
            }
        )
    }
}
