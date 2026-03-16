import type {
    CustomerListItem,
    EditFormState,
    VehicleDetail,
} from "../../pages/vehicleDetailTypes";

type VehicleDataSectionProps = {
    item: VehicleDetail;
    customers: CustomerListItem[];
    isEditing: boolean;
    editForm: EditFormState;
    saveError: string;
    onUpdateField: (key: keyof EditFormState, value: string | boolean) => void;
};

export function VehicleDataSection({
    item,
    customers,
    isEditing,
    editForm,
    saveError,
    onUpdateField,
}: VehicleDataSectionProps) {
    return (
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
                                onChange={(e) => onUpdateField("customerId", e.target.value)}
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
                            <input
                                value={editForm.internalNumber}
                                readOnly
                            />
                        </label>

                        <label className="field">
                            <span>Kennzeichen</span>
                            <input
                                value={editForm.licensePlate}
                                onChange={(e) => onUpdateField("licensePlate", e.target.value)}
                            />
                        </label>

                        <label className="field">
                            <span>FIN</span>
                            <input
                                value={editForm.fin}
                                onChange={(e) => onUpdateField("fin", e.target.value.toUpperCase())}
                            />
                        </label>

                        <label className="field">
                            <span>Marke *</span>
                            <input
                                value={editForm.brand}
                                onChange={(e) => onUpdateField("brand", e.target.value)}
                            />
                        </label>

                        <label className="field">
                            <span>Modell *</span>
                            <input
                                value={editForm.model}
                                onChange={(e) => onUpdateField("model", e.target.value)}
                            />
                        </label>

                        <label className="field">
                            <span>Modellvariante</span>
                            <input
                                value={editForm.modelVariant}
                                onChange={(e) => onUpdateField("modelVariant", e.target.value)}
                            />
                        </label>

                        <label className="field">
                            <span>Baujahr</span>
                            <input
                                type="number"
                                value={editForm.buildYear}
                                onChange={(e) => onUpdateField("buildYear", e.target.value)}
                            />
                        </label>

                        <label className="field">
                            <span>Motorcode</span>
                            <input
                                value={editForm.engineCode}
                                onChange={(e) => onUpdateField("engineCode", e.target.value)}
                            />
                        </label>

                        <label className="field">
                            <span>Getriebe</span>
                            <input
                                value={editForm.transmission}
                                onChange={(e) => onUpdateField("transmission", e.target.value)}
                            />
                        </label>

                        <label className="field">
                            <span>Kraftstoff</span>
                            <input
                                value={editForm.fuelType}
                                onChange={(e) => onUpdateField("fuelType", e.target.value)}
                            />
                        </label>

                        <label className="field">
                            <span>Farbe</span>
                            <input
                                value={editForm.color}
                                onChange={(e) => onUpdateField("color", e.target.value)}
                            />
                        </label>

                        <label className="field">
                            <span>KM-Stand *</span>
                            <input
                                type="number"
                                value={editForm.currentKm}
                                onChange={(e) => onUpdateField("currentKm", e.target.value)}
                            />
                        </label>

                        <label className="field">
                            <span>Leistung Serie (PS)</span>
                            <input
                                type="number"
                                value={editForm.stockPowerHp}
                                onChange={(e) => onUpdateField("stockPowerHp", e.target.value)}
                            />
                        </label>

                        <label className="field">
                            <span>Leistung aktuell (PS)</span>
                            <input
                                type="number"
                                value={editForm.currentPowerHp}
                                onChange={(e) => onUpdateField("currentPowerHp", e.target.value)}
                            />
                        </label>

                        <label className="field">
                            <span>Software Stage</span>
                            <input
                                value={editForm.softwareStage}
                                onChange={(e) => onUpdateField("softwareStage", e.target.value)}
                            />
                        </label>

                        <label className="field">
                            <span>Archiviert</span>
                            <select
                                value={editForm.isArchived ? "true" : "false"}
                                onChange={(e) => onUpdateField("isArchived", e.target.value === "true")}
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
                            onChange={(e) => onUpdateField("notes", e.target.value)}
                        />
                    </label>

                    {saveError ? <div className="error-box">{saveError}</div> : null}
                </div>
            )}
        </div>
    );
}
