import Foundation

/// Emits an error exception when a schema-required column is missing or blank.
public struct RequiredFieldsRule: BusinessRule {
    public let id = "required-fields"
    public init() {}

    public func apply(records: inout [Record], schema: ExtractionSchema) -> [Exception] {
        var exceptions: [Exception] = []
        for record in records {
            for key in schema.requiredKeys {
                let missing: Bool
                switch record.fields[key]?.value {
                case .none:           missing = true
                case .some(.missing): missing = true
                case .some(.string(let s)): missing = s.isEmpty
                default:              missing = false
                }
                if missing {
                    exceptions.append(
                        Exception(
                            recordID: record.id,
                            pageIndex: record.pageIndex,
                            fieldKey: key,
                            severity: .error,
                            kind: .missingRequiredField,
                            message: "Required field '\(key)' is missing"
                        )
                    )
                }
            }
        }
        return exceptions
    }
}

/// Verifies gross - tare ≈ net on aerospace package-count rows.
public struct NetWeightCrossCheckRule: BusinessRule {
    public let id = "net-weight-crosscheck"
    public let tolerance: Double
    public init(tolerance: Double = 0.05) { self.tolerance = tolerance }

    public func apply(records: inout [Record], schema: ExtractionSchema) -> [Exception] {
        guard schema.documentType == .aerospacePackageCount else { return [] }
        var exceptions: [Exception] = []
        for i in records.indices {
            let gross = numeric(records[i].fields["gross"]?.value)
            let tare  = numeric(records[i].fields["tare"]?.value)
            let net   = numeric(records[i].fields["net"]?.value)
            guard let g = gross, let t = tare, let n = net else { continue }
            let expected = g - t
            let drift = abs(expected - n)
            if drift > tolerance {
                exceptions.append(
                    Exception(
                        recordID: records[i].id,
                        pageIndex: records[i].pageIndex,
                        fieldKey: "net",
                        severity: .error,
                        kind: .crossFieldMismatch,
                        message: "net (\(n)) != gross - tare (\(expected))",
                        suggestedValue: String(format: "%.3f", expected)
                    )
                )
            }
        }
        return exceptions
    }

    private func numeric(_ value: AnyField.Value?) -> Double? {
        switch value {
        case .decimal(let d): return d
        case .integer(let i): return Double(i)
        default: return nil
        }
    }
}

/// Flags exact-duplicate rows on the same page.
public struct DuplicateRowRule: BusinessRule {
    public let id = "duplicate-rows"
    public init() {}

    public func apply(records: inout [Record], schema: ExtractionSchema) -> [Exception] {
        var seen: [String: UUID] = [:]
        var exceptions: [Exception] = []
        for record in records {
            let signature = record.fields
                .sorted { $0.key < $1.key }
                .map { "\($0.key)=\($0.value.value)" }
                .joined(separator: "|")
            if let first = seen[signature] {
                exceptions.append(
                    Exception(
                        recordID: record.id,
                        pageIndex: record.pageIndex,
                        severity: .warning,
                        kind: .duplicateRow,
                        message: "Row duplicates record \(first.uuidString.prefix(8))"
                    )
                )
            } else {
                seen[signature] = record.id
            }
        }
        return exceptions
    }
}

/// Verifies a per-page "Total" footer field matches the sum of row counts.
public struct TotalLineMatchRule: BusinessRule {
    public let id = "total-line-match"
    public let totalFieldKey: String
    public let rowFieldKey: String
    public init(totalFieldKey: String = "total", rowFieldKey: String = "count") {
        self.totalFieldKey = totalFieldKey
        self.rowFieldKey = rowFieldKey
    }

    public func apply(records: inout [Record], schema: ExtractionSchema) -> [Exception] {
        let byPage = Dictionary(grouping: records, by: \.pageIndex)
        var exceptions: [Exception] = []
        for (pageIndex, pageRecords) in byPage {
            let totals = pageRecords.compactMap { record -> Int? in
                if let field = record.fields[totalFieldKey],
                   case .integer(let v) = field.value { return v }
                return nil
            }
            guard let claimed = totals.first else { continue }
            let observed = pageRecords.reduce(0) { acc, record in
                if let field = record.fields[rowFieldKey], case .integer(let v) = field.value {
                    return acc + v
                }
                return acc
            }
            if claimed != observed {
                exceptions.append(
                    Exception(
                        pageIndex: pageIndex,
                        fieldKey: totalFieldKey,
                        severity: .error,
                        kind: .totalMismatch,
                        message: "Page total \(claimed) != row sum \(observed)",
                        suggestedValue: String(observed)
                    )
                )
            }
        }
        return exceptions
    }
}
