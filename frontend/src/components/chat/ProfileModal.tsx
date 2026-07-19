"use client";

import { useRef, useState } from "react";
import { useRouter } from "next/navigation";
import Modal from "./Modal";
import Avatar from "./Avatar";
import ConfirmDialog from "./ConfirmDialog";
import { CameraIcon, TrashIcon } from "./icons";
import Button from "@/components/ui/Button";
import { useToast } from "@/components/ui/ToastProvider";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { updateProfile, updateAvatar, deleteAccount } from "@/store/authSlice";
import { resetChat } from "@/store/chatSlice";
import { avatarColor } from "@/lib/avatarColor";

function Field({
  label,
  value,
  onChange,
  readOnly,
  hint,
}: {
  label: string;
  value: string;
  onChange?: (v: string) => void;
  readOnly?: boolean;
  hint?: string;
}) {
  return (
    <div className="flex flex-col gap-1.5">
      <label className="text-sm font-medium text-root-primary">{label}</label>
      <input
        value={value}
        onChange={(e) => onChange?.(e.target.value)}
        readOnly={readOnly}
        className={`rounded-lg border px-3.5 py-2 text-base text-root-primary outline-none ${
          readOnly
            ? "cursor-not-allowed border-black/10 bg-black/5 text-root-secondary"
            : "border-root-secondary/30 bg-white focus:border-root-primary focus:ring-1 focus:ring-root-primary"
        }`}
      />
      {hint && <p className="text-xs text-root-secondary">{hint}</p>}
    </div>
  );
}

export default function ProfileModal({ onClose }: { onClose: () => void }) {
  const dispatch = useAppDispatch();
  const router = useRouter();
  const { showError, showSuccess } = useToast();
  const user = useAppSelector((s) => s.auth.user);

  const [name, setName] = useState(user?.name ?? "");
  const [username, setUsername] = useState(user?.username ?? "");
  const [about, setAbout] = useState(user?.about ?? "");
  const [uploading, setUploading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  async function handleDelete() {
    setDeleting(true);
    try {
      await dispatch(deleteAccount()).unwrap();
      dispatch(resetChat());
      router.replace("/signup");
      // Leave `deleting` true — we're navigating away, no need to reset.
    } catch (err) {
      showError((err as Error).message);
      setDeleting(false);
    }
  }

  // Read the picked image as a base64 data URL and upload it to Cloudinary via
  // the backend; the returned URL is stored on the user.
  function handlePhoto(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = async () => {
      setUploading(true);
      try {
        await dispatch(updateAvatar(reader.result as string)).unwrap();
        showSuccess("Photo updated.");
      } catch (err) {
        showError((err as Error).message);
      } finally {
        setUploading(false);
      }
    };
    reader.readAsDataURL(file);
  }

  async function handleSave() {
    setSaving(true);
    try {
      await dispatch(updateProfile({ name, username, about })).unwrap();
      showSuccess("Profile updated.");
      onClose();
    } catch (err) {
      showError((err as Error).message);
    } finally {
      setSaving(false);
    }
  }

  return (
    <Modal
      title="Profile"
      onClose={onClose}
      footer={
        <div className="flex justify-end gap-3">
          <button
            type="button"
            onClick={onClose}
            className="rounded-full border border-root-secondary/40 px-6 py-2.5 text-sm font-semibold text-root-primary hover:bg-black/5"
          >
            Cancel
          </button>
          <Button onClick={handleSave} disabled={saving}>
            {saving ? "Saving..." : "Save"}
          </Button>
        </div>
      }
    >
      {/* Avatar with a single camera button to change the photo. */}
      <div className="flex justify-center">
        <div className="relative">
          <Avatar
            name={name || "U"}
            color={avatarColor(username || "root")}
            src={user?.avatar || undefined}
            size={84}
          />
          {uploading && (
            <div className="absolute inset-0 flex items-center justify-center rounded-full bg-black/40 text-[10px] font-medium text-white">
              Uploading…
            </div>
          )}
          <button
            type="button"
            onClick={() => fileRef.current?.click()}
            disabled={uploading}
            aria-label="Change photo"
            title="Change photo"
            className="absolute bottom-0 right-0 flex h-8 w-8 items-center justify-center rounded-full bg-root-primary text-white shadow-md hover:bg-root-secondary disabled:opacity-60"
          >
            <CameraIcon className="h-4 w-4" />
          </button>
          <input
            ref={fileRef}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={handlePhoto}
          />
        </div>
      </div>

      {/* Editable fields — Name + Username share a row to save height. */}
      <div className="mt-4 flex flex-col gap-3">
        <div className="grid grid-cols-2 gap-3">
          <Field label="Name" value={name} onChange={setName} />
          <Field label="Username" value={username} onChange={setUsername} />
        </div>

        <div className="flex flex-col gap-1.5">
          <label className="text-sm font-medium text-root-primary">About</label>
          <textarea
            value={about}
            onChange={(e) => setAbout(e.target.value)}
            rows={2}
            className="resize-none rounded-lg border border-root-secondary/30 bg-white px-3.5 py-2 text-base text-root-primary outline-none focus:border-root-primary focus:ring-1 focus:ring-root-primary"
          />
        </div>

        <Field label="Email" value={user?.email ?? ""} readOnly hint="Email can't be changed." />
      </div>

      {/* Danger zone. */}
      <div className="mt-3 border-t border-black/5 pt-3">
        <button
          type="button"
          onClick={() => setConfirmDelete(true)}
          className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-left text-red-600 hover:bg-red-50"
        >
          <TrashIcon className="h-5 w-5" />
          <span className="text-base font-medium">Delete my account</span>
        </button>
      </div>

      {confirmDelete && (
        <ConfirmDialog
          title="Delete account"
          message="This permanently deletes your account and all your chats. This can't be undone."
          confirmLabel="Delete account"
          danger
          loading={deleting}
          loadingLabel="Deleting…"
          onClose={() => setConfirmDelete(false)}
          onConfirm={handleDelete}
        />
      )}
    </Modal>
  );
}
