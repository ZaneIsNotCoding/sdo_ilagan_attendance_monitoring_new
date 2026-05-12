"use client";

import React from "react";
import { ChevronDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export function CustomDropdownCheckbox({
    label,
    items = [],
    selected,
    onChange,
    buttonLabel,
    buttonVariant = "outline",
    className = "",
    iconOnly = false,
    disabled = false,
}) {
    const displayLabel = buttonLabel || selected || label || "Select";

    return (
        <DropdownMenu>
            <DropdownMenuTrigger asChild>
                <Button
                    variant={buttonVariant}
                    disabled={disabled}
                    aria-label={label || "Open dropdown"}
                    title={iconOnly ? label : undefined}
                    className={
                        iconOnly
                            ? `h-8 w-8 min-w-0 justify-center rounded-md p-0 ${className}`
                            : `flex min-w-[120px] items-center justify-between gap-2 ${className}`
                    }
                >
                    {!iconOnly && (
                        <span className="min-w-0 truncate">
                            {displayLabel}
                        </span>
                    )}

                    <ChevronDown size={16} className="shrink-0" />
                </Button>
            </DropdownMenuTrigger>

            <DropdownMenuContent className="max-h-80 min-w-[14rem] overflow-y-auto rounded-xl border border-slate-200 bg-white p-0 shadow-2xl">
                {label && (
                    <>
                        <DropdownMenuLabel className="border-b bg-slate-50 px-3 py-2 text-xs font-semibold uppercase tracking-wide text-slate-500">
                            {label}
                        </DropdownMenuLabel>
                    </>
                )}

                {items.map((item) => (
                    <DropdownMenuItem
                        key={item}
                        onSelect={() => onChange(item)}
                        className={`flex cursor-pointer items-center justify-between gap-3 rounded-none px-3 py-2 text-left text-sm transition hover:bg-blue-50 focus:bg-blue-50 ${
                            selected === item ? "bg-blue-50 text-blue-700" : ""
                        }`}
                    >
                        <span className="min-w-0 truncate font-medium">
                            {item}
                        </span>
                    </DropdownMenuItem>
                ))}
            </DropdownMenuContent>
        </DropdownMenu>
    );
}

export function CustomDropdownCheckboxObject({
    label,
    items = [],
    selected,
    onChange,
    buttonLabel,
    buttonVariant = "outline",
    className = "",
    iconOnly = false,
    disabled = false,
}) {
    const displayLabel = buttonLabel || selected || label || "Select";

    return (
        <DropdownMenu>
            <DropdownMenuTrigger asChild>
                <Button
                    variant={buttonVariant}
                    disabled={disabled}
                    aria-label={label || "Open dropdown"}
                    title={iconOnly ? label : undefined}
                    className={
                        iconOnly
                            ? `h-8 w-8 min-w-0 justify-center rounded-md p-0 ${className}`
                            : `flex min-w-[120px] items-center justify-between gap-2 ${className}`
                    }
                >
                    {!iconOnly && (
                        <span className="min-w-0 truncate">
                            {displayLabel}
                        </span>
                    )}

                    <ChevronDown size={16} className="shrink-0" />
                </Button>
            </DropdownMenuTrigger>

            <DropdownMenuContent className="max-h-96 min-w-[18rem] overflow-y-auto rounded-xl border border-slate-200 bg-white p-0 shadow-2xl">
                {label && (
                    <>
                        <DropdownMenuLabel className="border-b bg-slate-50 px-3 py-2 text-xs font-semibold uppercase tracking-wide text-slate-500">
                            {label}
                        </DropdownMenuLabel>
                    </>
                )}

                {items.map((item) => {
                    const divisionLabel = item.division
                        ? [item.division.code, item.division.name]
                              .filter(Boolean)
                              .join(" • ")
                        : null;

                    const isSelected =
                        selected === item.id ||
                        Number(selected) === Number(item.id);

                    return (
                        <DropdownMenuItem
                            key={item.id}
                            onSelect={() => onChange(item.id)}
                            className={`flex cursor-pointer items-start justify-between gap-3 rounded-none px-3 py-2 text-left transition hover:bg-blue-50 focus:bg-blue-50 ${
                                isSelected
                                    ? "bg-blue-50 text-blue-700"
                                    : ""
                            }`}
                        >
                            <span className="flex min-w-0 flex-col">
                                <span className="truncate text-sm font-medium">
                                    {item.name}
                                </span>
                                {divisionLabel && (
                                    <span className="truncate text-xs font-normal text-slate-500">
                                        {divisionLabel}
                                    </span>
                                )}
                            </span>
                        </DropdownMenuItem>
                    );
                })}
            </DropdownMenuContent>
        </DropdownMenu>
    );
}
