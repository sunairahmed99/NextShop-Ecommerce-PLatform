"use client";

import React from "react";
import Link from "next/link";
import { useForm } from "react-hook-form";
import { useMutation } from "@tanstack/react-query";
import axios from "axios";
import toast from "react-hot-toast";
import { useRouter } from "next/navigation";

export default function VerifyPage() {
  const router = useRouter();
  const { register, handleSubmit, formState: { errors } } = useForm();

  const { mutate, isPending } = useMutation({
    mutationFn: async (data: any) => {
      const response = await axios.post("/api/auth/verify", data);
      return response.data;
    },
    onSuccess: (data) => {
      toast.success(data.message || "Account verified!");
      router.push("/auth/login");
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || "Verification failed");
    },
  });

  const onSubmit = (data: any) => {
    mutate(data);
  };

  return (
    <div className="h-[80vh] flex items-center justify-center px-4 font-sans">
      <div className="w-full max-w-sm">
        <div className="bg-black border border-zinc-800 p-8 rounded-2xl shadow-2xl text-center">
          <div className="mb-6">
            <div className="w-12 h-12 bg-blue-600/10 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-blue-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
              </svg>
            </div>
            <h1 className="text-2xl font-bold tracking-tight text-white mb-2">Verify Account</h1>
            <p className="text-zinc-400 text-xs">Please enter the 6-digit code sent to your email address.</p>
          </div>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            <div>
              <input
                {...register("code", { 
                  required: "Verification code is required",
                  minLength: { value: 6, message: "Must be exactly 6 digits" },
                  maxLength: { value: 6, message: "Must be exactly 6 digits" }
                })}
                type="text"
                placeholder="000000"
                className={`w-full bg-zinc-900/50 border ${errors.code ? 'border-red-500' : 'border-zinc-800'} rounded-xl px-4 py-4 text-white placeholder-zinc-700 focus:outline-none focus:border-blue-500 transition-all text-center text-2xl font-bold tracking-[0.5em] font-mono shadow-inner`}
              />
              {errors.code && <p className="text-[10px] text-red-500 mt-2 font-medium">{errors.code.message as string}</p>}
            </div>

            <button
              type="submit"
              disabled={isPending}
              className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 disabled:from-zinc-800 disabled:to-zinc-900 disabled:text-zinc-500 disabled:cursor-not-allowed text-white font-bold py-3.5 rounded-xl shadow-lg shadow-blue-900/20 transition-all active:scale-[0.98] text-sm"
            >
              {isPending ? "Verifying..." : "Verify Now"}
            </button>
          </form>

          <div className="mt-8 pt-6 border-t border-zinc-900">
            <p className="text-[11px] text-zinc-500">
              Didn't receive the code?{" "}
              <button className="text-blue-500 hover:text-blue-400 font-bold hover:underline transition-all underline-offset-4">
                Resend OTP
              </button>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
