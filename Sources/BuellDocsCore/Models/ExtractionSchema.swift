import Foundation
import CoreGraphics

/// Describes how to extract one document type.
/// Schemas are data, not code, so new forms can be onboarded without a rebuild.
public struct ExtractionSchema: Identifiable, Codable, Sendable, Hashable {
    public var id: String                    // stable key, e.g. "daily-doff-v1"
    public var documentType: DocumentType
    public var headerFields: [FieldSpec]     // single-value fields in the header area
    public var rowBand: RowBand?             // where table rows live + column positions
    public var requiredKeys: Set<String>     // keys that must be present to consider the row valid

    public init(
        id: String,
        documentType: DocumentType,
        headerFields: [FieldSpec] = [],
        rowBand: RowBand? = nil,
        requiredKeys: Set<String> = []
    ) {
        self.id = id
        self.documentType = documentType
        self.headerFields = headerFields
        self.rowBand = rowBand
        self.requiredKeys = requiredKeys
    }
}

/// Anchor rectangle + parsing hint for a single field.
public struct FieldSpec: Codable, Sendable, Hashable {
    public var key: String
    public var displayName: String
    public var region: CGRect                // normalized 0...1 coordinates
    public var kind: FieldKind
    public var required: Bool

    public init(
        key: String,
        displayName: String,
        region: CGRect,
        kind: FieldKind,
        required: Bool = false
    ) {
        self.key = key
        self.displayName = displayName
        self.region = region
        self.kind = kind
        self.required = required
    }
}

public enum FieldKind: String, Codable, Sendable {
    case string, integer, decimal, date, time, checkbox, signature, notes
}

/// Table row region description.
public struct RowBand: Codable, Sendable, Hashable {
    public var region: CGRect
    public var rowHeightNormalized: Double
    public var columns: [ColumnSpec]
    public var inheritFromHeader: [String]   // keys pulled from header into every row

    public init(
        region: CGRect,
        rowHeightNormalized: Double,
        columns: [ColumnSpec],
        inheritFromHeader: [String] = []
    ) {
        self.region = region
        self.rowHeightNormalized = rowHeightNormalized
        self.columns = columns
        self.inheritFromHeader = inheritFromHeader
    }
}

public struct ColumnSpec: Codable, Sendable, Hashable {
    public var key: String
    public var displayName: String
    public var xStart: Double                // normalized x within the row band
    public var xEnd: Double
    public var kind: FieldKind
    public var required: Bool

    public init(
        key: String,
        displayName: String,
        xStart: Double,
        xEnd: Double,
        kind: FieldKind,
        required: Bool = false
    ) {
        self.key = key
        self.displayName = displayName
        self.xStart = xStart
        self.xEnd = xEnd
        self.kind = kind
        self.required = required
    }
}
