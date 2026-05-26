import React, { useEffect, useState } from "react";
import { Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";

const todayDate = () => {
    const today = new Date();
    const year = today.getFullYear();
    const month = String(today.getMonth() + 1).padStart(2, "0");
    const day = String(today.getDate()).padStart(2, "0");

    return `${year}-${month}-${day}`;
};

const monthStartDate = (month, year) =>
    `${year}-${String(month).padStart(2, "0")}-01`;

const RecomputeDtrDialog = ({
    employee,
    onClose,
    onSubmit,
    selectedMonth,
    selectedYear,
}) => {
    const [mode, setMode] = useState("month");
    const [from, setFrom] = useState(monthStartDate(selectedMonth, selectedYear));
    const to = todayDate();
    const isOpen = Boolean(employee);

    useEffect(() => {
        if (!isOpen) return;

        setMode("month");
        setFrom(monthStartDate(selectedMonth, selectedYear));
    }, [isOpen, selectedMonth, selectedYear]);

    const selectMonth = () => {
        setMode("month");
        setFrom(monthStartDate(selectedMonth, selectedYear));
    };

    const submit = () => {
        onSubmit?.({ from, to });
    };

    const choiceClass = (isSelected) =>
        `rounded-xl border px-4 py-3 text-left transition ${
            isSelected
                ? "border-blue-500 bg-blue-50 text-blue-900"
                : "border-slate-200 bg-white text-slate-700 hover:bg-blue-50"
        }`;

    return (
        <Dialog
            open={isOpen}
            onOpenChange={(nextOpen) => {
                if (!nextOpen) onClose?.();
            }}
        >
            <DialogContent className="max-w-md rounded-2xl">
                <DialogHeader>
                    <DialogTitle>Recompute DTR</DialogTitle>
                    <DialogDescription>
                        Choose what records to recompute for{" "}
                        {employee?.full_name || "this employee"}.
                    </DialogDescription>
                </DialogHeader>

                <div className="grid gap-3">
                    <div className="grid gap-2">
                        <button
                            type="button"
                            className={choiceClass(mode === "month")}
                            onClick={selectMonth}
                        >
                            <div className="flex items-center justify-between gap-3">
                                <div>
                                    <div className="text-sm font-semibold">
                                        This Month
                                    </div>
                                    <div className="text-xs text-slate-500">
                                        From the first day of the selected month.
                                    </div>
                                </div>
                                {mode === "month" ? (
                                    <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-blue-600">
                                        <Check className="h-3 w-3 text-white" />
                                    </span>
                                ) : null}
                            </div>
                        </button>

                        <button
                            type="button"
                            className={choiceClass(mode === "custom")}
                            onClick={() => setMode("custom")}
                        >
                            <div className="flex items-center justify-between gap-3">
                                <div>
                                    <div className="text-sm font-semibold">
                                        Custom From
                                    </div>
                                    <div className="text-xs text-slate-500">
                                        Choose the start date manually.
                                    </div>
                                </div>
                                {mode === "custom" ? (
                                    <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-blue-600">
                                        <Check className="h-3 w-3 text-white" />
                                    </span>
                                ) : null}
                            </div>
                        </button>
                    </div>

                    {mode === "custom" ? (
                        <div>
                            <label className="mb-2 block text-sm font-medium text-slate-700">
                                From
                            </label>
                            <Input
                                type="date"
                                value={from}
                                max={to}
                                onChange={(event) => setFrom(event.target.value)}
                            />
                        </div>
                    ) : null}

                    <div className="text-xs text-slate-500">
                        Records from {from} to {to} will be recomputed.
                    </div>
                </div>

                <DialogFooter>
                    <Button type="button" variant="outline" onClick={onClose}>
                        Cancel
                    </Button>
                    <Button
                        type="button"
                        className="bg-blue-700 text-white hover:bg-blue-800"
                        disabled={!from || to < from}
                        onClick={submit}
                    >
                        Recompute
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
};

export default RecomputeDtrDialog;

