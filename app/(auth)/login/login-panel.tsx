"use client";

import { ArrowRight, LockKeyhole, ShieldCheck } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";

import { FieldGroup, FieldLabel, TextInput } from "@/components/forms/form-primitives";
import { seededCredentials } from "@/lib/data/seed-credentials";
import { Button } from "@/components/ui/button";
import type { ApiResponse, AuthUser } from "@/types";

export function LoginPanel() {
  const router = useRouter();
  const [email, setEmail] = useState<string>(seededCredentials[0].email);
  const [password, setPassword] = useState<string>(seededCredentials[0].password);
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    setIsSubmitting(true);

    try {
      const response = await fetch("/api/auth/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email, password }),
      });

      const result = (await response.json()) as ApiResponse<AuthUser>;

      if (!response.ok || !result.success) {
        throw new Error(result.success ? "Login failed" : result.message);
      }

      router.push("/dashboard");
      router.refresh();
    } catch (submitError) {
      setError(submitError instanceof Error ? submitError.message : "Login failed.");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <div className="grid min-h-screen bg-white lg:grid-cols-[1.05fr_0.95fr]">
      <section className="relative hidden overflow-hidden border-r border-line bg-mist lg:flex">
        <div className="grid-fade absolute inset-0" />
        <div className="relative z-10 flex flex-col justify-between p-12">
          <div>
            <p className="font-mono text-[11px] uppercase tracking-[0.28em] text-fog">
              Probase Solutions
            </p>
            <h1 className="mt-6 max-w-xl text-5xl font-semibold tracking-tight">
              Premium control over people, revenue, and delivery.
            </h1>
            <p className="mt-5 max-w-lg text-base text-fog">
              Built for IT services operators who need a clean, executive-grade admin surface without operational noise.
            </p>
          </div>
          <div className="grid gap-4 md:grid-cols-2">
            <div className="surface bg-white p-5">
              <ShieldCheck size={18} />
              <p className="mt-4 text-lg font-semibold">Role-aware access</p>
              <p className="mt-2 text-sm text-fog">
                Admin and manager roles are separated to protect sensitive payroll workflows.
              </p>
            </div>
            <div className="surface bg-white p-5">
              <LockKeyhole size={18} />
              <p className="mt-4 text-lg font-semibold">JWT session security</p>
              <p className="mt-2 text-sm text-fog">
                Secure cookie sessions for protected dashboard routes and APIs.
              </p>
            </div>
          </div>
        </div>
      </section>

      <section className="flex items-center justify-center px-6 py-12 sm:px-10">
        <div className="w-full max-w-md">
          <div className="mb-8">
            <p className="font-mono text-[11px] uppercase tracking-[0.24em] text-fog">
              Admin Login
            </p>
            <h2 className="mt-3 text-3xl font-semibold tracking-tight">Welcome back</h2>
            <p className="mt-2 text-sm text-fog">
              Use one of the seeded credentials below or replace them after creating your own users.
            </p>
          </div>

          <div className="surface p-6">
            <form className="space-y-5" onSubmit={handleSubmit}>
              <FieldGroup>
                <FieldLabel htmlFor="login-email">Email</FieldLabel>
                <TextInput
                  id="login-email"
                  type="email"
                  value={email}
                  onChange={(event) => setEmail(event.target.value)}
                  required
                />
              </FieldGroup>
              <FieldGroup>
                <FieldLabel htmlFor="login-password">Password</FieldLabel>
                <TextInput
                  id="login-password"
                  type="password"
                  value={password}
                  onChange={(event) => setPassword(event.target.value)}
                  required
                />
              </FieldGroup>
              {error ? (
                <div className="rounded-[16px] border border-line bg-black px-4 py-3 text-sm text-white">
                  {error}
                </div>
              ) : null}
              <Button type="submit" className="w-full" disabled={isSubmitting}>
                {isSubmitting ? "Signing in..." : "Enter Dashboard"}
                <ArrowRight size={15} />
              </Button>
            </form>
          </div>

          <div className="mt-6 rounded-[18px] border border-line bg-mist p-5 text-sm text-fog">
            <p className="font-semibold text-black">Seeded credentials</p>
            {seededCredentials.map((credential, index) => (
              <p key={credential.email} className={index === 0 ? "mt-2" : "mt-1"}>
                {credential.label}: `{credential.email}` / `{credential.password}`
              </p>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
