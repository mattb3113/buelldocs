import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

const Dashboard: React.FC = () => {
  const { user } = useAuth();

  const documentTypes = [
    {
      title: 'Paystub Generator',
      description: 'Generate professional paystubs with detailed earnings and deductions',
      link: '/paystub-generator',
      icon: '💰',
      color: 'bg-green-50 border-green-200 hover:bg-green-100'
    },
    {
      title: 'Invoice Generator',
      description: 'Create professional invoices for your business',
      link: '/invoice-generator',
      icon: '📄',
      color: 'bg-blue-50 border-blue-200 hover:bg-blue-100',
      disabled: true
    },
    {
      title: 'Receipt Generator',
      description: 'Generate receipts for transactions and purchases',
      link: '/receipt-generator',
      icon: '🧾',
      color: 'bg-purple-50 border-purple-200 hover:bg-purple-100',
      disabled: true
    },
    {
      title: 'Tax Document Generator',
      description: 'Create various tax-related documents',
      link: '/tax-generator',
      icon: '📊',
      color: 'bg-orange-50 border-orange-200 hover:bg-orange-100',
      disabled: true
    }
  ];

  return (
    <div className="max-w-7xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">
          Welcome back, {user?.name}!
        </h1>
        <p className="mt-2 text-gray-600">
          Choose a document type to get started with generating your documents.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {documentTypes.map((docType, index) => (
          <div key={index} className="relative">
            {docType.disabled ? (
              <div className={`p-6 rounded-lg border-2 ${docType.color} opacity-50 cursor-not-allowed`}>
                <div className="flex items-center mb-4">
                  <span className="text-2xl mr-3">{docType.icon}</span>
                  <h3 className="text-lg font-semibold text-gray-900">
                    {docType.title}
                  </h3>
                </div>
                <p className="text-gray-600 mb-4">{docType.description}</p>
                <div className="text-sm text-gray-500">Coming Soon</div>
              </div>
            ) : (
              <Link
                to={docType.link}
                className={`block p-6 rounded-lg border-2 ${docType.color} transition-colors duration-200`}
              >
                <div className="flex items-center mb-4">
                  <span className="text-2xl mr-3">{docType.icon}</span>
                  <h3 className="text-lg font-semibold text-gray-900">
                    {docType.title}
                  </h3>
                </div>
                <p className="text-gray-600 mb-4">{docType.description}</p>
                <div className="text-blue-600 font-medium">
                  Get Started →
                </div>
              </Link>
            )}
          </div>
        ))}
      </div>

      <div className="mt-12 bg-gray-50 rounded-lg p-6">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">
          Recent Activity
        </h2>
        <div className="text-gray-600">
          <p>No recent document generation activity.</p>
          <p className="mt-2 text-sm">
            Start by generating your first document using one of the tools above.
          </p>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;