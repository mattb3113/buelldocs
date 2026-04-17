import Foundation
import SwiftUI
#if canImport(VisionKit)
import VisionKit
#endif
#if canImport(UIKit)
import UIKit
#endif
import BuellDocsCore

/// Wraps `VNDocumentCameraViewController` in a SwiftUI sheet and emits a
/// `ScannedDocument` through the Core domain type.
#if canImport(VisionKit) && canImport(UIKit)
public struct VisionKitScanner: UIViewControllerRepresentable {
    public var onFinish: (Result<ScannedDocument, CaptureError>) -> Void

    public init(onFinish: @escaping (Result<ScannedDocument, CaptureError>) -> Void) {
        self.onFinish = onFinish
    }

    public func makeCoordinator() -> Coordinator { Coordinator(onFinish: onFinish) }

    public func makeUIViewController(context: Context) -> VNDocumentCameraViewController {
        let vc = VNDocumentCameraViewController()
        vc.delegate = context.coordinator
        return vc
    }

    public func updateUIViewController(_ uiViewController: VNDocumentCameraViewController, context: Context) {}

    public final class Coordinator: NSObject, VNDocumentCameraViewControllerDelegate {
        let onFinish: (Result<ScannedDocument, CaptureError>) -> Void
        init(onFinish: @escaping (Result<ScannedDocument, CaptureError>) -> Void) {
            self.onFinish = onFinish
        }

        public func documentCameraViewController(
            _ controller: VNDocumentCameraViewController,
            didFinishWith scan: VNDocumentCameraScan
        ) {
            var pages: [ScannedPage] = []
            pages.reserveCapacity(scan.pageCount)
            for index in 0..<scan.pageCount {
                let image = scan.imageOfPage(at: index)
                guard let data = image.jpegData(compressionQuality: 0.92) else { continue }
                pages.append(
                    ScannedPage(
                        index: index,
                        imageData: data,
                        pixelSize: image.size
                    )
                )
            }
            onFinish(.success(ScannedDocument(pages: pages, source: .camera)))
        }

        public func documentCameraViewControllerDidCancel(_ controller: VNDocumentCameraViewController) {
            onFinish(.failure(.userCancelled))
        }

        public func documentCameraViewController(_ controller: VNDocumentCameraViewController, didFailWithError error: Error) {
            onFinish(.failure(.underlying(error)))
        }
    }
}
#endif
