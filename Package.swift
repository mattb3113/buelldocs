// swift-tools-version: 5.10
import PackageDescription

let package = Package(
    name: "BuellDocs",
    platforms: [.iOS(.v17)],
    products: [
        .library(name: "BuellDocsCore", targets: ["BuellDocsCore"]),
        .library(name: "BuellDocsUI", targets: ["BuellDocsUI"]),
    ],
    targets: [
        .target(
            name: "BuellDocsCore",
            path: "Sources/BuellDocsCore"
        ),
        .target(
            name: "BuellDocsUI",
            dependencies: ["BuellDocsCore"],
            path: "Sources/BuellDocsUI"
        ),
        .testTarget(
            name: "BuellDocsCoreTests",
            dependencies: ["BuellDocsCore"],
            path: "Tests/BuellDocsCoreTests"
        ),
    ]
)
