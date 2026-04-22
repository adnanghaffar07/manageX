import React, { useEffect, useState } from 'react';
import { Menu, Moon, Sun, Bell } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

interface HeaderProps {
  toggleSidebar: () => void;
}

export const Header: React.FC<HeaderProps> = ({ toggleSidebar }) => {
  const { user } = useAuth();
  const [isDark, setIsDark] = useState(() => {
    return document.documentElement.classList.contains('dark');
  });

  useEffect(() => {
    if (isDark) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [isDark]);

  return (
    <header className="glass-header">
      <div className="flex items-center">
        <button
          onClick={toggleSidebar}
          className="md:hidden mr-4 header-icon-btn"
        >
          <Menu size={20} />
        </button>
        <h1 className="text-lg font-medium hidden sm:block">Welcome back, {user?.email?.split('@')[0]}</h1>
      </div>

      <div className="flex items-center gap-2 sm:gap-4">
        <button className="relative header-icon-btn">
          <Bell size={20} />
          <span className="absolute top-2 right-2 w-2 h-2 rounded-full" style={{ backgroundColor: 'var(--destructive)', boxShadow: '0 0 0 2px var(--card)' }} />
        </button>
        
        <button
          onClick={() => setIsDark(!isDark)}
          className="header-icon-btn"
        >
          {isDark ? <Sun size={20} /> : <Moon size={20} />}
        </button>
        
        <div className="hidden sm:flex items-center ml-2 pl-4 border-l" style={{ borderColor: 'var(--border)' }}>
          <div className="w-8 h-8 rounded-full flex items-center justify-center text-primary-foreground font-medium shadow-sm" style={{ backgroundColor: 'var(--primary)' }}>
            {user?.email?.charAt(0).toUpperCase()}
          </div>
        </div>
      </div>
    </header>
  );
};
