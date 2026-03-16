import { FormEvent, useState } from "react";
import { PageHeader } from "../components/PageHeader";
import { changePassword } from "../api/authApi";

export function ChangePasswordPage() {
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();
    setError("");
    setSuccess("");

    if (!currentPassword.trim()) {
      setError("Bitte aktuelles Passwort eingeben.");
      return;
    }

    if (!newPassword.trim()) {
      setError("Bitte neues Passwort eingeben.");
      return;
    }

    if (newPassword !== confirmPassword) {
      setError("Die neuen Passwörter stimmen nicht überein.");
      return;
    }

    setIsSubmitting(true);

    try {
      await changePassword(currentPassword, newPassword);
      setSuccess("Passwort erfolgreich geändert.");
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
    } catch (err: any) {
      setError(
        err?.response?.data?.title ||
          err?.response?.data ||
          "Passwort konnte nicht geändert werden."
      );
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <div className="page-stack">
      <PageHeader
        title="Passwort ändern"
        subtitle="Ändere dein aktuelles Passwort für dein Benutzerkonto."
      />

      <form className="card page-stack password-card" onSubmit={handleSubmit}>
        <label className="field">
          <span>Aktuelles Passwort</span>
          <input
            type="password"
            value={currentPassword}
            onChange={(e) => setCurrentPassword(e.target.value)}
            autoComplete="current-password"
          />
        </label>

        <label className="field">
          <span>Neues Passwort</span>
          <input
            type="password"
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
            autoComplete="new-password"
          />
        </label>

        <label className="field">
          <span>Neues Passwort wiederholen</span>
          <input
            type="password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            autoComplete="new-password"
          />
        </label>

        {error ? <div className="error-box">{error}</div> : null}
        {success ? <div className="success-box">{success}</div> : null}

        <div className="actions">
          <button type="submit" disabled={isSubmitting}>
              {isSubmitting ? "Speichern..." : "Passwort ändern"}
          </button>
        </div>
      </form>
    </div>
  );
}
