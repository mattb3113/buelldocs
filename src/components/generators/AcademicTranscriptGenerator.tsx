import React, { useState } from 'react';
import { ArrowLeft, FileText, Download, Eye, LogOut, GraduationCap, Plus, Minus } from 'lucide-react';

interface User {
  id: string;
  name: string;
  email: string;
  avatar: string;
}

interface AcademicTranscriptGeneratorProps {
  user: User;
  onBack: () => void;
  onLogout: () => void;
}

interface Course {
  id: string;
  courseCode: string;
  courseName: string;
  credits: number;
  grade: string;
  gradePoints: number;
}

interface Term {
  id: string;
  termName: string;
  year: number;
  courses: Course[];
  termGPA: number;
  termCredits: number;
}

interface AcademicTranscriptData {
  // Institution Information
  institutionName: string;
  institutionAddress: string;
  institutionCity: string;
  institutionState: string;
  institutionZip: string;
  institutionPhone: string;
  institutionWebsite: string;
  
  // Student Information
  studentName: string;
  studentId: string;
  studentAddress: string;
  studentCity: string;
  studentState: string;
  studentZip: string;
  studentEmail: string;
  studentPhone: string;
  dateOfBirth: string;
  
  // Academic Information
  degreeSought: string;
  major: string;
  minor: string;
  concentration: string;
  admissionDate: string;
  expectedGraduationDate: string;
  actualGraduationDate: string;
  
  // Academic Performance
  overallGPA: number;
  majorGPA: number;
  institutionGPAScale: number;
  classRank: string;
  classSize: number;
  creditsEarned: number;
  creditsAttempted: number;
  
  // Academic Standing
  academicStanding: string;
  honors: string;
  
  // Terms and Courses
  terms: Term[];
  
  // Transcript Information
  transcriptId: string;
  issueDate: string;
  recipientName: string;
  recipientAddress: string;
}

