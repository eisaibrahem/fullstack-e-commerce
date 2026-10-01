"use client";

import { useState } from "react";
import { api } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Spinner } from "@/components/Spinner";
import { ImageIcon, X } from "lucide-react";

interface ImageUploadModalProps {
  product: { id: number; name: string };
  onClose: () => void;
  onUploaded: () => void;
}

export function ImageUploadModal({ product, onClose, onUploaded }: ImageUploadModalProps) {
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [status, setStatus] = useState<"idle" | "loading" | "rejected">("idle");
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setImageFile(file);
      setImagePreview(URL.createObjectURL(file));
      setStatus("idle");
      setErrorMessage(null);
    }
  };

  const handleUpload = async () => {
    if (!imageFile) return;
    setStatus("loading");
    setErrorMessage(null);
    try {
      const formData = new FormData();
      formData.append("image", imageFile);
      await api(`/products/${product.id}/image`, {
        method: "POST",
        body: formData,
      });
      onUploaded();
      onClose();
    } catch (err) {
      setStatus("rejected");
      setErrorMessage(err instanceof Error ? err.message : "Upload failed. Please try again.");
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <Card className="w-full max-w-md mx-4 shadow-2xl">
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>Upload Image — {product.name}</CardTitle>
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
                <ImageIcon className="w-12 h-12" />
              </div>
            )}
          </div>
          <Input type="file" accept="image/jpeg,image/png,image/webp" onChange={handleFileChange} />
          {status === "rejected" && errorMessage && (
            <p className="text-sm text-red-600">{errorMessage}</p>
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
