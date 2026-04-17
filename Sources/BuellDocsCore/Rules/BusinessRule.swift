import Foundation

/// A business rule receives the working set of records for one document
/// and may mutate them (normalize/correct) and/or emit exceptions.
public protocol BusinessRule: Sendable {
    var id: String { get }
    func apply(records: inout [Record], schema: ExtractionSchema) -> [Exception]
}

public struct RulesEngine: Sendable {
    public let rules: [BusinessRule]
    public init(rules: [BusinessRule]) { self.rules = rules }

    public func apply(records: inout [Record], schema: ExtractionSchema) -> [Exception] {
        var exceptions: [Exception] = []
        for rule in rules {
            exceptions.append(contentsOf: rule.apply(records: &records, schema: schema))
        }
        return exceptions
    }

    /// Default rule stack for this shop's forms.
    public static let standard = RulesEngine(rules: [
        TrimWhitespaceRule(),
        NormalizeMachineCodeRule(),
        NormalizeProcessCodeRule(),
        RequiredFieldsRule(),
        NetWeightCrossCheckRule(),
        DuplicateRowRule(),
        TotalLineMatchRule(),
    ])
}
