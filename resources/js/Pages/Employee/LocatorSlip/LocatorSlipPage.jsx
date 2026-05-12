"use client";

import React, { useState } from "react";
import LocatorSlipForm from "./Partials/LocatorSlipForm";
import LocatorSlipTable from "./Partials/LocatorSlipTable";
import { Head, Link } from "@inertiajs/react";
import { motion } from "framer-motion";
import {
    ArrowLeft,
    CalendarClock,
    ClipboardPlus,
    FileText,
    History,
    MapPinned,
    Route,
    ShieldCheck,
} from "lucide-react";

const pageVariants = {
    hidden: { opacity: 0 },
    visible: {
        opacity: 1,
        transition: {
            staggerChildren: 0.08,
        },
    },
};

const itemVariants = {
    hidden: { opacity: 0, y: 18 },
    visible: {
        opacity: 1,
        y: 0,
        transition: { duration: 0.45, ease: "easeOut" },
    },
};

const statCards = [
    {
        label: "Total Slips",
        icon: FileText,
        color: "text-blue-700",
        getValue: ({ slipCount }) => slipCount,
    },
    {
        label: "Latest Date",
        icon: CalendarClock,
        color: "text-emerald-700",
        getValue: ({ latestDate }) => latestDate,
    },
    {
        label: "Latest Destination",
        icon: Route,
        color: "text-amber-600",
        getValue: ({ latestSlip }) =>
            latestSlip?.destination || "No destination",
    },
];

