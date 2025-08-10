import React, { useState } from 'react';
import { ArrowLeft, FileText, Download, Eye, LogOut } from 'lucide-react';

interface User {
  id: string;
  name: string;
  email: string;
  avatar: string;
}

interface W2GeneratorProps {
  user: User;
  onBack: () => void;
  onLogout: () => void;
}

interface W2Data {
  // Employee Information
  employeeName: string;
  employeeAddress: string;
  employeeCity: string;
  employeeState: string;
  employeeZip: string;
  employeeSSN: string;
  
  // Employer Information
  employerName: string;
  employerAddress: string;
  employerCity: string;
  employerState: string;
  employerZip: string;
  employerEIN: string;
  
  // Tax Year and Wages
  taxYear: number;
  wages: number;
  federalTaxWithheld: number;
  socialSecurityWages: number;
  socialSecurityTaxWithheld: number;
  medicareWages: number;
  medicareTaxWithheld: number;
  stateTaxWithheld: number;
  stateWages: number;
}

const W2Generator: React.FC<W2GeneratorProps> = ({ user, onBack, onLogout }) => {
  const [currentStep, setCurrentStep] = useState(1);
  const [formData, setFormData] = useState<W2Data>({
    employeeName: '',
    employeeAddress: '',
    employeeCity: '',
    employeeState: '',
    employeeZip: '',
    employeeSSN: '',
    employerName: '',
    employerAddress: '',
    employerCity: '',
    employerState: '',
    employerZip: '',
    employerEIN: '',
    taxYear: new Date().getFullYear() - 1,
    wages: 0,
    federalTaxWithheld: 0,
    socialSecurityWages: 0,
    socialSecurityTaxWithheld: 0,
    medicareWages: 0,
    medicareTaxWithheld: 0,
    stateTaxWithheld: 0,
    stateWages: 0
  });
  const [generatedDocument, setGeneratedDocument] = useState<string | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);

  const handleInputChange = (field: keyof W2Data, value: string | number) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const validateStep = (step: number): boolean => {
    switch (step) {
      case 1:
        return !!(formData.employeeName && formData.employeeAddress && 
                 formData.employeeCity && formData.employeeState && 
                 formData.employeeZip && formData.employeeSSN);
      case 2:
        return !!(formData.employerName && formData.employerAddress && 
                 formData.employerCity && formData.employerState && 
                 formData.employerZip && formData.employerEIN);
      case 3:
        return !!(formData.taxYear && formData.wages > 0);
      default:
        return true;
    }
  };

  const nextStep = () => {
    if (validateStep(currentStep)) {
      setCurrentStep(prev => Math.min(prev + 1, 4));
    } else {
      alert('Please fill in all required fields before continuing.');
    }
  };

  const prevStep = () => {
    setCurrentStep(prev => Math.max(prev - 1, 1));
  };

  const calculateTaxes = () => {
    const wages = formData.wages;
    
    // Auto-calculate if not provided
    const federalTax = formData.federalTaxWithheld || wages * 0.12;
    const socialSecurityWages = formData.socialSecurityWages || wages;
    const socialSecurityTax = formData.socialSecurityTaxWithheld || Math.min(wages * 0.062, 9932.40); // 2024 limit
    const medicareWages = formData.medicareWages || wages;
    const medicareTax = formData.medicareTaxWithheld || wages * 0.0145;
    const stateTax = formData.stateTaxWithheld || wages * 0.05;
    const stateWages = formData.stateWages || wages;
    
    return {
      federalTax,
      socialSecurityWages,
      socialSecurityTax,
      medicareWages,
      medicareTax,
      stateTax,
      stateWages
    };
  };

  const generateW2 = async () => {
    setIsGenerating(true);
    
    try {
      const taxes = calculateTaxes();
      
      const w2HTML = `
        <div style="font-family: 'Courier New', monospace; max-width: 800px; margin: 0 auto; padding: 20px; border: 2px solid #000; background: white;">
          <div style="text-align: center; margin-bottom: 20px; border-bottom: 2px solid #000; padding-bottom: 10px;">
            <h1 style="margin: 0; font-size: 18px; font-weight: bold;">Form W-2 Wage and Tax Statement</h1>
            <p style="margin: 5px 0; font-size: 12px;">Copy B—To Be Filed With Employee's FEDERAL Tax Return</p>
            <p style="margin: 0; font-size: 12px;">This information is being furnished to the Internal Revenue Service</p>
          </div>
          
          <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 20px; margin-bottom: 20px;">
            <div style="border: 1px solid #000; padding: 10px;">
              <div style="border-bottom: 1px solid #000; padding-bottom: 5px; margin-bottom: 10px;">
                <strong style="font-size: 10px;">a Employee's social security number</strong>
                <div style="font-size: 14px; margin-top: 2px;">${formData.employeeSSN}</div>
              </div>
              <div>
                <strong style="font-size: 10px;">b Employer identification number (EIN)</strong>
                <div style="font-size: 14px; margin-top: 2px;">${formData.employerEIN}</div>
              </div>
            </div>
            
            <div style="border: 1px solid #000; padding: 10px;">
              <strong style="font-size: 10px;">c Employer's name, address, and ZIP code</strong>
              <div style="font-size: 12px; margin-top: 5px; line-height: 1.3;">
                ${formData.employerName}<br>
                ${formData.employerAddress}<br>
                ${formData.employerCity}, ${formData.employerState} ${formData.employerZip}
              </div>
            </div>
          </div>
          
          <div style="border: 1px solid #000; padding: 10px; margin-bottom: 20px;">
            <strong style="font-size: 10px;">d Control number</strong>
            <div style="font-size: 14px; margin-top: 2px;">${Date.now().toString().slice(-8)}</div>
          </div>
          
          <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 20px; margin-bottom: 20px;">
            <div style="border: 1px solid #000; padding: 10px;">
              <strong style="font-size: 10px;">e Employee's first name and initial</strong>
              <div style="font-size: 14px; margin-top: 2px;">${formData.employeeName.split(' ')[0]} ${formData.employeeName.split(' ')[1]?.[0] || ''}</div>
              <div style="margin-top: 10px;">
                <strong style="font-size: 10px;">Last name</strong>
                <div style="font-size: 14px; margin-top: 2px;">${formData.employeeName.split(' ').slice(-1)[0]}</div>
              </div>
            </div>
            
            <div style="border: 1px solid #000; padding: 10px;">
              <strong style="font-size: 10px;">f Employee's address and ZIP code</strong>
              <div style="font-size: 12px; margin-top: 5px; line-height: 1.3;">
                ${formData.employeeAddress}<br>
                ${formData.employeeCity}, ${formData.employeeState} ${formData.employeeZip}
              </div>
            </div>
          </div>
          
          <div style="display: grid; grid-template-columns: repeat(4, 1fr); gap: 1px; border: 2px solid #000;">
            <div style="border: 1px solid #000; padding: 8px; background: #f5f5f5;">
              <div style="font-size: 10px; font-weight: bold;">1 Wages, tips, other compensation</div>
              <div style="font-size: 14px; margin-top: 5px;">$${formData.wages.toFixed(2)}</div>
            </div>
            
            <div style="border: 1px solid #000; padding: 8px; background: #f5f5f5;">
              <div style="font-size: 10px; font-weight: bold;">2 Federal income tax withheld</div>
              <div style="font-size: 14px; margin-top: 5px;">$${taxes.federalTax.toFixed(2)}</div>
            </div>
            
            <div style="border: 1px solid #000; padding: 8px; background: #f5f5f5;">
              <div style="font-size: 10px; font-weight: bold;">3 Social security wages</div>
              <div style="font-size: 14px; margin-top: 5px;">$${taxes.socialSecurityWages.toFixed(2)}</div>
            </div>
            
            <div style="border: 1px solid #000; padding: 8px; background: #f5f5f5;">
              <div style="font-size: 10px; font-weight: bold;">4 Social security tax withheld</div>
              <div style="font-size: 14px; margin-top: 5px;">$${taxes.socialSecurityTax.toFixed(2)}</div>
            </div>
            
            <div style="border: 1px solid #000; padding: 8px; background: #f5f5f5;">
              <div style="font-size: 10px; font-weight: bold;">5 Medicare wages and tips</div>
              <div style="font-size: 14px; margin-top: 5px;">$${taxes.medicareWages.toFixed(2)}</div>
            </div>
            
            <div style="border: 1px solid #000; padding: 8px; background: #f5f5f5;">
              <div style="font-size: 10px; font-weight: bold;">6 Medicare tax withheld</div>
              <div style="font-size: 14px; margin-top: 5px;">$${taxes.medicareTax.toFixed(2)}</div>
            </div>
            
            <div style="border: 1px solid #000; padding: 8px; background: #f5f5f5;">
              <div style="font-size: 10px; font-weight: bold;">7 Social security tips</div>
              <div style="font-size: 14px; margin-top: 5px;">$0.00</div>
            </div>
            
            <div style="border: 1px solid #000; padding: 8px; background: #f5f5f5;">
              <div style="font-size: 10px; font-weight: bold;">8 Allocated tips</div>
              <div style="font-size: 14px; margin-top: 5px;">$0.00</div>
            </div>
            
            <div style="border: 1px solid #000; padding: 8px; background: #f5f5f5;">
              <div style="font-size: 10px; font-weight: bold;">9</div>
              <div style="font-size: 14px; margin-top: 5px;"></div>
            </div>
            
            <div style="border: 1px solid #000; padding: 8px; background: #f5f5f5;">
              <div style="font-size: 10px; font-weight: bold;">10 Dependent care benefits</div>
              <div style="font-size: 14px; margin-top: 5px;">$0.00</div>
            </div>
            
            <div style="border: 1px solid #000; padding: 8px; background: #f5f5f5;">
              <div style="font-size: 10px; font-weight: bold;">11 Nonqualified plans</div>
              <div style="font-size: 14px; margin-top: 5px;">$0.00</div>
            </div>
            
            <div style="border: 1px solid #000; padding: 8px; background: #f5f5f5;">
              <div style="font-size: 10px; font-weight: bold;">12a See instructions for box 12</div>
              <div style="font-size: 14px; margin-top: 5px;"></div>
            </div>
          </div>
          
          <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 1px; border: 2px solid #000; border-top: none;">
            <div style="border: 1px solid #000; padding: 8px; background: #f5f5f5;">
              <div style="font-size: 10px; font-weight: bold;">13 Statutory employee</div>
              <div style="margin-top: 5px;">
                <input type="checkbox" disabled> Retirement plan
              </div>
              <div style="margin-top: 2px;">
                <input type="checkbox" disabled> Third-party sick pay
              </div>
            </div>
            
            <div style="border: 1px solid #000; padding: 8px; background: #f5f5f5;">
              <div style="font-size: 10px; font-weight: bold;">14 Other</div>
              <div style="font-size: 14px; margin-top: 5px;"></div>
            </div>
          </div>
          
          <div style="display: grid; grid-template-columns: repeat(3, 1fr); gap: 1px; border: 2px solid #000; border-top: none;">
            <div style="border: 1px solid #000; padding: 8px; background: #f5f5f5;">
              <div style="font-size: 10px; font-weight: bold;">15 State</div>
              <div style="font-size: 14px; margin-top: 5px;">${formData.employeeState}</div>
            </div>
            
            <div style="border: 1px solid #000; padding: 8px; background: #f5f5f5;">
              <div style="font-size: 10px; font-weight: bold;">16 State wages, tips, etc.</div>
              <div style="font-size: 14px; margin-top: 5px;">$${taxes.stateWages.toFixed(2)}</div>
            </div>
            
            <div style="border: 1px solid #000; padding: 8px; background: #f5f5f5;">
              <div style="font-size: 10px; font-weight: bold;">17 State income tax</div>
              <div style="font-size: 14px; margin-top: 5px;">$${taxes.stateTax.toFixed(2)}</div>
            </div>
            
            <div style="border: 1px solid #000; padding: 8px; background: #f5f5f5;">
              <div style="font-size: 10px; font-weight: bold;">18 Local wages, tips, etc.</div>
              <div style="font-size: 14px; margin-top: 5px;">$${taxes.stateWages.toFixed(2)}</div>
            </div>
            
            <div style="border: 1px solid #000; padding: 8px; background: #f5f5f5;">
              <div style="font-size: 10px; font-weight: bold;">19 Local income tax</div>
              <div style="font-size: 14px; margin-top: 5px;">$0.00</div>
            </div>
            
            <div style="border: 1px solid #000; padding: 8px; background: #f5f5f5;">
              <div style="font-size: 10px; font-weight: bold;">20 Locality name</div>
              <div style="font-size: 14px; margin-top: 5px;"></div>
            </div>
          </div>
          
          <div style="margin-top: 20px; padding: 15px; background-color: #fff3cd; border: 2px solid #ffeaa7; border-radius: 5px;">
            <p style="margin: 0; font-size: 12px; color: #856404; text-align: center;">
              <strong>NOTICE:</strong> This document is for novelty and educational purposes only. 
              Not intended for fraudulent use or misrepresentation. Tax Year: ${formData.taxYear}
            </p>
          </div>
        </div>
      `;
      
      setGeneratedDocument(w2HTML);
      
      // Save to user's document history
      const savedDocuments = localStorage.getItem('buelldocs_documents');
      const documents = savedDocuments ? JSON.parse(savedDocuments) : [];
      
      const newDocument = {
        id: Date.now().toString(),
        type: 'w2',
        name: `W-2 Form - ${formData.employeeName} (${formData.taxYear})`,
        createdAt: new Date().toISOString(),
        status: 'completed'
      };
      
      documents.unshift(newDocument);
      localStorage.setItem('buelldocs_documents', JSON.stringify(documents));
      
      setCurrentStep(4);
    } catch (error) {
      console.error('Error generating W-2:', error);
      alert('An error occurred while generating the W-2 form. Please try again.');
    } finally {
      setIsGenerating(false);
    }
  };

  const downloadW2 = () => {
    if (!generatedDocument) return;
    
    const blob = new Blob([generatedDocument], { type: 'text/html' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `w2-${formData.employeeName.replace(/\s+/g, '-').toLowerCase()}-${formData.taxYear}.html`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const printW2 = () => {
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
                <FileText className="h-6 w-6 text-green-600" />
                <span className="text-lg font-semibold text-gray-900">W-2 Generator</span>
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
            <h1 className="text-2xl font-bold text-gray-900">Generate W-2 Form</h1>
            <div className="text-sm text-gray-600">Step {currentStep} of 4</div>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div 
              className="bg-green-600 h-2 rounded-full transition-all duration-300"
              style={{ width: `${(currentStep / 4) * 100}%` }}
            ></div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm p-6">
          {/* Step 1: Employee Information */}
          {currentStep === 1 && (
            <div>
              <h2 className="text-xl font-semibold text-gray-900 mb-6">Employee Information</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Full Name *
                  </label>
                  <input
                    type="text"
                    value={formData.employeeName}
                    onChange={(e) => handleInputChange('employeeName', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                    placeholder="John Doe"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Social Security Number *
                  </label>
                  <input
                    type="text"
                    value={formData.employeeSSN}
                    onChange={(e) => handleInputChange('employeeSSN', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                    placeholder="123-45-6789"
                  />
                </div>
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Address *
                  </label>
                  <input
                    type="text"
                    value={formData.employeeAddress}
                    onChange={(e) => handleInputChange('employeeAddress', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                    placeholder="123 Main Street"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    City *
                  </label>
                  <input
                    type="text"
                    value={formData.employeeCity}
                    onChange={(e) => handleInputChange('employeeCity', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                    placeholder="Chicago"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    State *
                  </label>
                  <input
                    type="text"
                    value={formData.employeeState}
                    onChange={(e) => handleInputChange('employeeState', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                    placeholder="IL"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    ZIP Code *
                  </label>
                  <input
                    type="text"
                    value={formData.employeeZip}
                    onChange={(e) => handleInputChange('employeeZip', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                    placeholder="60601"
                  />
                </div>
              </div>
            </div>
          )}

          {/* Step 2: Employer Information */}
          {currentStep === 2 && (
            <div>
              <h2 className="text-xl font-semibold text-gray-900 mb-6">Employer Information</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Company Name *
                  </label>
                  <input
                    type="text"
                    value={formData.employerName}
                    onChange={(e) => handleInputChange('employerName', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                    placeholder="Acme Corporation"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Employer ID Number (EIN) *
                  </label>
                  <input
                    type="text"
                    value={formData.employerEIN}
                    onChange={(e) => handleInputChange('employerEIN', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                    placeholder="12-3456789"
                  />
                </div>
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Company Address *
                  </label>
                  <input
                    type="text"
                    value={formData.employerAddress}
                    onChange={(e) => handleInputChange('employerAddress', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                    placeholder="456 Business Ave"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    City *
                  </label>
                  <input
                    type="text"
                    value={formData.employerCity}
                    onChange={(e) => handleInputChange('employerCity', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                    placeholder="Chicago"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    State *
                  </label>
                  <input
                    type="text"
                    value={formData.employerState}
                    onChange={(e) => handleInputChange('employerState', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                    placeholder="IL"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    ZIP Code *
                  </label>
                  <input
                    type="text"
                    value={formData.employerZip}
                    onChange={(e) => handleInputChange('employerZip', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                    placeholder="60601"
                  />
                </div>
              </div>
            </div>
          )}

          {/* Step 3: Tax Information */}
          {currentStep === 3 && (
            <div>
              <h2 className="text-xl font-semibold text-gray-900 mb-6">Tax Information</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Tax Year *
                  </label>
                  <input
                    type="number"
                    value={formData.taxYear}
                    onChange={(e) => handleInputChange('taxYear', parseInt(e.target.value) || 0)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                    placeholder="2024"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Total Wages *
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    value={formData.wages}
                    onChange={(e) => handleInputChange('wages', parseFloat(e.target.value) || 0)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                    placeholder="50000.00"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Federal Tax Withheld (optional)
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    value={formData.federalTaxWithheld}
                    onChange={(e) => handleInputChange('federalTaxWithheld', parseFloat(e.target.value) || 0)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                    placeholder="Auto-calculated if left blank"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    State Tax Withheld (optional)
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    value={formData.stateTaxWithheld}
                    onChange={(e) => handleInputChange('stateTaxWithheld', parseFloat(e.target.value) || 0)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                    placeholder="Auto-calculated if left blank"
                  />
                </div>
              </div>
              
              <div className="mt-6 p-4 bg-blue-50 rounded-lg">
                <h3 className="text-sm font-medium text-blue-900 mb-2">Auto-Calculation Notice</h3>
                <p className="text-sm text-blue-700">
                  Social Security, Medicare, and other tax fields will be automatically calculated based on current tax rates. 
                  You can override these by expanding the advanced options.
                </p>
              </div>
            </div>
          )}

          {/* Step 4: Preview and Generate */}
          {currentStep === 4 && (
            <div>
              <h2 className="text-xl font-semibold text-gray-900 mb-6">Preview & Generate</h2>
              
              {!generatedDocument ? (
                <div className="text-center py-8">
                  <div className="bg-green-50 rounded-lg p-6 mb-6">
                    <h3 className="text-lg font-medium text-green-900 mb-2">Ready to Generate</h3>
                    <p className="text-green-700 mb-4">
                      Review your information and click generate to create your W-2 form.
                    </p>
                    <div className="text-sm text-green-600 space-y-1">
                      <p><strong>Employee:</strong> {formData.employeeName}</p>
                      <p><strong>Employer:</strong> {formData.employerName}</p>
                      <p><strong>Tax Year:</strong> {formData.taxYear}</p>
                      <p><strong>Total Wages:</strong> ${formData.wages.toFixed(2)}</p>
                    </div>
                  </div>
                  
                  <button
                    onClick={generateW2}
                    disabled={isGenerating}
                    className="bg-green-600 text-white px-8 py-3 rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2 mx-auto"
                  >
                    <FileText className="h-5 w-5" />
                    <span>{isGenerating ? 'Generating...' : 'Generate W-2 Form'}</span>
                  </button>
                </div>
              ) : (
                <div>
                  <div className="flex justify-between items-center mb-4">
                    <h3 className="text-lg font-medium text-gray-900">Generated W-2 Form</h3>
                    <div className="flex space-x-3">
                      <button
                        onClick={printW2}
                        className="flex items-center space-x-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                      >
                        <Eye className="h-4 w-4" />
                        <span>Print</span>
                      </button>
                      <button
                        onClick={downloadW2}
                        className="flex items-center space-x-2 bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors"
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
                className="flex items-center space-x-2 bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors"
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

export default W2Generator;