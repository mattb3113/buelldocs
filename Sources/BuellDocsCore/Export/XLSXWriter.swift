import Foundation

/// Minimal OOXML (.xlsx) writer — no third-party dependency.
/// Supports the cell formats required by the upload template: string,
/// integer, 2-decimal number, date, time, and boolean.
/// This is a deliberate subset — fancy formatting lives in the template,
/// not in the writer.
public struct XLSXWriter: Sendable {
    public init() {}

    public func write(
        records: [Record],
        template: ExcelTemplate,
        to url: URL
    ) throws {
        let workbook = Workbook(template: template, records: records)
        try workbook.writeZip(to: url)
    }
}

// MARK: - Workbook composition

struct Workbook {
    let template: ExcelTemplate
    let records: [Record]

    func writeZip(to url: URL) throws {
        let files: [(path: String, data: Data)] = [
            ("[Content_Types].xml", Data(contentTypes().utf8)),
            ("_rels/.rels", Data(rootRels().utf8)),
            ("xl/workbook.xml", Data(workbookXML().utf8)),
            ("xl/_rels/workbook.xml.rels", Data(workbookRels().utf8)),
            ("xl/styles.xml", Data(stylesXML().utf8)),
            ("xl/worksheets/sheet1.xml", Data(sheetXML().utf8)),
            ("xl/sharedStrings.xml", Data(sharedStringsXML().utf8)),
        ]
        let zipData = try MinimalZip.archive(files: files)
        try zipData.write(to: url, options: .atomic)
    }

    // MARK: XML fragments

    private func contentTypes() -> String {
        """
        <?xml version="1.0" encoding="UTF-8" standalone="yes"?>
        <Types xmlns="http://schemas.openxmlformats.org/package/2006/content-types">
          <Default Extension="rels" ContentType="application/vnd.openxmlformats-package.relationships+xml"/>
          <Default Extension="xml" ContentType="application/xml"/>
          <Override PartName="/xl/workbook.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet.main+xml"/>
          <Override PartName="/xl/worksheets/sheet1.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.worksheet+xml"/>
          <Override PartName="/xl/styles.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.styles+xml"/>
          <Override PartName="/xl/sharedStrings.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.sharedStrings+xml"/>
        </Types>
        """
    }

    private func rootRels() -> String {
        """
        <?xml version="1.0" encoding="UTF-8" standalone="yes"?>
        <Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">
          <Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/officeDocument" Target="xl/workbook.xml"/>
        </Relationships>
        """
    }

    private func workbookXML() -> String {
        """
        <?xml version="1.0" encoding="UTF-8" standalone="yes"?>
        <workbook xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main" xmlns:r="http://schemas.openxmlformats.org/officeDocument/2006/relationships">
          <sheets><sheet name="\(escape(template.sheetName))" sheetId="1" r:id="rId1"/></sheets>
        </workbook>
        """
    }

    private func workbookRels() -> String {
        """
        <?xml version="1.0" encoding="UTF-8" standalone="yes"?>
        <Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">
          <Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/worksheet" Target="worksheets/sheet1.xml"/>
          <Relationship Id="rId2" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/styles" Target="styles.xml"/>
          <Relationship Id="rId3" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/sharedStrings" Target="sharedStrings.xml"/>
        </Relationships>
        """
    }

    /// Style indices:
    ///   0 default, 1 header (bold), 2 integer, 3 decimal2, 4 date, 5 time
    private func stylesXML() -> String {
        """
        <?xml version="1.0" encoding="UTF-8" standalone="yes"?>
        <styleSheet xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main">
          <numFmts count="2">
            <numFmt numFmtId="164" formatCode="0.00"/>
            <numFmt numFmtId="165" formatCode="yyyy-mm-dd"/>
          </numFmts>
          <fonts count="2">
            <font><sz val="11"/><name val="Calibri"/></font>
            <font><b/><sz val="11"/><name val="Calibri"/></font>
          </fonts>
          <fills count="1"><fill><patternFill patternType="none"/></fill></fills>
          <borders count="1"><border/></borders>
          <cellStyleXfs count="1"><xf/></cellStyleXfs>
          <cellXfs count="6">
            <xf fontId="0"/>
            <xf fontId="1" applyFont="1"/>
            <xf numFmtId="1" applyNumberFormat="1"/>
            <xf numFmtId="164" applyNumberFormat="1"/>
            <xf numFmtId="165" applyNumberFormat="1"/>
            <xf numFmtId="20" applyNumberFormat="1"/>
          </cellXfs>
        </styleSheet>
        """
    }

    private var sharedStrings: [String] {
        var result: [String] = []
        var seen: [String: Int] = [:]
        // Headers first so they always have deterministic string indices.
        for column in template.columns {
            if seen[column.header] == nil {
                seen[column.header] = result.count
                result.append(column.header)
            }
        }
        for record in records {
            for column in template.columns {
                guard let field = record.fields[column.recordKey] else { continue }
                if case .string(let s) = field.value, !s.isEmpty, seen[s] == nil {
                    seen[s] = result.count
                    result.append(s)
                }
            }
        }
        return result
    }

    private func sharedStringsXML() -> String {
        let strings = sharedStrings
        let body = strings
            .map { "<si><t xml:space=\"preserve\">\(escape($0))</t></si>" }
            .joined()
        return """
        <?xml version="1.0" encoding="UTF-8" standalone="yes"?>
        <sst xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main" count="\(strings.count)" uniqueCount="\(strings.count)">\(body)</sst>
        """
    }

