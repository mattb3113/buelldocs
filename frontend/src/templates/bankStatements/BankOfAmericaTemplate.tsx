import React from 'react';

interface BankOfAmericaTemplateProps {
  data: {
    accountHolderName: string;
    accountHolderAddress: string;
    accountHolderCityStateZip: string;
    accountNumber: string;
    statementPeriod: string;
    accountType: string;
    beginningBalance: number;
    depositsAmount: number;
    atmDebitAmount: number;
    otherSubtractions: number;
    checksAmount: number;
    serviceFees: number;
    endingBalance: number;
    transactions: Array<{
      date: string;
      description: string;
      amount: number;
      type: 'deposit' | 'withdrawal';
    }>;
    generatedDate: string;
  };
}

const BankOfAmericaTemplate: React.FC<BankOfAmericaTemplateProps> = ({ data }) => {
  return (
    <div style={{
      fontFamily: 'Arial, sans-serif',
      fontSize: '12px',
      color: '#333',
      margin: '0',
      padding: '20px',
      backgroundColor: '#f5f5f5'
    }}>
      <style>{`
        .statement-container {
          max-width: 800px;
          margin: 0 auto;
          background-color: white;
          border: 1px solid #ddd;
          padding: 20px;
          box-shadow: 0 0 10px rgba(0,0,0,0.1);
        }
        .header {
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
          border-bottom: 2px solid #00539b;
          padding-bottom: 15px;
          margin-bottom: 20px;
        }
        .logo-section {
          display: flex;
          align-items: center;
        }
        .logo {
          width: 120px;
          height: auto;
          margin-right: 15px;
        }
        .bank-name {
          font-size: 18px;
          font-weight: bold;
          color: #00539b;
        }
        .address-section {
          text-align: right;
          font-size: 11px;
        }
        .address-section p {
          margin: 5px 0;
        }
        .customer-info {
          margin-bottom: 20px;
          padding-bottom: 15px;
          border-bottom: 1px solid #ddd;
        }
        .customer-name {
          font-size: 16px;
          font-weight: bold;
          margin-bottom: 10px;
          color: #00539b;
        }
        .customer-address {
          margin: 5px 0;
        }
        .account-details {
          display: flex;
          justify-content: space-between;
          margin-bottom: 20px;
          padding-bottom: 15px;
          border-bottom: 1px solid #ddd;
        }
        .account-type {
          font-size: 14px;
          font-weight: bold;
          color: #00539b;
        }
        .account-number {
          font-weight: bold;
        }
        .statement-period {
          font-size: 12px;
          color: #666;
        }
        .account-summary {
          margin-bottom: 30px;
        }
        .account-summary h3 {
          background-color: #00539b;
          color: white;
          padding: 10px;
          margin: 0 0 15px 0;
          font-size: 14px;
        }
        .summary-table {
          width: 100%;
          border-collapse: collapse;
        }
        .summary-table th, .summary-table td {
          padding: 10px;
          text-align: left;
          border-bottom: 1px solid #ddd;
        }
        .summary-table th {
          background-color: #f0f0f0;
          font-weight: bold;
        }
        .summary-table .amount {
          text-align: right;
          font-weight: bold;
        }
        .tip-section {
          background-color: #f9f9f9;
          border: 1px solid #ddd;
          padding: 15px;
          margin-bottom: 30px;
        }
        .tip-section h3 {
          margin-top: 0;
          color: #00539b;
        }
        .tip-section p {
          margin: 10px 0;
        }
        .tip-section .highlight {
          font-weight: bold;
          color: #00539b;
        }
        .footer {
          text-align: center;
          margin-top: 30px;
          padding-top: 15px;
          border-top: 1px solid #ddd;
          color: #666;
          font-size: 10px;
        }
      `}</style>
      
      <div className="statement-container">
        <div className="header">
          <div className="logo-section">
            <div className="bank-name">Bank of America, N.A.</div>
          </div>
          <div className="address-section">
            <p>P.O. Box 15284</p>
            <p>Wilmington, DE 19850</p>
            <p>Customer service information</p>
            <p>Customer service 1.800.432.1000</p>
            <p>TDD/TTY users only: 1.800.288.4408</p>
            <p>En Español: 1.800.688.6086</p>
            <p>bankofamerica.com</p>
          </div>
        </div>
        
        <div className="customer-info">
          <div className="customer-name">{data.accountHolderName}</div>
          <div className="customer-address">{data.accountHolderAddress}</div>
          <div className="customer-address">{data.accountHolderCityStateZip}</div>
        </div>
        
        <div className="account-details">
          <div>
            <div className="account-type">{data.accountType}</div>
            <div className="account-number">Account Number: {data.accountNumber}</div>
          </div>
          <div className="statement-period">
            {data.statementPeriod}
          </div>
        </div>
        
        <div className="account-summary">
          <h3>Account Summary</h3>
          <table className="summary-table">
            <tbody>
              <tr>
                <th>Beginning balance on {data.statementPeriod.split(' - ')[0]}</th>
                <td className="amount">${data.beginningBalance.toFixed(2)}</td>
              </tr>
              <tr>
                <th>Deposits and other additions</th>
                <td className="amount">${data.depositsAmount.toFixed(2)}</td>
              </tr>
              <tr>
                <th>ATM and debit card subtractions</th>
                <td className="amount">-${data.atmDebitAmount.toFixed(2)}</td>
              </tr>
              <tr>
                <th>Other subtractions</th>
                <td className="amount">-${data.otherSubtractions.toFixed(2)}</td>
              </tr>
              <tr>
                <th>Checks</th>
                <td className="amount">-${data.checksAmount.toFixed(2)}</td>
              </tr>
              <tr>
                <th>Service fees</th>
                <td className="amount">-${data.serviceFees.toFixed(2)}</td>
              </tr>
              <tr>
                <th>Ending balance on {data.statementPeriod.split(' - ')[1]}</th>
                <td className="amount">${data.endingBalance.toFixed(2)}</td>
              </tr>
            </tbody>
          </table>
        </div>
        
        <div className="tip-section">
          <h3>Here's a tip</h3>
          <p>Don't miss important account notifications – keep your contact information updated.</p>
          <p>It's quick and easy to keep your phone number, email and mailing address up to date. Go to Profile & Settings and review your information. You'll help make sure you receive all of your notices and help stay on top of your account.</p>
          <p><span className="highlight">Is your contact info up to date?</span> Check now in Online Banking at bankofamerica.com.</p>
        </div>
        
        <div className="footer">
          <p>Bank of America, N.A. Member FDIC. Equal Housing Lender.</p>
          <p>IMPORTANT NOTICE: This document is for novelty and educational purposes only. Not intended for fraudulent use or misrepresentation. Generated on {data.generatedDate}.</p>
        </div>
      </div>
    </div>
  );
};

export default BankOfAmericaTemplate;