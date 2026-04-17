import Foundation
import CoreGraphics

/// In-memory registry of extraction schemas, keyed by schema ID.
/// Ships with a built-in set for known forms; additional schemas can be
/// registered at runtime (e.g. from JSON shipped with the app bundle).
public final class SchemaRegistry: @unchecked Sendable {
    private var schemas: [String: ExtractionSchema] = [:]
    private let lock = NSLock()

    public init(preload: [ExtractionSchema] = SchemaRegistry.builtIn) {
        for schema in preload {
            schemas[schema.id] = schema
        }
    }

    public func register(_ schema: ExtractionSchema) {
        lock.lock(); defer { lock.unlock() }
        schemas[schema.id] = schema
    }

    public func schema(for id: String) -> ExtractionSchema? {
        lock.lock(); defer { lock.unlock() }
        return schemas[id]
    }

    public func schema(for type: DocumentType) -> ExtractionSchema? {
        lock.lock(); defer { lock.unlock() }
        return schemas.values.first { $0.documentType == type }
    }

    public var all: [ExtractionSchema] {
        lock.lock(); defer { lock.unlock() }
        return Array(schemas.values)
    }

    /// Reasonable starting schemas. Coordinates are placeholders and should be
    /// tightened against real samples of each form.
    public static let builtIn: [ExtractionSchema] = [
        dailyDoffV1,
        aerospacePackageCountV1,
        tareWorksheetV1,
    ]

    static let dailyDoffV1 = ExtractionSchema(
        id: "daily-doff-v1",
        documentType: .dailyDoffRecord,
        headerFields: [
            FieldSpec(key: "saNumber",   displayName: "SA / Work Order",
                      region: CGRect(x: 0.62, y: 0.02, width: 0.35, height: 0.05), kind: .string, required: true),
            FieldSpec(key: "icfCode",    displayName: "ICF Code",
                      region: CGRect(x: 0.35, y: 0.02, width: 0.25, height: 0.05), kind: .string),
            FieldSpec(key: "shiftDate",  displayName: "Date",
                      region: CGRect(x: 0.02, y: 0.02, width: 0.30, height: 0.05), kind: .date, required: true),
        ],
        rowBand: RowBand(
            region: CGRect(x: 0.02, y: 0.15, width: 0.96, height: 0.70),
            rowHeightNormalized: 0.05,
            columns: [
                ColumnSpec(key: "time",     displayName: "Time",      xStart: 0.00, xEnd: 0.10, kind: .time),
                ColumnSpec(key: "machine",  displayName: "Machine",   xStart: 0.10, xEnd: 0.25, kind: .string, required: true),
                ColumnSpec(key: "process",  displayName: "Process",   xStart: 0.25, xEnd: 0.45, kind: .string, required: true),
                ColumnSpec(key: "count",    displayName: "Count",     xStart: 0.45, xEnd: 0.60, kind: .integer, required: true),
                ColumnSpec(key: "weight",   displayName: "Weight",    xStart: 0.60, xEnd: 0.75, kind: .decimal),
                ColumnSpec(key: "notes",    displayName: "Notes",     xStart: 0.75, xEnd: 1.00, kind: .notes),
            ],
            inheritFromHeader: ["saNumber", "icfCode", "shiftDate"]
        ),
        requiredKeys: ["machine", "process", "count"]
    )

    static let aerospacePackageCountV1 = ExtractionSchema(
        id: "aerospace-pkg-count-v1",
        documentType: .aerospacePackageCount,
        headerFields: [
            FieldSpec(key: "saNumber",  displayName: "SA",
                      region: CGRect(x: 0.60, y: 0.02, width: 0.38, height: 0.06), kind: .string, required: true),
            FieldSpec(key: "partNumber", displayName: "Part Number",
                      region: CGRect(x: 0.02, y: 0.08, width: 0.50, height: 0.06), kind: .string, required: true),
        ],
        rowBand: RowBand(
            region: CGRect(x: 0.02, y: 0.18, width: 0.96, height: 0.70),
            rowHeightNormalized: 0.045,
            columns: [
                ColumnSpec(key: "package",  displayName: "Package #", xStart: 0.00, xEnd: 0.15, kind: .string, required: true),
                ColumnSpec(key: "quantity", displayName: "Quantity",  xStart: 0.15, xEnd: 0.40, kind: .integer, required: true),
                ColumnSpec(key: "tare",     displayName: "Tare",      xStart: 0.40, xEnd: 0.60, kind: .decimal),
                ColumnSpec(key: "gross",    displayName: "Gross",     xStart: 0.60, xEnd: 0.80, kind: .decimal),
                ColumnSpec(key: "net",      displayName: "Net",       xStart: 0.80, xEnd: 1.00, kind: .decimal),
            ],
            inheritFromHeader: ["saNumber", "partNumber"]
        ),
        requiredKeys: ["package", "quantity"]
    )

    static let tareWorksheetV1 = ExtractionSchema(
        id: "tare-worksheet-v1",
        documentType: .tareWorksheet,
        headerFields: [
            FieldSpec(key: "operator", displayName: "Operator",
                      region: CGRect(x: 0.02, y: 0.02, width: 0.40, height: 0.05), kind: .string),
            FieldSpec(key: "date", displayName: "Date",
                      region: CGRect(x: 0.60, y: 0.02, width: 0.38, height: 0.05), kind: .date, required: true),
        ],
        rowBand: RowBand(
            region: CGRect(x: 0.02, y: 0.14, width: 0.96, height: 0.78),
            rowHeightNormalized: 0.05,
            columns: [
                ColumnSpec(key: "container", displayName: "Container", xStart: 0.00, xEnd: 0.35, kind: .string, required: true),
                ColumnSpec(key: "tare",      displayName: "Tare (lb)", xStart: 0.35, xEnd: 0.65, kind: .decimal, required: true),
                ColumnSpec(key: "verifiedBy", displayName: "Verified",  xStart: 0.65, xEnd: 1.00, kind: .signature),
            ]
        ),
        requiredKeys: ["container", "tare"]
    )
}
