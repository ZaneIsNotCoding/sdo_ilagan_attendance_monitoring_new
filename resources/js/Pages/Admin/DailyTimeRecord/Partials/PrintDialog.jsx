import React, { useEffect, useRef, useState } from "react";
import dayjs from "dayjs";
import html2pdf from "html2pdf.js";
import { Check, Printer, Users } from "lucide-react";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/Components/ui/button";
import EmployeeAvatar from "@/Components/EmployeeAvatar";
import DTRReport from "@/Pages/DocumentsFormats/DtrReport";
import { Skeleton } from "@/components/ui/skeleton";

const monthNames = [
    "January",
    "February",
    "March",
    "April",
    "May",
    "June",
    "July",
    "August",
    "September",
    "October",
    "November",
    "December",
];

const signatoryChoices = [
    { value: "office_head", label: "Office Head" },
    { value: "division_head", label: "Division Head" },
];

const formatMonth = (month) => monthNames[Number(month) - 1] || monthNames[0];

const employeeDepartment = (employee) =>
    employee?.department || employee?.office?.name || "No Department";

const fallbackSignatory = (employee) => ({
    name: "Loading signatory...",
    position: "Signatory",
    office: employeeDepartment(employee),
    employee: null,
    type: "office_head",
    missing: true,
});

const employeeSignatory = (employee, employeeData) =>
    employeeData[employee.id]?.signatory || fallbackSignatory(employee);

const resolveSignatory = (employee, employeeData, signatoryType) => {
    const data = employeeData[employee.id];

    return (
        data?.signatories?.[signatoryType] ||
        employeeSignatory(employee, employeeData)
    );
};

const generateLogs = (timeRecord, selectedMonth, selectedYear) => {
    const attendances = timeRecord.attendances || [];
    const month = String(selectedMonth).padStart(2, "0");
    const start = dayjs(`${selectedYear}-${month}-01`).startOf("month");
    const end = dayjs(`${selectedYear}-${month}-01`).endOf("month");
    const days = [];
    let current = start;

    while (current.isBefore(end) || current.isSame(end, "day")) {
        days.push(current);
        current = current.add(1, "day");
    }

    return days.map((date) => {
        const attendance = attendances.find((item) =>
            dayjs(item.date).isSame(date, "day"),
        );

        return {
            date: date.format("YYYY-MM-DD"),
            amIn: attendance?.am?.am_time_in || "-",
            amOut: attendance?.am?.am_time_out || "-",
            pmIn: attendance?.pm?.pm_time_in || "-",
            pmOut: attendance?.pm?.pm_time_out || "-",
            undertime: attendance?.tardiness_record?.converted_tardy || "-",
        };
    });
};

const SignatorySkeleton = () => (
    <div className="flex items-center justify-between rounded-xl border border-slate-200 bg-white/80 px-3 py-3">
        <div className="flex min-w-0 items-center gap-3">
            <Skeleton className="h-10 w-10 shrink-0 rounded-full" />
            <div className="min-w-0 flex-1 space-y-2">
                <Skeleton className="h-4 w-28" />
                <Skeleton className="h-3 w-40" />
            </div>
        </div>
        <Skeleton className="ml-3 h-6 w-6 shrink-0 rounded-full" />
    </div>
);

const EmployeeRowSkeleton = () => (
    <div className="flex items-center justify-between gap-3 rounded-xl px-3 py-2.5">
        <div className="flex min-w-0 items-center gap-3">
            <Skeleton className="h-10 w-10 shrink-0 rounded-full" />
            <div className="min-w-0 space-y-2">
                <Skeleton className="h-4 w-44" />
                <Skeleton className="h-3 w-64 max-w-full" />
            </div>
        </div>
        <Skeleton className="h-6 w-14 rounded-full" />
    </div>
);

