import React from 'react';
import { NavLink } from 'react-router-dom';
import { LayoutDashboard, FileText, Settings, X, LogOut, Users, Briefcase, Folder, Banknote } from 'lucide-react';
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
    { to: '/projects', icon: Briefcase, label: 'Projects' },
    { to: '/salary-stubs', icon: Banknote, label: 'Salary Stubs' },
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
          style={{ backgroundColor: 'rgba(15, 23, 42, 0.4)', backdropFilter: 'blur(4px)' }}
          onClick={() => setIsOpen(false)}
        />
      )}

      {/* Sidebar sidebar */}
      <aside className={`sidebar ${!isOpen ? 'closed' : ''}`}>
        <div className="h-16 flex items-center justify-between px-6 border-b" style={{ borderColor: 'var(--border)' }}>
          <div className="flex items-center gap-3">
            <div className="flex items-center justify-center p-2 rounded-lg" style={{ backgroundColor: 'var(--primary)', color: 'var(--primary-foreground)' }}>
              <LayoutDashboard size={20} />
            </div>
            <span className="text-xl font-bold" style={{ color: 'var(--foreground)' }}>
              ManageX
            </span>
          </div>
          <button onClick={closeButton} className="md:hidden header-icon-btn">
            <X size={20} />
          </button>
        </div>

        <nav className="flex-1 overflow-y-auto py-6 px-4 flex flex-col gap-1">
          {navItems.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              onClick={() => setIsOpen(false)}
              className={({ isActive }) => `nav-item gap-3 ${isActive ? 'active' : ''}`}
            >
              <item.icon size={18} />
              <span>{item.label}</span>
            </NavLink>
          ))}
        </nav>

        <div className="p-4 border-t" style={{ borderColor: 'var(--border)' }}>
          <Button variant="ghost" className="w-full justify-start text-destructive" onClick={signOut}>
            <LogOut size={18} className="mr-3" />
            Sign Out
          </Button>
        </div>
      </aside>
    </>
  );
};
