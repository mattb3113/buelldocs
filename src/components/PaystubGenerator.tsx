import React, { useState } from 'react';
import { ArrowLeft, Building2, User, Calendar, DollarSign, FileText, Download, Eye } from 'lucide-react';

interface User {
  id: string;
  primaryEmail: string;
  displayName: string;
}

interface PaystubGeneratorProps {
  user: User;
  onBack: () => void;
  onLogout: () => void;
  onNavigateToBankStatement: (paystubData: any) => void;
}

interface PaystubData {
  // Company Information
  companyName: string;
  companyAddress: string;
  companyCity: string;
  companyState: string;
  companyZip: string;
  companyPhone: string;
  companyEIN: string;
  
  // Employee Information
  employeeName: string;
  employeeAddress: string;
  employeeCity: string;
  employeeState: string;
  employeeZip: string;
  employeeSSN: string;
  employeeId: string;
  
  // Pay Period Information
  payPeriodStart: string;
  payPeriodEnd: string;
  payDate: string;
  payFrequency: string;
  
  // Earnings
  regularHours: number;
  regularRate: number;
  overtimeHours: number;
  overtimeRate: number;
  
  // Calculated values
  regularPay: number;
  overtimePay: number;
  grossPay: number;
  federalTax: number;
  stateTax: number;
  socialSecurityTax: number;
  medicareTax: number;
  totalDeductions: number;
  netPay: number;
}

