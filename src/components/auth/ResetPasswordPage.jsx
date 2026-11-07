import { Link } from "@tanstack/react-router";
import { AlertTriangle, Lock } from "lucide-react";
import { useEffect, useState } from "react";
import { base44 } from "@/api/base44Client";
import { getSupabase } from "@/lib/backend/client";
import { AuthLayout } from "@/components/auth/AuthLayout";
import { AuthError, SubmitButton } from "@/components/auth/parts";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

// The /reset-password page. Supabase's reset email links here and signs the person in for
// this one purpose (the link carries a recovery session); then they choose a new password.
export function ResetPasswordPage() {
  const [token, setToken] = useState(() =>
    /type=recovery|access_token=|code=/.test(window.location.hash + window.location.search) ? "pending" : null,
  );
  useEffect(() => {
    let subscription;
    let gone = false;
    getSupabase()
      .then((supabase) => {
        if (gone) return;
        subscription = supabase.auth.onAuthStateChange((event, session) => {
          if (event === "PASSWORD_RECOVERY" || (session && token === "pending")) setToken("ready");
        }).data.subscription;
        return supabase.auth.getSession().then(({ data: s }) => {
          if (s.session) setToken((t) => t ?? "ready");
        });
      })
      .catch(() => {});
    return () => {
      gone = true;
      subscription?.unsubscribe();
    };
  }, []);
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  async function submit(e) {
    e.preventDefault();
    setError("");
    if (password !== confirm) {
      setError("Passwords do not match");
      return;
    }
    setBusy(true);
    try {
      await base44.auth.resetPassword({ resetToken: token, newPassword: password });
      window.location.href = "/";
    } catch (err) {
      setError(err.message || "Failed to reset password");
      setBusy(false);
    }
  }

  if (!token) {
    return (
      <AuthLayout
        icon={AlertTriangle}
        title="Invalid reset link"
        subtitle="This password reset link is missing or invalid"
        footer={
          <Link to="/forgot-password" className="font-medium text-primary hover:underline">
            Request a new link
          </Link>
        }
      >
        <p className="text-center text-sm text-foreground">The link you used appears to be incomplete. Please request a new password reset email.</p>
      </AuthLayout>
    );
  }
  return (
    <AuthLayout icon={Lock} title="New password" subtitle="Enter your new password below">
      <AuthError>{error}</AuthError>
      <form onSubmit={submit} className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="reset-password">New password</Label>
          <div className="relative">
            <Lock className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" aria-hidden="true" />
            <Input id="reset-password" type="password" autoComplete="new-password" autoFocus placeholder="••••••••" value={password} onChange={(e) => setPassword(e.target.value)} className="h-12 pl-10" required />
          </div>
        </div>
        <div className="space-y-2">
          <Label htmlFor="reset-confirm">Confirm password</Label>
          <div className="relative">
            <Lock className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" aria-hidden="true" />
            <Input id="reset-confirm" type="password" autoComplete="new-password" placeholder="••••••••" value={confirm} onChange={(e) => setConfirm(e.target.value)} className="h-12 pl-10" required />
          </div>
        </div>
        <SubmitButton busy={busy} busyLabel="Resetting...">
          Reset password
        </SubmitButton>
      </form>
    </AuthLayout>
  );
}
