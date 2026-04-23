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
      <div className="modal-content slip-modal" style={{ maxWidth: '800px', width: '95%', padding: '0', overflow: 'hidden' }}>
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

        {/* Slip Content (Printable area) */}
        <div className="p-8 bg-white text-gray-900 printable-slip" id="salary-slip">
          <style>{`
            @media print {
              .no-print { display: none !important; }
              body { background: white !important; }
              .modal-overlay { position: static !important; background: transparent !important; display: block !important; padding: 0 !important; }
              .modal-content { box-shadow: none !important; border: none !important; width: 100% !important; max-width: 100% !important; margin: 0 !important; }
              .printable-slip { padding: 0 !important; }
            }
            .slip-header { border-bottom: 2px solid #333; margin-bottom: 20px; padding-bottom: 20px; }
            .slip-table { width: 100%; border-collapse: collapse; margin: 20px 0; }
            .slip-table th, .slip-table td { border: 1px solid #ddd; padding: 12px; text-align: left; }
            .slip-table th { background-color: #f9f9f9; font-weight: 600; }
            .slip-footer { margin-top: 40px; display: grid; grid-template-columns: 1fr 1fr; gap: 40px; }
            .signature-box { border-top: 1px solid #333; padding-top: 10px; margin-top: 60px; text-align: center; }
          `}</style>

          <div className="slip-header flex justify-between items-start">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 uppercase tracking-wider">ManageX</h1>
              <p className="text-sm text-gray-600 mt-1">Smart Business Management Solution</p>
            </div>
            <div className="text-right">
              <h2 className="text-xl font-bold uppercase">Pay Slip</h2>
              <p className="text-gray-600">Month: {stub.month}</p>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-8 mb-8">
            <div>
              <h3 className="text-sm font-bold text-gray-500 uppercase mb-2">Employee Details</h3>
              <p className="text-lg font-bold">{stub.employees?.full_name || stub.employees?.name || 'N/A'}</p>
              <p className="text-gray-600">Employee ID: {stub.employee_id.slice(0, 8).toUpperCase()}</p>
            </div>
            <div className="text-right">
              <h3 className="text-sm font-bold text-gray-500 uppercase mb-2">Payment Details</h3>
              <p className="text-gray-600">Paid On: {stub.paid_on ? new Date(stub.paid_on).toLocaleDateString() : 'Pending'}</p>
              <p className="text-gray-600">Days: {stub.worked_days} / {stub.total_days}</p>
            </div>
          </div>

          <table className="slip-table">
            <thead>
              <tr>
                <th>Earnings</th>
                <th className="text-right">Amount</th>
                <th>Deductions</th>
                <th className="text-right">Amount</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>
                  Basic Salary 
                  <span className="text-[10px] text-gray-500 block">
                    (${Number(stub.basic_salary).toFixed(2)} / {stub.total_days} days × {stub.worked_days} worked days)
                  </span>
                </td>
                <td className="text-right">${((Number(stub.basic_salary) / stub.total_days) * stub.worked_days).toFixed(2)}</td>
                <td>Tax / Other Deductions</td>
                <td className="text-right">${Number(stub.deductions).toFixed(2)}</td>
              </tr>
              <tr>
                <td>Allowances</td>
                <td className="text-right">${Number(stub.allowances).toFixed(2)}</td>
                <td></td>
                <td className="text-right"></td>
              </tr>
              <tr className="font-bold">
                <td>Total Earnings</td>
                <td className="text-right text-green-600">${(((Number(stub.basic_salary) / stub.total_days) * stub.worked_days) + Number(stub.allowances)).toFixed(2)}</td>
                <td>Total Deductions</td>
                <td className="text-right text-red-600">${Number(stub.deductions).toFixed(2)}</td>
              </tr>
            </tbody>
          </table>

          <div className="mt-6 p-6 bg-gray-50 rounded-lg flex justify-between items-center border">
            <div>
              <p className="text-sm font-bold text-gray-500 uppercase">Net Payable Amount</p>
              <p className="text-2xl font-black text-gray-900 mt-1">
                ${Number(stub.net_salary).toFixed(2)}
              </p>
            </div>
            <div className="text-right">
              <p className="text-sm italic text-gray-600">Amount in words: {netSalaryWords(Number(stub.net_salary))}</p>
            </div>
          </div>

          <div className="slip-footer">
            <div className="signature-box">
              <p className="font-bold uppercase text-xs text-gray-500">Employer Signature</p>
            </div>
            <div className="signature-box">
              <p className="font-bold uppercase text-xs text-gray-500">Employee Signature</p>
            </div>
          </div>

          <div className="mt-12 pt-8 border-t text-center text-xs text-gray-400">
            <p>This is a computer-generated document and does not require a physical signature.</p>
            <p className="mt-1">© {new Date().getFullYear()} ManageX. All rights reserved.</p>
          </div>
        </div>
      </div>
    </div>
  );
};
