import React, { useState, useEffect } from 'react';
import { FileText, Users, Shield, Star, CheckCircle, Download, CreditCard } from 'lucide-react';
import Dashboard from './components/Dashboard';
import PaystubGenerator from './components/PaystubGenerator';
import W2Generator from './components/W2Generator';
import BankStatementGenerator from './components/BankStatementGenerator';
import CertificatesGenerator from './components/CertificatesGenerator';
import Form1099Generator from './components/generators/Form1099Generator';
import EmploymentVerificationGenerator from './components/generators/EmploymentVerificationGenerator';
import AcademicTranscriptGenerator from './components/generators/AcademicTranscriptGenerator';
import AuthModal from './components/AuthModal';

interface User {
  id: string;
  name: string;
  email: string;
  avatar: string;
  joinDate: string;
}

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [authMode, setAuthMode] = useState<'login' | 'register'>('login');
  const [currentView, setCurrentView] = useState<'landing' | 'dashboard' | 'paystub-generator' | 'w2-generator' | 'bank-statement-generator' | 'certificates-generator' | '1099-generator' | 'employment-verification-generator' | 'academic-transcript-generator'>('landing');
  const [bankStatementPrefilledData, setBankStatementPrefilledData] = useState<any>(null);

  // Import Firebase utilities
  useEffect(() => {
    // Initialize Firebase connection
    import('./utils/firebase').then(() => {
      console.log('Firebase initialized successfully');
    }).catch((error) => {
      console.error('Firebase initialization error:', error);
    });
  }, []);

  useEffect(() => {
    // Check for existing session
    const savedUser = localStorage.getItem('buelldocs_user');
    if (savedUser) {
      const user = JSON.parse(savedUser);
      setCurrentUser(user);
      setIsAuthenticated(true);
      setCurrentView('dashboard');
    }
  }, []);

  const handleLogin = async (email: string, password: string) => {
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    const user: User = {
      id: Date.now().toString(),
      name: email.split('@')[0].replace(/[^a-zA-Z]/g, ' ').replace(/\b\w/g, l => l.toUpperCase()),
      email: email,
      avatar: email.split('@')[0].substring(0, 2).toUpperCase(),
      joinDate: new Date().toISOString()
    };

    setCurrentUser(user);
    setIsAuthenticated(true);
    localStorage.setItem('buelldocs_user', JSON.stringify(user));
    setShowAuthModal(false);
    setCurrentView('dashboard');
  };

  const handleRegister = async (name: string, email: string, password: string) => {
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    const user: User = {
      id: Date.now().toString(),
      name: name,
      email: email,
      avatar: name.split(' ').map(n => n[0]).join('').toUpperCase(),
      joinDate: new Date().toISOString()
    };

    setCurrentUser(user);
    setIsAuthenticated(true);
    localStorage.setItem('buelldocs_user', JSON.stringify(user));
    setShowAuthModal(false);
    setCurrentView('dashboard');
  };

  const handleLogout = () => {
    setCurrentUser(null);
    setIsAuthenticated(false);
    localStorage.removeItem('buelldocs_user');
    localStorage.removeItem('buelldocs_documents');
    localStorage.removeItem('buelldocs_stats');
    setCurrentView('landing');
  };

  const openAuthModal = (mode: 'login' | 'register') => {
    setAuthMode(mode);
    setShowAuthModal(true);
  };

  const handleStartCreatingDocuments = () => {
    if (isAuthenticated) {
      setCurrentView('paystub-generator');
    } else {
      openAuthModal('register');
    }
  };

  const handleViewSamples = () => {
    // For now, show a message that this is coming soon
    alert('Sample documents feature coming soon! Sign up to start creating your own documents.');
  };
  
  const handleNavigateToBankStatement = (paystubData?: any) => {
    if (paystubData) {
      setBankStatementPrefilledData(paystubData);
    }
    setCurrentView('bank-statement-generator');
  };

  if (currentView === 'dashboard' && isAuthenticated) {
    return (
      <Dashboard 
        user={currentUser!}
        onLogout={handleLogout}
        onNavigateToPaystub={() => setCurrentView('paystub-generator')}
        onNavigateToW2={() => setCurrentView('w2-generator')}
        onNavigateToBankStatement={handleNavigateToBankStatement}
        onNavigateToCertificates={() => setCurrentView('certificates-generator')}
        onNavigateTo1099={() => setCurrentView('1099-generator')}
        onNavigateToEmploymentVerification={() => setCurrentView('employment-verification-generator')}
        onNavigateToAcademicTranscript={() => setCurrentView('academic-transcript-generator')}
        onNavigateToDashboard={() => setCurrentView('dashboard')}
      />
    );
  }

  if (currentView === 'paystub-generator' && isAuthenticated) {
    return (
      <PaystubGenerator 
        user={currentUser!}
        onBack={() => setCurrentView('dashboard')}
        onLogout={handleLogout}
        onNavigateToBankStatement={() => handleNavigateToBankStatement()}
      />
    );
  }

  if (currentView === 'w2-generator' && isAuthenticated) {
    return (
      <W2Generator 
        user={currentUser!}
        onBack={() => setCurrentView('dashboard')}
        onLogout={handleLogout}
      />
    );
  }

  if (currentView === 'bank-statement-generator' && isAuthenticated) {
    return (
      <BankStatementGenerator 
        user={currentUser!}
        onBack={() => setCurrentView('dashboard')}
        onLogout={handleLogout}
        prefilledData={bankStatementPrefilledData}
      />
    );
  }

  if (currentView === 'certificates-generator' && isAuthenticated) {
    return (
      <CertificatesGenerator 
        user={currentUser!}
        onBack={() => setCurrentView('dashboard')}
        onLogout={handleLogout}
      />
    );
  }

  if (currentView === '1099-generator' && isAuthenticated) {
    return (
      <Form1099Generator 
        user={currentUser!}
        onBack={() => setCurrentView('dashboard')}
        onLogout={handleLogout}
      />
    );
  }

  if (currentView === 'employment-verification-generator' && isAuthenticated) {
    return (
      <EmploymentVerificationGenerator 
        user={currentUser!}
        onBack={() => setCurrentView('dashboard')}
        onLogout={handleLogout}
      />
    );
  }

  if (currentView === 'academic-transcript-generator' && isAuthenticated) {
    return (
      <AcademicTranscriptGenerator 
        user={currentUser!}
        onBack={() => setCurrentView('dashboard')}
        onLogout={handleLogout}
      />
    );
  }
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-3">
              <FileText className="h-8 w-8 text-blue-600" />
              <span className="text-2xl font-bold text-gray-900">BuellDocs</span>
            </div>
            
            <nav className="hidden md:flex items-center space-x-8">
              <a href="#features" className="text-gray-600 hover:text-blue-600 transition-colors">Features</a>
              <a href="#pricing" className="text-gray-600 hover:text-blue-600 transition-colors">Pricing</a>
              <a href="#about" className="text-gray-600 hover:text-blue-600 transition-colors">About</a>
            </nav>

            <div className="flex items-center space-x-4">
              {isAuthenticated ? (
                <>
                  <button
                    onClick={() => setCurrentView('dashboard')}
                    className="text-gray-600 hover:text-blue-600 transition-colors"
                  >
                    Dashboard
                  </button>
                  <button
                    onClick={handleLogout}
                    className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
                  >
                    Sign Out
                  </button>
                </>
              ) : (
                <>
                  <button
                    onClick={() => openAuthModal('login')}
                    className="text-gray-600 hover:text-blue-600 transition-colors"
                  >
                    Sign In
                  </button>
                  <button
                    onClick={() => openAuthModal('register')}
                    className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
                  >
                    Get Started
                  </button>
                </>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto text-center">
          <h1 className="text-5xl font-bold text-gray-900 mb-6">
            Professional Document Generation
            <span className="block text-blue-600 mt-2">Made Simple</span>
          </h1>
          <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto">
            Create authentic-looking paystubs, W-2 forms, and employment documents in minutes. 
            Perfect for novelty purposes, templates, and educational use.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button
              onClick={handleStartCreatingDocuments}
              className="bg-blue-600 text-white px-8 py-4 rounded-lg text-lg font-semibold hover:bg-blue-700 transition-colors flex items-center justify-center space-x-2"
            >
              <FileText className="h-5 w-5" />
              <span>Start Creating Documents</span>
            </button>
            <button 
              onClick={handleViewSamples}
              className="border-2 border-blue-600 text-blue-600 px-8 py-4 rounded-lg text-lg font-semibold hover:bg-blue-50 transition-colors"
            >
              View Sample Documents
            </button>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Why Choose BuellDocs?</h2>
            <p className="text-xl text-gray-600">Professional-grade document generation with industry-leading accuracy</p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            <div className="text-center p-6">
              <div className="bg-blue-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <Shield className="h-8 w-8 text-blue-600" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">Secure & Private</h3>
              <p className="text-gray-600">Your data is encrypted and never stored permanently. Complete privacy guaranteed.</p>
            </div>

            <div className="text-center p-6">
              <div className="bg-green-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <CheckCircle className="h-8 w-8 text-green-600" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">Accurate Calculations</h3>
              <p className="text-gray-600">Automatic tax calculations and deductions based on current federal and state rates.</p>
            </div>

            <div className="text-center p-6">
              <div className="bg-purple-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <Download className="h-8 w-8 text-purple-600" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">Instant Download</h3>
              <p className="text-gray-600">Generate and download professional PDF documents in seconds.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Document Types */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Document Types</h2>
            <p className="text-xl text-gray-600">Professional templates for all your document needs</p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[
              { name: 'Paystubs', desc: 'Professional payroll statements with accurate calculations', icon: '📊', available: true },
              { name: 'W-2 Forms', desc: 'Complete tax forms with all required information', icon: '📋', available: true },
              { name: 'Bank Statements', desc: 'Detailed financial statements with transaction history', icon: '🏦', available: true },
              { name: 'Certificates & Diplomas', desc: 'Educational and professional certifications', icon: '🎓', available: true },
              { name: 'Utility Bills', desc: 'Professional utility and service bills', icon: '⚡', available: false },
              { name: 'Insurance Documents', desc: 'Coverage verification and policy documents', icon: '🛡️', available: false }
            ].map((doc, index) => (
              <div key={index} className={`bg-white p-6 rounded-lg shadow-sm border border-gray-200 hover:shadow-md transition-shadow ${!doc.available ? 'opacity-60' : ''}`}>
                <div className="text-3xl mb-3">{doc.icon}</div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  {doc.name}
                  {!doc.available && <span className="text-sm text-gray-500 ml-2">(Coming Soon)</span>}
                </h3>
                <p className="text-gray-600 text-sm">{doc.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section id="pricing" className="py-20 bg-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Simple, Transparent Pricing</h2>
            <p className="text-xl text-gray-600">Pay per document or choose a bundle for better value</p>
          </div>

          <div className="grid md:grid-cols-2 gap-8">
            <div className="border-2 border-gray-200 rounded-lg p-8 text-center">
              <h3 className="text-2xl font-bold text-gray-900 mb-4">Per Document</h3>
              <div className="text-4xl font-bold text-blue-600 mb-2">$9.99</div>
              <p className="text-gray-600 mb-6">Perfect for one-time use</p>
              <ul className="text-left space-y-3 mb-8">
                <li className="flex items-center space-x-2">
                  <CheckCircle className="h-5 w-5 text-green-500" />
                  <span>Single document generation</span>
                </li>
                <li className="flex items-center space-x-2">
                  <CheckCircle className="h-5 w-5 text-green-500" />
                  <span>PDF download</span>
                </li>
                <li className="flex items-center space-x-2">
                  <CheckCircle className="h-5 w-5 text-green-500" />
                  <span>24/7 support</span>
                </li>
              </ul>
              <button className="w-full bg-gray-300 text-gray-600 py-3 rounded-lg font-semibold cursor-not-allowed" disabled>
                Coming Soon
              </button>
            </div>

            <div className="border-2 border-blue-500 rounded-lg p-8 text-center relative">
              <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                <span className="bg-blue-500 text-white px-4 py-1 rounded-full text-sm font-semibold">Most Popular</span>
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-4">Document Bundle</h3>
              <div className="text-4xl font-bold text-blue-600 mb-2">$24.99</div>
              <p className="text-gray-600 mb-6">Best value for multiple documents</p>
              <ul className="text-left space-y-3 mb-8">
                <li className="flex items-center space-x-2">
                  <CheckCircle className="h-5 w-5 text-green-500" />
                  <span>5 document generations</span>
                </li>
                <li className="flex items-center space-x-2">
                  <CheckCircle className="h-5 w-5 text-green-500" />
                  <span>All document types</span>
                </li>
                <li className="flex items-center space-x-2">
                  <CheckCircle className="h-5 w-5 text-green-500" />
                  <span>Certificates & Diplomas</span>
                </li>
                <li className="flex items-center space-x-2">
                  <CheckCircle className="h-5 w-5 text-green-500" />
                  <span>Priority support</span>
                </li>
                <li className="flex items-center space-x-2">
                  <CheckCircle className="h-5 w-5 text-green-500" />
                  <span>30-day validity</span>
                </li>
              </ul>
              <button className="w-full bg-gray-300 text-gray-600 py-3 rounded-lg font-semibold cursor-not-allowed" disabled>
                Coming Soon
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Legal Notice */}
      <section className="py-12 bg-yellow-50 border-t border-yellow-200">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="bg-yellow-100 border border-yellow-300 rounded-lg p-6">
            <h3 className="text-lg font-semibold text-yellow-800 mb-2">Important Legal Notice</h3>
            <p className="text-yellow-700">
              All documents generated by BuellDocs are intended for <strong>novelty and educational purposes only</strong>. 
              These documents should not be used for any fraudulent activities, misrepresentation, or illegal purposes. 
              Users are solely responsible for ensuring their use complies with all applicable laws and regulations.
            </p>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-4 gap-8">
            <div>
              <div className="flex items-center space-x-2 mb-4">
                <FileText className="h-6 w-6" />
                <span className="text-xl font-bold">BuellDocs</span>
              </div>
              <p className="text-gray-400">Professional document generation for novelty and educational purposes.</p>
            </div>
            
            <div>
              <h4 className="font-semibold mb-4">Services</h4>
              <ul className="space-y-2 text-gray-400">
                <li>Paystub Generation</li>
                <li>W-2 Forms</li>
                <li>Bank Statements</li>
                <li>Certificates & Diplomas</li>
              </ul>
            </div>
            
            <div>
              <h4 className="font-semibold mb-4">Support</h4>
              <ul className="space-y-2 text-gray-400">
                <li className="text-gray-500">Help Center (Coming Soon)</li>
                <li className="text-gray-500">Contact Us (Coming Soon)</li>
                <li className="text-gray-500">Privacy Policy (Coming Soon)</li>
                <li className="text-gray-500">Terms of Service (Coming Soon)</li>
              </ul>
            </div>
            
            <div>
              <h4 className="font-semibold mb-4">Legal Notice</h4>
              <p className="text-gray-400 text-sm">
                All documents are for novelty purposes only. Not intended for fraudulent use.
              </p>
            </div>
          </div>
          
          <div className="border-t border-gray-800 mt-8 pt-8 text-center text-gray-400">
            <p>&copy; 2025 BuellDocs. All rights reserved.</p>
          </div>
        </div>
      </footer>

      {/* Auth Modal */}
      {showAuthModal && (
        <AuthModal
          mode={authMode}
          onClose={() => setShowAuthModal(false)}
          onLogin={handleLogin}
          onRegister={handleRegister}
          onSwitchMode={(mode) => setAuthMode(mode)}
        />
      )}
    </div>
  );
}

export default App;