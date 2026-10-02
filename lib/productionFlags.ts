export type ProductionFlag =
  | "NOTIFY_DISABLED"
  | "SMS_DISABLED"
  | "PUSH_DISABLED"
  | "MAINTENANCE_MODE";

function getEnvFlag(name: ProductionFlag) {
  const value = process.env[name]?.trim().toLowerCase();

  return value === "1" || value === "true" || value === "yes";
}

export function isNotifyDisabled() {
  return getEnvFlag("NOTIFY_DISABLED");
}

export function isSmsDisabled() {
  return getEnvFlag("SMS_DISABLED");
}

export function isPushDisabled() {
  return getEnvFlag("PUSH_DISABLED");
}
export function isMaintenanceMode() {
  return getEnvFlag("MAINTENANCE_MODE");
}