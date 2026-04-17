import Foundation

/// A validation or extraction issue surfaced to the reviewer.
/// The pipeline never silently drops data — anything uncertain becomes an Exception.
public struct Exception: Identifiable, Codable, Sendable, Hashable {
    public let id: UUID
    public var recordID: UUID?
    public var pageIndex: Int
    public var fieldKey: String?
    public var severity: Severity
    public var kind: Kind
    public var message: String
    public var suggestedValue: String?
    public var resolved: Bool

    public enum Severity: String, Codable, Sendable {
        case info, warning, error
    }

    public enum Kind: String, Codable, Sendable {
        case lowConfidence
        case missingRequiredField
        case failedValidation
        case crossFieldMismatch
        case unknownDocumentType
        case totalMismatch
        case duplicateRow
        case ambiguousClassification
    }

    public init(
        id: UUID = UUID(),
        recordID: UUID? = nil,
        pageIndex: Int,
        fieldKey: String? = nil,
        severity: Severity,
        kind: Kind,
        message: String,
        suggestedValue: String? = nil,
        resolved: Bool = false
    ) {
        self.id = id
        self.recordID = recordID
        self.pageIndex = pageIndex
        self.fieldKey = fieldKey
        self.severity = severity
        self.kind = kind
        self.message = message
        self.suggestedValue = suggestedValue
        self.resolved = resolved
    }
}
