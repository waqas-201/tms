import React, { Suspense } from "react";
import OriginalHomepage from "@/app/prototypes/homepage/OriginalHomepage";
import VariantA_ClinicalTriage from "@/app/prototypes/homepage/VariantA_ClinicalTriage";
import VariantB_ApothecaryDispensary from "@/app/prototypes/homepage/VariantB_ApothecaryDispensary";
import VariantC_IntegratedCareHub from "@/app/prototypes/homepage/VariantC_IntegratedCareHub";
import PrototypeSwitcher from "@/app/prototypes/homepage/PrototypeSwitcher";

/**
 * UI Prototype: Three variants of the homepage, switchable via `?variant=`, on the existing `/` route.
 *
 * Variants:
 * - 'original': Baseline homepage with existing sections
 * - 'A' (default): Clinical Triage & Doctor-First Healthcare (Symptom selector, verified credentials, clinical pathway)
 * - 'B': Heritage Unani Apothecary & Remedy Dispensary (Botanical catalog shelf, purity standards, Mizaj advice)
 * - 'C': Integrated Care Hub & Fast-Track WhatsApp Concierge (Dual-track online/walk-in triage, interactive service tabs)
 */
export default async function Home(props: {
  searchParams?: Promise<{ variant?: string }>;
}) {
  const searchParams = props.searchParams ? await props.searchParams : {};
  const variant = (searchParams?.variant || "A").toLowerCase();

  return (
    <>
      {variant === "original" && <OriginalHomepage />}
      {variant === "a" && <VariantA_ClinicalTriage />}
      {variant === "b" && <VariantB_ApothecaryDispensary />}
      {variant === "c" && <VariantC_IntegratedCareHub />}
      {variant !== "original" &&
        variant !== "a" &&
        variant !== "b" &&
        variant !== "c" && <VariantA_ClinicalTriage />}

      <Suspense fallback={null}>
        <PrototypeSwitcher currentVariant={variant} />
      </Suspense>
    </>
  );
}
