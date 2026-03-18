import type { PartFormState, PartItem } from "../../pages/vehicleDetailTypes";

type VehiclePartsSectionProps = {
    partsItems: PartItem[];
    partsLoading: boolean;
    partsError: string;
    showPartForm: boolean;
    partForm: PartFormState;
    partSaveError: string;
    isSavingPart: boolean;
    editingPartId: string | null;
    onToggleForm: () => void;
    onUpdatePartForm: (key: keyof PartFormState, value: string) => void;
    onCreatePart: () => void;
    onCancelCreatePart: () => void;
    onEditPartName: (partId: string, value: string) => void;
    onStartEditPart: (partId: string) => void;
    onUpdatePart: (part: PartItem) => void;
    onCancelEditPart: () => void;
    onDeletePart: (partId: string) => void;
};

export function VehiclePartsSection({
    partsItems,
    partsLoading,
    partsError,
    showPartForm,
    partForm,
    partSaveError,
    isSavingPart,
    editingPartId,
    onToggleForm,
    onUpdatePartForm,
    onCreatePart,
    onCancelCreatePart,
    onEditPartName,
    onStartEditPart,
    onUpdatePart,
    onCancelEditPart,
    onDeletePart,
}: VehiclePartsSectionProps) {
    return (
        <div className="card page-stack">
            <div className="section-title">
                <h2>Teile / Umbauten</h2>
                <div className="actions">
                    <span>{partsItems.length} Einträge</span>
                    <button type="button" onClick={onToggleForm}>
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
                                onChange={(e) => onUpdatePartForm("name", e.target.value)}
                                placeholder="z. B. Downpipe / Turbo / LLK"
                            />
                        </label>

                        <label className="field">
                            <span>Hersteller</span>
                            <input
                                value={partForm.manufacturer}
                                onChange={(e) => onUpdatePartForm("manufacturer", e.target.value)}
                                placeholder="z. B. Wagner / TTE / HJS"
                            />
                        </label>

                        <label className="field">
                            <span>Teilenummer</span>
                            <input
                                value={partForm.partNumber}
                                onChange={(e) => onUpdatePartForm("partNumber", e.target.value)}
                            />
                        </label>

                        <label className="field">
                            <span>Seriennummer</span>
                            <input
                                value={partForm.serialNumber}
                                onChange={(e) => onUpdatePartForm("serialNumber", e.target.value)}
                            />
                        </label>

                        <label className="field">
                            <span>Einbaudatum *</span>
                            <input
                                type="datetime-local"
                                value={partForm.installedAtUtc}
                                onChange={(e) => onUpdatePartForm("installedAtUtc", e.target.value)}
                            />
                        </label>

                        <label className="field">
                            <span>Einbau-KM *</span>
                            <input
                                type="number"
                                value={partForm.installedKm}
                                onChange={(e) => onUpdatePartForm("installedKm", e.target.value)}
                            />
                        </label>

                        <label className="field">
                            <span>Status</span>
                            <select
                                value={partForm.status}
                                onChange={(e) => onUpdatePartForm("status", e.target.value)}
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
                                onChange={(e) => onUpdatePartForm("categoryId", e.target.value)}
                                placeholder="Optional"
                            />
                        </label>
                    </div>

                    <label className="field">
                        <span>Notizen</span>
                        <textarea
                            rows={4}
                            value={partForm.notes}
                            onChange={(e) => onUpdatePartForm("notes", e.target.value)}
                            placeholder="Zusätzliche Infos zum Umbau / Teil..."
                        />
                    </label>

                    {partSaveError ? <div className="error-box">{partSaveError}</div> : null}

                    <div className="actions">
                        <button type="button" onClick={onCreatePart} disabled={isSavingPart}>
                            {isSavingPart ? "Speichern..." : "Teil / Umbau speichern"}
                        </button>

                        <button type="button" className="secondary" onClick={onCancelCreatePart}>
                            Abbrechen
                        </button>
                    </div>
                </div>
            ) : null}

            {partsLoading ? <p>Lade Teile / Umbauten...</p> : null}
            {partsError ? <div className="error-box">{partsError}</div> : null}

            {!partsLoading && !partsError ? (
                partsItems.length > 0 ? (
                    <>
                        <div className="table-wrap desktop-table">
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
                                            <td>
                                                {editingPartId === part.id ? (
                                                    <input
                                                        value={part.name}
                                                        onChange={(e) => onEditPartName(part.id, e.target.value)}
                                                    />
                                                ) : part.name}
                                            </td>

                                            <td>{part.manufacturer || "-"}</td>
                                            <td>{part.partNumber || "-"}</td>
                                            <td>{part.serialNumber || "-"}</td>
                                            <td>{part.installedKm}</td>
                                            <td>{part.status || "-"}</td>
                                            <td>{part.notes || "-"}</td>

                                            <td>
                                                {editingPartId === part.id ? (
                                                    <>
                                                        <button
                                                            className="secondary"
                                                            onClick={() => onUpdatePart(part)}
                                                        >
                                                            Speichern
                                                        </button>

                                                        <button
                                                            className="secondary"
                                                            onClick={onCancelEditPart}
                                                        >
                                                            Abbrechen
                                                        </button>
                                                    </>
                                                ) : (
                                                    <>
                                                        <button
                                                            className="secondary"
                                                            onClick={() => onStartEditPart(part.id)}
                                                        >
                                                            Bearbeiten
                                                        </button>

                                                        <button
                                                            className="secondary"
                                                            onClick={() => onDeletePart(part.id)}
                                                        >
                                                            Löschen
                                                        </button>
                                                    </>
                                                )}
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>

                        <div className="mobile-card-list">
                            {partsItems.map((part) => (
                                <article key={part.id} className="mobile-data-card">
                                    <div className="mobile-data-card-header">
                                        <strong>{part.name}</strong>
                                        <span>{part.status || "-"}</span>
                                    </div>
                                    <p>{part.manufacturer || "Kein Hersteller hinterlegt"}</p>
                                    <div className="mobile-data-card-grid">
                                        <div>
                                            <strong>Teilenummer</strong>
                                            <span>{part.partNumber || "-"}</span>
                                        </div>
                                        <div>
                                            <strong>Seriennummer</strong>
                                            <span>{part.serialNumber || "-"}</span>
                                        </div>
                                        <div>
                                            <strong>Einbau-KM</strong>
                                            <span>{part.installedKm}</span>
                                        </div>
                                        <div>
                                            <strong>Notizen</strong>
                                            <span>{part.notes || "-"}</span>
                                        </div>
                                    </div>
                                    <div className="mobile-data-card-actions">
                                        {editingPartId === part.id ? (
                                            <>
                                                <button
                                                    type="button"
                                                    className="secondary"
                                                    onClick={() => onUpdatePart(part)}
                                                >
                                                    Speichern
                                                </button>
                                                <button
                                                    type="button"
                                                    className="secondary"
                                                    onClick={onCancelEditPart}
                                                >
                                                    Abbrechen
                                                </button>
                                            </>
                                        ) : (
                                            <>
                                                <button
                                                    type="button"
                                                    className="secondary"
                                                    onClick={() => onStartEditPart(part.id)}
                                                >
                                                    Bearbeiten
                                                </button>
                                                <button
                                                    type="button"
                                                    className="secondary"
                                                    onClick={() => onDeletePart(part.id)}
                                                >
                                                    Löschen
                                                </button>
                                            </>
                                        )}
                                    </div>
                                </article>
                            ))}
                        </div>
                    </>
                ) : (
                    <p>Keine Teile vorhanden.</p>
                )
            ) : null}
        </div>
    );
}
