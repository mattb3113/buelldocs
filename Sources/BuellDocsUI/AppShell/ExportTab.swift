import SwiftUI
import BuellDocsCore

struct ExportTab: View {
    @EnvironmentObject private var state: AppState
    @State private var exportedURL: URL?
    @State private var showShare = false

    var body: some View {
        NavigationStack {
            List(state.templates, id: \.id) { template in
                Button {
                    export(template)
                } label: {
                    VStack(alignment: .leading, spacing: 2) {
                        Text(template.sheetName).font(.headline)
                        Text(template.documentType.displayName)
                            .font(.caption).foregroundStyle(.secondary)
                        Text("\(template.columns.count) columns")
                            .font(.caption2).foregroundStyle(.secondary)
                    }
                }
                .disabled(state.reviewQueue.unresolved.contains { $0.exception.severity == .error })
            }
            .navigationTitle("Export")
            .sheet(isPresented: $showShare) {
                if let url = exportedURL {
                    ShareSheet(activityItems: [url])
                }
            }
        }
    }

    private func export(_ template: ExcelTemplate) {
        do {
            let url = try state.exportURL(for: template)
            exportedURL = url
            showShare = true
        } catch {
            state.lastError = error.localizedDescription
        }
    }
}

#if canImport(UIKit)
import UIKit

struct ShareSheet: UIViewControllerRepresentable {
    let activityItems: [Any]
    func makeUIViewController(context: Context) -> UIActivityViewController {
        UIActivityViewController(activityItems: activityItems, applicationActivities: nil)
    }
    func updateUIViewController(_ controller: UIActivityViewController, context: Context) {}
}
#endif
