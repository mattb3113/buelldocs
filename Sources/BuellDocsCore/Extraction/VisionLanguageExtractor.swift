import Foundation
import CoreGraphics

/// A correction emitted by the vision-language pass for a specific field.
public struct ReconciledField: Sendable {
    public let fieldKey: String
    public let recordID: UUID?
    public let value: AnyField.Value
    public let rawText: String?
    public let confidence: Confidence

    public init(
        fieldKey: String,
        recordID: UUID?,
        value: AnyField.Value,
        rawText: String? = nil,
        confidence: Confidence
    ) {
        self.fieldKey = fieldKey
        self.recordID = recordID
        self.value = value
        self.rawText = rawText
        self.confidence = confidence
    }
}

public protocol VisionLanguageExtracting: Sendable {
    func reconcile(
        page: ScannedPage,
        uncertain: [UncertainRegion],
        schema: ExtractionSchema
    ) async throws -> [ReconciledField]
}

/// Adapter to Claude's messages API (or any VLM) for handwriting / ambiguous
/// cell resolution. The adapter is deliberately thin — it only knows how to
/// send cropped regions plus a schema prompt and parse a typed JSON reply.
public struct ClaudeVisionLanguageExtractor: VisionLanguageExtracting {
    public struct Config: Sendable {
        public var endpoint: URL
        public var model: String
        public var apiKey: String
        public var maxTokens: Int
        public init(endpoint: URL, model: String, apiKey: String, maxTokens: Int = 1024) {
            self.endpoint = endpoint
            self.model = model
            self.apiKey = apiKey
            self.maxTokens = maxTokens
        }
    }

    public let config: Config
    public let transport: Transport
    public let parser: ValueParser

    public init(config: Config, transport: Transport = URLSessionTransport(), parser: ValueParser = ValueParser()) {
        self.config = config
        self.transport = transport
        self.parser = parser
    }

    public func reconcile(
        page: ScannedPage,
        uncertain: [UncertainRegion],
        schema: ExtractionSchema
    ) async throws -> [ReconciledField] {
        guard !uncertain.isEmpty else { return [] }

        let prompt = PromptBuilder.buildPrompt(schema: schema, regions: uncertain)
        let request = try buildRequest(prompt: prompt, imageData: page.imageData)
        let responseText = try await transport.send(request: request, apiKey: config.apiKey)

        let decoded = try PromptBuilder.decode(responseText)
        return decoded.map { item in
            let kind = kindFor(fieldKey: item.fieldKey, schema: schema) ?? .string
            let (value, parseConf) = parser.parse(item.text, kind: kind)
            let combined = Confidence(item.confidence * parseConf.value)
            return ReconciledField(
                fieldKey: item.fieldKey,
                recordID: item.recordID,
                value: value,
                rawText: item.text,
                confidence: combined
            )
        }
    }

    private func kindFor(fieldKey: String, schema: ExtractionSchema) -> FieldKind? {
        if let h = schema.headerFields.first(where: { $0.key == fieldKey }) { return h.kind }
        if let col = schema.rowBand?.columns.first(where: { $0.key == fieldKey }) { return col.kind }
        return nil
    }

    private func buildRequest(prompt: String, imageData: Data) throws -> URLRequest {
        var req = URLRequest(url: config.endpoint)
        req.httpMethod = "POST"
        req.addValue("application/json", forHTTPHeaderField: "content-type")
        req.addValue("2023-06-01", forHTTPHeaderField: "anthropic-version")
        req.addValue(config.apiKey, forHTTPHeaderField: "x-api-key")

        let body: [String: Any] = [
            "model": config.model,
            "max_tokens": config.maxTokens,
            "messages": [[
                "role": "user",
                "content": [
                    [
                        "type": "image",
                        "source": [
                            "type": "base64",
                            "media_type": "image/jpeg",
                            "data": imageData.base64EncodedString()
                        ]
                    ],
                    ["type": "text", "text": prompt]
                ]
            ]]
        ]
        req.httpBody = try JSONSerialization.data(withJSONObject: body)
        return req
    }
}

public protocol Transport: Sendable {
    func send(request: URLRequest, apiKey: String) async throws -> String
}

public struct URLSessionTransport: Transport {
    public init() {}
    public func send(request: URLRequest, apiKey: String) async throws -> String {
        let (data, response) = try await URLSession.shared.data(for: request)
        guard let http = response as? HTTPURLResponse, 200..<300 ~= http.statusCode else {
            throw URLError(.badServerResponse)
        }
        struct Envelope: Decodable {
            struct Block: Decodable { let type: String; let text: String? }
            let content: [Block]
        }
        let env = try JSONDecoder().decode(Envelope.self, from: data)
        return env.content.compactMap { $0.type == "text" ? $0.text : nil }.joined()
    }
}

enum PromptBuilder {
    struct Item: Decodable {
        let fieldKey: String
        let recordID: UUID?
        let text: String
        let confidence: Double
    }

    static func buildPrompt(schema: ExtractionSchema, regions: [UncertainRegion]) -> String {
        let lines = regions.map { r in
            let kind = r.fieldKey
            return "- key=\(kind) record=\(r.recordID?.uuidString ?? "header") bbox=\(format(r.box)) reason=\"\(r.reason)\""
        }.joined(separator: "\n")

        return """
        You are helping extract fields from a \(schema.documentType.displayName) (schema \(schema.id)).
        The OCR pass was uncertain about these regions of the attached image:
        \(lines)

        Return ONLY a JSON array. Each element must have keys:
          fieldKey (string), recordID (string or null), text (string), confidence (0..1).
        Use the most likely reading for handwriting. If illegible, set confidence < 0.3.
        Coordinates in bbox are normalized (0..1), origin top-left.
        """
    }

    static func decode(_ text: String) throws -> [Item] {
        // Extract the first JSON array in the reply — the model sometimes wraps
        // the array in prose or code fences despite our instructions.
        guard let start = text.firstIndex(of: "["),
              let end = text.lastIndex(of: "]"),
              start <= end else {
            return []
        }
        let json = String(text[start...end])
        let data = Data(json.utf8)
        return try JSONDecoder().decode([Item].self, from: data)
    }

    private static func format(_ r: CGRect) -> String {
        String(format: "[%.3f,%.3f,%.3f,%.3f]", r.minX, r.minY, r.width, r.height)
    }
}
