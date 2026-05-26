"use client";

import React, { useMemo, useState } from "react";
import { router } from "@inertiajs/react";
import { motion } from "framer-motion";
import FloatingInput from "@/components/floating-input";
import { Search, Trash2 } from "lucide-react";
import ConfirmPasswordDialog from "@/Components/ConfirmPasswordDialog";
import LocatorSlipPrintDialog from "./LocatorSlipPrintDialog";

const itemVariants = {
    hidden: { opacity: 0, y: 18 },
    visible: {
        opacity: 1,
        y: 0,
        transition: {
            duration: 0.45,
            ease: "easeOut",
        },
    },
};

const formatDate = (value, options = {}) =>
    value
        ? new Date(value).toLocaleDateString("en-PH", {
              year: "numeric",
              month: "long",
              day: "numeric",
              ...options,
          })
        : "-";

const getEmployeeName = (record) =>
    record.employee_name ||
    (record.employee
        ? `${record.employee.first_name ?? ""} ${record.employee.middle_name ?? ""} ${record.employee.last_name ?? ""}`
              .replace(/\s+/g, " ")
              .trim()
        : "");

const getSearchText = (record) =>
    [
        getEmployeeName(record),
        record.position,
        record.permanent_station,
        record.employee?.position,
        record.employee?.station?.name,
        record.purpose_of_travel,
        record.travel_type,
        record.destination,
    ]
        .filter(Boolean)
        .join(" ")
        .toLowerCase();

const getFilterSummary = (filters, label) => {
    if (filters.date) return `No ${label} found for ${formatDate(filters.date)}.`;
    if (filters.month) {
        return `No ${label} found for ${formatDate(`${filters.month}-01`, {
            day: undefined,
        })}.`;
    }
    if (filters.search) return `No ${label} found for "${filters.search}".`;
    return `No ${label} found.`;
};

const getQuickRanges = () => {
    const today = new Date();
    const toDateInput = (date) => {
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, "0");
        const day = String(date.getDate()).padStart(2, "0");

        return `${year}-${month}-${day}`;
    };
    const startOfWeek = new Date(today);
    startOfWeek.setDate(today.getDate() - today.getDay());

    return {
        today: toDateInput(today),
        weekFrom: toDateInput(startOfWeek),
        weekTo: toDateInput(today),
        month: toDateInput(today).slice(0, 7),
    };
};

