import { FormEvent, useEffect, useMemo, useState } from "react";
import { PageHeader } from "../components/PageHeader";
import { useAuth } from "../contexts/AuthContext";
import {
  createVehicleCatalogEntry,
  deleteVehicleCatalogEntry,
  getVehicleCatalog,
  updateVehicleCatalogEntry,
} from "../api/vehicleCatalogApi";
import type { VehicleCatalogEntry, VehicleCatalogUpsertRequest } from "../types/vehicleCatalog";

const initialForm: VehicleCatalogUpsertRequest = {
  brand: "",
  model: "",
  variant: "",
  yearLabel: "",
  buildYearFrom: "",
  buildYearTo: "",
  engine: "",
  engineCode: "",
  transmission: "",
  transmissionCode: "",
  ecuType: "",
  ecuManufacturer: "",
  driveType: "",
  platform: "",
  notes: "",
  isActive: true,
};

function mapEntryToForm(entry: VehicleCatalogEntry): VehicleCatalogUpsertRequest {
  return {
    brand: entry.brand ?? "",
    model: entry.model ?? "",
    variant: entry.variant ?? "",
    yearLabel: entry.yearLabel ?? "",
    buildYearFrom: entry.buildYearFrom ? String(entry.buildYearFrom) : "",
    buildYearTo: entry.buildYearTo ? String(entry.buildYearTo) : "",
    engine: entry.engine ?? "",
    engineCode: entry.engineCode ?? "",
    transmission: entry.transmission ?? "",
    transmissionCode: entry.transmissionCode ?? "",
    ecuType: entry.ecuType ?? "",
    ecuManufacturer: entry.ecuManufacturer ?? "",
    driveType: entry.driveType ?? "",
    platform: entry.platform ?? "",
    notes: entry.notes ?? "",
    isActive: entry.isActive,
  };
}