const AcademicTranscriptGenerator: React.FC<AcademicTranscriptGeneratorProps> = ({ user, onBack, onLogout }) => {
  const [currentStep, setCurrentStep] = useState(1);
  const [formData, setFormData] = useState<AcademicTranscriptData>({
    institutionName: '',
    institutionAddress: '',
    institutionCity: '',
    institutionState: '',
    institutionZip: '',
    institutionPhone: '',
    institutionWebsite: '',
    studentName: '',
    studentId: '',
    studentAddress: '',
    studentCity: '',
    studentState: '',
    studentZip: '',
    studentEmail: '',
    studentPhone: '',
    dateOfBirth: '',
    degreeSought: '',
    major: '',
    minor: '',
    concentration: '',
    admissionDate: '',
    expectedGraduationDate: '',
    actualGraduationDate: '',
    overallGPA: 0,
    majorGPA: 0,
    institutionGPAScale: 4.0,
    classRank: '',
    classSize: 0,
    creditsEarned: 0,
    creditsAttempted: 0,
    academicStanding: 'Good Standing',
    honors: '',
    terms: [],
    transcriptId: '',
    issueDate: new Date().toISOString().split('T')[0],
    recipientName: '',
    recipientAddress: ''
  });
  const [generatedDocument, setGeneratedDocument] = useState<string | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);

  const handleInputChange = (field: keyof AcademicTranscriptData, value: string | number) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const addTerm = () => {
    const newTerm: Term = {
      id: Date.now().toString(),
      termName: 'Fall',
      year: new Date().getFullYear(),
      courses: [],
      termGPA: 0,
      termCredits: 0
    };
    setFormData(prev => ({
      ...prev,
      terms: [...prev.terms, newTerm]
    }));
  };

  const removeTerm = (termId: string) => {
    setFormData(prev => ({
      ...prev,
      terms: prev.terms.filter(term => term.id !== termId)
    }));
  };

  const updateTerm = (termId: string, field: keyof Term, value: any) => {
    setFormData(prev => ({
      ...prev,
      terms: prev.terms.map(term => 
        term.id === termId ? { ...term, [field]: value } : term
      )
    }));
  };

  const addCourse = (termId: string) => {
    const newCourse: Course = {
      id: Date.now().toString(),
      courseCode: '',
      courseName: '',
      credits: 3,
      grade: 'A',
      gradePoints: 4.0
    };
    
    setFormData(prev => ({
      ...prev,
      terms: prev.terms.map(term => 
        term.id === termId 
          ? { ...term, courses: [...term.courses, newCourse] }
          : term
      )
    }));
  };

  const removeCourse = (termId: string, courseId: string) => {
    setFormData(prev => ({
      ...prev,
      terms: prev.terms.map(term => 
        term.id === termId 
          ? { ...term, courses: term.courses.filter(course => course.id !== courseId) }
          : term
      )
    }));
  };

  const updateCourse = (termId: string, courseId: string, field: keyof Course, value: any) => {
    setFormData(prev => ({
      ...prev,
      terms: prev.terms.map(term => 
        term.id === termId 
          ? {
              ...term,
              courses: term.courses.map(course => 
                course.id === courseId ? { ...course, [field]: value } : course
              )
            }
          : term
      )
    }));
  };

  const calculateGPA = () => {
    let totalGradePoints = 0;
    let totalCredits = 0;
    
    formData.terms.forEach(term => {
      term.courses.forEach(course => {
        totalGradePoints += course.gradePoints * course.credits;
        totalCredits += course.credits;
      });
    });
    
    return totalCredits > 0 ? totalGradePoints / totalCredits : 0;
  };

  const gradeToPoints = (grade: string): number => {
    const gradeMap: { [key: string]: number } = {
      'A+': 4.0, 'A': 4.0, 'A-': 3.7,
      'B+': 3.3, 'B': 3.0, 'B-': 2.7,
      'C+': 2.3, 'C': 2.0, 'C-': 1.7,
      'D+': 1.3, 'D': 1.0, 'D-': 0.7,
      'F': 0.0, 'W': 0.0, 'I': 0.0
    };
    return gradeMap[grade] || 0.0;
  };

  const validateStep = (step: number): boolean => {
    switch (step) {
      case 1:
        return !!(formData.institutionName && formData.institutionAddress && 
                 formData.institutionCity && formData.institutionState && 
                 formData.institutionZip);
      case 2:
        return !!(formData.studentName && formData.studentId && 
                 formData.major && formData.admissionDate);
      case 3:
        return formData.terms.length > 0;
      default:
        return true;
    }
  };

  const nextStep = () => {
    if (validateStep(currentStep)) {
      if (currentStep === 3) {
        generateTranscript();
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

  const generateTranscript = async () => {
    setIsGenerating(true);
    
    try {
      const calculatedGPA = calculateGPA();
      const totalCredits = formData.terms.reduce((sum, term) => 
        sum + term.courses.reduce((termSum, course) => termSum + course.credits, 0), 0
      );
      
      const transcriptHTML = `
        <div style="font-family: 'Times New Roman', serif; max-width: 800px; margin: 0 auto; padding: 40px; background: white; border: 2px solid #003366;">
          <!-- Institution Header -->
          <div style="text-align: center; margin-bottom: 40px; border-bottom: 3px solid #003366; padding-bottom: 20px;">
            <h1 style="margin: 0; font-size: 32px; color: #003366; font-weight: bold; letter-spacing: 1px;">
              ${formData.institutionName}
            </h1>
            <div style="font-size: 14px; color: #666; margin-top: 10px; line-height: 1.4;">
              ${formData.institutionAddress}<br>
              ${formData.institutionCity}, ${formData.institutionState} ${formData.institutionZip}<br>
              Phone: ${formData.institutionPhone}
              ${formData.institutionWebsite ? `<br>Website: ${formData.institutionWebsite}` : ''}
            </div>
          </div>
          
          <!-- Transcript Title -->
          <div style="text-align: center; margin-bottom: 30px;">
            <h2 style="margin: 0; font-size: 24px; color: #003366; font-weight: bold; letter-spacing: 2px;">
              OFFICIAL ACADEMIC TRANSCRIPT
            </h2>
          </div>
          
          <!-- Student Information -->
          <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 30px; margin-bottom: 30px;">
            <div>
              <h3 style="color: #003366; margin-bottom: 15px; border-bottom: 2px solid #003366; padding-bottom: 5px;">Student Information</h3>
              <table style="width: 100%; font-size: 12px;">
                <tr>
                  <td style="padding: 3px 0; font-weight: bold; width: 120px;">Name:</td>
                  <td style="padding: 3px 0;">${formData.studentName}</td>
                </tr>
                <tr>
                  <td style="padding: 3px 0; font-weight: bold;">Student ID:</td>
                  <td style="padding: 3px 0;">${formData.studentId}</td>
                </tr>
                <tr>
                  <td style="padding: 3px 0; font-weight: bold;">Date of Birth:</td>
                  <td style="padding: 3px 0;">${formData.dateOfBirth ? new Date(formData.dateOfBirth).toLocaleDateString() : 'N/A'}</td>
                </tr>
                <tr>
                  <td style="padding: 3px 0; font-weight: bold;">Admission Date:</td>
                  <td style="padding: 3px 0;">${new Date(formData.admissionDate).toLocaleDateString()}</td>
                </tr>
                ${formData.actualGraduationDate ? `
                  <tr>
                    <td style="padding: 3px 0; font-weight: bold;">Graduation Date:</td>
                    <td style="padding: 3px 0;">${new Date(formData.actualGraduationDate).toLocaleDateString()}</td>
                  </tr>
                ` : ''}
              </table>
            </div>
            
            <div>
              <h3 style="color: #003366; margin-bottom: 15px; border-bottom: 2px solid #003366; padding-bottom: 5px;">Academic Program</h3>
              <table style="width: 100%; font-size: 12px;">
                <tr>
                  <td style="padding: 3px 0; font-weight: bold; width: 120px;">Degree:</td>
                  <td style="padding: 3px 0;">${formData.degreeSought}</td>
                </tr>
                <tr>
                  <td style="padding: 3px 0; font-weight: bold;">Major:</td>
                  <td style="padding: 3px 0;">${formData.major}</td>
                </tr>
                ${formData.minor ? `
                  <tr>
                    <td style="padding: 3px 0; font-weight: bold;">Minor:</td>
                    <td style="padding: 3px 0;">${formData.minor}</td>
                  </tr>
                ` : ''}
                ${formData.concentration ? `
                  <tr>
                    <td style="padding: 3px 0; font-weight: bold;">Concentration:</td>
                    <td style="padding: 3px 0;">${formData.concentration}</td>
                  </tr>
                ` : ''}
                <tr>
                  <td style="padding: 3px 0; font-weight: bold;">Academic Standing:</td>
                  <td style="padding: 3px 0;">${formData.academicStanding}</td>
                </tr>
                ${formData.honors ? `
                  <tr>
                    <td style="padding: 3px 0; font-weight: bold;">Honors:</td>
                    <td style="padding: 3px 0;">${formData.honors}</td>
                  </tr>
                ` : ''}
              </table>
            </div>
          </div>
          
          <!-- Academic Record -->
          <div style="margin-bottom: 30px;">
            <h3 style="color: #003366; margin-bottom: 15px; border-bottom: 2px solid #003366; padding-bottom: 5px;">Academic Record</h3>
            
            ${formData.terms.map(term => `
              <div style="margin-bottom: 25px;">
                <h4 style="background-color: #f0f0f0; padding: 8px; margin: 0; font-size: 14px; color: #003366; border: 1px solid #ddd;">
                  ${term.termName} ${term.year}
                </h4>
                <table style="width: 100%; border-collapse: collapse; font-size: 11px;">
                  <thead>
                    <tr style="background-color: #f8f9fa;">
                      <th style="border: 1px solid #ddd; padding: 8px; text-align: left;">Course Code</th>
                      <th style="border: 1px solid #ddd; padding: 8px; text-align: left;">Course Title</th>
                      <th style="border: 1px solid #ddd; padding: 8px; text-align: center;">Credits</th>
                      <th style="border: 1px solid #ddd; padding: 8px; text-align: center;">Grade</th>
                      <th style="border: 1px solid #ddd; padding: 8px; text-align: center;">Grade Points</th>
                    </tr>
                  </thead>
                  <tbody>
                    ${term.courses.map(course => `
                      <tr>
                        <td style="border: 1px solid #ddd; padding: 8px;">${course.courseCode}</td>
                        <td style="border: 1px solid #ddd; padding: 8px;">${course.courseName}</td>
                        <td style="border: 1px solid #ddd; padding: 8px; text-align: center;">${course.credits}</td>
                        <td style="border: 1px solid #ddd; padding: 8px; text-align: center; font-weight: bold;">${course.grade}</td>
                        <td style="border: 1px solid #ddd; padding: 8px; text-align: center;">${course.gradePoints.toFixed(2)}</td>
                      </tr>
                    `).join('')}
                  </tbody>
                  <tfoot>
                    <tr style="background-color: #f0f0f0; font-weight: bold;">
                      <td style="border: 1px solid #ddd; padding: 8px;" colspan="2">Term Totals</td>
                      <td style="border: 1px solid #ddd; padding: 8px; text-align: center;">${term.courses.reduce((sum, course) => sum + course.credits, 0)}</td>
                      <td style="border: 1px solid #ddd; padding: 8px; text-align: center;">GPA</td>
                      <td style="border: 1px solid #ddd; padding: 8px; text-align: center;">${term.courses.length > 0 ? (term.courses.reduce((sum, course) => sum + (course.gradePoints * course.credits), 0) / term.courses.reduce((sum, course) => sum + course.credits, 0)).toFixed(2) : '0.00'}</td>
                    </tr>
                  </tfoot>
                </table>
              </div>
            `).join('')}
          </div>
          
          <!-- Academic Summary -->
          <div style="background-color: #f8f9fa; padding: 20px; border: 2px solid #003366; border-radius: 8px; margin-bottom: 30px;">
            <h3 style="margin-top: 0; color: #003366;">Academic Summary</h3>
            <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 20px;">
              <div>
                <table style="width: 100%; font-size: 12px;">
                  <tr>
                    <td style="padding: 5px 0; font-weight: bold;">Total Credits Attempted:</td>
                    <td style="padding: 5px 0; text-align: right;">${totalCredits}</td>
                  </tr>
                  <tr>
                    <td style="padding: 5px 0; font-weight: bold;">Total Credits Earned:</td>
                    <td style="padding: 5px 0; text-align: right;">${totalCredits}</td>
                  </tr>
                  <tr>
                    <td style="padding: 5px 0; font-weight: bold;">Cumulative GPA:</td>
                    <td style="padding: 5px 0; text-align: right; font-weight: bold; color: #003366;">${calculatedGPA.toFixed(2)}</td>
                  </tr>
                </table>
              </div>
              <div>
                <table style="width: 100%; font-size: 12px;">
                  <tr>
                    <td style="padding: 5px 0; font-weight: bold;">GPA Scale:</td>
                    <td style="padding: 5px 0; text-align: right;">${formData.institutionGPAScale.toFixed(1)}</td>
                  </tr>
                  ${formData.majorGPA > 0 ? `
                    <tr>
                      <td style="padding: 5px 0; font-weight: bold;">Major GPA:</td>
                      <td style="padding: 5px 0; text-align: right;">${formData.majorGPA.toFixed(2)}</td>
                    </tr>
                  ` : ''}
                  ${formData.classRank ? `
                    <tr>
                      <td style="padding: 5px 0; font-weight: bold;">Class Rank:</td>
                      <td style="padding: 5px 0; text-align: right;">${formData.classRank}</td>
                    </tr>
                  ` : ''}
                </table>
              </div>
            </div>
          </div>
          
          <!-- Transcript Information -->
          <div style="margin-bottom: 30px;">
            <div style="display: flex; justify-content: space-between; align-items: end;">
              <div>
                <p style="margin: 5px 0; font-size: 12px;">
                  <strong>Transcript ID:</strong> ${formData.transcriptId || `TR-${Date.now().toString().slice(-8)}`}
                </p>
                <p style="margin: 5px 0; font-size: 12px;">
                  <strong>Issue Date:</strong> ${new Date(formData.issueDate).toLocaleDateString()}
                </p>
                ${formData.recipientName ? `
                  <p style="margin: 5px 0; font-size: 12px;">
                    <strong>Issued to:</strong> ${formData.recipientName}
                  </p>
                ` : ''}
              </div>
              
              <!-- Official Seal -->
              <div style="width: 80px; height: 80px; border: 3px solid #003366; border-radius: 50%; background: radial-gradient(circle, #003366, #001a33); display: flex; align-items: center; justify-content: center;">
                <div style="color: white; font-weight: bold; font-size: 10px; text-align: center; line-height: 1.2;">
                  OFFICIAL<br>TRANSCRIPT
                </div>
              </div>
            </div>
          </div>
          
          <!-- Registrar Signature -->
          <div style="margin-bottom: 30px;">
            <div style="width: 300px;">
              <div style="border-bottom: 2px solid #003366; margin-bottom: 10px; height: 40px;"></div>
              <div style="font-size: 14px; font-weight: bold; color: #003366;">
                Registrar
              </div>
              <div style="font-size: 12px; color: #666;">
                ${formData.institutionName}
              </div>
            </div>
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
      
      setGeneratedDocument(transcriptHTML);
      
      // Save to user's document history
      const savedDocuments = localStorage.getItem('buelldocs_documents');
      const documents = savedDocuments ? JSON.parse(savedDocuments) : [];
      
      const newDocument = {
        id: Date.now().toString(),
        type: 'transcript',
        name: `Academic Transcript - ${formData.studentName}`,
        createdAt: new Date().toISOString(),
        status: 'completed',
        category: 'academic'
      };
      
      documents.unshift(newDocument);
      localStorage.setItem('buelldocs_documents', JSON.stringify(documents));
      
      setCurrentStep(4);
    } catch (error) {
      console.error('Error generating transcript:', error);
      alert('An error occurred while generating the transcript. Please try again.');
    } finally {
      setIsGenerating(false);
    }
  };

  const downloadTranscript = () => {
    if (!generatedDocument) return;
    
    const blob = new Blob([generatedDocument], { type: 'text/html' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `academic-transcript-${formData.studentName.replace(/\s+/g, '-').toLowerCase()}.html`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const printTranscript = () => {
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
                <GraduationCap className="h-6 w-6 text-purple-600" />
                <span className="text-lg font-semibold text-gray-900">Academic Transcript Generator</span>
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

      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Progress Bar */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <h1 className="text-2xl font-bold text-gray-900">Generate Academic Transcript</h1>
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
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Phone Number
                  </label>
                  <input
                    type="text"
                    value={formData.institutionPhone}
                    onChange={(e) => handleInputChange('institutionPhone', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                    placeholder="(555) 123-4567"
                  />
                </div>
              </div>
            </div>
          )}

          {/* Step 2: Student Information */}
          {currentStep === 2 && (
            <div>
              <h2 className="text-xl font-semibold text-gray-900 mb-6">Student Information</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Student Name *
                  </label>
                  <input
                    type="text"
                    value={formData.studentName}
                    onChange={(e) => handleInputChange('studentName', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                    placeholder="John Doe"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Student ID *
                  </label>
                  <input
                    type="text"
                    value={formData.studentId}
                    onChange={(e) => handleInputChange('studentId', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                    placeholder="STU123456"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Date of Birth
                  </label>
                  <input
                    type="date"
                    value={formData.dateOfBirth}
                    onChange={(e) => handleInputChange('dateOfBirth', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Admission Date *
                  </label>
                  <input
                    type="date"
                    value={formData.admissionDate}
                    onChange={(e) => handleInputChange('admissionDate', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Degree Sought *
                  </label>
                  <input
                    type="text"
                    value={formData.degreeSought}
                    onChange={(e) => handleInputChange('degreeSought', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                    placeholder="Bachelor of Science"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Major *
                  </label>
                  <input
                    type="text"
                    value={formData.major}
                    onChange={(e) => handleInputChange('major', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                    placeholder="Computer Science"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Minor
                  </label>
                  <input
                    type="text"
                    value={formData.minor}
                    onChange={(e) => handleInputChange('minor', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                    placeholder="Mathematics"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Academic Standing
                  </label>
                  <select
                    value={formData.academicStanding}
                    onChange={(e) => handleInputChange('academicStanding', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                  >
                    <option value="Good Standing">Good Standing</option>
                    <option value="Dean's List">Dean's List</option>
                    <option value="Academic Probation">Academic Probation</option>
                    <option value="Academic Warning">Academic Warning</option>
                  </select>
                </div>
              </div>
            </div>
          )}

          {/* Step 3: Academic Record */}
          {currentStep === 3 && (
            <div>
              <h2 className="text-xl font-semibold text-gray-900 mb-6">Academic Record</h2>
              
              <div className="mb-6">
                <div className="flex justify-between items-center mb-4">
                  <h3 className="text-lg font-medium text-gray-900">Terms & Courses</h3>
                  <button
                    onClick={addTerm}
                    className="flex items-center space-x-2 bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700 transition-colors"
                  >
                    <Plus className="h-4 w-4" />
                    <span>Add Term</span>
                  </button>
                </div>
                
                {formData.terms.map((term, termIndex) => (
                  <div key={term.id} className="border border-gray-300 rounded-lg p-4 mb-4">
                    <div className="flex justify-between items-center mb-4">
                      <h4 className="text-md font-medium text-gray-900">Term {termIndex + 1}</h4>
                      <button
                        onClick={() => removeTerm(term.id)}
                        className="text-red-600 hover:text-red-800 transition-colors"
                      >
                        <Minus className="h-4 w-4" />
                      </button>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Term
                        </label>
                        <select
                          value={term.termName}
                          onChange={(e) => updateTerm(term.id, 'termName', e.target.value)}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                        >
                          <option value="Fall">Fall</option>
                          <option value="Spring">Spring</option>
                          <option value="Summer">Summer</option>
                          <option value="Winter">Winter</option>
                        </select>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Year
                        </label>
                        <input
                          type="number"
                          value={term.year}
                          onChange={(e) => updateTerm(term.id, 'year', parseInt(e.target.value) || 0)}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                          placeholder="2024"
                        />
                      </div>
                      <div className="flex items-end">
                        <button
                          onClick={() => addCourse(term.id)}
                          className="w-full bg-gray-600 text-white px-4 py-2 rounded-lg hover:bg-gray-700 transition-colors"
                        >
                          Add Course
                        </button>
                      </div>
                    </div>
                    
                    {term.courses.length > 0 && (
                      <div className="overflow-x-auto">
                        <table className="w-full border-collapse border border-gray-300">
                          <thead>
                            <tr className="bg-gray-50">
                              <th className="border border-gray-300 px-3 py-2 text-left">Course Code</th>
                              <th className="border border-gray-300 px-3 py-2 text-left">Course Name</th>
                              <th className="border border-gray-300 px-3 py-2 text-center">Credits</th>
                              <th className="border border-gray-300 px-3 py-2 text-center">Grade</th>
                              <th className="border border-gray-300 px-3 py-2 text-center">Actions</th>
                            </tr>
                          </thead>
                          <tbody>
                            {term.courses.map((course) => (
                              <tr key={course.id}>
                                <td className="border border-gray-300 px-3 py-2">
                                  <input
                                    type="text"
                                    value={course.courseCode}
                                    onChange={(e) => updateCourse(term.id, course.id, 'courseCode', e.target.value)}
                                    className="w-full px-2 py-1 border border-gray-300 rounded"
                                    placeholder="CS101"
                                  />
                                </td>
                                <td className="border border-gray-300 px-3 py-2">
                                  <input
                                    type="text"
                                    value={course.courseName}
                                    onChange={(e) => updateCourse(term.id, course.id, 'courseName', e.target.value)}
                                    className="w-full px-2 py-1 border border-gray-300 rounded"
                                    placeholder="Introduction to Computer Science"
                                  />
                                </td>
                                <td className="border border-gray-300 px-3 py-2">
                                  <input
                                    type="number"
                                    value={course.credits}
                                    onChange={(e) => updateCourse(term.id, course.id, 'credits', parseInt(e.target.value) || 0)}
                                    className="w-full px-2 py-1 border border-gray-300 rounded text-center"
                                    placeholder="3"
                                  />
                                </td>
                                <td className="border border-gray-300 px-3 py-2">
                                  <select
                                    value={course.grade}
                                    onChange={(e) => {
                                      const grade = e.target.value;
                                      const gradePoints = gradeToPoints(grade);
                                      updateCourse(term.id, course.id, 'grade', grade);
                                      updateCourse(term.id, course.id, 'gradePoints', gradePoints);
                                    }}
                                    className="w-full px-2 py-1 border border-gray-300 rounded"
                                  >
                                    <option value="A+">A+</option>
                                    <option value="A">A</option>
                                    <option value="A-">A-</option>
                                    <option value="B+">B+</option>
                                    <option value="B">B</option>
                                    <option value="B-">B-</option>
                                    <option value="C+">C+</option>
                                    <option value="C">C</option>
                                    <option value="C-">C-</option>
                                    <option value="D+">D+</option>
                                    <option value="D">D</option>
                                    <option value="D-">D-</option>
                                    <option value="F">F</option>
                                  </select>
                                </td>
                                <td className="border border-gray-300 px-3 py-2 text-center">
                                  <button
                                    onClick={() => removeCourse(term.id, course.id)}
                                    className="text-red-600 hover:text-red-800 transition-colors"
                                  >
                                    <Minus className="h-4 w-4" />
                                  </button>
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    )}
                  </div>
                ))}
                
                {formData.terms.length === 0 && (
                  <div className="text-center py-8 border-2 border-dashed border-gray-300 rounded-lg">
                    <GraduationCap className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-600 mb-4">No terms added yet</p>
                    <button
                      onClick={addTerm}
                      className="bg-purple-600 text-white px-6 py-2 rounded-lg hover:bg-purple-700 transition-colors"
                    >
                      Add Your First Term
                    </button>
                  </div>
                )}
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
                      Review your information and click generate to create your academic transcript.
                    </p>
                    <div className="text-sm text-purple-600 space-y-1">
                      <p><strong>Institution:</strong> {formData.institutionName}</p>
                      <p><strong>Student:</strong> {formData.studentName}</p>
                      <p><strong>Major:</strong> {formData.major}</p>
                      <p><strong>Terms:</strong> {formData.terms.length}</p>
                      <p><strong>Calculated GPA:</strong> {calculateGPA().toFixed(2)}</p>
                    </div>
                  </div>
                  
                  <button
                    onClick={generateTranscript}
                    disabled={isGenerating}
                    className="bg-purple-600 text-white px-8 py-3 rounded-lg hover:bg-purple-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2 mx-auto"
                  >
                    <GraduationCap className="h-5 w-5" />
                    <span>{isGenerating ? 'Generating...' : 'Generate Transcript'}</span>
                  </button>
                </div>
              ) : (
                <div>
                  <div className="flex justify-between items-center mb-4">
                    <h3 className="text-lg font-medium text-gray-900">Generated Academic Transcript</h3>
                    <div className="flex space-x-3">
                      <button
                        onClick={printTranscript}
                        className="flex items-center space-x-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                      >
                        <Eye className="h-4 w-4" />
                        <span>Print</span>
                      </button>
                      <button
                        onClick={downloadTranscript}
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

export default AcademicTranscriptGenerator;