import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { http } from "../api/http";

type VehicleDetail = {
  id: string;
  customerId: string;
  customer: {
    id: string;
    customerNumber: string;
    companyName?: string | null;
    firstName: string;
    lastName: string;
    phone?: string | null;
    email?: string | null;
  };
  internalNumber: string;
  fin?: string | null;
  licensePlate?: string | null;
  brand: string;
  model: string;
  modelVariant?: string | null;
  buildYear?: number | null;
  engineCode?: string | null;
  transmission?: string | null;
  fuelType?: string | null;
  color?: string | null;
  currentKm: number;
  stockPowerHp?: number | null;
  currentPowerHp?: number | null;
  softwareStage?: string | null;
  notes?: string | null;
  isArchived: boolean;
  createdAtUtc: string;
  updatedAtUtc?: string | null;
  labels?: Array<{
    id: string;
    code: string;
    prefix: string;
    codeNumber: number;
    positionOnVehicle?: string | null;
    assignedAtUtc?: string | null;
    notes?: string | null;
  }>;
};

type HistoryItem = {
  id: string;
  eventType: string;
  title: string;
  description?: string | null;
  eventDateUtc: string;
  kmRequired: boolean;
  kmValue: number;
};

type PartItem = {
  id: string;
  categoryId?: string | null;
  name: string;
  manufacturer?: string | null;
  partNumber?: string | null;
  serialNumber?: string | null;
  installedAtUtc?: string | null;
  installedKm: number;
  removedAtUtc?: string | null;
  removedKm?: number | null;
  status?: string | null;
  priceNet?: number | null;
  priceGross?: number | null;
  notes?: string | null;
  createdAtUtc?: string | null;
  updatedAtUtc?: string | null;
};

type FreeLabelItem = {
  id: string;
  code: string;
  prefix: string;
  codeNumber: number;
  status: number;
  vehicleId?: string | null;
  positionOnVehicle?: string | null;
  assignedAtUtc?: string | null;
  notes?: string | null;
};

type CustomerListItem = {
  id: string;
  customerNumber: string;
  companyName?: string | null;
  firstName: string;
  lastName: string;
};

type EditFormState = {
  customerId: string;
  internalNumber: string;
  fin: string;
  licensePlate: string;
  brand: string;
  model: string;
  modelVariant: string;
  buildYear: string;
  engineCode: string;
  transmission: string;
  fuelType: string;
  color: string;
  currentKm: string;
  stockPowerHp: string;
  currentPowerHp: string;
  softwareStage: string;
  notes: string;
  isArchived: boolean;
};

type HistoryFormState = {
  eventType: string;
  title: string;
  description: string;
  eventDateUtc: string;
  kmValue: string;
  kmRequired: boolean;
};

type PartFormState = {
  categoryId: string;
  name: string;
  manufacturer: string;
  partNumber: string;
  serialNumber: string;
  installedAtUtc: string;
  installedKm: string;
  status: string;
  notes: string;
};

function formatDate(value?: string | null) {
  if (!value) return "-";
  return new Date(value).toLocaleString("de-DE");
}

function mapVehicleToEditForm(v: VehicleDetail): EditFormState {
  return {
    customerId: v.customerId ?? "",
    internalNumber: v.internalNumber ?? "",
    fin: v.fin ?? "",
    licensePlate: v.licensePlate ?? "",
    brand: v.brand ?? "",
    model: v.model ?? "",
    modelVariant: v.modelVariant ?? "",
    buildYear: v.buildYear ? String(v.buildYear) : "",
    engineCode: v.engineCode ?? "",
    transmission: v.transmission ?? "",
    fuelType: v.fuelType ?? "",
    color: v.color ?? "",
    currentKm: String(v.currentKm ?? ""),
    stockPowerHp: v.stockPowerHp ? String(v.stockPowerHp) : "",
    currentPowerHp: v.currentPowerHp ? String(v.currentPowerHp) : "",
    softwareStage: v.softwareStage ?? "",
    notes: v.notes ?? "",
    isArchived: v.isArchived ?? false,
  };
}

function createInitialHistoryForm(): HistoryFormState {
  return {
    eventType: "Service",
    title: "",
    description: "",
    eventDateUtc: new Date().toISOString().slice(0, 16),
    kmValue: "",
    kmRequired: true,
  };
}

function createInitialPartForm(currentKm?: number): PartFormState {
  return {
    categoryId: "",
    name: "",
    manufacturer: "",
    partNumber: "",
    serialNumber: "",
    installedAtUtc: new Date().toISOString().slice(0, 16),
    installedKm: currentKm ? String(currentKm) : "",
    status: "Verbaut",
    notes: "",
  };
}

