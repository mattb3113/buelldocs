import Foundation

/// Classifier output for a single captured page.
public struct PageClassification: Identifiable, Codable, Sendable, Hashable {
    public let id: UUID
    public var pageIndex: Int
    public var documentType: DocumentType
    public var formCode: String?
    public var workOrderHint: String?         // likely SA / work-order number from the header
    public var confidence: Confidence
    public var schemaID: String               // extraction schema key

    public init(
        id: UUID = UUID(),
        pageIndex: Int,
        documentType: DocumentType,
        formCode: String? = nil,
        workOrderHint: String? = nil,
        confidence: Confidence,
        schemaID: String
    ) {
        self.id = id
        self.pageIndex = pageIndex
        self.documentType = documentType
        self.formCode = formCode
        self.workOrderHint = workOrderHint
        self.confidence = confidence
        self.schemaID = schemaID
    }
}
