import Foundation
import CoreGraphics
#if canImport(CoreImage)
import CoreImage
import CoreImage.CIFilterBuiltins
#endif
#if canImport(UIKit)
import UIKit
#endif

/// Pipeline that cleans a captured image before classification and extraction.
/// Each stage is optional; stages only run when the input looks like it needs them.
public protocol ImagePreprocessing: Sendable {
    func process(_ page: ScannedPage) async throws -> ScannedPage
}

public struct CoreImagePreprocessor: ImagePreprocessing {
    public init() {}

    public func process(_ page: ScannedPage) async throws -> ScannedPage {
        #if canImport(CoreImage) && canImport(UIKit)
        guard let source = UIImage(data: page.imageData),
              let input = CIImage(image: source) else {
            return page
        }
        let context = CIContext(options: nil)

        var current = input
        var report = page.preprocessing

        // 1. Perspective correction via detected rectangle.
        if let corrected = perspectiveCorrected(current, context: context) {
            current = corrected
            report.perspectiveCorrected = true
            report.cropped = true
        }

        // 2. Shadow flattening and contrast boost tuned for printed forms.
        if let enhanced = enhancedForForm(current) {
            current = enhanced
            report.shadowsFlattened = true
            report.contrastBoosted = true
        }

        guard let cgImage = context.createCGImage(current, from: current.extent) else {
            return page
        }
        let ui = UIImage(cgImage: cgImage)
        guard let data = ui.jpegData(compressionQuality: 0.9) else { return page }

        return ScannedPage(
            id: page.id,
            index: page.index,
            imageData: data,
            pixelSize: CGSize(width: cgImage.width, height: cgImage.height),
            preprocessing: report
        )
        #else
        return page
        #endif
    }

    #if canImport(CoreImage)
    private func perspectiveCorrected(_ image: CIImage, context: CIContext) -> CIImage? {
        let detector = CIDetector(
            ofType: CIDetectorTypeRectangle,
            context: context,
            options: [CIDetectorAccuracy: CIDetectorAccuracyHigh]
        )
        guard let rect = detector?.features(in: image).compactMap({ $0 as? CIRectangleFeature }).first else {
            return nil
        }
        let filter = CIFilter.perspectiveCorrection()
        filter.inputImage = image
        filter.topLeft = rect.topLeft
        filter.topRight = rect.topRight
        filter.bottomLeft = rect.bottomLeft
        filter.bottomRight = rect.bottomRight
        return filter.outputImage
    }

    private func enhancedForForm(_ image: CIImage) -> CIImage? {
        // Flatten shadows with an exposure lift, then boost contrast to make
        // printed lines and handwriting separate cleanly before OCR.
        let exposure = CIFilter.exposureAdjust()
        exposure.inputImage = image
        exposure.ev = 0.4
        guard let lifted = exposure.outputImage else { return nil }

        let controls = CIFilter.colorControls()
        controls.inputImage = lifted
        controls.contrast = 1.15
        controls.saturation = 0.0     // grayscale: form printing + ink
        controls.brightness = 0.02
        return controls.outputImage
    }
    #endif
}
