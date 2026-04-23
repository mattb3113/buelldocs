import SwiftUI
import BuellDocsCore

struct DocumentsTab: View {
    @EnvironmentObject private var state: AppState

    var body: some View {
        NavigationStack {
            List(state.documents, id: \.id) { doc in
                NavigationLink(value: doc.id) {
                    DocumentRow(document: doc)
                }
            }
            .navigationTitle("Documents")
            .navigationDestination(for: UUID.self) { id in
                if let doc = state.documents.first(where: { $0.id == id }) {
                    DocumentDetail(document: doc)
                }
            }
            .overlay {
                if state.documents.isEmpty {
                    ContentUnavailableView("No documents yet",
                                           systemImage: "tray",
                                           description: Text("Scan or import to get started."))
                }
            }
        }
    }
}

private struct DocumentRow: View {
    let document: ProcessedDocument

    var body: some View {
        VStack(alignment: .leading, spacing: 2) {
            Text(document.pages.map(\.documentType.displayName)
                .reduce(into: [String]()) { acc, t in if !acc.contains(t) { acc.append(t) } }
                .joined(separator: ", "))
                .font(.headline)
            HStack(spacing: 12) {
                Text("\(document.records.count) records")
                Text("\(document.exceptions.count) exceptions")
                    .foregroundStyle(document.exceptions.isEmpty ? .secondary : .orange)
            }
            .font(.caption)
        }
    }
}

private struct DocumentDetail: View {
    let document: ProcessedDocument

    var body: some View {
        List {
            Section("Pages") {
                ForEach(document.pages, id: \.id) { page in
                    HStack {
                        Text("Page \(page.pageIndex + 1)")
                        Spacer()
                        Text(page.documentType.displayName)
                            .foregroundStyle(.secondary)
                        Text(String(format: "%.0f%%", page.confidence.value * 100))
                            .font(.caption.monospacedDigit())
                    }
                }
            }
            Section("Records (\(document.records.count))") {
                ForEach(document.records, id: \.id) { record in
                    VStack(alignment: .leading, spacing: 2) {
                        Text("Row \(record.rowIndex + 1) — page \(record.pageIndex + 1)")
                            .font(.caption).foregroundStyle(.secondary)
                        Text(recordLabel(record)).font(.body)
                    }
                }
            }
        }
        .navigationTitle("Document")
    }

    private func recordLabel(_ record: Record) -> String {
        record.fields
            .sorted { $0.key < $1.key }
            .map { "\($0.key): \(describe($0.value.value))" }
            .joined(separator: " • ")
    }

    private func describe(_ value: AnyField.Value) -> String {
        switch value {
        case .string(let s): return s
        case .integer(let i): return String(i)
        case .decimal(let d): return String(format: "%.2f", d)
        case .date(let d): return d.formatted(date: .numeric, time: .omitted)
        case .bool(let b): return b ? "✓" : "–"
        case .missing: return "—"
        }
    }
}
