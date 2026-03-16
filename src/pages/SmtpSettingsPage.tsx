import { FormEvent, useEffect, useState } from "react";
import { PageHeader } from "../components/PageHeader";
import { getSmtpSettings, updateSmtpSettings } from "../api/settingsApi";
import { useAuth } from "../contexts/AuthContext";

type FormState = {
  host: string;
  port: string;
  username: string;
  password: string;
  fromEmail: string;
  fromName: string;
  enableSsl: boolean;
  hasPassword: boolean;
};

const initialForm: FormState = {
  host: "",
  port: "587",
  username: "",
  password: "",
  fromEmail: "",
  fromName: "RS Fahrzeugsystem",
  enableSsl: true,
  hasPassword: false,
};

export function SmtpSettingsPage() {
  const { user } = useAuth();
  const canManageSettings = user?.roles.includes("Superadmin") ?? false;

  const [form, setForm] = useState<FormState>(initialForm);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState("");
  const [saveError, setSaveError] = useState("");
  const [success, setSuccess] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (!canManageSettings) {
      setLoading(false);
      return;
    }

    void loadSettings();
  }, [canManageSettings]);

  async function loadSettings() {
    setLoading(true);
    setLoadError("");

    try {
      const settings = await getSmtpSettings();
      setForm({
        host: settings.host,
        port: String(settings.port),
        username: settings.username,
        password: "",
        fromEmail: settings.fromEmail,
        fromName: settings.fromName,
        enableSsl: settings.enableSsl,
        hasPassword: settings.hasPassword,
      });
    } catch (error: any) {
      setLoadError(
        error?.response?.data?.title ||
          error?.response?.data ||
          "SMTP-Einstellungen konnten nicht geladen werden."
      );
    } finally {
      setLoading(false);
    }
  }

  function updateForm<K extends keyof FormState>(key: K, value: FormState[K]) {
    setForm((prev) => ({ ...prev, [key]: value }));
  }

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();
    setSaveError("");
    setSuccess("");

    if (!form.host.trim()) {
      setSaveError("Bitte einen SMTP-Host eingeben.");
      return;
    }

    const port = Number(form.port);
    if (!Number.isInteger(port) || port <= 0) {
      setSaveError("Bitte einen gueltigen SMTP-Port eingeben.");
      return;
    }

    if (!form.fromEmail.trim()) {
      setSaveError("Bitte eine Absender-E-Mail eingeben.");
      return;
    }

    setIsSubmitting(true);

    try {
      await updateSmtpSettings({
        host: form.host.trim(),
        port,
        username: form.username.trim(),
        password: form.password.trim() || undefined,
        fromEmail: form.fromEmail.trim(),
        fromName: form.fromName.trim(),
        enableSsl: form.enableSsl,
      });

      setSuccess("SMTP-Einstellungen wurden gespeichert.");
      await loadSettings();
    } catch (error: any) {
      setSaveError(
        error?.response?.data?.title ||
          error?.response?.data ||
          "SMTP-Einstellungen konnten nicht gespeichert werden."
      );
    } finally {
      setIsSubmitting(false);
    }
  }

  if (!canManageSettings) {
    return (
      <div className="page-stack">
        <PageHeader
          title="E-Mail-Einstellungen"
          subtitle="Dieser Bereich ist nur fuer Superadmin sichtbar."
        />
        <div className="error-box">Du hast keinen Zugriff auf die SMTP-Verwaltung.</div>
      </div>
    );
  }

  return (
    <div className="page-stack">
      <PageHeader
        title="E-Mail-Einstellungen"
        subtitle="Lege hier den SMTP-Server fuer Passwort-Reset und Systemmails fest."
      />

      <form className="card page-stack settings-card" onSubmit={handleSubmit}>
        <div className="form-grid-2">
          <label className="field">
            <span>SMTP-Host *</span>
            <input
              value={form.host}
              onChange={(event) => updateForm("host", event.target.value)}
              placeholder="smtp.example.com"
            />
          </label>

          <label className="field">
            <span>Port *</span>
            <input
              type="number"
              min="1"
              value={form.port}
              onChange={(event) => updateForm("port", event.target.value)}
            />
          </label>

          <label className="field">
            <span>Benutzername</span>
            <input
              value={form.username}
              onChange={(event) => updateForm("username", event.target.value)}
              placeholder="optional"
            />
          </label>

          <label className="field">
            <span>Passwort</span>
            <input
              type="password"
              value={form.password}
              onChange={(event) => updateForm("password", event.target.value)}
              placeholder={form.hasPassword ? "Unveraendert lassen, um es zu behalten" : ""}
              autoComplete="new-password"
            />
          </label>

          <label className="field">
            <span>Absender-E-Mail *</span>
            <input
              type="email"
              value={form.fromEmail}
              onChange={(event) => updateForm("fromEmail", event.target.value)}
              placeholder="noreply@deine-domain.de"
            />
          </label>

          <label className="field">
            <span>Absendername</span>
            <input
              value={form.fromName}
              onChange={(event) => updateForm("fromName", event.target.value)}
            />
          </label>
        </div>

        <label className="checkbox-field">
          <input
            type="checkbox"
            checked={form.enableSsl}
            onChange={(event) => updateForm("enableSsl", event.target.checked)}
          />
          <span>SSL/TLS fuer den Versand aktivieren</span>
        </label>

        {form.hasPassword ? (
          <div className="warning-box">
            Es ist bereits ein SMTP-Passwort gespeichert. Wenn du das Feld leer laesst,
            bleibt es unveraendert erhalten.
          </div>
        ) : null}

        {loading ? <p>Lade Einstellungen...</p> : null}
        {!loading && loadError ? <div className="error-box">{loadError}</div> : null}
        {saveError ? <div className="error-box">{saveError}</div> : null}
        {success ? <div className="success-box">{success}</div> : null}

        <div className="actions">
          <button type="submit" disabled={loading || isSubmitting}>
            {isSubmitting ? "Speichern..." : "Einstellungen speichern"}
          </button>
        </div>
      </form>
    </div>
  );
}
