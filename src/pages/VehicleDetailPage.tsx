import { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { http } from "../api/http";
import { VehicleDataSection } from "../components/vehicleDetail/VehicleDataSection";
import { VehicleHeader } from "../components/vehicleDetail/VehicleHeader";
import { VehicleHistorySection } from "../components/vehicleDetail/VehicleHistorySection";
import {
    VehicleCustomerSection,
    VehicleLabelsSection,
} from "../components/vehicleDetail/VehicleMetaSections";
import { VehiclePartsSection } from "../components/vehicleDetail/VehiclePartsSection";
import {
    createInitialHistoryForm,
    createInitialPartForm,
    mapVehicleToEditForm,
    type CustomerListItem,
    type EditFormState,
    type FreeLabelItem,
    type HistoryFormState,
    type HistoryItem,
    type PartFormState,
    type PartItem,
    type VehicleDetail,
} from "./vehicleDetailTypes";

export function VehicleDetailPage() {
    const { id } = useParams();
    const navigate = useNavigate();

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
    const [isDeleting, setIsDeleting] = useState(false);
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

    const [editingHistoryId, setEditingHistoryId] = useState<string | null>(null);
    const [editingPartId, setEditingPartId] = useState<string | null>(null);

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

        void loadVehicle();
        void loadFreeLabels();
        void loadCustomers();
        void loadHistory();
        void loadParts();
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
            `Label ${code} wirklich vom Fahrzeug entfernen?\n\nDiese Aktion kann später durch erneutes Zuweisen rückgängig gemacht werden.`
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

    async function handleDeleteVehicle() {
        if (!item) return;

        const confirmed = window.confirm(
            `Fahrzeug ${item.internalNumber} wirklich löschen?\n\nDiese Aktion kann nicht rückgängig gemacht werden.`
        );

        if (!confirmed) return;

        setSaveError("");
        setIsDeleting(true);

        try {
            await http.delete(`/vehicles/${item.id}`);
            navigate("/vehicles");
        } catch (err: any) {
            setSaveError(
                err?.response?.data?.title ||
                err?.response?.data ||
                "Fahrzeug konnte nicht gelöscht werden."
            );
        } finally {
            setIsDeleting(false);
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
        const confirmed = window.confirm("Diesen Historieneintrag wirklich löschen?");

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

    async function handleUpdateHistory(entry: HistoryItem) {
        try {
            await http.put(`/history/${entry.id}`, {
                eventType: entry.eventType,
                title: entry.title,
                description: entry.description || null,
                eventDateUtc: entry.eventDateUtc,
                kmRequired: entry.kmRequired,
                kmValue: entry.kmValue,
            });

            setEditingHistoryId(null);

            await loadHistory();
            await loadVehicle();
        } catch (err: any) {
            setHistoryError(
                err?.response?.data?.title ||
                err?.response?.data ||
                "Historie konnte nicht aktualisiert werden."
            );
        }
    }

    async function handleCancelHistoryEdit() {
        await loadHistory();
        setEditingHistoryId(null);
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
        const confirmed = window.confirm("Diesen Teile-/Umbau-Eintrag wirklich löschen?");

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

    async function handleUpdatePart(part: PartItem) {
        try {
            await http.put(`/parts/${part.id}`, {
                categoryId: part.categoryId || null,
                name: part.name,
                manufacturer: part.manufacturer || null,
                partNumber: part.partNumber || null,
                serialNumber: part.serialNumber || null,
                installedAtUtc: part.installedAtUtc,
                installedKm: part.installedKm,
                status: part.status || null,
                notes: part.notes || null,
            });

            setEditingPartId(null);

            await loadParts();
            await loadHistory();
        } catch (err: any) {
            setPartsError(
                err?.response?.data?.title ||
                err?.response?.data ||
                "Teil konnte nicht aktualisiert werden."
            );
        }
    }

    async function handleCancelPartEdit() {
        await loadParts();
        setEditingPartId(null);
    }

    function cancelEdit() {
        if (item) {
            setEditForm(mapVehicleToEditForm(item));
        }
        setSaveError("");
        setIsEditing(false);
    }

    function handleEditPartName(partId: string, value: string) {
        setPartsItems((prev) =>
            prev.map((part) => (part.id === partId ? { ...part, name: value } : part))
        );
    }

    function handleEditHistoryTitle(historyId: string, value: string) {
        setHistoryItems((prev) =>
            prev.map((entry) => (entry.id === historyId ? { ...entry, title: value } : entry))
        );
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
            <VehicleHeader
                item={item}
                isEditing={isEditing}
                isSaving={isSaving}
                isDeleting={isDeleting}
                onStartEdit={() => setIsEditing(true)}
                onSave={handleSaveVehicle}
                onCancel={cancelEdit}
                onDelete={() => void handleDeleteVehicle()}
            />

            {saveError && !isEditing ? <div className="error-box">{saveError}</div> : null}

            <VehicleDataSection
                item={item}
                customers={customers}
                isEditing={isEditing}
                editForm={editForm}
                saveError={saveError}
                onUpdateField={(key, value) =>
                    updateEditForm(key, value as EditFormState[typeof key])
                }
            />

            <VehicleCustomerSection item={item} customerName={customerName} />

            <VehicleLabelsSection
                item={item}
                freeLabels={freeLabels}
                assignCode={assignCode}
                assignPosition={assignPosition}
                assignError={assignError}
                isAssigning={isAssigning}
                onAssignCodeChange={setAssignCode}
                onAssignPositionChange={setAssignPosition}
                onAssign={assignLabelToVehicle}
                onUnassign={unassignLabelFromVehicle}
            />

            <VehiclePartsSection
                partsItems={partsItems}
                partsLoading={partsLoading}
                partsError={partsError}
                showPartForm={showPartForm}
                partForm={partForm}
                partSaveError={partSaveError}
                isSavingPart={isSavingPart}
                editingPartId={editingPartId}
                onToggleForm={() => {
                    setShowPartForm((prev) => !prev);
                    setPartSaveError("");
                }}
                onUpdatePartForm={(key, value) => updatePartForm(key, value)}
                onCreatePart={handleCreatePart}
                onCancelCreatePart={() => {
                    setShowPartForm(false);
                    setPartSaveError("");
                    setPartForm(createInitialPartForm(item.currentKm));
                }}
                onEditPartName={handleEditPartName}
                onStartEditPart={setEditingPartId}
                onUpdatePart={handleUpdatePart}
                onCancelEditPart={() => void handleCancelPartEdit()}
                onDeletePart={handleDeletePart}
            />

            <VehicleHistorySection
                historyItems={historyItems}
                historyLoading={historyLoading}
                historyError={historyError}
                showHistoryForm={showHistoryForm}
                historyForm={historyForm}
                historySaveError={historySaveError}
                isSavingHistory={isSavingHistory}
                editingHistoryId={editingHistoryId}
                onToggleForm={() => {
                    setShowHistoryForm((prev) => !prev);
                    setHistorySaveError("");
                }}
                onUpdateHistoryForm={(key, value) =>
                    updateHistoryForm(key, value as HistoryFormState[typeof key])
                }
                onCreateHistory={handleCreateHistory}
                onCancelCreateHistory={() => {
                    setShowHistoryForm(false);
                    setHistorySaveError("");
                }}
                onEditHistoryTitle={handleEditHistoryTitle}
                onStartEditHistory={setEditingHistoryId}
                onUpdateHistory={handleUpdateHistory}
                onCancelEditHistory={() => void handleCancelHistoryEdit()}
                onDeleteHistory={handleDeleteHistory}
            />
        </div>
    );
}
