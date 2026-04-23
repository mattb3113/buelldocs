import XCTest
import CoreGraphics
@testable import BuellDocsCore

final class XLSXWriterTests: XCTestCase {
    func testXLSXIsValidZipAndContainsSheet() throws {
        let records = [
            Record(documentID: UUID(), pageIndex: 0, rowIndex: 0, fields: [
                "shiftDate": AnyField(value: .date(Date(timeIntervalSince1970: 1_700_000_000)), confidence: .certain, pageIndex: 0, boundingBox: .zero, extractor: .template),
                "saNumber": AnyField(value: .string("SA-1"), confidence: .certain, pageIndex: 0, boundingBox: .zero, extractor: .template),
                "machine":  AnyField(value: .string("M-2"), confidence: .certain, pageIndex: 0, boundingBox: .zero, extractor: .template),
                "process":  AnyField(value: .string("DOFF"), confidence: .certain, pageIndex: 0, boundingBox: .zero, extractor: .template),
                "count":    AnyField(value: .integer(5), confidence: .certain, pageIndex: 0, boundingBox: .zero, extractor: .template),
            ])
        ]
        let template = ExcelTemplate.builtIns.first { $0.id == "daily-doff-upload" }!
        let url = FileManager.default.temporaryDirectory.appendingPathComponent("test-\(UUID()).xlsx")
        defer { try? FileManager.default.removeItem(at: url) }

        try XLSXWriter().write(records: records, template: template, to: url)

        let data = try Data(contentsOf: url)
        XCTAssertGreaterThan(data.count, 200)
        // .xlsx is a zip — first bytes must be PK\03\04
        XCTAssertEqual(Array(data.prefix(4)), [0x50, 0x4B, 0x03, 0x04])
        // sheet1.xml must be referenced somewhere in the archive
        let asString = String(data: data, encoding: .isoLatin1) ?? ""
        XCTAssertTrue(asString.contains("sheet1.xml"))
        XCTAssertTrue(asString.contains("SA-1"))
    }
}
