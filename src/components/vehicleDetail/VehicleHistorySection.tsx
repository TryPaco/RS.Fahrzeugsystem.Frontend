import { formatDate, type HistoryFormState, type HistoryItem } from "../../pages/vehicleDetailTypes";

type VehicleHistorySectionProps = {
    historyItems: HistoryItem[];
    historyLoading: boolean;
    historyError: string;
    showHistoryForm: boolean;
    historyForm: HistoryFormState;
    historySaveError: string;
    isSavingHistory: boolean;
    editingHistoryId: string | null;
    onToggleForm: () => void;
    onUpdateHistoryForm: (key: keyof HistoryFormState, value: string | boolean) => void;
    onCreateHistory: () => void;
    onCancelCreateHistory: () => void;
    onEditHistoryTitle: (historyId: string, value: string) => void;
    onStartEditHistory: (historyId: string) => void;
    onUpdateHistory: (entry: HistoryItem) => void;
    onCancelEditHistory: () => void;
    onDeleteHistory: (historyId: string) => void;
};

export function VehicleHistorySection({
    historyItems,
    historyLoading,
    historyError,
    showHistoryForm,
    historyForm,
    historySaveError,
    isSavingHistory,
    editingHistoryId,
    onToggleForm,
    onUpdateHistoryForm,
    onCreateHistory,
    onCancelCreateHistory,
    onEditHistoryTitle,
    onStartEditHistory,
    onUpdateHistory,
    onCancelEditHistory,
    onDeleteHistory,
}: VehicleHistorySectionProps) {
    return (
        <div className="card page-stack">
            <div className="section-title">
                <h2>Historie</h2>
                <div className="actions">
                    <span>{historyItems.length} Einträge</span>
                    <button type="button" onClick={onToggleForm}>
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
                                onChange={(e) => onUpdateHistoryForm("eventType", e.target.value)}
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
                                onChange={(e) => onUpdateHistoryForm("eventDateUtc", e.target.value)}
                            />
                        </label>

                        <label className="field">
                            <span>Titel *</span>
                            <input
                                value={historyForm.title}
                                onChange={(e) => onUpdateHistoryForm("title", e.target.value)}
                                placeholder="z. B. Ölwechsel durchgeführt"
                            />
                        </label>

                        <label className="field">
                            <span>KM-Stand *</span>
                            <input
                                type="number"
                                value={historyForm.kmValue}
                                onChange={(e) => onUpdateHistoryForm("kmValue", e.target.value)}
                            />
                        </label>

                        <label className="field">
                            <span>KM erforderlich</span>
                            <select
                                value={historyForm.kmRequired ? "true" : "false"}
                                onChange={(e) => onUpdateHistoryForm("kmRequired", e.target.value === "true")}
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
                            onChange={(e) => onUpdateHistoryForm("description", e.target.value)}
                            placeholder="Details zum Service, Umbau oder Hinweis..."
                        />
                    </label>

                    {historySaveError ? <div className="error-box">{historySaveError}</div> : null}

                    <div className="actions">
                        <button type="button" onClick={onCreateHistory} disabled={isSavingHistory}>
                            {isSavingHistory ? "Speichern..." : "Historie speichern"}
                        </button>

                        <button type="button" className="secondary" onClick={onCancelCreateHistory}>
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
                                        <td>
                                            {editingHistoryId === entry.id ? (
                                                <input
                                                    value={entry.title}
                                                    onChange={(e) => onEditHistoryTitle(entry.id, e.target.value)}
                                                />
                                            ) : entry.title}
                                        </td>
                                        <td>{entry.eventType}</td>
                                        <td>{entry.kmValue}</td>
                                        <td>{entry.description || "-"}</td>
                                        <td>
                                            {editingHistoryId === entry.id ? (
                                                <>
                                                    <button
                                                        className="secondary"
                                                        onClick={() => onUpdateHistory(entry)}
                                                    >
                                                        Speichern
                                                    </button>

                                                    <button
                                                        className="secondary"
                                                        onClick={onCancelEditHistory}
                                                    >
                                                        Abbrechen
                                                    </button>
                                                </>
                                            ) : (
                                                <>
                                                    <button
                                                        className="secondary"
                                                        onClick={() => onStartEditHistory(entry.id)}
                                                    >
                                                        Bearbeiten
                                                    </button>

                                                    <button
                                                        className="secondary"
                                                        onClick={() => onDeleteHistory(entry.id)}
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
                ) : (
                    <p>Keine Historie vorhanden.</p>
                )
            ) : null}
        </div>
    );
}
