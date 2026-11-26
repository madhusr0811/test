import { HttpError } from "./http";

const DATE = /^\d{4}-\d{2}-\d{2}$/;

export function resolveExpiry(body: { expiryDays?: unknown; customDate?: unknown }): string {
  let d: Date;
  if (typeof body.customDate === "string" && DATE.test(body.customDate)) {
    d = new Date(`${body.customDate}T23:59:59`);
  } else if ([7, 15, 30].includes(Number(body.expiryDays))) {
    d = new Date(Date.now() + Number(body.expiryDays) * 86_400_000);
  } else throw new HttpError(400, "Choose an expiry");
  if (isNaN(d.getTime()) || d.getTime() <= Date.now()) throw new HttpError(400, "Expiry must be in the future");
  return d.toISOString();
}
