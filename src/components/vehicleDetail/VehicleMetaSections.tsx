import type { FreeLabelItem, VehicleDetail } from "../../pages/vehicleDetailTypes";
import { formatDate } from "../../pages/vehicleDetailTypes";

type VehicleCustomerSectionProps = {
    item: VehicleDetail;
    customerName: string;
};

export function VehicleCustomerSection({ item, customerName }: VehicleCustomerSectionProps) {
    return (
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
    );
}

type VehicleLabelsSectionProps = {
    item: VehicleDetail;
    freeLabels: FreeLabelItem[];
    assignCode: string;
    assignPosition: string;
    assignError: string;
    isAssigning: boolean;
    onAssignCodeChange: (value: string) => void;
    onAssignPositionChange: (value: string) => void;
    onAssign: () => void;
    onUnassign: (code: string) => void;
};

export function VehicleLabelsSection({
    item,
    freeLabels,
    assignCode,
    assignPosition,
    assignError,
    isAssigning,
    onAssignCodeChange,
    onAssignPositionChange,
    onAssign,
    onUnassign,
}: VehicleLabelsSectionProps) {
    return (
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
                                            onClick={() => onUnassign(label.code)}
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
                    <select value={assignCode} onChange={(e) => onAssignCodeChange(e.target.value)}>
                        <option value="">Bitte auswählen</option>
                        {freeLabels.map((label) => (
                            <option key={label.id} value={label.code}>
                                {label.code} {label.prefix === "RS" ? "- RS-Engineers" : "- B-Tuning"}
                            </option>
                        ))}
                    </select>
                </label>

                <label className="field">
                    <span>Position</span>
                    <input
                        value={assignPosition}
                        onChange={(e) => onAssignPositionChange(e.target.value)}
                        placeholder="Motorraum / Türrahmen / Innenraum"
                    />
                </label>

                {assignError ? <div className="error-box">{assignError}</div> : null}

                <div className="actions">
                    <button type="button" onClick={onAssign} disabled={isAssigning}>
                        {isAssigning ? "Zuweisen..." : "Label zuweisen"}
                    </button>
                </div>
            </div>
        </div>
    );
}
