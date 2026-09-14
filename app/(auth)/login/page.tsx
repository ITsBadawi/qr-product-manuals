'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { useToast } from '@/components/ui/Toast';
import { authClient } from '@/lib/auth/client';
import { QrCode, Lock, Mail, User, AlertCircle, ArrowRight, ShieldCheck } from 'lucide-react';

export default function LoginPage() {
  const router = useRouter();
  const { success, error } = useToast();

  const [mode, setMode] = useState<'signin' | 'signup'>('signin');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    if (!email || !password) {
      setErrorMessage('Please provide your email and password.');
      return;
    }

    if (mode === 'signup' && !name.trim()) {
      setErrorMessage('Please enter your full name.');
      return;
    }

    setIsLoading(true);

    try {
      if (mode === 'signin') {
        const { error: signInError } = await authClient.signIn.email({
          email: email.trim(),
          password,
        });

        if (signInError) {
          setErrorMessage(signInError.message || 'Invalid email or password. Please verify your credentials.');
          return;
        }

        success('Signed in successfully! Redirecting...');
        router.push('/dashboard');
        router.refresh();
      } else {
        const { error: signUpError } = await authClient.signUp.email({
          email: email.trim(),
          password,
          name: name.trim(),
        });

        if (signUpError) {
          setErrorMessage(signUpError.message || 'Failed to create account. Try another password or email.');
          return;
        }

        success('Account created successfully! Welcome.');
        router.push('/dashboard');
        router.refresh();
      }
    } catch (err: any) {
      console.error('Neon Auth Error:', err);
      setErrorMessage(err.message || 'An unexpected error occurred. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <main className="min-h-screen flex items-center justify-center p-4 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-indigo-950/40 via-slate-950 to-slate-950">
      <div className="w-full max-w-md space-y-6">
        {/* Brand Header */}
        <div className="text-center space-y-2">
          <div className="inline-flex p-3 rounded-2xl bg-gradient-to-br from-indigo-500 to-indigo-700 text-white shadow-xl shadow-indigo-500/25 mb-1">
            <QrCode className="w-8 h-8" />
          </div>
          <h1 className="text-2xl font-black tracking-tight text-white">QR Manual Hub</h1>
          <p className="text-xs text-slate-400">
            Secure admin portal powered by <span className="text-indigo-400 font-semibold">Neon Auth</span>
          </p>
        </div>

        {/* Card */}
        <Card className="p-8 border-slate-800/80 bg-slate-900/80 shadow-2xl backdrop-blur-2xl">
          {/* Mode Switcher Tabs */}
          <div className="grid grid-cols-2 p-1 mb-6 rounded-xl bg-slate-950 border border-slate-800 text-xs font-semibold">
            <button
              type="button"
              onClick={() => {
                setMode('signin');
                setErrorMessage(null);
              }}
              className={`py-2 rounded-lg transition-all ${
                mode === 'signin'
                  ? 'bg-indigo-600 text-white shadow-md'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              Sign In
            </button>
            <button
              type="button"
              onClick={() => {
                setMode('signup');
                setErrorMessage(null);
              }}
              className={`py-2 rounded-lg transition-all ${
                mode === 'signup'
                  ? 'bg-indigo-600 text-white shadow-md'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              Create Account
            </button>
          </div>

          <div className="flex items-center gap-2 mb-6 pb-4 border-b border-slate-800 text-xs text-indigo-400">
            <ShieldCheck className="w-4 h-4 text-emerald-400" />
            <span>Protected by Neon Managed Better Auth</span>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {mode === 'signup' && (
              <Input
                label="Full Name"
                type="text"
                placeholder="e.g. John Doe"
                value={name}
                onChange={(e) => setName(e.target.value)}
                leftIcon={<User className="w-4 h-4" />}
                autoComplete="name"
                required
              />
            )}

            <Input
              label="Email Address"
              type="email"
              placeholder="user@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              leftIcon={<Mail className="w-4 h-4" />}
              autoComplete="email"
              required
            />

            <Input
              label="Password"
              type="password"
              placeholder="••••••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              leftIcon={<Lock className="w-4 h-4" />}
              autoComplete={mode === 'signin' ? 'current-password' : 'new-password'}
              required
            />

            {errorMessage && (
              <div className="p-3 rounded-xl bg-rose-950/50 border border-rose-500/30 text-xs text-rose-300 flex items-start gap-2">
                <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                <span>{errorMessage}</span>
              </div>
            )}

            <Button
              type="submit"
              size="lg"
              variant="primary"
              isLoading={isLoading}
              className="w-full mt-2"
              rightIcon={<ArrowRight className="w-4 h-4" />}
            >
              {mode === 'signin' ? 'Sign In to Dashboard' : 'Register Account'}
            </Button>
          </form>
        </Card>

        {/* Security Note */}
        <div className="text-center text-[11px] text-slate-500 space-y-1">
          <p>Database & Auth: Neon PostgreSQL • Storage: Cloudflare R2</p>
          <p>Public QR codes never expose administrative routes or credentials.</p>
        </div>
      </div>
    </main>
  );
}
