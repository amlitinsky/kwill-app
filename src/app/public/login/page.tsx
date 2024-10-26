'use client'

import { useState } from 'react';
import Image from "next/image"
import Link from "next/link"
import { useRouter } from 'next/navigation'
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { signIn, signInWithGoogle } from '@/lib/supabase-client'
import { toast } from '@/hooks/use-toast';

// const description =
//   "A login page with two columns. The first column has the login form with email and password. There's a Forgot your passwork link and a link to sign up if you do not have an account. The second column has a cover image."

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const router = useRouter();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await signIn(email, password);
      router.push('/private/dashboard');
    } catch (error) {
      console.error('Login error:');
      toast({
        title: "Login Error",
        description: "Failed to sign in. Did you verify your email? If your verification email expired, try signing up again.",
        variant: "destructive",
      });
    }
  };

  const handleGoogleSignIn = async () => {
    try {
      const data = await signInWithGoogle();
      router.push(data.url)
      // Don't redirect here, the callback will handle the redirect
    } catch (error) {
      console.error('Google sign-in error:');
      toast({
        title: "Sign in Error",
        description: (error as Error).message || "An error occurred during sign in.",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="flex min-h-screen w-full">
      <div className="flex flex-1 items-center justify-center py-12">
        <div className="mx-auto grid w-[350px] gap-6">
          <div className="grid gap-2 text-center">
            <h1 className="text-3xl font-bold">Login</h1>
            <p className="text-balance text-muted-foreground">
              Enter your email below to login to your account
            </p>
          </div>
          <form onSubmit={handleLogin} className="grid gap-4">
            <div className="grid gap-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="m@example.com"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>
            <div className="grid gap-2">
              <div className="flex items-center">
                <Label htmlFor="password">Password</Label>
                <Link
                  href="/forgot-password"
                  className="ml-auto inline-block text-sm underline"
                >
                  Forgot your password?
                </Link>
              </div>
              <Input 
                id="password" 
                type="password" 
                required 
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>
            <Button type="submit" className="w-full">
              Login
            </Button>
          </form>
          <Button variant="outline" className="w-full" onClick={handleGoogleSignIn}>
            Login with Google
          </Button>
          <div className="mt-4 text-center text-sm">
            Don&apos;t have an account?{" "}
            <Link href="/public/signup" className="underline">
              Sign up
            </Link>
          </div>
        </div>
      </div>
      <div className="hidden flex-1 lg:block relative">
        <Image
          src="/images/backgrounds/data-connections.jpg"
          alt="Background"
          quality={100}
          priority
          fill
          className="object-cover"
        />
      </div>
    </div>
  )
}
