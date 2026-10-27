"use client";

import React, { useRef, useEffect } from "react";

interface OtpInputProps {
  value: string;
  onChange: (value: string) => void;
  onComplete?: (value: string) => void;
  disabled?: boolean;
  length?: number;
  autoFocus?: boolean;
  hasError?: boolean;
}

export function OtpInput({
  value,
  onChange,
  onComplete,
  disabled = false,
  length = 6,
  autoFocus = true,
  hasError = false,
}: OtpInputProps) {
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  // Split string value into array of individual characters
  const digits = Array.from({ length }, (_, i) => value[i] || "");

  useEffect(() => {
    if (autoFocus && inputRefs.current[0] && !disabled) {
      inputRefs.current[0]?.focus();
    }
  }, [autoFocus, disabled]);

  const handleChange = (index: number, char: string) => {
    // Only accept numeric digits
    const cleaned = char.replace(/\D/g, "");
    if (!cleaned) return;

    const lastChar = cleaned[cleaned.length - 1];
    const newDigits = [...digits];
    newDigits[index] = lastChar;
    const newValue = newDigits.join("");
    onChange(newValue);

    // Auto-advance to next input if not at the last cell
    if (index < length - 1) {
      inputRefs.current[index + 1]?.focus();
    }

    // Trigger onComplete if full code entered
    if (newValue.length === length && onComplete) {
      onComplete(newValue);
    }
  };

  const handleKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Backspace") {
      e.preventDefault();
      const newDigits = [...digits];

      if (digits[index]) {
        // If current cell has a digit, clear it
        newDigits[index] = "";
        onChange(newDigits.join(""));
      } else if (index > 0) {
        // If current cell is empty, move backward and clear previous
        newDigits[index - 1] = "";
        onChange(newDigits.join(""));
        inputRefs.current[index - 1]?.focus();
      }
    } else if (e.key === "ArrowLeft" && index > 0) {
      e.preventDefault();
      inputRefs.current[index - 1]?.focus();
    } else if (e.key === "ArrowRight" && index < length - 1) {
      e.preventDefault();
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handlePaste = (e: React.ClipboardEvent<HTMLInputElement>) => {
    e.preventDefault();
    const pasted = e.clipboardData.getData("text/plain").replace(/\D/g, "").slice(0, length);
    if (!pasted) return;

    onChange(pasted);

    // Focus the cell right after the pasted digits, or the last cell if filled
    const nextIndex = Math.min(pasted.length, length - 1);
    inputRefs.current[nextIndex]?.focus();

    if (pasted.length === length && onComplete) {
      onComplete(pasted);
    }
  };

  return (
    <div className="flex items-center justify-center gap-2 sm:gap-3 w-full my-2">
      {Array.from({ length }).map((_, index) => {
        const isFilled = Boolean(digits[index]);
        const isCurrentActive = !digits[index] && (index === 0 || Boolean(digits[index - 1]));

        return (
          <input
            key={index}
            ref={(el) => {
              inputRefs.current[index] = el;
            }}
            type="text"
            inputMode="numeric"
            pattern="[0-9]*"
            maxLength={1}
            value={digits[index]}
            disabled={disabled}
            onChange={(e) => handleChange(index, e.target.value)}
            onKeyDown={(e) => handleKeyDown(index, e)}
            onPaste={handlePaste}
            onFocus={(e) => e.target.select()}
            aria-label={`Digit ${index + 1} of ${length}`}
            className={`w-11 h-14 sm:w-12 sm:h-16 text-center font-mono text-2xl font-bold rounded-xl border transition-all duration-150 focus:outline-none focus:scale-105 select-none ${
              hasError
                ? "border-danger text-danger bg-danger-soft/30 focus:border-danger focus:ring-2 focus:ring-danger/20"
                : isFilled
                ? "border-primary text-primary bg-primary/5 focus:border-primary focus:ring-2 focus:ring-primary/20"
                : isCurrentActive
                ? "border-primary/60 bg-white shadow-sm focus:border-primary focus:ring-2 focus:ring-primary/20"
                : "border-line bg-surface text-ink focus:border-primary focus:ring-2 focus:ring-primary/20"
            } ${disabled ? "opacity-50 cursor-not-allowed" : "cursor-text"}`}
          />
        );
      })}
    </div>
  );
}
