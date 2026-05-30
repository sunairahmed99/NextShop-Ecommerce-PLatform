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
    <div className="h-[80vh] flex items-center justify-center px-4 font-sans">
      <div className="w-full max-w-sm">
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

          <div className="mt-8 text-center pt-6 border-t border-zinc-900">
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
