import React, { useState, useEffect } from 'react';
import { 
  FileText, 
  User, 
  Settings, 
  LogOut, 
  Plus, 
  Download, 
  Eye, 
  Copy,
  Calendar,
  TrendingUp,
  Clock,
  AlertCircle,
  Award,
  Search,
  Filter,
  ChevronDown,
  Building2,
  GraduationCap,
  Briefcase,
  Scale,
  DollarSign,
  CreditCard,
  Receipt,
  FileCheck,
  BookOpen,
  UserCheck,
  Heart,
  Home,
  Shield,
  Stethoscope,
  Car,
  Globe
} from 'lucide-react';
import { getDocumentTypeName, getDocumentIcon } from '../utils/documentTypes';

interface User {
  id: string;
  name: string;
  email: string;
  avatar: string;
  joinDate: string;
}

interface Document {
  id: string;
  type: string;
  name: string;
  createdAt: string;
  status: 'completed' | 'processing';
  category: string;
}

interface DashboardStats {
  totalDocuments: number;
  thisMonth: number;
  lastGenerated: string;
}

interface DashboardProps {
  user: User;
  onLogout: () => void;
  onNavigateToPaystub: () => void;
  onNavigateToW2: () => void;
  onNavigateToBankStatement: (data?: any) => void;
  onNavigateToCertificates: () => void;
  onNavigateTo1099: () => void;
  onNavigateToEmploymentVerification: () => void;
  onNavigateToAcademicTranscript: () => void;
  onNavigateToDashboard: () => void;
}

interface DocumentType {
  id: string;
  name: string;
  icon: React.ReactNode;
  available: boolean;
  comingSoon?: boolean;
  onClick?: () => void;
}

interface DocumentCategory {
  id: string;
  name: string;
  description: string;
  icon: React.ReactNode;
  color: string;
  documents: DocumentType[];
}

