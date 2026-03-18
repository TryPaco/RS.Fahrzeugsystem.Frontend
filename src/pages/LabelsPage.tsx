import { FormEvent, useEffect, useMemo, useState } from "react";
import { http } from "../api/http";

type VehicleListItem = {
  id: string;
  customerId: string;
  customerName: string;
  internalNumber: string;
  licensePlate?: string | null;
  brand: string;
  model: string;
};

type LabelItem = {
  id: string;
  code: string;
  prefix: string;
  codeNumber: number;
  status: number;
  vehicleId?: string | null;
  positionOnVehicle?: string | null;
  assignedAtUtc?: string | null;
  notes?: string | null;
  vehicle?: {
    id: string;
    internalNumber: string;
    licensePlate?: string | null;
    brand: string;
    model: string;
  } | null;
};

type CreateLabelRequest = {
  code: string;
  notes: string;
};

type AssignLabelRequest = {
  code: string;
  vehicleId: string;
  positionOnVehicle: string;
};

const initialCreateForm: CreateLabelRequest = {
  code: "",
  notes: "",
};

const initialAssignForm: AssignLabelRequest = {
  code: "",
  vehicleId: "",
  positionOnVehicle: "",
};

function formatDate(value?: string | null) {
  if (!value) return "-";
  return new Date(value).toLocaleString("de-DE");
}

function getStatusText(status: number) {
  switch (status) {
    case 0:
      return "Frei";
    case 1:
      return "Vergeben";
    case 2:
      return "Defekt";
    case 3:
      return "Entfernt";
    default:
      return `Unbekannt (${status})`;
  }
}

function normalizeLabelCode(raw: string) {
  return raw.trim().toUpperCase();
}

function isValidLabelCode(code: string) {
  return /^(RS|B)-\d{6}$/.test(code);
}

