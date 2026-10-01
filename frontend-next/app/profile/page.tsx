"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { api } from "@/lib/api";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { setUser } from "@/store/authSlice";
import { Spinner } from "@/components/Spinner";
import { ProfileInfoForm } from "./_components/ProfileInfoForm";
import type { ProfileInfoValues } from "./_components/ProfileInfoForm";
import { ChangePasswordForm } from "./_components/ChangePasswordForm";
import { ProfileImageModal } from "./_components/ProfileImageModal";
import type { Profile } from "./_components/types";

export default function ProfilePage() {
  const router = useRouter();
  const dispatch = useAppDispatch();
  const { isAuthenticated } = useAppSelector((state) => state.auth);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [saveStatus, setSaveStatus] = useState<"idle" | "loading" | "rejected" | "success">("idle");
  const [saveError, setSaveError] = useState("");
  const [imageModalOpen, setImageModalOpen] = useState(false);

  useEffect(() => {
    if (!isAuthenticated) {
      router.push("/login");
      return;
    }
    api<Profile>("/users/profile")
      .then(setProfile)
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, [isAuthenticated, router]);

  const handleSaveProfile = async (values: ProfileInfoValues) => {
    setSaveStatus("loading");
    setSaveError("");
    try {
      const data = await api<Profile>("/users/profile", {
        method: "PATCH",
        body: JSON.stringify(values),
      });
      setProfile(data);
      dispatch(setUser(data));
      setSaveStatus("success");
    } catch (err: unknown) {
      setSaveStatus("rejected");
      setSaveError(err instanceof Error ? err.message : "Failed to update profile");
    }
  };

  const handleChangePassword = async (values: { currentPassword: string; newPassword: string }) => {
    setSaveStatus("loading");
    setSaveError("");
    try {
      await api("/users/profile/password", {
        method: "PATCH",
        body: JSON.stringify(values),
      });
      setSaveStatus("success");
    } catch (err: unknown) {
      setSaveStatus("rejected");
      setSaveError(err instanceof Error ? err.message : "Failed to change password");
    }
  };

  const handleDeleteImage = async () => {
    try {
      const data = await api<Profile>("/users/profile/image", { method: "DELETE" });
      setProfile(data);
      dispatch(setUser(data));
    } catch (err: unknown) {
      setSaveError(err instanceof Error ? err.message : "Failed to delete photo");
    }
  };

  if (!isAuthenticated) return null;

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Spinner className="w-8 h-8 text-zinc-400" />
      </div>
    );
  }

  if (error || !profile) {
    return <div className="text-center py-12 text-red-500">{error || "Profile not found"}</div>;
  }

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
        My Profile
      </h1>

      {saveStatus === "rejected" && saveError && (
        <div className="p-3 text-sm text-red-600 bg-red-50 rounded-md">{saveError}</div>
      )}
      {saveStatus === "success" && (
        <div className="p-3 text-sm text-green-600 bg-green-50 rounded-md">Profile updated successfully!</div>
      )}

      <ProfileInfoForm
        key={profile.id}
        profile={profile}
        saving={saveStatus === "loading"}
        onSubmit={handleSaveProfile}
        onChangePhoto={() => setImageModalOpen(true)}
        onDeletePhoto={handleDeleteImage}
      />

      <ChangePasswordForm
        saving={saveStatus === "loading"}
        onSubmit={handleChangePassword}
      />

      {imageModalOpen && (
        <ProfileImageModal
          onClose={() => setImageModalOpen(false)}
          onUploaded={(data) => {
            setProfile(data);
            dispatch(setUser(data));
          }}
        />
      )}
    </div>
  );
}
