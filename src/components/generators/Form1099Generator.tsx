import React, { useState } from 'react';
import { ArrowLeft, FileText, Download, Eye, LogOut } from 'lucide-react';

interface User {
  id: string;
  name: string;
  email: string;
  avatar: string;
}

interface Form1099GeneratorProps {
  user: User;
  onBack: () => void;
  onLogout: () => void;
}

interface Form1099Data {
  // Form Type
  formType: string;
  
  // Payer Information
  payerName: string;
  payerAddress: string;
  payerCity: string;
  payerState: string;
  payerZip: string;
  payerPhone: string;
  payerEIN: string;
  
  // Recipient Information
  recipientName: string;
  recipientAddress: string;
  recipientCity: string;
  recipientState: string;
  recipientZip: string;
  recipientSSN: string;
  recipientAccountNumber: string;
  
  // Form Data (varies by form type)
  nonemployeeCompensation: number;
  federalTaxWithheld: number;
  stateTaxWithheld: number;
  
  // 1099-INT specific
  interestIncome: number;
  earlyWithdrawalPenalty: number;
  
  // 1099-DIV specific
  ordinaryDividends: number;
  qualifiedDividends: number;
  
  // 1099-MISC specific
  rents: number;
  royalties: number;
  otherIncome: number;
  medicalPayments: number;
  
  // Tax Year
  taxYear: number;
}

