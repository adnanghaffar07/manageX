import React from 'react';
import type { SalaryStub } from '../types';
import { X, Printer } from 'lucide-react';
import { Button } from '../../../components/common/Button';

interface SalarySlipModalProps {
  stub: SalaryStub;
  onClose: () => void;
}

export const SalarySlipModal: React.FC<SalarySlipModalProps> = ({ stub, onClose }) => {
  const handlePrint = () => {
    window.print();
  };

  const netSalaryWords = (amount: number) => {
    // Simple placeholder for currency in words if needed
    return amount.toLocaleString('en-US', { style: 'currency', currency: 'USD' });
  };

  return (
    <div className="modal-overlay" onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div className="modal-content slip-modal" style={{ maxWidth: '800px', width: '95%', padding: '0', overflowY: 'auto', overflowX: 'hidden' }}>
        {/* Modal Header (Hidden during print) */}
        <div className="flex items-center justify-between p-4 border-b no-print bg-[var(--surface-color)]">
          <h2 className="text-lg font-bold">Salary Slip - {stub.month}</h2>
          <div className="flex items-center gap-2">
            <Button variant="outline"  onClick={handlePrint} className="gap-2">
              <Printer size={16} /> Print
            </Button>
            <button onClick={onClose} className="p-2 hover:bg-[var(--background)] rounded-full">
              <X size={20} />
            </button>
          </div>
        </div>


        <div className="bg-white printable-slip relative" id="salary-slip">
          <style>{`
            @media print {
              .no-print { display: none !important; }
              body { background: white !important; margin: 0; padding: 0; }
              body * { visibility: hidden; }
              .modal-overlay, .modal-overlay * { visibility: visible; }
              .modal-overlay {
                position: absolute !important;
                left: 0 !important;
                top: 0 !important;
                padding: 0 !important;
                margin: 0 !important;
                background: white !important;
                width: 100% !important;
                min-height: 100vh !important;
                z-index: 9999 !important;
                overflow: visible !important;
                height: auto !important;
              }
              .modal-content {
                position: static !important;
                box-shadow: none !important;
                border: none !important;
                width: 100% !important;
                max-width: 100% !important;
                margin: 0 !important;
                padding: 0 !important;
                border-radius: 0 !important;
                transform: none !important;
                max-height: none !important;
                height: auto !important;
                overflow: visible !important;
              }
              #salary-slip {
                position: static !important;
                width: 100%;
                padding: 0 !important;
                border-radius: 0 !important;
                background: white !important;
                box-shadow: none !important;
              }
              * {
                -webkit-print-color-adjust: exact !important;
                print-color-adjust: exact !important;
              }
              .slip-container { padding: 0 !important; max-width: 100% !important; }
            }
            .slip-container {
              font-family: 'Inter', system-ui, sans-serif;
              color: #000;
              background: #fff;
              padding: 40px;
              max-width: 800px;
              margin: 0 auto;
            }
            @media (max-width: 640px) {
              .slip-container { padding: 20px; }
            }
            .slip-header {
              display: flex;
              justify-content: space-between;
              align-items: flex-start;
              margin-bottom: 30px;
            }
            .company-name {
              font-size: 24px;
              font-weight: 700;
              color: #000;
              margin: 0;
            }
            .company-logo {
              width: 50px;
              height: 50px;
              background-color: #61bb73;
              color: white;
              border-radius: 50%;
              display: flex;
              align-items: center;
              justify-content: center;
              font-size: 28px;
              font-weight: bold;
            }
            .slip-title {
              font-size: 14px;
              font-weight: 700;
              padding-bottom: 10px;
              border-bottom: 1px solid #eaeaea;
              margin-bottom: 25px;
              color: #000;
            }
            .emp-details-grid {
              display: flex;
              justify-content: space-between;
              align-items: flex-start;
              margin-bottom: 40px;
            }
            .emp-name {
              font-size: 14px;
              font-weight: 700;
              text-transform: uppercase;
              margin-bottom: 4px;
              color: #000;
            }
            .emp-id {
              font-size: 12px;
              color: #333;
            }
            .net-pay-box {
              text-align: right;
            }
            .net-pay-label {
              font-size: 12px;
              font-weight: 600;
              color: #333;
            }
            .net-pay-amount {
              font-size: 28px;
              font-weight: 700;
              margin: 4px 0;
              color: #000;
            }
            .net-pay-days {
              font-size: 11px;
              color: #555;
            }
            .data-table {
              width: 100%;
              border-collapse: collapse;
              margin-bottom: 40px;
              font-size: 13px;
            }
            .data-table th {
              border-top: 1px solid #eaeaea;
              border-bottom: 1px solid #eaeaea;
              padding: 12px 0;
              text-align: left;
              font-weight: 700;
              color: #000;
              text-transform: uppercase;
              font-size: 12px;
            }
            .data-table th.text-right { text-align: right; }
            .data-table td {
              padding: 12px 0;
              vertical-align: top;
              color: #000;
              border-bottom: none;
            }
            .data-table td.text-right { text-align: right; }
            .gross-row {
              font-weight: 700;
            }
            .gross-row td {
              border-top: 1px solid #eaeaea;
              padding-top: 15px;
            }
            .payable-box {
              background-color: #f0f4fa;
              padding: 20px;
              text-align: center;
              margin-bottom: 30px;
            }
            .payable-main {
              font-size: 14px;
              color: #000;
              margin-bottom: 8px;
            }
            .payable-main span {
              font-weight: 700;
              font-size: 16px;
            }
            .payable-sub {
              font-size: 10px;
              color: #555;
            }
            .sys-gen {
              text-align: center;
              font-size: 11px;
              color: #888;
              font-style: italic;
            }
          `}</style>

          <div className="slip-container">
            <div className="slip-header">
              <div>
                <h1 className="company-name">Code Automation</h1>
              </div>
              <div className="company-logo">C</div>
            </div>

            <div className="slip-title">
              Payslip for the month of {stub.month}
            </div>

            <div className="emp-details-grid">
              <div>
                <div className="emp-name">{stub.employees?.full_name || stub.employees?.name || 'N/A'}</div>
                <div className="emp-id">Employee ID: {stub.employee_id.slice(0, 8).toUpperCase()}</div>
              </div>
              <div className="net-pay-box">
                <div className="net-pay-label">Employee Net Pay</div>
                <div className="net-pay-amount">${Number(stub.net_salary).toFixed(2)}</div>
                <div className="net-pay-days">Paid Days : {stub.worked_days} | LOP Days : {stub.total_days - stub.worked_days}</div>
              </div>
            </div>

            <table className="data-table">
              <thead>
                <tr>
                  <th>EARNINGS</th>
                  <th className="text-right">AMOUNT</th>
                  <th>DEDUCTIONS</th>
                  <th className="text-right">AMOUNT</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td>Basic</td>
                  <td className="text-right">${((Number(stub.basic_salary) / stub.total_days) * stub.worked_days).toFixed(2)}</td>
                  <td>Tax & Other Deductions</td>
                  <td className="text-right">${Number(stub.deductions).toFixed(2)}</td>
                </tr>
                <tr>
                  <td>Allowances</td>
                  <td className="text-right">${Number(stub.allowances).toFixed(2)}</td>
                  <td></td>
                  <td className="text-right"></td>
                </tr>
                <tr className="gross-row">
                  <td>Gross Earnings</td>
                  <td className="text-right">${(((Number(stub.basic_salary) / stub.total_days) * stub.worked_days) + Number(stub.allowances)).toFixed(2)}</td>
                  <td>Total Deductions</td>
                  <td className="text-right">${Number(stub.deductions).toFixed(2)}</td>
                </tr>
              </tbody>
            </table>

            <div className="payable-box">
              <div className="payable-main">
                Total Net Payable <span>${Number(stub.net_salary).toFixed(2)}</span> ({netSalaryWords(Number(stub.net_salary))})
              </div>
              <div className="payable-sub">
                Total Net Payable = (Gross Earnings - Total Deductions)
              </div>
            </div>

            <div className="sys-gen">
              -This is system generated payslip-
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
