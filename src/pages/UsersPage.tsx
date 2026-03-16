import { FormEvent, useEffect, useMemo, useState } from "react";
import { PageHeader } from "../components/PageHeader";
import {
  createUser,
  deleteUser,
  getUserRoles,
  getUsers,
  updateUser,
} from "../api/usersApi";
import type { CreateUserRequest, RoleItem, UserListItem } from "../types/user";
import { useAuth } from "../contexts/AuthContext";

type UserFormState = CreateUserRequest;

const fallbackRoles: RoleItem[] = [
  {
    name: "Superadmin",
    description: "Voller Zugriff",
    permissions: ["Alle Berechtigungen"],
  },
  {
    name: "Admin",
    description: "Verwaltung",
    permissions: ["Kunden, Fahrzeuge, Labels, Teile, Historie, Benutzer lesen"],
  },
  {
    name: "Mitarbeiter",
    description: "Werkstatt",
    permissions: ["Werkstattrelevante Bereiche ohne Benutzerverwaltung"],
  },
  {
    name: "ReadOnly",
    description: "Nur Ansicht",
    permissions: ["Nur lesender Zugriff"],
  },
];

const initialForm: UserFormState = {
  username: "",
  displayName: "",
  email: "",
  password: "",
  isActive: true,
  roles: [],
};

