export const SQFT_PER_CENT = 435.6;
export const CENTS_PER_ACRE = 100;

export function centToSqft(cent: number): number {
  return Math.round(cent * SQFT_PER_CENT);
}

export function sqftToCent(sqft: number): number {
  return +(sqft / SQFT_PER_CENT).toFixed(3);
}

export function acreToCent(acre: number): number {
  return acre * CENTS_PER_ACRE;
}

export function centToAcre(cent: number): number {
  return +(cent / CENTS_PER_ACRE).toFixed(4);
}

export function toSqft(value: number, unit: "cent" | "acre" | "sqft"): number {
  if (unit === "sqft") return value;
  if (unit === "cent") return centToSqft(value);
  return centToSqft(acreToCent(value));
}

export function toCent(value: number, unit: "cent" | "acre" | "sqft"): number {
  if (unit === "cent") return value;
  if (unit === "acre") return acreToCent(value);
  return sqftToCent(value);
}

export function computePricePerCent(askingPrice: number, area: number, unit: "cent" | "acre" | "sqft"): number {
  const cents = toCent(area, unit);
  if (!cents) return 0;
  return Math.round(askingPrice / cents);
}
