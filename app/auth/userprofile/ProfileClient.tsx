"use client";

import React from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import axios from "axios";
import toast from "react-hot-toast";

interface ProfileClientProps {
  initialUser: any;
}

export default function ProfileClient({ initialUser }: ProfileClientProps) {
  const [user, setUser] = React.useState(initialUser);
  const [isEditing, setIsEditing] = React.useState(false);
  const [isSaving, setIsSaving] = React.useState(false);
  
  // Form State
  const [editData, setEditData] = React.useState({
    name: user.name,
    phone: user.phone || "",
  });
  const [selectedFile, setSelectedFile] = React.useState<File | null>(null);
  const [imagePreview, setImagePreview] = React.useState<string | null>(null);

  const fileInputRef = React.useRef<HTMLInputElement>(null);
  const queryClient = useQueryClient();

  const mutation = useMutation({
    mutationFn: async (formData: FormData) => {
      const { data } = await axios.post("/api/auth/profile", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      return data;
    },
    onSuccess: (data) => {
      toast.success("Profile updated successfully!");
      setUser(data.data);
      setIsEditing(false);
      setIsSaving(false);
      setSelectedFile(null);
      setImagePreview(null);
      queryClient.invalidateQueries({ queryKey: ["profile"] });
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || "Update failed");
      setIsSaving(false);
    },
  });

  const handleSave = () => {
    setIsSaving(true);
    const formData = new FormData();
    formData.append("name", editData.name);
    formData.append("phone", editData.phone);
    if (selectedFile) {
      formData.append("image", selectedFile);
    }
    mutation.mutate(formData);
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setSelectedFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  return (
    <div className="flex flex-col items-center justify-center px-4 font-sans py-4">
      <div className="w-full max-w-2xl">
        <input
          type="file"
          ref={fileInputRef}
          onChange={handleImageChange}
          className="hidden"
          accept="image/*"
        />

        <div className="relative overflow-hidden bg-black border border-zinc-800 rounded-3xl shadow-2xl">
          <div className="absolute top-0 left-0 w-full h-24 bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 opacity-20"></div>
          
          <div className="relative px-8 pt-12 pb-8">
            <div className="flex flex-col md:flex-row items-center md:items-end gap-6">
              {/* Profile Image Section */}
              <div className="relative group">
                <div className="w-32 h-32 rounded-full border-4 border-zinc-800 overflow-hidden bg-zinc-800 shadow-xl transition-transform duration-300">
                  <img
                    src={imagePreview || user.imageurl || "https://ui-avatars.com/api/?name=" + user.name}
                    alt={user.name}
                    className="w-full h-full object-cover"
                  />
                  {isEditing && (
                    <button 
                      onClick={() => fileInputRef.current?.click()}
                      className="absolute inset-0 bg-black/60 flex flex-col items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-white mb-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                      </svg>
                      <span className="text-[10px] text-white font-bold uppercase tracking-tighter">Change</span>
                    </button>
                  )}
                  {isSaving && (
                    <div className="absolute inset-0 bg-black/60 flex items-center justify-center">
                      <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-white"></div>
                    </div>
                  )}
                </div>
              </div>

              {/* Basic Info */}
              <div className="flex-1 text-center md:text-left">
                {isEditing ? (
                  <div className="space-y-2 mb-2">
                    <input
                      type="text"
                      value={editData.name}
                      onChange={(e) => setEditData({ ...editData, name: e.target.value })}
                      className="bg-zinc-900 border border-zinc-800 text-white text-2xl font-bold px-3 py-1 rounded-lg w-full focus:outline-none focus:border-blue-500"
                    />
                  </div>
                ) : (
                  <h1 className="text-3xl font-extrabold text-white mb-2 bg-clip-text text-transparent bg-gradient-to-r from-white to-zinc-400">
                    {user.name}
                  </h1>
                )}
                <p className="text-zinc-400 text-base flex items-center justify-center md:justify-start gap-2">
                  <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></span>
                  {user.role?.toUpperCase()}
                </p>
              </div>
              
              {/* Action Buttons */}
              <div className="flex gap-3">
                {isEditing ? (
                  <>
                    <button 
                      onClick={() => setIsEditing(false)}
                      className="px-5 py-2 bg-zinc-900 hover:bg-zinc-800 text-zinc-400 rounded-xl font-medium transition-all border border-zinc-800 text-sm"
                    >
                      Cancel
                    </button>
                    <button 
                      onClick={handleSave}
                      disabled={isSaving}
                      className="px-6 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-xl font-bold transition-all shadow-lg shadow-blue-900/20 text-sm disabled:opacity-50"
                    >
                      {isSaving ? "Saving..." : "Save Changes"}
                    </button>
                  </>
                ) : (
                  <button 
                    onClick={() => setIsEditing(true)}
                    className="px-6 py-2.5 bg-zinc-800 hover:bg-zinc-700 text-white rounded-xl font-medium transition-all border border-zinc-700 shadow-sm active:scale-95"
                  >
                    Edit Profile
                  </button>
                )}
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-8">
              <div className="p-5 rounded-2xl bg-zinc-800/20 border border-zinc-800/50 opacity-80 cursor-not-allowed">
                <p className="text-xs text-zinc-500 uppercase tracking-wider mb-1">Email Address (Locked)</p>
                <p className="text-base text-zinc-400 font-medium">{user.email}</p>
              </div>
              
              <div className={`p-5 rounded-2xl border transition-all ${isEditing ? 'bg-zinc-900/50 border-blue-500/50 shadow-lg shadow-blue-900/5' : 'bg-zinc-800/30 border-zinc-800'}`}>
                <p className="text-xs text-zinc-500 uppercase tracking-wider mb-1">Phone Number</p>
                {isEditing ? (
                  <input
                    type="text"
                    value={editData.phone}
                    onChange={(e) => setEditData({ ...editData, phone: e.target.value })}
                    className="bg-transparent text-white font-medium w-full focus:outline-none text-base"
                    placeholder="Enter phone number"
                  />
                ) : (
                  <p className="text-base text-white font-medium">{user.phone || "Not provided"}</p>
                )}
              </div>

              <div className="p-5 rounded-2xl bg-zinc-800/30 border border-zinc-800">
                <p className="text-xs text-zinc-500 uppercase tracking-wider mb-1">Account Status</p>
                <div className="flex items-center gap-2">
                  <span className={`px-3 py-1 rounded-full text-xs font-bold ${user.isVerified ? "bg-green-500/10 text-green-500" : "bg-red-500/10 text-red-500"}`}>
                    {user.isVerified ? "VERIFIED" : "UNVERIFIED"}
                  </span>
                </div>
              </div>

              <div className="p-5 rounded-2xl bg-zinc-800/30 border border-zinc-800">
                <p className="text-xs text-zinc-500 uppercase tracking-wider mb-1">Member Since</p>
                <p className="text-base text-white font-medium">
                  {new Date(user.createdAt).toLocaleDateString("en-US", {
                    year: "numeric",
                    month: "long",
                    day: "numeric",
                  })}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
