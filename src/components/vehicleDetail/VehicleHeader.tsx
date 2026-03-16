import { Link } from "react-router-dom";
import type { VehicleDetail } from "../../pages/vehicleDetailTypes";

type VehicleHeaderProps = {
    item: VehicleDetail;
    isEditing: boolean;
    isSaving: boolean;
    isDeleting: boolean;
    onStartEdit: () => void;
    onSave: () => void;
    onCancel: () => void;
    onDelete: () => void;
};

export function VehicleHeader({
    item,
    isEditing,
    isSaving,
    isDeleting,
    onStartEdit,
    onSave,
    onCancel,
    onDelete,
}: VehicleHeaderProps) {
    return (
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
                    <button type="button" onClick={onStartEdit} disabled={isDeleting}>
                        Fahrzeug bearbeiten
                    </button>
                ) : (
                    <>
                        <button type="button" onClick={onSave} disabled={isSaving}>
                            {isSaving ? "Speichern..." : "Speichern"}
                        </button>
                        <button type="button" className="secondary" onClick={onCancel}>
                            Abbrechen
                        </button>
                    </>
                )}
                <button
                    type="button"
                    className="secondary"
                    onClick={onDelete}
                    disabled={isDeleting || isSaving}
                >
                    {isDeleting ? "Löschen..." : "Fahrzeug löschen"}
                </button>
            </div>
        </div>
    );
}
