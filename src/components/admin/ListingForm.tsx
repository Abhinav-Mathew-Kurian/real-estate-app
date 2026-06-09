"use client";

import { useForm, useWatch, useFieldArray } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { listingSchema, type ListingFormData } from "@/lib/schemas/listing";
import { KERALA_DISTRICTS, TALUKS_BY_DISTRICT } from "@/lib/geo-data";
import { formatINR, formatArea } from "@/lib/format";
import { computePricePerCent } from "@/lib/units";
import { getCloudinarySignature, getYoutubeEmbedUrl } from "@/lib/cloudinary";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  DollarSign,
  MapPin,
  Home,
  Image as ImageIcon,
  Video,
  Star,
  Loader2,
  X,
  Plus,
  GripVertical,
  Trash2,
  Upload,
  CheckCircle,
  AlertCircle,
  Sparkles,
} from "lucide-react";
import { useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";

interface CloudinaryImage {
  url: string;
  publicId: string;
  alt?: string;
}

interface ListingFormProps {
  listingId?: string;
  defaultValues?: Partial<ListingFormData> & {
    images?: CloudinaryImage[];
    _id?: string;
  };
}

const LISTING_TYPES = [
  { value: "SELL_HOME", label: "Sell – Home" },
  { value: "SELL_LAND", label: "Sell – Land" },
  { value: "RENT", label: "Rent" },
  { value: "LEASE", label: "Lease" },
] as const;

const CATEGORIES = [
  { value: "villa", label: "Villa" },
  { value: "apartment", label: "Apartment" },
  { value: "house", label: "House" },
  { value: "plot", label: "Plot" },
  { value: "commercial", label: "Commercial" },
  { value: "agricultural", label: "Agricultural" },
] as const;

const FURNISHINGS = ["Furnished", "Semi-Furnished", "Unfurnished"] as const;
const FACINGS = ["East", "West", "North", "South", "North-East", "North-West", "South-East", "South-West"] as const;

export function ListingForm({ listingId, defaultValues }: ListingFormProps) {
  const router = useRouter();
  const [images, setImages] = useState<CloudinaryImage[]>(defaultValues?.images ?? []);
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState("");
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState("");
  const [highlightInput, setHighlightInput] = useState("");
  const [aiDescLoading, setAiDescLoading] = useState(false);

  const {
    register,
    handleSubmit,
    setValue,
    getValues,
    control,
    watch,
    formState: { errors },
  } = useForm<ListingFormData>({
    resolver: zodResolver(listingSchema),
    defaultValues: {
      type: "SELL_HOME",
      category: "house",
      status: "draft",
      areaUnit: "cent",
      isNegotiable: false,
      isFeatured: false,
      coverIndex: 0,
      highlights: [],
      ...defaultValues,
    },
  });

  const type = watch("type") as string;
  const district = watch("district") as string;
  const areaValue = watch("areaValue") as number;
  const areaUnit = watch("areaUnit") as "cent" | "acre" | "sqft";
  const askingPrice = watch("askingPrice") as number;
  const isFeatured = watch("isFeatured") as boolean;
  const highlights = (watch("highlights") as string[]) ?? [];
  const youtubeUrl = watch("youtubeUrl") as string | undefined;
  const coverIndex = (watch("coverIndex") as number) ?? 0;
  const isNegotiable = watch("isNegotiable") as boolean;

  const isLand = type === "SELL_LAND";
  const isHome = type === "SELL_HOME";
  const isRent = type === "RENT";
  const isLease = type === "LEASE";
  const isForSale = isLand || isHome;

  const pricePerCent =
    isForSale && askingPrice && areaValue && areaUnit
      ? computePricePerCent(Number(askingPrice), Number(areaValue), areaUnit)
      : null;

  // Image upload
  async function handleFileUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const files = Array.from(e.target.files ?? []);
    if (!files.length) return;
    setUploading(true);
    setUploadError("");

    try {
      const sig = await getCloudinarySignature();
      const uploaded: CloudinaryImage[] = [];

      for (const file of files) {
        const formData = new FormData();
        formData.append("file", file);
        formData.append("api_key", sig.apiKey);
        formData.append("timestamp", String(sig.timestamp));
        formData.append("signature", sig.signature);
        formData.append("folder", sig.folder);

        const res = await fetch(
          `https://api.cloudinary.com/v1_1/${sig.cloudName}/image/upload`,
          { method: "POST", body: formData }
        );
        const data = await res.json();
        if (data.secure_url) {
          uploaded.push({
            url: data.secure_url,
            publicId: data.public_id,
            alt: file.name.replace(/\.[^.]+$/, ""),
          });
        }
      }

      setImages((prev) => [...prev, ...uploaded]);
    } catch {
      setUploadError("Upload failed. Check Cloudinary credentials.");
    } finally {
      setUploading(false);
      e.target.value = "";
    }
  }

  function removeImage(idx: number) {
    setImages((prev) => {
      const next = prev.filter((_, i) => i !== idx);
      if (coverIndex >= next.length) setValue("coverIndex", 0);
      return next;
    });
  }

  function addHighlight() {
    const val = highlightInput.trim();
    if (!val) return;
    const current = highlights ?? [];
    setValue("highlights", [...current, val]);
    setHighlightInput("");
  }

  function removeHighlight(idx: number) {
    const current = highlights ?? [];
    setValue("highlights", current.filter((_, i) => i !== idx));
  }

  async function generateDescription() {
    setAiDescLoading(true);
    try {
      const vals = getValues();
      const res = await fetch("/api/ai/describe", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: vals.title,
          type: vals.type,
          category: vals.category,
          district: vals.district,
          taluk: vals.taluk,
          village: vals.village,
          area: vals.areaValue && vals.areaUnit ? { value: vals.areaValue, unit: vals.areaUnit } : undefined,
          bedrooms: vals.bedrooms,
          bathrooms: vals.bathrooms,
          facing: vals.facing,
          furnishing: vals.furnishing,
          ageYears: vals.ageYears,
          highlights: vals.highlights,
          askingPrice: vals.askingPrice,
        }),
      });
      if (res.ok) {
        const data = await res.json();
        if (data.description) setValue("description", data.description);
      }
    } catch {
      // silently fail
    } finally {
      setAiDescLoading(false);
    }
  }

  async function onSubmit(data: ListingFormData, statusOverride?: string) {
    setSaving(true);
    setSaveError("");

    const payload = {
      ...data,
      status: statusOverride ?? data.status,
      images,
    };

    try {
      const url = listingId ? `/api/listings/${listingId}` : "/api/listings";
      const method = listingId ? "PUT" : "POST";
      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error ?? "Save failed");
      }

      router.push("/admin/listings");
      router.refresh();
    } catch (e: unknown) {
      setSaveError(e instanceof Error ? e.message : "Save failed");
    } finally {
      setSaving(false);
    }
  }

  return (
    <form onSubmit={handleSubmit((d) => onSubmit(d))} className="space-y-8">
      {saveError && (
        <div className="flex items-center gap-2 text-sm text-red-700 bg-red-50 border border-red-200 rounded-lg px-4 py-3">
          <AlertCircle className="w-4 h-4 shrink-0" />
          {saveError}
        </div>
      )}

      {/* ── Type & Category ── */}
      <Section title="Listing Type" icon={<Home className="w-4 h-4" />}>
        <div className="grid grid-cols-2 gap-4">
          <Field label="Type" error={errors.type?.message}>
            <Select
              value={watch("type")}
              onValueChange={(v) =>
                setValue("type", v as ListingFormData["type"])
              }
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {LISTING_TYPES.map((t) => (
                  <SelectItem key={t.value} value={t.value}>
                    {t.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </Field>

          <Field label="Category" error={errors.category?.message}>
            <Select
              value={watch("category")}
              onValueChange={(v) =>
                setValue("category", v as ListingFormData["category"])
              }
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {CATEGORIES.map((c) => (
                  <SelectItem key={c.value} value={c.value}>
                    {c.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </Field>
        </div>

        <Field label="Title *" error={errors.title?.message}>
          <Input {...register("title")} placeholder="e.g. 3 BHK Villa in Kakkanad with Pool" />
        </Field>

        <div className="space-y-1.5">
          <div className="flex items-center justify-between">
            <label className="text-sm font-medium text-ink">Description</label>
            <button
              type="button"
              onClick={generateDescription}
              disabled={aiDescLoading}
              className="inline-flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-lg border border-emerald-brand/40 text-emerald-brand hover:bg-emerald-brand/5 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {aiDescLoading ? (
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
              ) : (
                <Sparkles className="w-3.5 h-3.5" />
              )}
              {aiDescLoading ? "Generating…" : "Generate with AI"}
            </button>
          </div>
          <Textarea
            {...register("description")}
            rows={5}
            placeholder="Describe the property, neighbourhood, key features…"
          />
        </div>
      </Section>

      {/* ── Location ── */}
      <Section title="Location" icon={<MapPin className="w-4 h-4" />}>
        <div className="grid grid-cols-2 gap-4">
          <Field label="District *" error={errors.district?.message}>
            <Select
              value={watch("district") ?? ""}
              onValueChange={(v) => {
                setValue("district", v ?? "");
                setValue("taluk", "");
              }}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select district" />
              </SelectTrigger>
              <SelectContent>
                {KERALA_DISTRICTS.map((d) => (
                  <SelectItem key={d} value={d}>
                    {d}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </Field>

          <Field label="Taluk *" error={errors.taluk?.message}>
            <Select
              value={watch("taluk") ?? ""}
              onValueChange={(v) => setValue("taluk", v ?? "")}
              disabled={!district}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select taluk" />
              </SelectTrigger>
              <SelectContent>
                {(TALUKS_BY_DISTRICT[district ?? ""] ?? []).map((t) => (
                  <SelectItem key={t} value={t}>
                    {t}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </Field>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <Field label="Village / Area *" error={errors.village?.message}>
            <Input {...register("village")} placeholder="e.g. Edapally" />
          </Field>
          <Field label="Locality / Landmark">
            <Input {...register("locality")} placeholder="e.g. Near InfoPark" />
          </Field>
        </div>

        <Field label="Full Address">
          <Textarea {...register("address")} rows={2} placeholder="Optional full postal address" />
        </Field>

        <div className="grid grid-cols-2 gap-4">
          <Field label="Latitude">
            <Input {...register("lat")} type="number" step="any" placeholder="e.g. 10.0261" />
          </Field>
          <Field label="Longitude">
            <Input {...register("lng")} type="number" step="any" placeholder="e.g. 76.3125" />
          </Field>
        </div>
      </Section>

      {/* ── Area & Details ── */}
      <Section title="Area & Property Details" icon={<Home className="w-4 h-4" />}>
        <div className="grid grid-cols-3 gap-4">
          <Field label="Area *" error={errors.areaValue?.message} className="col-span-2">
            <Input {...register("areaValue")} type="number" step="any" placeholder="e.g. 25" />
          </Field>
          <Field label="Unit *" error={errors.areaUnit?.message}>
            <Select
              value={watch("areaUnit")}
              onValueChange={(v) =>
                setValue("areaUnit", v as ListingFormData["areaUnit"])
              }
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="cent">Cent</SelectItem>
                <SelectItem value="acre">Acre</SelectItem>
                <SelectItem value="sqft">Sq ft</SelectItem>
              </SelectContent>
            </Select>
          </Field>
        </div>

        {(isHome || isRent || isLease) && (
          <div className="grid grid-cols-2 gap-4">
            <Field label="Bedrooms" error={errors.bedrooms?.message}>
              <Input {...register("bedrooms")} type="number" min="0" placeholder="e.g. 3" />
            </Field>
            <Field label="Bathrooms" error={errors.bathrooms?.message}>
              <Input {...register("bathrooms")} type="number" min="0" placeholder="e.g. 2" />
            </Field>
          </div>
        )}

        {(isRent || isLease) && (
          <Field label="Furnishing">
            <Select
              value={watch("furnishing") ?? ""}
              onValueChange={(v) => setValue("furnishing", v ?? undefined)}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select furnishing" />
              </SelectTrigger>
              <SelectContent>
                {FURNISHINGS.map((f) => (
                  <SelectItem key={f} value={f}>{f}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </Field>
        )}

        <div className="grid grid-cols-3 gap-4">
          <Field label="Facing">
            <Select
              value={watch("facing") ?? ""}
              onValueChange={(v) => setValue("facing", v ?? undefined)}
            >
              <SelectTrigger>
                <SelectValue placeholder="Facing" />
              </SelectTrigger>
              <SelectContent>
                {FACINGS.map((f) => (
                  <SelectItem key={f} value={f}>{f}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </Field>
          {(isHome || isRent || isLease) && (
            <>
              <Field label="Floors">
                <Input {...register("floors")} type="number" min="0" placeholder="e.g. 2" />
              </Field>
              <Field label="Age (years)">
                <Input {...register("ageYears")} type="number" min="0" placeholder="e.g. 5" />
              </Field>
            </>
          )}
        </div>
      </Section>

      {/* ── Pricing ── */}
      <Section title="Pricing" icon={<DollarSign className="w-4 h-4" />}>
        <div className="grid grid-cols-2 gap-4">
          <Field label={isRent ? "Asking Price (INR)" : "Asking Price (INR) *"} error={errors.askingPrice?.message}>
            <Input
              {...register("askingPrice")}
              type="number"
              min="0"
              placeholder="e.g. 4500000"
            />
            {askingPrice && (
              <p className="text-xs text-muted-foreground mt-1">
                {formatINR(Number(askingPrice))}
              </p>
            )}
          </Field>

          {isLand && (
            <Field label="Fair Value (₹/Cent)" error={errors.fairValueRef?.message}>
              <Input
                {...register("fairValueRef")}
                type="number"
                min="0"
                placeholder="e.g. 35000"
              />
            </Field>
          )}
        </div>

        {isForSale && pricePerCent && (
          <p className="text-sm text-emerald-brand font-medium">
            ≈ {formatINR(pricePerCent)} / cent
          </p>
        )}

        {(isRent || isLease) && (
          <div className="grid grid-cols-2 gap-4">
            <Field label="Monthly Rent (INR)" error={errors.monthlyRent?.message}>
              <Input
                {...register("monthlyRent")}
                type="number"
                min="0"
                placeholder="e.g. 25000"
              />
            </Field>
            <Field label="Security Deposit (INR)" error={errors.deposit?.message}>
              <Input
                {...register("deposit")}
                type="number"
                min="0"
                placeholder="e.g. 100000"
              />
            </Field>
          </div>
        )}

        {isLease && (
          <Field label="Lease Term (months)" error={errors.leaseTermMonths?.message}>
            <Input
              {...register("leaseTermMonths")}
              type="number"
              min="1"
              placeholder="e.g. 36"
            />
          </Field>
        )}

        <div className="flex items-center gap-3">
          <Switch
            id="negotiable"
            checked={!!isNegotiable}
            onCheckedChange={(v) => setValue("isNegotiable", v)}
          />
          <Label htmlFor="negotiable">Price is negotiable</Label>
        </div>
      </Section>

      {/* ── Images ── */}
      <Section title="Images" icon={<ImageIcon className="w-4 h-4" />}>
        <div className="space-y-4">
          <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed border-border rounded-xl hover:border-emerald-brand transition-colors cursor-pointer bg-mist/50">
            <input
              type="file"
              multiple
              accept="image/*"
              className="sr-only"
              onChange={handleFileUpload}
              disabled={uploading}
            />
            {uploading ? (
              <span className="flex items-center gap-2 text-sm text-muted-foreground">
                <Loader2 className="w-4 h-4 animate-spin" />
                Uploading…
              </span>
            ) : (
              <span className="flex flex-col items-center gap-1 text-sm text-muted-foreground">
                <Upload className="w-5 h-5" />
                Click to upload photos
              </span>
            )}
          </label>
          {uploadError && (
            <p className="text-sm text-red-600">{uploadError}</p>
          )}
          {images.length > 0 && (
            <div className="grid grid-cols-3 sm:grid-cols-4 gap-3">
              {images.map((img, idx) => (
                <div
                  key={img.publicId}
                  className={`relative aspect-square rounded-xl overflow-hidden border-2 transition-colors cursor-pointer ${
                    idx === coverIndex
                      ? "border-emerald-brand"
                      : "border-transparent"
                  }`}
                  onClick={() => setValue("coverIndex", idx)}
                >
                  <Image
                    src={img.url}
                    alt={img.alt ?? "Property photo"}
                    fill
                    className="object-cover"
                    sizes="150px"
                  />
                  {idx === coverIndex && (
                    <span className="absolute top-1 left-1 text-xs bg-emerald-brand text-cream px-1.5 py-0.5 rounded-md font-medium">
                      Cover
                    </span>
                  )}
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      removeImage(idx);
                    }}
                    className="absolute top-1 right-1 w-5 h-5 rounded-full bg-red-500 text-white flex items-center justify-center hover:bg-red-600"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      </Section>

      {/* ── YouTube ── */}
      <Section title="Video" icon={<Video className="w-4 h-4" />}>
        <Field label="YouTube URL" error={errors.youtubeUrl?.message}>
          <Input
            {...register("youtubeUrl")}
            placeholder="https://youtu.be/..."
            type="url"
          />
        </Field>
        {youtubeUrl && getYoutubeEmbedUrl(youtubeUrl) && (
          <div className="aspect-video rounded-xl overflow-hidden border border-border mt-3">
            <iframe
              src={getYoutubeEmbedUrl(youtubeUrl)!}
              className="w-full h-full"
              allowFullScreen
            />
          </div>
        )}
      </Section>

      {/* ── Highlights ── */}
      <Section title="Highlights" icon={<CheckCircle className="w-4 h-4" />}>
        <div className="flex gap-2">
          <Input
            value={highlightInput}
            onChange={(e) => setHighlightInput(e.target.value)}
            placeholder="e.g. Corner plot, Gated community, Near highway…"
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                e.preventDefault();
                addHighlight();
              }
            }}
          />
          <button
            type="button"
            onClick={addHighlight}
            className="px-3 py-1.5 rounded-lg bg-emerald-brand text-cream text-sm hover:bg-leaf transition-colors"
          >
            <Plus className="w-4 h-4" />
          </button>
        </div>
        <div className="flex flex-wrap gap-2 mt-3">
          {(highlights ?? []).map((h, idx) => (
            <Badge
              key={idx}
              className="bg-sage/30 text-forest border-sage/50 gap-1"
            >
              {h}
              <button
                type="button"
                onClick={() => removeHighlight(idx)}
                className="ml-0.5 hover:text-red-600"
              >
                <X className="w-3 h-3" />
              </button>
            </Badge>
          ))}
        </div>
      </Section>

      {/* ── Featured ── */}
      <Section title="Featured Listing" icon={<Star className="w-4 h-4" />}>
        <div className="flex items-center gap-3 mb-4">
          <Switch
            id="featured"
            checked={!!isFeatured}
            onCheckedChange={(v) => setValue("isFeatured", v)}
          />
          <Label htmlFor="featured">Mark as Featured</Label>
          {isFeatured && (
            <Badge className="bg-laterite/10 text-laterite border-laterite/30">
              Featured
            </Badge>
          )}
        </div>

        {isFeatured && (
          <div className="grid grid-cols-2 gap-4 p-4 bg-mist rounded-xl border border-border">
            <p className="col-span-2 text-xs text-muted-foreground font-medium uppercase tracking-wide">
              Offline Payment Record
            </p>
            <Field label="Paid By">
              <Input {...register("feature.paidBy")} placeholder="Client / Company name" />
            </Field>
            <Field label="Amount (INR)">
              <Input {...register("feature.amount")} type="number" placeholder="e.g. 5000" />
            </Field>
            <Field label="Paid On">
              <Input {...register("feature.paidOn")} type="date" />
            </Field>
            <Field label="Feature Until">
              <Input {...register("feature.featureUntil")} type="date" />
            </Field>
          </div>
        )}
      </Section>

      {/* ── Actions ── */}
      <div className="flex items-center gap-3 pt-4 border-t border-border">
        <button
          type="button"
          disabled={saving}
          onClick={handleSubmit((d) => onSubmit(d, "draft"))}
          className="px-5 py-2 rounded-lg border border-border text-ink text-sm font-medium hover:bg-mist transition-colors disabled:opacity-60"
        >
          Save Draft
        </button>
        <button
          type="button"
          disabled={saving}
          onClick={handleSubmit((d) => onSubmit(d, "published"))}
          className="px-5 py-2 rounded-lg bg-emerald-brand hover:bg-leaf text-cream text-sm font-medium transition-colors disabled:opacity-60 flex items-center gap-2"
        >
          {saving && <Loader2 className="w-4 h-4 animate-spin" />}
          {listingId ? "Update & Publish" : "Publish Listing"}
        </button>
        {listingId && (
          <>
            <button
              type="button"
              disabled={saving}
              onClick={handleSubmit((d) => onSubmit(d, "sold"))}
              className="px-5 py-2 rounded-lg bg-laterite/90 hover:bg-laterite text-cream text-sm font-medium transition-colors disabled:opacity-60"
            >
              Mark Sold
            </button>
            <button
              type="button"
              disabled={saving}
              onClick={handleSubmit((d) => onSubmit(d, "archived"))}
              className="px-5 py-2 rounded-lg border border-red-200 text-red-600 text-sm font-medium hover:bg-red-50 transition-colors disabled:opacity-60"
            >
              Archive
            </button>
          </>
        )}
      </div>
    </form>
  );
}

/* ── Helpers ── */
function Section({
  title,
  icon,
  children,
}: {
  title: string;
  icon?: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <div className="bg-cream rounded-2xl border border-border p-6 space-y-4">
      <h2 className="flex items-center gap-2 text-sm font-semibold text-forest uppercase tracking-wide">
        {icon}
        {title}
      </h2>
      {children}
    </div>
  );
}

function Field({
  label,
  error,
  children,
  className,
}: {
  label: string;
  error?: string;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div className={className}>
      <Label className="mb-1.5 block text-sm">{label}</Label>
      {children}
      {error && <p className="text-xs text-red-600 mt-1">{error}</p>}
    </div>
  );
}
