export type VehicleLabel = {
    id: string;
    code: string;
    prefix: string;
    codeNumber: number;
    positionOnVehicle?: string | null;
    assignedAtUtc?: string | null;
    notes?: string | null;
};

export type VehicleDetail = {
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
    labels?: VehicleLabel[];
};

export type HistoryItem = {
    id: string;
    eventType: string;
    title: string;
    description?: string | null;
    eventDateUtc: string;
    kmRequired: boolean;
    kmValue: number;
};

export type PartItem = {
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

export type FreeLabelItem = {
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

export type CustomerListItem = {
    id: string;
    customerNumber: string;
    companyName?: string | null;
    firstName: string;
    lastName: string;
};

export type EditFormState = {
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

export type HistoryFormState = {
    eventType: string;
    title: string;
    description: string;
    eventDateUtc: string;
    kmValue: string;
    kmRequired: boolean;
};

export type PartFormState = {
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

export function formatDate(value?: string | null) {
    if (!value) return "-";
    return new Date(value).toLocaleString("de-DE");
}

export function mapVehicleToEditForm(v: VehicleDetail): EditFormState {
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

export function createInitialHistoryForm(): HistoryFormState {
    return {
        eventType: "Service",
        title: "",
        description: "",
        eventDateUtc: new Date().toISOString().slice(0, 16),
        kmValue: "",
        kmRequired: true,
    };
}

export function createInitialPartForm(currentKm?: number): PartFormState {
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
