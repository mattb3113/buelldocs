import SwiftUI
import BuellDocsCore

struct ReviewTab: View {
    @EnvironmentObject private var state: AppState

    var body: some View {
        NavigationStack {
            List {
                ForEach(state.reviewQueue.unresolved, id: \.id) { item in
                    ReviewRow(item: item) { corrected in
                        state.resolve(item.id, correctedValue: corrected)
                    }
                }
            }
            .navigationTitle("Review")
            .overlay {
                if state.reviewQueue.unresolved.isEmpty {
                    ContentUnavailableView("All clear",
                                           systemImage: "checkmark.seal",
                                           description: Text("No pending exceptions."))
                }
            }
        }
    }
}

private struct ReviewRow: View {
    let item: ReviewQueue.Item
    var onResolve: (AnyField.Value?) -> Void
    @State private var edited: String = ""

    var body: some View {
        VStack(alignment: .leading, spacing: 6) {
            HStack(spacing: 8) {
                SeverityChip(severity: item.exception.severity)
                Text(item.exception.kind.rawValue).font(.caption.monospaced())
                Spacer()
                Text("p. \(item.exception.pageIndex + 1)").font(.caption).foregroundStyle(.secondary)
            }
            Text(item.exception.message).font(.body)

            if let key = item.exception.fieldKey {
                HStack {
                    Text(key).font(.caption).foregroundStyle(.secondary)
                    TextField("Corrected value", text: $edited)
                        .textFieldStyle(.roundedBorder)
                    Button("Save") {
                        onResolve(.string(edited))
                    }
                    .buttonStyle(.borderedProminent)
                    .disabled(edited.isEmpty)
                }
                .onAppear {
                    if let suggestion = item.exception.suggestedValue { edited = suggestion }
                }
            }

            Button("Accept as-is") { onResolve(nil) }
                .font(.caption)
        }
        .padding(.vertical, 4)
    }
}

private struct SeverityChip: View {
    let severity: Exception.Severity

    var body: some View {
        Text(severity.rawValue.uppercased())
            .font(.caption2.bold())
            .padding(.horizontal, 6).padding(.vertical, 2)
            .background(color.opacity(0.2), in: Capsule())
            .foregroundStyle(color)
    }

    private var color: Color {
        switch severity {
        case .error: return .red
        case .warning: return .orange
        case .info: return .blue
        }
    }
}
