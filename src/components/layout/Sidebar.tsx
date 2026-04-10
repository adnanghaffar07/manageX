import React from 'react';
import { NavLink } from 'react-router-dom';
import { LayoutDashboard, FileText, Settings, X, LogOut, Users, Briefcase, Folder } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { Button } from '../common/Button';

interface SidebarProps {
  isOpen: boolean;
  setIsOpen: (isOpen: boolean) => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ isOpen, setIsOpen }) => {
  const { signOut } = useAuth();
  
  const navItems = [
    { to: '/', icon: LayoutDashboard, label: 'Dashboard' },
    { to: '/invoices', icon: FileText, label: 'Invoices' },
    { to: '/employees', icon: Users, label: 'Employees' },
    { to: '/documents', icon: Folder, label: 'Documents' },
    { to: '/projects', icon: Briefcase, label: 'Projects (Soon)' },
    { to: '/settings', icon: Settings, label: 'Settings' },
  ];
const closeButton = () => {
  setIsOpen(false);
}
  return (
    <>
      {/* Mobile overlay */}
      {isOpen && (
        <div 
          className="fixed inset-0 z-40 md:hidden"
          style={{ backgroundColor: 'rgba(var(--background), 0.8)', backdropFilter: 'blur(4px)' }}
          onClick={() => setIsOpen(false)}
        />
      )}

      {/* Sidebar sidebar */}
      <aside className={`sidebar ${!isOpen ? 'closed' : ''}`}>
        <div className="h-16 flex items-center justify-between px-6 border-b border-border/40">
          <div className="flex items-center gap-2" style={{marginTop:"20px",marginBottom:'17px'}}>
            <div className="flex items-center justify-center p-2 rounded-lg" style={{ backgroundColor: 'var(--accent)' }}>
              <LayoutDashboard size={20} className="text-primary" />
            </div>
            <span className="text-xl font-bold text-primary">
              ManageX
            </span>
          </div>
          <button onClick={closeButton} className="md:hidden header-icon-btn">
            <X size={20} />
          </button>
        </div>

        <nav className="flex-1 overflow-y-auto py-6 px-4 space-y-1">
          {navItems.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              onClick={() => setIsOpen(false)}
              className={({ isActive }) => `nav-item gap-3 mt-2 ${isActive ? 'active' : ''}`}
            >
              <item.icon className="w-5 h-5" />
              <span>{item.label}</span>
            </NavLink>
          ))}
        </nav>

        <div className="p-4 border-t pb-6">
          <Button variant="ghost" className="w-full justify-start text-muted text-destructive" onClick={signOut}>
            <LogOut size={20} className="mr-3" />
            Sign Out
          </Button>
        </div>
      </aside>
    </>
  );
};
