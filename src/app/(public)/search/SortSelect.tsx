"use client";

const SORT_OPTIONS = [
  { label: "Newest first", value: "newest" },
  { label: "Price: Low → High", value: "price_asc" },
  { label: "Price: High → Low", value: "price_desc" },
  { label: "Area: Low → High", value: "area_asc" },
];

export function SortSelect({ defaultValue }: { defaultValue: string }) {
  return (
    <div className="flex items-center gap-2">
      <label className="text-sm text-muted-foreground whitespace-nowrap" htmlFor="sort-select">
        Sort:
      </label>
      <select
        id="sort-select"
        defaultValue={defaultValue}
        className="text-sm border border-border rounded-xl px-3 py-2 bg-cream text-ink focus:outline-none focus:ring-2 focus:ring-emerald-brand"
        onChange={(e) => {
          const params = new URLSearchParams(window.location.search);
          params.set("sort", e.target.value);
          params.delete("page");
          window.location.href = `/search?${params.toString()}`;
        }}
      >
        {SORT_OPTIONS.map((o) => (
          <option key={o.value} value={o.value}>
            {o.label}
          </option>
        ))}
      </select>
    </div>
  );
}
