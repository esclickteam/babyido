"use client";

import { Calendar } from "lucide-react";
import { useEffect, useId, useRef, useState } from "react";
import { displayToIso, isoToDisplay } from "@/utils/date";
import { cn } from "@/lib/utils";

interface HebrewDateInputProps {
  value: string;
  onChange: (iso: string) => void;
  className?: string;
  id?: string;
  placeholder?: string;
}

export function HebrewDateInput({
  value,
  onChange,
  className,
  id,
  placeholder = "18.03.26",
}: HebrewDateInputProps) {
  const fallbackId = useId();
  const inputId = id ?? fallbackId;
  const pickerRef = useRef<HTMLInputElement>(null);
  const [text, setText] = useState(() => isoToDisplay(value));

  useEffect(() => {
    setText(isoToDisplay(value));
  }, [value]);

  function commitText(raw: string) {
    const iso = displayToIso(raw);
    if (iso) {
      onChange(iso);
      setText(isoToDisplay(iso));
      return true;
    }
    if (value) setText(isoToDisplay(value));
    return false;
  }

  return (
    <div className="relative">
      <input
        id={inputId}
        type="text"
        inputMode="decimal"
        dir="ltr"
        autoComplete="off"
        placeholder={placeholder}
        value={text}
        onChange={(e) => {
          setText(e.target.value);
          const iso = displayToIso(e.target.value);
          if (iso) onChange(iso);
        }}
        onBlur={() => commitText(text)}
        className={cn(
          "w-full min-w-0 rounded-lg border border-input bg-transparent py-1 ps-2.5 pe-10 text-base outline-none transition-colors",
          "placeholder:text-muted-foreground focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 md:text-sm",
          className
        )}
      />
      <button
        type="button"
        onClick={() => pickerRef.current?.showPicker?.()}
        className="absolute end-2 top-1/2 flex size-8 -translate-y-1/2 items-center justify-center rounded-lg text-muted-foreground transition hover:bg-muted hover:text-foreground"
        aria-label="בחירת תאריך"
      >
        <Calendar className="size-4" />
      </button>
      <input
        ref={pickerRef}
        type="date"
        tabIndex={-1}
        aria-hidden
        value={value}
        onChange={(e) => {
          onChange(e.target.value);
          setText(isoToDisplay(e.target.value));
        }}
        className="pointer-events-none absolute h-0 w-0 opacity-0"
      />
    </div>
  );
}
