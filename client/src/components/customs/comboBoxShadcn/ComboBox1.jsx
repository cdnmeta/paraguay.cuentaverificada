"use client";

import React, { useMemo, useState } from "react";
import { ChevronsUpDown, Check, X } from "lucide-react";

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";

/**
 * ComboBox
 * Props:
 * - items: Array<string | object>  // [{value, label, ...}] o ["A","B"]
 * - value: string | number | null  // valor seleccionado (controlado)
 * - onChange: (val|null) => void
 * - placeholder: string
 * - searchPlaceholder: string
 * - emptyMessage: string
 * - labelKey: string               // key para mostrar, default: "label"
 * - valueKey: string | ((item)=>any) // key o función para obtener value, default: "value"
 * - disabled: boolean
 * - clearable: boolean             // muestra botón para limpiar selección
 * - className, buttonClassName, contentClassName: string
 * - renderItem: (item, isSelected) => ReactNode // opcional, custom render
 * - side, align: popover positioning
 */
export function ComboBox({
  items = [],
  value = null,
  onChange = () => {},
  placeholder = "Seleccionar...",
  searchPlaceholder = "Buscar...",
  emptyMessage = "Sin resultados.",
  labelKey = "label",
  valueKey = "value",
  disabled = false,
  clearable = true,
  className,
  buttonClassName,
  contentClassName,
  renderItem,
  side,
  align,
  error=false,
}) {
  const [open, setOpen] = useState(false);

  // Normaliza items para soportar strings o objetos
  const normalized = useMemo(() => {
    return items.map((it) => {
      if (typeof it === "string" || typeof it === "number") {
        return { __raw: it, value: String(it), label: String(it) };
      }
      const v =
        typeof valueKey === "function"
          ? valueKey(it)
          : it?.[valueKey] ?? it?.value ?? it?.id ?? "";
      const l = it?.[labelKey] ?? it?.label ?? String(v ?? "");
      return { ...it, value: String(v), label: String(l) };
    });
  }, [items, labelKey, valueKey]);

  const selected = useMemo(
    () =>
      normalized.find((i) => String(i.value) === String(value ?? "")) || null,
    [normalized, value]
  );

  const handleSelect = (val) => {
    console.log("la seleccion es ", val);
    if (String(val) === String(value ?? "")) {
      // si selecciona el mismo, alterna a null
      onChange(null);
    } else {
      onChange(val);
    }
    setOpen(false);
  };

  const handleClear = (e) => {
    e.stopPropagation();
    onChange(null);
  };

  return (
    <div className={cn("w-full relative ", className)}>
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild disabled={disabled}>
          <Button
            type="button"
            variant="outline"
            role="combobox"
            aria-expanded={open}
            className={cn(
              "w-full justify-between",
              !selected && "text-muted-foreground",
              buttonClassName,
              error && "border-red-500 text-red-500"

            )}
          >
            <span className="truncate">
              {selected ? (
                <div className="flex items-center">
                  {selected.img && (
                    <img src={selected.img} alt="" className="mr-2 h-4 w-4" />
                  )}
                  {selected.label}
                </div>
              ) : (
                placeholder
              )}
            </span>
          </Button>
        </PopoverTrigger>
        {/* Botón de limpiar, posicionado a la derecha */}
        {clearable && selected && !disabled && (
          <X
            onClick={handleClear}
            className="absolute right-5 top-[50%] -translate-y-1/2 h-4 w-4 cursor-pointer opacity-60 hover:opacity-100"
          />
        )}
        <PopoverContent
          className={cn(
            "p-0 w-[var(--radix-popover-trigger-width)]",
            contentClassName
          )}
          align={align}
          side={side}
        >
          <Command className="w-[var(--radix-popover-trigger-width)]">
            <CommandInput placeholder={searchPlaceholder} className="h-9" />
            <CommandList>
              <CommandEmpty>{emptyMessage}</CommandEmpty>
              <CommandGroup>
                {normalized.map((item) => {
                  const isSelected = String(item.value) === String(value ?? "");
                  return (
                    <CommandItem
                      key={item.value}
                      value={item.label}
                      onSelect={() => handleSelect(item.value)}
                      // Command te pasa el "value" del item; usamos handleSelect(value)
                    >
                      {renderItem ? (
                        renderItem(item, isSelected)
                      ) : (
                        <>
                          {item.img && (
                            <img
                              src={item.img}
                              alt=""
                              className="mr-2 h-4 w-4"
                            />
                          )}
                          <span className="truncate">{item.label}</span>
                          <Check
                            className={cn(
                              "ml-auto h-4 w-4",
                              isSelected ? "opacity-100" : "opacity-0"
                            )}
                          />
                        </>
                      )}
                    </CommandItem>
                  );
                })}
              </CommandGroup>
            </CommandList>
          </Command>
        </PopoverContent>
      </Popover>
    </div>
  );
}
