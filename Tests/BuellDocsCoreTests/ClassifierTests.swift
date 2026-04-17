import XCTest
import CoreGraphics
@testable import BuellDocsCore

final class ClassifierTests: XCTestCase {
    func testClassifiesDailyDoffByTitleAndFormCode() async throws {
        let ocr = OCRResult(observations: [
            .init(text: "Daily Doff Record", confidence: Confidence(0.96), box: CGRect(x: 0.25, y: 0.03, width: 0.5, height: 0.05)),
            .init(text: "F-851-23A",         confidence: Confidence(0.97), box: CGRect(x: 0.78, y: 0.03, width: 0.2, height: 0.03)),
            .init(text: "SA-12345",          confidence: Confidence(0.95), box: CGRect(x: 0.62, y: 0.08, width: 0.3, height: 0.04)),
        ])
        let page = ScannedPage(index: 0, imageData: Data(), pixelSize: .init(width: 1000, height: 1000))
        let classification = try await HeuristicClassifier().classify(page: page, ocr: ocr)
        XCTAssertEqual(classification.documentType, .dailyDoffRecord)
        XCTAssertEqual(classification.schemaID, "daily-doff-v1")
        XCTAssertEqual(classification.workOrderHint, "12345")
        XCTAssertGreaterThan(classification.confidence.value, 0.7)
    }

    func testUnknownWhenNoKnownSignal() async throws {
        let ocr = OCRResult(observations: [
            .init(text: "Random text here", confidence: Confidence(0.9), box: CGRect(x: 0.1, y: 0.1, width: 0.4, height: 0.05))
        ])
        let page = ScannedPage(index: 0, imageData: Data(), pixelSize: .init(width: 800, height: 800))
        let result = try await HeuristicClassifier().classify(page: page, ocr: ocr)
        XCTAssertEqual(result.documentType, .unknown)
    }
}