const Form1099Generator: React.FC<Form1099GeneratorProps> = ({ user, onBack, onLogout }) => {
  const [currentStep, setCurrentStep] = useState(1);
  const [formData, setFormData] = useState<Form1099Data>({
    formType: '1099-NEC',
    payerName: '',
    payerAddress: '',
    payerCity: '',
    payerState: '',
    payerZip: '',
    payerPhone: '',
    payerEIN: '',
    recipientName: '',
    recipientAddress: '',
    recipientCity: '',
    recipientState: '',
    recipientZip: '',
    recipientSSN: '',
    recipientAccountNumber: '',
    nonemployeeCompensation: 0,
    federalTaxWithheld: 0,
    stateTaxWithheld: 0,
    interestIncome: 0,
    earlyWithdrawalPenalty: 0,
    ordinaryDividends: 0,
    qualifiedDividends: 0,
    rents: 0,
    royalties: 0,
    otherIncome: 0,
    medicalPayments: 0,
    taxYear: new Date().getFullYear() - 1
  });
  const [generatedDocument, setGeneratedDocument] = useState<string | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);

  const handleInputChange = (field: keyof Form1099Data, value: string | number) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const validateStep = (step: number): boolean => {
    switch (step) {
      case 1:
        return !!(formData.payerName && formData.payerAddress && 
                 formData.payerCity && formData.payerState && 
                 formData.payerZip && formData.payerEIN);
      case 2:
        return !!(formData.recipientName && formData.recipientAddress && 
                 formData.recipientCity && formData.recipientState && 
                 formData.recipientZip && formData.recipientSSN);
      case 3:
        return !!(formData.taxYear);
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

  const generate1099 = async () => {
    setIsGenerating(true);
    
    try {
      const form1099HTML = `
        <div style="font-family: 'Courier New', monospace; max-width: 800px; margin: 0 auto; padding: 20px; border: 2px solid #000; background: white;">
          <div style="text-align: center; margin-bottom: 20px; border-bottom: 2px solid #000; padding-bottom: 10px;">
            <h1 style="margin: 0; font-size: 18px; font-weight: bold;">Form ${formData.formType}</h1>
            <p style="margin: 5px 0; font-size: 12px;">
              ${formData.formType === '1099-NEC' ? 'Nonemployee Compensation' :
                formData.formType === '1099-INT' ? 'Interest Income' :
                formData.formType === '1099-DIV' ? 'Dividends and Distributions' :
                'Miscellaneous Income'}
            </p>
            <p style="margin: 0; font-size: 12px;">Copy B For Recipient</p>
          </div>
          
          <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 20px; margin-bottom: 20px;">
            <div style="border: 1px solid #000; padding: 10px;">
              <div style="border-bottom: 1px solid #000; padding-bottom: 5px; margin-bottom: 10px;">
                <strong style="font-size: 10px;">PAYER'S name, street address, city or town, state or province, country, ZIP or foreign postal code, and telephone no.</strong>
                <div style="font-size: 12px; margin-top: 5px; line-height: 1.3;">
                  ${formData.payerName}<br>
                  ${formData.payerAddress}<br>
                  ${formData.payerCity}, ${formData.payerState} ${formData.payerZip}<br>
                  ${formData.payerPhone}
                </div>
              </div>
              <div>
                <strong style="font-size: 10px;">PAYER'S federal identification number</strong>
                <div style="font-size: 14px; margin-top: 2px;">${formData.payerEIN}</div>
              </div>
            </div>
            
            <div style="border: 1px solid #000; padding: 10px;">
              <strong style="font-size: 10px;">RECIPIENT'S identification number</strong>
              <div style="font-size: 14px; margin-top: 2px;">${formData.recipientSSN}</div>
              <div style="margin-top: 10px;">
                <strong style="font-size: 10px;">RECIPIENT'S name</strong>
                <div style="font-size: 12px; margin-top: 2px;">${formData.recipientName}</div>
              </div>
              <div style="margin-top: 10px;">
                <strong style="font-size: 10px;">Street address (including apt. no.)</strong>
                <div style="font-size: 12px; margin-top: 2px;">${formData.recipientAddress}</div>
              </div>
              <div style="margin-top: 10px;">
                <strong style="font-size: 10px;">City or town, state or province, country, ZIP or foreign postal code</strong>
                <div style="font-size: 12px; margin-top: 2px;">${formData.recipientCity}, ${formData.recipientState} ${formData.recipientZip}</div>
              </div>
            </div>
          </div>
          
          <div style="display: grid; grid-template-columns: repeat(4, 1fr); gap: 1px; border: 2px solid #000;">
            ${formData.formType === '1099-NEC' ? `
              <div style="border: 1px solid #000; padding: 8px; background: #f5f5f5;">
                <div style="font-size: 10px; font-weight: bold;">1 Nonemployee compensation</div>
                <div style="font-size: 14px; margin-top: 5px;">$${formData.nonemployeeCompensation.toFixed(2)}</div>
              </div>
              <div style="border: 1px solid #000; padding: 8px; background: #f5f5f5;">
                <div style="font-size: 10px; font-weight: bold;">4 Federal income tax withheld</div>
                <div style="font-size: 14px; margin-top: 5px;">$${formData.federalTaxWithheld.toFixed(2)}</div>
              </div>
            ` : formData.formType === '1099-INT' ? `
              <div style="border: 1px solid #000; padding: 8px; background: #f5f5f5;">
                <div style="font-size: 10px; font-weight: bold;">1 Interest income</div>
                <div style="font-size: 14px; margin-top: 5px;">$${formData.interestIncome.toFixed(2)}</div>
              </div>
              <div style="border: 1px solid #000; padding: 8px; background: #f5f5f5;">
                <div style="font-size: 10px; font-weight: bold;">2 Early withdrawal penalty</div>
                <div style="font-size: 14px; margin-top: 5px;">$${formData.earlyWithdrawalPenalty.toFixed(2)}</div>
              </div>
              <div style="border: 1px solid #000; padding: 8px; background: #f5f5f5;">
                <div style="font-size: 10px; font-weight: bold;">4 Federal income tax withheld</div>
                <div style="font-size: 14px; margin-top: 5px;">$${formData.federalTaxWithheld.toFixed(2)}</div>
              </div>
            ` : formData.formType === '1099-DIV' ? `
              <div style="border: 1px solid #000; padding: 8px; background: #f5f5f5;">
                <div style="font-size: 10px; font-weight: bold;">1a Ordinary dividends</div>
                <div style="font-size: 14px; margin-top: 5px;">$${formData.ordinaryDividends.toFixed(2)}</div>
              </div>
              <div style="border: 1px solid #000; padding: 8px; background: #f5f5f5;">
                <div style="font-size: 10px; font-weight: bold;">1b Qualified dividends</div>
                <div style="font-size: 14px; margin-top: 5px;">$${formData.qualifiedDividends.toFixed(2)}</div>
              </div>
              <div style="border: 1px solid #000; padding: 8px; background: #f5f5f5;">
                <div style="font-size: 10px; font-weight: bold;">4 Federal income tax withheld</div>
                <div style="font-size: 14px; margin-top: 5px;">$${formData.federalTaxWithheld.toFixed(2)}</div>
              </div>
            ` : `
              <div style="border: 1px solid #000; padding: 8px; background: #f5f5f5;">
                <div style="font-size: 10px; font-weight: bold;">1 Rents</div>
                <div style="font-size: 14px; margin-top: 5px;">$${formData.rents.toFixed(2)}</div>
              </div>
              <div style="border: 1px solid #000; padding: 8px; background: #f5f5f5;">
                <div style="font-size: 10px; font-weight: bold;">2 Royalties</div>
                <div style="font-size: 14px; margin-top: 5px;">$${formData.royalties.toFixed(2)}</div>
              </div>
              <div style="border: 1px solid #000; padding: 8px; background: #f5f5f5;">
                <div style="font-size: 10px; font-weight: bold;">3 Other income</div>
                <div style="font-size: 14px; margin-top: 5px;">$${formData.otherIncome.toFixed(2)}</div>
              </div>
              <div style="border: 1px solid #000; padding: 8px; background: #f5f5f5;">
                <div style="font-size: 10px; font-weight: bold;">4 Federal income tax withheld</div>
                <div style="font-size: 14px; margin-top: 5px;">$${formData.federalTaxWithheld.toFixed(2)}</div>
              </div>
            `}
          </div>
          
          <div style="margin-top: 20px; padding: 15px; background-color: #fff3cd; border: 2px solid #ffeaa7; border-radius: 5px;">
            <p style="margin: 0; font-size: 12px; color: #856404; text-align: center;">
              <strong>NOTICE:</strong> This document is for novelty and educational purposes only. 
              Not intended for fraudulent use or misrepresentation. Tax Year: ${formData.taxYear}
            </p>
          </div>
        </div>
      `;
      
      setGeneratedDocument(form1099HTML);
      
      // Save to user's document history
      const savedDocuments = localStorage.getItem('buelldocs_documents');
      const documents = savedDocuments ? JSON.parse(savedDocuments) : [];
      
      const newDocument = {
        id: Date.now().toString(),
        type: '1099',
        name: `Form ${formData.formType} - ${formData.recipientName} (${formData.taxYear})`,
        createdAt: new Date().toISOString(),
        status: 'completed',
        category: 'financial'
      };
      
      documents.unshift(newDocument);
      localStorage.setItem('buelldocs_documents', JSON.stringify(documents));
      
      setCurrentStep(4);
    } catch (error) {
      console.error('Error generating 1099:', error);
      alert('An error occurred while generating the 1099 form. Please try again.');
    } finally {
      setIsGenerating(false);
    }
  };

  const download1099 = () => {
    if (!generatedDocument) return;
    
    const blob = new Blob([generatedDocument], { type: 'text/html' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `1099-${formData.formType}-${formData.recipientName.replace(/\s+/g, '-').toLowerCase()}-${formData.taxYear}.html`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const print1099 = () => {
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
                <FileText className="h-6 w-6 text-orange-600" />
                <span className="text-lg font-semibold text-gray-900">1099 Form Generator</span>
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
            <h1 className="text-2xl font-bold text-gray-900">Generate 1099 Form</h1>
            <div className="text-sm text-gray-600">Step {currentStep} of 4</div>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div 
              className="bg-orange-600 h-2 rounded-full transition-all duration-300"
              style={{ width: `${(currentStep / 4) * 100}%` }}
            ></div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm p-6">
          {/* Step 1: Form Type & Payer Information */}
          {currentStep === 1 && (
            <div>
              <h2 className="text-xl font-semibold text-gray-900 mb-6">Form Type & Payer Information</h2>
              
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Form Type *
                </label>
                <select
                  value={formData.formType}
                  onChange={(e) => handleInputChange('formType', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                >
                  <option value="1099-NEC">1099-NEC (Nonemployee Compensation)</option>
                  <option value="1099-INT">1099-INT (Interest Income)</option>
                  <option value="1099-DIV">1099-DIV (Dividends and Distributions)</option>
                  <option value="1099-MISC">1099-MISC (Miscellaneous Income)</option>
                </select>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Payer Name *
                  </label>
                  <input
                    type="text"
                    value={formData.payerName}
                    onChange={(e) => handleInputChange('payerName', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                    placeholder="ABC Corporation"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Payer EIN *
                  </label>
                  <input
                    type="text"
                    value={formData.payerEIN}
                    onChange={(e) => handleInputChange('payerEIN', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                    placeholder="12-3456789"
                  />
                </div>
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Payer Address *
                  </label>
                  <input
                    type="text"
                    value={formData.payerAddress}
                    onChange={(e) => handleInputChange('payerAddress', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                    placeholder="123 Business Street"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    City *
                  </label>
                  <input
                    type="text"
                    value={formData.payerCity}
                    onChange={(e) => handleInputChange('payerCity', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                    placeholder="New York"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    State *
                  </label>
                  <input
                    type="text"
                    value={formData.payerState}
                    onChange={(e) => handleInputChange('payerState', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                    placeholder="NY"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    ZIP Code *
                  </label>
                  <input
                    type="text"
                    value={formData.payerZip}
                    onChange={(e) => handleInputChange('payerZip', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                    placeholder="10001"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Phone Number
                  </label>
                  <input
                    type="text"
                    value={formData.payerPhone}
                    onChange={(e) => handleInputChange('payerPhone', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                    placeholder="(555) 123-4567"
                  />
                </div>
              </div>
            </div>
          )}

          {/* Step 2: Recipient Information */}
          {currentStep === 2 && (
            <div>
              <h2 className="text-xl font-semibold text-gray-900 mb-6">Recipient Information</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Recipient Name *
                  </label>
                  <input
                    type="text"
                    value={formData.recipientName}
                    onChange={(e) => handleInputChange('recipientName', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                    placeholder="John Doe"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Recipient SSN/TIN *
                  </label>
                  <input
                    type="text"
                    value={formData.recipientSSN}
                    onChange={(e) => handleInputChange('recipientSSN', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                    placeholder="123-45-6789"
                  />
                </div>
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Recipient Address *
                  </label>
                  <input
                    type="text"
                    value={formData.recipientAddress}
                    onChange={(e) => handleInputChange('recipientAddress', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                    placeholder="456 Main Street"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    City *
                  </label>
                  <input
                    type="text"
                    value={formData.recipientCity}
                    onChange={(e) => handleInputChange('recipientCity', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                    placeholder="Chicago"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    State *
                  </label>
                  <input
                    type="text"
                    value={formData.recipientState}
                    onChange={(e) => handleInputChange('recipientState', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                    placeholder="IL"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    ZIP Code *
                  </label>
                  <input
                    type="text"
                    value={formData.recipientZip}
                    onChange={(e) => handleInputChange('recipientZip', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                    placeholder="60601"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Account Number (Optional)
                  </label>
                  <input
                    type="text"
                    value={formData.recipientAccountNumber}
                    onChange={(e) => handleInputChange('recipientAccountNumber', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                    placeholder="Account number if applicable"
                  />
                </div>
              </div>
            </div>
          )}

          {/* Step 3: Income Information */}
          {currentStep === 3 && (
            <div>
              <h2 className="text-xl font-semibold text-gray-900 mb-6">Income Information</h2>
              
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Tax Year *
                </label>
                <input
                  type="number"
                  value={formData.taxYear}
                  onChange={(e) => handleInputChange('taxYear', parseInt(e.target.value) || 0)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                  placeholder="2024"
                />
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {formData.formType === '1099-NEC' && (
                  <>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Nonemployee Compensation
                      </label>
                      <input
                        type="number"
                        step="0.01"
                        value={formData.nonemployeeCompensation}
                        onChange={(e) => handleInputChange('nonemployeeCompensation', parseFloat(e.target.value) || 0)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                        placeholder="5000.00"
                      />
                    </div>
                  </>
                )}
                
                {formData.formType === '1099-INT' && (
                  <>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Interest Income
                      </label>
                      <input
                        type="number"
                        step="0.01"
                        value={formData.interestIncome}
                        onChange={(e) => handleInputChange('interestIncome', parseFloat(e.target.value) || 0)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                        placeholder="150.00"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Early Withdrawal Penalty
                      </label>
                      <input
                        type="number"
                        step="0.01"
                        value={formData.earlyWithdrawalPenalty}
                        onChange={(e) => handleInputChange('earlyWithdrawalPenalty', parseFloat(e.target.value) || 0)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                        placeholder="0.00"
                      />
                    </div>
                  </>
                )}
                
                {formData.formType === '1099-DIV' && (
                  <>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Ordinary Dividends
                      </label>
                      <input
                        type="number"
                        step="0.01"
                        value={formData.ordinaryDividends}
                        onChange={(e) => handleInputChange('ordinaryDividends', parseFloat(e.target.value) || 0)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                        placeholder="250.00"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Qualified Dividends
                      </label>
                      <input
                        type="number"
                        step="0.01"
                        value={formData.qualifiedDividends}
                        onChange={(e) => handleInputChange('qualifiedDividends', parseFloat(e.target.value) || 0)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                        placeholder="200.00"
                      />
                    </div>
                  </>
                )}
                
                {formData.formType === '1099-MISC' && (
                  <>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Rents
                      </label>
                      <input
                        type="number"
                        step="0.01"
                        value={formData.rents}
                        onChange={(e) => handleInputChange('rents', parseFloat(e.target.value) || 0)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                        placeholder="0.00"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Royalties
                      </label>
                      <input
                        type="number"
                        step="0.01"
                        value={formData.royalties}
                        onChange={(e) => handleInputChange('royalties', parseFloat(e.target.value) || 0)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                        placeholder="0.00"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Other Income
                      </label>
                      <input
                        type="number"
                        step="0.01"
                        value={formData.otherIncome}
                        onChange={(e) => handleInputChange('otherIncome', parseFloat(e.target.value) || 0)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                        placeholder="0.00"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Medical Payments
                      </label>
                      <input
                        type="number"
                        step="0.01"
                        value={formData.medicalPayments}
                        onChange={(e) => handleInputChange('medicalPayments', parseFloat(e.target.value) || 0)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                        placeholder="0.00"
                      />
                    </div>
                  </>
                )}
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Federal Tax Withheld
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    value={formData.federalTaxWithheld}
                    onChange={(e) => handleInputChange('federalTaxWithheld', parseFloat(e.target.value) || 0)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                    placeholder="0.00"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    State Tax Withheld
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    value={formData.stateTaxWithheld}
                    onChange={(e) => handleInputChange('stateTaxWithheld', parseFloat(e.target.value) || 0)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                    placeholder="0.00"
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
                  <div className="bg-orange-50 rounded-lg p-6 mb-6">
                    <h3 className="text-lg font-medium text-orange-900 mb-2">Ready to Generate</h3>
                    <p className="text-orange-700 mb-4">
                      Review your information and click generate to create your 1099 form.
                    </p>
                    <div className="text-sm text-orange-600 space-y-1">
                      <p><strong>Form Type:</strong> {formData.formType}</p>
                      <p><strong>Payer:</strong> {formData.payerName}</p>
                      <p><strong>Recipient:</strong> {formData.recipientName}</p>
                      <p><strong>Tax Year:</strong> {formData.taxYear}</p>
                    </div>
                  </div>
                  
                  <button
                    onClick={generate1099}
                    disabled={isGenerating}
                    className="bg-orange-600 text-white px-8 py-3 rounded-lg hover:bg-orange-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2 mx-auto"
                  >
                    <FileText className="h-5 w-5" />
                    <span>{isGenerating ? 'Generating...' : 'Generate 1099 Form'}</span>
                  </button>
                </div>
              ) : (
                <div>
                  <div className="flex justify-between items-center mb-4">
                    <h3 className="text-lg font-medium text-gray-900">Generated 1099 Form</h3>
                    <div className="flex space-x-3">
                      <button
                        onClick={print1099}
                        className="flex items-center space-x-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                      >
                        <Eye className="h-4 w-4" />
                        <span>Print</span>
                      </button>
                      <button
                        onClick={download1099}
                        className="flex items-center space-x-2 bg-orange-600 text-white px-4 py-2 rounded-lg hover:bg-orange-700 transition-colors"
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
                className="flex items-center space-x-2 bg-orange-600 text-white px-4 py-2 rounded-lg hover:bg-orange-700 transition-colors"
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

export default Form1099Generator;