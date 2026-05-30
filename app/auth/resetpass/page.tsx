"use client";

import React from "react";
import Link from "next/link";
import { useForm } from "react-hook-form";
import { useMutation } from "@tanstack/react-query";
import axios from "axios";
import toast from "react-hot-toast";
import { useRouter } from "next/navigation";

export default function ResetPassPage() {
  const router = useRouter();
  const { register, handleSubmit, watch, formState: { errors } } = useForm();
  const password = watch("password");

  const { mutate, isPending } = useMutation({
    mutationFn: async (data: any) => {
      const response = await axios.post("/api/auth/resetpass", data);
      return response.data;
    },
    onSuccess: (data) => {
      toast.success(data.message || "Password updated!");
      router.push("/auth/login");
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || "Reset failed");
    },
  });

  const onSubmit = (data: any) => {
    mutate(data);
  };

  return (
    <div className="min-h-[70vh] flex items-center justify-center px-4 py-8">
      <div className="w-full max-sm:max-w-sm">
        <div className="bg-black border border-gray-800 p-6 rounded-xl shadow-xl">
          <div className="text-center mb-6">
            <h1 className="text-2xl font-bold tracking-tight text-white mb-1">Reset</h1>
            <p className="text-gray-400 text-xs">Create your new password</p>
          </div>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div>
              <label className="block text-[10px] font-bold text-gray-500 uppercase tracking-widest mb-1 ml-1">
                Reset Code
              </label>
              <input
                {...register("code", { required: "Code is required" })}
                type="text"
                placeholder="000000"
                className={`w-full bg-gray-900/50 border ${errors.code ? 'border-red-500' : 'border-gray-800'} rounded-lg px-3 py-2 text-sm text-white placeholder-gray-600 focus:outline-none focus:border-blue-500 transition-all text-center font-mono`}
              />
              {errors.code && <p className="text-[10px] text-red-500 mt-1 ml-1">{errors.code.message as string}</p>}
            </div>

            <div>
              <label className="block text-[10px] font-bold text-gray-500 uppercase tracking-widest mb-1 ml-1">
                New Password
              </label>
              <input
                {...register("password", { required: "Required", minLength: { value: 6, message: "Min 6" } })}
                type="password"
                placeholder="••••••••"
                className={`w-full bg-gray-900/50 border ${errors.password ? 'border-red-500' : 'border-gray-800'} rounded-lg px-3 py-2 text-sm text-white placeholder-gray-600 focus:outline-none focus:border-blue-500 transition-all`}
              />
              {errors.password && <p className="text-[10px] text-red-500 mt-1 ml-1">{errors.password.message as string}</p>}
            </div>

            <div>
              <label className="block text-[10px] font-bold text-gray-500 uppercase tracking-widest mb-1 ml-1">
                Confirm
              </label>
              <input
                {...register("confirmPassword", { 
                  required: "Required",
                  validate: value => value === password || "Mismatch"
                })}
                type="password"
                placeholder="••••••••"
                className={`w-full bg-gray-900/50 border ${errors.confirmPassword ? 'border-red-500' : 'border-gray-800'} rounded-lg px-3 py-2 text-sm text-white placeholder-gray-600 focus:outline-none focus:border-blue-500 transition-all`}
              />
              {errors.confirmPassword && <p className="text-[10px] text-red-500 mt-1 ml-1">{errors.confirmPassword.message as string}</p>}
            </div>

            <button
              type="submit"
              disabled={isPending}
              className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 disabled:from-gray-700 disabled:to-gray-800 disabled:cursor-not-allowed text-white font-semibold py-2.5 rounded-lg shadow-lg shadow-blue-900/20 transition-all active:scale-[0.98] text-sm mt-2"
            >
              {isPending ? "Updating..." : "Update Password"}
            </button>
          </form>

          <div className="mt-6 text-center">
            <Link href="/auth/login" className="text-[10px] text-gray-500 hover:text-white transition-colors">
              Remembered? Login
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
