'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { useToast } from '@/components/ui/Toast';
import { QrCode, Lock, Mail, AlertCircle, ArrowRight, ShieldCheck } from 'lucide-react';

export default function LoginPage() {
  const router = useRouter();
  const { success, error } = useToast();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    if (!email || !password) {
      setErrorMessage('Please enter both email and password.');
      return;
    }

    setIsLoading(true);

    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: email.trim(), password }),
      });

      const result = await res.json();
      if (!res.ok || result.error) {
        setErrorMessage(result.error || 'Invalid credentials. Please check your admin details.');
        return;
      }

      success('Signed in successfully! Redirecting...');
      router.push('/dashboard');
      router.refresh();
    } catch (err: any) {
      console.error(err);
      setErrorMessage(err.message || 'An unexpected error occurred.');
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
            Secure admin portal for warehouse product manuals & Cloudflare R2 permanent QR codes
          </p>
        </div>

        {/* Card */}
        <Card className="p-8 border-slate-800/80 bg-slate-900/80 shadow-2xl backdrop-blur-2xl">
          <div className="flex items-center gap-2 mb-6 pb-4 border-b border-slate-800 text-xs text-emerald-400">
            <ShieldCheck className="w-4 h-4" />
            <span>Authenticated Cloudflare R2 Connected</span>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <Input
              label="Admin Email"
              type="email"
              placeholder="admin@warehouse.com"
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
              autoComplete="current-password"
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
              Sign In to Dashboard
            </Button>
          </form>
        </Card>

        {/* Security & Cloudflare R2 Note */}
        <div className="text-center text-[11px] text-slate-500 space-y-1">
          <p>Storage: Cloudflare R2 (Zero Egress Fees) • Immutable QR System</p>
          <p>Public QR codes never expose administrative routes or credentials.</p>
        </div>
      </div>
    </main>
  );
}
