"use client";

import React, { useState } from "react";
import { Head, Link } from "@inertiajs/react";
import { motion } from "framer-motion";
import {
    ArrowLeft,
    ClipboardPlus,
    History,
    Printer,
    ShieldCheck,
    Umbrella,
} from "lucide-react";
import ApplicationLeaveForm from "./Partials/ApplicationLeaveForm";
import ApplicationLeavePrintDialog from "./Partials/ApplicationLeavePrintDialog";

const pageVariants = {
    hidden: { opacity: 0 },
    visible: {
        opacity: 1,
        transition: { staggerChildren: 0.08 },
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

export default function ApplicationLeavePage({
    employee = null,
    created_application = null,
    success_message,
}) {
    const [showForm, setShowForm] = useState(false);
    const [printOpen, setPrintOpen] = useState(false);

    return (
        <>
            <Head title="Application for Leave" />

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
                    {(success_message || created_application) && (
                        <motion.div
                            variants={itemVariants}
                            className="mb-5 flex flex-col gap-3 rounded-lg border border-emerald-200 bg-emerald-50 p-3 text-sm font-medium text-emerald-800 sm:flex-row sm:items-center sm:justify-between"
                        >
                            <span>
                                {success_message ||
                                    "Application for Leave is ready for PDF download."}
                            </span>
                            {created_application && (
                                <button
                                    type="button"
                                    onClick={() => setPrintOpen(true)}
                                    className="inline-flex w-fit items-center gap-2 rounded-lg bg-blue-700 px-4 py-2 text-sm font-bold text-white transition hover:bg-blue-800"
                                >
                                    <Printer className="h-4 w-4" />
                                    Print / Download PDF
                                </button>
                            )}
                        </motion.div>
                    )}

                    <motion.div
                        variants={itemVariants}
                        className="overflow-hidden rounded-lg border border-slate-200 bg-white shadow-sm"
                    >
                        <div className="grid gap-0 lg:grid-cols-[1fr_360px]">
                            <div className="p-6 sm:p-8">
                                <div className="mb-5 inline-flex items-center gap-2 rounded-lg border border-blue-100 bg-blue-50 px-3 py-2 text-sm font-semibold text-blue-700">
                                    <Umbrella className="h-4 w-4" />
                                    Leave application request
                                </div>

                                <h1 className="max-w-3xl text-4xl font-black leading-tight text-slate-950 sm:text-5xl">
                                    Application for Leave
                                </h1>

                                <p className="mt-4 max-w-2xl text-base leading-7 text-slate-600">
                                    Prepare and review Civil Service Form No. 6
                                    leave applications through a focused public
                                    form.
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
                                        Add Leave Application
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
                                            Admin Monitoring
                                        </p>
                                        <p className="mt-1 text-5xl font-black">
                                            Private
                                        </p>
                                    </div>

                                    <div className="mt-8 rounded-lg border border-white/10 bg-white/10 p-4">
                                        <p className="text-xs font-semibold uppercase tracking-wide text-slate-300">
                                            Submitted records
                                        </p>
                                        <p className="mt-2 text-lg font-bold text-white">
                                            Available in Slip Monitoring
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </motion.div>

                    {showForm && (
                        <ApplicationLeaveForm
                            onClose={() => setShowForm(false)}
                            employee={employee}
                        />
                    )}

                    <ApplicationLeavePrintDialog
                        open={printOpen}
                        onClose={() => setPrintOpen(false)}
                        application={created_application}
                    />
                </motion.section>
            </main>
        </>
    );
}
