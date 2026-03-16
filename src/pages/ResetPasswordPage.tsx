import { FormEvent, useMemo, useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { resetPassword } from "../api/authApi";

export function ResetPasswordPage() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const token = useMemo(() => searchParams.get("token") ?? "", [searchParams]);

  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();
    setError("");
    setSuccess("");

    if (!token) {
      setError("Der Reset-Link ist unvollständig oder ungültig.");
      return;
    }

    if (!newPassword.trim()) {
      setError("Bitte ein neues Passwort eingeben.");
      return;
    }

    if (newPassword !== confirmPassword) {
      setError("Die neuen Passwörter stimmen nicht überein.");
      return;
    }

    setIsSubmitting(true);

    try {
      await resetPassword(token, newPassword);
      setSuccess("Passwort erfolgreich zurückgesetzt. Du kannst dich jetzt anmelden.");
      setNewPassword("");
      setConfirmPassword("");
      window.setTimeout(() => navigate("/login"), 1200);
    } catch (err: any) {
      setError(
        err?.response?.data?.title ||
          err?.response?.data ||
          "Das Passwort konnte nicht zurückgesetzt werden."
      );
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <div className="auth-page">
      <form className="auth-card auth-card-compact" onSubmit={handleSubmit}>
        <img
          className="brand-logo-image brand-logo-large-image"
          src="/logo.png"
          alt="RS Engineers Logo"
        />
        <span className="eyebrow">Neues Passwort</span>
        <h1>Neues Passwort setzen</h1>
        <p>Lege hier ein neues Passwort für dein Konto fest.</p>

        <label className="field">
          <span>Neues Passwort</span>
          <input
            type="password"
            value={newPassword}
            onChange={(event) => setNewPassword(event.target.value)}
            autoComplete="new-password"
          />
        </label>

        <label className="field">
          <span>Neues Passwort wiederholen</span>
          <input
            type="password"
            value={confirmPassword}
            onChange={(event) => setConfirmPassword(event.target.value)}
            autoComplete="new-password"
          />
        </label>

        {error ? <div className="error-box">{error}</div> : null}
        {success ? <div className="success-box">{success}</div> : null}

        <button type="submit" disabled={isSubmitting}>
          {isSubmitting ? "Speichere..." : "Passwort zuruecksetzen"}
        </button>

        <Link className="auth-link" to="/login">
          Zurück zum Login
        </Link>
      </form>
    </div>
  );
}
