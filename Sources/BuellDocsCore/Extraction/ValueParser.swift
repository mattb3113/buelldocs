import Foundation

/// Parses raw OCR strings into typed field values. Centralized here so
/// template and AI extractors agree on normalization, and business rules
/// can assume canonical types downstream.
public struct ValueParser: Sendable {
    public init() {}

    public func parse(_ raw: String, kind: FieldKind) -> (AnyField.Value, Confidence) {
        let cleaned = raw.trimmingCharacters(in: .whitespacesAndNewlines)
        if cleaned.isEmpty { return (.missing, .zero) }

        switch kind {
        case .string, .notes, .signature:
            return (.string(cleaned), .certain)

        case .integer:
            if let int = Int(cleaned.filter { $0.isNumber || $0 == "-" }) {
                return (.integer(int), .certain)
            }
            return (.string(cleaned), Confidence(0.3))

        case .decimal:
            let normalized = cleaned
                .replacingOccurrences(of: ",", with: ".")
                .filter { $0.isNumber || $0 == "." || $0 == "-" }
            if let d = Double(normalized) {
                return (.decimal(d), .certain)
            }
            return (.string(cleaned), Confidence(0.3))

        case .date:
            if let date = Self.dateFormatters.compactMap({ $0.date(from: cleaned) }).first {
                return (.date(date), .certain)
            }
            return (.string(cleaned), Confidence(0.4))

        case .time:
            if let date = Self.timeFormatters.compactMap({ $0.date(from: cleaned) }).first {
                return (.date(date), .certain)
            }
            return (.string(cleaned), Confidence(0.4))

        case .checkbox:
            let truthy: Set<String> = ["x", "✓", "✔", "y", "yes", "true", "1"]
            return (.bool(truthy.contains(cleaned.lowercased())), .certain)
        }
    }

    private static let dateFormatters: [DateFormatter] = {
        ["M/d/yy", "M/d/yyyy", "MM/dd/yyyy", "yyyy-MM-dd", "MMM d, yyyy", "d MMM yyyy"]
            .map { fmt in
                let f = DateFormatter()
                f.locale = Locale(identifier: "en_US_POSIX")
                f.dateFormat = fmt
                return f
            }
    }()

    private static let timeFormatters: [DateFormatter] = {
        ["H:mm", "HH:mm", "h:mm a", "hmm", "HHmm"].map { fmt in
            let f = DateFormatter()
            f.locale = Locale(identifier: "en_US_POSIX")
            f.dateFormat = fmt
            return f
        }
    }()
}
