"use client";

import { useState } from "react";
import { api } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Spinner } from "@/components/Spinner";
import { Camera, X } from "lucide-react";
import type { Profile } from "./types";

interface ProfileImageModalProps {
  onClose: () => void;
  onUploaded: (profile: Profile) => void;
}

export function ProfileImageModal({ onClose, onUploaded }: ProfileImageModalProps) {
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [status, setStatus] = useState<"idle" | "loading" | "rejected">("idle");

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setImageFile(file);
      setImagePreview(URL.createObjectURL(file));
      setStatus("idle");
    }
  };

  const handleUpload = async () => {
    if (!imageFile) return;
    setStatus("loading");
    try {
      const formData = new FormData();
      formData.append("image", imageFile);
      const data = await api<Profile>("/users/profile/image", {
        method: "POST",
        body: formData,
      });
      onUploaded(data);
      onClose();
    } catch {
      setStatus("rejected");
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <Card className="w-full max-w-md mx-4 shadow-2xl">
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>Upload Profile Photo</CardTitle>
          <Button variant="ghost" size="sm" onClick={onClose}>
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
          <Input type="file" accept="image/jpeg,image/png,image/webp" onChange={handleFileChange} />
          {status === "rejected" && (
            <p className="text-sm text-red-600">Upload failed. Please try again.</p>
          )}
          <div className="flex gap-2">
            <Button
              className="flex-1 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white border-0"
              onClick={handleUpload}
              disabled={!imageFile || status === "loading"}
            >
              {status === "loading" ? (
                <span className="flex items-center gap-2">
                  <Spinner className="w-4 h-4" />
                  Uploading...
                </span>
              ) : (
                "Upload"
              )}
            </Button>
            <Button variant="outline" onClick={onClose}>Cancel</Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
