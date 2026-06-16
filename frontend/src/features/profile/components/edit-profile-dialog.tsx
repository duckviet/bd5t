"use client"

import { useRef, useState } from "react";
import { toast } from "react-toastify";
import { Button } from "@/components/ui/button"
import {
  ResponsiveDialog,
  ResponsiveDialogContent,
  ResponsiveDialogHeader,
  ResponsiveDialogTitle,
  ResponsiveDialogFooter,
} from "@/components/ui/responsive-dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Camera, Loader2 } from "lucide-react";
import {
  updateProfile,
  uploadMedia,
  type UserProfile,
} from "@/services/generated/api";

interface EditProfileDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  user: UserProfile
  onSave: (data: UserProfile) => void
}

type FormData = {
  fullName: string;
  className: string;
};

const initialForm = (user: UserProfile): FormData => ({
  fullName: user.fullName || user.displayName || "",
  className: user.className || "",
});

function getErrorMessage(error: unknown): string {
  if (typeof error === "object" && error !== null && "response" in error) {
    const response = error as {
      response?: { data?: { error?: { message?: string } } };
    };

    return response.response?.data?.error?.message || "Cập nhật hồ sơ thất bại";
  }

  if (error instanceof Error) {
    return error.message;
  }

  return "Cập nhật hồ sơ thất bại";
}

function EditProfileDialogContent({
  user,
  onSave,
  onOpenChange,
}: Pick<EditProfileDialogProps, "user" | "onSave" | "onOpenChange">) {
  const [form, setForm] = useState<FormData>(initialForm(user));
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const set = (field: keyof FormData) => (value: string) =>
    setForm((prev) => ({ ...prev, [field]: value }));

  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setAvatarFile(file);
      const reader = new FileReader();
      reader.onload = (ev) => setAvatarPreview(ev.target?.result as string);
      reader.readAsDataURL(file);
    }
  };

  const handleSave = async () => {
    setIsSaving(true);

    try {
      let avatarUrl: string | undefined;

      if (avatarFile) {
        const uploadResponse = await uploadMedia({
          file: avatarFile,
          type: "avatar",
        });

        avatarUrl = uploadResponse?.data?.url;
        if (!avatarUrl) {
          throw new Error("Không nhận được URL avatar sau khi tải lên");
        }
      }

      const response = await updateProfile({
        fullName: form.fullName.trim() || undefined,
        className: form.className.trim() || undefined,
        avatarUrl,
      });

      const savedUser = response?.data ?? null;
      if (!savedUser) {
        throw new Error("Không nhận được dữ liệu hồ sơ sau khi cập nhật");
      }

      onSave(savedUser as UserProfile);
      toast.success("Cập nhật hồ sơ thành công");
      onOpenChange(false);
    } catch (error) {
      toast.error(getErrorMessage(error));
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <ResponsiveDialogContent className="sm:max-w-lg">
      <ResponsiveDialogHeader>
        <ResponsiveDialogTitle>Chỉnh sửa thông tin cá nhân</ResponsiveDialogTitle>
      </ResponsiveDialogHeader>

      <div className="flex justify-center mb-4">
        <div className="relative">
          <div className="h-24 w-24 rounded-full bg-primary/10 flex items-center justify-center overflow-hidden">
            {avatarPreview ? (
              <img
                src={avatarPreview}
                alt="Avatar"
                className="h-full w-full object-cover"
              />
            ) : user.avatarUrl ? (
              <img
                src={user.avatarUrl}
                alt="Avatar hiện tại"
                className="h-full w-full object-cover"
              />
            ) : (
              <Camera className="h-8 w-8 text-primary" />
            )}
          </div>
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            className="absolute -bottom-1 -right-1 h-8 w-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center shadow-md hover:bg-primary/90 transition-colors"
          >
            <Camera className="h-4 w-4" />
          </button>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={handleAvatarChange}
          />
        </div>
      </div>

      <div className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="edit-fullName">Họ và tên</Label>
          <Input
            id="edit-fullName"
            value={form.fullName}
            onChange={(e) => set("fullName")(e.target.value)}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="edit-className">Lớp</Label>
          <Input
            id="edit-className"
            value={form.className}
            onChange={(e) => set("className")(e.target.value)}
          />
        </div>

        <p className="text-xs text-muted-foreground">
          Email, mã số sinh viên và đơn vị được quản lý từ hồ sơ hệ thống, không
          chỉnh sửa tại đây.
        </p>
      </div>

      <ResponsiveDialogFooter className="pt-2">
        <Button
          variant="outline"
          onClick={() => {
            onOpenChange(false);
          }}
          disabled={isSaving}
        >
          Hủy
        </Button>
        <Button onClick={handleSave} disabled={isSaving}>
          {isSaving ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Đang lưu...
            </>
          ) : (
            "Lưu thay đổi"
          )}
        </Button>
      </ResponsiveDialogFooter>
    </ResponsiveDialogContent>
  );
}

export function EditProfileDialog({
  open,
  onOpenChange,
  user,
  onSave,
}: EditProfileDialogProps) {
  return (
    <ResponsiveDialog open={open} onOpenChange={onOpenChange}>
      {open ? (
        <EditProfileDialogContent
          key={user.id ?? "profile-edit"}
          user={user}
          onSave={onSave}
          onOpenChange={onOpenChange}
        />
      ) : null}
    </ResponsiveDialog>
  );
}
