import Foundation
import CoreGraphics

/// A captured document before extraction. One document may have N pages.
public struct ScannedDocument: Identifiable, Sendable {
    public let id: UUID
    public var capturedAt: Date
    public var pages: [ScannedPage]
    public var source: Source

    public enum Source: String, Codable, Sendable {
        case camera, photoLibrary, pdfImport, email, sharedDrive
    }

    public init(
        id: UUID = UUID(),
        capturedAt: Date = Date(),
        pages: [ScannedPage] = [],
        source: Source
    ) {
        self.id = id
        self.capturedAt = capturedAt
        self.pages = pages
        self.source = source
    }
}

/// A single page image plus any preprocessing metadata.
/// `imageData` is PNG/JPEG bytes to stay `Sendable` across the pipeline.
public struct ScannedPage: Identifiable, Sendable {
    public let id: UUID
    public var index: Int
    public var imageData: Data
    public var pixelSize: CGSize
    public var preprocessing: PreprocessingReport

    public init(
        id: UUID = UUID(),
        index: Int,
        imageData: Data,
        pixelSize: CGSize,
        preprocessing: PreprocessingReport = .init()
    ) {
        self.id = id
        self.index = index
        self.imageData = imageData
        self.pixelSize = pixelSize
        self.preprocessing = preprocessing
    }
}

public struct PreprocessingReport: Sendable, Codable {
    public var deskewAngleRadians: Double = 0
    public var cropped: Bool = false
    public var perspectiveCorrected: Bool = false
    public var contrastBoosted: Bool = false
    public var shadowsFlattened: Bool = false
    public var splitFromMultiForm: Bool = false

    public init() {}
}

/// Fully-processed document with classification + extracted records.
public struct ProcessedDocument: Identifiable, Sendable {
    public let id: UUID
    public var scanned: ScannedDocument
    public var pages: [PageClassification]
    public var records: [Record]
    public var exceptions: [Exception]

    public init(
        id: UUID = UUID(),
        scanned: ScannedDocument,
        pages: [PageClassification] = [],
        records: [Record] = [],
        exceptions: [Exception] = []
    ) {
        self.id = id
        self.scanned = scanned
        self.pages = pages
        self.records = records
        self.exceptions = exceptions
    }
}
