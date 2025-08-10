import React, { useState } from 'react';
import { ArrowLeft, FileText, Download, Eye, LogOut, Award, Calendar, User } from 'lucide-react';

interface User {
  id: string;
  name: string;
  email: string;
  avatar: string;
}

interface CertificatesGeneratorProps {
  user: User;
  onBack: () => void;
  onLogout: () => void;
}

interface CertificateData {
  // Institution Information
  institutionName: string;
  institutionAddress: string;
  institutionCity: string;
  institutionState: string;
  institutionZip: string;
  
  // Certificate Information
  recipientName: string;
  certificateType: string;
  courseName: string;
  completionDate: string;
  issueDate: string;
  
  // Signatories
  presidentName: string;
  presidentTitle: string;
  deanName: string;
  deanTitle: string;
  
  // Additional Information
  honors: string;
  gpa: string;
  credits: string;
}

const CertificatesGenerator: React.FC<CertificatesGeneratorProps> = ({ user, onBack, onLogout }) => {
  const [currentStep, setCurrentStep] = useState(1);
  const [formData, setFormData] = useState<CertificateData>({
    institutionName: '',
    institutionAddress: '',
    institutionCity: '',
    institutionState: '',
    institutionZip: '',
    recipientName: '',
    certificateType: 'diploma',
    courseName: '',
    completionDate: '',
    issueDate: new Date().toISOString().split('T')[0],
    presidentName: '',
    presidentTitle: 'President',
    deanName: '',
    deanTitle: 'Dean',
    honors: '',
    gpa: '',
    credits: ''
  });
  const [generatedDocument, setGeneratedDocument] = useState<string | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);

  const handleInputChange = (field: keyof CertificateData, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const validateStep = (step: number): boolean => {
    switch (step) {
      case 1:
        return !!(formData.institutionName && formData.institutionAddress && 
                 formData.institutionCity && formData.institutionState && 
                 formData.institutionZip);
      case 2:
        return !!(formData.recipientName && formData.certificateType && 
                 formData.courseName && formData.completionDate);
      case 3:
        return !!(formData.presidentName && formData.deanName);
      default:
        return true;
    }
  };

  const nextStep = () => {
    if (validateStep(currentStep)) {
      if (currentStep === 3) {
        generateCertificate();
      } else {
        setCurrentStep(prev => Math.min(prev + 1, 4));
      }
    } else {
      alert('Please fill in all required fields before continuing.');
    }
  };

  const prevStep = () => {
    setCurrentStep(prev => Math.max(prev - 1, 1));
  };

  const generateCertificate = async () => {
    setIsGenerating(true);
    
    try {
      const certificateHTML = `
        <div style="font-family: 'Times New Roman', serif; max-width: 800px; margin: 0 auto; padding: 40px; border: 8px solid #8B4513; background: linear-gradient(45deg, #FFF8DC, #FFFACD); position: relative;">
          <!-- Decorative Border -->
          <div style="position: absolute; top: 20px; left: 20px; right: 20px; bottom: 20px; border: 2px solid #DAA520; border-radius: 10px;"></div>
          
          <!-- Header -->
          <div style="text-align: center; margin-bottom: 40px; position: relative; z-index: 1;">
            <h1 style="font-size: 36px; color: #8B4513; margin: 0; text-shadow: 2px 2px 4px rgba(0,0,0,0.1); font-weight: bold;">
              ${formData.institutionName}
            </h1>
            <div style="font-size: 14px; color: #666; margin-top: 10px; line-height: 1.4;">
              ${formData.institutionAddress}<br>
              ${formData.institutionCity}, ${formData.institutionState} ${formData.institutionZip}
            </div>
          </div>
          
          <!-- Certificate Title -->
          <div style="text-align: center; margin-bottom: 30px;">
            <h2 style="font-size: 28px; color: #8B4513; margin: 0; font-weight: normal; letter-spacing: 2px;">
              ${formData.certificateType === 'diploma' ? 'DIPLOMA' : 
                formData.certificateType === 'certificate' ? 'CERTIFICATE OF COMPLETION' :
                'PROFESSIONAL CERTIFICATE'}
            </h2>
          </div>
          
          <!-- Main Content -->
          <div style="text-align: center; margin-bottom: 40px; line-height: 1.8;">
            <p style="font-size: 18px; margin-bottom: 20px; color: #333;">
              This is to certify that
            </p>
            
            <div style="font-size: 32px; font-weight: bold; color: #8B4513; margin: 20px 0; text-decoration: underline; text-decoration-color: #DAA520;">
              ${formData.recipientName}
            </div>
            
            <p style="font-size: 18px; margin: 20px 0; color: #333;">
              has successfully completed the requirements for
            </p>
            
            <div style="font-size: 24px; font-weight: bold; color: #8B4513; margin: 20px 0; font-style: italic;">
              ${formData.courseName}
            </div>
            
            ${formData.honors ? `
              <p style="font-size: 16px; color: #8B4513; margin: 15px 0; font-weight: bold;">
                ${formData.honors}
              </p>
            ` : ''}
            
            ${formData.gpa ? `
              <p style="font-size: 14px; color: #666; margin: 10px 0;">
                Grade Point Average: ${formData.gpa}
              </p>
            ` : ''}
            
            ${formData.credits ? `
              <p style="font-size: 14px; color: #666; margin: 10px 0;">
                Total Credits: ${formData.credits}
              </p>
            ` : ''}
            
            <p style="font-size: 16px; margin-top: 30px; color: #333;">
              Given this ${new Date(formData.issueDate).toLocaleDateString('en-US', { 
                day: 'numeric',
                month: 'long', 
                year: 'numeric' 
              })}
            </p>
          </div>
          
          <!-- Signatures -->
          <div style="display: flex; justify-content: space-between; margin-top: 60px; padding: 0 40px;">
            <div style="text-align: center; width: 200px;">
              <div style="border-bottom: 2px solid #8B4513; margin-bottom: 10px; height: 40px;"></div>
              <div style="font-size: 14px; font-weight: bold; color: #8B4513;">
                ${formData.presidentName}
              </div>
              <div style="font-size: 12px; color: #666;">
                ${formData.presidentTitle}
              </div>
            </div>
            
            <div style="text-align: center; width: 200px;">
              <div style="border-bottom: 2px solid #8B4513; margin-bottom: 10px; height: 40px;"></div>
              <div style="font-size: 14px; font-weight: bold; color: #8B4513;">
                ${formData.deanName}
              </div>
              <div style="font-size: 12px; color: #666;">
                ${formData.deanTitle}
              </div>
            </div>
          </div>
          
          <!-- Seal/Logo Area -->
          <div style="position: absolute; bottom: 40px; left: 40px; width: 80px; height: 80px; border: 3px solid #8B4513; border-radius: 50%; background: radial-gradient(circle, #DAA520, #B8860B); display: flex; align-items: center; justify-content: center;">
            <div style="color: white; font-weight: bold; font-size: 12px; text-align: center; line-height: 1.2;">
              OFFICIAL<br>SEAL
            </div>
          </div>
          
          <!-- Date -->
          <div style="position: absolute; bottom: 40px; right: 40px; text-align: right; font-size: 12px; color: #666;">
            Completion Date:<br>
            ${new Date(formData.completionDate).toLocaleDateString('en-US', { 
              month: 'long', 
              day: 'numeric', 
              year: 'numeric' 
            })}
          </div>
          
          <!-- Legal Notice -->
          <div style="margin-top: 40px; padding: 15px; background-color: #fff3cd; border: 2px solid #ffc107; border-radius: 5px; position: relative; z-index: 1;">
            <p style="margin: 0; font-size: 11px; color: #856404; text-align: center;">
              <strong>NOTICE:</strong> This document is for novelty and educational purposes only. 
              Not intended for fraudulent use or misrepresentation.
            </p>
          </div>
        </div>
      `;
      
      setGeneratedDocument(certificateHTML);
      
      // Save to user's document history
      const savedDocuments = localStorage.getItem('buelldocs_documents');
      const documents = savedDocuments ? JSON.parse(savedDocuments) : [];
      
      const newDocument = {
        id: Date.now().toString(),
        type: 'diploma',
        name: `${formData.certificateType === 'diploma' ? 'Diploma' : 'Certificate'} - ${formData.recipientName}`,
        createdAt: new Date().toISOString(),
        status: 'completed',
        category: 'academic'
      };
      
      documents.unshift(newDocument);
      localStorage.setItem('buelldocs_documents', JSON.stringify(documents));
      
      setCurrentStep(4);
    } catch (error) {
      console.error('Error generating certificate:', error);
      alert('An error occurred while generating the certificate. Please try again.');
    } finally {
      setIsGenerating(false);
    }
  };

  const downloadCertificate = () => {
    if (!generatedDocument) return;
    
    const blob = new Blob([generatedDocument], { type: 'text/html' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `certificate-${formData.recipientName.replace(/\s+/g, '-').toLowerCase()}.html`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const printCertificate = () => {
    if (!generatedDocument) return;
    
    const printWindow = window.open('', '_blank');
    if (printWindow) {
      printWindow.document.write(generatedDocument);
      printWindow.document.close();
      printWindow.print();
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-4">
              <button
                onClick={onBack}
                className="flex items-center space-x-2 text-gray-600 hover:text-blue-600 transition-colors"
              >
                <ArrowLeft className="h-5 w-5" />
                <span>Back to Dashboard</span>
              </button>
              <div className="h-6 w-px bg-gray-300"></div>
              <div className="flex items-center space-x-3">
                <Award className="h-6 w-6 text-purple-600" />
                <span className="text-lg font-semibold text-gray-900">Certificates & Diplomas Generator</span>
              </div>
            </div>
            
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center text-white text-sm font-semibold">
                  {user.avatar}
                </div>
                <span className="hidden md:inline text-sm font-medium text-gray-900">{user.name}</span>
              </div>
              <button
                onClick={onLogout}
                className="flex items-center space-x-2 text-gray-600 hover:text-red-600 transition-colors"
              >
                <LogOut className="h-4 w-4" />
                <span className="hidden md:inline">Sign Out</span>
              </button>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Progress Bar */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <h1 className="text-2xl font-bold text-gray-900">Generate Certificate or Diploma</h1>
            <div className="text-sm text-gray-600">Step {currentStep} of 4</div>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div 
              className="bg-purple-600 h-2 rounded-full transition-all duration-300"
              style={{ width: `${(currentStep / 4) * 100}%` }}
            ></div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm p-6">
          {/* Step 1: Institution Information */}
          {currentStep === 1 && (
            <div>
              <h2 className="text-xl font-semibold text-gray-900 mb-6">Institution Information</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Institution Name *
                  </label>
                  <input
                    type="text"
                    value={formData.institutionName}
                    onChange={(e) => handleInputChange('institutionName', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                    placeholder="University of Excellence"
                  />
                </div>
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Address *
                  </label>
                  <input
                    type="text"
                    value={formData.institutionAddress}
                    onChange={(e) => handleInputChange('institutionAddress', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                    placeholder="123 University Drive"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    City *
                  </label>
                  <input
                    type="text"
                    value={formData.institutionCity}
                    onChange={(e) => handleInputChange('institutionCity', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                    placeholder="Boston"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    State *
                  </label>
                  <select
                    value={formData.institutionState}
                    onChange={(e) => handleInputChange('institutionState', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                  >
                    <option value="">Select State</option>
                    <option value="CA">California</option>
                    <option value="NY">New York</option>
                    <option value="TX">Texas</option>
                    <option value="FL">Florida</option>
                    <option value="IL">Illinois</option>
                    <option value="MA">Massachusetts</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    ZIP Code *
                  </label>
                  <input
                    type="text"
                    value={formData.institutionZip}
                    onChange={(e) => handleInputChange('institutionZip', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                    placeholder="02101"
                  />
                </div>
              </div>
            </div>
          )}

          {/* Step 2: Certificate Information */}
          {currentStep === 2 && (
            <div>
              <h2 className="text-xl font-semibold text-gray-900 mb-6">Certificate Information</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Recipient Name *
                  </label>
                  <input
                    type="text"
                    value={formData.recipientName}
                    onChange={(e) => handleInputChange('recipientName', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                    placeholder="John Doe"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Certificate Type *
                  </label>
                  <select
                    value={formData.certificateType}
                    onChange={(e) => handleInputChange('certificateType', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                  >
                    <option value="diploma">Diploma</option>
                    <option value="certificate">Certificate of Completion</option>
                    <option value="professional">Professional Certificate</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Completion Date *
                  </label>
                  <input
                    type="date"
                    value={formData.completionDate}
                    onChange={(e) => handleInputChange('completionDate', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                  />
                </div>
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Course/Program Name *
                  </label>
                  <input
                    type="text"
                    value={formData.courseName}
                    onChange={(e) => handleInputChange('courseName', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                    placeholder="Bachelor of Science in Computer Science"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Honors (Optional)
                  </label>
                  <select
                    value={formData.honors}
                    onChange={(e) => handleInputChange('honors', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                  >
                    <option value="">No Honors</option>
                    <option value="Cum Laude">Cum Laude</option>
                    <option value="Magna Cum Laude">Magna Cum Laude</option>
                    <option value="Summa Cum Laude">Summa Cum Laude</option>
                    <option value="With Distinction">With Distinction</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    GPA (Optional)
                  </label>
                  <input
                    type="text"
                    value={formData.gpa}
                    onChange={(e) => handleInputChange('gpa', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                    placeholder="3.85"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Total Credits (Optional)
                  </label>
                  <input
                    type="text"
                    value={formData.credits}
                    onChange={(e) => handleInputChange('credits', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                    placeholder="120"
                  />
                </div>
              </div>
            </div>
          )}

          {/* Step 3: Signatories */}
          {currentStep === 3 && (
            <div>
              <h2 className="text-xl font-semibold text-gray-900 mb-6">Signatories</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    President Name *
                  </label>
                  <input
                    type="text"
                    value={formData.presidentName}
                    onChange={(e) => handleInputChange('presidentName', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                    placeholder="Dr. Jane Smith"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    President Title
                  </label>
                  <input
                    type="text"
                    value={formData.presidentTitle}
                    onChange={(e) => handleInputChange('presidentTitle', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                    placeholder="President"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Dean Name *
                  </label>
                  <input
                    type="text"
                    value={formData.deanName}
                    onChange={(e) => handleInputChange('deanName', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                    placeholder="Dr. Robert Johnson"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Dean Title
                  </label>
                  <input
                    type="text"
                    value={formData.deanTitle}
                    onChange={(e) => handleInputChange('deanTitle', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                    placeholder="Dean"
                  />
                </div>
              </div>
            </div>
          )}

          {/* Step 4: Preview and Generate */}
          {currentStep === 4 && (
            <div>
              <h2 className="text-xl font-semibold text-gray-900 mb-6">Preview & Generate</h2>
              
              {!generatedDocument ? (
                <div className="text-center py-8">
                  <div className="bg-purple-50 rounded-lg p-6 mb-6">
                    <h3 className="text-lg font-medium text-purple-900 mb-2">Ready to Generate</h3>
                    <p className="text-purple-700 mb-4">
                      Review your information and click generate to create your certificate.
                    </p>
                    <div className="text-sm text-purple-600 space-y-1">
                      <p><strong>Institution:</strong> {formData.institutionName}</p>
                      <p><strong>Recipient:</strong> {formData.recipientName}</p>
                      <p><strong>Type:</strong> {formData.certificateType}</p>
                      <p><strong>Course:</strong> {formData.courseName}</p>
                    </div>
                  </div>
                  
                  <button
                    onClick={generateCertificate}
                    disabled={isGenerating}
                    className="bg-purple-600 text-white px-8 py-3 rounded-lg hover:bg-purple-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2 mx-auto"
                  >
                    <Award className="h-5 w-5" />
                    <span>{isGenerating ? 'Generating...' : 'Generate Certificate'}</span>
                  </button>
                </div>
              ) : (
                <div>
                  <div className="flex justify-between items-center mb-4">
                    <h3 className="text-lg font-medium text-gray-900">Generated Certificate</h3>
                    <div className="flex space-x-3">
                      <button
                        onClick={printCertificate}
                        className="flex items-center space-x-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                      >
                        <Eye className="h-4 w-4" />
                        <span>Print</span>
                      </button>
                      <button
                        onClick={downloadCertificate}
                        className="flex items-center space-x-2 bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700 transition-colors"
                      >
                        <Download className="h-4 w-4" />
                        <span>Download</span>
                      </button>
                    </div>
                  </div>
                  
                  <div className="border border-gray-300 rounded-lg p-4 bg-white max-h-96 overflow-y-auto">
                    <div dangerouslySetInnerHTML={{ __html: generatedDocument }} />
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Navigation Buttons */}
          <div className="flex justify-between mt-8 pt-6 border-t border-gray-200">
            <button
              onClick={prevStep}
              disabled={currentStep === 1}
              className="flex items-center space-x-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <ArrowLeft className="h-4 w-4" />
              <span>Previous</span>
            </button>
            
            {currentStep < 4 && (
              <button
                onClick={nextStep}
                className="flex items-center space-x-2 bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700 transition-colors"
              >
                <span>Next</span>
                <ArrowLeft className="h-4 w-4 rotate-180" />
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default CertificatesGenerator;