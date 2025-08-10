import React, { useState } from 'react';
import { ArrowLeft, FileText, Download, Eye, LogOut, Briefcase } from 'lucide-react';

interface User {
  id: string;
  name: string;
  email: string;
  avatar: string;
}

interface EmploymentVerificationGeneratorProps {
  user: User;
  onBack: () => void;
  onLogout: () => void;
}

interface EmploymentVerificationData {
  // Company Information
  companyName: string;
  companyAddress: string;
  companyCity: string;
  companyState: string;
  companyZip: string;
  companyPhone: string;
  companyWebsite: string;
  
  // Employee Information
  employeeName: string;
  employeeAddress: string;
  employeeCity: string;
  employeeState: string;
  employeeZip: string;
  employeeSSN: string;
  employeeId: string;
  
  // Verification Information
  verificationDate: string;
  verificationPurpose: string;
  recipientName: string;
  recipientTitle: string;
  recipientCompany: string;
  recipientAddress: string;
  
  // Employment Information
  employmentStatus: string;
  hireDate: string;
  terminationDate: string;
  employmentType: string;
  jobTitle: string;
  department: string;
  supervisorName: string;
  supervisorTitle: string;
  supervisorPhone: string;
  supervisorEmail: string;
  
  // Compensation Information
  currentSalary: number;
  salaryFrequency: string;
  hoursPerWeek: number;
  eligibleForRehire: boolean;
  
  // Verifier Information
  verifierName: string;
  verifierTitle: string;
  hrRepresentativeName: string;
  hrRepresentativeTitle: string;
}