export function VehicleDetailPage() {
  const { id } = useParams();

  const [item, setItem] = useState<VehicleDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [customers, setCustomers] = useState<CustomerListItem[]>([]);

  const [freeLabels, setFreeLabels] = useState<FreeLabelItem[]>([]);
  const [assignCode, setAssignCode] = useState("");
  const [assignPosition, setAssignPosition] = useState("");
  const [assignError, setAssignError] = useState("");
  const [isAssigning, setIsAssigning] = useState(false);

  const [isEditing, setIsEditing] = useState(false);
  const [saveError, setSaveError] = useState("");
  const [isSaving, setIsSaving] = useState(false);
  const [editForm, setEditForm] = useState<EditFormState>({
    customerId: "",
    internalNumber: "",
    fin: "",
    licensePlate: "",
    brand: "",
    model: "",
    modelVariant: "",
    buildYear: "",
    engineCode: "",
    transmission: "",
    fuelType: "",
    color: "",
    currentKm: "",
    stockPowerHp: "",
    currentPowerHp: "",
    softwareStage: "",
    notes: "",
    isArchived: false,
  });

  const [historyItems, setHistoryItems] = useState<HistoryItem[]>([]);
  const [historyLoading, setHistoryLoading] = useState(false);
  const [historyError, setHistoryError] = useState("");
  const [showHistoryForm, setShowHistoryForm] = useState(false);
  const [historyForm, setHistoryForm] = useState<HistoryFormState>(createInitialHistoryForm());
  const [historySaveError, setHistorySaveError] = useState("");
  const [isSavingHistory, setIsSavingHistory] = useState(false);

  const [partsItems, setPartsItems] = useState<PartItem[]>([]);
  const [partsLoading, setPartsLoading] = useState(false);
  const [partsError, setPartsError] = useState("");
  const [showPartForm, setShowPartForm] = useState(false);
  const [partForm, setPartForm] = useState<PartFormState>(createInitialPartForm());
  const [partSaveError, setPartSaveError] = useState("");
  const [isSavingPart, setIsSavingPart] = useState(false);

  async function loadVehicle() {
    setLoading(true);
    setError("");

    try {
      const response = await http.get<VehicleDetail>(`/vehicles/${id}`);
      setItem(response.data);
      setEditForm(mapVehicleToEditForm(response.data));
    } catch (err: any) {
      setError(
        err?.response?.data?.title ||
          err?.response?.data ||
          "Fahrzeugdetails konnten nicht geladen werden."
      );
    } finally {
      setLoading(false);
    }
  }

  async function loadFreeLabels() {
    try {
      const response = await http.get<FreeLabelItem[]>("/labels");
      const free = response.data.filter((x) => x.status === 0);
      setFreeLabels(free);
    } catch {
      setFreeLabels([]);
    }
  }

  async function loadCustomers() {
    try {
      const response = await http.get<CustomerListItem[]>("/customers?includeArchived=false");
      setCustomers(response.data);
    } catch {
      setCustomers([]);
    }
  }

  async function loadHistory() {
    if (!id) return;

    setHistoryLoading(true);
    setHistoryError("");

    try {
      const response = await http.get<HistoryItem[]>(`/vehicles/${id}/history`);
      setHistoryItems(response.data);
    } catch (err: any) {
      setHistoryError(
        err?.response?.data?.title ||
          err?.response?.data ||
          "Historie konnte nicht geladen werden."
      );
    } finally {
      setHistoryLoading(false);
    }
  }

  async function loadParts() {
    if (!id) return;

    setPartsLoading(true);
    setPartsError("");

    try {
      const response = await http.get<PartItem[]>(`/vehicles/${id}/parts`);
      setPartsItems(response.data);
    } catch (err: any) {
      setPartsError(
        err?.response?.data?.title ||
          err?.response?.data ||
          "Teile / Umbauten konnten nicht geladen werden."
      );
    } finally {
      setPartsLoading(false);
    }
  }

  useEffect(() => {
    if (!id) return;

    loadVehicle();
    loadFreeLabels();
    loadCustomers();
    loadHistory();
    loadParts();
  }, [id]);

  useEffect(() => {
    if (item?.currentKm != null) {
      setPartForm((prev) => ({
        ...prev,
        installedKm: prev.installedKm || String(item.currentKm),
      }));
    }
  }, [item]);

  function updateEditForm<K extends keyof EditFormState>(
    key: K,
    value: EditFormState[K]
  ) {
    setEditForm((prev) => ({ ...prev, [key]: value }));
  }

  function updateHistoryForm<K extends keyof HistoryFormState>(
    key: K,
    value: HistoryFormState[K]
  ) {
    setHistoryForm((prev) => ({ ...prev, [key]: value }));
  }

  function updatePartForm<K extends keyof PartFormState>(
    key: K,
    value: PartFormState[K]
  ) {
    setPartForm((prev) => ({ ...prev, [key]: value }));
  }

  async function assignLabelToVehicle() {
    if (!item) return;

    setAssignError("");

    if (!assignCode) {
      setAssignError("Bitte ein freies Label auswählen.");
      return;
    }

    setIsAssigning(true);

    try {
      await http.post("/labels/assign", {
        code: assignCode,
        vehicleId: item.id,
        positionOnVehicle: assignPosition.trim() || null,
      });

      setAssignCode("");
      setAssignPosition("");

      await loadVehicle();
      await loadFreeLabels();
    } catch (err: any) {
      setAssignError(
        err?.response?.data?.title ||
          err?.response?.data ||
          "Label konnte nicht zugewiesen werden."
      );
    } finally {
      setIsAssigning(false);
    }
  }

  async function unassignLabelFromVehicle(code: string) {
    const confirmed = window.confirm(
      `⚠️ Label ${code} wirklich vom Fahrzeug entfernen?\n\nDiese Aktion kann später durch erneutes Zuweisen rückgängig gemacht werden.`
    );

    if (!confirmed) return;

    try {
      await http.post("/labels/unassign", null, {
        params: { code },
      });

      await loadVehicle();
      await loadFreeLabels();
    } catch (err: any) {
      setAssignError(
        err?.response?.data?.title ||
          err?.response?.data ||
          "Label konnte nicht entfernt werden."
      );
    }
  }

  async function handleSaveVehicle() {
    if (!item) return;

    setSaveError("");

    if (!editForm.customerId) {
      setSaveError("Kunde ist erforderlich.");
      return;
    }

    if (!editForm.internalNumber.trim()) {
      setSaveError("Interne Nummer ist erforderlich.");
      return;
    }

    if (!editForm.brand.trim()) {
      setSaveError("Marke ist erforderlich.");
      return;
    }

    if (!editForm.model.trim()) {
      setSaveError("Modell ist erforderlich.");
      return;
    }

    if (!editForm.currentKm.trim()) {
      setSaveError("KM-Stand ist erforderlich.");
      return;
    }

    const currentKm = Number(editForm.currentKm);
    if (Number.isNaN(currentKm) || currentKm < 0) {
      setSaveError("KM-Stand ist ungültig.");
      return;
    }

    setIsSaving(true);

    try {
      await http.put(`/vehicles/${item.id}`, {
        customerId: editForm.customerId,
        internalNumber: editForm.internalNumber.trim(),
        fin: editForm.fin.trim() || null,
        licensePlate: editForm.licensePlate.trim() || null,
        brand: editForm.brand.trim(),
        model: editForm.model.trim(),
        modelVariant: editForm.modelVariant.trim() || null,
        buildYear: editForm.buildYear.trim() ? Number(editForm.buildYear) : null,
        engineCode: editForm.engineCode.trim() || null,
        transmission: editForm.transmission.trim() || null,
        fuelType: editForm.fuelType.trim() || null,
        color: editForm.color.trim() || null,
        currentKm,
        stockPowerHp: editForm.stockPowerHp.trim()
          ? Number(editForm.stockPowerHp)
          : null,
        currentPowerHp: editForm.currentPowerHp.trim()
          ? Number(editForm.currentPowerHp)
          : null,
        softwareStage: editForm.softwareStage.trim() || null,
        notes: editForm.notes.trim() || null,
        isArchived: editForm.isArchived,
      });

      setIsEditing(false);
      await loadVehicle();
    } catch (err: any) {
      setSaveError(
        err?.response?.data?.title ||
          err?.response?.data ||
          "Fahrzeug konnte nicht gespeichert werden."
      );
    } finally {
      setIsSaving(false);
    }
  }

  async function handleCreateHistory() {
    if (!id) return;

    setHistorySaveError("");

    if (!historyForm.title.trim()) {
      setHistorySaveError("Titel ist erforderlich.");
      return;
    }

    if (!historyForm.kmValue.trim()) {
      setHistorySaveError("KM-Stand ist erforderlich.");
      return;
    }

    const kmValue = Number(historyForm.kmValue);
    if (Number.isNaN(kmValue) || kmValue < 0) {
      setHistorySaveError("KM-Stand ist ungültig.");
      return;
    }

    setIsSavingHistory(true);

    try {
      await http.post(`/vehicles/${id}/history`, {
        eventType: historyForm.eventType,
        title: historyForm.title.trim(),
        description: historyForm.description.trim() || null,
        eventDateUtc: new Date(historyForm.eventDateUtc).toISOString(),
        kmRequired: historyForm.kmRequired,
        kmValue,
      });

      setHistoryForm(createInitialHistoryForm());
      setShowHistoryForm(false);

      await loadHistory();
      await loadVehicle();
    } catch (err: any) {
      setHistorySaveError(
        err?.response?.data?.title ||
          err?.response?.data ||
          "Historieneintrag konnte nicht gespeichert werden."
      );
    } finally {
      setIsSavingHistory(false);
    }
  }

  async function handleDeleteHistory(historyId: string) {
    const confirmed = window.confirm(
      "⚠️ Diesen Historieneintrag wirklich löschen?"
    );

    if (!confirmed) return;

    try {
      await http.delete(`/history/${historyId}`);
      await loadHistory();
      await loadVehicle();
    } catch (err: any) {
      setHistoryError(
        err?.response?.data?.title ||
          err?.response?.data ||
          "Historieneintrag konnte nicht gelöscht werden."
      );
    }
  }

  async function handleCreatePart() {
    if (!id || !item) return;

    setPartSaveError("");

    if (!partForm.name.trim()) {
      setPartSaveError("Name des Teils / Umbaus ist erforderlich.");
      return;
    }

    if (!partForm.installedKm.trim()) {
      setPartSaveError("Einbau-KM ist erforderlich.");
      return;
    }

    const installedKm = Number(partForm.installedKm);
    if (Number.isNaN(installedKm) || installedKm < 0) {
      setPartSaveError("Einbau-KM ist ungültig.");
      return;
    }

    setIsSavingPart(true);

    try {
      await http.post(`/vehicles/${id}/parts`, {
        categoryId: partForm.categoryId.trim() || null,
        name: partForm.name.trim(),
        manufacturer: partForm.manufacturer.trim() || null,
        partNumber: partForm.partNumber.trim() || null,
        serialNumber: partForm.serialNumber.trim() || null,
        installedAtUtc: new Date(partForm.installedAtUtc).toISOString(),
        installedKm,
        status: partForm.status.trim() || "Verbaut",
        notes: partForm.notes.trim() || null,
      });

      // Automatisch Historie anlegen
      const historyTitle = partForm.manufacturer.trim()
        ? `${partForm.name.trim()} verbaut (${partForm.manufacturer.trim()})`
        : `${partForm.name.trim()} verbaut`;

      const historyDescriptionParts = [
        partForm.partNumber.trim() ? `Teilenummer: ${partForm.partNumber.trim()}` : "",
        partForm.serialNumber.trim() ? `Seriennummer: ${partForm.serialNumber.trim()}` : "",
        partForm.notes.trim() ? `Notiz: ${partForm.notes.trim()}` : "",
      ].filter(Boolean);

      await http.post(`/vehicles/${id}/history`, {
        eventType: "Umbau",
        title: historyTitle,
        description: historyDescriptionParts.length > 0 ? historyDescriptionParts.join(" | ") : null,
        eventDateUtc: new Date(partForm.installedAtUtc).toISOString(),
        kmRequired: true,
        kmValue: installedKm,
      });

      setPartForm(createInitialPartForm(item.currentKm));
      setShowPartForm(false);

      await loadParts();
      await loadHistory();
      await loadVehicle();
    } catch (err: any) {
      setPartSaveError(
        err?.response?.data?.title ||
          err?.response?.data ||
          "Teil / Umbau konnte nicht gespeichert werden."
      );
    } finally {
      setIsSavingPart(false);
    }
  }

  async function handleDeletePart(partId: string) {
    const confirmed = window.confirm(
      "⚠️ Diesen Teile-/Umbau-Eintrag wirklich löschen?"
    );

    if (!confirmed) return;

    try {
      await http.delete(`/parts/${partId}`);
      await loadParts();
    } catch (err: any) {
      setPartsError(
        err?.response?.data?.title ||
          err?.response?.data ||
          "Teil / Umbau konnte nicht gelöscht werden."
      );
    }
  }

  function cancelEdit() {
    if (item) {
      setEditForm(mapVehicleToEditForm(item));
    }
    setSaveError("");
    setIsEditing(false);
  }

  if (loading) {
    return (
      <div className="page-stack">
        <p>Lade Fahrzeugdetails...</p>
      </div>
    );
  }

  if (error || !item) {
    return (
      <div className="page-stack">
        <Link to="/vehicles" className="table-link">
          ← Zurück zur Fahrzeugliste
        </Link>
        <div className="error-box">{error || "Fahrzeug nicht gefunden."}</div>
      </div>
    );
  }

  const customerName = item.customer.companyName?.trim()
    ? item.customer.companyName
    : `${item.customer.firstName} ${item.customer.lastName}`;

  return (
    <div className="page-stack">
      <div className="page-header">
        <div>
          <Link to="/vehicles" className="table-link">
            ← Zurück zur Fahrzeugliste
          </Link>
          <h1>
            {item.brand} {item.model}
            {item.modelVariant ? ` ${item.modelVariant}` : ""}
          </h1>
          <p>
            {item.internalNumber}
            {item.licensePlate ? ` · ${item.licensePlate}` : ""}
          </p>
        </div>

        <div className="actions">
          {!isEditing ? (
            <button type="button" onClick={() => setIsEditing(true)}>
              Fahrzeug bearbeiten
            </button>
          ) : (
            <>
              <button type="button" onClick={handleSaveVehicle} disabled={isSaving}>
                {isSaving ? "Speichern..." : "Speichern"}
              </button>
              <button type="button" className="secondary" onClick={cancelEdit}>
                Abbrechen
              </button>
            </>
          )}
        </div>
      </div>

      <div className="card page-stack">
        <div className="section-title">
          <h2>Fahrzeugdaten</h2>
        </div>

        {!isEditing ? (
          <>
            <div className="detail-grid">
              <div><strong>Interne Nummer:</strong><br />{item.internalNumber}</div>
              <div><strong>Kennzeichen:</strong><br />{item.licensePlate || "-"}</div>
              <div><strong>FIN:</strong><br />{item.fin || "-"}</div>
              <div><strong>Marke:</strong><br />{item.brand}</div>
              <div><strong>Modell:</strong><br />{item.model}</div>
              <div><strong>Variante:</strong><br />{item.modelVariant || "-"}</div>
              <div><strong>Baujahr:</strong><br />{item.buildYear ?? "-"}</div>
              <div><strong>Motorcode:</strong><br />{item.engineCode || "-"}</div>
              <div><strong>Getriebe:</strong><br />{item.transmission || "-"}</div>
              <div><strong>Kraftstoff:</strong><br />{item.fuelType || "-"}</div>
              <div><strong>Farbe:</strong><br />{item.color || "-"}</div>
              <div><strong>KM-Stand:</strong><br />{item.currentKm}</div>
              <div><strong>Leistung Serie:</strong><br />{item.stockPowerHp ?? "-"}</div>
              <div><strong>Leistung aktuell:</strong><br />{item.currentPowerHp ?? "-"}</div>
              <div><strong>Software Stage:</strong><br />{item.softwareStage || "-"}</div>
              <div><strong>Archiviert:</strong><br />{item.isArchived ? "Ja" : "Nein"}</div>
            </div>

            <div>
              <strong>Notizen:</strong>
              <div className="detail-note">{item.notes || "-"}</div>
            </div>
          </>
        ) : (
          <div className="page-stack">
            <div className="form-grid">
              <label className="field">
                <span>Kunde *</span>
                <select
                  value={editForm.customerId}
                  onChange={(e) => updateEditForm("customerId", e.target.value)}
                >
                  <option value="">Bitte auswählen</option>
                  {customers.map((customer) => (
                    <option key={customer.id} value={customer.id}>
                      {customer.customerNumber} -{" "}
                      {customer.companyName?.trim()
                        ? customer.companyName
                        : `${customer.firstName} ${customer.lastName}`}
                    </option>
                  ))}
                </select>
              </label>

              <label className="field">
                <span>Interne Nummer *</span>
                <input
                  value={editForm.internalNumber}
                  onChange={(e) => updateEditForm("internalNumber", e.target.value)}
                />
              </label>

              <label className="field">
                <span>Kennzeichen</span>
                <input
                  value={editForm.licensePlate}
                  onChange={(e) => updateEditForm("licensePlate", e.target.value)}
                />
              </label>

              <label className="field">
                <span>FIN</span>
                <input
                  value={editForm.fin}
                  onChange={(e) => updateEditForm("fin", e.target.value.toUpperCase())}
                />
              </label>

              <label className="field">
                <span>Marke *</span>
                <input
                  value={editForm.brand}
                  onChange={(e) => updateEditForm("brand", e.target.value)}
                />
              </label>

              <label className="field">
                <span>Modell *</span>
                <input
                  value={editForm.model}
                  onChange={(e) => updateEditForm("model", e.target.value)}
                />
              </label>

              <label className="field">
                <span>Modellvariante</span>
                <input
                  value={editForm.modelVariant}
                  onChange={(e) => updateEditForm("modelVariant", e.target.value)}
                />
              </label>

              <label className="field">
                <span>Baujahr</span>
                <input
                  type="number"
                  value={editForm.buildYear}
                  onChange={(e) => updateEditForm("buildYear", e.target.value)}
                />
              </label>

              <label className="field">
                <span>Motorcode</span>
                <input
                  value={editForm.engineCode}
                  onChange={(e) => updateEditForm("engineCode", e.target.value)}
                />
              </label>

              <label className="field">
                <span>Getriebe</span>
                <input
                  value={editForm.transmission}
                  onChange={(e) => updateEditForm("transmission", e.target.value)}
                />
              </label>

              <label className="field">
                <span>Kraftstoff</span>
                <input
                  value={editForm.fuelType}
                  onChange={(e) => updateEditForm("fuelType", e.target.value)}
                />
              </label>

              <label className="field">
                <span>Farbe</span>
                <input
                  value={editForm.color}
                  onChange={(e) => updateEditForm("color", e.target.value)}
                />
              </label>

              <label className="field">
                <span>KM-Stand *</span>
                <input
                  type="number"
                  value={editForm.currentKm}
                  onChange={(e) => updateEditForm("currentKm", e.target.value)}
                />
              </label>

              <label className="field">
                <span>Leistung Serie (PS)</span>
                <input
                  type="number"
                  value={editForm.stockPowerHp}
                  onChange={(e) => updateEditForm("stockPowerHp", e.target.value)}
                />
              </label>

              <label className="field">
                <span>Leistung aktuell (PS)</span>
                <input
                  type="number"
                  value={editForm.currentPowerHp}
                  onChange={(e) => updateEditForm("currentPowerHp", e.target.value)}
                />
              </label>

              <label className="field">
                <span>Software Stage</span>
                <input
                  value={editForm.softwareStage}
                  onChange={(e) => updateEditForm("softwareStage", e.target.value)}
                />
              </label>

              <label className="field">
                <span>Archiviert</span>
                <select
                  value={editForm.isArchived ? "true" : "false"}
                  onChange={(e) => updateEditForm("isArchived", e.target.value === "true")}
                >
                  <option value="false">Nein</option>
                  <option value="true">Ja</option>
                </select>
              </label>
            </div>

            <label className="field">
              <span>Notizen</span>
              <textarea
                rows={4}
                value={editForm.notes}
                onChange={(e) => updateEditForm("notes", e.target.value)}
              />
            </label>

            {saveError ? <div className="error-box">{saveError}</div> : null}
          </div>
        )}
      </div>

      <div className="card page-stack">
        <div className="section-title">
          <h2>Kunde</h2>
        </div>

        <div className="detail-grid">
          <div><strong>Kunde:</strong><br />{customerName}</div>
          <div><strong>Kundennummer:</strong><br />{item.customer.customerNumber}</div>
          <div><strong>Telefon:</strong><br />{item.customer.phone || "-"}</div>
          <div><strong>E-Mail:</strong><br />{item.customer.email || "-"}</div>
        </div>
      </div>

      <div className="card page-stack">
        <div className="section-title">
          <h2>Labels</h2>
          <span>{item.labels?.length ?? 0} Einträge</span>
        </div>

        {item.labels && item.labels.length > 0 ? (
          <div className="table-wrap">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Code</th>
                  <th>Position</th>
                  <th>Zugewiesen am</th>
                  <th>Notizen</th>
                  <th>Aktion</th>
                </tr>
              </thead>
              <tbody>
                {item.labels.map((label) => (
                  <tr key={label.id}>
                    <td>{label.code}</td>
                    <td>{label.positionOnVehicle || "-"}</td>
                    <td>{formatDate(label.assignedAtUtc)}</td>
                    <td>{label.notes || "-"}</td>
                    <td>
                      <button
                        type="button"
                        className="secondary"
                        onClick={() => unassignLabelFromVehicle(label.code)}
                      >
                        Lösen
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <p>Keine Labels vorhanden.</p>
        )}

        <div className="card page-stack">
          <h3>Label hinzufügen</h3>

          <label className="field">
            <span>Freies Label</span>
            <select
              value={assignCode}
              onChange={(e) => setAssignCode(e.target.value)}
            >
              <option value="">Bitte auswählen</option>
              {freeLabels.map((label) => (
                <option key={label.id} value={label.code}>
                  {label.code} {label.prefix === "RS" ? "- RS-Engineers" : "- BTuning"}
                </option>
              ))}
            </select>
          </label>

          <label className="field">
            <span>Position</span>
            <input
              value={assignPosition}
              onChange={(e) => setAssignPosition(e.target.value)}
              placeholder="Motorraum / Türrahmen / Innenraum"
            />
          </label>

          {assignError ? <div className="error-box">{assignError}</div> : null}

          <div className="actions">
            <button type="button" onClick={assignLabelToVehicle} disabled={isAssigning}>
              {isAssigning ? "Zuweisen..." : "Label zuweisen"}
            </button>
          </div>
        </div>
      </div>

      <div className="card page-stack">
        <div className="section-title">
          <h2>Teile / Umbauten</h2>
          <div className="actions">
            <span>{partsItems.length} Einträge</span>
            <button
              type="button"
              onClick={() => {
                setShowPartForm((prev) => !prev);
                setPartSaveError("");
              }}
            >
              {showPartForm ? "Formular schließen" : "Teil / Umbau hinzufügen"}
            </button>
          </div>
        </div>

        {showPartForm ? (
          <div className="card page-stack">
            <h3>Neues Teil / Umbau anlegen</h3>

            <div className="form-grid">
              <label className="field">
                <span>Name *</span>
                <input
                  value={partForm.name}
                  onChange={(e) => updatePartForm("name", e.target.value)}
                  placeholder="z. B. Downpipe / Turbo / LLK"
                />
              </label>

              <label className="field">
                <span>Hersteller</span>
                <input
                  value={partForm.manufacturer}
                  onChange={(e) => updatePartForm("manufacturer", e.target.value)}
                  placeholder="z. B. Wagner / TTE / HJS"
                />
              </label>

              <label className="field">
                <span>Teilenummer</span>
                <input
                  value={partForm.partNumber}
                  onChange={(e) => updatePartForm("partNumber", e.target.value)}
                />
              </label>

              <label className="field">
                <span>Seriennummer</span>
                <input
                  value={partForm.serialNumber}
                  onChange={(e) => updatePartForm("serialNumber", e.target.value)}
                />
              </label>

              <label className="field">
                <span>Einbaudatum *</span>
                <input
                  type="datetime-local"
                  value={partForm.installedAtUtc}
                  onChange={(e) => updatePartForm("installedAtUtc", e.target.value)}
                />
              </label>

              <label className="field">
                <span>Einbau-KM *</span>
                <input
                  type="number"
                  value={partForm.installedKm}
                  onChange={(e) => updatePartForm("installedKm", e.target.value)}
                />
              </label>

              <label className="field">
                <span>Status</span>
                <select
                  value={partForm.status}
                  onChange={(e) => updatePartForm("status", e.target.value)}
                >
                  <option value="Verbaut">Verbaut</option>
                  <option value="Aktiv">Aktiv</option>
                  <option value="Inaktiv">Inaktiv</option>
                  <option value="Ausgebaut">Ausgebaut</option>
                </select>
              </label>

              <label className="field">
                <span>Kategorie-ID</span>
                <input
                  value={partForm.categoryId}
                  onChange={(e) => updatePartForm("categoryId", e.target.value)}
                  placeholder="Optional"
                />
              </label>
            </div>

            <label className="field">
              <span>Notizen</span>
              <textarea
                rows={4}
                value={partForm.notes}
                onChange={(e) => updatePartForm("notes", e.target.value)}
                placeholder="Zusätzliche Infos zum Umbau / Teil..."
              />
            </label>

            {partSaveError ? <div className="error-box">{partSaveError}</div> : null}

            <div className="actions">
              <button
                type="button"
                onClick={handleCreatePart}
                disabled={isSavingPart}
              >
                {isSavingPart ? "Speichern..." : "Teil / Umbau speichern"}
              </button>

              <button
                type="button"
                className="secondary"
                onClick={() => {
                  setShowPartForm(false);
                  setPartSaveError("");
                  setPartForm(createInitialPartForm(item.currentKm));
                }}
              >
                Abbrechen
              </button>
            </div>
          </div>
        ) : null}

        {partsLoading ? <p>Lade Teile / Umbauten...</p> : null}
        {partsError ? <div className="error-box">{partsError}</div> : null}

        {!partsLoading && !partsError ? (
          partsItems.length > 0 ? (
            <div className="table-wrap">
              <table className="data-table">
                <thead>
                  <tr>
                    <th>Name</th>
                    <th>Hersteller</th>
                    <th>Teilenummer</th>
                    <th>Seriennummer</th>
                    <th>Einbau-KM</th>
                    <th>Status</th>
                    <th>Notizen</th>
                    <th>Aktion</th>
                  </tr>
                </thead>
                <tbody>
                  {partsItems.map((part) => (
                    <tr key={part.id}>
                      <td>{part.name}</td>
                      <td>{part.manufacturer || "-"}</td>
                      <td>{part.partNumber || "-"}</td>
                      <td>{part.serialNumber || "-"}</td>
                      <td>{part.installedKm}</td>
                      <td>{part.status || "-"}</td>
                      <td>{part.notes || "-"}</td>
                      <td>
                        <button
                          type="button"
                          className="secondary"
                          onClick={() => handleDeletePart(part.id)}
                        >
                          Löschen
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <p>Keine Teile vorhanden.</p>
          )
        ) : null}
      </div>

      <div className="card page-stack">
        <div className="section-title">
          <h2>Historie</h2>
          <div className="actions">
            <span>{historyItems.length} Einträge</span>
            <button
              type="button"
              onClick={() => {
                setShowHistoryForm((prev) => !prev);
                setHistorySaveError("");
              }}
            >
              {showHistoryForm ? "Formular schließen" : "Eintrag hinzufügen"}
            </button>
          </div>
        </div>

        {showHistoryForm ? (
          <div className="card page-stack">
            <h3>Neuen Historieneintrag anlegen</h3>

            <div className="form-grid">
              <label className="field">
                <span>Typ *</span>
                <select
                  value={historyForm.eventType}
                  onChange={(e) => updateHistoryForm("eventType", e.target.value)}
                >
                  <option value="Service">Service</option>
                  <option value="Umbau">Umbau</option>
                  <option value="Software">Software</option>
                  <option value="Prüfung">Prüfung</option>
                  <option value="Fehler">Fehler</option>
                  <option value="Sonstiges">Sonstiges</option>
                </select>
              </label>

              <label className="field">
                <span>Datum *</span>
                <input
                  type="datetime-local"
                  value={historyForm.eventDateUtc}
                  onChange={(e) => updateHistoryForm("eventDateUtc", e.target.value)}
                />
              </label>

              <label className="field">
                <span>Titel *</span>
                <input
                  value={historyForm.title}
                  onChange={(e) => updateHistoryForm("title", e.target.value)}
                  placeholder="z. B. Ölwechsel durchgeführt"
                />
              </label>

              <label className="field">
                <span>KM-Stand *</span>
                <input
                  type="number"
                  value={historyForm.kmValue}
                  onChange={(e) => updateHistoryForm("kmValue", e.target.value)}
                />
              </label>

              <label className="field">
                <span>KM erforderlich</span>
                <select
                  value={historyForm.kmRequired ? "true" : "false"}
                  onChange={(e) =>
                    updateHistoryForm("kmRequired", e.target.value === "true")
                  }
                >
                  <option value="true">Ja</option>
                  <option value="false">Nein</option>
                </select>
              </label>
            </div>

            <label className="field">
              <span>Beschreibung</span>
              <textarea
                rows={4}
                value={historyForm.description}
                onChange={(e) => updateHistoryForm("description", e.target.value)}
                placeholder="Details zum Service, Umbau oder Hinweis..."
              />
            </label>

            {historySaveError ? (
              <div className="error-box">{historySaveError}</div>
            ) : null}

            <div className="actions">
              <button
                type="button"
                onClick={handleCreateHistory}
                disabled={isSavingHistory}
              >
                {isSavingHistory ? "Speichern..." : "Historie speichern"}
              </button>

              <button
                type="button"
                className="secondary"
                onClick={() => {
                  setShowHistoryForm(false);
                  setHistorySaveError("");
                }}
              >
                Abbrechen
              </button>
            </div>
          </div>
        ) : null}

        {historyLoading ? <p>Lade Historie...</p> : null}
        {historyError ? <div className="error-box">{historyError}</div> : null}

        {!historyLoading && !historyError ? (
          historyItems.length > 0 ? (
            <div className="table-wrap">
              <table className="data-table">
                <thead>
                  <tr>
                    <th>Datum</th>
                    <th>Titel</th>
                    <th>Typ</th>
                    <th>KM</th>
                    <th>Beschreibung</th>
                    <th>Aktion</th>
                  </tr>
                </thead>
                <tbody>
                  {historyItems.map((entry) => (
                    <tr key={entry.id}>
                      <td>{formatDate(entry.eventDateUtc)}</td>
                      <td>{entry.title}</td>
                      <td>{entry.eventType}</td>
                      <td>{entry.kmValue}</td>
                      <td>{entry.description || "-"}</td>
                      <td>
                        <button
                          type="button"
                          className="secondary"
                          onClick={() => handleDeleteHistory(entry.id)}
                        >
                          Löschen
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <p>Keine Historie vorhanden.</p>
          )
        ) : null}
      </div>
    </div>
  );
}