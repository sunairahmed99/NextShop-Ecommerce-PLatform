"use client";

import React from "react";
import Link from "next/link";
import { useForm } from "react-hook-form";
import { useMutation } from "@tanstack/react-query";
import axios from "axios";
import toast from "react-hot-toast";
import { useRouter } from "next/navigation";

export default function LoginPage() {
  const router = useRouter();
  const { register, handleSubmit, formState: { errors } } = useForm();

  React.useEffect(() => {
    if (typeof window !== "undefined") {
      const params = new URLSearchParams(window.location.search);
      const error = params.get("error");
      if (error) {
        if (error === "auth_failed") {
          toast.error("Google authentication failed. Please try again.");
        } else if (error === "missing_keys") {
          toast.error("Google keys are not configured in backend .env file yet.");
        } else if (error === "no_code") {
          toast.error("No authorization code received from Google.");
        } else {
          toast.error("An error occurred during Google sign in.");
        }
        
        // Clean up the URL query parameters
        params.delete("error");
        const newQuery = params.toString() ? `?${params.toString()}` : "";
        router.replace(`/auth/login${newQuery}`);
      }
    }
  }, [router]);

  const { mutate, isPending } = useMutation({
    mutationFn: async (credentials: any) => {
      const { data } = await axios.post("/api/auth/login", credentials);
      return data;
    },
    onSuccess: (data) => {
      toast.success(data.message || "Logged in successfully!");
      router.push("/");
      router.refresh();
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || "Login failed");
    },
  });

  const onSubmit = (data: any) => {
    mutate(data);
  };

  return (
    <div className="h-[80vh] flex items-center justify-center px-4 font-sans w-full">
      <div className="w-full max-w-md mx-auto" style={{ maxWidth: "420px" }}>
        <div className="bg-black border border-zinc-800 p-8 rounded-2xl shadow-2xl">
          <div className="text-center mb-8">
            <h1 className="text-2xl font-bold tracking-tight text-white mb-2">Welcome Back</h1>
            <p className="text-zinc-400 text-xs">Sign in to your account to continue</p>
          </div>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
            <div>
              <label className="block text-[10px] font-bold text-zinc-500 uppercase tracking-widest mb-1.5 ml-1">
                Email Address
              </label>
              <input
                {...register("email", { required: "Email is required" })}
                type="email"
                placeholder="Enter Email"
                className={`w-full bg-zinc-900/50 border ${errors.email ? 'border-red-500' : 'border-zinc-800'} rounded-xl px-4 py-2.5 text-sm text-white placeholder-zinc-600 focus:outline-none focus:border-blue-500 transition-all`}
              />
              {errors.email && <p className="text-[10px] text-red-500 mt-1.5 ml-1">{errors.email.message as string}</p>}
            </div>

            <div>
              <div className="flex justify-between items-center mb-1.5 ml-1">
                <label className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest">
                  Password
                </label>
                <Link href="/auth/forgotpass" className="text-xs text-blue-500 hover:text-blue-400 font-semibold transition-colors">
                  Forgot Password?
                </Link>
              </div>
              <input
                {...register("password", { required: "Password is required" })}
                type="password"
                placeholder="••••••••"
                className={`w-full bg-zinc-900/50 border ${errors.password ? 'border-red-500' : 'border-zinc-800'} rounded-xl px-4 py-2.5 text-sm text-white placeholder-zinc-600 focus:outline-none focus:border-blue-500 transition-all`}
              />
              {errors.password && <p className="text-[10px] text-red-500 mt-1.5 ml-1">{errors.password.message as string}</p>}
            </div>

            <button
              type="submit"
              disabled={isPending}
              className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 disabled:from-zinc-800 disabled:to-zinc-900 disabled:text-zinc-500 disabled:cursor-not-allowed text-white font-bold py-3 rounded-xl shadow-lg shadow-blue-900/20 transition-all active:scale-[0.98] text-sm mt-2"
            >
              {isPending ? "Signing in..." : "Sign In"}
            </button>
          </form>

          <div className="relative flex py-4 items-center">
            <div className="flex-grow border-t border-zinc-900"></div>
            <span className="flex-shrink mx-4 text-[10px] text-zinc-500 font-bold uppercase tracking-widest">or</span>
            <div className="flex-grow border-t border-zinc-900"></div>
          </div>

          <button
            type="button"
            onClick={() => {
              window.location.href = "/api/auth/google";
            }}
            className="w-full flex items-center justify-center gap-3 bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 text-white font-semibold py-3 rounded-xl shadow-lg transition-all active:scale-[0.98] text-sm"
          >
            <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
              <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
              <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" fill="#FBBC05"/>
              <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" fill="#EA4335"/>
            </svg>
            Sign in with Google
          </button>

          <div className="mt-6 text-center pt-6 border-t border-zinc-900">
            <p className="text-zinc-400 text-xs">
              New here?{" "}
              <Link href="/auth/register" className="text-blue-500 hover:text-blue-400 font-bold underline-offset-4 hover:underline transition-all">
                Create an account
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