export default function PaystubGenerator({ user, onBack, onLogout, onNavigateToBankStatement }: PaystubGeneratorProps) {
  const [currentStep, setCurrentStep] = useState(1);
  const [paystubData, setPaystubData] = useState<PaystubData>({
    companyName: '',
    companyAddress: '',
    companyCity: '',
    companyState: '',
    companyZip: '',
    companyPhone: '',
    companyEIN: '',
    employeeName: user.displayName || '',
    employeeAddress: '',
    employeeCity: '',
    employeeState: '',
    employeeZip: '',
    employeeSSN: '',
    employeeId: '',
    payPeriodStart: '',
    payPeriodEnd: '',
    payDate: '',
    payFrequency: 'bi-weekly',
    regularHours: 80,
    regularRate: 25,
    overtimeHours: 0,
    overtimeRate: 37.5,
    regularPay: 0,
    overtimePay: 0,
    grossPay: 0,
    federalTax: 0,
    stateTax: 0,
    socialSecurityTax: 0,
    medicareTax: 0,
    totalDeductions: 0,
    netPay: 0
  });

  const [generatedPaystub, setGeneratedPaystub] = useState<string | null>(null);

  const calculatePaystub = () => {
    const regularPay = paystubData.regularHours * paystubData.regularRate;
    const overtimePay = paystubData.overtimeHours * paystubData.overtimeRate;
    const grossPay = regularPay + overtimePay;
    
    // Tax calculations (simplified)
    const federalTax = grossPay * 0.12;
    const stateTax = grossPay * 0.05;
    const socialSecurityTax = grossPay * 0.062;
    const medicareTax = grossPay * 0.0145;
    const totalDeductions = federalTax + stateTax + socialSecurityTax + medicareTax;
    const netPay = grossPay - totalDeductions;

    return {
      ...paystubData,
      regularPay,
      overtimePay,
      grossPay,
      federalTax,
      stateTax,
      socialSecurityTax,
      medicareTax,
      totalDeductions,
      netPay
    };
  };

  const handleInputChange = (field: keyof PaystubData, value: string | number) => {
    setPaystubData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleNext = () => {
    if (currentStep < 5) {
      setCurrentStep(currentStep + 1);
    }
  };

  const handlePrevious = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const generatePaystub = () => {
    const calculatedData = calculatePaystub();
    
    const paystubHTML = `
      <!DOCTYPE html>
      <html>
        <head>
          <title>Paystub</title>
          <style>
            body { font-family: Arial, sans-serif; margin: 20px; }
            .header { text-align: center; margin-bottom: 30px; }
            .company-info { margin-bottom: 20px; }
            .employee-info { margin-bottom: 20px; }
            .pay-info { display: flex; justify-content: space-between; margin-bottom: 20px; }
            .earnings, .deductions { width: 48%; }
            table { width: 100%; border-collapse: collapse; }
            th, td { border: 1px solid #ddd; padding: 8px; text-align: left; }
            th { background-color: #f2f2f2; }
            .totals { margin-top: 20px; font-weight: bold; }
            .disclaimer { margin-top: 30px; font-size: 12px; color: #666; }
          </style>
        </head>
        <body>
          <div class="header">
            <h1>PAYSTUB</h1>
          </div>
          
          <div class="company-info">
            <h3>${calculatedData.companyName}</h3>
            <p>${calculatedData.companyAddress}<br>
            ${calculatedData.companyCity}, ${calculatedData.companyState} ${calculatedData.companyZip}<br>
            Phone: ${calculatedData.companyPhone}<br>
            EIN: ${calculatedData.companyEIN}</p>
          </div>
          
          <div class="employee-info">
            <h3>Employee Information</h3>
            <p><strong>Name:</strong> ${calculatedData.employeeName}<br>
            <strong>Employee ID:</strong> ${calculatedData.employeeId}<br>
            <strong>SSN:</strong> ***-**-${calculatedData.employeeSSN.slice(-4)}</p>
          </div>
          
          <div class="pay-info">
            <div>
              <p><strong>Pay Period:</strong> ${calculatedData.payPeriodStart} - ${calculatedData.payPeriodEnd}</p>
              <p><strong>Pay Date:</strong> ${calculatedData.payDate}</p>
              <p><strong>Pay Frequency:</strong> ${calculatedData.payFrequency}</p>
            </div>
          </div>
          
          <div style="display: flex; justify-content: space-between;">
            <div class="earnings">
              <h3>Earnings</h3>
              <table>
                <tr><th>Description</th><th>Hours</th><th>Rate</th><th>Amount</th></tr>
                <tr><td>Regular Pay</td><td>${calculatedData.regularHours}</td><td>$${calculatedData.regularRate.toFixed(2)}</td><td>$${calculatedData.regularPay.toFixed(2)}</td></tr>
                ${calculatedData.overtimeHours > 0 ? `<tr><td>Overtime Pay</td><td>${calculatedData.overtimeHours}</td><td>$${calculatedData.overtimeRate.toFixed(2)}</td><td>$${calculatedData.overtimePay.toFixed(2)}</td></tr>` : ''}
                <tr><td><strong>Gross Pay</strong></td><td></td><td></td><td><strong>$${calculatedData.grossPay.toFixed(2)}</strong></td></tr>
              </table>
            </div>
            
            <div class="deductions">
              <h3>Deductions</h3>
              <table>
                <tr><th>Description</th><th>Amount</th></tr>
                <tr><td>Federal Tax</td><td>$${calculatedData.federalTax.toFixed(2)}</td></tr>
                <tr><td>State Tax</td><td>$${calculatedData.stateTax.toFixed(2)}</td></tr>
                <tr><td>Social Security</td><td>$${calculatedData.socialSecurityTax.toFixed(2)}</td></tr>
                <tr><td>Medicare</td><td>$${calculatedData.medicareTax.toFixed(2)}</td></tr>
                <tr><td><strong>Total Deductions</strong></td><td><strong>$${calculatedData.totalDeductions.toFixed(2)}</strong></td></tr>
              </table>
            </div>
          </div>
          
          <div class="totals">
            <p>Net Pay: $${calculatedData.netPay.toFixed(2)}</p>
          </div>
          
          <div class="disclaimer">
            <p><strong>IMPORTANT NOTICE:</strong> This document is for novelty and educational purposes only. Not intended for fraudulent use or misrepresentation.</p>
            <p>Generated on: ${new Date().toLocaleDateString()}</p>
          </div>
        </body>
      </html>
    `;
    
    setGeneratedPaystub(paystubHTML);
    setCurrentStep(5);
  };

  const downloadPaystub = () => {
    if (generatedPaystub) {
      const blob = new Blob([generatedPaystub], { type: 'text/html' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `paystub-${paystubData.employeeName.replace(/\s+/g, '-')}-${paystubData.payDate}.html`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    }
  };

  const previewPaystub = () => {
    if (generatedPaystub) {
      const newWindow = window.open();
      if (newWindow) {
        newWindow.document.write(generatedPaystub);
        newWindow.document.close();
      }
    }
  };

  const renderStep = () => {
    switch (currentStep) {
      case 1:
        return (
          <div className="space-y-6">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">Company Information</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Company Name</label>
                <input
                  type="text"
                  value={paystubData.companyName}
                  onChange={(e) => handleInputChange('companyName', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Enter company name"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Company Phone</label>
                <input
                  type="text"
                  value={paystubData.companyPhone}
                  onChange={(e) => handleInputChange('companyPhone', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="(555) 123-4567"
                />
              </div>
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-2">Company Address</label>
                <input
                  type="text"
                  value={paystubData.companyAddress}
                  onChange={(e) => handleInputChange('companyAddress', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="123 Business St"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">City</label>
                <input
                  type="text"
                  value={paystubData.companyCity}
                  onChange={(e) => handleInputChange('companyCity', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="City"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">State</label>
                <input
                  type="text"
                  value={paystubData.companyState}
                  onChange={(e) => handleInputChange('companyState', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="State"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">ZIP Code</label>
                <input
                  type="text"
                  value={paystubData.companyZip}
                  onChange={(e) => handleInputChange('companyZip', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="12345"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">EIN</label>
                <input
                  type="text"
                  value={paystubData.companyEIN}
                  onChange={(e) => handleInputChange('companyEIN', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="12-3456789"
                />
              </div>
            </div>
          </div>
        );

      case 2:
        return (
          <div className="space-y-6">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">Employee Information</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Employee Name</label>
                <input
                  type="text"
                  value={paystubData.employeeName}
                  onChange={(e) => handleInputChange('employeeName', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="John Doe"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Employee ID</label>
                <input
                  type="text"
                  value={paystubData.employeeId}
                  onChange={(e) => handleInputChange('employeeId', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="EMP001"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">SSN (Last 4 digits)</label>
                <input
                  type="text"
                  value={paystubData.employeeSSN}
                  onChange={(e) => handleInputChange('employeeSSN', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="1234"
                  maxLength={4}
                />
              </div>
            </div>
          </div>
        );

      case 3:
        return (
          <div className="space-y-6">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">Pay Period Information</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Pay Period Start</label>
                <input
                  type="date"
                  value={paystubData.payPeriodStart}
                  onChange={(e) => handleInputChange('payPeriodStart', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Pay Period End</label>
                <input
                  type="date"
                  value={paystubData.payPeriodEnd}
                  onChange={(e) => handleInputChange('payPeriodEnd', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Pay Date</label>
                <input
                  type="date"
                  value={paystubData.payDate}
                  onChange={(e) => handleInputChange('payDate', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Pay Frequency</label>
                <select
                  value={paystubData.payFrequency}
                  onChange={(e) => handleInputChange('payFrequency', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="weekly">Weekly</option>
                  <option value="bi-weekly">Bi-weekly</option>
                  <option value="semi-monthly">Semi-monthly</option>
                  <option value="monthly">Monthly</option>
                </select>
              </div>
            </div>
          </div>
        );

      case 4:
        return (
          <div className="space-y-6">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">Earnings Information</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Regular Hours</label>
                <input
                  type="number"
                  value={paystubData.regularHours}
                  onChange={(e) => handleInputChange('regularHours', parseFloat(e.target.value) || 0)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="80"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Regular Rate ($)</label>
                <input
                  type="number"
                  step="0.01"
                  value={paystubData.regularRate}
                  onChange={(e) => handleInputChange('regularRate', parseFloat(e.target.value) || 0)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="25.00"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Overtime Hours</label>
                <input
                  type="number"
                  value={paystubData.overtimeHours}
                  onChange={(e) => handleInputChange('overtimeHours', parseFloat(e.target.value) || 0)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="0"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Overtime Rate ($)</label>
                <input
                  type="number"
                  step="0.01"
                  value={paystubData.overtimeRate}
                  onChange={(e) => handleInputChange('overtimeRate', parseFloat(e.target.value) || 0)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="37.50"
                />
              </div>
            </div>
            
            <div className="bg-gray-50 p-4 rounded-lg">
              <h3 className="text-lg font-semibold mb-4">Calculated Earnings</h3>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>Regular Pay: ${(paystubData.regularHours * paystubData.regularRate).toFixed(2)}</div>
                <div>Overtime Pay: ${(paystubData.overtimeHours * paystubData.overtimeRate).toFixed(2)}</div>
                <div className="font-bold">Gross Pay: ${((paystubData.regularHours * paystubData.regularRate) + (paystubData.overtimeHours * paystubData.overtimeRate)).toFixed(2)}</div>
              </div>
            </div>
          </div>
        );

      case 5:
        return (
          <div className="space-y-6">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">Generated Paystub</h2>
            {generatedPaystub ? (
              <div className="space-y-4">
                <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                  <p className="text-green-800">✅ Paystub generated successfully!</p>
                </div>
                
                <div className="flex space-x-4">
                  <button
                    onClick={previewPaystub}
                    className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                  >
                    <Eye className="w-4 h-4 mr-2" />
                    Preview
                  </button>
                  <button
                    onClick={downloadPaystub}
                    className="flex items-center px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                  >
                    <Download className="w-4 h-4 mr-2" />
                    Download
                  </button>
                  <button
                    onClick={() => onNavigateToBankStatement(calculatePaystub())}
                    className="flex items-center px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
                  >
                    <FileText className="w-4 h-4 mr-2" />
                    Create Bank Statement
                  </button>
                </div>
              </div>
            ) : (
              <div className="text-center">
                <button
                  onClick={generatePaystub}
                  className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  Generate Paystub
                </button>
              </div>
            )}
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center">
              <button
                onClick={onBack}
                className="flex items-center text-gray-600 hover:text-gray-900 mr-4"
              >
                <ArrowLeft className="w-5 h-5 mr-2" />
                Back to Dashboard
              </button>
              <h1 className="text-2xl font-bold text-gray-900">Paystub Generator</h1>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Progress Steps */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            {[1, 2, 3, 4, 5].map((step) => (
              <div key={step} className="flex items-center">
                <div
                  className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                    step <= currentStep
                      ? 'bg-blue-600 text-white'
                      : 'bg-gray-200 text-gray-600'
                  }`}
                >
                  {step}
                </div>
                {step < 5 && (
                  <div
                    className={`w-16 h-1 mx-2 ${
                      step < currentStep ? 'bg-blue-600' : 'bg-gray-200'
                    }`}
                  />
                )}
              </div>
            ))}
          </div>
          <div className="flex justify-between mt-2 text-xs text-gray-500">
            <span>Company</span>
            <span>Employee</span>
            <span>Pay Period</span>
            <span>Earnings</span>
            <span>Generate</span>
          </div>
        </div>

        {/* Step Content */}
        <div className="bg-white rounded-lg shadow-sm p-6">
          {renderStep()}
          
          {/* Navigation Buttons */}
          <div className="flex justify-between mt-8">
            <button
              onClick={handlePrevious}
              disabled={currentStep === 1}
              className="px-4 py-2 text-gray-600 bg-gray-100 rounded-lg hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Previous
            </button>
            {currentStep < 4 && (
              <button
                onClick={handleNext}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
              >
                Next
              </button>
            )}
            {currentStep === 4 && (
              <button
                onClick={generatePaystub}
                className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
              >
                Generate Paystub
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}