    private func sheetXML() -> String {
        let strings = sharedStrings
        let indexOf = Dictionary(uniqueKeysWithValues: strings.enumerated().map { ($0.element, $0.offset) })

        var rows: [String] = []

        // Header row.
        var headerCells: [String] = []
        for (col, column) in template.columns.enumerated() {
            let ref = cellRef(row: 1, col: col)
            headerCells.append("<c r=\"\(ref)\" t=\"s\" s=\"1\"><v>\(indexOf[column.header] ?? 0)</v></c>")
        }
        rows.append("<row r=\"1\">\(headerCells.joined())</row>")

        // Data rows.
        for (i, record) in records.enumerated() {
            let rowNum = i + 2
            var cells: [String] = []
            for (col, column) in template.columns.enumerated() {
                let ref = cellRef(row: rowNum, col: col)
                guard let field = record.fields[column.recordKey] else { continue }
                if let cell = formatCell(reference: ref, value: field.value, column: column, stringIndex: indexOf) {
                    cells.append(cell)
                }
            }
            rows.append("<row r=\"\(rowNum)\">\(cells.joined())</row>")
        }

        let cols = template.columns.enumerated().compactMap { i, c in
            c.width.map { "<col min=\"\(i+1)\" max=\"\(i+1)\" width=\"\($0)\" customWidth=\"1\"/>" }
        }.joined()

        let frozen = template.freezeHeader
            ? #"<sheetViews><sheetView workbookViewId="0"><pane ySplit="1" topLeftCell="A2" activePane="bottomLeft" state="frozen"/></sheetView></sheetViews>"#
            : ""

        return """
        <?xml version="1.0" encoding="UTF-8" standalone="yes"?>
        <worksheet xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main">
          \(frozen)
          <cols>\(cols)</cols>
          <sheetData>\(rows.joined())</sheetData>
        </worksheet>
        """
    }

    private func formatCell(
        reference: String,
        value: AnyField.Value,
        column: ExcelTemplate.Column,
        stringIndex: [String: Int]
    ) -> String? {
        switch (column.format, value) {
        case (.string, .string(let s)):
            guard let idx = stringIndex[s] else { return nil }
            return "<c r=\"\(reference)\" t=\"s\"><v>\(idx)</v></c>"
        case (.integer, .integer(let i)):
            return "<c r=\"\(reference)\" s=\"2\"><v>\(i)</v></c>"
        case (.decimal2, .decimal(let d)):
            return "<c r=\"\(reference)\" s=\"3\"><v>\(d)</v></c>"
        case (.decimal2, .integer(let i)):
            return "<c r=\"\(reference)\" s=\"3\"><v>\(i)</v></c>"
        case (.date, .date(let d)):
            return "<c r=\"\(reference)\" s=\"4\"><v>\(excelSerial(for: d))</v></c>"
        case (.time, .date(let d)):
            return "<c r=\"\(reference)\" s=\"5\"><v>\(excelTimeFraction(for: d))</v></c>"
        case (.boolean, .bool(let b)):
            return "<c r=\"\(reference)\" t=\"b\"><v>\(b ? 1 : 0)</v></c>"
        case (_, .missing):
            return nil
        default:
            // Fallback: stringify unexpected type combinations.
            let text = stringify(value)
            guard !text.isEmpty else { return nil }
            return "<c r=\"\(reference)\" t=\"inlineStr\"><is><t xml:space=\"preserve\">\(escape(text))</t></is></c>"
        }
    }

    private func stringify(_ value: AnyField.Value) -> String {
        switch value {
        case .string(let s): return s
        case .integer(let i): return String(i)
        case .decimal(let d): return String(d)
        case .bool(let b): return b ? "TRUE" : "FALSE"
        case .date(let d): return ISO8601DateFormatter().string(from: d)
        case .missing: return ""
        }
    }

    private func escape(_ s: String) -> String {
        s.replacingOccurrences(of: "&", with: "&amp;")
         .replacingOccurrences(of: "<", with: "&lt;")
         .replacingOccurrences(of: ">", with: "&gt;")
         .replacingOccurrences(of: "\"", with: "&quot;")
    }

    private func cellRef(row: Int, col: Int) -> String {
        var c = col, letters = ""
        repeat {
            letters = String(UnicodeScalar(UInt8(65 + c % 26))) + letters
            c = c / 26 - 1
        } while c >= 0
        return "\(letters)\(row)"
    }

    /// Excel dates are days since 1900-01-01 with the 1900 leap-year bug.
    private func excelSerial(for date: Date) -> Double {
        let epoch = DateComponents(calendar: .init(identifier: .gregorian),
                                   timeZone: TimeZone(secondsFromGMT: 0),
                                   year: 1899, month: 12, day: 30).date!
        return date.timeIntervalSince(epoch) / 86400.0
    }

    private func excelTimeFraction(for date: Date) -> Double {
        let cal = Calendar(identifier: .gregorian)
        let comps = cal.dateComponents([.hour, .minute, .second], from: date)
        let h = Double(comps.hour ?? 0)
        let m = Double(comps.minute ?? 0)
        let s = Double(comps.second ?? 0)
        return (h * 3600 + m * 60 + s) / 86400.0
    }
}