const EmploymentVerificationGenerator: React.FC<EmploymentVerificationGeneratorProps> = ({ user, onBack, onLogout }) => {
  const [currentStep, setCurrentStep] = useState(1);
  const [formData, setFormData] = useState<EmploymentVerificationData>({
    companyName: '',
    companyAddress: '',
    companyCity: '',
    companyState: '',
    companyZip: '',
    companyPhone: '',
    companyWebsite: '',
    employeeName: '',
    employeeAddress: '',
    employeeCity: '',
    employeeState: '',
    employeeZip: '',
    employeeSSN: '',
    employeeId: '',
    verificationDate: new Date().toISOString().split('T')[0],
    verificationPurpose: '',
    recipientName: '',
    recipientTitle: '',
    recipientCompany: '',
    recipientAddress: '',
    employmentStatus: 'Current',
    hireDate: '',
    terminationDate: '',
    employmentType: 'Full-time',
    jobTitle: '',
    department: '',
    supervisorName: '',
    supervisorTitle: '',
    supervisorPhone: '',
    supervisorEmail: '',
    currentSalary: 0,
    salaryFrequency: 'Annual',
    hoursPerWeek: 40,
    eligibleForRehire: true,
    verifierName: '',
    verifierTitle: '',
    hrRepresentativeName: '',
    hrRepresentativeTitle: ''
  });
  const [generatedDocument, setGeneratedDocument] = useState<string | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);

  const handleInputChange = (field: keyof EmploymentVerificationData, value: string | number | boolean) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const validateStep = (step: number): boolean => {
    switch (step) {
      case 1:
        return !!(formData.companyName && formData.companyAddress && 
                 formData.companyCity && formData.companyState && 
                 formData.companyZip);
      case 2:
        return !!(formData.employeeName && formData.jobTitle && 
                 formData.hireDate && formData.employmentStatus);
      case 3:
        return !!(formData.verifierName && formData.verifierTitle);
      default:
        return true;
    }
  };

  const nextStep = () => {
    if (validateStep(currentStep)) {
      if (currentStep === 3) {
        generateVerification();
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

  const generateVerification = async () => {
    setIsGenerating(true);
    
    try {
      const verificationHTML = `
        <div style="font-family: Arial, sans-serif; max-width: 800px; margin: 0 auto; padding: 40px; background: white; border: 1px solid #ddd;">
          <!-- Company Header -->
          <div style="text-align: center; margin-bottom: 40px; border-bottom: 3px solid #0066CC; padding-bottom: 20px;">
            <h1 style="margin: 0; font-size: 28px; color: #0066CC; font-weight: bold;">${formData.companyName}</h1>
            <div style="font-size: 14px; color: #666; margin-top: 10px; line-height: 1.4;">
              ${formData.companyAddress}<br>
              ${formData.companyCity}, ${formData.companyState} ${formData.companyZip}<br>
              Phone: ${formData.companyPhone}
              ${formData.companyWebsite ? `<br>Website: ${formData.companyWebsite}` : ''}
            </div>
          </div>
          
          <!-- Letter Header -->
          <div style="margin-bottom: 30px;">
            <div style="text-align: right; margin-bottom: 20px;">
              <p style="margin: 0; font-size: 14px; color: #666;">Date: ${new Date(formData.verificationDate).toLocaleDateString('en-US', { 
                month: 'long', 
                day: 'numeric', 
                year: 'numeric' 
              })}</p>
            </div>
            
            ${formData.recipientName ? `
              <div style="margin-bottom: 20px;">
                <p style="margin: 0; font-size: 14px; line-height: 1.4;">
                  ${formData.recipientName}<br>
                  ${formData.recipientTitle ? `${formData.recipientTitle}<br>` : ''}
                  ${formData.recipientCompany ? `${formData.recipientCompany}<br>` : ''}
                  ${formData.recipientAddress ? `${formData.recipientAddress}` : ''}
                </p>
              </div>
            ` : ''}
            
            <h2 style="margin: 0; font-size: 18px; color: #0066CC; font-weight: bold;">EMPLOYMENT VERIFICATION LETTER</h2>
          </div>
          
          <!-- Letter Content -->
          <div style="margin-bottom: 30px; line-height: 1.6;">
            <p style="margin-bottom: 20px; font-size: 14px;">
              To Whom It May Concern:
            </p>
            
            <p style="margin-bottom: 20px; font-size: 14px;">
              This letter serves to verify the employment of <strong>${formData.employeeName}</strong> 
              ${formData.verificationPurpose ? `for the purpose of ${formData.verificationPurpose.toLowerCase()}` : ''}.
            </p>
            
            <div style="background-color: #f8f9fa; padding: 20px; border-radius: 8px; margin: 20px 0;">
              <h3 style="margin-top: 0; color: #0066CC; font-size: 16px;">Employee Information</h3>
              <table style="width: 100%; border-collapse: collapse;">
                <tr>
                  <td style="padding: 8px 0; font-weight: bold; width: 200px;">Employee Name:</td>
                  <td style="padding: 8px 0;">${formData.employeeName}</td>
                </tr>
                ${formData.employeeId ? `
                  <tr>
                    <td style="padding: 8px 0; font-weight: bold;">Employee ID:</td>
                    <td style="padding: 8px 0;">${formData.employeeId}</td>
                  </tr>
                ` : ''}
                <tr>
                  <td style="padding: 8px 0; font-weight: bold;">Job Title:</td>
                  <td style="padding: 8px 0;">${formData.jobTitle}</td>
                </tr>
                ${formData.department ? `
                  <tr>
                    <td style="padding: 8px 0; font-weight: bold;">Department:</td>
                    <td style="padding: 8px 0;">${formData.department}</td>
                  </tr>
                ` : ''}
                <tr>
                  <td style="padding: 8px 0; font-weight: bold;">Employment Status:</td>
                  <td style="padding: 8px 0;">${formData.employmentStatus}</td>
                </tr>
                <tr>
                  <td style="padding: 8px 0; font-weight: bold;">Employment Type:</td>
                  <td style="padding: 8px 0;">${formData.employmentType}</td>
                </tr>
                <tr>
                  <td style="padding: 8px 0; font-weight: bold;">Hire Date:</td>
                  <td style="padding: 8px 0;">${new Date(formData.hireDate).toLocaleDateString('en-US', { 
                    month: 'long', 
                    day: 'numeric', 
                    year: 'numeric' 
                  })}</td>
                </tr>
                ${formData.terminationDate && formData.employmentStatus === 'Former' ? `
                  <tr>
                    <td style="padding: 8px 0; font-weight: bold;">Termination Date:</td>
                    <td style="padding: 8px 0;">${new Date(formData.terminationDate).toLocaleDateString('en-US', { 
                      month: 'long', 
                      day: 'numeric', 
                      year: 'numeric' 
                    })}</td>
                  </tr>
                ` : ''}
                ${formData.currentSalary > 0 ? `
                  <tr>
                    <td style="padding: 8px 0; font-weight: bold;">Salary:</td>
                    <td style="padding: 8px 0;">$${formData.currentSalary.toLocaleString()} ${formData.salaryFrequency.toLowerCase()}</td>
                  </tr>
                ` : ''}
                <tr>
                  <td style="padding: 8px 0; font-weight: bold;">Hours per Week:</td>
                  <td style="padding: 8px 0;">${formData.hoursPerWeek}</td>
                </tr>
                ${formData.supervisorName ? `
                  <tr>
                    <td style="padding: 8px 0; font-weight: bold;">Supervisor:</td>
                    <td style="padding: 8px 0;">${formData.supervisorName}, ${formData.supervisorTitle}</td>
                  </tr>
                ` : ''}
                <tr>
                  <td style="padding: 8px 0; font-weight: bold;">Eligible for Rehire:</td>
                  <td style="padding: 8px 0;">${formData.eligibleForRehire ? 'Yes' : 'No'}</td>
                </tr>
              </table>
            </div>
            
            <p style="margin-bottom: 20px; font-size: 14px;">
              This information is accurate as of the date of this letter. If you have any questions 
              regarding this verification, please contact our Human Resources department.
            </p>
            
            <p style="margin-bottom: 40px; font-size: 14px;">
              Sincerely,
            </p>
          </div>
          
          <!-- Signatures -->
          <div style="margin-bottom: 40px;">
            <div style="display: flex; justify-content: space-between;">
              <div style="width: 300px;">
                <div style="border-bottom: 2px solid #000; margin-bottom: 10px; height: 40px;"></div>
                <div style="font-size: 14px; font-weight: bold;">
                  ${formData.verifierName}
                </div>
                <div style="font-size: 12px; color: #666;">
                  ${formData.verifierTitle}
                </div>
                <div style="font-size: 12px; color: #666;">
                  ${formData.companyName}
                </div>
              </div>
              
              ${formData.hrRepresentativeName ? `
                <div style="width: 300px;">
                  <div style="border-bottom: 2px solid #000; margin-bottom: 10px; height: 40px;"></div>
                  <div style="font-size: 14px; font-weight: bold;">
                    ${formData.hrRepresentativeName}
                  </div>
                  <div style="font-size: 12px; color: #666;">
                    ${formData.hrRepresentativeTitle}
                  </div>
                  <div style="font-size: 12px; color: #666;">
                    Human Resources Department
                  </div>
                </div>
              ` : ''}
            </div>
          </div>
          
          <!-- Contact Information -->
          <div style="background-color: #f8f9fa; padding: 15px; border-radius: 8px; margin-bottom: 20px;">
            <h4 style="margin-top: 0; color: #0066CC;">Contact Information</h4>
            <p style="margin: 5px 0; font-size: 12px;">
              For verification inquiries, please contact:
            </p>
            <p style="margin: 5px 0; font-size: 12px;">
              <strong>Phone:</strong> ${formData.companyPhone}<br>
              ${formData.supervisorEmail ? `<strong>Email:</strong> ${formData.supervisorEmail}<br>` : ''}
              <strong>Address:</strong> ${formData.companyAddress}, ${formData.companyCity}, ${formData.companyState} ${formData.companyZip}
            </p>
          </div>
          
          <!-- Legal Notice -->
          <div style="margin-top: 30px; padding: 15px; background-color: #fff3cd; border: 2px solid #ffc107; border-radius: 5px;">
            <p style="margin: 0; font-size: 11px; color: #856404; text-align: center;">
              <strong>NOTICE:</strong> This document is for novelty and educational purposes only. 
              Not intended for fraudulent use or misrepresentation. Generated on ${new Date().toLocaleDateString()}.
            </p>
          </div>
        </div>
      `;
      
      setGeneratedDocument(verificationHTML);
      
      // Save to user's document history
      const savedDocuments = localStorage.getItem('buelldocs_documents');
      const documents = savedDocuments ? JSON.parse(savedDocuments) : [];
      
      const newDocument = {
        id: Date.now().toString(),
        type: 'employmentVerification',
        name: `Employment Verification - ${formData.employeeName}`,
        createdAt: new Date().toISOString(),
        status: 'completed',
        category: 'employment'
      };
      
      documents.unshift(newDocument);
      localStorage.setItem('buelldocs_documents', JSON.stringify(documents));
      
      setCurrentStep(4);
    } catch (error) {
      console.error('Error generating employment verification:', error);
      alert('An error occurred while generating the employment verification. Please try again.');
    } finally {
      setIsGenerating(false);
    }
  };

  const downloadVerification = () => {
    if (!generatedDocument) return;
    
    const blob = new Blob([generatedDocument], { type: 'text/html' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `employment-verification-${formData.employeeName.replace(/\s+/g, '-').toLowerCase()}.html`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const printVerification = () => {
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
                <Briefcase className="h-6 w-6 text-blue-600" />
                <span className="text-lg font-semibold text-gray-900">Employment Verification Generator</span>
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
            <h1 className="text-2xl font-bold text-gray-900">Generate Employment Verification</h1>
            <div className="text-sm text-gray-600">Step {currentStep} of 4</div>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div 
              className="bg-blue-600 h-2 rounded-full transition-all duration-300"
              style={{ width: `${(currentStep / 4) * 100}%` }}
            ></div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm p-6">
          {/* Step 1: Company Information */}
          {currentStep === 1 && (
            <div>
              <h2 className="text-xl font-semibold text-gray-900 mb-6">Company Information</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Company Name *
                  </label>
                  <input
                    type="text"
                    value={formData.companyName}
                    onChange={(e) => handleInputChange('companyName', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="ABC Corporation"
                  />
                </div>
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Company Address *
                  </label>
                  <input
                    type="text"
                    value={formData.companyAddress}
                    onChange={(e) => handleInputChange('companyAddress', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="123 Business Street"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    City *
                  </label>
                  <input
                    type="text"
                    value={formData.companyCity}
                    onChange={(e) => handleInputChange('companyCity', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="New York"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    State *
                  </label>
                  <input
                    type="text"
                    value={formData.companyState}
                    onChange={(e) => handleInputChange('companyState', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="NY"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    ZIP Code *
                  </label>
                  <input
                    type="text"
                    value={formData.companyZip}
                    onChange={(e) => handleInputChange('companyZip', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="10001"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Phone Number
                  </label>
                  <input
                    type="text"
                    value={formData.companyPhone}
                    onChange={(e) => handleInputChange('companyPhone', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="(555) 123-4567"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Website
                  </label>
                  <input
                    type="text"
                    value={formData.companyWebsite}
                    onChange={(e) => handleInputChange('companyWebsite', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="www.company.com"
                  />
                </div>
              </div>
            </div>
          )}

          {/* Step 2: Employee & Employment Information */}
          {currentStep === 2 && (
            <div>
              <h2 className="text-xl font-semibold text-gray-900 mb-6">Employee & Employment Information</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Employee Name *
                  </label>
                  <input
                    type="text"
                    value={formData.employeeName}
                    onChange={(e) => handleInputChange('employeeName', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="John Doe"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Employee ID
                  </label>
                  <input
                    type="text"
                    value={formData.employeeId}
                    onChange={(e) => handleInputChange('employeeId', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="EMP001"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Job Title *
                  </label>
                  <input
                    type="text"
                    value={formData.jobTitle}
                    onChange={(e) => handleInputChange('jobTitle', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="Software Engineer"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Department
                  </label>
                  <input
                    type="text"
                    value={formData.department}
                    onChange={(e) => handleInputChange('department', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="Information Technology"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Employment Status *
                  </label>
                  <select
                    value={formData.employmentStatus}
                    onChange={(e) => handleInputChange('employmentStatus', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  >
                    <option value="Current">Current Employee</option>
                    <option value="Former">Former Employee</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Employment Type *
                  </label>
                  <select
                    value={formData.employmentType}
                    onChange={(e) => handleInputChange('employmentType', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  >
                    <option value="Full-time">Full-time</option>
                    <option value="Part-time">Part-time</option>
                    <option value="Contract">Contract</option>
                    <option value="Temporary">Temporary</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Hire Date *
                  </label>
                  <input
                    type="date"
                    value={formData.hireDate}
                    onChange={(e) => handleInputChange('hireDate', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
                {formData.employmentStatus === 'Former' && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Termination Date
                    </label>
                    <input
                      type="date"
                      value={formData.terminationDate}
                      onChange={(e) => handleInputChange('terminationDate', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>
                )}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Current Salary (Optional)
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    value={formData.currentSalary}
                    onChange={(e) => handleInputChange('currentSalary', parseFloat(e.target.value) || 0)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="75000"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Salary Frequency
                  </label>
                  <select
                    value={formData.salaryFrequency}
                    onChange={(e) => handleInputChange('salaryFrequency', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  >
                    <option value="Annual">Annual</option>
                    <option value="Monthly">Monthly</option>
                    <option value="Hourly">Hourly</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Hours per Week
                  </label>
                  <input
                    type="number"
                    value={formData.hoursPerWeek}
                    onChange={(e) => handleInputChange('hoursPerWeek', parseFloat(e.target.value) || 0)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="40"
                  />
                </div>
                <div className="md:col-span-2">
                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      checked={formData.eligibleForRehire}
                      onChange={(e) => handleInputChange('eligibleForRehire', e.target.checked)}
                      className="mr-2"
                    />
                    <span className="text-sm font-medium text-gray-700">Eligible for Rehire</span>
                  </label>
                </div>
              </div>
            </div>
          )}

          {/* Step 3: Verification Details */}
          {currentStep === 3 && (
            <div>
              <h2 className="text-xl font-semibold text-gray-900 mb-6">Verification Details</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Verification Purpose
                  </label>
                  <input
                    type="text"
                    value={formData.verificationPurpose}
                    onChange={(e) => handleInputChange('verificationPurpose', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="Loan application, background check, etc."
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Recipient Name
                  </label>
                  <input
                    type="text"
                    value={formData.recipientName}
                    onChange={(e) => handleInputChange('recipientName', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="Loan Officer Name"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Verifier Name *
                  </label>
                  <input
                    type="text"
                    value={formData.verifierName}
                    onChange={(e) => handleInputChange('verifierName', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="Jane Smith"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Verifier Title *
                  </label>
                  <input
                    type="text"
                    value={formData.verifierTitle}
                    onChange={(e) => handleInputChange('verifierTitle', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="HR Manager"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    HR Representative Name
                  </label>
                  <input
                    type="text"
                    value={formData.hrRepresentativeName}
                    onChange={(e) => handleInputChange('hrRepresentativeName', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="HR Representative"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    HR Representative Title
                  </label>
                  <input
                    type="text"
                    value={formData.hrRepresentativeTitle}
                    onChange={(e) => handleInputChange('hrRepresentativeTitle', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="HR Director"
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
                  <div className="bg-blue-50 rounded-lg p-6 mb-6">
                    <h3 className="text-lg font-medium text-blue-900 mb-2">Ready to Generate</h3>
                    <p className="text-blue-700 mb-4">
                      Review your information and click generate to create your employment verification.
                    </p>
                    <div className="text-sm text-blue-600 space-y-1">
                      <p><strong>Company:</strong> {formData.companyName}</p>
                      <p><strong>Employee:</strong> {formData.employeeName}</p>
                      <p><strong>Position:</strong> {formData.jobTitle}</p>
                      <p><strong>Status:</strong> {formData.employmentStatus}</p>
                    </div>
                  </div>
                  
                  <button
                    onClick={generateVerification}
                    disabled={isGenerating}
                    className="bg-blue-600 text-white px-8 py-3 rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2 mx-auto"
                  >
                    <Briefcase className="h-5 w-5" />
                    <span>{isGenerating ? 'Generating...' : 'Generate Verification'}</span>
                  </button>
                </div>
              ) : (
                <div>
                  <div className="flex justify-between items-center mb-4">
                    <h3 className="text-lg font-medium text-gray-900">Generated Employment Verification</h3>
                    <div className="flex space-x-3">
                      <button
                        onClick={printVerification}
                        className="flex items-center space-x-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                      >
                        <Eye className="h-4 w-4" />
                        <span>Print</span>
                      </button>
                      <button
                        onClick={downloadVerification}
                        className="flex items-center space-x-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
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
                className="flex items-center space-x-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
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

export default EmploymentVerificationGenerator;