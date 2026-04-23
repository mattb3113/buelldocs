import XCTest
import CoreGraphics
@testable import BuellDocsCore

final class ExtractionEngineTests: XCTestCase {
    func testTemplatePassExtractsRowsFromSyntheticOCR() async throws {
        let schema = SchemaRegistry.dailyDoffV1
        let ocr = OCRResult(observations: [
            .init(text: "SA-54321",  confidence: Confidence(0.98), box: CGRect(x: 0.62, y: 0.02, width: 0.35, height: 0.05)),
            .init(text: "2026-04-17", confidence: Confidence(0.98), box: CGRect(x: 0.02, y: 0.02, width: 0.30, height: 0.05)),
            // Row 0
            .init(text: "08:00",     confidence: Confidence(0.95), box: CGRect(x: 0.02, y: 0.16, width: 0.09, height: 0.04)),
            .init(text: "M-1",       confidence: Confidence(0.95), box: CGRect(x: 0.13, y: 0.16, width: 0.10, height: 0.04)),
            .init(text: "DOFF",      confidence: Confidence(0.94), box: CGRect(x: 0.27, y: 0.16, width: 0.15, height: 0.04)),
            .init(text: "12",        confidence: Confidence(0.95), box: CGRect(x: 0.47, y: 0.16, width: 0.10, height: 0.04)),
        ])

        let engine = LayoutAwareExtractionEngine()
        let page = ScannedPage(index: 0, imageData: Data(), pixelSize: CGSize(width: 1000, height: 1000))
        let classification = PageClassification(
            pageIndex: 0,
            documentType: .dailyDoffRecord,
            confidence: Confidence(0.9),
            schemaID: schema.id
        )
        let extraction = try await engine.extract(
            page: page,
            ocr: ocr,
            classification: classification,
            schema: schema,
            documentID: UUID()
        )

        XCTAssertEqual(extraction.headerFields["saNumber"]?.rawText, "SA-54321")
        let firstRow = try XCTUnwrap(extraction.records.first)
        XCTAssertEqual(firstRow.fields["machine"]?.rawText, "M-1")
        if case .integer(let n) = firstRow.fields["count"]?.value {
            XCTAssertEqual(n, 12)
        } else {
            XCTFail("count should parse to integer")
        }
        // inheritance
        if case .string(let sa) = firstRow.fields["saNumber"]?.value {
            XCTAssertEqual(sa, "SA-54321")
        }
    }
}