export default function LocatorSlipPage({
    locator_slips,
    employee = null,
    filters = {},
    success_message,
}) {
    const [showForm, setShowForm] = useState(false);
    const slips = locator_slips.data || [];

    const slipCount = locator_slips.total || 0;
    const latestSlip = slips[0];
    const latestDate = latestSlip?.travel_datetime
        ? new Date(latestSlip.travel_datetime).toLocaleDateString("en-PH", {
              month: "short",
              day: "numeric",
              year: "numeric",
          })
        : "No records";

    return (
        <>
            <Head title="Locator Slips" />

            <main className="min-h-screen bg-slate-50 text-slate-950">
                <header className="sticky top-0 z-30 border-b border-slate-200 bg-white/95 backdrop-blur">
                    <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-5">
                        <Link
                            href={route("landing")}
                            className="inline-flex h-10 items-center gap-2 rounded-lg px-2 text-sm font-semibold text-slate-700 transition hover:bg-slate-100 hover:text-blue-700"
                        >
                            <ArrowLeft className="h-4 w-4" />
                            TimeVault
                        </Link>

                        <Link
                            href={route("landing")}
                            className="rounded-lg border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-700 transition hover:bg-slate-100"
                        >
                            Back
                        </Link>
                    </div>
                </header>

                <motion.section
                    variants={pageVariants}
                    initial="hidden"
                    animate="visible"
                    className="mx-auto max-w-7xl px-5 py-8 sm:py-10"
                >
                    {success_message && (
                        <motion.div
                            variants={itemVariants}
                            className="mb-5 rounded-lg border border-emerald-200 bg-emerald-50 p-3 text-sm font-medium text-emerald-800"
                        >
                            {success_message}
                        </motion.div>
                    )}

                    <motion.div
                        variants={itemVariants}
                        className="overflow-hidden rounded-lg border border-slate-200 bg-white shadow-sm"
                    >
                        <div className="grid gap-0 lg:grid-cols-[1fr_360px]">
                            <div className="p-6 sm:p-8">
                                <div className="mb-5 inline-flex items-center gap-2 rounded-lg border border-blue-100 bg-blue-50 px-3 py-2 text-sm font-semibold text-blue-700">
                                    <MapPinned className="h-4 w-4" />
                                    Locator slip request
                                </div>

                                <h1 className="max-w-3xl text-4xl font-black leading-tight text-slate-950 sm:text-5xl">
                                    Locator Slip
                                </h1>

                                <p className="mt-4 max-w-2xl text-base leading-7 text-slate-600">
                                    Create and review movement records through a
                                    focused public form.
                                </p>

                                <div className="mt-7 flex flex-col gap-3 sm:flex-row sm:items-center">
                                    <motion.button
                                        type="button"
                                        onClick={() => setShowForm(true)}
                                        whileHover={{ y: -2, scale: 1.02 }}
                                        whileTap={{ scale: 0.98 }}
                                        className="inline-flex h-12 items-center justify-center gap-2 rounded-lg bg-blue-700 px-5 text-sm font-bold text-white shadow-lg shadow-blue-700/20 transition hover:bg-blue-800"
                                    >
                                        <ClipboardPlus className="h-4 w-4" />
                                        Add Locator Slip
                                    </motion.button>

                                    <div className="inline-flex h-12 items-center gap-2 rounded-lg border border-slate-200 bg-slate-50 px-4 text-sm font-semibold text-slate-600">
                                        <ShieldCheck className="h-4 w-4 text-emerald-700" />
                                        Public access
                                    </div>
                                </div>
                            </div>

                            <div className="border-t border-slate-200 bg-slate-900 p-6 text-white lg:border-l lg:border-t-0">
                                <div className="flex h-full min-h-56 flex-col justify-between">
                                    <div>
                                        <div className="inline-flex h-11 w-11 items-center justify-center rounded-lg bg-white/10">
                                            <History className="h-5 w-5" />
                                        </div>
                                        <p className="mt-5 text-sm font-semibold text-slate-300">
                                            Current Records
                                        </p>
                                        <p className="mt-1 text-5xl font-black">
                                            {slipCount}
                                        </p>
                                    </div>

                                    <div className="mt-8 rounded-lg border border-white/10 bg-white/10 p-4">
                                        <p className="text-xs font-semibold uppercase tracking-wide text-slate-300">
                                            Latest destination
                                        </p>
                                        <p className="mt-2 truncate text-lg font-bold text-white">
                                            {latestSlip?.destination ||
                                                "No destination yet"}
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </motion.div>

                    <motion.div
                        variants={itemVariants}
                        className="mt-8 grid gap-4 md:grid-cols-3"
                    >
                        {statCards.map(
                            ({ label, icon: Icon, color, getValue }) => (
                                <motion.div
                                    key={label}
                                    whileHover={{ y: -4 }}
                                    className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm transition-shadow hover:shadow-md"
                                >
                                    <Icon className={`h-5 w-5 ${color}`} />
                                    <p className="mt-4 text-sm font-semibold text-slate-500">
                                        {label}
                                    </p>
                                    <p className="mt-1 truncate text-2xl font-black text-slate-950 sm:text-3xl">
                                        {getValue({
                                            slipCount,
                                            latestDate,
                                            latestSlip,
                                        })}
                                    </p>
                                </motion.div>
                            ),
                        )}
                    </motion.div>

                    {showForm && (
                        <LocatorSlipForm
                            onClose={() => setShowForm(false)}
                            employee={employee}
                        />
                    )}

                    <motion.div
                        variants={itemVariants}
                        className="mt-8 overflow-hidden rounded-lg border border-slate-200 bg-white shadow-sm"
                    >
                        <div className="flex flex-col gap-3 border-b border-slate-200 px-5 py-4 sm:flex-row sm:items-center sm:justify-between">
                            <div>
                                <h2 className="text-lg font-bold text-slate-950">
                                    Locator Slip Records
                                </h2>
                                <p className="text-sm text-slate-500">
                                    Recently submitted locator slips appear
                                    here.
                                </p>
                            </div>
                            <span className="inline-flex w-fit items-center rounded-lg bg-slate-100 px-3 py-1 text-xs font-bold text-slate-600">
                                {slipCount}{" "}
                                {slipCount === 1 ? "record" : "records"}
                            </span>
                        </div>
                        <div className="overflow-x-auto">
                            <LocatorSlipTable
                                slips={slips}
                                filters={filters}
                                locator_slips={locator_slips}
                            />
                        </div>
                    </motion.div>
                </motion.section>
            </main>
        </>
    );
}
