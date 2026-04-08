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
        <h1 className="text-lg font-medium hidden sm:block">Welcome, {user?.email?.split('@')[0]}</h1>
      </div>

      <div className="flex items-center gap-4">
        <button className="relative header-icon-btn">
          <Bell size={20} />
          {/* simple inline style or we can just leave it since inline is fine for pulse dot */}
          <span className="absolute top-1 right-1 w-2 h-2 rounded-full" style={{ backgroundColor: 'var(--primary)', animation: 'pulse 2s infinite' }} />
        </button>
        
        <button
          onClick={() => setIsDark(!isDark)}
          className="header-icon-btn"
        >
          {isDark ? <Sun size={20} /> : <Moon size={20} />}
        </button>
        
        <div className="hidden sm:flex items-center ml-2 pl-4 border-l">
          <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-primary to-accent flex items-center justify-center text-primary-foreground font-medium shadow-sm">
            {user?.email?.charAt(0).toUpperCase()}
          </div>
        </div>
      </div>
    </header>
  );
};
