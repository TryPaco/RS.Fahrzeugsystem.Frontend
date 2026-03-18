import { http } from "./http";
import type { VehicleCatalogEntry, VehicleCatalogUpsertRequest } from "../types/vehicleCatalog";

function mapPayload(input: VehicleCatalogUpsertRequest) {
  return {
    brand: input.brand.trim(),
    model: input.model.trim(),
    variant: input.variant.trim() || null,
    yearLabel: input.yearLabel.trim() || null,
    buildYearFrom: input.buildYearFrom.trim() ? Number(input.buildYearFrom) : null,
    buildYearTo: input.buildYearTo.trim() ? Number(input.buildYearTo) : null,
    engine: input.engine.trim() || null,
    engineCode: input.engineCode.trim() || null,
    transmission: input.transmission.trim() || null,
    transmissionCode: input.transmissionCode.trim() || null,
    ecuType: input.ecuType.trim() || null,
    ecuManufacturer: input.ecuManufacturer.trim() || null,
    driveType: input.driveType.trim() || null,
    platform: input.platform.trim() || null,
    notes: input.notes.trim() || null,
    isActive: input.isActive,
  };
}

export async function getVehicleCatalog(includeInactive = false) {
  const response = await http.get<VehicleCatalogEntry[]>("/vehicle-catalog", {
    params: { includeInactive },
  });
  return response.data;
}

export async function createVehicleCatalogEntry(input: VehicleCatalogUpsertRequest) {
  const response = await http.post<VehicleCatalogEntry>("/vehicle-catalog", mapPayload(input));
  return response.data;
}

export async function updateVehicleCatalogEntry(id: string, input: VehicleCatalogUpsertRequest) {
  const response = await http.put<VehicleCatalogEntry>(`/vehicle-catalog/${id}`, mapPayload(input));
  return response.data;
}

export async function deleteVehicleCatalogEntry(id: string) {
  await http.delete(`/vehicle-catalog/${id}`);
}