const LocatorSlipTable = ({
    slips = [],
    filters = {},
    locator_slips = {},
    filterRoute = "locator-slips",
    filterParams = {},
    monitoringControls = false,
    deleteType = "locator-slip",
}) => {
    const [selectedSlip, setSelectedSlip] = useState(null);
    const [open, setOpen] = useState(false);
    const [searchInput, setSearchInput] = useState(filters.search || "");
    const [isSearchFocused, setIsSearchFocused] = useState(false);
    const [selectedIds, setSelectedIds] = useState([]);

    const handlePreview = (slip) => {
        setSelectedSlip(slip);
        setOpen(true);
    };

    const runFilter = (nextFilters = {}) => {
        router.get(
            route(filterRoute),
            {
                ...filterParams,
                date: filters.date || "",
                date_from: filters.date_from || "",
                date_to: filters.date_to || "",
                month: filters.month || "",
                search: filters.search || "",
                ...nextFilters,
            },
            {
                preserveState: true,
                preserveScroll: true,
                replace: true,
            },
        );
    };

    const suggestions = useMemo(() => {
        const query = searchInput.trim().toLowerCase();
        if (!query) return [];

        const seen = new Set();

        return slips
            .filter((slip) => getSearchText(slip).includes(query))
            .map((slip) => ({
                id: slip.id,
                value: getEmployeeName(slip) || slip.destination || "",
                title: getEmployeeName(slip) || "Unnamed employee",
                subtitle: slip.destination || slip.purpose_of_travel || "",
            }))
            .filter((item) => {
                const key = `${item.value}-${item.subtitle}`.toLowerCase();
                if (!item.value || seen.has(key)) return false;
                seen.add(key);
                return true;
            })
            .slice(0, 6);
    }, [slips, searchInput]);

    const quickRanges = getQuickRanges();
    const pageStart = locator_slips.from || 1;
    const allSelected =
        slips.length > 0 && slips.every((slip) => selectedIds.includes(slip.id));
    const toggleSelected = (id) => {
        setSelectedIds((current) =>
            current.includes(id)
                ? current.filter((selectedId) => selectedId !== id)
                : [...current, id],
        );
    };

    return (
        <>
            <motion.div
                variants={itemVariants}
                initial="hidden"
                animate="visible"
                className="mt-8 rounded-lg border border-slate-200 bg-white p-4 shadow-sm"
            >
                <div className="grid gap-3 xl:grid-cols-[minmax(240px,1fr)_auto_auto_auto] xl:items-end">
                    <form
                        className="relative"
                        onSubmit={(e) => {
                            e.preventDefault();
                            runFilter({ search: searchInput.trim() });
                            setIsSearchFocused(false);
                        }}
                    >
                        <FloatingInput
                            label="Search Locator Slip"
                            icon={Search}
                            name="locator-slip-search"
                            value={searchInput}
                            onChange={(e) => setSearchInput(e.target.value)}
                            onFocus={() => setIsSearchFocused(true)}
                            onBlur={() => {
                                window.setTimeout(() => {
                                    setIsSearchFocused(false);
                                }, 120);
                            }}
                            onKeyDown={(e) => {
                                if (e.key === "Enter") {
                                    e.preventDefault();
                                    runFilter({ search: searchInput.trim() });
                                    setIsSearchFocused(false);
                                }
                            }}
                        />

                        {isSearchFocused &&
                            searchInput.trim() &&
                            suggestions.length > 0 && (
                                <div className="absolute left-0 top-full z-50 mt-2 w-full overflow-hidden rounded-xl border border-slate-200 bg-white shadow-2xl">
                                    <div className="border-b bg-slate-50 px-3 py-2 text-xs font-semibold uppercase tracking-wide text-slate-500">
                                        Locator slips
                                    </div>

                                    <div className="max-h-72 overflow-y-auto">
                                        {suggestions.map((item) => (
                                            <button
                                                key={`${item.id}-${item.value}`}
                                                type="button"
                                                className="flex w-full items-start justify-between gap-3 px-3 py-2 text-left text-sm transition hover:bg-blue-50"
                                                onClick={() => {
                                                    setSearchInput(item.value);
                                                    runFilter({
                                                        search: item.value,
                                                    });
                                                    setIsSearchFocused(false);
                                                }}
                                            >
                                                <div className="min-w-0">
                                                    <div className="truncate font-medium text-slate-800">
                                                        {item.title}
                                                    </div>
                                                    <div className="truncate text-xs text-slate-500">
                                                        {item.subtitle}
                                                    </div>
                                                </div>

                                                <span className="shrink-0 rounded-full bg-blue-100 px-2 py-1 text-[11px] font-semibold text-blue-700">
                                                    Search
                                                </span>
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            )}
                    </form>

                    <div>
                        <label className="text-sm font-semibold text-slate-700">
                            Date
                        </label>
                        <input
                            type="date"
                            value={filters.date || ""}
                            onChange={(e) =>
                                runFilter({
                                    date: e.target.value,
                                    date_from: "",
                                    date_to: "",
                                    month: "",
                                })
                            }
                            className="mt-1 block rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none"
                        />
                    </div>

                    <div>
                        <label className="text-sm font-semibold text-slate-700">
                            Month
                        </label>
                        <input
                            type="month"
                            value={filters.month || ""}
                            onChange={(e) =>
                                runFilter({
                                    month: e.target.value,
                                    date: "",
                                    date_from: "",
                                    date_to: "",
                                })
                            }
                            className="mt-1 block rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none"
                        />
                    </div>

                    <div className="flex flex-wrap gap-2">
                        <button
                            type="button"
                            onClick={() =>
                                runFilter({
                                    date: quickRanges.today,
                                    date_from: "",
                                    date_to: "",
                                    month: "",
                                })
                            }
                            className="rounded-lg border border-slate-300 px-3 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-100"
                        >
                            Today
                        </button>
                        <button
                            type="button"
                            onClick={() =>
                                runFilter({
                                    date: "",
                                    date_from: quickRanges.weekFrom,
                                    date_to: quickRanges.weekTo,
                                    month: "",
                                })
                            }
                            className="rounded-lg border border-slate-300 px-3 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-100"
                        >
                            This Week
                        </button>
                        <button
                            type="button"
                            onClick={() =>
                                runFilter({
                                    date: "",
                                    date_from: "",
                                    date_to: "",
                                    month: quickRanges.month,
                                })
                            }
                            className="rounded-lg border border-slate-300 px-3 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-100"
                        >
                            This Month
                        </button>
                        <button
                            type="button"
                            onClick={() => router.get(route(filterRoute), filterParams)}
                            className="rounded-lg border border-slate-300 px-3 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-100"
                        >
                            Clear
                        </button>
                    </div>
                </div>

            </motion.div>

            <div className="mt-6 overflow-x-auto rounded-lg border border-slate-200 bg-white shadow-sm">
                {monitoringControls && (
                    <div className="flex items-center justify-between gap-3 border-b border-slate-200 px-4 py-3 text-sm text-slate-600">
                        <span>
                            {selectedIds.length} selected on this page
                        </span>
                        <div className="flex items-center gap-3">
                            {selectedIds.length > 0 && (
                                <>
                                    <ConfirmPasswordDialog
                                        trigger={
                                            <button
                                                type="button"
                                                className="inline-flex items-center gap-1 rounded-lg bg-red-600 px-3 py-1.5 text-xs font-semibold text-white transition hover:bg-red-700"
                                            >
                                                <Trash2 className="h-3.5 w-3.5" />
                                                Delete selected
                                            </button>
                                        }
                                        title="Delete Selected Locator Slips"
                                        description="This will permanently remove all selected locator slip records."
                                        action={route(
                                            "slip-monitoring.destroy-many",
                                            deleteType,
                                        )}
                                        method="delete"
                                        data={{ ids: selectedIds }}
                                        itemLabel="Selected Records"
                                        itemName={`${selectedIds.length} locator slip record(s)`}
                                        confirmText="Delete Selected"
                                        processingText="Deleting..."
                                        onSuccess={() => setSelectedIds([])}
                                    />
                                    <button
                                        type="button"
                                        onClick={() => setSelectedIds([])}
                                        className="font-semibold text-blue-700 hover:text-blue-800"
                                    >
                                        Clear selection
                                    </button>
                                </>
                            )}
                        </div>
                    </div>
                )}
                <table className="min-w-full divide-y divide-gray-200 text-sm">
                    <thead className="bg-gray-50">
                        <tr>
                            {monitoringControls && (
                                <>
                                    <th className="w-12 px-4 py-3 text-center font-medium text-gray-700">
                                        <input
                                            type="checkbox"
                                            checked={allSelected}
                                            onChange={(e) =>
                                                setSelectedIds(
                                                    e.target.checked
                                                        ? slips.map(
                                                              (slip) => slip.id,
                                                          )
                                                        : [],
                                                )
                                            }
                                            className="rounded border-slate-300 text-blue-700 focus:ring-blue-600"
                                        />
                                    </th>
                                    <th className="w-16 px-4 py-3 text-left font-medium text-gray-700">
                                        No.
                                    </th>
                                </>
                            )}
                            <th className="px-6 py-3 text-left font-medium text-gray-700">
                                Employee
                            </th>
                            <th className="px-6 py-3 text-left font-medium text-gray-700">
                                Purpose
                            </th>
                            <th className="px-6 py-3 text-left font-medium text-gray-700">
                                Destination
                            </th>
                            <th className="px-6 py-3 text-left font-medium text-gray-700">
                                Date / Time
                            </th>
                            <th className="px-6 py-3 text-left font-medium text-gray-700">
                                Submitted Date
                            </th>
                            <th className="px-6 py-3 text-center font-medium text-gray-700">
                                Actions
                            </th>
                        </tr>
                    </thead>

                    <tbody className="divide-y divide-gray-200">
                        {slips.length > 0 ? (
                            slips.map((slip, index) => (
                                <tr
                                    key={slip.id}
                                    className="transition hover:bg-gray-50"
                                >
                                    {monitoringControls && (
                                        <>
                                            <td className="px-4 py-3 text-center">
                                                <input
                                                    type="checkbox"
                                                    checked={selectedIds.includes(
                                                        slip.id,
                                                    )}
                                                    onChange={() =>
                                                        toggleSelected(slip.id)
                                                    }
                                                    className="rounded border-slate-300 text-blue-700 focus:ring-blue-600"
                                                />
                                            </td>
                                            <td className="px-4 py-3 font-semibold text-slate-600">
                                                {pageStart + index}
                                            </td>
                                        </>
                                    )}
                                    <td className="px-6 py-3">
                                        {getEmployeeName(slip) || "-"}
                                    </td>
                                    <td className="px-6 py-3">
                                        {slip.purpose_of_travel || "-"}
                                    </td>
                                    <td className="px-6 py-3">
                                        {slip.destination || "-"}
                                    </td>
                                    <td className="px-6 py-3">
                                        {slip.travel_datetime
                                            ? new Date(
                                                  slip.travel_datetime,
                                              ).toLocaleString("en-PH", {
                                                  year: "numeric",
                                                  month: "long",
                                                  day: "numeric",
                                                  hour: "2-digit",
                                                  minute: "2-digit",
                                                  second: "2-digit",
                                                  hour12: true,
                                              })
                                            : "-"}
                                    </td>
                                    <td className="px-6 py-3">
                                        {formatDate(slip.created_at)}
                                    </td>
                                    <td className="px-6 py-3">
                                        <div className="flex flex-wrap justify-center gap-2">
                                        <button
                                            onClick={() => handlePreview(slip)}
                                            className="rounded-lg bg-blue-600 px-3 py-1 text-xs font-medium text-white transition hover:bg-blue-700"
                                        >
                                            Preview / PDF
                                        </button>
                                        {monitoringControls && (
                                            <ConfirmPasswordDialog
                                                trigger={
                                                    <button
                                                        type="button"
                                                        className="inline-flex items-center gap-1 rounded-lg bg-red-600 px-3 py-1 text-xs font-medium text-white transition hover:bg-red-700"
                                                    >
                                                        <Trash2 className="h-3.5 w-3.5" />
                                                        Delete
                                                    </button>
                                                }
                                                title="Delete Locator Slip"
                                                description="This will permanently remove this locator slip record."
                                                action={route(
                                                    "slip-monitoring.destroy",
                                                    [deleteType, slip.id],
                                                )}
                                                method="delete"
                                                itemLabel="Locator Slip"
                                                itemName={
                                                    getEmployeeName(slip) ||
                                                    `Record #${slip.id}`
                                                }
                                                confirmText="Delete Slip"
                                                processingText="Deleting..."
                                                onSuccess={() =>
                                                    setSelectedIds((current) =>
                                                        current.filter(
                                                            (id) =>
                                                                id !== slip.id,
                                                        ),
                                                    )
                                                }
                                            />
                                        )}
                                        </div>
                                    </td>
                                </tr>
                            ))
                        ) : (
                            <tr>
                                <td
                                    colSpan={monitoringControls ? 8 : 6}
                                    className="px-6 py-6 text-center text-gray-500"
                                >
                                    {getFilterSummary(filters, "locator slips")}
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>

                {locator_slips.links && (
                    <div className="flex flex-wrap items-center justify-center gap-2 border-t border-slate-200 p-4">
                        {locator_slips.links.map((link, index) => (
                            <button
                                key={index}
                                disabled={!link.url}
                                onClick={() => {
                                    if (link.url) {
                                        router.visit(link.url, {
                                            preserveState: true,
                                        });
                                    }
                                }}
                                dangerouslySetInnerHTML={{
                                    __html: link.label,
                                }}
                                className={`rounded-lg px-3 py-2 text-sm font-semibold transition ${
                                    link.active
                                        ? "bg-blue-700 text-white"
                                        : "border border-slate-300 bg-white text-slate-700 hover:bg-slate-100"
                                } ${
                                    !link.url
                                        ? "cursor-not-allowed opacity-50"
                                        : ""
                                }`}
                            />
                        ))}
                    </div>
                )}
            </div>

            <LocatorSlipPrintDialog
                open={open}
                onClose={() => setOpen(false)}
                slip={selectedSlip}
            />
        </>
    );
};

export default LocatorSlipTable;
