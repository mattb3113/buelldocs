import Foundation

/// Confidence score in the range 0.0 ... 1.0.
/// Semantics:
///   high    >= 0.90 — trust without review
///   medium  >= 0.70 — review recommended
///   low      < 0.70 — review required
public struct Confidence: Hashable, Codable, Sendable, Comparable {
    public let value: Double

    public init(_ value: Double) {
        self.value = min(max(value, 0.0), 1.0)
    }

    public static let zero = Confidence(0)
    public static let certain = Confidence(1)

    public enum Band: String, Codable, Sendable {
        case high, medium, low
    }

    public var band: Band {
        switch value {
        case 0.90...: return .high
        case 0.70..<0.90: return .medium
        default: return .low
        }
    }

    public var needsReview: Bool { band != .high }

    public static func < (lhs: Confidence, rhs: Confidence) -> Bool {
        lhs.value < rhs.value
    }
}
