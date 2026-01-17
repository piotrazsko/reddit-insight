'use client';

import { useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';

import { AuthLayout, AuthLink } from '@/components/AuthLayout';
import { FormField, SubmitButton } from '@/components/AuthForm';

export default function RegisterPage() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleSubmit = useCallback(
    async (e: React.FormEvent) => {
      e.preventDefault();
      setLoading(true);

      try {
        const res = await fetch('/api/register', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ name, email, password }),
        });

        const data = await res.json();

        if (res.ok) {
          toast.success('Account created! Please sign in.');
          router.push('/login');
        } else {
          toast.error(data.error || 'Registration failed');
        }
      } catch {
        toast.error('Registration failed');
      } finally {
        setLoading(false);
      }
    },
    [name, email, password, router]
  );

  return (
    <AuthLayout
      title="Trend Pulse"
      subtitle="Create a new account"
      showLogo={false}
      footer={
        <AuthLink
          text="Already have an account?"
          linkText="Sign In"
          href="/login"
        />
      }
    >
      <form onSubmit={handleSubmit} className="space-y-6">
        <FormField
          label="Name"
          type="text"
          value={name}
          onChange={setName}
          required
        />
        <FormField
          label="Email"
          type="email"
          value={email}
          onChange={setEmail}
          required
        />
        <FormField
          label="Password"
          type="password"
          value={password}
          onChange={setPassword}
          required
        />
        <SubmitButton loading={loading}>Sign Up</SubmitButton>
      </form>
    </AuthLayout>
  );
}
