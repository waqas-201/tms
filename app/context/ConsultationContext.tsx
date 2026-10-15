"use client";

import React, { createContext, useContext, useState, useCallback } from "react";

export type ConsultationMode = "WHATSAPP" | "PHYSICAL";

export interface OpenConsultationOptions {
  concern?: string;
  message?: string;
  mode?: ConsultationMode;
}

export interface ConsultationContextType {
  isOpen: boolean;
  mode: ConsultationMode;
  initialMode: ConsultationMode;
  initialConcern: string;
  initialMessage: string;
  openConsultation: (options?: OpenConsultationOptions) => void;
  closeConsultation: () => void;
  setIsOpen: (isOpen: boolean) => void;
  setMode: (mode: ConsultationMode) => void;
}

export const ConsultationContext = createContext<ConsultationContextType | undefined>(
  undefined
);

export function ConsultationProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const [isOpen, setIsOpen] = useState(false);
  const [mode, setMode] = useState<ConsultationMode>("WHATSAPP");
  const [initialConcern, setInitialConcern] = useState("");
  const [initialMessage, setInitialMessage] = useState("");

  const openConsultation = useCallback((options?: OpenConsultationOptions) => {
    if (options?.mode) {
      setMode(options.mode);
    }
    if (options?.concern !== undefined) {
      setInitialConcern(options.concern);
    }
    if (options?.message !== undefined) {
      setInitialMessage(options.message);
    }
    setIsOpen(true);
  }, []);

  const closeConsultation = useCallback(() => {
    setIsOpen(false);
  }, []);

  return (
    <ConsultationContext.Provider
      value={{
        isOpen,
        mode,
        initialMode: mode,
        initialConcern,
        initialMessage,
        openConsultation,
        closeConsultation,
        setIsOpen,
        setMode,
      }}
    >
      {children}
    </ConsultationContext.Provider>
  );
}

export function useConsultation(defaultOptions?: OpenConsultationOptions) {
  const context = useContext(ConsultationContext);
  if (!context) {
    throw new Error(
      "useConsultation must be used within a ConsultationProvider"
    );
  }
  if (!defaultOptions) {
    return context;
  }
  return {
    ...context,
    openConsultation: (options?: OpenConsultationOptions) => {
      context.openConsultation({
        ...defaultOptions,
        ...options,
      });
    },
  };
}

export default ConsultationContext;
