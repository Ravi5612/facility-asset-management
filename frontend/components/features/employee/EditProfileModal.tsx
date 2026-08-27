"use client";

import React, { useState, useRef } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Spinner } from "@/components/ui/spinner";
import { Camera, User, Lock, Upload, Eye, EyeOff } from "lucide-react";
import { authService } from "@/services/auth.service";
import { useQueryClient } from "@tanstack/react-query";

const API_URL = "/api/proxy";

interface EditProfileModalProps {
  isOpen: boolean;
  setIsOpen: (val: boolean) => void;
  employeeInfo: any;
}

export function EditProfileModal({ isOpen, setIsOpen, employeeInfo }: EditProfileModalProps) {
  const queryClient = useQueryClient();
  const [tab, setTab] = useState<"general" | "security">("general");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Form states
  const [phone, setPhone] = useState(employeeInfo.phone === "N/A" ? "" : employeeInfo.phone);
  const [address, setAddress] = useState(employeeInfo.address || "");
  const [profileImage, setProfileImage] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(employeeInfo.profilePic);
  
  // Security states
  const [oldPassword, setOldPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [showOldPassword, setShowOldPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setProfileImage(file);
      setPreview(URL.createObjectURL(file));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);
    try {
      const formData = new FormData();
      if (phone) formData.append("phone", phone);
      if (address) formData.append("address", address);
      if (oldPassword) formData.append("oldPassword", oldPassword);
      if (newPassword) formData.append("newPassword", newPassword);
      if (profileImage) formData.append("profileImage", profileImage);

      const token = localStorage.getItem("auth_token") || "";
      const res = await fetch(`${API_URL}/users/profile`, {
        method: "PATCH",
        headers: { Authorization: `Bearer ${token}` },
        body: formData,
      });

      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.message || "Failed to update profile");
      }

      await queryClient.invalidateQueries({ queryKey: ["auth-me"] });
      setIsOpen(false);
      setOldPassword("");
      setNewPassword("");
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogContent className="sm:max-w-[450px] p-0 overflow-hidden">
        <DialogHeader className="px-6 py-4 bg-muted/30 border-b">
          <DialogTitle>Edit Profile</DialogTitle>
        </DialogHeader>
        
        <div className="flex border-b">
          <button 
            type="button"
            className={`flex-1 py-3 text-sm font-medium border-b-2 flex justify-center items-center gap-2 ${tab === "general" ? "border-brand-primary text-brand-primary" : "border-transparent text-muted-foreground hover:text-foreground"}`}
            onClick={() => setTab("general")}
          >
            <User className="h-4 w-4" /> General Info
          </button>
          <button 
            type="button"
            className={`flex-1 py-3 text-sm font-medium border-b-2 flex justify-center items-center gap-2 ${tab === "security" ? "border-brand-primary text-brand-primary" : "border-transparent text-muted-foreground hover:text-foreground"}`}
            onClick={() => setTab("security")}
          >
            <Lock className="h-4 w-4" /> Security
          </button>
        </div>

        <form onSubmit={handleSubmit} className="px-6 py-4 space-y-6">
          {error && <div className="p-3 bg-red-50 text-red-600 text-sm rounded-md border border-red-200">{error}</div>}

          {tab === "general" ? (
            <div className="space-y-4">
              <div className="flex flex-col items-center justify-center mb-6">
                <div className="relative h-24 w-24 rounded-full border flex items-center justify-center overflow-hidden bg-muted group">
                  {preview ? (
                    <img src={preview} alt="Profile" className="h-full w-full object-cover" />
                  ) : (
                    <User className="h-10 w-10 text-muted-foreground" />
                  )}
                  <div 
                    className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 cursor-pointer transition-opacity"
                    onClick={() => fileInputRef.current?.click()}
                  >
                    <Camera className="h-6 w-6 text-white" />
                  </div>
                </div>
                <input type="file" accept="image/*" className="hidden" ref={fileInputRef} onChange={handleImageChange} />
                <p className="text-xs text-muted-foreground mt-2">Click image to change profile photo</p>
              </div>

              <div className="space-y-2">
                <Label>Phone Number</Label>
                <input 
                  type="tel" 
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                />
              </div>
              
              <div className="space-y-2">
                <Label>Current Address / Bio</Label>
                <textarea 
                  className="flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                />
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="space-y-2">
                <Label>New Password</Label>
                <div className="relative">
                  <input 
                    type={showNewPassword ? "text" : "password"} 
                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 pr-10 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    placeholder="Leave blank to keep current password"
                  />
                  <button 
                    type="button"
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                    onClick={() => setShowNewPassword(!showNewPassword)}
                  >
                    {showNewPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
              </div>
            </div>
          )}

          <div className="pt-4 border-t space-y-4 mt-6">
            <div className="space-y-2">
              <Label className="text-brand-danger">Confirm Current Password <span className="text-red-500">*</span></Label>
              <p className="text-xs text-muted-foreground">Please enter your password to save changes.</p>
              <div className="relative">
                <input 
                  type={showOldPassword ? "text" : "password"} 
                  required
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 pr-10 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                  value={oldPassword}
                  onChange={(e) => setOldPassword(e.target.value)}
                  placeholder="Required for any changes"
                />
                <button 
                  type="button"
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                  onClick={() => setShowOldPassword(!showOldPassword)}
                >
                  {showOldPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>

            <div className="flex justify-end gap-3 pt-2">
              <Button type="button" variant="outline" onClick={() => setIsOpen(false)}>Cancel</Button>
              <Button type="submit" disabled={isSubmitting || !oldPassword} className="bg-brand-primary text-white hover:opacity-90">
                {isSubmitting ? <Spinner className="h-4 w-4 mr-2" /> : <Upload className="h-4 w-4 mr-2" />}
                Save Changes
              </Button>
            </div>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}

