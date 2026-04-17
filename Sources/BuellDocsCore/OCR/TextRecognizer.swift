import Foundation
import CoreGraphics
#if canImport(Vision)
import Vision
#endif
#if canImport(UIKit)
import UIKit
#endif

/// Raw OCR output for a page: observed strings with normalized bounding boxes.
/// Extraction stages consume this rather than re-running Vision themselves.
public struct OCRResult: Sendable, Hashable {
    public struct Observation: Sendable, Hashable {
        public let text: String
        public let confidence: Confidence
        public let box: CGRect        // origin-top-left, normalized 0...1
        public init(text: String, confidence: Confidence, box: CGRect) {
            self.text = text; self.confidence = confidence; self.box = box
        }
    }
    public let observations: [Observation]
    public init(observations: [Observation]) { self.observations = observations }
}

public protocol TextRecognizing: Sendable {
    func recognize(page: ScannedPage) async throws -> OCRResult
}

public struct VisionTextRecognizer: TextRecognizing {
    public enum Quality: Sendable { case fast, accurate }

    public let quality: Quality
    public let languages: [String]
    public let customWords: [String]

    public init(
        quality: Quality = .accurate,
        languages: [String] = ["en-US"],
        customWords: [String] = []
    ) {
        self.quality = quality
        self.languages = languages
        self.customWords = customWords
    }

    public func recognize(page: ScannedPage) async throws -> OCRResult {
        #if canImport(Vision) && canImport(UIKit)
        guard let image = UIImage(data: page.imageData)?.cgImage else {
            return OCRResult(observations: [])
        }

        let request = VNRecognizeTextRequest()
        request.recognitionLevel = quality == .accurate ? .accurate : .fast
        request.usesLanguageCorrection = true
        request.recognitionLanguages = languages
        request.customWords = customWords

        let handler = VNImageRequestHandler(cgImage: image, options: [:])
        try handler.perform([request])

        let observations: [OCRResult.Observation] = (request.results ?? []).compactMap { obs in
            guard let top = obs.topCandidates(1).first else { return nil }
            // Convert Vision's bottom-origin bbox to top-origin normalized rect.
            let b = obs.boundingBox
            let box = CGRect(x: b.minX, y: 1 - b.maxY, width: b.width, height: b.height)
            return .init(
                text: top.string,
                confidence: Confidence(Double(top.confidence)),
                box: box
            )
        }
        return OCRResult(observations: observations)
        #else
        return OCRResult(observations: [])
        #endif
    }
}

extension OCRResult {
    /// Observations whose bounding boxes fall within (or significantly overlap)
    /// a normalized region on the page.
    public func observations(in region: CGRect, minOverlap: Double = 0.5) -> [Observation] {
        observations.filter { obs in
            let intersection = obs.box.intersection(region)
            guard !intersection.isNull, obs.box.width > 0, obs.box.height > 0 else { return false }
            let ratio = (intersection.width * intersection.height) / (obs.box.width * obs.box.height)
            return Double(ratio) >= minOverlap
        }
    }

    /// Joined text (in reading order) for all observations inside a region.
    public func text(in region: CGRect, minOverlap: Double = 0.5) -> String {
        observations(in: region, minOverlap: minOverlap)
            .sorted { ($0.box.minY, $0.box.minX) < ($1.box.minY, $1.box.minX) }
            .map(\.text)
            .joined(separator: " ")
    }
}
