import React, { useState } from 'react';
import { documentsAPI, downloadFile } from '../utils/api';

interface EmployeeInfo {
  name: string;
  address: string;
  city: string;
  state: string;
  zipCode: string;
  ssn: string;
}

interface EmployerInfo {
  companyName: string;
  address: string;
  city: string;
  state: string;
  zipCode: string;
  ein: string;
}

interface PayInfo {
  payPeriodStart: string;
  payPeriodEnd: string;
  payDate: string;
  grossPay: number;
  federalTax: number;
  stateTax: number;
  socialSecurity: number;
  medicare: number;
  otherDeductions: number;
  hoursWorked: number;
  hourlyRate: number;
}

interface FormData {
  employee: EmployeeInfo;
  employer: EmployerInfo;
  payInfo: PayInfo;
}

const PaystubGenerator: React.FC = () => {
  const [currentStep, setCurrentStep] = useState(1);
  const [isGenerating, setIsGenerating] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  
  const [formData, setFormData] = useState<FormData>({
    employee: {
      name: '',
      address: '',
      city: '',
      state: '',
      zipCode: '',
      ssn: ''
    },
    employer: {
      companyName: '',
      address: '',
      city: '',
      state: '',
      zipCode: '',
      ein: ''
    },
    payInfo: {
      payPeriodStart: '',
      payPeriodEnd: '',
      payDate: '',
      grossPay: 0,
      federalTax: 0,
      stateTax: 0,
      socialSecurity: 0,
      medicare: 0,
      otherDeductions: 0,
      hoursWorked: 0,
      hourlyRate: 0
    }
  });

  const handleInputChange = (section: keyof FormData, field: string, value: string | number) => {
    setFormData(prev => ({
      ...prev,
      [section]: {
        ...prev[section],
        [field]: value
      }
    }));

    // Clear error when user starts typing
    const errorKey = `${section}.${field}`;
    if (errors[errorKey]) {
      setErrors(prev => ({
        ...prev,
        [errorKey]: ''
      }));
    }
  };

  const validateStep = (step: number) => {
    const newErrors: Record<string, string> = {};

    switch (step) {
      case 1: // Employee Information
        if (!formData.employee.name.trim()) {
          newErrors['employee.name'] = 'Employee name is required';
        }
        if (!formData.employee.address.trim()) {
          newErrors['employee.address'] = 'Address is required';
        }
        if (!formData.employee.city.trim()) {
          newErrors['employee.city'] = 'City is required';
        }
        if (!formData.employee.state.trim()) {
          newErrors['employee.state'] = 'State is required';
        }
        if (!formData.employee.zipCode.trim()) {
          newErrors['employee.zipCode'] = 'ZIP code is required';
        } else if (!/^\d{5}(-\d{4})?$/.test(formData.employee.zipCode)) {
          newErrors['employee.zipCode'] = 'Invalid ZIP code format';
        }
        if (!formData.employee.ssn.trim()) {
          newErrors['employee.ssn'] = 'SSN is required';
        } else if (!/^\d{3}-?\d{2}-?\d{4}$/.test(formData.employee.ssn)) {
          newErrors['employee.ssn'] = 'Invalid SSN format (XXX-XX-XXXX)';
        }
        break;

      case 2: // Employer Information
        if (!formData.employer.companyName.trim()) {
          newErrors['employer.companyName'] = 'Company name is required';
        }
        if (!formData.employer.address.trim()) {
          newErrors['employer.address'] = 'Address is required';
        }
        if (!formData.employer.city.trim()) {
          newErrors['employer.city'] = 'City is required';
        }
        if (!formData.employer.state.trim()) {
          newErrors['employer.state'] = 'State is required';
        }
        if (!formData.employer.zipCode.trim()) {
          newErrors['employer.zipCode'] = 'ZIP code is required';
        } else if (!/^\d{5}(-\d{4})?$/.test(formData.employer.zipCode)) {
          newErrors['employer.zipCode'] = 'Invalid ZIP code format';
        }
        if (!formData.employer.ein.trim()) {
          newErrors['employer.ein'] = 'EIN is required';
        } else if (!/^\d{2}-?\d{7}$/.test(formData.employer.ein)) {
          newErrors['employer.ein'] = 'Invalid EIN format (XX-XXXXXXX)';
        }
        break;

      case 3: // Pay Information
        if (!formData.payInfo.payPeriodStart) {
          newErrors['payInfo.payPeriodStart'] = 'Pay period start date is required';
        }
        if (!formData.payInfo.payPeriodEnd) {
          newErrors['payInfo.payPeriodEnd'] = 'Pay period end date is required';
        }
        if (!formData.payInfo.payDate) {
          newErrors['payInfo.payDate'] = 'Pay date is required';
        }
        if (formData.payInfo.grossPay <= 0) {
          newErrors['payInfo.grossPay'] = 'Gross pay must be greater than 0';
        }
        if (formData.payInfo.hoursWorked <= 0) {
          newErrors['payInfo.hoursWorked'] = 'Hours worked must be greater than 0';
        }
        if (formData.payInfo.hourlyRate <= 0) {
          newErrors['payInfo.hourlyRate'] = 'Hourly rate must be greater than 0';
        }
        
        // Validate that deductions don't exceed gross pay
        const totalDeductions = formData.payInfo.federalTax + 
                               formData.payInfo.stateTax + 
                               formData.payInfo.socialSecurity + 
                               formData.payInfo.medicare + 
                               formData.payInfo.otherDeductions;
        
        if (totalDeductions >= formData.payInfo.grossPay) {
          newErrors['payInfo.deductions'] = 'Total deductions cannot exceed gross pay';
        }
        break;
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const nextStep = () => {
    if (validateStep(currentStep)) {
      setCurrentStep(prev => Math.min(prev + 1, 3));
    }
  };

  const prevStep = () => {
    setCurrentStep(prev => Math.max(prev - 1, 1));
  };

  const generatePaystub = async () => {
    if (!validateStep(3)) {
      return;
    }

    setIsGenerating(true);
    try {
      // Calculate net pay
      const totalDeductions = formData.payInfo.federalTax + 
                             formData.payInfo.stateTax + 
                             formData.payInfo.socialSecurity + 
                             formData.payInfo.medicare + 
                             formData.payInfo.otherDeductions;
      
      const netPay = formData.payInfo.grossPay - totalDeductions;

      // Prepare data for API
      const paystubData = {
        employee: {
          name: formData.employee.name,
          address: formData.employee.address,
          city: formData.employee.city,
          state: formData.employee.state,
          zip_code: formData.employee.zipCode,
          ssn: formData.employee.ssn
        },
        employer: {
          company_name: formData.employer.companyName,
          address: formData.employer.address,
          city: formData.employer.city,
          state: formData.employer.state,
          zip_code: formData.employer.zipCode,
          ein: formData.employer.ein
        },
        pay_info: {
          pay_period_start: formData.payInfo.payPeriodStart,
          pay_period_end: formData.payInfo.payPeriodEnd,
          pay_date: formData.payInfo.payDate,
          gross_pay: formData.payInfo.grossPay,
          federal_tax: formData.payInfo.federalTax,
          state_tax: formData.payInfo.stateTax,
          social_security: formData.payInfo.socialSecurity,
          medicare: formData.payInfo.medicare,
          other_deductions: formData.payInfo.otherDeductions,
          net_pay: netPay,
          hours_worked: formData.payInfo.hoursWorked,
          hourly_rate: formData.payInfo.hourlyRate
        }
      };

      const response = await documentsAPI.generatePaystub(paystubData);
      
      // Generate filename with current date
      const currentDate = new Date().toISOString().split('T')[0];
      const filename = `paystub_${formData.employee.name.replace(/\s+/g, '_')}_${currentDate}.pdf`;
      
      // Download the PDF
      downloadFile(response.data, filename);
      
      // Show success message
      alert('Paystub generated successfully!');
      
    } catch (error: any) {
      console.error('Error generating paystub:', error);
      const errorMessage = error.response?.data?.detail || 
                          error.response?.data?.message || 
                          'Failed to generate paystub. Please try again.';
      setErrors({ submit: errorMessage });
    } finally {
      setIsGenerating(false);
    }
  };

  const renderStepContent = () => {
    switch (currentStep) {
      case 1:
        return (
          <div className="space-y-4">
            <h3 className="text-lg font-medium text-gray-900">Employee Information</h3>
            
            <div>
              <label className="block text-sm font-medium text-gray-700">Full Name</label>
              <input
                type="text"
                value={formData.employee.name}
                onChange={(e) => handleInputChange('employee', 'name', e.target.value)}
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                placeholder="Enter employee full name"
              />
              {errors['employee.name'] && (
                <p className="mt-1 text-sm text-red-600">{errors['employee.name']}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">Address</label>
              <input
                type="text"
                value={formData.employee.address}
                onChange={(e) => handleInputChange('employee', 'address', e.target.value)}
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                placeholder="Enter street address"
              />
              {errors['employee.address'] && (
                <p className="mt-1 text-sm text-red-600">{errors['employee.address']}</p>
              )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">City</label>
                <input
                  type="text"
                  value={formData.employee.city}
                  onChange={(e) => handleInputChange('employee', 'city', e.target.value)}
                  className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  placeholder="City"
                />
                {errors['employee.city'] && (
                  <p className="mt-1 text-sm text-red-600">{errors['employee.city']}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">State</label>
                <input
                  type="text"
                  value={formData.employee.state}
                  onChange={(e) => handleInputChange('employee', 'state', e.target.value)}
                  className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  placeholder="State"
                />
                {errors['employee.state'] && (
                  <p className="mt-1 text-sm text-red-600">{errors['employee.state']}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">ZIP Code</label>
                <input
                  type="text"
                  value={formData.employee.zipCode}
                  onChange={(e) => handleInputChange('employee', 'zipCode', e.target.value)}
                  className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  placeholder="12345"
                />
                {errors['employee.zipCode'] && (
                  <p className="mt-1 text-sm text-red-600">{errors['employee.zipCode']}</p>
                )}
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">Social Security Number</label>
              <input
                type="text"
                value={formData.employee.ssn}
                onChange={(e) => handleInputChange('employee', 'ssn', e.target.value)}
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                placeholder="XXX-XX-XXXX"
              />
              {errors['employee.ssn'] && (
                <p className="mt-1 text-sm text-red-600">{errors['employee.ssn']}</p>
              )}
            </div>
          </div>
        );

      case 2:
        return (
          <div className="space-y-4">
            <h3 className="text-lg font-medium text-gray-900">Employer Information</h3>
            
            <div>
              <label className="block text-sm font-medium text-gray-700">Company Name</label>
              <input
                type="text"
                value={formData.employer.companyName}
                onChange={(e) => handleInputChange('employer', 'companyName', e.target.value)}
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                placeholder="Enter company name"
              />
              {errors['employer.companyName'] && (
                <p className="mt-1 text-sm text-red-600">{errors['employer.companyName']}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">Address</label>
              <input
                type="text"
                value={formData.employer.address}
                onChange={(e) => handleInputChange('employer', 'address', e.target.value)}
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                placeholder="Enter street address"
              />
              {errors['employer.address'] && (
                <p className="mt-1 text-sm text-red-600">{errors['employer.address']}</p>
              )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">City</label>
                <input
                  type="text"
                  value={formData.employer.city}
                  onChange={(e) => handleInputChange('employer', 'city', e.target.value)}
                  className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  placeholder="City"
                />
                {errors['employer.city'] && (
                  <p className="mt-1 text-sm text-red-600">{errors['employer.city']}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">State</label>
                <input
                  type="text"
                  value={formData.employer.state}
                  onChange={(e) => handleInputChange('employer', 'state', e.target.value)}
                  className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  placeholder="State"
                />
                {errors['employer.state'] && (
                  <p className="mt-1 text-sm text-red-600">{errors['employer.state']}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">ZIP Code</label>
                <input
                  type="text"
                  value={formData.employer.zipCode}
                  onChange={(e) => handleInputChange('employer', 'zipCode', e.target.value)}
                  className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  placeholder="12345"
                />
                {errors['employer.zipCode'] && (
                  <p className="mt-1 text-sm text-red-600">{errors['employer.zipCode']}</p>
                )}
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">Employer Identification Number (EIN)</label>
              <input
                type="text"
                value={formData.employer.ein}
                onChange={(e) => handleInputChange('employer', 'ein', e.target.value)}
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                placeholder="XX-XXXXXXX"
              />
              {errors['employer.ein'] && (
                <p className="mt-1 text-sm text-red-600">{errors['employer.ein']}</p>
              )}
            </div>
          </div>
        );

      case 3:
        const totalDeductions = formData.payInfo.federalTax + 
                               formData.payInfo.stateTax + 
                               formData.payInfo.socialSecurity + 
                               formData.payInfo.medicare + 
                               formData.payInfo.otherDeductions;
        const netPay = formData.payInfo.grossPay - totalDeductions;

        return (
          <div className="space-y-4">
            <h3 className="text-lg font-medium text-gray-900">Pay Information</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">Pay Period Start</label>
                <input
                  type="date"
                  value={formData.payInfo.payPeriodStart}
                  onChange={(e) => handleInputChange('payInfo', 'payPeriodStart', e.target.value)}
                  className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                />
                {errors['payInfo.payPeriodStart'] && (
                  <p className="mt-1 text-sm text-red-600">{errors['payInfo.payPeriodStart']}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">Pay Period End</label>
                <input
                  type="date"
                  value={formData.payInfo.payPeriodEnd}
                  onChange={(e) => handleInputChange('payInfo', 'payPeriodEnd', e.target.value)}
                  className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                />
                {errors['payInfo.payPeriodEnd'] && (
                  <p className="mt-1 text-sm text-red-600">{errors['payInfo.payPeriodEnd']}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">Pay Date</label>
                <input
                  type="date"
                  value={formData.payInfo.payDate}
                  onChange={(e) => handleInputChange('payInfo', 'payDate', e.target.value)}
                  className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                />
                {errors['payInfo.payDate'] && (
                  <p className="mt-1 text-sm text-red-600">{errors['payInfo.payDate']}</p>
                )}
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">Hours Worked</label>
                <input
                  type="number"
                  step="0.01"
                  value={formData.payInfo.hoursWorked}
                  onChange={(e) => handleInputChange('payInfo', 'hoursWorked', parseFloat(e.target.value) || 0)}
                  className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  placeholder="40.00"
                />
                {errors['payInfo.hoursWorked'] && (
                  <p className="mt-1 text-sm text-red-600">{errors['payInfo.hoursWorked']}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">Hourly Rate ($)</label>
                <input
                  type="number"
                  step="0.01"
                  value={formData.payInfo.hourlyRate}
                  onChange={(e) => handleInputChange('payInfo', 'hourlyRate', parseFloat(e.target.value) || 0)}
                  className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  placeholder="25.00"
                />
                {errors['payInfo.hourlyRate'] && (
                  <p className="mt-1 text-sm text-red-600">{errors['payInfo.hourlyRate']}</p>
                )}
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">Gross Pay ($)</label>
              <input
                type="number"
                step="0.01"
                value={formData.payInfo.grossPay}
                onChange={(e) => handleInputChange('payInfo', 'grossPay', parseFloat(e.target.value) || 0)}
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                placeholder="1000.00"
              />
              {errors['payInfo.grossPay'] && (
                <p className="mt-1 text-sm text-red-600">{errors['payInfo.grossPay']}</p>
              )}
            </div>

            <div className="border-t pt-4">
              <h4 className="text-md font-medium text-gray-900 mb-3">Deductions</h4>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">Federal Tax ($)</label>
                  <input
                    type="number"
                    step="0.01"
                    value={formData.payInfo.federalTax}
                    onChange={(e) => handleInputChange('payInfo', 'federalTax', parseFloat(e.target.value) || 0)}
                    className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                    placeholder="150.00"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700">State Tax ($)</label>
                  <input
                    type="number"
                    step="0.01"
                    value={formData.payInfo.stateTax}
                    onChange={(e) => handleInputChange('payInfo', 'stateTax', parseFloat(e.target.value) || 0)}
                    className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                    placeholder="50.00"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700">Social Security ($)</label>
                  <input
                    type="number"
                    step="0.01"
                    value={formData.payInfo.socialSecurity}
                    onChange={(e) => handleInputChange('payInfo', 'socialSecurity', parseFloat(e.target.value) || 0)}
                    className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                    placeholder="62.00"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700">Medicare ($)</label>
                  <input
                    type="number"
                    step="0.01"
                    value={formData.payInfo.medicare}
                    onChange={(e) => handleInputChange('payInfo', 'medicare', parseFloat(e.target.value) || 0)}
                    className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                    placeholder="14.50"
                  />
                </div>

                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700">Other Deductions ($)</label>
                  <input
                    type="number"
                    step="0.01"
                    value={formData.payInfo.otherDeductions}
                    onChange={(e) => handleInputChange('payInfo', 'otherDeductions', parseFloat(e.target.value) || 0)}
                    className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                    placeholder="0.00"
                  />
                </div>
              </div>

              {errors['payInfo.deductions'] && (
                <p className="mt-2 text-sm text-red-600">{errors['payInfo.deductions']}</p>
              )}
            </div>

            <div className="bg-gray-50 p-4 rounded-md">
              <div className="flex justify-between items-center">
                <span className="text-sm font-medium text-gray-700">Total Deductions:</span>
                <span className="text-sm text-gray-900">${totalDeductions.toFixed(2)}</span>
              </div>
              <div className="flex justify-between items-center mt-2 pt-2 border-t border-gray-200">
                <span className="text-lg font-semibold text-gray-900">Net Pay:</span>
                <span className="text-lg font-semibold text-green-600">${netPay.toFixed(2)}</span>
              </div>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="max-w-4xl mx-auto bg-white shadow-lg rounded-lg">
      <div className="px-6 py-4 border-b border-gray-200">
        <h2 className="text-2xl font-bold text-gray-900">Paystub Generator</h2>
        
        {/* Progress Steps */}
        <div className="mt-4">
          <div className="flex items-center">
            {[1, 2, 3].map((step) => (
              <React.Fragment key={step}>
                <div className={`flex items-center justify-center w-8 h-8 rounded-full border-2 ${
                  currentStep >= step 
                    ? 'bg-blue-600 border-blue-600 text-white' 
                    : 'border-gray-300 text-gray-500'
                }`}>
                  {step}
                </div>
                {step < 3 && (
                  <div className={`flex-1 h-1 mx-2 ${
                    currentStep > step ? 'bg-blue-600' : 'bg-gray-300'
                  }`} />
                )}
              </React.Fragment>
            ))}
          </div>
          <div className="flex justify-between mt-2 text-sm text-gray-600">
            <span>Employee Info</span>
            <span>Employer Info</span>
            <span>Pay Details</span>
          </div>
        </div>
      </div>

      <div className="px-6 py-6">
        {renderStepContent()}

        {errors.submit && (
          <div className="mt-4 bg-red-50 border border-red-200 rounded-md p-4">
            <p className="text-sm text-red-600">{errors.submit}</p>
          </div>
        )}

        <div className="mt-8 flex justify-between">
          <button
            type="button"
            onClick={prevStep}
            disabled={currentStep === 1}
            className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Previous
          </button>

          {currentStep < 3 ? (
            <button
              type="button"
              onClick={nextStep}
              className="px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-md shadow-sm hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              Next
            </button>
          ) : (
            <button
              type="button"
              onClick={generatePaystub}
              disabled={isGenerating}
              className="px-6 py-2 text-sm font-medium text-white bg-green-600 border border-transparent rounded-md shadow-sm hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isGenerating ? (
                <div className="flex items-center">
                  <div className="animate-spin -ml-1 mr-3 h-5 w-5 border-2 border-white border-t-transparent rounded-full"></div>
                  Generating...
                </div>
              ) : (
                'Generate Paystub'
              )}
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default PaystubGenerator;