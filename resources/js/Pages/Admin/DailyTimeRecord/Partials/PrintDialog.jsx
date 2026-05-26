import React from "react";
import dayjs from "dayjs";
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
import {
    PrintableEmployeeSkeleton,
    SignatoryChoiceSkeleton,
} from "@/Components/Skeletons";
import { formatMonth, generateLogs } from "./DepartmentPrint/utils";
import usePrintDialog, {
    employeeDepartment,
    resolveSignatory,
    signatoryKey,
} from "../hooks/usePrintDialog";

const PrintDialog = ({
    open,
    onClose,
    selectedEmployees = [],
    initialEmployeeData = {},
    selectedMonth,
    selectedYear,
}) => {
    const {
        employeeData,
        firstEmployee,
        handleDownloadPDF,
        isGenerating,
        isLoadingEmployeeData,
        isSignatoryLoading,
        pdfRefs,
        printEmployees,
        selectedSignatoryKey,
        setSignatoryType,
        signatoryType,
        visibleSignatoryChoices,
    } = usePrintDialog({
        initialEmployeeData,
        onClose,
        open,
        selectedEmployees,
        selectedMonth,
        selectedYear,
    });

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
                                <SignatoryChoiceSkeleton />
                                <SignatoryChoiceSkeleton />
                            </div>
                        ) : (
                            <div className="grid gap-3 md:grid-cols-2">
                                {visibleSignatoryChoices.map(
                                    ({ choice, signatory }) => {
                                        const isSelected =
                                            signatoryType === choice.value ||
                                            selectedSignatoryKey ===
                                                signatoryKey(signatory);
                                        const isDefault =
                                            employeeData[firstEmployee.id]
                                                ?.signatory?.type ===
                                            choice.value;

                                        return (
                                            <button
                                                key={choice.value}
                                                type="button"
                                                onClick={() =>
                                                    setSignatoryType(
                                                        choice.value,
                                                    )
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
                                                                {signatory.label ||
                                                                    choice.label}
                                                            </span>
                                                        </div>
                                                        <div className="truncate text-sm font-semibold text-slate-900">
                                                            {signatory.name}
                                                        </div>
                                                        <div className="truncate text-xs text-slate-500">
                                                            {signatory.missing
                                                                ? ""
                                                                : signatory.position ||
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
                                    },
                                )}
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
                                        </div>
                                    ))
                                ) : isLoadingEmployeeData ? (
                                    <PrintableEmployeeSkeleton />
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
                                        (pdfRefs.current[employee.id] = element)
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
                                    workSchedule={employee.work_schedule}
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

