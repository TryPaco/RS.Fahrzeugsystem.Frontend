import { http } from "./http";
import type { SmtpSettings, UpdateSmtpSettingsRequest } from "../types/settings";

export async function getSmtpSettings() {
  const response = await http.get<SmtpSettings>("/settings/smtp");
  return response.data;
}

export async function updateSmtpSettings(payload: UpdateSmtpSettingsRequest) {
  await http.put("/settings/smtp", payload);
}
