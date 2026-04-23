import Foundation
import CoreGraphics

/// A single row extracted from a production form.
/// The body is a dictionary of named fields so each document type
/// can define its own column set without subclassing.
public struct Record: Identifiable, Codable, Sendable, Hashable {
    public let id: UUID
    public var documentID: UUID
    public var pageIndex: Int
    public var rowIndex: Int
    public var fields: [String: AnyField]

    /// Aggregate confidence for the row (min of field confidences).
    public var rowConfidence: Confidence {
        fields.values.map(\.confidence).min() ?? .zero
    }

    public init(
        id: UUID = UUID(),
        documentID: UUID,
        pageIndex: Int,
        rowIndex: Int,
        fields: [String: AnyField] = [:]
    ) {
        self.id = id
        self.documentID = documentID
        self.pageIndex = pageIndex
        self.rowIndex = rowIndex
        self.fields = fields
    }
}

/// Type-erased wrapper so a row can mix strings, numbers, dates, and marks
/// while still keeping provenance (source region, extractor, confidence).
public struct AnyField: Codable, Sendable, Hashable {
    public enum Value: Codable, Sendable, Hashable {
        case string(String)
        case integer(Int)
        case decimal(Double)
        case date(Date)
        case bool(Bool)
        case missing
    }

    public enum Extractor: String, Codable, Sendable {
        case template, vision, visionLanguage, manual
    }

    public var value: Value
    public var rawText: String?
    public var confidence: Confidence
    public var pageIndex: Int
    public var boundingBox: CGRect
    public var extractor: Extractor

    public init(
        value: Value,
        rawText: String? = nil,
        confidence: Confidence,
        pageIndex: Int,
        boundingBox: CGRect,
        extractor: Extractor
    ) {
        self.value = value
        self.rawText = rawText
        self.confidence = confidence
        self.pageIndex = pageIndex
        self.boundingBox = boundingBox
        self.extractor = extractor
    }
}
