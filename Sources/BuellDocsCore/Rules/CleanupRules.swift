import Foundation

/// Strips leading/trailing whitespace from every string field.
/// Doesn't emit exceptions — it's a pure normalization pass.
public struct TrimWhitespaceRule: BusinessRule {
    public let id = "trim-whitespace"
    public init() {}

    public func apply(records: inout [Record], schema: ExtractionSchema) -> [Exception] {
        for i in records.indices {
            for (key, field) in records[i].fields {
                if case .string(let s) = field.value {
                    let trimmed = s.trimmingCharacters(in: .whitespacesAndNewlines)
                    if trimmed != s {
                        var updated = field
                        updated.value = .string(trimmed)
                        records[i].fields[key] = updated
                    }
                }
            }
        }
        return []
    }
}

/// Canonicalizes machine identifiers. Operators write "M-1", "m1", "MACHINE 1"
/// interchangeably — the export needs a single form.
public struct NormalizeMachineCodeRule: BusinessRule {
    public let id = "normalize-machine"
    public let fieldKey: String
    public init(fieldKey: String = "machine") { self.fieldKey = fieldKey }

    public func apply(records: inout [Record], schema: ExtractionSchema) -> [Exception] {
        let regex = try! NSRegularExpression(pattern: #"(?i)^(?:m[-\s]?|machine\s*)?(\d{1,3})[a-z]?$"#)
        for i in records.indices {
            guard case .string(let raw)? = records[i].fields[fieldKey]?.value else { continue }
            let range = NSRange(raw.startIndex..., in: raw)
            guard let match = regex.firstMatch(in: raw, range: range),
                  let digits = Range(match.range(at: 1), in: raw) else { continue }
            let canonical = "M-\(String(raw[digits]))"
            if var field = records[i].fields[fieldKey] {
                field.value = .string(canonical)
                records[i].fields[fieldKey] = field
            }
        }
        return []
    }
}

/// Maps free-text process labels onto a controlled vocabulary.
/// Typos and variants get snapped to the nearest known code.
public struct NormalizeProcessCodeRule: BusinessRule {
    public let id = "normalize-process"
    public let vocabulary: [String]
    public let fieldKey: String

    public init(fieldKey: String = "process", vocabulary: [String] = NormalizeProcessCodeRule.defaultVocabulary) {
        self.fieldKey = fieldKey
        self.vocabulary = vocabulary
    }

    public static let defaultVocabulary: [String] = [
        "DOFF", "REWIND", "SPLIT", "INSPECT", "PACK", "TARE", "RELEASE", "REJECT", "HOLD"
    ]

    public func apply(records: inout [Record], schema: ExtractionSchema) -> [Exception] {
        var exceptions: [Exception] = []
        for i in records.indices {
            guard case .string(let raw)? = records[i].fields[fieldKey]?.value else { continue }
            let upper = raw.uppercased()
            if vocabulary.contains(upper) { continue }
            if let best = closest(to: upper, in: vocabulary), best.distance <= 2 {
                if var field = records[i].fields[fieldKey] {
                    field.value = .string(best.word)
                    records[i].fields[fieldKey] = field
                }
            } else {
                exceptions.append(
                    Exception(
                        recordID: records[i].id,
                        pageIndex: records[i].pageIndex,
                        fieldKey: fieldKey,
                        severity: .warning,
                        kind: .failedValidation,
                        message: "Unrecognized process code '\(raw)'",
                        suggestedValue: nil
                    )
                )
            }
        }
        return exceptions
    }

    private func closest(to word: String, in dictionary: [String]) -> (word: String, distance: Int)? {
        dictionary.map { ($0, Self.levenshtein($0, word)) }.min { $0.1 < $1.1 }
    }

    static func levenshtein(_ a: String, _ b: String) -> Int {
        if a.isEmpty { return b.count }
        if b.isEmpty { return a.count }
        let a = Array(a), b = Array(b)
        var prev = Array(0...b.count)
        var curr = Array(repeating: 0, count: b.count + 1)
        for i in 1...a.count {
            curr[0] = i
            for j in 1...b.count {
                let cost = a[i-1] == b[j-1] ? 0 : 1
                curr[j] = min(curr[j-1] + 1, prev[j] + 1, prev[j-1] + cost)
            }
            swap(&prev, &curr)
        }
        return prev[b.count]
    }
}
