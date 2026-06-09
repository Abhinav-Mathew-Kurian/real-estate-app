const inrFormatter = new Intl.NumberFormat("en-IN", {
  style: "currency",
  currency: "INR",
  maximumFractionDigits: 0,
});

export function formatINR(amount: number): string {
  if (amount >= 1_00_00_000) {
    const crore = amount / 1_00_00_000;
    return `₹${crore % 1 === 0 ? crore : crore.toFixed(2)} Crore`;
  }
  if (amount >= 1_00_000) {
    const lakh = amount / 1_00_000;
    return `₹${lakh % 1 === 0 ? lakh : lakh.toFixed(2)} Lakh`;
  }
  return inrFormatter.format(amount);
}

export function formatINRShort(amount: number): string {
  if (amount >= 1_00_00_000) {
    return `₹${(amount / 1_00_00_000).toFixed(1)}Cr`;
  }
  if (amount >= 1_00_000) {
    return `₹${(amount / 1_00_000).toFixed(1)}L`;
  }
  if (amount >= 1_000) {
    return `₹${(amount / 1_000).toFixed(0)}K`;
  }
  return `₹${amount}`;
}

export function slugify(text: string, id?: string): string {
  const base = text
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, "")
    .replace(/[\s_-]+/g, "-")
    .replace(/^-+|-+$/g, "");
  return id ? `${base}-${id}` : base;
}

export function formatArea(value: number, unit: "cent" | "acre" | "sqft"): string {
  if (unit === "cent") return `${value} Cent`;
  if (unit === "acre") return `${value} Acre`;
  return `${value.toLocaleString("en-IN")} sqft`;
}

export function formatDate(date: Date | string): string {
  return new Date(date).toLocaleDateString("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}
