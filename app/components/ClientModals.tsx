"use client";

import dynamic from "next/dynamic";

const CartDrawer = dynamic(() => import("@/app/components/CartDrawer"), {
  ssr: false,
});

const ConsultationModal = dynamic(
  () => import("@/app/components/ConsultationModal"),
  {
    ssr: false,
  }
);

/**
 * ClientModals isolates heavy client-side slide-over drawers and consultation forms
 * so they are never SSR-rendered and their JavaScript is code-split away from the
 * critical initial HTML paint.
 */
export default function ClientModals() {
  return (
    <>
      <CartDrawer />
      <ConsultationModal />
    </>
  );
}
