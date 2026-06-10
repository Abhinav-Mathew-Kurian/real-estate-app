"use client";

import { useEffect } from "react";
import { useSearchParams } from "next/navigation";

/**
 * Captures UTM parameters from the URL on first load and
 * stores them in sessionStorage for use by the lead capture form.
 */
export function UTMCapture() {
  const searchParams = useSearchParams();

  useEffect(() => {
    const source = searchParams.get("utm_source");
    const medium = searchParams.get("utm_medium");
    const campaign = searchParams.get("utm_campaign");

    if (source || medium || campaign) {
      try {
        sessionStorage.setItem(
          "utm",
          JSON.stringify({
            source: source ?? undefined,
            medium: medium ?? undefined,
            campaign: campaign ?? undefined,
          })
        );
      } catch {
        // sessionStorage not available (SSR or private browsing)
      }
    }
  }, [searchParams]);

  return null;
}
