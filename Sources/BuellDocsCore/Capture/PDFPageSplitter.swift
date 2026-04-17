import Foundation
import CoreGraphics
#if canImport(PDFKit)
import PDFKit
#endif
#if canImport(UIKit)
import UIKit
#endif

/// Explodes a PDF into one ScannedPage per page so downstream stages can
/// treat camera captures and PDF imports identically.
public struct PDFPageSplitter: Sendable {
    public init() {}

    public func split(pdfData: Data, renderDPI: CGFloat = 300) throws -> [ScannedPage] {
        #if canImport(PDFKit) && canImport(UIKit)
        guard let document = PDFDocument(data: pdfData) else {
            throw CaptureError.unreadable(reason: "Invalid PDF")
        }
        var pages: [ScannedPage] = []
        pages.reserveCapacity(document.pageCount)

        let scale = renderDPI / 72.0
        for index in 0..<document.pageCount {
            guard let page = document.page(at: index) else { continue }
            let bounds = page.bounds(for: .mediaBox)
            let size = CGSize(width: bounds.width * scale, height: bounds.height * scale)

            let renderer = UIGraphicsImageRenderer(size: size)
            let image = renderer.image { ctx in
                UIColor.white.setFill()
                ctx.fill(CGRect(origin: .zero, size: size))
                ctx.cgContext.translateBy(x: 0, y: size.height)
                ctx.cgContext.scaleBy(x: scale, y: -scale)
                page.draw(with: .mediaBox, to: ctx.cgContext)
            }
            guard let data = image.jpegData(compressionQuality: 0.92) else { continue }
            pages.append(
                ScannedPage(
                    index: index,
                    imageData: data,
                    pixelSize: size
                )
            )
        }
        return pages
        #else
        throw CaptureError.unsupportedSource
        #endif
    }
}
