import { Metadata } from "next";
import Image from "next/image";
import LoginForm from "@/components/features/auth/LoginForm";

export const metadata: Metadata = {
  title: "Login | Gate2Desk",
  description: "Login to the Gate2Desk Facility Asset & Visitor Management System",
};

export default function LoginPage() {
  return (
    /* Full-page background */
    <div className="min-h-screen flex items-center justify-center bg-[#eef2ff] p-4">

      {/* ── SINGLE CARD (Left + Right joined) ── */}
      <div className="flex w-full max-w-[920px] rounded-2xl overflow-hidden shadow-2xl shadow-blue-200/60">

        {/* ── LEFT PANEL ── */}
        <div
          className="hidden md:flex w-1/2 shrink-0 flex-col justify-between p-9 relative overflow-hidden"
          style={{
            background: "linear-gradient(160deg, #1553cc 0%, #1240a8 50%, #0d2f80 100%)",
          }}
        >
          {/* Decorative background circles */}
          <div className="absolute -top-16 -left-16 h-64 w-64 rounded-full bg-white/10" />
          <div className="absolute top-1/2 -right-12 h-48 w-48 rounded-full bg-white/5" />
          <div className="absolute -bottom-10 -left-6 h-36 w-36 rounded-full bg-white/5" />

          {/* Logo */}
          <div className="relative z-10 flex items-center gap-3">
            <Image
              src="/dr-it-logo.jpg"
              alt="DR IT GROUP Logo"
              width={44}
              height={44}
              className="rounded-lg object-contain bg-white p-0.5"
            />
            <div>
              <p className="text-base font-bold text-white leading-tight tracking-wide">Dr IT GROUP</p>
              <p className="text-[9px] uppercase tracking-widest text-white/55 leading-tight">
                Facility & Asset Management
              </p>
            </div>
          </div>

          {/* Welcome Text */}
          <div className="relative z-10 space-y-4">
            <div>
              <h2 className="text-3xl font-extrabold text-white leading-tight">
                Welcome Back!
              </h2>
              <p className="mt-2.5 text-sm text-white/65 leading-relaxed">
                Log in to your account and continue managing your assets and facilities efficiently.
              </p>
            </div>

            {/* Illustration */}
            <div className="relative rounded-xl overflow-hidden border border-white/10 mt-4">
              <Image
                src="/login-illustration.jpg"
                alt="Dashboard analytics illustration"
                width={380}
                height={230}
                className="w-full object-cover opacity-90"
                priority
              />
            </div>
          </div>

          {/* Footer */}
          <div className="relative z-10">
            <p className="text-[10px] text-white/30">
              © 2025 Gate2Desk. All rights reserved.
            </p>
          </div>
        </div>

        {/* ── RIGHT PANEL ── */}
        <div className="flex flex-1 flex-col justify-center bg-white p-8 md:p-10">
          {/* Mobile Logo */}
          <div className="mb-6 flex items-center gap-2 md:hidden">
            <Image
              src="/dr-it-logo.jpg"
              alt="DR IT GROUP Logo"
              width={36}
              height={36}
              className="rounded-lg object-contain"
            />
            <p className="text-sm font-bold text-slate-800">Dr IT GROUP</p>
          </div>

          {/* Heading */}
          <div className="mb-7 text-center">
            <h1 className="text-2xl font-bold text-slate-800">
              Login to your account
            </h1>
            <p className="mt-1.5 text-sm text-slate-500">
              Enter your credentials to access your dashboard
            </p>
          </div>

          {/* Form */}
          <LoginForm />
        </div>
      </div>
    </div>
  );
}