export function LabelsPage() {
  const [items, setItems] = useState<LabelItem[]>([]);
  const [vehicles, setVehicles] = useState<VehicleListItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingError, setLoadingError] = useState("");
  const [query, setQuery] = useState("");

  const [createForm, setCreateForm] = useState<CreateLabelRequest>(initialCreateForm);
  const [createError, setCreateError] = useState("");
  const [createSuccess, setCreateSuccess] = useState("");
  const [isCreating, setIsCreating] = useState(false);

  const [assignForm, setAssignForm] = useState<AssignLabelRequest>(initialAssignForm);
  const [assignError, setAssignError] = useState("");
  const [assignSuccess, setAssignSuccess] = useState("");
  const [isAssigning, setIsAssigning] = useState(false);

  async function loadLabels() {
    setLoading(true);
    setLoadingError("");

    try {
      const response = await http.get<LabelItem[]>("/labels");
      setItems(response.data);
    } catch (error: any) {
      setLoadingError(
        error?.response?.data?.title ||
          error?.response?.data ||
          "Labels konnten nicht geladen werden."
      );
    } finally {
      setLoading(false);
    }
  }

  async function loadVehicles() {
    try {
      const response = await http.get<VehicleListItem[]>("/vehicles?includeArchived=false");
      setVehicles(response.data);
    } catch {
      setVehicles([]);
    }
  }

  useEffect(() => {
    void loadLabels();
    void loadVehicles();
  }, []);

  const filteredItems = useMemo(() => {
    const term = query.trim().toLowerCase();
    if (!term) return items;

    return items.filter((item) => {
      return (
        item.code.toLowerCase().includes(term) ||
        item.prefix.toLowerCase().includes(term) ||
        getStatusText(item.status).toLowerCase().includes(term) ||
        (item.positionOnVehicle ?? "").toLowerCase().includes(term) ||
        (item.notes ?? "").toLowerCase().includes(term) ||
        (item.vehicle?.internalNumber ?? "").toLowerCase().includes(term) ||
        (item.vehicle?.licensePlate ?? "").toLowerCase().includes(term) ||
        (item.vehicle?.brand ?? "").toLowerCase().includes(term) ||
        (item.vehicle?.model ?? "").toLowerCase().includes(term)
      );
    });
  }, [items, query]);

  const freeLabels = useMemo(() => items.filter((item) => item.status === 0), [items]);

  async function handleCreateLabel(event: FormEvent) {
    event.preventDefault();
    setCreateError("");
    setCreateSuccess("");

    const code = normalizeLabelCode(createForm.code);
    if (!code) {
      setCreateError("Label-Code ist erforderlich.");
      return;
    }

    if (!isValidLabelCode(code)) {
      setCreateError("Erlaubt sind nur Codes wie RS-000001 oder B-000001.");
      return;
    }

    setIsCreating(true);

    try {
      await http.post("/labels", {
        code,
        notes: createForm.notes.trim() || null,
      });

      setCreateSuccess("Label erfolgreich angelegt.");
      setCreateForm(initialCreateForm);
      await loadLabels();
    } catch (error: any) {
      setCreateError(
        error?.response?.data?.title ||
          error?.response?.data ||
          "Label konnte nicht angelegt werden."
      );
    } finally {
      setIsCreating(false);
    }
  }

  async function handleAssignLabel(event: FormEvent) {
    event.preventDefault();
    setAssignError("");
    setAssignSuccess("");

    const code = normalizeLabelCode(assignForm.code);
    if (!code) {
      setAssignError("Label-Code ist erforderlich.");
      return;
    }

    if (!isValidLabelCode(code)) {
      setAssignError("Erlaubt sind nur Codes wie RS-000001 oder B-000001.");
      return;
    }

    if (!assignForm.vehicleId) {
      setAssignError("Bitte ein Fahrzeug auswählen.");
      return;
    }

    setIsAssigning(true);

    try {
      await http.post("/labels/assign", {
        code,
        vehicleId: assignForm.vehicleId,
        positionOnVehicle: assignForm.positionOnVehicle.trim() || null,
      });

      setAssignSuccess("Label erfolgreich zugewiesen.");
      setAssignForm(initialAssignForm);
      await loadLabels();
    } catch (error: any) {
      setAssignError(
        error?.response?.data?.title ||
          error?.response?.data ||
          "Label konnte nicht zugewiesen werden."
      );
    } finally {
      setIsAssigning(false);
    }
  }

  async function handleUnassignLabel(code: string) {
    const confirmed = window.confirm(
      `Label ${code} wirklich vom Fahrzeug entfernen?\n\nDas Label kann später erneut zugewiesen werden.`
    );

    if (!confirmed) return;

    try {
      await http.post("/labels/unassign", null, {
        params: { code },
      });

      await loadLabels();
    } catch (error: any) {
      alert(
        error?.response?.data?.title ||
          error?.response?.data ||
          "Label konnte nicht gelöst werden."
      );
    }
  }

  return (
    <div className="page-stack">
      <div className="page-header">
        <div>
          <h1>Labels</h1>
          <p>Verwalte QR-Codes, freie Kennungen und die Zuweisung zu Fahrzeugen.</p>
        </div>
      </div>

      <div className="card">
        <label className="field">
          <span>Suche</span>
          <input
            type="text"
            placeholder="Suche nach Code, Prefix, Fahrzeug, Kennzeichen oder Status..."
            value={query}
            onChange={(event) => setQuery(event.target.value)}
          />
        </label>
      </div>

      <div className="form-grid-2">
        <form className="card page-stack" onSubmit={handleCreateLabel}>
          <h2>Neues Label anlegen</h2>

          <label className="field">
            <span>Label-Code *</span>
            <input
              value={createForm.code}
              onChange={(event) =>
                setCreateForm((prev) => ({ ...prev, code: event.target.value.toUpperCase() }))
              }
              placeholder="RS-000001 oder B-000001"
            />
          </label>

          <label className="field">
            <span>Notizen</span>
            <textarea
              rows={3}
              value={createForm.notes}
              onChange={(event) =>
                setCreateForm((prev) => ({ ...prev, notes: event.target.value }))
              }
            />
          </label>

          {createError ? <div className="error-box">{createError}</div> : null}
          {createSuccess ? <div className="success-box">{createSuccess}</div> : null}

          <div className="actions">
            <button type="submit" disabled={isCreating}>
              {isCreating ? "Speichern..." : "Label anlegen"}
            </button>
          </div>
        </form>

        <form className="card page-stack" onSubmit={handleAssignLabel}>
          <h2>Label zuweisen</h2>

          <label className="field">
            <span>Freies Label *</span>
            <select
              value={assignForm.code}
              onChange={(event) =>
                setAssignForm((prev) => ({ ...prev, code: event.target.value }))
              }
            >
              <option value="">Bitte auswählen</option>
              {freeLabels.map((label) => (
                <option key={label.id} value={label.code}>
                  {label.code}
                </option>
              ))}
            </select>
          </label>

          <label className="field">
            <span>Fahrzeug *</span>
            <select
              value={assignForm.vehicleId}
              onChange={(event) =>
                setAssignForm((prev) => ({ ...prev, vehicleId: event.target.value }))
              }
            >
              <option value="">Bitte auswählen</option>
              {vehicles.map((vehicle) => (
                <option key={vehicle.id} value={vehicle.id}>
                  {vehicle.internalNumber} - {vehicle.brand} {vehicle.model}
                  {vehicle.licensePlate ? ` (${vehicle.licensePlate})` : ""}
                </option>
              ))}
            </select>
          </label>

          <label className="field">
            <span>Position am Fahrzeug</span>
            <input
              value={assignForm.positionOnVehicle}
              onChange={(event) =>
                setAssignForm((prev) => ({
                  ...prev,
                  positionOnVehicle: event.target.value,
                }))
              }
              placeholder="z. B. Motorraum"
            />
          </label>

          {assignError ? <div className="error-box">{assignError}</div> : null}
          {assignSuccess ? <div className="success-box">{assignSuccess}</div> : null}

          <div className="actions">
            <button type="submit" disabled={isAssigning}>
              {isAssigning ? "Zuweisen..." : "Label zuweisen"}
            </button>
          </div>
        </form>
      </div>

      <div className="card page-stack">
        <div className="section-title">
          <h2>Label-Liste</h2>
          <span>{filteredItems.length} Einträge</span>
        </div>

        {loading ? <p>Lade Labels...</p> : null}
        {loadingError ? <div className="error-box">{loadingError}</div> : null}

        {!loading && !loadingError ? (
          filteredItems.length > 0 ? (
            <>
              <div className="table-wrap desktop-table">
                <table className="data-table">
                  <thead>
                    <tr>
                      <th>Code</th>
                      <th>Prefix</th>
                      <th>Status</th>
                      <th>Fahrzeug</th>
                      <th>Position</th>
                      <th>Zugewiesen am</th>
                      <th>Aktion</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredItems.map((item) => (
                      <tr key={item.id}>
                        <td>{item.code}</td>
                        <td>{item.prefix}</td>
                        <td>{getStatusText(item.status)}</td>
                        <td>
                          {item.vehicle
                            ? `${item.vehicle.internalNumber} - ${item.vehicle.brand} ${item.vehicle.model}${
                                item.vehicle.licensePlate ? ` (${item.vehicle.licensePlate})` : ""
                              }`
                            : "-"}
                        </td>
                        <td>{item.positionOnVehicle || "-"}</td>
                        <td>{formatDate(item.assignedAtUtc)}</td>
                        <td>
                          {item.vehicleId ? (
                            <button
                              type="button"
                              className="secondary"
                              onClick={() => void handleUnassignLabel(item.code)}
                            >
                              Lösen
                            </button>
                          ) : (
                            "-"
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              <div className="mobile-card-list">
                {filteredItems.map((item) => (
                  <article key={item.id} className="mobile-data-card">
                    <div className="mobile-data-card-header">
                      <strong>{item.code}</strong>
                      <span>{getStatusText(item.status)}</span>
                    </div>
                    <h3>{item.vehicle ? `${item.vehicle.brand} ${item.vehicle.model}` : "Nicht zugewiesen"}</h3>
                    <p>
                      {item.vehicle
                        ? `${item.vehicle.internalNumber}${item.vehicle.licensePlate ? ` (${item.vehicle.licensePlate})` : ""}`
                        : "Freies Label"}
                    </p>
                    <div className="mobile-data-card-grid">
                      <div>
                        <strong>Position</strong>
                        <span>{item.positionOnVehicle || "-"}</span>
                      </div>
                      <div>
                        <strong>Zugewiesen</strong>
                        <span>{formatDate(item.assignedAtUtc)}</span>
                      </div>
                    </div>
                    {item.vehicleId ? (
                      <div className="actions">
                        <button
                          type="button"
                          className="secondary"
                          onClick={() => void handleUnassignLabel(item.code)}
                        >
                          Lösen
                        </button>
                      </div>
                    ) : null}
                  </article>
                ))}
              </div>
            </>
          ) : (
            <p>Keine Labels vorhanden.</p>
          )
        ) : null}
      </div>
    </div>
  );
}
