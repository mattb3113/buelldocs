import Foundation
import CoreGraphics
#if canImport(Vision)
import Vision
#endif
#if canImport(UIKit)
import UIKit
#endif

/// Some captures contain two forms photographed side-by-side on the same page.
/// This detector looks for a dominant vertical/horizontal separator and, if
/// found, splits the page into halves so each form can be classified on its own.
public struct MultiFormDetector: Sendable {
    public init() {}

    public func split(_ page: ScannedPage) async throws -> [ScannedPage] {
        #if canImport(UIKit)
        guard let image = UIImage(data: page.imageData),
              let cg = image.cgImage else { return [page] }

        guard let axis = try await detectSeparator(in: cg) else { return [page] }

        return slice(page, along: axis, source: cg)
        #else
        return [page]
        #endif
    }

    public enum Axis: Sendable { case vertical(xNorm: Double), horizontal(yNorm: Double) }

    #if canImport(Vision)
    private func detectSeparator(in cg: CGImage) async throws -> Axis? {
        // Use text-region density as a cheap proxy: if recognized text clusters
        // into two disjoint horizontal bands, assume a vertical separator down
        // the middle; same logic transposed for a horizontal separator.
        let request = VNRecognizeTextRequest()
        request.recognitionLevel = .fast
        request.usesLanguageCorrection = false

        let handler = VNImageRequestHandler(cgImage: cg, options: [:])
        try handler.perform([request])

        let boxes = (request.results ?? []).map(\.boundingBox)
        guard boxes.count >= 8 else { return nil }

        // Vision's boundingBox is normalized with origin at bottom-left.
        let xs = boxes.map { $0.midX }
        let ys = boxes.map { $0.midY }
        if let gap = largestGap(in: xs, minGap: 0.15) { return .vertical(xNorm: gap) }
        if let gap = largestGap(in: ys, minGap: 0.15) { return .horizontal(yNorm: gap) }
        return nil
    }
    #else
    private func detectSeparator(in cg: CGImage) async throws -> Axis? { nil }
    #endif

    private func largestGap(in values: [CGFloat], minGap: CGFloat) -> Double? {
        let sorted = values.sorted()
        var bestGap: (size: CGFloat, mid: CGFloat) = (0, 0)
        for pair in zip(sorted, sorted.dropFirst()) {
            let size = pair.1 - pair.0
            if size > bestGap.size { bestGap = (size, (pair.0 + pair.1) / 2) }
        }
        return bestGap.size >= minGap ? Double(bestGap.mid) : nil
    }

    #if canImport(UIKit)
    private func slice(_ page: ScannedPage, along axis: Axis, source: CGImage) -> [ScannedPage] {
        let w = CGFloat(source.width), h = CGFloat(source.height)
        let rects: [CGRect]
        switch axis {
        case .vertical(let xNorm):
            let x = w * CGFloat(xNorm)
            rects = [CGRect(x: 0, y: 0, width: x, height: h),
                     CGRect(x: x, y: 0, width: w - x, height: h)]
        case .horizontal(let yNorm):
            let y = h * CGFloat(1 - yNorm) // flip Vision's bottom-origin space
            rects = [CGRect(x: 0, y: 0, width: w, height: y),
                     CGRect(x: 0, y: y, width: w, height: h - y)]
        }

        return rects.enumerated().compactMap { idx, rect in
            guard let cropped = source.cropping(to: rect) else { return nil }
            let image = UIImage(cgImage: cropped)
            guard let data = image.jpegData(compressionQuality: 0.9) else { return nil }
            var report = page.preprocessing
            report.splitFromMultiForm = true
            return ScannedPage(
                index: page.index * 2 + idx,
                imageData: data,
                pixelSize: CGSize(width: cropped.width, height: cropped.height),
                preprocessing: report
            )
        }
    }
    #endif
}
