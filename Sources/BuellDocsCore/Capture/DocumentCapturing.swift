import Foundation

/// Abstracts over VisionKit / PhotoKit / PDFKit capture sources so the pipeline
/// can run the same way for camera scans, PDF imports, or email attachments.
public protocol DocumentCapturing: Sendable {
    func capture() async throws -> ScannedDocument
}

public enum CaptureError: Error, Sendable {
    case userCancelled
    case unsupportedSource
    case unreadable(reason: String)
    case underlying(Error)
}