export function UsersPage() {
  const { user, hasPermission } = useAuth();
  const canViewUsers = hasPermission("users.view");
  const canManageUsers = hasPermission("users.manage");

  const [items, setItems] = useState<UserListItem[]>([]);
  const [roles, setRoles] = useState<RoleItem[]>([]);
  const [rolesFallbackActive, setRolesFallbackActive] = useState(false);
  const [loading, setLoading] = useState(true);
  const [loadingError, setLoadingError] = useState("");
  const [query, setQuery] = useState("");

  const [showForm, setShowForm] = useState(false);
  const [editingUserId, setEditingUserId] = useState<string | null>(null);
  const [form, setForm] = useState<UserFormState>(initialForm);
  const [saveError, setSaveError] = useState("");
  const [saveSuccess, setSaveSuccess] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (!canViewUsers) return;
    void loadData();
  }, [canViewUsers]);

  async function loadData() {
    setLoading(true);
    setLoadingError("");

    try {
      const usersData = await getUsers();
      setItems(usersData);
    } catch (error: any) {
      setLoadingError(
        error?.response?.data?.title ||
          error?.response?.data ||
          "Benutzer konnten nicht geladen werden."
      );
    }

    try {
      const rolesData = await getUserRoles();
      if (rolesData.length > 0) {
        setRoles(rolesData);
        setRolesFallbackActive(false);
      } else {
        setRoles(fallbackRoles);
        setRolesFallbackActive(true);
      }
    } catch {
      setRoles(fallbackRoles);
      setRolesFallbackActive(true);
    } finally {
      setLoading(false);
    }
  }

  const filteredItems = useMemo(() => {
    const term = query.trim().toLowerCase();
    if (!term) return items;

    return items.filter((item) => {
      return (
        item.username.toLowerCase().includes(term) ||
        item.displayName.toLowerCase().includes(term) ||
        item.email.toLowerCase().includes(term) ||
        item.roles.some((role) => role.toLowerCase().includes(term))
      );
    });
  }, [items, query]);

  function resetForm() {
    setForm(initialForm);
    setEditingUserId(null);
    setSaveError("");
    setSaveSuccess("");
  }

  function updateForm<K extends keyof UserFormState>(key: K, value: UserFormState[K]) {
    setForm((prev) => ({ ...prev, [key]: value }));
  }

  function toggleRole(roleName: string) {
    setForm((prev) => ({
      ...prev,
      roles: prev.roles.includes(roleName)
        ? prev.roles.filter((role) => role !== roleName)
        : [...prev.roles, roleName],
    }));
  }

  function startCreate() {
    resetForm();
    setShowForm(true);
  }

  function startEdit(item: UserListItem) {
    setForm({
      username: item.username,
      displayName: item.displayName,
      email: item.email,
      password: "",
      isActive: item.isActive,
      roles: [...item.roles],
    });
    setEditingUserId(item.id);
    setSaveError("");
    setSaveSuccess("");
    setShowForm(true);
  }

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();
    setSaveError("");
    setSaveSuccess("");

    if (!form.displayName.trim()) {
      setSaveError("Anzeigename ist erforderlich.");
      return;
    }

    if (!form.email.trim()) {
      setSaveError("E-Mail ist erforderlich.");
      return;
    }

    if (form.roles.length === 0) {
      setSaveError("Mindestens eine Rolle muss ausgewählt werden.");
      return;
    }

    if (!editingUserId) {
      if (!form.username.trim()) {
        setSaveError("Benutzername ist erforderlich.");
        return;
      }

      if (!form.password.trim()) {
        setSaveError("Passwort ist erforderlich.");
        return;
      }
    }

    setIsSubmitting(true);

    try {
      if (editingUserId) {
        await updateUser(editingUserId, {
          displayName: form.displayName.trim(),
          email: form.email.trim(),
          isActive: form.isActive,
          roles: form.roles,
        });
        setSaveSuccess("Benutzer erfolgreich aktualisiert.");
      } else {
        await createUser({
          username: form.username.trim(),
          displayName: form.displayName.trim(),
          email: form.email.trim(),
          password: form.password.trim(),
          isActive: form.isActive,
          roles: form.roles,
        });
        setSaveSuccess("Benutzer erfolgreich angelegt.");
      }

      await loadData();
      resetForm();
      setShowForm(false);
    } catch (error: any) {
      setSaveError(
        error?.response?.data?.title ||
          error?.response?.data ||
          "Benutzer konnte nicht gespeichert werden."
      );
    } finally {
      setIsSubmitting(false);
    }
  }

  async function handleDelete(item: UserListItem) {
    const confirmed = window.confirm(
      `Benutzer ${item.username} wirklich löschen?\n\nDiese Aktion kann nicht rückgängig gemacht werden.`
    );

    if (!confirmed) return;

    setLoadingError("");

    try {
      await deleteUser(item.id);
      await loadData();
    } catch (error: any) {
      setLoadingError(
        error?.response?.data?.title ||
          error?.response?.data ||
          "Benutzer konnte nicht gelöscht werden."
      );
    }
  }

  if (!canViewUsers) {
    return (
      <div className="page-stack">
        <PageHeader
          title="Benutzer"
          subtitle="Für diesen Bereich fehlt die Berechtigung `users.view`."
        />
        <div className="error-box">Du hast keinen Zugriff auf die Benutzerverwaltung.</div>
      </div>
    );
  }

  return (
    <div className="page-stack">
      <div className="page-header">
        <div>
          <h1>Benutzer</h1>
          <p>Verwalte Konten, Rollen und aktive Zugänge für dein Team.</p>
        </div>

        {canManageUsers ? (
          <button type="button" onClick={startCreate}>
            Neuer Benutzer
          </button>
        ) : null}
      </div>

      <div className="card">
        <label className="field">
          <span>Suche</span>
          <input
            type="text"
            placeholder="Suche nach Benutzername, Name, E-Mail oder Rolle..."
            value={query}
            onChange={(event) => setQuery(event.target.value)}
          />
        </label>
      </div>

      {showForm && canManageUsers ? (
        <form className="card page-stack" onSubmit={handleSubmit}>
          <h2>{editingUserId ? "Benutzer bearbeiten" : "Benutzer anlegen"}</h2>

          <div className="form-grid">
            <label className="field">
              <span>Benutzername {editingUserId ? "" : "*"}</span>
              <input
                value={form.username}
                onChange={(event) => updateForm("username", event.target.value)}
                readOnly={Boolean(editingUserId)}
              />
            </label>

            <label className="field">
              <span>Anzeigename *</span>
              <input
                value={form.displayName}
                onChange={(event) => updateForm("displayName", event.target.value)}
              />
            </label>

            <label className="field">
              <span>E-Mail *</span>
              <input
                type="email"
                value={form.email}
                onChange={(event) => updateForm("email", event.target.value)}
              />
            </label>

            {!editingUserId ? (
              <label className="field">
                <span>Passwort *</span>
                <input
                  type="password"
                  value={form.password}
                  onChange={(event) => updateForm("password", event.target.value)}
                />
              </label>
            ) : null}

            <label className="field">
              <span>Status</span>
              <select
                value={form.isActive ? "true" : "false"}
                onChange={(event) => updateForm("isActive", event.target.value === "true")}
              >
                <option value="true">Aktiv</option>
                <option value="false">Inaktiv</option>
              </select>
            </label>
          </div>

          <div className="page-stack">
            <div className="section-title">
              <h3>Rollen</h3>
              <span>{form.roles.length} ausgewählt</span>
            </div>

            {rolesFallbackActive ? (
              <div className="warning-box">
                Rollen konnten nicht live aus der API geladen werden. Es werden die
                hinterlegten Standardrollen angezeigt.
              </div>
            ) : null}

            {roles.length > 0 ? (
              <div className="role-grid">
                {roles.map((role) => (
                  <label key={role.name} className="role-card">
                    <input
                      type="checkbox"
                      checked={form.roles.includes(role.name)}
                      onChange={() => toggleRole(role.name)}
                    />
                    <div>
                      <strong>{role.name}</strong>
                      <p>{role.description}</p>
                      <small>{role.permissions.join(", ")}</small>
                    </div>
                  </label>
                ))}
              </div>
            ) : (
              <div className="error-box">Es konnten keine Rollen geladen werden.</div>
            )}
          </div>

          {saveError ? <div className="error-box">{saveError}</div> : null}
          {saveSuccess ? <div className="success-box">{saveSuccess}</div> : null}

          <div className="actions">
            <button type="submit" disabled={isSubmitting}>
              {isSubmitting
                ? "Speichern..."
                : editingUserId
                  ? "Benutzer speichern"
                  : "Benutzer anlegen"}
            </button>

            <button
              type="button"
              className="secondary"
              onClick={() => {
                resetForm();
                setShowForm(false);
              }}
            >
              Abbrechen
            </button>
          </div>
        </form>
      ) : null}

      <div className="card page-stack">
        <div className="section-title">
          <h2>Benutzerliste</h2>
          <span>{filteredItems.length} Einträge</span>
        </div>

        {loading ? <p>Lade Benutzer...</p> : null}
        {loadingError ? <div className="error-box">{loadingError}</div> : null}

        {!loading && !loadingError ? (
          filteredItems.length > 0 ? (
            <div className="table-wrap">
              <table className="data-table">
                <thead>
                  <tr>
                    <th>Benutzername</th>
                    <th>Name</th>
                    <th>E-Mail</th>
                    <th>Status</th>
                    <th>Rollen</th>
                    {canManageUsers ? <th>Aktion</th> : null}
                  </tr>
                </thead>
                <tbody>
                  {filteredItems.map((item) => (
                    <tr key={item.id}>
                      <td>{item.username}</td>
                      <td>{item.displayName}</td>
                      <td>{item.email}</td>
                      <td>{item.isActive ? "Aktiv" : "Inaktiv"}</td>
                      <td>{item.roles.join(", ") || "-"}</td>
                      {canManageUsers ? (
                        <td>
                          <div className="actions">
                            <button
                              type="button"
                              className="secondary"
                              onClick={() => startEdit(item)}
                            >
                              Bearbeiten
                            </button>

                            <button
                              type="button"
                              className="secondary"
                              disabled={item.id === user?.userId}
                              onClick={() => void handleDelete(item)}
                            >
                              Löschen
                            </button>
                          </div>
                        </td>
                      ) : null}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <p>Keine Benutzer vorhanden.</p>
          )
        ) : null}
      </div>
    </div>
  );
}