const PrintDialog = ({
    open,
    onClose,
    selectedEmployees = [],
    initialEmployeeData = {},
    selectedMonth,
    selectedYear,
}) => {
    const initialEmployee = selectedEmployees[0] || {};
    const [isGenerating, setIsGenerating] = useState(false);
    const [employeeData, setEmployeeData] = useState(initialEmployeeData);
    const [signatoryType, setSignatoryType] = useState(
        initialEmployeeData[initialEmployee.id]?.signatory?.type ||
            "office_head",
    );
    const pdfRefs = useRef({});
    const printEmployees = selectedEmployees;

    useEffect(() => {
        if (!open) return;

        setEmployeeData((current) => ({
            ...current,
            ...initialEmployeeData,
        }));
    }, [open, initialEmployeeData]);

    const firstEmployee = printEmployees[0] || {};
    const selectedEmployeeData = employeeData[firstEmployee.id];
    const defaultSignatoryType = employeeData[firstEmployee.id]?.signatory?.type;
    const isLoadingEmployeeData = printEmployees.some(
        (employee) => !employeeData[employee.id],
    );
    const isSignatoryLoading = open && firstEmployee.id && !selectedEmployeeData;

    useEffect(() => {
        if (!open) return;
        if (!["office_head", "division_head"].includes(defaultSignatoryType)) {
            return;
        }

        setSignatoryType(defaultSignatoryType);
    }, [open, defaultSignatoryType]);

    const handleDownloadPDF = async () => {
        setIsGenerating(true);

        for (const employee of printEmployees) {
            const element = pdfRefs.current[employee.id];
            if (!element) continue;

            await new Promise((resolve) => setTimeout(resolve, 50));

            await html2pdf()
                .set({
                    margin: 0.5,
                    filename: `DTR_${(employee.full_name || "employee").replace(
                        /\s+/g,
                        "_",
                    )}_${selectedYear}-${String(selectedMonth).padStart(
                        2,
                        "0",
                    )}.pdf`,
                    image: { type: "jpeg", quality: 0.98 },
                    html2canvas: { scale: 2 },
                    jsPDF: {
                        unit: "in",
                        format: "letter",
                        orientation: "portrait",
                    },
                })
                .from(element)
                .save();
        }

        setIsGenerating(false);
        onClose();
    };

    return (
        <Dialog open={open} onOpenChange={(nextOpen) => !nextOpen && onClose()}>
            <DialogContent className="max-h-[92vh] max-w-3xl overflow-y-auto rounded-2xl p-0">
                <div className="bg-gradient-to-r from-blue-600 to-blue-500 p-5 text-white">
                    <DialogHeader>
                        <DialogTitle className="flex items-center gap-2 text-white">
                            <Printer className="h-5 w-5" />
                            Print Daily Time Records
                        </DialogTitle>
                        <DialogDescription className="text-blue-100">
                            Printing {formatMonth(selectedMonth)} {selectedYear}
                        </DialogDescription>
                    </DialogHeader>
                </div>

                <div className="space-y-4 px-5 pb-5 pt-4">
                    <div className="rounded-2xl border border-blue-100 bg-gradient-to-br from-slate-50 via-white to-blue-50/80 p-4 shadow-sm">
                        <div className="mb-3 flex items-center justify-between gap-3">
                            <div>
                                <p className="text-sm font-semibold text-slate-800">
                                    Choose Signatory
                                </p>
                                <p className="text-xs text-slate-500">
                                    Select who will sign the printed DTR.
                                </p>
                            </div>
                            <span className="rounded-full bg-blue-100 px-2.5 py-1 text-xs font-semibold text-blue-700">
                                {formatMonth(selectedMonth)} {selectedYear}
                            </span>
                        </div>

                        {isSignatoryLoading ? (
                            <div className="grid gap-3 md:grid-cols-2">
                                <SignatorySkeleton />
                                <SignatorySkeleton />
                            </div>
                        ) : (
                            <div className="grid gap-3 md:grid-cols-2">
                                {signatoryChoices.map((choice) => {
                                    const isSelected =
                                        signatoryType === choice.value;
                                    const signatory = resolveSignatory(
                                        firstEmployee,
                                        employeeData,
                                        choice.value,
                                    );
                                    const isDefault =
                                        defaultSignatoryType === choice.value;

                                    return (
                                        <button
                                            key={choice.value}
                                            type="button"
                                            onClick={() =>
                                                setSignatoryType(choice.value)
                                            }
                                            className={`relative flex items-center justify-between rounded-xl border px-3 py-3 text-left transition ${
                                                isSelected
                                                    ? "border-blue-500 bg-blue-50 text-blue-900"
                                                    : "border-slate-200 bg-white/80 text-slate-700 hover:bg-blue-50"
                                            }`}
                                        >
                                            {isDefault ? (
                                                <span className="absolute right-3 top-2 rounded-full bg-blue-100 px-2 py-0.5 text-[10px] font-semibold text-blue-700">
                                                    Default
                                                </span>
                                            ) : null}
                                            <div className="flex min-w-0 items-center gap-3">
                                                <EmployeeAvatar
                                                    employee={
                                                        signatory.employee
                                                    }
                                                    name={signatory.name}
                                                    className="h-10 w-10"
                                                />
                                                <div className="min-w-0">
                                                    <div className="mb-0.5 flex items-center gap-1.5">
                                                        <span className="truncate text-[11px] font-medium uppercase tracking-wide text-blue-600">
                                                            {choice.label}
                                                        </span>
                                                    </div>
                                                    <div className="truncate text-sm font-semibold text-slate-900">
                                                        {signatory.name}
                                                    </div>
                                                    <div className="truncate text-xs text-slate-500">
                                                        {signatory.position ||
                                                            choice.label}
                                                    </div>
                                                    <div className="truncate text-xs text-slate-500">
                                                        {signatory.office ||
                                                            employeeDepartment(
                                                                firstEmployee,
                                                            )}
                                                    </div>
                                                </div>
                                            </div>

                                            {isSelected ? (
                                                <span className="ml-3 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-blue-600">
                                                    <Check className="h-3 w-3 text-white" />
                                                </span>
                                            ) : null}
                                        </button>
                                    );
                                })}
                            </div>
                        )}
                    </div>

                    <div className="rounded-xl border border-slate-200 bg-white shadow-sm">
                        <div className="flex items-center justify-between border-b border-slate-100 px-4 py-3">
                            <div className="flex items-center gap-2 text-sm font-medium text-slate-700">
                                <Users className="h-4 w-4 text-blue-600" />
                                Employees to Print
                            </div>
                            <div className="text-xs text-slate-400">
                                {printEmployees.length} employee
                                {printEmployees.length === 1 ? "" : "s"}
                            </div>
                        </div>

                        <div className="p-3">
                            <div className="mb-2 text-xs font-semibold uppercase tracking-wide text-slate-500">
                                Employee
                            </div>
                            <div className="max-h-72 space-y-2 overflow-y-auto rounded-xl border border-slate-100 p-2">
                                {printEmployees.length ? (
                                    printEmployees.map((employee) => (
                                        <div
                                            key={employee.id}
                                            className="flex items-center justify-between gap-3 rounded-xl px-3 py-2.5 text-sm transition hover:bg-blue-50"
                                        >
                                            <div className="flex min-w-0 items-center gap-3">
                                                <EmployeeAvatar
                                                    employee={employee}
                                                    name={employee.full_name}
                                                    className="h-10 w-10"
                                                />
                                                <div className="min-w-0">
                                                    <div className="truncate font-medium text-slate-800">
                                                        {employee.full_name ||
                                                            "-"}
                                                    </div>
                                                    <div className="truncate text-xs text-slate-500">
                                                        {employeeDepartment(
                                                            employee,
                                                        )}{" "}
                                                        -{" "}
                                                        {employee.position ||
                                                            "-"}
                                                    </div>
                                                </div>
                                            </div>
                                            <span className="shrink-0 rounded-full bg-slate-100 px-2 py-1 text-xs font-medium text-slate-600">
                                                Ready
                                            </span>
                                        </div>
                                    ))
                                ) : isLoadingEmployeeData ? (
                                    <EmployeeRowSkeleton />
                                ) : (
                                    <div className="py-6 text-center text-sm text-slate-500">
                                        No employees selected.
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>

                    <div className="absolute left-[-9999px] top-0">
                        {printEmployees.map((employee) => {
                            const data = employeeData[employee.id];
                            if (!data) return null;

                            return (
                                <DTRReport
                                    key={employee.id}
                                    ref={(element) =>
                                        (pdfRefs.current[employee.id] =
                                            element)
                                    }
                                    name={employee.full_name}
                                    dateRange={{
                                        start: dayjs(
                                            `${selectedYear}-${String(
                                                selectedMonth,
                                            ).padStart(2, "0")}-01`,
                                        )
                                            .startOf("month")
                                            .format("YYYY-MM-DD"),
                                        end: dayjs(
                                            `${selectedYear}-${String(
                                                selectedMonth,
                                            ).padStart(2, "0")}-01`,
                                        )
                                            .endOf("month")
                                            .format("YYYY-MM-DD"),
                                    }}
                                    logs={generateLogs(
                                        data.time_record,
                                        selectedMonth,
                                        selectedYear,
                                    )}
                                    monthlyTotals={data.monthly_totals}
                                    signatory={resolveSignatory(
                                        employee,
                                        employeeData,
                                        signatoryType,
                                    )}
                                />
                            );
                        })}
                    </div>

                    <DialogFooter className="gap-2">
                        <Button
                            type="button"
                            variant="outline"
                            onClick={onClose}
                            disabled={isGenerating}
                        >
                            Cancel
                        </Button>
                        <Button
                            type="button"
                            variant="blue"
                            onClick={handleDownloadPDF}
                            disabled={
                                !printEmployees.length ||
                                isGenerating ||
                                isLoadingEmployeeData
                            }
                        >
                            <Printer className="mr-1 h-4 w-4" />
                            {isGenerating
                                ? "Generating..."
                                : isLoadingEmployeeData
                                  ? "Loading..."
                                  : "Print"}
                        </Button>
                    </DialogFooter>
                </div>
            </DialogContent>
        </Dialog>
    );
};

export default PrintDialog;
