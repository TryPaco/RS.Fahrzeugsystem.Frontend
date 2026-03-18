import { FormEvent, useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { http } from "../api/http";
import { getVehicleCatalog } from "../api/vehicleCatalogApi";
import { useAuth } from "../contexts/AuthContext";
import type { VehicleCatalogEntry } from "../types/vehicleCatalog";

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

type VehicleCreateMode = "catalog" | "manual";

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

function getCatalogYearLabel(item: VehicleCatalogEntry) {
  return item.yearLabel || item.variant || "Ohne Jahresangabe";
}

function formatVariantLabel(item: VehicleCatalogEntry) {
  if (item.variant && item.yearLabel && item.variant !== item.yearLabel) {
    return `${item.variant} | ${item.yearLabel}`;
  }

  return item.variant || item.yearLabel || "";
}

function formatMotorLabel(item: VehicleCatalogEntry) {
  if (item.engine && item.engineCode) {
    return `${item.engine} - ${item.engineCode}`;
  }

  return item.engine || item.engineCode || "Motor auswählen";
}

export function VehiclesPage() {
  const { hasPermission } = useAuth();
  const canUseCatalog = hasPermission("vehiclecatalog.view");

  const [items, setItems] = useState<VehicleListItem[]>([]);
  const [customers, setCustomers] = useState<CustomerListItem[]>([]);
  const [catalogItems, setCatalogItems] = useState<VehicleCatalogEntry[]>([]);
  const [catalogLoading, setCatalogLoading] = useState(false);
  const [catalogError, setCatalogError] = useState("");
  const [loading, setLoading] = useState(true);
  const [loadingError, setLoadingError] = useState("");
  const [query, setQuery] = useState("");

  const [showCreateForm, setShowCreateForm] = useState(false);
  const [createMode, setCreateMode] = useState<VehicleCreateMode>(canUseCatalog ? "catalog" : "manual");
  const [form, setForm] = useState<CreateVehicleRequest>(initialForm);
  const [createError, setCreateError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [selectedCatalogBrand, setSelectedCatalogBrand] = useState("");
  const [selectedCatalogModel, setSelectedCatalogModel] = useState("");
  const [selectedCatalogYear, setSelectedCatalogYear] = useState("");
  const [selectedCatalogEntryId, setSelectedCatalogEntryId] = useState("");

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

  async function loadCatalog() {
    if (!canUseCatalog) {
      setCatalogItems([]);
      setCatalogError("");
      return;
    }

    setCatalogLoading(true);
    setCatalogError("");

    try {
      const data = await getVehicleCatalog(false);
      setCatalogItems(data);
    } catch (error: any) {
      setCatalogItems([]);
      setCatalogError(
        error?.response?.data?.title ||
          error?.response?.data ||
          "Fahrzeugkatalog konnte nicht geladen werden."
      );
    } finally {
      setCatalogLoading(false);
    }
  }

  useEffect(() => {
    void loadVehicles();
    void loadCustomers();
    void loadCatalog();
  }, [canUseCatalog]);

  useEffect(() => {
    if (!canUseCatalog) {
      setCreateMode("manual");
    }
  }, [canUseCatalog]);

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

  const catalogBrandOptions = useMemo(
    () => Array.from(new Set(catalogItems.map((item) => item.brand))).sort(),
    [catalogItems]
  );

  const catalogModelOptions = useMemo(() => {
    if (!selectedCatalogBrand) return [];

    return Array.from(
      new Set(
        catalogItems
          .filter((item) => item.brand === selectedCatalogBrand)
          .map((item) => item.model)
      )
    ).sort();
  }, [catalogItems, selectedCatalogBrand]);

  const catalogYearOptions = useMemo(() => {
    if (!selectedCatalogBrand || !selectedCatalogModel) return [];

    return Array.from(
      new Set(
        catalogItems
          .filter(
            (item) =>
              item.brand === selectedCatalogBrand && item.model === selectedCatalogModel
          )
          .map((item) => getCatalogYearLabel(item))
      )
    ).sort();
  }, [catalogItems, selectedCatalogBrand, selectedCatalogModel]);

  const catalogMotorOptions = useMemo(() => {
    if (!selectedCatalogBrand || !selectedCatalogModel || !selectedCatalogYear) return [];

    return catalogItems
      .filter(
        (item) =>
          item.brand === selectedCatalogBrand &&
          item.model === selectedCatalogModel &&
          getCatalogYearLabel(item) === selectedCatalogYear
      )
      .sort((a, b) => formatMotorLabel(a).localeCompare(formatMotorLabel(b), "de"));
  }, [catalogItems, selectedCatalogBrand, selectedCatalogModel, selectedCatalogYear]);

  const selectedCatalogEntry = useMemo(
    () => catalogItems.find((item) => item.id === selectedCatalogEntryId) ?? null,
    [catalogItems, selectedCatalogEntryId]
  );

  function updateForm<K extends keyof CreateVehicleRequest>(
    key: K,
    value: CreateVehicleRequest[K]
  ) {
    setForm((prev) => ({ ...prev, [key]: value }));
  }

  function applyCatalogBaseSelection(brand: string, model: string, yearLabel: string) {
    const matchingEntry = catalogItems.find(
      (item) =>
        item.brand === brand &&
        item.model === model &&
        getCatalogYearLabel(item) === yearLabel
    );

    setForm((prev) => ({
      ...prev,
      brand: brand || prev.brand,
      model: model || prev.model,
      modelVariant: matchingEntry ? formatVariantLabel(matchingEntry) : prev.modelVariant,
      buildYear: matchingEntry?.buildYearFrom ? String(matchingEntry.buildYearFrom) : prev.buildYear,
      engineCode: yearLabel ? "" : prev.engineCode,
      transmission: yearLabel ? "" : prev.transmission,
    }));
  }

  function applyCatalogEntry(entry: VehicleCatalogEntry | null) {
    setForm((prev) => ({
      ...prev,
      brand: entry?.brand ?? prev.brand,
      model: entry?.model ?? prev.model,
      modelVariant: entry ? formatVariantLabel(entry) : prev.modelVariant,
      buildYear: entry?.buildYearFrom ? String(entry.buildYearFrom) : prev.buildYear,
      engineCode: entry?.engineCode ?? prev.engineCode,
      transmission: entry?.transmission ?? prev.transmission,
      notes: prev.notes || entry?.notes || "",
    }));
  }

  function resetForm() {
    setForm({ ...initialForm, internalNumber: nextVehicleInternalNumber });
    setSelectedCatalogBrand("");
    setSelectedCatalogModel("");
    setSelectedCatalogYear("");
    setSelectedCatalogEntryId("");
    setCreateMode(canUseCatalog ? "catalog" : "manual");
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
                resetForm();
              }

              return nextOpenState;
            });
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

          {canUseCatalog ? (
            <div className="actions">
              <button
                type="button"
                className={createMode === "catalog" ? "" : "secondary"}
                onClick={() => setCreateMode("catalog")}
              >
                Auswahlliste
              </button>
              <button
                type="button"
                className={createMode === "manual" ? "" : "secondary"}
                onClick={() => setCreateMode("manual")}
              >
                Manuell
              </button>
            </div>
          ) : null}

          {canUseCatalog && createMode === "catalog" ? (
            <div className="card page-stack">
              <div className="section-title">
                <h3>Fahrzeug aus Katalog auswählen</h3>
                <span>{catalogItems.length} Einträge</span>
              </div>

              <p className="muted-text">
                Wähle zuerst Marke, dann Modell, danach Jahr beziehungsweise Generation und
                anschließend den Motor. Die Felder werden vorbelegt und können danach weiter
                manuell angepasst werden.
              </p>

              <div className="form-grid">
                <label className="field">
                  <span>Marke</span>
                  <select
                    value={selectedCatalogBrand}
                    onChange={(event) => {
                      const value = event.target.value;
                      setSelectedCatalogBrand(value);
                      setSelectedCatalogModel("");
                      setSelectedCatalogYear("");
                      setSelectedCatalogEntryId("");
                      applyCatalogBaseSelection(value, "", "");
                    }}
                    disabled={catalogLoading}
                  >
                    <option value="">Bitte auswählen</option>
                    {catalogBrandOptions.map((brand) => (
                      <option key={brand} value={brand}>
                        {brand}
                      </option>
                    ))}
                  </select>
                </label>

                <label className="field">
                  <span>Modell</span>
                  <select
                    value={selectedCatalogModel}
                    onChange={(event) => {
                      const value = event.target.value;
                      setSelectedCatalogModel(value);
                      setSelectedCatalogYear("");
                      setSelectedCatalogEntryId("");
                      applyCatalogBaseSelection(selectedCatalogBrand, value, "");
                    }}
                    disabled={catalogLoading || !selectedCatalogBrand}
                  >
                    <option value="">Bitte auswählen</option>
                    {catalogModelOptions.map((model) => (
                      <option key={model} value={model}>
                        {model}
                      </option>
                    ))}
                  </select>
                </label>

                <label className="field">
                  <span>Jahr / Generation</span>
                  <select
                    value={selectedCatalogYear}
                    onChange={(event) => {
                      const value = event.target.value;
                      setSelectedCatalogYear(value);
                      setSelectedCatalogEntryId("");
                      applyCatalogBaseSelection(selectedCatalogBrand, selectedCatalogModel, value);
                    }}
                    disabled={catalogLoading || !selectedCatalogModel}
                  >
                    <option value="">Bitte auswählen</option>
                    {catalogYearOptions.map((yearLabel) => (
                      <option key={yearLabel} value={yearLabel}>
                        {yearLabel}
                      </option>
                    ))}
                  </select>
                </label>

                <label className="field">
                  <span>Motor</span>
                  <select
                    value={selectedCatalogEntryId}
                    onChange={(event) => {
                      const value = event.target.value;
                      setSelectedCatalogEntryId(value);
                      const entry = catalogMotorOptions.find((item) => item.id === value) ?? null;
                      applyCatalogEntry(entry);
                    }}
                    disabled={catalogLoading || !selectedCatalogYear}
                  >
                    <option value="">Bitte auswählen</option>
                    {catalogMotorOptions.map((item) => (
                      <option key={item.id} value={item.id}>
                        {formatMotorLabel(item)}
                      </option>
                    ))}
                  </select>
                </label>
              </div>

              {catalogError ? <div className="warning-box">{catalogError}</div> : null}

              {selectedCatalogEntry ? (
                <div className="detail-grid">
                  <div><strong>Variante:</strong><br />{formatVariantLabel(selectedCatalogEntry) || "-"}</div>
                  <div><strong>Motor:</strong><br />{selectedCatalogEntry.engine || "-"}</div>
                  <div><strong>Motorcode:</strong><br />{selectedCatalogEntry.engineCode || "-"}</div>
                  <div><strong>Getriebe:</strong><br />{selectedCatalogEntry.transmission || "-"}</div>
                  <div><strong>Getriebecode:</strong><br />{selectedCatalogEntry.transmissionCode || "-"}</div>
                  <div><strong>Steuergerät:</strong><br />{selectedCatalogEntry.ecuType || "-"}</div>
                  <div><strong>ECU-Hersteller:</strong><br />{selectedCatalogEntry.ecuManufacturer || "-"}</div>
                  <div><strong>Antrieb:</strong><br />{selectedCatalogEntry.driveType || "-"}</div>
                  <div><strong>Plattform:</strong><br />{selectedCatalogEntry.platform || "-"}</div>
                </div>
              ) : null}
            </div>
          ) : null}

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
