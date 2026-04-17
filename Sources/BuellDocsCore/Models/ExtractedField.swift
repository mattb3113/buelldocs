import Foundation
import CoreGraphics

/// A typed value pulled from a specific region of a scanned page.
/// Keeps provenance (source region, extractor, confidence) alongside the value
/// so the review UI can show the original pixels and the user can audit it.
public struct ExtractedField<Value: Codable & Sendable & Hashable>: Codable, Sendable, Hashable {
    public var value: Value?
    public var rawText: String?
    public var confidence: Confidence
    public var source: Source

    public struct Source: Codable, Sendable, Hashable {
        public var pageIndex: Int
        public var boundingBox: CGRect      // normalized 0...1 in page coordinates
        public var extractor: Extractor

        public init(pageIndex: Int, boundingBox: CGRect, extractor: Extractor) {
            self.pageIndex = pageIndex
            self.boundingBox = boundingBox
            self.extractor = extractor
        }
    }

    public enum Extractor: String, Codable, Sendable {
        case template          // rule-based anchor extraction
        case vision            // on-device OCR (VisionKit)
        case visionLanguage    // AI-assisted (VLM)
        case manual            // user-entered or corrected
    }

    public init(
        value: Value? = nil,
        rawText: String? = nil,
        confidence: Confidence = .zero,
        source: Source
    ) {
        self.value = value
        self.rawText = rawText
        self.confidence = confidence
        self.source = source
    }
}
