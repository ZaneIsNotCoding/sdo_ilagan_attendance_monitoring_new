"use client";

import React from "react";
import { ChevronDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export function CustomDropdownCheckbox({
  label,
  items,
  selected,
  onChange,
  buttonLabel,
  buttonVariant = "outline",
}) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant={buttonVariant}>
          {buttonLabel || selected} <ChevronDown size={16} className="ml-1" />
        </Button>
      </DropdownMenuTrigger>

      <DropdownMenuContent className="bg-white p-2 rounded-md shadow-lg min-w-[12rem]">
        {label && (
          <>
            <DropdownMenuLabel>{label}</DropdownMenuLabel>
            <DropdownMenuSeparator />
          </>
        )}

        {items.map((item) => (
          <DropdownMenuCheckboxItem
            key={item}
            checked={selected === item}
            onCheckedChange={() => onChange(item)}
            className="cursor-pointer rounded-md text-sm px-2 py-2 pl-8 hover:bg-gray-100 data-[state=checked]:bg-green-100"
                >
                {item}
          </DropdownMenuCheckboxItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

export function CustomDropdownCheckboxObject({
  label,
  items,
  selected,
  onChange,
  buttonLabel,
  buttonVariant = "outline",
}) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant={buttonVariant}>
          {buttonLabel ||
            items.find((i) => i.id === selected)?.name ||
            ""}{" "}
          <ChevronDown size={16} className="ml-1" />
        </Button>
      </DropdownMenuTrigger>

      <DropdownMenuContent className="bg-white p-2 rounded-md shadow-lg min-w-[12rem]">
        {label && (
          <>
            <DropdownMenuLabel>{label}</DropdownMenuLabel>
            <DropdownMenuSeparator />
          </>
        )}

        {items.map((item) => (
          <DropdownMenuCheckboxItem
            key={item.id}
            checked={selected === item.id}
            onCheckedChange={() => onChange(item.id)}
            className="cursor-pointer rounded-md text-sm px-2 py-2 pl-8 hover:bg-gray-100 data-[state=checked]:bg-green-100"
          >
            {item.name}
          </DropdownMenuCheckboxItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

