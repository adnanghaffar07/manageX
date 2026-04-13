import { Routes, Route, Navigate } from 'react-router-dom';
import { AuthPage } from './features/auth/views/AuthPage';
import { Layout } from './components/layout/Layout';
import { useAuth } from './context/AuthContext';

import { InvoiceDashboard } from './features/invoices/views/InvoiceDashboard';
import { InvoiceFormPage } from './features/invoices/views/InvoiceFormPage';
import { EmployeeDashboard } from './features/employees/views/EmployeeDashboard';
// import { DocumentDashboard } from './features/documents/views/DocumentDashboard';
import { ProjectDashboard } from './features/projects/views/ProjectDashboard';

// Placeholders for views we will create
const Dashboard = () => <div className="p-6"><h2 className="text-2xl font-bold mb-4">Dashboard Overview</h2><p className="text-muted">Welcome to ManageX. Select a feature from the sidebar.</p></div>;

function App() {
  const { user } = useAuth();

  return (
    <Routes>
      <Route path="/auth" element={!user ? <AuthPage /> : <Navigate to="/" replace />} />
      
      <Route path="/" element={<Layout />}>
        <Route index element={<Dashboard />} />
        <Route path="invoices" element={<InvoiceDashboard />} />
        <Route path="invoices/new" element={<InvoiceFormPage />} />
        <Route path="invoices/:id/edit" element={<InvoiceFormPage />} />
        <Route path="employees" element={<EmployeeDashboard />} />
        {/* <Route path="documents" element={<DocumentDashboard />} /> */}
        <Route path="projects" element={<ProjectDashboard />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Route>
    </Routes>
  );
}

export default App;
