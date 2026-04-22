export interface SalaryStub {
  id: string;
  employee_id: string;
  month: string;
  basic_salary: number;
  allowances: number;
  deductions: number;
  net_salary: number;
  paid_on: string;
  created_at: string;
  // joined fields
  employees?: {
    full_name?: string;
    name?: string;
  };
}

export interface SalaryStubFormData {
  employee_id: string;
  month: string;
  basic_salary: string;
  allowances: string;
  deductions: string;
  paid_on: string;
}
