import React from 'react';
import type { InputHTMLAttributes } from 'react';

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label: string;
  error?: string;
}

export const Input: React.FC<InputProps> = ({ label, error, className = '', ...props }) => {
  return (
    <div className="flex flex-col gap-1 w-full">
      <label className="text-sm font-medium text-foreground">
        {label}
      </label>
      <input
        className={`form-input ${className}`}
        {...props}
      />
      {error && <span className="text-xs text-destructive">{error}</span>}
    </div>
  );
};
