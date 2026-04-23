import SwiftUI
import BuellDocsCore

public struct RootView: View {
    @StateObject private var state: AppState

    public init(state: AppState = AppState()) {
        _state = StateObject(wrappedValue: state)
    }

    public var body: some View {
        TabView {
            CaptureTab().environmentObject(state)
                .tabItem { Label("Capture", systemImage: "doc.viewfinder") }

            DocumentsTab().environmentObject(state)
                .tabItem { Label("Documents", systemImage: "tray.full") }

            ReviewTab().environmentObject(state)
                .badge(state.reviewQueue.unresolved.count)
                .tabItem { Label("Review", systemImage: "checklist") }

            ExportTab().environmentObject(state)
                .tabItem { Label("Export", systemImage: "square.and.arrow.up") }
        }
        .overlay {
            if state.isProcessing {
                ProgressView("Processing…")
                    .padding()
                    .background(.ultraThinMaterial, in: RoundedRectangle(cornerRadius: 12))
            }
        }
        .alert("Error", isPresented: .init(
            get: { state.lastError != nil },
            set: { if !$0 { state.lastError = nil } }
        )) {
            Button("OK") { state.lastError = nil }
        } message: {
            Text(state.lastError ?? "")
        }
    }
}
