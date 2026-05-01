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

        {/* Slip Content (Printable area) */}
        {/* Slip Content (Printable area) */}
        <div className="bg-white text-[var(--foreground)] printable-slip relative rounded-b-xl" id="salary-slip">
          <style>{`
            @media print {
              .no-print { display: none !important; }
              body { background: white !important; }
              .modal-overlay { position: static !important; background: transparent !important; display: block !important; padding: 0 !important; }
              .modal-content { box-shadow: none !important; border: none !important; width: 100% !important; max-width: 100% !important; margin: 0 !important; border-radius: 0 !important; }
              .printable-slip { padding: 0 !important; border-radius: 0 !important; }
              .slip-header-bg { border-radius: 0 !important; padding: 2rem !important; }
              .slip-body { padding: 2rem !important; }
            }
            .slip-header-bg {
              background: linear-gradient(135deg, rgba(99, 102, 241, 0.05) 0%, rgba(99, 102, 241, 0.15) 100%);
              border-bottom: 2px solid var(--primary);
              padding: 2.5rem;
              display: flex;
              justify-content: space-between;
              align-items: flex-start;
              position: relative;
              z-index: 10;
            }
            .slip-body {
              padding: 2.5rem;
              position: relative;
              z-index: 10;
            }
            @media (max-width: 640px) {
              .slip-header-bg, .slip-body { padding: 1.5rem; }
              .slip-header-bg { flex-direction: column; gap: 1.5rem; }
            }
            .slip-title { font-size: 2.25rem; font-weight: 700; color: var(--foreground); letter-spacing: -0.025em; margin: 0; line-height: 1.2; }
            .slip-subtitle { font-size: 1.125rem; font-weight: 600; color: var(--foreground); margin: 0; }
            .slip-text-muted { color: var(--muted-foreground); }
            .slip-badge { display: inline-block; padding: 0.375rem 1.25rem; background: var(--card); border-radius: 9999px; color: var(--primary); font-weight: 700; font-size: 0.875rem; border: 1px solid var(--primary); text-transform: uppercase; letter-spacing: 0.05em; box-shadow: var(--shadow-sm); margin-bottom: 0.5rem; }
            
            .slip-info-box { background-color: var(--secondary); padding: 1.5rem; border-radius: 0.75rem; border: 1px solid var(--border); box-shadow: var(--shadow-sm); margin-bottom: 2rem; display: grid; grid-template-columns: 1fr; gap: 1.5rem; }
            @media (min-width: 768px) { .slip-info-box { grid-template-columns: 1fr 1fr; } }
            .slip-info-label { font-size: 0.75rem; font-weight: 700; color: var(--primary); text-transform: uppercase; margin-bottom: 0.75rem; letter-spacing: 0.05em; display: flex; align-items: center; gap: 0.5rem; }
            .slip-info-dot { width: 6px; height: 6px; border-radius: 50%; background-color: var(--primary); }
            
            .slip-table { width: 100%; border-collapse: separate; border-spacing: 0; margin-bottom: 2rem; border: 1px solid var(--border); border-radius: 0.5rem; overflow: hidden; }
            .slip-table th, .slip-table td { border-bottom: 1px solid var(--border); padding: 1rem 1.25rem; text-align: left; font-size: 0.875rem; color: var(--foreground); }
            .slip-table th { background-color: var(--secondary); font-weight: 600; text-transform: uppercase; font-size: 0.75rem; letter-spacing: 0.05em; color: var(--muted-foreground); }
            .slip-table tr:last-child td { border-bottom: none; }
            .slip-table tr:nth-child(even) td { background-color: rgba(241, 245, 249, 0.3); }
            .slip-table-bold { font-weight: 600; color: var(--foreground); }
            .slip-table-sub { font-size: 0.6875rem; color: var(--muted-foreground); margin-top: 0.25rem; font-weight: 500; }
            
            .slip-totals { margin-top: 2rem; background: linear-gradient(to right, var(--primary), var(--accent-foreground)); border-radius: 0.75rem; padding: 2px; box-shadow: var(--shadow-md); }
            .slip-totals-inner { background: var(--card); border-radius: calc(0.75rem - 2px); padding: 1.5rem; display: flex; flex-direction: column; gap: 1rem; }
            @media (min-width: 768px) { .slip-totals-inner { flex-direction: row; justify-content: space-between; align-items: center; } }
            .slip-totals-label { font-size: 0.75rem; font-weight: 700; color: var(--primary); text-transform: uppercase; letter-spacing: 0.05em; margin-bottom: 0.25rem; }
            .slip-totals-amount { font-size: 2rem; font-weight: 900; color: var(--foreground); letter-spacing: -0.025em; line-height: 1; }
            
            .signature-line { border-top: 1px dashed var(--input); padding-top: 0.75rem; color: var(--muted-foreground); font-size: 0.875rem; font-weight: 500; text-align: center; }
            .slip-signatures { display: grid; grid-template-columns: 1fr 1fr; gap: 2rem; margin-top: 4rem; padding: 0 1rem; }
            @media (min-width: 768px) { .slip-signatures { gap: 4rem; padding: 0 2rem; } }
            
            .watermark { position: absolute; top: 50%; left: 50%; transform: translate(-50%, -50%) rotate(-45deg); font-size: clamp(4rem, 10vw, 8rem); color: rgba(99, 102, 241, 0.03); z-index: 0; font-weight: 900; pointer-events: none; white-space: nowrap; user-select: none; }
          `}</style>
          
          <div className="watermark">CODE AUTOMATION</div>

          <div className="slip-header-bg">
            <div>
              <h1 className="slip-title">Code Automation</h1>
            </div>
            <div className="text-right sm:text-right text-left">
              <div className="slip-badge">
                Pay Slip
              </div>
              <p className="slip-subtitle">{stub.month}</p>
            </div>
          </div>

          <div className="slip-body">
            <div className="slip-info-box">
              <div>
                <div className="slip-info-label">
                  <span className="slip-info-dot"></span>
                  Employee Details
                </div>
                <p className="text-lg font-bold text-[var(--foreground)] mb-1">{stub.employees?.full_name || stub.employees?.name || 'N/A'}</p>
                <div className="flex items-center gap-2 text-sm text-[var(--muted-foreground)]">
                  <span className="font-medium">ID:</span> 
                  <span className="font-mono bg-[var(--card)] px-2 py-0.5 rounded border border-[var(--border)] shadow-sm">{stub.employee_id.slice(0, 8).toUpperCase()}</span>
                </div>
              </div>
              <div className="md:text-right flex flex-col justify-between">
                <div>
                  <div className="slip-info-label md:justify-end">
                    <span className="slip-info-dot md:hidden"></span>
                    Payment Details
                  </div>
                  <div className="text-sm text-[var(--muted-foreground)] flex md:justify-end items-center gap-2 mb-2">
                    <span className="font-medium">Paid On:</span> 
                    <span className="text-[var(--foreground)] font-medium">{stub.paid_on ? new Date(stub.paid_on).toLocaleDateString() : 'Pending'}</span>
                  </div>
                </div>
                <div className="inline-flex items-center md:justify-end gap-2 text-sm mt-2 md:mt-0">
                  <div className="bg-[var(--card)] px-3 py-1.5 rounded-lg border border-[var(--border)] shadow-sm flex items-center gap-2">
                    <span className="text-[var(--muted-foreground)] font-medium">Attendance:</span>
                    <span className="font-bold text-[var(--primary)]">{stub.worked_days}</span>
                    <span className="text-[var(--muted-foreground)]">/</span>
                    <span className="text-[var(--foreground)]">{stub.total_days} days</span>
                  </div>
                </div>
              </div>
            </div>

            <table className="slip-table">
              <thead>
                <tr>
                  <th className="w-1/2">Earnings</th>
                  <th className="text-right w-[20%]">Amount</th>
                  <th className="w-[30%]">Deductions</th>
                  <th className="text-right">Amount</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td>
                    <div className="slip-table-bold">Basic Salary</div>
                    <div className="slip-table-sub">
                      (${Number(stub.basic_salary).toFixed(2)} / {stub.total_days} days × {stub.worked_days} worked days)
                    </div>
                  </td>
                  <td className="text-right slip-table-bold">${((Number(stub.basic_salary) / stub.total_days) * stub.worked_days).toFixed(2)}</td>
                  <td className="slip-table-bold" style={{ fontWeight: 500 }}>Tax & Other Deductions</td>
                  <td className="text-right slip-table-bold">${Number(stub.deductions).toFixed(2)}</td>
                </tr>
                <tr>
                  <td className="slip-table-bold">Allowances</td>
                  <td className="text-right slip-table-bold">${Number(stub.allowances).toFixed(2)}</td>
                  <td></td>
                  <td className="text-right"></td>
                </tr>
                <tr className="bg-[rgba(99,102,241,0.05)]">
                  <td className="font-bold py-4 border-t-2 border-[var(--primary)]" style={{ color: 'var(--foreground)' }}>Total Earnings</td>
                  <td className="text-right font-bold text-[var(--success)] py-4 border-t-2 border-[var(--primary)]">${(((Number(stub.basic_salary) / stub.total_days) * stub.worked_days) + Number(stub.allowances)).toFixed(2)}</td>
                  <td className="font-bold py-4 border-t-2 border-[var(--primary)]" style={{ color: 'var(--foreground)' }}>Total Deductions</td>
                  <td className="text-right font-bold text-[var(--destructive)] py-4 border-t-2 border-[var(--primary)]">${Number(stub.deductions).toFixed(2)}</td>
                </tr>
              </tbody>
            </table>

            <div className="slip-totals">
              <div className="slip-totals-inner">
                <div>
                  <div className="slip-totals-label">Net Payable Amount</div>
                  <div className="slip-totals-amount">
                    ${Number(stub.net_salary).toFixed(2)}
                  </div>
                </div>
                <div className="md:text-right max-w-full md:max-w-[50%] mt-4 md:mt-0">
                  <div className="text-xs font-bold text-[var(--muted-foreground)] uppercase tracking-wider mb-1">Amount in words</div>
                  <div className="text-sm font-semibold capitalize leading-tight" style={{ color: 'var(--foreground)' }}>{netSalaryWords(Number(stub.net_salary))}</div>
                </div>
              </div>
            </div>

            <div className="slip-signatures">
              <div className="signature-line">
                Employer Signature
              </div>
              <div className="signature-line">
                Employee Signature
              </div>
            </div>

            <div className="mt-12 pt-6 border-t border-dashed border-[var(--border)] text-center text-xs font-medium slip-text-muted">
              <p>This is a computer-generated document and does not require a physical signature.</p>
              <p className="mt-1">© {new Date().getFullYear()} Code Automation. All rights reserved.</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
