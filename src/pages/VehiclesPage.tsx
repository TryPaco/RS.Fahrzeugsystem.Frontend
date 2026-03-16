import { FormEvent, useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { http } from "../api/http";

type CustomerListItem = {
  id: string;
  customerNumber: string;
  companyName?: string | null;
  firstName: string;
  lastName: string;
};

type VehicleListItem = {
  id: string;
  customerId: string;
  customerName: string;
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
};

type CreateVehicleRequest = {
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
};

type VinDecodeResult = {
  vin: string;
  isValidLength: boolean;
  hasValidCharacters: boolean;
  checkDigitValid: boolean;
  isValid: boolean;
  wmi?: string | null;
  manufacturer?: string | null;
  country?: string | null;
  modelYearCode?: string | null;
  modelYear?: number | null;
  plantCode?: string | null;
  serialNumber?: string | null;
};

const initialForm: CreateVehicleRequest = {
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
};

function getNextVehicleInternalNumber(items: VehicleListItem[]) {
  const highestNumber = items.reduce((max, item) => {
    const match = /^FZG-(\d+)$/.exec(item.internalNumber?.trim() ?? "");
    if (!match) return max;

    const parsed = Number(match[1]);
    return Number.isNaN(parsed) ? max : Math.max(max, parsed);
  }, 0);

  return `FZG-${String(highestNumber + 1).padStart(6, "0")}`;
}

export function VehiclesPage() {
  const [items, setItems] = useState<VehicleListItem[]>([]);
  const [customers, setCustomers] = useState<CustomerListItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingError, setLoadingError] = useState("");
  const [query, setQuery] = useState("");

  const [showCreateForm, setShowCreateForm] = useState(false);
  const [form, setForm] = useState<CreateVehicleRequest>(initialForm);
  const [createError, setCreateError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [vinInfo, setVinInfo] = useState<VinDecodeResult | null>(null);
  const [vinError, setVinError] = useState("");
  const [isDecodingVin, setIsDecodingVin] = useState(false);

  async function loadVehicles() {
    setLoading(true);
    setLoadingError("");

    try {
      const response = await http.get<VehicleListItem[]>("/vehicles?includeArchived=false");
      setItems(response.data);
    } catch (error: any) {
      setLoadingError(
        error?.response?.data?.title ||
          error?.response?.data ||
          "Fahrzeuge konnten nicht geladen werden."
      );
    } finally {
      setLoading(false);
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

  useEffect(() => {
    void loadVehicles();
    void loadCustomers();
  }, []);

  const nextVehicleInternalNumber = useMemo(
    () => getNextVehicleInternalNumber(items),
    [items]
  );

  const filteredItems = useMemo(() => {
    const term = query.trim().toLowerCase();
    if (!term) return items;

    return items.filter((item) => {
      return (
        item.internalNumber.toLowerCase().includes(term) ||
        (item.fin ?? "").toLowerCase().includes(term) ||
        (item.licensePlate ?? "").toLowerCase().includes(term) ||
        item.brand.toLowerCase().includes(term) ||
        item.model.toLowerCase().includes(term) ||
        (item.modelVariant ?? "").toLowerCase().includes(term) ||
        (item.engineCode ?? "").toLowerCase().includes(term) ||
        (item.softwareStage ?? "").toLowerCase().includes(term) ||
        item.customerName.toLowerCase().includes(term)
      );
    });
  }, [items, query]);

  function updateForm<K extends keyof CreateVehicleRequest>(
    key: K,
    value: CreateVehicleRequest[K]
  ) {
    setForm((prev) => ({ ...prev, [key]: value }));
  }

  function resetForm() {
    setForm({ ...initialForm, internalNumber: nextVehicleInternalNumber });
    setCreateError("");
    setVinError("");
    setVinInfo(null);
  }

  async function handleDecodeVin() {
    setVinError("");
    setVinInfo(null);

    const vin = form.fin.trim();
    if (!vin) {
      setVinError("Bitte zuerst eine FIN eingeben.");
      return;
    }

    setIsDecodingVin(true);

    try {
      const response = await http.post<VinDecodeResult>("/vin/decode", { vin });
      const data = response.data;
      setVinInfo(data);

      if (data.manufacturer && data.manufacturer !== "Unbekannt" && !form.brand.trim()) {
        updateForm("brand", data.manufacturer);
      }

      if (data.modelYear && !form.buildYear.trim()) {
        updateForm("buildYear", String(data.modelYear));
      }
    } catch (error: any) {
      setVinError(
        error?.response?.data?.title ||
          error?.response?.data ||
          "FIN konnte nicht decodiert werden."
      );
    } finally {
      setIsDecodingVin(false);
    }
  }

  async function handleCreateVehicle(event: FormEvent) {
    event.preventDefault();
    setCreateError("");

    if (!form.customerId) {
      setCreateError("Bitte einen Kunden auswählen.");
      return;
    }

    if (!form.brand.trim()) {
      setCreateError("Marke ist erforderlich.");
      return;
    }

    if (!form.model.trim()) {
      setCreateError("Modell ist erforderlich.");
      return;
    }

    if (!form.currentKm.trim()) {
      setCreateError("KM-Stand ist erforderlich.");
      return;
    }

    const currentKm = Number(form.currentKm);
    if (Number.isNaN(currentKm) || currentKm < 0) {
      setCreateError("KM-Stand ist ungültig.");
      return;
    }

    setIsSubmitting(true);

    try {
      await http.post("/vehicles", {
        customerId: form.customerId,
        internalNumber: form.internalNumber.trim(),
        fin: form.fin.trim() || null,
        licensePlate: form.licensePlate.trim() || null,
        brand: form.brand.trim(),
        model: form.model.trim(),
        modelVariant: form.modelVariant.trim() || null,
        buildYear: form.buildYear.trim() ? Number(form.buildYear) : null,
        engineCode: form.engineCode.trim() || null,
        transmission: form.transmission.trim() || null,
        fuelType: form.fuelType.trim() || null,
        color: form.color.trim() || null,
        currentKm,
        stockPowerHp: form.stockPowerHp.trim() ? Number(form.stockPowerHp) : null,
        currentPowerHp: form.currentPowerHp.trim() ? Number(form.currentPowerHp) : null,
        softwareStage: form.softwareStage.trim() || null,
        notes: form.notes.trim() || null,
      });

      resetForm();
      setShowCreateForm(false);
      await loadVehicles();
    } catch (error: any) {
      setCreateError(
        error?.response?.data?.title ||
          error?.response?.data ||
          "Fahrzeug konnte nicht angelegt werden."
      );
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <div className="page-stack">
      <div className="page-header">
        <div>
          <h1>Fahrzeuge</h1>
          <p>Verwalte Fahrzeuge, Kundenzuordnung und technische Fahrzeugdaten.</p>
        </div>

        <button
          type="button"
          onClick={() => {
            setShowCreateForm((prev) => {
              const nextOpenState = !prev;

              if (nextOpenState) {
                setForm({ ...initialForm, internalNumber: nextVehicleInternalNumber });
              }

              return nextOpenState;
            });
            setCreateError("");
            setVinError("");
            setVinInfo(null);
          }}
        >
          {showCreateForm ? "Formular schließen" : "Neues Fahrzeug"}
        </button>
      </div>

      <div className="card">
        <label className="field">
          <span>Suche</span>
          <input
            type="text"
            placeholder="Suche nach interner Nummer, FIN, Kennzeichen, Marke, Modell oder Kunde..."
            value={query}
            onChange={(event) => setQuery(event.target.value)}
          />
        </label>
      </div>

      {showCreateForm ? (
        <form className="card page-stack" onSubmit={handleCreateVehicle}>
          <h2>Neues Fahrzeug anlegen</h2>

          <div className="form-grid">
            <label className="field">
              <span>Kunde *</span>
              <select
                value={form.customerId}
                onChange={(event) => updateForm("customerId", event.target.value)}
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
              <span>Interne Nummer</span>
              <input value={form.internalNumber} readOnly />
            </label>

            <label className="field">
              <span>Kennzeichen</span>
              <input
                value={form.licensePlate}
                onChange={(event) => updateForm("licensePlate", event.target.value)}
                placeholder="S-RS-123"
              />
            </label>

            <div className="field">
              <span>FIN</span>
              <div className="inline-action">
                <input
                  value={form.fin}
                  onChange={(event) => updateForm("fin", event.target.value.toUpperCase())}
                  placeholder="z. B. WVWZZZ3HZNE000001"
                />
                <button
                  type="button"
                  className="secondary"
                  onClick={handleDecodeVin}
                  disabled={isDecodingVin}
                >
                  {isDecodingVin ? "Prüfe..." : "FIN decodieren"}
                </button>
              </div>
            </div>

            <label className="field">
              <span>Marke *</span>
              <input
                value={form.brand}
                onChange={(event) => updateForm("brand", event.target.value)}
                placeholder="Volkswagen"
              />
            </label>

            <label className="field">
              <span>Modell *</span>
              <input
                value={form.model}
                onChange={(event) => updateForm("model", event.target.value)}
                placeholder="Arteon R Shooting Brake"
              />
            </label>

            <label className="field">
              <span>Modellvariante</span>
              <input
                value={form.modelVariant}
                onChange={(event) => updateForm("modelVariant", event.target.value)}
              />
            </label>

            <label className="field">
              <span>Baujahr</span>
              <input
                type="number"
                value={form.buildYear}
                onChange={(event) => updateForm("buildYear", event.target.value)}
              />
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
              <span>Kraftstoff</span>
              <input
                value={form.fuelType}
                onChange={(event) => updateForm("fuelType", event.target.value)}
              />
            </label>

            <label className="field">
              <span>Farbe</span>
              <input
                value={form.color}
                onChange={(event) => updateForm("color", event.target.value)}
              />
            </label>

            <label className="field">
              <span>KM-Stand *</span>
              <input
                type="number"
                value={form.currentKm}
                onChange={(event) => updateForm("currentKm", event.target.value)}
              />
            </label>

            <label className="field">
              <span>Leistung Serie (PS)</span>
              <input
                type="number"
                value={form.stockPowerHp}
                onChange={(event) => updateForm("stockPowerHp", event.target.value)}
              />
            </label>

            <label className="field">
              <span>Leistung aktuell (PS)</span>
              <input
                type="number"
                value={form.currentPowerHp}
                onChange={(event) => updateForm("currentPowerHp", event.target.value)}
              />
            </label>

            <label className="field">
              <span>Software Stage</span>
              <input
                value={form.softwareStage}
                onChange={(event) => updateForm("softwareStage", event.target.value)}
                placeholder="z. B. Stage 3"
              />
            </label>
          </div>

          {vinError ? <div className="error-box">{vinError}</div> : null}

          {vinInfo ? (
            <div className="card page-stack">
              <h3>FIN-Auswertung</h3>

              <div className="detail-grid">
                <div>
                  <strong>FIN gültig:</strong>
                  <br />
                  {vinInfo.isValid ? "Ja" : "Nein"}
                </div>

                <div>
                  <strong>Hersteller:</strong>
                  <br />
                  {vinInfo.manufacturer || "-"}
                </div>

                <div>
                  <strong>Land:</strong>
                  <br />
                  {vinInfo.country || "-"}
                </div>

                <div>
                  <strong>WMI:</strong>
                  <br />
                  {vinInfo.wmi || "-"}
                </div>

                <div>
                  <strong>Modelljahr:</strong>
                  <br />
                  {vinInfo.modelYear ?? "-"}
                </div>

                <div>
                  <strong>Werkcode:</strong>
                  <br />
                  {vinInfo.plantCode || "-"}
                </div>

                <div>
                  <strong>Seriennummer:</strong>
                  <br />
                  {vinInfo.serialNumber || "-"}
                </div>

                <div>
                  <strong>Prüfziffer korrekt:</strong>
                  <br />
                  {vinInfo.checkDigitValid ? "Ja" : "Nein"}
                </div>
              </div>
            </div>
          ) : null}

          <label className="field">
            <span>Notizen</span>
            <textarea
              rows={4}
              value={form.notes}
              onChange={(event) => updateForm("notes", event.target.value)}
            />
          </label>

          {createError ? <div className="error-box">{createError}</div> : null}

          <div className="actions">
            <button type="submit" disabled={isSubmitting}>
              {isSubmitting ? "Speichern..." : "Fahrzeug speichern"}
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
          <h2>Fahrzeugliste</h2>
          <span>{filteredItems.length} Einträge</span>
        </div>

        {loading ? <p>Lade Fahrzeuge...</p> : null}
        {loadingError ? <div className="error-box">{loadingError}</div> : null}

        {!loading && !loadingError ? (
          filteredItems.length > 0 ? (
            <div className="table-wrap">
              <table className="data-table">
                <thead>
                  <tr>
                    <th>Intern</th>
                    <th>Kunde</th>
                    <th>Kennzeichen</th>
                    <th>Marke</th>
                    <th>Modell</th>
                    <th>Stage</th>
                    <th>KM</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredItems.map((item) => (
                    <tr key={item.id}>
                      <td>
                        <Link to={`/vehicles/${item.id}`} className="table-link">
                          {item.internalNumber}
                        </Link>
                      </td>
                      <td>{item.customerName}</td>
                      <td>{item.licensePlate || "-"}</td>
                      <td>{item.brand}</td>
                      <td>
                        {item.model}
                        {item.modelVariant ? ` ${item.modelVariant}` : ""}
                      </td>
                      <td>{item.softwareStage || "-"}</td>
                      <td>{item.currentKm}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <p>Keine Fahrzeuge vorhanden.</p>
          )
        ) : null}
      </div>
    </div>
  );
}
