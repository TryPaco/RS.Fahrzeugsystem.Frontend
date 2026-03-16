import { FormEvent, useState } from "react";
import { Link } from "react-router-dom";
import { forgotPassword } from "../api/authApi";

export function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();
    setError("");
    setSuccess("");

    if (!email.trim()) {
      setError("Bitte eine E-Mail-Adresse eingeben.");
      return;
    }

    setIsSubmitting(true);

    try {
      const response = await forgotPassword(email.trim());
      setSuccess(
        response.message ||
          "Wenn ein passender Benutzer existiert, wurde eine E-Mail versendet."
      );
      setEmail("");
    } catch (err: any) {
      setError(
        err?.response?.data?.title ||
          err?.response?.data ||
          "Die Anfrage konnte nicht gesendet werden."
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
        <span className="eyebrow">Passwort-Reset</span>
        <h1>Passwort vergessen</h1>
        <p>Gib deine E-Mail-Adresse ein. Wenn ein Konto dazu existiert, senden wir dir einen Reset-Link.</p>

        <label className="field">
          <span>E-Mail-Adresse</span>
          <input
            type="email"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            autoComplete="email"
          />
        </label>

        {error ? <div className="error-box">{error}</div> : null}
        {success ? <div className="success-box">{success}</div> : null}

        <button type="submit" disabled={isSubmitting}>
          {isSubmitting ? "Sende Link..." : "Reset-Link senden"}
        </button>

        <Link className="auth-link" to="/login">
          Zurück zum Login
        </Link>
      </form>
    </div>
  );
}