const Dashboard: React.FC<DashboardProps> = ({ 
  user, 
  onLogout, 
  onNavigateToPaystub, 
  onNavigateToW2,
  onNavigateToBankStatement,
  onNavigateToCertificates,
  onNavigateTo1099,
  onNavigateToEmploymentVerification,
  onNavigateToAcademicTranscript,
  onNavigateToDashboard 
}) => {
  const [documents, setDocuments] = useState<Document[]>([]);
  const [stats, setStats] = useState<DashboardStats>({
    totalDocuments: 0,
    thisMonth: 0,
    lastGenerated: 'Never'
  });
  const [activeTab, setActiveTab] = useState<'overview' | 'documents' | 'templates' | 'settings'>('overview');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All Categories');
  const [expandedCategories, setExpandedCategories] = useState<string[]>(['financial']);

  // Document categories with all types
  const documentCategories: DocumentCategory[] = [
    {
      id: 'financial',
      name: 'Financial Documents',
      description: 'Paystubs, tax forms, bank statements, and more.',
      icon: <Building2 className="h-6 w-6" />,
      color: 'bg-green-50 border-green-200 text-green-700',
      documents: [
        { id: 'paystubs', name: 'Paystubs', icon: <Receipt className="h-5 w-5" />, available: true, onClick: onNavigateToPaystub },
        { id: 'w2-forms', name: 'W-2 Forms', icon: <FileCheck className="h-5 w-5" />, available: true, onClick: onNavigateToW2 },
        { id: 'bank-statements', name: 'Bank Statements', icon: <Building2 className="h-5 w-5" />, available: true, onClick: () => onNavigateToBankStatement() },
        { id: '1099-forms', name: '1099 Forms', icon: <FileText className="h-5 w-5" />, available: true, onClick: onNavigateTo1099 },
        { id: 'tax-returns', name: 'Tax Returns (1040)', icon: <FileCheck className="h-5 w-5" />, available: false, comingSoon: true },
        { id: 'investment-statements', name: 'Investment Statements', icon: <TrendingUp className="h-5 w-5" />, available: false, comingSoon: true },
        { id: 'credit-card-statements', name: 'Credit Card Statements', icon: <CreditCard className="h-5 w-5" />, available: false, comingSoon: true },
        { id: 'utility-bills', name: 'Utility Bills', icon: <Receipt className="h-5 w-5" />, available: false, comingSoon: true }
      ]
    },
    {
      id: 'academic',
      name: 'Academic Documents',
      description: 'Diplomas, transcripts, offer letters, and more.',
      icon: <GraduationCap className="h-6 w-6" />,
      color: 'bg-purple-50 border-purple-200 text-purple-700',
      documents: [
        { id: 'diplomas', name: 'Diplomas', icon: <Award className="h-5 w-5" />, available: true, onClick: onNavigateToCertificates },
        { id: 'academic-transcripts', name: 'Academic Transcripts', icon: <BookOpen className="h-5 w-5" />, available: true, onClick: onNavigateToAcademicTranscript },
        { id: 'report-cards', name: 'Report Cards', icon: <FileCheck className="h-5 w-5" />, available: false, comingSoon: true },
        { id: 'university-offers', name: 'University Offer Letters', icon: <FileText className="h-5 w-5" />, available: false, comingSoon: true },
        { id: 'enrollment-verification', name: 'Enrollment Verification', icon: <UserCheck className="h-5 w-5" />, available: false, comingSoon: true },
        { id: 'student-id-cards', name: 'Student ID Cards', icon: <User className="h-5 w-5" />, available: false, comingSoon: true },
        { id: 'ged-certificates', name: 'GED Certificates', icon: <Award className="h-5 w-5" />, available: false, comingSoon: true }
      ]
    },
    {
      id: 'employment',
      name: 'Employment Documents',
      description: 'Verification letters, references, offer letters, and more.',
      icon: <Briefcase className="h-6 w-6" />,
      color: 'bg-blue-50 border-blue-200 text-blue-700',
      documents: [
        { id: 'employment-verification', name: 'Employment Verification', icon: <UserCheck className="h-5 w-5" />, available: true, onClick: onNavigateToEmploymentVerification },
        { id: 'professional-references', name: 'Professional References', icon: <FileText className="h-5 w-5" />, available: false, comingSoon: true },
        { id: 'offer-letters', name: 'Offer Letters', icon: <FileCheck className="h-5 w-5" />, available: false, comingSoon: true },
        { id: 'resignation-letters', name: 'Resignation Letters', icon: <FileText className="h-5 w-5" />, available: false, comingSoon: true },
        { id: 'performance-reviews', name: 'Performance Reviews', icon: <TrendingUp className="h-5 w-5" />, available: false, comingSoon: true },
        { id: 'payroll-history', name: 'Payroll History', icon: <DollarSign className="h-5 w-5" />, available: false, comingSoon: true },
        { id: 'nda-agreements', name: 'Non-Disclosure Agreements', icon: <Shield className="h-5 w-5" />, available: false, comingSoon: true }
      ]
    },
    {
      id: 'legal-personal',
      name: 'Legal & Personal',
      description: 'Agreements, medical notes, vehicle docs, and more.',
      icon: <Scale className="h-6 w-6" />,
      color: 'bg-orange-50 border-orange-200 text-orange-700',
      documents: [
        { id: 'esa-certificates', name: 'Emotional Support Animal', icon: <Heart className="h-5 w-5" />, available: false, comingSoon: true },
        { id: 'rental-agreements', name: 'Rental/Lease Agreements', icon: <Home className="h-5 w-5" />, available: false, comingSoon: true },
        { id: 'insurance-cards', name: 'Insurance Cards', icon: <Shield className="h-5 w-5" />, available: false, comingSoon: true },
        { id: 'medical-records', name: 'Medical Records', icon: <Stethoscope className="h-5 w-5" />, available: false, comingSoon: true },
        { id: 'doctors-notes', name: "Doctor's Notes", icon: <FileText className="h-5 w-5" />, available: false, comingSoon: true },
        { id: 'vehicle-registration', name: 'Vehicle Registration', icon: <Car className="h-5 w-5" />, available: false, comingSoon: true },
        { id: 'professional-certifications', name: 'Professional Certifications', icon: <Award className="h-5 w-5" />, available: false, comingSoon: true },
        { id: 'court-notices', name: 'Court/Legal Notices', icon: <Scale className="h-5 w-5" />, available: false, comingSoon: true },
        { id: 'immigration-documents', name: 'Immigration Documents', icon: <Globe className="h-5 w-5" />, available: false, comingSoon: true }
      ]
    }
  ];

  useEffect(() => {
    loadUserData();
  }, []);

  const loadUserData = () => {
    // Load documents from localStorage
    const savedDocuments = localStorage.getItem('buelldocs_documents');
    const userDocuments = savedDocuments ? JSON.parse(savedDocuments) : [];
    setDocuments(userDocuments);

    // Calculate stats
    const currentMonth = new Date().getMonth();
    const currentYear = new Date().getFullYear();
    const thisMonthDocs = userDocuments.filter((doc: Document) => {
      const docDate = new Date(doc.createdAt);
      return docDate.getMonth() === currentMonth && docDate.getFullYear() === currentYear;
    });

    const lastDoc = userDocuments.length > 0 ? userDocuments[0] : null;
    const lastGenerated = lastDoc 
      ? new Date(lastDoc.createdAt).toLocaleDateString('en-US', { 
          month: 'short', 
          day: 'numeric', 
          year: 'numeric' 
        })
      : 'Never';

    setStats({
      totalDocuments: userDocuments.length,
      thisMonth: thisMonthDocs.length,
      lastGenerated
    });
  };

  const handleDocumentAction = (action: string, docId: string) => {
    const doc = documents.find(d => d.id === docId);
    if (!doc) return;

    switch (action) {
      case 'download':
        alert(`Downloading ${doc.name}...`);
        break;
      case 'view':
        alert(`Opening ${doc.name} for preview...`);
        break;
      case 'duplicate':
        alert(`Creating a copy of ${doc.name}...`);
        break;
      case 'delete':
        if (confirm(`Are you sure you want to delete ${doc.name}?`)) {
          const updatedDocuments = documents.filter(d => d.id !== docId);
          setDocuments(updatedDocuments);
          localStorage.setItem('buelldocs_documents', JSON.stringify(updatedDocuments));
          loadUserData(); // Refresh stats
        }
        break;
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'numeric',
      day: 'numeric',
      year: 'numeric'
    });
  };

  const getDocumentIcon = (type: string) => {
    return getDocumentIcon(type);
  };

  const getDocumentTypeName = (type: string) => {
    return getDocumentTypeName(type);
  };

  const toggleCategoryExpansion = (categoryId: string) => {
    setExpandedCategories(prev => 
      prev.includes(categoryId) 
        ? prev.filter(id => id !== categoryId)
        : [...prev, categoryId]
    );
  };

  const filteredDocuments = documents.filter(doc => {
    const matchesSearch = doc.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         getDocumentTypeName(doc.type).toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === 'All Categories' || doc.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const memberSince = new Date(user.joinDate).toLocaleDateString('en-US', {
    month: 'long',
    year: 'numeric'
  });

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-3">
              <FileText className="h-8 w-8 text-blue-600" />
              <span className="text-2xl font-bold text-gray-900">BuellDocs</span>
            </div>
            
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center text-white text-sm font-semibold">
                  {user.avatar}
                </div>
                <div className="hidden md:block">
                  <p className="text-sm font-medium text-gray-900">{user.name}</p>
                  <p className="text-xs text-gray-500">{user.email}</p>
                </div>
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

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex flex-col lg:flex-row gap-8">
          {/* Sidebar */}
          <div className="lg:w-64">
            <nav className="bg-white rounded-lg shadow-sm p-4">
              <ul className="space-y-2">
                <li>
                  <button
                    onClick={() => setActiveTab('overview')}
                    className={`w-full flex items-center space-x-3 px-3 py-2 rounded-lg text-left transition-colors ${
                      activeTab === 'overview' 
                        ? 'bg-blue-50 text-blue-700 border-r-2 border-blue-700' 
                        : 'text-gray-700 hover:bg-gray-50'
                    }`}
                  >
                    <TrendingUp className="h-5 w-5" />
                    <span>Overview</span>
                  </button>
                </li>
                <li>
                  <button
                    onClick={() => setActiveTab('documents')}
                    className={`w-full flex items-center space-x-3 px-3 py-2 rounded-lg text-left transition-colors ${
                      activeTab === 'documents' 
                        ? 'bg-blue-50 text-blue-700 border-r-2 border-blue-700' 
                        : 'text-gray-700 hover:bg-gray-50'
                    }`}
                  >
                    <FileText className="h-5 w-5" />
                    <span>My Documents</span>
                  </button>
                </li>
                <li>
                  <button
                    onClick={() => setActiveTab('templates')}
                    className={`w-full flex items-center space-x-3 px-3 py-2 rounded-lg text-left transition-colors opacity-60 cursor-not-allowed ${
                      activeTab === 'templates' 
                        ? 'bg-blue-50 text-blue-700 border-r-2 border-blue-700' 
                        : 'text-gray-700'
                    }`}
                    disabled
                  >
                    <Copy className="h-5 w-5" />
                    <span>Templates</span>
                    <span className="text-xs text-gray-400 ml-auto">Soon</span>
                  </button>
                </li>
                <li>
                  <button
                    onClick={() => setActiveTab('settings')}
                    className={`w-full flex items-center space-x-3 px-3 py-2 rounded-lg text-left transition-colors opacity-60 cursor-not-allowed ${
                      activeTab === 'settings' 
                        ? 'bg-blue-50 text-blue-700 border-r-2 border-blue-700' 
                        : 'text-gray-700'
                    }`}
                    disabled
                  >
                    <Settings className="h-5 w-5" />
                    <span>Settings</span>
                    <span className="text-xs text-gray-400 ml-auto">Soon</span>
                  </button>
                </li>
              </ul>
            </nav>
          </div>

          {/* Main Content */}
          <div className="flex-1">
            {activeTab === 'overview' && (
              <div className="space-y-6">
                {/* Welcome Section */}
                <div className="bg-white rounded-lg shadow-sm p-6">
                  <h1 className="text-2xl font-bold text-gray-900 mb-2">
                    Welcome back, {user.name}!
                  </h1>
                  <p className="text-gray-600">
                    You've been a member since {memberSince}
                  </p>
                </div>

                {/* Stats Cards */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="bg-white rounded-lg shadow-sm p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-gray-600">Total Documents Generated</p>
                        <p className="text-3xl font-bold text-gray-900">{stats.totalDocuments}</p>
                        <p className="text-xs text-gray-500">All time</p>
                      </div>
                      <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                        <FileText className="h-6 w-6 text-blue-600" />
                      </div>
                    </div>
                  </div>

                  <div className="bg-white rounded-lg shadow-sm p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-gray-600">This Month's Documents</p>
                        <p className="text-3xl font-bold text-gray-900">{stats.thisMonth}</p>
                        <p className="text-xs text-gray-500">Since start of month</p>
                      </div>
                      <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                        <Calendar className="h-6 w-6 text-green-600" />
                      </div>
                    </div>
                  </div>

                  <div className="bg-white rounded-lg shadow-sm p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-gray-600">Last Generated</p>
                        <p className="text-lg font-bold text-gray-900">{stats.lastGenerated === 'Never' ? 'Paystub' : stats.lastGenerated}</p>
                        <p className="text-xs text-gray-500">{stats.lastGenerated === 'Never' ? 'On July 20, 2024' : ''}</p>
                      </div>
                      <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
                        <Clock className="h-6 w-6 text-purple-600" />
                      </div>
                    </div>
                  </div>
                </div>

                {/* Create a Document Section */}
                <div className="bg-white rounded-lg shadow-sm p-6">
                  <div className="flex items-center justify-between mb-6">
                    <h2 className="text-lg font-semibold text-gray-900">Create a Document</h2>
                    <div className="relative">
                      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                      <input
                        type="text"
                        placeholder="Search document types..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 w-64"
                      />
                    </div>
                  </div>

                  <div className="space-y-6">
                    {documentCategories.map((category) => (
                      <div key={category.id} className={`border rounded-lg p-4 ${category.color}`}>
                        <button
                          onClick={() => toggleCategoryExpansion(category.id)}
                          className="w-full flex items-center justify-between text-left"
                        >
                          <div className="flex items-center space-x-3">
                            {category.icon}
                            <div>
                              <h3 className="font-semibold">{category.name}</h3>
                              <p className="text-sm opacity-75">{category.description}</p>
                            </div>
                          </div>
                          <ChevronDown 
                            className={`h-5 w-5 transition-transform ${
                              expandedCategories.includes(category.id) ? 'rotate-180' : ''
                            }`} 
                          />
                        </button>

                        {expandedCategories.includes(category.id) && (
                          <div className="mt-4 grid grid-cols-1 md:grid-cols-3 gap-3">
                            {category.documents.slice(0, 6).map((doc) => (
                              <button
                                key={doc.id}
                                onClick={doc.available ? doc.onClick : undefined}
                                disabled={!doc.available}
                                className={`flex items-center space-x-3 p-3 rounded-lg border-2 transition-colors text-left ${
                                  doc.available
                                    ? 'border-white bg-white hover:border-blue-300 hover:bg-blue-50 cursor-pointer'
                                    : 'border-gray-200 bg-gray-50 cursor-not-allowed opacity-60'
                                }`}
                              >
                                {doc.icon}
                                <div className="flex-1">
                                  <div className="font-medium text-gray-900">{doc.name}</div>
                                  {doc.comingSoon && (
                                    <div className="text-xs text-gray-500">Coming Soon</div>
                                  )}
                                </div>
                              </button>
                            ))}
                            {category.documents.length > 6 && (
                              <button className="flex items-center justify-center p-3 rounded-lg border-2 border-dashed border-gray-300 text-gray-500 hover:border-gray-400 hover:text-gray-600 transition-colors">
                                <span className="text-sm">View All {category.documents.length} Documents</span>
                              </button>
                            )}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'documents' && (
              <div className="space-y-6">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                  <h1 className="text-2xl font-bold text-gray-900">My Documents</h1>
                  <div className="flex items-center space-x-4">
                    <div className="relative">
                      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                      <input
                        type="text"
                        placeholder="Search your documents..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 w-64"
                      />
                    </div>
                    <div className="relative">
                      <select
                        value={selectedCategory}
                        onChange={(e) => setSelectedCategory(e.target.value)}
                        className="appearance-none bg-white border border-gray-300 rounded-lg px-4 py-2 pr-8 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      >
                        <option value="All Categories">All Categories</option>
                        <option value="financial">Financial</option>
                        <option value="academic">Academic</option>
                        <option value="employment">Employment</option>
                        <option value="legal">Legal & Personal</option>
                      </select>
                      <ChevronDown className="absolute right-2 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400 pointer-events-none" />
                    </div>
                  </div>
                </div>

                {filteredDocuments.length === 0 ? (
                  <div className="bg-white rounded-lg shadow-sm p-12 text-center">
                    <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-gray-900 mb-2">No documents yet</h3>
                    <p className="text-gray-600 mb-6">Get started by creating your first document</p>
                    <div className="flex justify-center space-x-4">
                      <button
                        onClick={onNavigateToPaystub}
                        className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors"
                      >
                        Create Paystub
                      </button>
                      <button
                        onClick={onNavigateToW2}
                        className="bg-green-600 text-white px-6 py-2 rounded-lg hover:bg-green-700 transition-colors"
                      >
                        Create W-2
                      </button>
                      <button
                        onClick={onNavigateToCertificates}
                        className="bg-purple-600 text-white px-6 py-2 rounded-lg hover:bg-purple-700 transition-colors"
                      >
                        Create Certificate
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="bg-white rounded-lg shadow-sm overflow-hidden">
                    <div className="overflow-x-auto">
                      <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                          <tr>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                              Type
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                              Name
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                              Date
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                              Status
                            </th>
                            <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                              Actions
                            </th>
                          </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                          {filteredDocuments.map((doc) => (
                            <tr key={doc.id} className="hover:bg-gray-50">
                              <td className="px-6 py-4 whitespace-nowrap">
                                <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                                  doc.type === 'paystub' ? 'bg-green-100 text-green-800' :
                                  doc.type === 'w2' ? 'bg-blue-100 text-blue-800' :
                                  doc.type === 'bankStatement' ? 'bg-purple-100 text-purple-800' :
                                  'bg-gray-100 text-gray-800'
                                }`}>
                                  {getDocumentTypeName(doc.type)}
                                </span>
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                                {doc.name}
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                {formatDate(doc.createdAt)}
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap">
                                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                                  Generated
                                </span>
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                <div className="flex items-center justify-end space-x-2">
                                  <button
                                    onClick={() => handleDocumentAction('view', doc.id)}
                                    className="text-blue-600 hover:text-blue-900 transition-colors"
                                  >
                                    View
                                  </button>
                                  <button
                                    onClick={() => handleDocumentAction('download', doc.id)}
                                    className="text-green-600 hover:text-green-900 transition-colors"
                                  >
                                    Download
                                  </button>
                                  <button
                                    onClick={() => handleDocumentAction('delete', doc.id)}
                                    className="text-red-600 hover:text-red-900 transition-colors"
                                  >
                                    Delete
                                  </button>
                                </div>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                )}
              </div>
            )}

            {activeTab === 'templates' && (
              <div className="bg-white rounded-lg shadow-sm p-12 text-center">
                <AlertCircle className="h-12 w-12 text-yellow-500 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">Templates Coming Soon</h3>
                <p className="text-gray-600">
                  Save and reuse your document templates for faster generation.
                </p>
              </div>
            )}

            {activeTab === 'settings' && (
              <div className="bg-white rounded-lg shadow-sm p-12 text-center">
                <AlertCircle className="h-12 w-12 text-yellow-500 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">Settings Coming Soon</h3>
                <p className="text-gray-600">
                  Manage your account preferences and document settings.
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;