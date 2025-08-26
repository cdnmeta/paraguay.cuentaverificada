import * as React from "react";
import { ChevronDownIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Label } from "@/components/ui/label";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";

export const DatePicker = React.forwardRef(
  (
    {
      label,
      value,
      onChange,
      onBlur,
      name,
      disabled,
      placeholder = "Seleccionar fecha",
      className,
      mode = "single",
      captionLayout = "dropdown",
      ...props
    },
    ref
  ) => {
    const [open, setOpen] = React.useState(false);

    return (
      <div className={`flex flex-col gap-2 ${className || ""}`}>
        {label && (
          <Label htmlFor={name} className="px-1">
            {label}
          </Label>
        )}
        <Popover open={open} onOpenChange={setOpen}>
          <PopoverTrigger asChild>
            <Button
              ref={ref}
              variant="outline"
              id={name}
              disabled={disabled}
              className="w-full justify-between font-normal"
              onBlur={onBlur}
              type="button"
            >
              {value
                ? value instanceof Date
                  ? value.toLocaleDateString()
                  : new Date(value).toLocaleDateString()
                : placeholder}
              <ChevronDownIcon />
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-auto overflow-hidden p-0" align="start">
            <Calendar
              mode={mode}
              selected={value ? new Date(value) : undefined}
              captionLayout={captionLayout}
              onSelect={(date) => {
                onChange?.(date);
                setOpen(false);
              }}
              {...props}
            />
          </PopoverContent>
        </Popover>
      </div>
    );
  }
);

DatePicker.displayName = "DatePicker";
