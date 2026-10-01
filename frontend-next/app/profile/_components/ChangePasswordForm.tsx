"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Spinner } from "@/components/Spinner";

interface ChangePasswordFormProps {
  saving: boolean;
  onSubmit: (values: { currentPassword: string; newPassword: string }) => void;
}

export function ChangePasswordForm({ saving, onSubmit }: ChangePasswordFormProps) {
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit({ currentPassword, newPassword });
    setCurrentPassword("");
    setNewPassword("");
  };

  return (
    <Card className="shadow-lg border-0">
      <CardHeader>
        <CardTitle>Change Password</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="currentPassword">Current Password</Label>
            <Input id="currentPassword" type="password" value={currentPassword} onChange={(e) => setCurrentPassword(e.target.value)} required />
          </div>
          <div className="space-y-2">
            <Label htmlFor="newPassword">New Password</Label>
            <Input id="newPassword" type="password" value={newPassword} onChange={(e) => setNewPassword(e.target.value)} minLength={8} required />
            <p className="text-xs text-zinc-500">Minimum 8 characters</p>
          </div>
          <Button type="submit" variant="outline" disabled={saving}>
            {saving ? (
              <span className="flex items-center gap-2">
                <Spinner className="w-4 h-4" />
                Changing...
              </span>
            ) : (
              "Change Password"
            )}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
