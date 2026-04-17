import SwiftUI
import UniformTypeIdentifiers
import BuellDocsCore

struct CaptureTab: View {
    @EnvironmentObject private var state: AppState
    @State private var showScanner = false
    @State private var showImporter = false

    var body: some View {
        NavigationStack {
            List {
                Section("New capture") {
                    Button {
                        showScanner = true
                    } label: {
                        Label("Scan with camera", systemImage: "camera")
                    }
                    Button {
                        showImporter = true
                    } label: {
                        Label("Import PDF or image", systemImage: "doc.badge.plus")
                    }
                }
                Section("Recent") {
                    if state.documents.isEmpty {
                        Text("Nothing captured yet.").foregroundStyle(.secondary)
                    } else {
                        ForEach(state.documents.suffix(5).reversed(), id: \.id) { doc in
                            VStack(alignment: .leading, spacing: 2) {
                                Text(summary(doc)).font(.headline)
                                Text("\(doc.records.count) records • \(doc.exceptions.count) exceptions")
                                    .font(.caption).foregroundStyle(.secondary)
                            }
                        }
                    }
                }
            }
            .navigationTitle("Capture")
            .sheet(isPresented: $showScanner) {
                #if canImport(VisionKit) && canImport(UIKit)
                VisionKitScanner { result in
                    showScanner = false
                    if case .success(let scanned) = result {
                        Task { await state.ingest(scanned) }
                    }
                }
                .ignoresSafeArea()
                #else
                Text("Scanner unavailable on this platform").padding()
                #endif
            }
            .fileImporter(
                isPresented: $showImporter,
                allowedContentTypes: [.pdf, .image],
                allowsMultipleSelection: true
            ) { result in
                Task { await handleImport(result) }
            }
        }
    }

    private func summary(_ doc: ProcessedDocument) -> String {
        let types = Set(doc.pages.map(\.documentType.displayName))
        return types.sorted().joined(separator: ", ")
    }

    private func handleImport(_ result: Result<[URL], Error>) async {
        guard case .success(let urls) = result else { return }
        let splitter = PDFPageSplitter()
        for url in urls {
            let accessed = url.startAccessingSecurityScopedResource()
            defer { if accessed { url.stopAccessingSecurityScopedResource() } }
            guard let data = try? Data(contentsOf: url) else { continue }

            if url.pathExtension.lowercased() == "pdf" {
                if let pages = try? splitter.split(pdfData: data) {
                    await state.ingest(ScannedDocument(pages: pages, source: .pdfImport))
                }
            } else {
                #if canImport(UIKit)
                if let image = UIImage(data: data),
                   let jpeg = image.jpegData(compressionQuality: 0.92) {
                    let page = ScannedPage(index: 0, imageData: jpeg, pixelSize: image.size)
                    await state.ingest(ScannedDocument(pages: [page], source: .photoLibrary))
                }
                #endif
            }
        }
    }
}
