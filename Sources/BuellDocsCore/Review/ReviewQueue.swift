import Foundation

/// Aggregates every open exception across a batch of processed documents
/// so the reviewer can triage them in a single pass, sorted by severity.
public struct ReviewQueue: Sendable {
    public struct Item: Identifiable, Sendable, Hashable {
        public let id: UUID
        public var exception: Exception
        public var documentID: UUID
        public var record: Record?
        public init(exception: Exception, documentID: UUID, record: Record?) {
            self.id = exception.id
            self.exception = exception
            self.documentID = documentID
            self.record = record
        }
    }

    public private(set) var items: [Item]

    public init(documents: [ProcessedDocument]) {
        var items: [Item] = []
        for doc in documents {
            let recordByID = Dictionary(uniqueKeysWithValues: doc.records.map { ($0.id, $0) })
            for exception in doc.exceptions where !exception.resolved {
                items.append(
                    Item(
                        exception: exception,
                        documentID: doc.id,
                        record: exception.recordID.flatMap { recordByID[$0] }
                    )
                )
            }
        }
        self.items = items.sorted(by: Self.priority)
    }

    public mutating func resolve(_ id: UUID, correctedValue: AnyField.Value? = nil) {
        guard let idx = items.firstIndex(where: { $0.id == id }) else { return }
        items[idx].exception.resolved = true
        if let correctedValue, let fieldKey = items[idx].exception.fieldKey, var record = items[idx].record {
            if var field = record.fields[fieldKey] {
                field.value = correctedValue
                field.extractor = .manual
                field.confidence = .certain
                record.fields[fieldKey] = field
                items[idx].record = record
            }
        }
    }

    public var unresolved: [Item] { items.filter { !$0.exception.resolved } }

    private static func priority(_ lhs: Item, _ rhs: Item) -> Bool {
        func rank(_ severity: Exception.Severity) -> Int {
            switch severity {
            case .error: return 0
            case .warning: return 1
            case .info: return 2
            }
        }
        let l = rank(lhs.exception.severity), r = rank(rhs.exception.severity)
        if l != r { return l < r }
        return lhs.exception.pageIndex < rhs.exception.pageIndex
    }
}
