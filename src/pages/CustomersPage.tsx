import { FormEvent, useEffect, useMemo, useState } from "react";
import { http } from "../api/http";

type CustomerListItem = {
  id: string;
  customerNumber: string;
  companyName?: string | null;
  firstName: string;
  lastName: string;
  phone?: string | null;
  email?: string | null;
  city?: string | null;
  isArchived: boolean;
};

type CreateCustomerRequest = {
  customerNumber: string;
  companyName?: string;
  firstName: string;
  lastName: string;
  phone?: string;
  email?: string;
  street?: string;
  zipCode?: string;
  city?: string;
  country?: string;
  notes?: string;
};

const initialForm: CreateCustomerRequest = {
  customerNumber: "",
  companyName: "",
  firstName: "",
  lastName: "",
  phone: "",
  email: "",
  street: "",
  zipCode: "",
  city: "",
  country: "Deutschland",
  notes: "",
};

export function CustomersPage() {
  const [items, setItems] = useState<CustomerListItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingError, setLoadingError] = useState("");
  const [query, setQuery] = useState("");

  const [showCreateForm, setShowCreateForm] = useState(false);
  const [form, setForm] = useState<CreateCustomerRequest>(initialForm);
  const [createError, setCreateError] = useState("");
  const [createSuccess, setCreateSuccess] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function loadCustomers() {
    setLoading(true);
    setLoadingError("");

    try {
      const response = await http.get<CustomerListItem[]>("/customers?includeArchived=false");
      setItems(response.data);
    } catch (error: any) {
      setLoadingError(
        error?.response?.data?.title ||
          error?.response?.data ||
          "Kunden konnten nicht geladen werden."
      );
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadCustomers();
  }, []);

  const filteredItems = useMemo(() => {
    const term = query.trim().toLowerCase();
    if (!term) return items;

    return items.filter((x) => {
      const fullName = `${x.firstName} ${x.lastName}`.toLowerCase();
      return (
        x.customerNumber?.toLowerCase().includes(term) ||
        fullName.includes(term) ||
        (x.companyName ?? "").toLowerCase().includes(term) ||
        (x.phone ?? "").toLowerCase().includes(term) ||
        (x.email ?? "").toLowerCase().includes(term) ||
        (x.city ?? "").toLowerCase().includes(term)
      );
    });
  }, [items, query]);

  function updateForm<K extends keyof CreateCustomerRequest>(
    key: K,
    value: CreateCustomerRequest[K]
  ) {
    setForm((prev) => ({ ...prev, [key]: value }));
  }

  function resetForm() {
    setForm(initialForm);
    setCreateError("");
    setCreateSuccess("");
  }

  async function handleCreateCustomer(event: FormEvent) {
    event.preventDefault();
    setCreateError("");
    setCreateSuccess("");

    if (!form.customerNumber.trim()) {
      setCreateError("Kundennummer ist erforderlich.");
      return;
    }

    if (!form.firstName.trim()) {
      setCreateError("Vorname ist erforderlich.");
      return;
    }

    if (!form.lastName.trim()) {
      setCreateError("Nachname ist erforderlich.");
      return;
    }

    setIsSubmitting(true);

    try {
      await http.post("/customers", {
        customerNumber: form.customerNumber.trim(),
        companyName: form.companyName?.trim() || null,
        firstName: form.firstName.trim(),
        lastName: form.lastName.trim(),
        phone: form.phone?.trim() || null,
        email: form.email?.trim() || null,
        street: form.street?.trim() || null,
        zipCode: form.zipCode?.trim() || null,
        city: form.city?.trim() || null,
        country: form.country?.trim() || null,
        notes: form.notes?.trim() || null,
      });

      setCreateSuccess("Kunde erfolgreich angelegt.");
      resetForm();
      setShowCreateForm(false);
      await loadCustomers();
    } catch (error: any) {
      setCreateError(
        error?.response?.data?.title ||
          error?.response?.data ||
          "Kunde konnte nicht angelegt werden."
      );
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <div className="page-stack">
      <div className="page-header">
        <div>
          <h1>Kunden</h1>
          <p>Verwalte Kundendaten für RS-Engineers und BTuning Fahrzeuge.</p>
        </div>

        <button
          type="button"
          onClick={() => {
            setShowCreateForm((prev) => !prev);
            setCreateError("");
            setCreateSuccess("");
          }}
        >
          {showCreateForm ? "Formular schließen" : "Neuer Kunde"}
        </button>
      </div>

      <div className="card">
        <label className="field">
          <span>Suche</span>
          <input
            type="text"
            placeholder="Suche nach Kundennummer, Name, Firma, Telefon, E-Mail, Ort..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
        </label>
      </div>

      {showCreateForm ? (
        <form className="card page-stack" onSubmit={handleCreateCustomer}>
          <h2>Neuen Kunden anlegen</h2>

          <div className="form-grid">
            <label className="field">
              <span>Kundennummer *</span>
              <input
                value={form.customerNumber}
                onChange={(e) => updateForm("customerNumber", e.target.value)}
                placeholder="z. B. K-000001"
              />
            </label>

            <label className="field">
              <span>Firma</span>
              <input
                value={form.companyName ?? ""}
                onChange={(e) => updateForm("companyName", e.target.value)}
                placeholder="RS Engineers GmbH"
              />
            </label>

            <label className="field">
              <span>Vorname *</span>
              <input
                value={form.firstName}
                onChange={(e) => updateForm("firstName", e.target.value)}
              />
            </label>

            <label className="field">
              <span>Nachname *</span>
              <input
                value={form.lastName}
                onChange={(e) => updateForm("lastName", e.target.value)}
              />
            </label>

            <label className="field">
              <span>Telefon</span>
              <input
                value={form.phone ?? ""}
                onChange={(e) => updateForm("phone", e.target.value)}
              />
            </label>

            <label className="field">
              <span>E-Mail</span>
              <input
                type="email"
                value={form.email ?? ""}
                onChange={(e) => updateForm("email", e.target.value)}
              />
            </label>

            <label className="field">
              <span>Straße</span>
              <input
                value={form.street ?? ""}
                onChange={(e) => updateForm("street", e.target.value)}
              />
            </label>

            <label className="field">
              <span>PLZ</span>
              <input
                value={form.zipCode ?? ""}
                onChange={(e) => updateForm("zipCode", e.target.value)}
              />
            </label>

            <label className="field">
              <span>Ort</span>
              <input
                value={form.city ?? ""}
                onChange={(e) => updateForm("city", e.target.value)}
              />
            </label>

            <label className="field">
              <span>Land</span>
              <input
                value={form.country ?? ""}
                onChange={(e) => updateForm("country", e.target.value)}
              />
            </label>
          </div>

          <label className="field">
            <span>Notizen</span>
            <textarea
              rows={4}
              value={form.notes ?? ""}
              onChange={(e) => updateForm("notes", e.target.value)}
            />
          </label>

          {createError ? <div className="error-box">{createError}</div> : null}
          {createSuccess ? <div className="success-box">{createSuccess}</div> : null}

          <div className="actions">
            <button type="submit" disabled={isSubmitting}>
              {isSubmitting ? "Speichern..." : "Kunde speichern"}
            </button>

            <button
              type="button"
              className="secondary"
              onClick={() => {
                resetForm();
                setShowCreateForm(false);
              }}
            >
              Abbrechen
            </button>
          </div>
        </form>
      ) : null}

      <div className="card page-stack">
        <div className="section-title">
          <h2>Kundenliste</h2>
          <span>{filteredItems.length} Einträge</span>
        </div>

        {loading ? <p>Lade Kunden...</p> : null}
        {loadingError ? <div className="error-box">{loadingError}</div> : null}

        {!loading && !loadingError ? (
          filteredItems.length > 0 ? (
            <div className="table-wrap">
              <table className="data-table">
                <thead>
                  <tr>
                    <th>Kundennummer</th>
                    <th>Name</th>
                    <th>Firma</th>
                    <th>Telefon</th>
                    <th>E-Mail</th>
                    <th>Ort</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredItems.map((item) => (
                    <tr key={item.id}>
                      <td>{item.customerNumber}</td>
                      <td>
                        {item.firstName} {item.lastName}
                      </td>
                      <td>{item.companyName || "-"}</td>
                      <td>{item.phone || "-"}</td>
                      <td>{item.email || "-"}</td>
                      <td>{item.city || "-"}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <p>Keine Kunden vorhanden.</p>
          )
        ) : null}
      </div>
    </div>
  );
}