import Foundation

/// Declares the exact column order, headers, and cell formatting the
/// downstream upload template expects. Keeping this as data means the
/// template can be swapped without a code change.
public struct ExcelTemplate: Codable, Sendable, Hashable {
    public struct Column: Codable, Sendable, Hashable {
        public var header: String
        public var recordKey: String           // source key in Record.fields
        public var format: CellFormat
        public var width: Double?              // column width in characters
        public init(header: String, recordKey: String, format: CellFormat = .string, width: Double? = nil) {
            self.header = header
            self.recordKey = recordKey
            self.format = format
            self.width = width
        }
    }

    public enum CellFormat: String, Codable, Sendable {
        case string, integer, decimal2, date, time, boolean
    }

    public var id: String
    public var documentType: DocumentType
    public var sheetName: String
    public var columns: [Column]
    public var freezeHeader: Bool

    public init(id: String, documentType: DocumentType, sheetName: String, columns: [Column], freezeHeader: Bool = true) {
        self.id = id
        self.documentType = documentType
        self.sheetName = sheetName
        self.columns = columns
        self.freezeHeader = freezeHeader
    }

    /// Default upload templates matching the shop's current Excel files.
    public static let builtIns: [ExcelTemplate] = [
        ExcelTemplate(
            id: "daily-doff-upload",
            documentType: .dailyDoffRecord,
            sheetName: "Doff",
            columns: [
                .init(header: "Date",    recordKey: "shiftDate", format: .date,     width: 12),
                .init(header: "SA",      recordKey: "saNumber",  format: .string,   width: 14),
                .init(header: "ICF",     recordKey: "icfCode",   format: .string,   width: 10),
                .init(header: "Time",    recordKey: "time",      format: .time,     width: 8),
                .init(header: "Machine", recordKey: "machine",   format: .string,   width: 10),
                .init(header: "Process", recordKey: "process",   format: .string,   width: 12),
                .init(header: "Count",   recordKey: "count",     format: .integer,  width: 8),
                .init(header: "Weight",  recordKey: "weight",    format: .decimal2, width: 10),
                .init(header: "Notes",   recordKey: "notes",     format: .string,   width: 40),
            ]
        ),
        ExcelTemplate(
            id: "aerospace-pkg-count-upload",
            documentType: .aerospacePackageCount,
            sheetName: "Packages",
            columns: [
                .init(header: "SA",       recordKey: "saNumber",   format: .string,   width: 14),
                .init(header: "Part",     recordKey: "partNumber", format: .string,   width: 16),
                .init(header: "Package",  recordKey: "package",    format: .string,   width: 12),
                .init(header: "Quantity", recordKey: "quantity",   format: .integer,  width: 10),
                .init(header: "Tare",     recordKey: "tare",       format: .decimal2, width: 10),
                .init(header: "Gross",    recordKey: "gross",      format: .decimal2, width: 10),
                .init(header: "Net",      recordKey: "net",        format: .decimal2, width: 10),
            ]
        ),
        ExcelTemplate(
            id: "tare-worksheet-upload",
            documentType: .tareWorksheet,
            sheetName: "Tare",
            columns: [
                .init(header: "Date",       recordKey: "date",       format: .date,     width: 12),
                .init(header: "Operator",   recordKey: "operator",   format: .string,   width: 16),
                .init(header: "Container",  recordKey: "container",  format: .string,   width: 18),
                .init(header: "Tare (lb)",  recordKey: "tare",       format: .decimal2, width: 10),
                .init(header: "Verified",   recordKey: "verifiedBy", format: .string,   width: 14),
            ]
        ),
    ]
}
