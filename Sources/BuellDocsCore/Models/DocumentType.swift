import Foundation

/// Known production form types this app can classify and extract.
/// The raw value is the stable form code used by the business.
public enum DocumentType: String, Codable, CaseIterable, Sendable {
    case dailyDoffRecord = "F-851-23A"
    case aerospacePackageCount = "F-851-3"
    case tareWorksheet = "F-851-43"
    case finalRelease = "F-851-FR"
    case shiftChecklist = "F-851-SC"
    case clearanceReportSupport = "F-851-CR"
    case unknown = "UNKNOWN"

    public var displayName: String {
        switch self {
        case .dailyDoffRecord:        return "Daily Doff Record"
        case .aerospacePackageCount:  return "Aerospace Production Package Count"
        case .tareWorksheet:          return "Tare Worksheet"
        case .finalRelease:           return "Final Release"
        case .shiftChecklist:         return "Shift Checklist"
        case .clearanceReportSupport: return "Clearance Report Support Sheet"
        case .unknown:                return "Unknown"
        }
    }
}
