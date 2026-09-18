import type { Metadata } from "next";
import Link from "next/link";
import { LoginForm } from "@/components/admin/login-form";

export const metadata: Metadata = { title: "Admin Login" };

export default function AdminLoginPage() {
  return (
    <div className="min-h-screen flex items-center justify-center px-4">
      <div className="w-full max-w-sm">
        <div className="text-center mb-10">
          <p className="font-display text-3xl text-rail-gold tracking-tight">RAILERS</p>
          <p className="text-sm text-rail-silver mt-1">Admin sign in</p>
        </div>

        <LoginForm />

        <p className="mt-6 text-center">
          <Link href="/admin/forgot-password" className="text-sm text-rail-silver hover:text-rail-gold">
            Forgot your password?
          </Link>
        </p>
        <p className="mt-8 text-center">
          <Link href="/" className="text-sm text-rail-silver hover:text-rail-white">
            ← Back to site
          </Link>
        </p>
      </div>
    </div>
  );
}
