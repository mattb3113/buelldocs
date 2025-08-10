export const getDocumentTypeName = (type: string): string => {
  switch (type) {
    case 'paystub':
      return 'Paystub';
    case 'w2':
      return 'W-2 Form';
    case 'bankStatement':
      return 'Bank Statement';
    case 'diploma':
      return 'Diploma';
    case '1099':
      return '1099 Form';
    case 'employmentVerification':
      return 'Employment Verification';
    case 'transcript':
      return 'Academic Transcript';
    case 'reportCard':
      return 'Report Card';
    case 'universityOffer':
      return 'University Offer Letter';
    case 'enrollmentVerification':
      return 'Enrollment Verification';
    case 'studentId':
      return 'Student ID Card';
    case 'gedCertificate':
      return 'GED Certificate';
    case 'professionalReference':
      return 'Professional Reference';
    case 'offerLetter':
      return 'Offer Letter';
    case 'resignationLetter':
      return 'Resignation Letter';
    case 'performanceReview':
      return 'Performance Review';
    case 'payrollHistory':
      return 'Payroll History';
    case 'ndaAgreement':
      return 'NDA Agreement';
    case 'esaCertificate':
      return 'ESA Certificate';
    case 'rentalAgreement':
      return 'Rental Agreement';
    case 'insuranceCard':
      return 'Insurance Card';
    case 'medicalRecord':
      return 'Medical Record';
    case 'doctorsNote':
      return "Doctor's Note";
    case 'vehicleRegistration':
      return 'Vehicle Registration';
    case 'professionalCertification':
      return 'Professional Certification';
    case 'courtNotice':
      return 'Court Notice';
    case 'immigrationDocument':
      return 'Immigration Document';
    case 'taxReturn':
      return 'Tax Return (1040)';
    case 'investmentStatement':
      return 'Investment Statement';
    case 'creditCardStatement':
      return 'Credit Card Statement';
    case 'utilityBill':
      return 'Utility Bill';
    default:
      return 'Document';
  }
};

export const getDocumentIcon = (type: string): string => {
  switch (type) {
    case 'paystub':
      return '📊';
    case 'w2':
      return '📋';
    case 'bankStatement':
      return '🏦';
    case 'diploma':
      return '🎓';
    case '1099':
      return '📄';
    case 'employmentVerification':
      return '💼';
    case 'transcript':
      return '📜';
    case 'reportCard':
      return '📝';
    case 'universityOffer':
      return '🎓';
    case 'enrollmentVerification':
      return '✅';
    case 'studentId':
      return '🆔';
    case 'gedCertificate':
      return '🏆';
    case 'professionalReference':
      return '📋';
    case 'offerLetter':
      return '💼';
    case 'resignationLetter':
      return '📄';
    case 'performanceReview':
      return '📊';
    case 'payrollHistory':
      return '💰';
    case 'ndaAgreement':
      return '🔒';
    case 'esaCertificate':
      return '🐕';
    case 'rentalAgreement':
      return '🏠';
    case 'insuranceCard':
      return '🛡️';
    case 'medicalRecord':
      return '🏥';
    case 'doctorsNote':
      return '👨‍⚕️';
    case 'vehicleRegistration':
      return '🚗';
    case 'professionalCertification':
      return '🏆';
    case 'courtNotice':
      return '⚖️';
    case 'immigrationDocument':
      return '🛂';
    case 'taxReturn':
      return '📋';
    case 'investmentStatement':
      return '📈';
    case 'creditCardStatement':
      return '💳';
    case 'utilityBill':
      return '⚡';
    default:
      return '📄';
  }
};