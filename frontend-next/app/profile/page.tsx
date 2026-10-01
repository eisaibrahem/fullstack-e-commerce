"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { api } from "@/lib/api";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { setUser } from "@/store/authSlice";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Spinner } from "@/components/Spinner";
import { User, Camera, Trash2, X } from "lucide-react";

interface Profile {
  id: number;
  email: string;
  name?: string;
  phone?: string;
  image?: string;
  address?: string;
  role: string;
  createdAt: string;
}

export default function ProfilePage() {
  const router = useRouter();
  const dispatch = useAppDispatch();
  const { isAuthenticated } = useAppSelector((state) => state.auth);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [address, setAddress] = useState("");
  const [email, setEmail] = useState("");
  const [imageUrl, setImageUrl] = useState("");
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [saveStatus, setSaveStatus] = useState<"idle" | "loading" | "rejected" | "success">("idle");
  const [saveError, setSaveError] = useState("");
  const [imageModal, setImageModal] = useState(false);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [imageUploadStatus, setImageUploadStatus] = useState<"idle" | "loading" | "rejected">("idle");

  useEffect(() => {
    if (!isAuthenticated) {
      router.push("/login");
      return;
    }
    api<Profile>("/users/profile")
      .then((data) => {
        setProfile(data);
        setName(data.name || "");
        setPhone(data.phone || "");
        setAddress(data.address || "");
        setEmail(data.email || "");
        setImageUrl(data.image || "");
      })
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, [isAuthenticated, router]);

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaveStatus("loading");
    setSaveError("");
    try {
      const data = await api<Profile>("/users/profile", {
        method: "PATCH",
        body: JSON.stringify({ name, phone, address, email, image: imageUrl || undefined }),
      });
      setProfile(data);
      dispatch(setUser(data));
      setSaveStatus("success");
    } catch (err: unknown) {
      setSaveStatus("rejected");
      setSaveError(err instanceof Error ? err.message : "Failed to update profile");
    }
  };

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaveStatus("loading");
    setSaveError("");
    try {
      await api("/users/profile/password", {
        method: "PATCH",
        body: JSON.stringify({ currentPassword, newPassword }),
      });
      setCurrentPassword("");
      setNewPassword("");
      setSaveStatus("success");
    } catch (err: unknown) {
      setSaveStatus("rejected");
      setSaveError(err instanceof Error ? err.message : "Failed to change password");
    }
  };

  const handleImageFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setImageFile(file);
      setImagePreview(URL.createObjectURL(file));
    }
  };

  const handleUploadImage = async () => {
    if (!imageFile) return;
    setImageUploadStatus("loading");
    try {
      const formData = new FormData();
      formData.append("image", imageFile);
      const data = await api<Profile>("/users/profile/image", {
        method: "POST",
        body: formData,
      });
      setProfile(data);
      dispatch(setUser(data));
      setImageModal(false);
      setImageFile(null);
      setImagePreview(null);
    } catch (err: unknown) {
      setImageUploadStatus("rejected");
    }
  };

  const handleDeleteImage = async () => {
    try {
      const data = await api<Profile>("/users/profile/image", { method: "DELETE" });
      setProfile(data);
      dispatch(setUser(data));
    } catch (err: unknown) {
      // handle error
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

  if (error) {
    return <div className="text-center py-12 text-red-500">{error}</div>;
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

      <Card className="shadow-lg border-0">
        <CardHeader>
          <CardTitle>Profile Information</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="flex items-center gap-4">
            <div className="relative">
              {profile?.image ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={profile.image} alt="Profile" className="w-20 h-20 rounded-full object-cover" />
              ) : (
                <div className="w-20 h-20 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center">
                  <User className="w-10 h-10 text-white" />
                </div>
              )}
            </div>
            <div className="flex gap-2">
              <Button variant="outline" size="sm" onClick={() => setImageModal(true)}>
                <Camera className="w-4 h-4 mr-1" />
                Change Photo
              </Button>
              {profile?.image && (
                <Button variant="destructive" size="sm" onClick={handleDeleteImage}>
                  <Trash2 className="w-4 h-4" />
                </Button>
              )}
            </div>
          </div>

          <form onSubmit={handleSaveProfile} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name">Name</Label>
              <Input id="name" value={name} onChange={(e) => setName(e.target.value)} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input id="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="phone">Phone</Label>
              <Input id="phone" value={phone} onChange={(e) => setPhone(e.target.value)} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="address">Address</Label>
              <Input id="address" value={address} onChange={(e) => setAddress(e.target.value)} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="image">Image URL</Label>
              <Input id="image" value={imageUrl} onChange={(e) => setImageUrl(e.target.value)} placeholder="https://example.com/image.jpg" />
            </div>
            <Button type="submit" disabled={saveStatus === "loading"} className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white border-0">
              {saveStatus === "loading" ? (
                <span className="flex items-center gap-2">
                  <Spinner className="w-4 h-4" />
                  Saving...
                </span>
              ) : (
                "Save Changes"
              )}
            </Button>
          </form>
        </CardContent>
      </Card>

      <Card className="shadow-lg border-0">
        <CardHeader>
          <CardTitle>Change Password</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleChangePassword} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="currentPassword">Current Password</Label>
              <Input id="currentPassword" type="password" value={currentPassword} onChange={(e) => setCurrentPassword(e.target.value)} required />
            </div>
            <div className="space-y-2">
              <Label htmlFor="newPassword">New Password</Label>
              <Input id="newPassword" type="password" value={newPassword} onChange={(e) => setNewPassword(e.target.value)} minLength={8} required />
              <p className="text-xs text-zinc-500">Minimum 8 characters</p>
            </div>
            <Button type="submit" variant="outline" disabled={saveStatus === "loading"}>
              Change Password
            </Button>
          </form>
        </CardContent>
      </Card>

      {imageModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <Card className="w-full max-w-md mx-4 shadow-2xl">
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle>Upload Profile Photo</CardTitle>
              <Button variant="ghost" size="sm" onClick={() => setImageModal(false)}>
                <X className="w-4 h-4" />
              </Button>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="border-2 border-dashed rounded-lg p-4 text-center">
                {imagePreview ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={imagePreview} alt="Preview" className="w-full h-48 object-cover rounded-lg" />
                ) : (
                  <div className="h-48 flex items-center justify-center text-zinc-400">
                    <Camera className="w-12 h-12" />
                  </div>
                )}
              </div>
              <Input type="file" accept="image/jpeg,image/png,image/webp" onChange={handleImageFileChange} />
              {imageUploadStatus === "rejected" && (
                <p className="text-sm text-red-600">Upload failed. Please try again.</p>
              )}
              <div className="flex gap-2">
                <Button
                  className="flex-1 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white border-0"
                  onClick={handleUploadImage}
                  disabled={!imageFile || imageUploadStatus === "loading"}
                >
                  {imageUploadStatus === "loading" ? (
                    <span className="flex items-center gap-2">
                      <Spinner className="w-4 h-4" />
                      Uploading...
                    </span>
                  ) : (
                    "Upload"
                  )}
                </Button>
                <Button variant="outline" onClick={() => setImageModal(false)}>Cancel</Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}