export function VehicleCatalogPage() {
  const { hasPermission } = useAuth();
  const canManage = hasPermission("vehiclecatalog.manage");

  const [items, setItems] = useState<VehicleCatalogEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState("");
  const [query, setQuery] = useState("");
  const [showInactive, setShowInactive] = useState(false);

  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState<VehicleCatalogUpsertRequest>(initialForm);
  const [saveError, setSaveError] = useState("");
  const [success, setSuccess] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function loadCatalog() {
    setLoading(true);
    setLoadError("");

    try {
      const data = await getVehicleCatalog(showInactive);
      setItems(data);
    } catch (error: any) {
      setLoadError(
        error?.response?.data?.title ||
          error?.response?.data ||
          "Fahrzeugkatalog konnte nicht geladen werden."
      );
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    if (canManage) {
      void loadCatalog();
    } else {
      setLoading(false);
    }
  }, [showInactive, canManage]);

  const filteredItems = useMemo(() => {
    const term = query.trim().toLowerCase();
    if (!term) return items;

    return items.filter((item) =>
      [
        item.brand,
        item.model,
        item.variant,
        item.yearLabel,
        item.engine,
        item.engineCode,
        item.transmission,
        item.transmissionCode,
        item.ecuType,
        item.ecuManufacturer,
        item.driveType,
        item.platform,
        item.notes,
      ]
        .filter(Boolean)
        .some((value) => value!.toLowerCase().includes(term))
    );
  }, [items, query]);

  function updateForm<K extends keyof VehicleCatalogUpsertRequest>(
    key: K,
    value: VehicleCatalogUpsertRequest[K]
  ) {
    setForm((prev) => ({ ...prev, [key]: value }));
  }

  function resetForm() {
    setEditingId(null);
    setForm(initialForm);
    setSaveError("");
    setSuccess("");
  }

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();
    setSaveError("");
    setSuccess("");

    if (!form.brand.trim()) {
      setSaveError("Marke ist erforderlich.");
      return;
    }

    if (!form.model.trim()) {
      setSaveError("Modell ist erforderlich.");
      return;
    }

    if (
      form.buildYearFrom.trim() &&
      form.buildYearTo.trim() &&
      Number(form.buildYearFrom) > Number(form.buildYearTo)
    ) {
      setSaveError("Baujahr von darf nicht größer als Baujahr bis sein.");
      return;
    }

    setIsSubmitting(true);

    try {
      if (editingId) {
        await updateVehicleCatalogEntry(editingId, form);
        setSuccess("Fahrzeugvariante wurde aktualisiert.");
      } else {
        await createVehicleCatalogEntry(form);
        setSuccess("Fahrzeugvariante wurde angelegt.");
      }

      resetForm();
      await loadCatalog();
    } catch (error: any) {
      setSaveError(
        error?.response?.data?.title ||
          error?.response?.data ||
          "Fahrzeugvariante konnte nicht gespeichert werden."
      );
    } finally {
      setIsSubmitting(false);
    }
  }

  async function handleDelete(id: string) {
    const confirmed = window.confirm("Diesen Katalogeintrag wirklich löschen?");
    if (!confirmed) return;

    try {
      await deleteVehicleCatalogEntry(id);
      if (editingId === id) {
        resetForm();
      }
      await loadCatalog();
    } catch (error: any) {
      setLoadError(
        error?.response?.data?.title ||
          error?.response?.data ||
          "Katalogeintrag konnte nicht gelöscht werden."
      );
    }
  }

  if (!canManage) {
    return (
      <div className="page-stack">
        <PageHeader
          title="Fahrzeugkatalog"
          subtitle="Dieser Bereich ist nur für Benutzer mit Katalogverwaltung sichtbar."
        />
        <div className="error-box">Du hast keinen Zugriff auf die Fahrzeugkatalog-Verwaltung.</div>
      </div>
    );
  }

  return (
    <div className="page-stack">
      <PageHeader
        title="Fahrzeugkatalog"
        subtitle="Pflege hier Marken, Modelle, Motoren und technische Zusatzdaten für die Fahrzeugauswahl."
      />

      <form className="card page-stack" onSubmit={handleSubmit}>
        <div className="section-title">
          <h2>{editingId ? "Variante bearbeiten" : "Variante anlegen"}</h2>
          <span>{editingId ? "Bearbeitung" : "Neu"}</span>
        </div>

        <div className="form-grid">
          <label className="field">
            <span>Marke *</span>
            <input value={form.brand} onChange={(event) => updateForm("brand", event.target.value)} />
          </label>

          <label className="field">
            <span>Modell *</span>
            <input value={form.model} onChange={(event) => updateForm("model", event.target.value)} />
          </label>

          <label className="field">
            <span>Variante</span>
            <input
              value={form.variant}
              onChange={(event) => updateForm("variant", event.target.value)}
              placeholder="z. B. Type 3H / Facelift"
            />
          </label>

          <label className="field">
            <span>Jahreslabel</span>
            <input
              value={form.yearLabel}
              onChange={(event) => updateForm("yearLabel", event.target.value)}
              placeholder="z. B. I (Type 3H) | Year built 2017->"
            />
          </label>

          <label className="field">
            <span>Baujahr von</span>
            <input
              type="number"
              value={form.buildYearFrom}
              onChange={(event) => updateForm("buildYearFrom", event.target.value)}
            />
          </label>

          <label className="field">
            <span>Baujahr bis</span>
            <input
              type="number"
              value={form.buildYearTo}
              onChange={(event) => updateForm("buildYearTo", event.target.value)}
            />
          </label>

          <label className="field">
            <span>Motor</span>
            <input value={form.engine} onChange={(event) => updateForm("engine", event.target.value)} />
          </label>

          <label className="field">
            <span>Motorcode</span>
            <input
              value={form.engineCode}
              onChange={(event) => updateForm("engineCode", event.target.value)}
            />
          </label>

          <label className="field">
            <span>Getriebe</span>
            <input
              value={form.transmission}
              onChange={(event) => updateForm("transmission", event.target.value)}
            />
          </label>

          <label className="field">
            <span>Getriebecode</span>
            <input
              value={form.transmissionCode}
              onChange={(event) => updateForm("transmissionCode", event.target.value)}
            />
          </label>

          <label className="field">
            <span>Steuergerät</span>
            <input value={form.ecuType} onChange={(event) => updateForm("ecuType", event.target.value)} />
          </label>

          <label className="field">
            <span>ECU-Hersteller</span>
            <input
              value={form.ecuManufacturer}
              onChange={(event) => updateForm("ecuManufacturer", event.target.value)}
            />
          </label>

          <label className="field">
            <span>Antrieb</span>
            <input value={form.driveType} onChange={(event) => updateForm("driveType", event.target.value)} />
          </label>

          <label className="field">
            <span>Plattform</span>
            <input value={form.platform} onChange={(event) => updateForm("platform", event.target.value)} />
          </label>
        </div>

        <label className="field">
          <span>Notizen</span>
          <textarea
            rows={4}
            value={form.notes}
            onChange={(event) => updateForm("notes", event.target.value)}
          />
        </label>

        <label className="checkbox-field">
          <input
            type="checkbox"
            checked={form.isActive}
            onChange={(event) => updateForm("isActive", event.target.checked)}
          />
          <span>Eintrag aktiv</span>
        </label>

        {saveError ? <div className="error-box">{saveError}</div> : null}
        {success ? <div className="success-box">{success}</div> : null}

        <div className="actions">
          <button type="submit" disabled={isSubmitting}>
            {isSubmitting ? "Speichern..." : editingId ? "Änderungen speichern" : "Variante anlegen"}
          </button>
          <button type="button" className="secondary" onClick={resetForm}>
            Zurücksetzen
          </button>
        </div>
      </form>

      <div className="card page-stack">
        <div className="page-header">
          <div>
            <h2>Katalogeinträge</h2>
            <p>Suche nach Marke, Modell, Motor, Getriebe oder Steuergerät.</p>
          </div>
          <label className="checkbox-field compact-checkbox">
            <input
              type="checkbox"
              checked={showInactive}
              onChange={(event) => setShowInactive(event.target.checked)}
            />
            <span>Inaktive anzeigen</span>
          </label>
        </div>

        <label className="field">
          <span>Suche</span>
          <input
            type="text"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Suche nach Marke, Modell, Motorcode, Getriebecode oder ECU..."
          />
        </label>

        {loading ? <p>Lade Fahrzeugkatalog...</p> : null}
        {loadError ? <div className="error-box">{loadError}</div> : null}

        {!loading && !loadError ? (
          filteredItems.length > 0 ? (
            <div className="table-wrap">
              <table className="data-table">
                <thead>
                  <tr>
                    <th>Marke</th>
                    <th>Modell</th>
                    <th>Variante</th>
                    <th>Motor</th>
                    <th>Motorcode</th>
                    <th>Getriebe</th>
                    <th>ECU</th>
                    <th>Status</th>
                    <th>Aktionen</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredItems.map((item) => (
                    <tr key={item.id}>
                      <td>{item.brand}</td>
                      <td>{item.model}</td>
                      <td>{item.variant || item.yearLabel || "-"}</td>
                      <td>{item.engine || "-"}</td>
                      <td>{item.engineCode || "-"}</td>
                      <td>
                        {item.transmission || "-"}
                        {item.transmissionCode ? ` (${item.transmissionCode})` : ""}
                      </td>
                      <td>
                        {item.ecuType || "-"}
                        {item.ecuManufacturer ? ` / ${item.ecuManufacturer}` : ""}
                      </td>
                      <td>{item.isActive ? "Aktiv" : "Inaktiv"}</td>
                      <td>
                        <div className="table-actions">
                          <button
                            type="button"
                            className="secondary"
                            onClick={() => {
                              setEditingId(item.id);
                              setForm(mapEntryToForm(item));
                              setSaveError("");
                              setSuccess("");
                              window.scrollTo({ top: 0, behavior: "smooth" });
                            }}
                          >
                            Bearbeiten
                          </button>
                          <button type="button" className="secondary" onClick={() => void handleDelete(item.id)}>
                            Löschen
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <p>Keine Katalogeinträge vorhanden.</p>
          )
        ) : null}
      </div>
    </div>
  );
}
