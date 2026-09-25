export function sanitizeForLog(value: string): string {
  return value.replace(/[\r\n]/g, "");
}
