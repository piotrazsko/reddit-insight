'use client';

import { useState, useCallback } from 'react';
import { signIn } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';

import { AuthLayout, AuthLink } from '@/components/AuthLayout';
import { FormField, SubmitButton } from '@/components/AuthForm';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleSubmit = useCallback(
    async (e: React.FormEvent) => {
      e.preventDefault();
      setLoading(true);

      try {
        const res = await signIn('credentials', {
          email,
          password,
          redirect: false,
        });

        if (res?.error) {
          toast.error('Invalid credentials');
        } else {
          router.push('/');
          router.refresh();
        }
      } catch {
        console.error('Login failed');
        toast.error('Login failed');
      } finally {
        setLoading(false);
      }
    },
    [email, password, router]
  );

  return (
    <AuthLayout
      title="Trend Pulse"
      subtitle="Sign in to your account"
      footer={
        <AuthLink
          text="Don't have an account?"
          linkText="Register"
          href="/register"
        />
      }
    >
      <form onSubmit={handleSubmit} className="space-y-6">
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
        <SubmitButton loading={loading}>Sign In</SubmitButton>
      </form>
    </AuthLayout>
  );
}
