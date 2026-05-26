"use client";

import React, { useMemo, useState } from "react";
import { router } from "@inertiajs/react";
import FloatingInput from "@/components/floating-input";
import { Search } from "lucide-react";
import TravelOrderPrintDialog from "./TravelOrderPrintDialog";
import { getRecordEmployeeName } from "@/lib/utils";

const formatDate = (value, options = {}) =>
    value
        ? new Date(value).toLocaleDateString("en-PH", {
              year: "numeric",
              month: "long",
              day: "numeric",
              ...options,
          })
        : "-";

const getSearchText = (record) =>
    [
        getRecordEmployeeName(record),
        record.position,
        record.permanent_station,
        record.employee?.position,
        record.employee?.station?.name,
        record.purpose_of_travel,
        record.host_of_activity,
        record.inclusive_dates,
        record.destination,
        record.fund_source,
    ]
        .filter(Boolean)
        .join(" ")
        .toLowerCase();

const getFilterSummary = (filters) => {
    if (filters.date) return `No Travel Orders found for ${formatDate(filters.date)}.`;
    if (filters.month) {
        return `No Travel Orders found for ${formatDate(`${filters.month}-01`, {
            day: undefined,
        })}.`;
    }
    if (filters.search) return `No Travel Orders found for "${filters.search}".`;
    return "No Travel Orders found.";
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

const TravelOrderTable = ({
    travelOrders = [],
    pagination = null,
    filters = {},
    filterRoute = "travel-order",
    filterParams = {},
}) => {
    const [selectedOrder, setSelectedOrder] = useState(null);
    const [open, setOpen] = useState(false);
    const [searchInput, setSearchInput] = useState(filters.search || "");
    const [isSearchFocused, setIsSearchFocused] = useState(false);

    const handlePreview = (order) => {
        setSelectedOrder(order);
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

        return travelOrders
            .filter((order) => getSearchText(order).includes(query))
            .map((order) => ({
                id: order.id,
                value: getRecordEmployeeName(order) || order.destination || "",
                title: getRecordEmployeeName(order) || "Unnamed employee",
                subtitle: order.destination || order.purpose_of_travel || "",
            }))
            .filter((item) => {
                const key = `${item.value}-${item.subtitle}`.toLowerCase();
                if (!item.value || seen.has(key)) return false;
                seen.add(key);
                return true;
            })
            .slice(0, 6);
    }, [travelOrders, searchInput]);

    const quickRanges = getQuickRanges();

    return (
        <>
            <div className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm">
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
                            label="Search Travel Order"
                            icon={Search}
                            name="travel-order-search"
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
                                        Travel orders
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

            </div>

            <div className="mt-6 overflow-x-auto rounded-lg border border-slate-200 bg-white shadow-sm">
                <table className="min-w-full divide-y divide-gray-200 text-sm">
                    <thead className="bg-gray-50">
                        <tr>
                            <th className="px-6 py-3 text-left font-medium text-gray-700">
                                Employee
                            </th>
                            <th className="px-6 py-3 text-left font-medium text-gray-700">
                                Purpose
                            </th>
                            <th className="px-6 py-3 text-left font-medium text-gray-700">
                                Host
                            </th>
                            <th className="px-6 py-3 text-left font-medium text-gray-700">
                                Destination
                            </th>
                            <th className="px-6 py-3 text-left font-medium text-gray-700">
                                Travel Date
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
                        {travelOrders.length > 0 ? (
                            travelOrders.map((order) => (
                                <tr
                                    key={order.id}
                                    className="transition hover:bg-gray-50"
                                >
                                    <td className="px-6 py-3">
                                        {getRecordEmployeeName(order) || "-"}
                                    </td>
                                    <td className="px-6 py-3">
                                        {order.purpose_of_travel || "-"}
                                    </td>
                                    <td className="px-6 py-3">
                                        {order.host_of_activity || "-"}
                                    </td>
                                    <td className="px-6 py-3">
                                        {order.destination || "-"}
                                    </td>
                                    <td className="px-6 py-3">
                                        {formatDate(order.inclusive_dates)}
                                    </td>
                                    <td className="px-6 py-3">
                                        {formatDate(order.created_at)}
                                    </td>
                                    <td className="px-6 py-3 text-center">
                                        <button
                                            onClick={() => handlePreview(order)}
                                            className="rounded-lg bg-blue-600 px-3 py-1 text-xs font-medium text-white transition hover:bg-blue-700"
                                        >
                                            Preview / PDF
                                        </button>
                                    </td>
                                </tr>
                            ))
                        ) : (
                            <tr>
                                <td
                                    colSpan={7}
                                    className="px-6 py-6 text-center text-gray-500"
                                >
                                    {getFilterSummary(filters)}
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>

                {pagination?.links && (
                    <div className="flex flex-wrap items-center justify-center gap-2 border-t border-slate-200 p-4">
                        {pagination.links.map((link, index) => (
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

            <TravelOrderPrintDialog
                open={open}
                onClose={() => setOpen(false)}
                order={selectedOrder}
            />
        </>
    );
};

export default TravelOrderTable;

