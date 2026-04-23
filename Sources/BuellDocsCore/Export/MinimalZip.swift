import Foundation

/// Stream-minimal ZIP archive builder — stores each file as STORED (no
/// compression) so we don't need a runtime compression dependency for a
/// correct, Excel-readable .xlsx. This keeps the Core library self-contained
/// while still producing a spec-valid archive.
enum MinimalZip {
    struct Entry {
        let path: String
        let data: Data
        let crc: UInt32
        let offset: UInt32
    }

    static func archive(files: [(path: String, data: Data)]) throws -> Data {
        var output = Data()
        var entries: [Entry] = []

        for file in files {
            let crc = crc32(file.data)
            let offset = UInt32(output.count)
            entries.append(Entry(path: file.path, data: file.data, crc: crc, offset: offset))
            output.append(localFileHeader(path: file.path, data: file.data, crc: crc))
            output.append(file.data)
        }

        let centralStart = UInt32(output.count)
        for entry in entries {
            output.append(centralDirectoryHeader(entry: entry))
        }
        let centralEnd = UInt32(output.count)
        output.append(endOfCentralDirectory(
            totalEntries: UInt16(entries.count),
            centralSize: centralEnd - centralStart,
            centralOffset: centralStart
        ))
        return output
    }

    // MARK: - Record builders

    private static func localFileHeader(path: String, data: Data, crc: UInt32) -> Data {
        var out = Data()
        let pathBytes = Data(path.utf8)
        out.append(le32(0x04034b50))
        out.append(le16(20))                    // version needed
        out.append(le16(0))                     // general purpose
        out.append(le16(0))                     // method: STORED
        out.append(le16(0))                     // mod time
        out.append(le16(0))                     // mod date
        out.append(le32(crc))
        out.append(le32(UInt32(data.count)))    // compressed size
        out.append(le32(UInt32(data.count)))    // uncompressed size
        out.append(le16(UInt16(pathBytes.count)))
        out.append(le16(0))                     // extra len
        out.append(pathBytes)
        return out
    }

    private static func centralDirectoryHeader(entry: Entry) -> Data {
        var out = Data()
        let pathBytes = Data(entry.path.utf8)
        out.append(le32(0x02014b50))
        out.append(le16(20))                    // version made by
        out.append(le16(20))                    // version needed
        out.append(le16(0))                     // gp flag
        out.append(le16(0))                     // method
        out.append(le16(0))                     // mod time
        out.append(le16(0))                     // mod date
        out.append(le32(entry.crc))
        out.append(le32(UInt32(entry.data.count)))
        out.append(le32(UInt32(entry.data.count)))
        out.append(le16(UInt16(pathBytes.count)))
        out.append(le16(0))                     // extra
        out.append(le16(0))                     // comment
        out.append(le16(0))                     // disk #
        out.append(le16(0))                     // internal attrs
        out.append(le32(0))                     // external attrs
        out.append(le32(entry.offset))
        out.append(pathBytes)
        return out
    }

    private static func endOfCentralDirectory(
        totalEntries: UInt16,
        centralSize: UInt32,
        centralOffset: UInt32
    ) -> Data {
        var out = Data()
        out.append(le32(0x06054b50))
        out.append(le16(0))                     // disk #
        out.append(le16(0))                     // disk w/ cd
        out.append(le16(totalEntries))
        out.append(le16(totalEntries))
        out.append(le32(centralSize))
        out.append(le32(centralOffset))
        out.append(le16(0))                     // comment len
        return out
    }

    private static func le16(_ v: UInt16) -> Data {
        var v = v.littleEndian
        return withUnsafeBytes(of: &v) { Data($0) }
    }
    private static func le32(_ v: UInt32) -> Data {
        var v = v.littleEndian
        return withUnsafeBytes(of: &v) { Data($0) }
    }

    // MARK: - CRC32

    private static let crcTable: [UInt32] = {
        (0..<256).map { i -> UInt32 in
            var c = UInt32(i)
            for _ in 0..<8 {
                c = (c & 1 == 1) ? (0xEDB88320 ^ (c >> 1)) : (c >> 1)
            }
            return c
        }
    }()

    static func crc32(_ data: Data) -> UInt32 {
        var c: UInt32 = 0xFFFFFFFF
        for byte in data {
            let idx = Int((c ^ UInt32(byte)) & 0xFF)
            c = crcTable[idx] ^ (c >> 8)
        }
        return c ^ 0xFFFFFFFF
    }
}
