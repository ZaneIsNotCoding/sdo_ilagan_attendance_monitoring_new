"use client";

import React, { useState } from "react";
import { router } from "@inertiajs/react";
import { motion } from "framer-motion";
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

const LocatorSlipTable = ({ slips = [], filters = {}, locator_slips = {} }) => {
    const [selectedSlip, setSelectedSlip] = useState(null);
    const [open, setOpen] = useState(false);

    const handlePreview = (slip) => {
        setSelectedSlip(slip);
        setOpen(true);
    };

    return (
        <>
            {/* FILTER */}
            <motion.div
                variants={itemVariants}
                initial="hidden"
                animate="visible"
                className="mt-8 rounded-lg border border-slate-200 bg-white p-4 shadow-sm"
            >
                <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
                    <div>
                        <label className="text-sm font-semibold text-slate-700">
                            Filter by Date
                        </label>

                        <input
                            type="date"
                            value={filters.date || ""}
                            onChange={(e) => {
                                router.get(
                                    route("locator-slips"),
                                    {
                                        date: e.target.value,
                                    },
                                    {
                                        preserveState: true,
                                        replace: true,
                                    },
                                );
                            }}
                            className="mt-1 block rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none"
                        />
                    </div>

                    <button
                        onClick={() => router.get(route("locator-slips"))}
                        className="rounded-lg border border-slate-300 px-4 py-2 text-sm font-semibold text-slate-700 transition hover:bg-slate-100"
                    >
                        Reset Filter
                    </button>
                </div>
            </motion.div>

            {/* TABLE */}
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
                                Destination
                            </th>

                            <th className="px-6 py-3 text-left font-medium text-gray-700">
                                Date / Time
                            </th>

                            <th className="px-6 py-3 text-center font-medium text-gray-700">
                                Actions
                            </th>
                        </tr>
                    </thead>

                    <tbody className="divide-y divide-gray-200">
                        {slips.length > 0 ? (
                            slips.map((slip) => (
                                <tr
                                    key={slip.id}
                                    className="transition hover:bg-gray-50"
                                >
                                    <td className="px-6 py-3">
                                        {slip.employee_name
                                            ? slip.employee_name
                                            : slip.employee
                                              ? `${slip.employee.first_name ?? ""} ${slip.employee.middle_name ?? ""} ${slip.employee.last_name ?? ""}`
                                                    .replace(/\s+/g, " ")
                                                    .trim()
                                              : "—"}
                                    </td>

                                    <td className="px-6 py-3">
                                        {slip.purpose_of_travel || "—"}
                                    </td>

                                    <td className="px-6 py-3">
                                        {slip.destination || "—"}
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
                                            : "—"}
                                    </td>

                                    <td className="px-6 py-3 text-center">
                                        <button
                                            onClick={() => handlePreview(slip)}
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
                                    colSpan={5}
                                    className="px-6 py-6 text-center text-gray-500"
                                >
                                    No locator slips found.
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>

                {/* PAGINATION */}
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
                                className={`rounded-lg px-3 py-2 text-sm font-semibold transition
                                    ${
                                        link.active
                                            ? "bg-blue-700 text-white"
                                            : "border border-slate-300 bg-white text-slate-700 hover:bg-slate-100"
                                    }
                                    ${
                                        !link.url
                                            ? "cursor-not-allowed opacity-50"
                                            : ""
                                    }
                                `}
                            />
                        ))}
                    </div>
                )}
            </div>

            {/* PRINT DIALOG */}
            <LocatorSlipPrintDialog
                open={open}
                onClose={() => setOpen(false)}
                slip={selectedSlip}
            />
        </>
    );
};

export default LocatorSlipTable;
