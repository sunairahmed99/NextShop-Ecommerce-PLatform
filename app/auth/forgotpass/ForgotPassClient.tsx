"use client";

import React from "react";
import Link from "next/link";
import { useForm } from "react-hook-form";
import { useMutation } from "@tanstack/react-query";
import axios from "axios";
import toast from "react-hot-toast";
import { useRouter } from "next/navigation";

export default function ForgotPassPage() {
  const router = useRouter();
  const { register, handleSubmit, formState: { errors } } = useForm();

  const { mutate, isPending } = useMutation({
    mutationFn: async (data: any) => {
      const response = await axios.post("/api/auth/forgotpass", data);
      return response.data;
    },
    onSuccess: (data) => {
      toast.success(data.message || "Reset code sent!");
      router.push("/auth/resetpass");
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || "Failed to send code");
    },
  });

  const onSubmit = (data: any) => {
    mutate(data);
  };

  return (
    <div className="min-h-[85vh] flex items-center justify-center px-4 py-8 w-full">
      <div className="w-full max-w-md mx-auto" style={{ maxWidth: "420px" }}>
        <div className="bg-black border border-gray-800 p-6 rounded-xl shadow-xl">
          <div className="text-center mb-6">
            <h1 className="text-2xl font-bold tracking-tight text-white mb-1">Recover</h1>
            <p className="text-gray-400 text-xs">Enter email to get reset code</p>
          </div>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div>
              <label className="block text-[10px] font-bold text-gray-500 uppercase tracking-widest mb-1 ml-1">
                Email Address
              </label>
              <input
                {...register("email", { required: "Email is required" })}
                type="email"
                placeholder="name@company.com"
                className={`w-full bg-gray-900/50 border ${errors.email ? 'border-red-500' : 'border-gray-800'} rounded-lg px-3 py-2 text-sm text-white placeholder-gray-600 focus:outline-none focus:border-blue-500 transition-all`}
              />
              {errors.email && <p className="text-[10px] text-red-500 mt-1 ml-1">{errors.email.message as string}</p>}
            </div>

            <button
              type="submit"
              disabled={isPending}
              className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-blue-800 disabled:cursor-not-allowed text-white font-semibold py-2.5 rounded-lg shadow-lg shadow-blue-900/20 transition-all active:scale-[0.98] text-sm"
            >
              {isPending ? "Sending..." : "Send Code"}
            </button>
          </form>

          <div className="mt-6 text-center">
            <Link href="/auth/login" className="text-[10px] text-gray-500 hover:text-white transition-colors">
              &larr; Back to Login
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
