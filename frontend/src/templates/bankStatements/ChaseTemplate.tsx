import React from 'react';

interface ChaseTemplateProps {
  data: {
    accountHolderName: string;
    accountHolderAddress: string;
    accountHolderCityStateZip: string;
    accountNumber: string;
    statementPeriod: string;
    accountType: string;
    beginningBalance: number;
    depositsInstances: number;
    depositsAmount: number;
    atmDebitInstances: number;
    atmDebitAmount: number;
    electronicWithdrawalsInstances: number;
    electronicWithdrawalsAmount: number;
    otherWithdrawalsInstances: number;
    otherWithdrawalsAmount: number;
    feesInstances: number;
    feesAmount: number;
    endingBalance: number;
    depositsTransactions: Array<{
      date: string;
      description: string;
      amount: number;
    }>;
    withdrawalsTransactions: Array<{
      date: string;
      description: string;
      amount: number;
    }>;
    totalDepositsAdditions: number;
    totalWithdrawalsDebits: number;
    generatedDate: string;
  };
}

const ChaseTemplate: React.FC<ChaseTemplateProps> = ({ data }) => {
  return (
    <div className="chase-statement-container" style={{
      fontFamily: 'Arial, sans-serif',
      fontSize: '11px',
      color: '#333',
      maxWidth: '8.5in',
      padding: '0.5in',
      boxSizing: 'border-box',
      backgroundColor: '#fff',
      lineHeight: '1.4'
    }}>
      <style>{`
        .chase-header {
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
          margin-bottom: 20px;
          border-bottom: 1px solid #ccc;
          padding-bottom: 10px;
        }
        .chase-logo-section {
          display: flex;
          flex-direction: column;
          align-items: flex-start;
        }
        .chase-bank-logo {
          width: 80px;
          height: auto;
          margin-bottom: 5px;
        }
        .chase-bank-name {
          font-weight: bold;
          font-size: 12px;
        }
        .chase-address-section {
          text-align: right;
          font-size: 10px;
        }
        .chase-address-section p {
          margin: 0;
        }
        .chase-mailing-info {
          margin-bottom: 20px;
          font-size: 11px;
        }
        .chase-account-number-top {
          font-size: 9px;
          margin-bottom: 5px;
          color: #666;
        }
        .chase-customer-name {
          font-weight: bold;
          font-size: 12px;
          margin-bottom: 2px;
        }
        .chase-customer-address,
        .chase-customer-city-state-zip {
          margin: 0;
        }
        .chase-statement-details {
          display: flex;
          justify-content: space-between;
          margin-bottom: 20px;
          font-size: 11px;
          font-weight: bold;
        }
        .chase-summary-section {
          margin-bottom: 30px;
        }
        .chase-summary-title {
          font-size: 14px;
          font-weight: bold;
          margin-bottom: 10px;
          border-bottom: 1px solid #ccc;
          padding-bottom: 5px;
        }
        .chase-account-type {
          font-size: 12px;
          font-weight: bold;
          margin-bottom: 5px;
        }
        .chase-summary-table {
          width: 100%;
          border-collapse: collapse;
          font-size: 11px;
        }
        .chase-summary-table th,
        .chase-summary-table td {
          padding: 5px 0;
          border-bottom: 1px dashed #eee;
        }
        .chase-summary-table th {
          text-align: left;
          font-weight: normal;
          color: #666;
        }
        .chase-summary-table td:first-child {
          font-weight: bold;
        }
        .chase-summary-table .text-right {
          text-align: right;
        }
        .chase-ending-balance-row td {
          border-bottom: 2px solid #333;
          font-weight: bold;
          padding-top: 8px;
        }
        .chase-customer-service {
          margin-bottom: 30px;
        }
        .chase-customer-service-title {
          font-size: 12px;
          font-weight: bold;
          margin-bottom: 10px;
          border-bottom: 1px solid #ccc;
          padding-bottom: 5px;
        }
        .chase-service-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 5px;
          font-size: 10px;
        }
        .chase-service-grid p {
          margin: 0;
        }
        .chase-account-features {
          margin-bottom: 30px;
          font-size: 11px;
        }
        .chase-account-features ul {
          list-style-type: disc;
          margin-left: 20px;
          padding-left: 0;
          margin-top: 5px;
          margin-bottom: 10px;
        }
        .chase-account-features li {
          margin-bottom: 3px;
        }
        .chase-deposits-section,
        .chase-withdrawals-section {
          margin-bottom: 30px;
        }
        .chase-section-title {
          font-size: 12px;
          font-weight: bold;
          margin-bottom: 10px;
          border-bottom: 1px solid #ccc;
          padding-bottom: 5px;
        }
        .chase-transactions-table {
          width: 100%;
          border-collapse: collapse;
          font-size: 11px;
        }
        .chase-transactions-table th,
        .chase-transactions-table td {
          padding: 5px 0;
          border-bottom: 1px dashed #eee;
        }
        .chase-transactions-table th {
          text-align: left;
          font-weight: normal;
          color: #666;
        }
        .chase-transactions-table tfoot td {
          font-weight: bold;
          padding-top: 8px;
        }
        .chase-transactions-table .text-right {
          text-align: right;
        }
        .chase-notice {
          font-size: 10px;
          text-align: center;
          margin-top: 30px;
          padding: 10px;
          border: 1px solid #ffc107;
          background-color: #fff8e6;
          border-radius: 5px;
        }
        .chase-footer {
          font-size: 9px;
          text-align: center;
          margin-top: 20px;
          color: #666;
        }
        .chase-transactions-table .amount-positive {
          color: #28a745;
        }
        .chase-transactions-table .amount-negative {
          color: #dc3545;
        }
      `}</style>
      
      <div className="chase-header">
        <div className="chase-logo-section">
          <div className="chase-bank-name">JPMorgan Chase Bank, N.A.</div>
        </div>
        <div className="chase-address-section">
          <p>PO Box 182051</p>
          <p>Columbus, OH 43218-2051</p>
        </div>
      </div>
      
      <div className="chase-mailing-info">
        <p className="chase-account-number-top">00024626 DRE 703 21018722 NNNNNNNNNNN 100000000002 0000</p>
        <p className="chase-customer-name">{data.accountHolderName}</p>
        <p className="chase-customer-address">{data.accountHolderAddress}</p>
        <p className="chase-customer-city-state-zip">{data.accountHolderCityStateZip}</p>
      </div>
      
      <div className="chase-statement-details">
        <p className="chase-statement-period">{data.statementPeriod}</p>
        <p className="chase-account-number">Account Number: {data.accountNumber}</p>
      </div>
      
      <div className="chase-summary-section">
        <h3 className="chase-summary-title">CHECKING SUMMARY</h3>
        <p className="chase-account-type">{data.accountType}</p>
        <table className="chase-summary-table">
          <thead>
            <tr>
              <th></th>
              <th className="text-right">INSTANCES</th>
              <th className="text-right">AMOUNT</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>Beginning Balance</td>
              <td></td>
              <td className="text-right">${data.beginningBalance.toFixed(2)}</td>
            </tr>
            <tr>
              <td>Deposits and Additions</td>
              <td className="text-right">{data.depositsInstances}</td>
              <td className="text-right">${data.depositsAmount.toFixed(2)}</td>
            </tr>
            <tr>
              <td>ATM & Debit Card Withdrawals</td>
              <td className="text-right">{data.atmDebitInstances}</td>
              <td className="text-right">${data.atmDebitAmount.toFixed(2)}</td>
            </tr>
            <tr>
              <td>Electronic Withdrawals</td>
              <td className="text-right">{data.electronicWithdrawalsInstances}</td>
              <td className="text-right">${data.electronicWithdrawalsAmount.toFixed(2)}</td>
            </tr>
            <tr>
              <td>Other Withdrawals</td>
              <td className="text-right">{data.otherWithdrawalsInstances}</td>
              <td className="text-right">${data.otherWithdrawalsAmount.toFixed(2)}</td>
            </tr>
            <tr>
              <td>Fees</td>
              <td className="text-right">{data.feesInstances}</td>
              <td className="text-right">${data.feesAmount.toFixed(2)}</td>
            </tr>
            <tr className="chase-ending-balance-row">
              <td>Ending Balance</td>
              <td className="text-right"></td>
              <td className="text-right">${data.endingBalance.toFixed(2)}</td>
            </tr>
          </tbody>
        </table>
      </div>
      
      <div className="chase-customer-service">
        <h3 className="chase-customer-service-title">CUSTOMER SERVICE INFORMATION</h3>
        <div className="chase-service-grid">
          <div>
            <p>Web site:</p>
            <p>Service Center:</p>
            <p>Deaf and Hard of Hearing:</p>
            <p>Para Español:</p>
            <p>International Calls:</p>
          </div>
          <div>
            <p>www.Chase.com</p>
            <p>1-877-425-8100</p>
            <p>1-800-242-7383</p>
            <p>1-888-622-4273</p>
            <p>1-713-262-1679</p>
          </div>
        </div>
      </div>
      
      <div className="chase-account-features">
        <p>Your Chase Total Checking account provides:</p>
        <ul>
          <li>No transaction fees for unlimited electronic deposits (including ACH, ATM, wire, Chase Quick Deposit)</li>
          <li>500 debits and non-electronic deposits (those made via check or cash in branches) per statement cycle</li>
          <li>$25,000 in cash deposits per statement cycle</li>
        </ul>
        <p>There are additional fee waivers and benefits associated with your account - please refer to your Deposit Account Agreement for more information.</p>
      </div>
      
      <div className="chase-deposits-section">
        <h3 className="chase-section-title">DEPOSITS AND ADDITIONS</h3>
        <table className="chase-transactions-table">
          <thead>
            <tr>
              <th>DATE</th>
              <th>DESCRIPTION</th>
              <th className="text-right">AMOUNT</th>
            </tr>
          </thead>
          <tbody>
            {data.depositsTransactions.map((transaction, index) => (
              <tr key={index}>
                <td>{transaction.date}</td>
                <td>{transaction.description}</td>
                <td className="text-right amount-positive">${transaction.amount.toFixed(2)}</td>
              </tr>
            ))}
          </tbody>
          <tfoot>
            <tr>
              <td colSpan={2}>Total Deposits and Additions</td>
              <td className="text-right">${data.totalDepositsAdditions.toFixed(2)}</td>
            </tr>
          </tfoot>
        </table>
      </div>
      
      <div className="chase-withdrawals-section">
        <h3 className="chase-section-title">WITHDRAWALS AND DEBITS</h3>
        <table className="chase-transactions-table">
          <thead>
            <tr>
              <th>DATE</th>
              <th>DESCRIPTION</th>
              <th className="text-right">AMOUNT</th>
            </tr>
          </thead>
          <tbody>
            {data.withdrawalsTransactions.map((transaction, index) => (
              <tr key={index}>
                <td>{transaction.date}</td>
                <td>{transaction.description}</td>
                <td className="text-right amount-negative">${transaction.amount.toFixed(2)}</td>
              </tr>
            ))}
          </tbody>
          <tfoot>
            <tr>
              <td colSpan={2}>Total Withdrawals and Debits</td>
              <td className="text-right">${data.totalWithdrawalsDebits.toFixed(2)}</td>
            </tr>
          </tfoot>
        </table>
      </div>
      
      <div className="chase-notice">
        <p>IMPORTANT NOTICE: This document is for novelty and educational purposes only. Not intended for fraudulent use or misrepresentation. Generated on {data.generatedDate}.</p>
      </div>
      
      <div className="chase-footer">
        <p>Chase Member FDIC Equal Housing Lender</p>
      </div>
    </div>
  );
};

export default ChaseTemplate;