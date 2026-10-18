"use client";

import { useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useConsultation } from "@/app/context/ConsultationContext";

function ConsultationRedirect() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { openConsultation } = useConsultation();

  useEffect(() => {
    const concern = searchParams.get("concern") || "";
    router.replace("/");
    openConsultation({
      mode: "WHATSAPP",
      concern: concern || undefined,
      message: concern
        ? `Assalam-o-Alaikum Hakim Sahib, I would like consultation and remedy guidance for: ${concern}.`
        : "Assalam-o-Alaikum Hekeem Tahir Hameed Sahab, I would like to consult with you regarding authentic herbal guidance for my health.",
    });
  }, [router, searchParams, openConsultation]);

  return (
    <div className="min-h-[60vh] flex items-center justify-center bg-[#faf8f5]">
      <div className="text-center space-y-2">
        <div className="w-8 h-8 border-2 border-[#22623a] border-t-transparent rounded-full animate-spin mx-auto" />
        <p className="text-xs text-[#59534b]">Opening consultation...</p>
      </div>
    </div>
  );
}

export default function ConsultationPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-[60vh] flex items-center justify-center bg-[#faf8f5]">
          <div className="w-8 h-8 border-2 border-[#22623a] border-t-transparent rounded-full animate-spin mx-auto" />
        </div>
      }
    >
      <ConsultationRedirect />
    </Suspense>
  );
}
