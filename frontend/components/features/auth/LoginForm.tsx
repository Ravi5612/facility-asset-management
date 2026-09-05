"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  Eye,
  EyeOff,
  Mail,
  Lock,
  LogIn,
} from "lucide-react";
import { useRouter } from "next/navigation";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { loginSchema, LoginFormData } from "@/lib/validations/auth";
import { authService } from "@/services/auth.service";
import { useAuth } from "@/components/providers/AuthProvider";
import { ErrorAlert } from "@/components/ui/alert-box";
import { cn } from "@/lib/utils";
import { Spinner } from "@/components/ui/spinner";


export default function LoginForm() {
  const router = useRouter();
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
 
  const [error, setError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
    defaultValues: { email: "", password: "" },
  });

  const { refetch } = useAuth();

  const onSubmit = async (data: LoginFormData) => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await authService.login(data);
      if (response.success) {
        // Refetch user data via Context API instead of using localStorage
        await refetch();
        
        const role = response.user.role;
        if (role === "SUB_ADMIN") {
          router.push("/sub-admin/dashboard");
        } else if (role === "EMPLOYEE") {
            router.push("/employee/dashboard");
          } else if (role === "HOD") {
          const deptSlug = response.user.departmentName 
            ? response.user.departmentName.toLowerCase().replace(/\s+/g, '-')
            : "general";
          router.push(`/hod/${deptSlug}/dashboard`);
        } else {
          router.push("/superadmin");
        }
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Invalid email or password. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
    
      {/* Error Message */}
      {/* Error Message */}
      {error && <ErrorAlert message={error} />}

      {/* Email Field */}
      <div className="space-y-1.5">
        <Label htmlFor="email" className="text-sm font-semibold text-slate-700">
          Email Address
        </Label>
        <div className="relative">
          <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
          <Input
            id="email"
            type="email"
            placeholder="Enter your email address"
            autoComplete="email"
            disabled={isLoading}
            {...register("email")}
            className={cn(
              "pl-10 h-12 rounded-lg border-slate-200 bg-white text-slate-800 placeholder:text-slate-400",
              "focus-visible:ring-2 focus-visible:ring-[var(--brand-primary)] focus-visible:border-transparent",
              errors.email && "border-red-400 focus-visible:ring-red-400"
            )}
          />
        </div>
        {errors.email && (
          <p className="text-xs text-red-500 mt-1">{errors.email.message}</p>
        )}
      </div>

      {/* Password Field */}
      <div className="space-y-1.5">
        <Label htmlFor="password" className="text-sm font-semibold text-slate-700">
          Password
        </Label>
        <div className="relative">
          <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
          <Input
            id="password"
            type={showPassword ? "text" : "password"}
            placeholder="Enter your password"
            autoComplete="current-password"
            disabled={isLoading}
            {...register("password")}
            className={cn(
              "pl-10 pr-11 h-12 rounded-lg border-slate-200 bg-white text-slate-800 placeholder:text-slate-400",
              "focus-visible:ring-2 focus-visible:ring-[var(--brand-primary)] focus-visible:border-transparent",
              errors.password && "border-red-400 focus-visible:ring-red-400"
            )}
          />
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            disabled={isLoading}
            className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors"
            aria-label={showPassword ? "Hide password" : "Show password"}
          >
            {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
          </button>
        </div>
        {errors.password && (
          <p className="text-xs text-red-500 mt-1">{errors.password.message}</p>
        )}
      </div>

      
      {/* Login Button */}
      <Button
        type="submit"
        disabled={isLoading}
        className="w-full h-12 rounded-lg text-sm font-semibold text-white flex items-center justify-center gap-2"
        style={{ backgroundColor: "var(--brand-primary)" }}
      >
        {isLoading ? (
          <>
            <Spinner size="xs" className="mr-2" />
            Signing in...
          </>
        ) : (
          <>
            <LogIn className="h-4 w-4" />
            Login
          </>
        )}
      </Button>

      {/* OR Divider */}
      <div className="flex items-center gap-3">
        <div className="flex-1 h-px bg-slate-200" />
        <span className="text-xs text-slate-400 font-medium">OR</span>
        <div className="flex-1 h-px bg-slate-200" />
      </div>

    
    </form>
  );
}
