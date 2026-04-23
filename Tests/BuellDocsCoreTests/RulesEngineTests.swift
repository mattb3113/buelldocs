import XCTest
import CoreGraphics
import Foundation
@testable import BuellDocsCore

final class RulesEngineTests: XCTestCase {
    func testRequiredFieldsAndMachineNormalization() {
        var records = [
            Record(
                documentID: UUID(),
                pageIndex: 0,
                rowIndex: 0,
                fields: [
                    "machine": AnyField(value: .string(" machine 2 "), confidence: Confidence(0.9), pageIndex: 0, boundingBox: .zero, extractor: .template),
                    "process": AnyField(value: .string("DOFF"), confidence: Confidence(0.9), pageIndex: 0, boundingBox: .zero, extractor: .template),
                    "count":   AnyField(value: .integer(6), confidence: Confidence(0.9), pageIndex: 0, boundingBox: .zero, extractor: .template),
                ]
            ),
            Record(
                documentID: UUID(),
                pageIndex: 0,
                rowIndex: 1,
                fields: [
                    "machine": AnyField(value: .string("M-3"), confidence: Confidence(0.9), pageIndex: 0, boundingBox: .zero, extractor: .template),
                    // missing required `process`
                    "count": AnyField(value: .integer(4), confidence: Confidence(0.9), pageIndex: 0, boundingBox: .zero, extractor: .template),
                ]
            ),
        ]
        let exceptions = RulesEngine.standard.apply(
            records: &records,
            schema: SchemaRegistry.dailyDoffV1
        )

        // whitespace + case normalization upstream of validation
        if case .string(let canonical) = records[0].fields["machine"]?.value {
            XCTAssertEqual(canonical, "M-2")
        } else {
            XCTFail("machine should be normalized")
        }

        XCTAssertTrue(exceptions.contains { $0.kind == .missingRequiredField && $0.fieldKey == "process" })
    }

    func testNetWeightCrossCheck() {
        let docID = UUID()
        var records = [
            Record(documentID: docID, pageIndex: 0, rowIndex: 0, fields: [
                "package":  AnyField(value: .string("P-1"), confidence: .certain, pageIndex: 0, boundingBox: .zero, extractor: .template),
                "quantity": AnyField(value: .integer(1),   confidence: .certain, pageIndex: 0, boundingBox: .zero, extractor: .template),
                "tare":  AnyField(value: .decimal(2.0), confidence: .certain, pageIndex: 0, boundingBox: .zero, extractor: .template),
                "gross": AnyField(value: .decimal(10.0), confidence: .certain, pageIndex: 0, boundingBox: .zero, extractor: .template),
                "net":   AnyField(value: .decimal(7.0),  confidence: .certain, pageIndex: 0, boundingBox: .zero, extractor: .template),
            ])
        ]
        let ex = RulesEngine.standard.apply(records: &records, schema: SchemaRegistry.aerospacePackageCountV1)
        XCTAssertTrue(ex.contains { $0.kind == .crossFieldMismatch })
    }
}
