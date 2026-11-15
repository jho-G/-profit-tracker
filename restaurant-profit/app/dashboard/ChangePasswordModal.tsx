"use client";

import { useState, type FormEvent } from "react";

export default function ChangePasswordModal() {
  const [isOpen, setIsOpen] = useState(false);
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPasswords, setShowPasswords] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  function openModal() {
    setError("");
    setSuccess("");
    setCurrentPassword("");
    setNewPassword("");
    setConfirmPassword("");
    setShowPasswords(false);
    setIsOpen(true);
  }

  function closeModal() {
    if (loading) return;
    setIsOpen(false);
    setError("");
    setSuccess("");
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError("");
    setSuccess("");

    if (!currentPassword) {
      setError("Please enter your current password.");
      return;
    }

    if (newPassword.length < 6) {
      setError("New password must be at least 6 characters.");
      return;
    }

    if (newPassword !== confirmPassword) {
      setError("New passwords do not match.");
      return;
    }

    setLoading(true);

    try {
      const res = await fetch("/api/auth/change-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ currentPassword, newPassword, confirmPassword }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || "Failed to update password.");
        setLoading(false);
        return;
      }

      setSuccess("Password updated successfully!");
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
      setTimeout(() => {
        setIsOpen(false);
        setSuccess("");
      }, 1500);
    } catch {
      setError("Failed to reach server. Please check your connection.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <>
      <button
        type="button"
        onClick={openModal}
        className="rounded-xl border border-stone-300 bg-white px-3 py-2 text-xs font-bold text-stone-700 transition hover:bg-stone-50 touch-manipulation active:scale-95"
        title="Change login password"
      >
        Change Password
      </button>

      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-xs">
          <div
            className="w-full max-w-sm rounded-3xl border border-stone-200 bg-white p-6 shadow-2xl"
            role="dialog"
            aria-modal="true"
            aria-labelledby="change-password-title"
          >
            <div className="flex items-center justify-between border-b border-stone-100 pb-3">
              <h3 id="change-password-title" className="text-base font-black text-stone-900">
                Change Admin Password
              </h3>
              <button
                type="button"
                onClick={closeModal}
                disabled={loading}
                className="rounded-lg p-1 text-stone-400 hover:bg-stone-100 hover:text-stone-700 touch-manipulation"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSubmit} className="mt-4 space-y-4">
              {error && (
                <div className="rounded-xl bg-red-50 p-3 text-xs font-bold text-red-700">
                  {error}
                </div>
              )}

              {success && (
                <div className="rounded-xl bg-emerald-50 p-3 text-xs font-bold text-emerald-700">
                  {success}
                </div>
              )}

              <div>
                <label className="block text-xs font-bold text-stone-800">
                  Current Password
                </label>
                <input
                  type={showPasswords ? "text" : "password"}
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                  disabled={loading}
                  required
                  placeholder="Enter current password"
                  style={{ color: "#1c1917", backgroundColor: "#ffffff" }}
                  className="mt-1 w-full rounded-xl border border-stone-300 bg-white px-3.5 py-2.5 text-xs font-bold !text-stone-900 placeholder:text-stone-400 shadow-xs outline-none focus:border-stone-900 focus:ring-1 focus:ring-stone-900"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-stone-800">
                  New Password (min 6 characters)
                </label>
                <input
                  type={showPasswords ? "text" : "password"}
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  disabled={loading}
                  required
                  minLength={6}
                  placeholder="Enter new password"
                  style={{ color: "#1c1917", backgroundColor: "#ffffff" }}
                  className="mt-1 w-full rounded-xl border border-stone-300 bg-white px-3.5 py-2.5 text-xs font-bold !text-stone-900 placeholder:text-stone-400 shadow-xs outline-none focus:border-stone-900 focus:ring-1 focus:ring-stone-900"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-stone-800">
                  Confirm New Password
                </label>
                <input
                  type={showPasswords ? "text" : "password"}
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  disabled={loading}
                  required
                  minLength={6}
                  placeholder="Re-enter new password"
                  style={{ color: "#1c1917", backgroundColor: "#ffffff" }}
                  className="mt-1 w-full rounded-xl border border-stone-300 bg-white px-3.5 py-2.5 text-xs font-bold !text-stone-900 placeholder:text-stone-400 shadow-xs outline-none focus:border-stone-900 focus:ring-1 focus:ring-stone-900"
                />
              </div>

              {/* Toggle Show Password */}
              <div className="flex items-center justify-between pt-1">
                <label className="flex items-center gap-2 cursor-pointer text-xs font-bold text-stone-700">
                  <input
                    type="checkbox"
                    checked={showPasswords}
                    onChange={(e) => setShowPasswords(e.target.checked)}
                    className="h-4 w-4 rounded border-stone-300 text-stone-900 focus:ring-stone-900"
                  />
                  <span>Show password</span>
                </label>
              </div>

              <div className="mt-5 flex gap-2 pt-2">
                <button
                  type="button"
                  onClick={closeModal}
                  disabled={loading}
                  className="flex-1 rounded-xl border border-stone-300 py-2.5 text-xs font-bold text-stone-700 hover:bg-stone-50 touch-manipulation active:scale-95"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="flex-1 rounded-xl bg-stone-900 py-2.5 text-xs font-bold text-white transition hover:bg-stone-800 disabled:opacity-50 touch-manipulation active:scale-95"
                >
                  {loading ? "Updating..." : "Update Password"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
