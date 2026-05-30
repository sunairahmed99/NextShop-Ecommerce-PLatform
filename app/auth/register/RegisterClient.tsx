"use client";

import React from "react";
import Link from "next/link";
import { useForm } from "react-hook-form";
import { useMutation } from "@tanstack/react-query";
import axios from "axios";
import toast from "react-hot-toast";
import { useRouter } from "next/navigation";

export default function RegisterPage() {
  const router = useRouter();
  const [imagePreview, setImagePreview] = React.useState<string | null>(null);
  const { register, handleSubmit, watch, setValue, formState: { errors } } = useForm();
  const password = watch("password");

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
      setValue("image", e.target.files);
    }
  };

  const { mutate, isPending } = useMutation({
    mutationFn: async (formData: FormData) => {
      const { data } = await axios.post("/api/auth/register", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      return data;
    },
    onSuccess: (data) => {
      toast.success(data.message || "Registration successful!");
      router.push("/auth/verify");
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || "Registration failed");
    },
  });

  const onSubmit = (data: any) => {
    const formData = new FormData();
    formData.append("name", data.name);
    formData.append("email", data.email);
    formData.append("password", data.password);
    formData.append("phone", data.phone);
    
    // Get image from react-hook-form data
    const image = data.image?.[0];
    if (image) {
      formData.append("image", image);
    }
    
    mutate(formData);
  };

  return (
    <div className="min-h-[85vh] flex items-center justify-center px-4 py-8">
      <div className="w-full max-w-md">
        <div className="bg-black border border-gray-800 p-6 md:p-8 rounded-2xl shadow-xl">
          <div className="text-center mb-6">
            <h1 className="text-2xl font-bold tracking-tight text-white mb-1">Create Account</h1>
            <p className="text-gray-400 text-xs">Join our community today</p>
          </div>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-[10px] font-bold text-gray-500 uppercase tracking-widest mb-1 ml-1">
                  Full Name
                </label>
                <input
                  {...register("name", { required: "Name is required" })}
                  type="text"
                  placeholder="Enter Name"
                  className={`w-full bg-gray-900/50 border ${errors.name ? 'border-red-500' : 'border-gray-800'} rounded-lg px-3 py-2 text-sm text-white placeholder-gray-600 focus:outline-none focus:border-blue-500 transition-all`}
                />
                {errors.name && <p className="text-[10px] text-red-500 mt-1 ml-1">{errors.name.message as string}</p>}
              </div>
              <div>
                <label className="block text-[10px] font-bold text-gray-500 uppercase tracking-widest mb-1 ml-1">
                  Phone
                </label>
                <input
                  {...register("phone", { required: "Phone is required" })}
                  type="tel"
                  placeholder="Enter Phone Number"
                  className={`w-full bg-gray-900/50 border ${errors.phone ? 'border-red-500' : 'border-gray-800'} rounded-lg px-3 py-2 text-sm text-white placeholder-gray-600 focus:outline-none focus:border-blue-500 transition-all`}
                />
                {errors.phone && <p className="text-[10px] text-red-500 mt-1 ml-1">{errors.phone.message as string}</p>}
              </div>
            </div>

            <div>
              <label className="block text-[10px] font-bold text-gray-500 uppercase tracking-widest mb-1 ml-1">
                Email Address
              </label>
              <input
                {...register("email", { required: "Email is required" })}
                type="email"
                placeholder="Enter Email"
                className={`w-full bg-gray-900/50 border ${errors.email ? 'border-red-500' : 'border-gray-800'} rounded-lg px-3 py-2 text-sm text-white placeholder-gray-600 focus:outline-none focus:border-blue-500 transition-all`}
              />
              {errors.email && <p className="text-[10px] text-red-500 mt-1 ml-1">{errors.email.message as string}</p>}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-[10px] font-bold text-gray-500 uppercase tracking-widest mb-1 ml-1">
                  Password
                </label>
                <input
                  {...register("password", { 
                    required: "Password is required",
                    minLength: { value: 6, message: "Min 6 characters" }
                  })}
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
                    required: "Confirm password",
                    validate: value => value === password || "Passwords do not match"
                  })}
                  type="password"
                  placeholder="••••••••"
                  className={`w-full bg-gray-900/50 border ${errors.confirmPassword ? 'border-red-500' : 'border-gray-800'} rounded-lg px-3 py-2 text-sm text-white placeholder-gray-600 focus:outline-none focus:border-blue-500 transition-all`}
                />
                {errors.confirmPassword && <p className="text-[10px] text-red-500 mt-1 ml-1">{errors.confirmPassword.message as string}</p>}
              </div>
            </div>

            <div>
              <label className="block text-[10px] font-bold text-gray-500 uppercase tracking-widest mb-1 ml-1">
                Profile Image
              </label>
              <div className="flex items-center gap-4">
                <div className="w-16 h-16 rounded-full bg-gray-900 border border-gray-800 overflow-hidden flex items-center justify-center shrink-0">
                  {imagePreview ? (
                    <img src={imagePreview} alt="Preview" className="w-full h-full object-cover" />
                  ) : (
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-gray-700" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                    </svg>
                  )}
                </div>
                <label className="flex-1 flex flex-col items-center justify-center h-16 border-2 border-dashed border-gray-800 rounded-lg cursor-pointer bg-gray-900/30 hover:bg-gray-900/50 transition-all">
                  <p className="text-[10px] text-gray-500"><span className="font-semibold text-blue-500">Choose Image</span></p>
                  <input 
                    type="file" 
                    className="hidden" 
                    accept="image/*"
                    onChange={handleImageChange}
                  />
                </label>
              </div>
            </div>

            <button
              type="submit"
              disabled={isPending}
              className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 disabled:from-gray-700 disabled:to-gray-800 disabled:cursor-not-allowed text-white font-semibold py-2.5 rounded-lg shadow-lg shadow-blue-900/20 transition-all active:scale-[0.98] text-sm mt-2"
            >
              {isPending ? "Creating Account..." : "Register"}
            </button>
          </form>

          <div className="mt-6 text-center border-t border-gray-900 pt-6">
            <p className="text-gray-400 text-xs">
              Already have an account?{" "}
              <Link href="/auth/login" className="text-blue-500 hover:text-blue-400 font-semibold underline-offset-4 hover:underline">
                Log in
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
