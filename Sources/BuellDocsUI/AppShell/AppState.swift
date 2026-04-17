import Foundation
import Combine
import BuellDocsCore

/// Top-level observable state for the SwiftUI app.
/// Orchestrates the pipeline, owns the review queue, and drives export.
@MainActor
public final class AppState: ObservableObject {
    @Published public private(set) var documents: [ProcessedDocument] = []
    @Published public private(set) var reviewQueue = ReviewQueue(documents: [])
    @Published public private(set) var isProcessing = false
    @Published public var lastError: String?

    public let pipeline: DocumentPipeline
    public let writer = XLSXWriter()
    public let templates: [ExcelTemplate]

    public init(
        pipeline: DocumentPipeline = DocumentPipeline(),
        templates: [ExcelTemplate] = ExcelTemplate.builtIns
    ) {
        self.pipeline = pipeline
        self.templates = templates
    }

    public func ingest(_ scanned: ScannedDocument) async {
        isProcessing = true
        defer { isProcessing = false }
        do {
            let processed = try await pipeline.process(scanned)
            documents.append(processed)
            reviewQueue = ReviewQueue(documents: documents)
        } catch {
            lastError = error.localizedDescription
        }
    }

    public func resolve(_ itemID: UUID, correctedValue: AnyField.Value? = nil) {
        reviewQueue.resolve(itemID, correctedValue: correctedValue)
    }

    public func exportURL(for template: ExcelTemplate) throws -> URL {
        let records = documents
            .flatMap(\.records)
            .filter { record in
                documents.first { $0.id == record.documentID }?
                    .pages.first { $0.pageIndex == record.pageIndex }?
                    .documentType == template.documentType
            }
        let filename = "\(template.id)-\(Date().timeIntervalSince1970).xlsx"
        let url = FileManager.default.temporaryDirectory.appendingPathComponent(filename)
        try writer.write(records: records, template: template, to: url)
        return url
    }
}
