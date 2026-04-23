import Foundation
import CoreGraphics

public protocol DocumentClassifying: Sendable {
    func classify(page: ScannedPage, ocr: OCRResult) async throws -> PageClassification
}

/// Hybrid classifier: first matches against a list of form-code regexes
/// (fast path for recurring forms), then falls back to title/header token
/// matching with a confidence penalty.
public struct HeuristicClassifier: DocumentClassifying {
    public struct Signature: Sendable {
        public let type: DocumentType
        public let schemaID: String
        public let formCodePatterns: [String]      // e.g. "F-?851-?23A"
        public let titleKeywords: [String]         // e.g. ["daily doff", "doff record"]

        public init(type: DocumentType, schemaID: String, formCodePatterns: [String], titleKeywords: [String]) {
            self.type = type
            self.schemaID = schemaID
            self.formCodePatterns = formCodePatterns
            self.titleKeywords = titleKeywords
        }
    }

    public static let defaults: [Signature] = [
        .init(type: .dailyDoffRecord, schemaID: "daily-doff-v1",
              formCodePatterns: ["F-?851-?23A"],
              titleKeywords: ["daily doff", "doff record"]),
        .init(type: .aerospacePackageCount, schemaID: "aerospace-pkg-count-v1",
              formCodePatterns: ["F-?851-?3\\b"],
              titleKeywords: ["aerospace", "package count", "production package"]),
        .init(type: .tareWorksheet, schemaID: "tare-worksheet-v1",
              formCodePatterns: ["F-?851-?43"],
              titleKeywords: ["tare", "worksheet"]),
        .init(type: .finalRelease, schemaID: "final-release-v1",
              formCodePatterns: ["F-?851-?FR"],
              titleKeywords: ["final release"]),
        .init(type: .shiftChecklist, schemaID: "shift-checklist-v1",
              formCodePatterns: ["F-?851-?SC"],
              titleKeywords: ["shift checklist"]),
        .init(type: .clearanceReportSupport, schemaID: "clearance-report-v1",
              formCodePatterns: ["F-?851-?CR"],
              titleKeywords: ["clearance report", "clearance support"]),
    ]

    public let signatures: [Signature]
    public let workOrderRegex: NSRegularExpression

    public init(signatures: [Signature] = HeuristicClassifier.defaults) {
        self.signatures = signatures
        // SA / work-order numbers in this shop look like "SA-12345", "WO 98765", or 5–8 digit bare numbers.
        self.workOrderRegex = try! NSRegularExpression(
            pattern: #"(?i)(?:SA|WO|W/O)[-\s]?(\d{4,8})|\b(\d{5,8})\b"#
        )
    }

    public func classify(page: ScannedPage, ocr: OCRResult) async throws -> PageClassification {
        // Prefer tokens in the top 25% of the page when matching — that's where
        // titles and form codes live on the forms this shop uses.
        let headerRegion = CGRect(x: 0, y: 0, width: 1.0, height: 0.25)
        let headerText = ocr.text(in: headerRegion).lowercased()
        let fullText = ocr.observations.map(\.text).joined(separator: " ")

        var best: (signature: Signature, score: Double, code: String?) = (
            Signature(type: .unknown, schemaID: "", formCodePatterns: [], titleKeywords: []),
            0, nil
        )

        for signature in signatures {
            var score = 0.0
            var matchedCode: String?

            for pattern in signature.formCodePatterns {
                if let regex = try? NSRegularExpression(pattern: pattern) {
                    let range = NSRange(fullText.startIndex..., in: fullText)
                    if let m = regex.firstMatch(in: fullText, range: range),
                       let swiftRange = Range(m.range, in: fullText) {
                        score += 0.65
                        matchedCode = String(fullText[swiftRange])
                        break
                    }
                }
            }
            for keyword in signature.titleKeywords where headerText.contains(keyword) {
                score += 0.25
            }
            if score > best.score {
                best = (signature, score, matchedCode)
            }
        }

        let workOrder = extractWorkOrder(from: ocr)
        let finalScore = min(best.score, 1.0)
        let type = finalScore > 0 ? best.signature.type : .unknown
        let schemaID = finalScore > 0 ? best.signature.schemaID : ""

        return PageClassification(
            pageIndex: page.index,
            documentType: type,
            formCode: best.code,
            workOrderHint: workOrder,
            confidence: Confidence(finalScore),
            schemaID: schemaID
        )
    }

    private func extractWorkOrder(from ocr: OCRResult) -> String? {
        let text = ocr.observations.map(\.text).joined(separator: "\n")
        let range = NSRange(text.startIndex..., in: text)
        guard let match = workOrderRegex.firstMatch(in: text, range: range) else { return nil }
        for i in 1..<match.numberOfRanges {
            if let r = Range(match.range(at: i), in: text) { return String(text[r]) }
        }
        return nil
    }
}
