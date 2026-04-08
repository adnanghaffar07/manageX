import React, { useState } from 'react';
import { supabase } from '../../../config/supabase';
import { Button } from '../../../components/common/Button';
import { Input } from '../../../components/common/Input';
import { LogIn, UserPlus } from 'lucide-react';

export const AuthPage: React.FC = () => {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      if (isLogin) {
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;
      } else {
        const { error } = await supabase.auth.signUp({ email, password });
        if (error) throw error;
        // Optional: show a message about confirming email if email confirmation is required in Supabase
        alert('Check your email for the confirmation link!');
      }
    } catch (err: any) {
      setError(err.message || 'An error occurred during authentication');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-container">
      <div className="auth-card">
        <div className="flex flex-col items-center mb-6">
          <div className="flex items-center justify-center p-4 rounded-lg mb-4" style={{ backgroundColor: 'var(--accent)' }}>
            {isLogin ? <LogIn size={24} className="text-primary" /> : <UserPlus size={24} className="text-primary" />}
          </div>
          <h2 className="text-3xl font-semibold tracking-tight text-center">
            {isLogin ? 'Welcome back' : 'Create an account'}
          </h2>
          <p className="text-sm text-muted-foreground text-center">
            {isLogin ? 'Enter your credentials to access your account' : 'Enter your details to get started'}
          </p>
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          {error && (
            <div className="p-3 border rounded-md text-sm text-center" style={{ backgroundColor: 'rgba(var(--destructive), 0.1)', color: 'var(--destructive)', borderColor: 'rgba(var(--destructive), 0.2)' }}>
              {error}
            </div>
          )}
          
          <Input
            label="Email Address"
            type="email"
            value={email}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => setEmail(e.target.value)}
            placeholder="name@example.com"
            required
          />
          <Input
            label="Password"
            type="password"
            value={password}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => setPassword(e.target.value)}
            placeholder="••••••••"
            required
            minLength={6}
          />
          
          <div className="pt-2">
            <Button type="submit" className="w-full" isLoading={loading}>
              {isLogin ? 'Sign In' : 'Sign Up'}
            </Button>
          </div>
        </form>

        <div className="mt-6 text-center text-sm">
          <span className="text-muted-foreground">
            {isLogin ? "Don't have an account?" : "Already have an account?"}
          </span>{' '}
          <button
            onClick={() => setIsLogin(!isLogin)}
            className="text-primary hover:underline font-medium focus:outline-none"
            type="button"
          >
            {isLogin ? 'Sign up' : 'Sign in'}
          </button>
        </div>
      </div>
    </div>
  );
};
