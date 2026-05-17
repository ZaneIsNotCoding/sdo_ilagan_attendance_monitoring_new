import React, { useEffect, useRef, useState } from "react";
import dayjs from "dayjs";
import html2pdf from "html2pdf.js";
import axios from "axios";
import { Building2, Check, Printer, Search, Users } from "lucide-react";
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
import FloatingInput from "@/components/floating-input";
import { Skeleton } from "@/components/ui/skeleton";
import DTRReport from "@/Pages/DocumentsFormats/DtrReport";

const EMPLOYEES_PER_PAGE = 5;

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

const formatMonth = (month) => monthNames[Number(month) - 1] || monthNames[0];

const employeeDepartment = (employee) =>
    employee?.department || employee?.office?.name || "No Department";

const employeeSignatory = (employee, employeeData, type) =>
    employeeData[employee.id]?.signatories?.[type] || {
        name: "Loading signatory...",
        position: type === "division_head" ? "Department Head" : "Office Head",
        office: employeeDepartment(employee),
        employee: null,
        missing: true,
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

const DepartmentSkeleton = () => (
    <div className="space-y-2">
        {Array.from({ length: 4 }).map((_, index) => (
            <div
                key={index}
                className="rounded-xl border border-slate-100 bg-white px-3 py-2"
            >
                <Skeleton className="h-4 w-3/4" />
                <Skeleton className="mt-2 h-3 w-1/2" />
            </div>
        ))}
    </div>
);

const EmployeeSkeleton = () => (
    <div className="flex items-center justify-between gap-3 px-3 py-2.5">
        <div className="flex min-w-0 items-center gap-3">
            <Skeleton className="h-9 w-9 shrink-0 rounded-full" />
            <div className="min-w-0 space-y-2">
                <Skeleton className="h-4 w-44" />
                <Skeleton className="h-3 w-60 max-w-full" />
            </div>
        </div>
        <Skeleton className="h-6 w-14 rounded-full" />
    </div>
);

const SignatorySkeleton = () => (
    <div className="rounded-xl border border-slate-200 bg-white/80 p-2.5">
        <div className="flex items-center gap-3">
            <Skeleton className="h-9 w-9 shrink-0 rounded-full" />
            <div className="min-w-0 flex-1 space-y-2">
                <Skeleton className="h-3 w-24" />
                <Skeleton className="h-4 w-36" />
                <Skeleton className="h-3 w-28" />
            </div>
        </div>
    </div>
);

const DepartmentPrintDialog = ({
    open,
    onClose,
    initialDepartmentName = "",
    selectedMonth,
    selectedYear,
}) => {
    const [isGenerating, setIsGenerating] = useState(false);
    const [departmentSearch, setDepartmentSearch] = useState("");
    const [selectedDepartment, setSelectedDepartment] = useState(
        initialDepartmentName,
    );
    const [departments, setDepartments] = useState([]);
    const [printEmployees, setPrintEmployees] = useState([]);
    const [employeeData, setEmployeeData] = useState({});
    const [departmentsLoading, setDepartmentsLoading] = useState(false);
    const [employeesLoading, setEmployeesLoading] = useState(false);
    const [employeePage, setEmployeePage] = useState(1);
    const requestRef = useRef(0);
    const lastDepartmentSearchRef = useRef(null);
    const pdfRefs = useRef({});

    const totalEmployeePages = Math.max(
        Math.ceil(printEmployees.length / EMPLOYEES_PER_PAGE),
        1,
    );
    const paginatedEmployees = printEmployees.slice(
        (employeePage - 1) * EMPLOYEES_PER_PAGE,
        employeePage * EMPLOYEES_PER_PAGE,
    );
    const departmentSignatoryEmployee = printEmployees.find(
        (employee) => employeeData[employee.id]?.signatory,
    );
    const officeHeadSignatory = departmentSignatoryEmployee
        ? employeeSignatory(
              departmentSignatoryEmployee,
              employeeData,
              "office_head",
          )
        : null;
    const departmentHeadSignatory = departmentSignatoryEmployee
        ? employeeSignatory(
              departmentSignatoryEmployee,
              employeeData,
              "division_head",
          )
        : null;
    const isLoadingEmployeeData = printEmployees.some(
        (employee) => !employeeData[employee.id],
    );

    useEffect(() => {
        if (!open) return;

        setSelectedDepartment(initialDepartmentName || "");
    }, [initialDepartmentName, open]);

    useEffect(() => {
        if (!open) return;

        const requestId = requestRef.current + 1;
        const currentSearch = departmentSearch.trim();
        const shouldReloadDepartments =
            lastDepartmentSearchRef.current !== currentSearch ||
            departments.length === 0;

        requestRef.current = requestId;
        lastDepartmentSearchRef.current = currentSearch;
        setDepartmentsLoading(shouldReloadDepartments);
        setEmployeesLoading(true);

        const timeout = setTimeout(() => {
            axios
                .get(route("dailytimerecord.departments"), {
                    params: {
                        search: currentSearch,
                        department: selectedDepartment,
                        month: selectedMonth,
                        year: selectedYear,
                    },
                })
                .then((response) => {
                    if (requestRef.current !== requestId) return;

                    const data = response.data || {};
                    const nextDepartment = data.selected_department || "";

                    if (shouldReloadDepartments) {
                        setDepartments(data.departments || []);
                    }

                    setPrintEmployees(data.employees || []);
                    setSelectedDepartment(nextDepartment);
                    setEmployeePage(1);

                    const params = new URLSearchParams(window.location.search);
                    params.set("modal", "print-department");
                    if (nextDepartment) {
                        params.set("name", nextDepartment);
                    } else {
                        params.delete("name");
                    }
                    window.history.replaceState(
                        {},
                        "",
                        `${route("dailytimerecord")}?${params.toString()}`,
                    );
                })
                .catch(() => {
                    if (requestRef.current !== requestId) return;

                    if (shouldReloadDepartments) {
                        setDepartments([]);
                    }

                    setPrintEmployees([]);
                })
                .finally(() => {
                    if (requestRef.current !== requestId) return;

                    if (shouldReloadDepartments) {
                        setDepartmentsLoading(false);
                    }

                    setEmployeesLoading(false);
                });
        }, 250);

        return () => clearTimeout(timeout);
    }, [
        departmentSearch,
        open,
        selectedDepartment,
        selectedMonth,
        selectedYear,
    ]);

    useEffect(() => {
        if (!open) return;

        const missingEmployees = printEmployees.filter(
            (employee) => !employeeData[employee.id],
        );

        missingEmployees.forEach((employee) => {
            axios
                .get(route("dailytimerecord.details", employee.id))
                .then((response) => {
                    setEmployeeData((current) => ({
                        ...current,
                        [employee.id]: response.data,
                    }));
                })
                .catch((error) => console.error(error));
        });
    }, [open, printEmployees]);

    const handleDepartmentSelect = (departmentName) => {
        setSelectedDepartment(departmentName);
        setEmployeePage(1);
    };

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
            <DialogContent className="max-h-[92vh] max-w-5xl overflow-y-auto rounded-2xl p-0">
                <div className="bg-gradient-to-r from-blue-600 to-blue-500 p-5 text-white">
                    <DialogHeader>
                        <DialogTitle className="flex items-center gap-2 text-white">
                            <Printer className="h-5 w-5" />
                            Print by Department
                        </DialogTitle>
                        <DialogDescription className="text-blue-100">
                            Printing {formatMonth(selectedMonth)} {selectedYear}
                        </DialogDescription>
                    </DialogHeader>
                </div>

                <div className="grid gap-4 px-5 pb-5 pt-4 lg:grid-cols-[0.85fr_1.15fr]">
                    <div className="space-y-3">
                        <div className="space-y-3">
                            <FloatingInput
                                label="Search department"
                                icon={Search}
                                name="department_search"
                                value={departmentSearch}
                                onChange={(event) =>
                                    setDepartmentSearch(event.target.value)
                                }
                            />

                            <div className="rounded-xl border border-slate-200 bg-white shadow-sm">
                                <div className="flex items-center justify-between border-b border-slate-100 px-4 py-3">
                                    <div className="flex items-center gap-2 text-sm font-bold text-slate-800">
                                        <Users className="h-4 w-4 text-blue-600" />
                                        Department List
                                    </div>
                                    <div className="text-xs text-slate-400">
                                        {departmentsLoading
                                            ? "Searching..."
                                            : `Showing ${
                                                  departments.length ? 1 : 0
                                              } to ${departments.length}`}
                                    </div>
                                </div>

                                <div className="h-[25.3rem] space-y-2 overflow-y-auto p-2">
                                    {departmentsLoading ? (
                                        <DepartmentSkeleton />
                                    ) : departments.length ? (
                                        departments.map((department) => {
                                            const isSelected =
                                                selectedDepartment ===
                                                department.name;

                                            return (
                                                <button
                                                    key={department.id}
                                                    type="button"
                                                    onClick={() =>
                                                        handleDepartmentSelect(
                                                            department.name,
                                                        )
                                                    }
                                                    className={`flex w-full items-center justify-between gap-3 rounded-xl border px-3 py-2.5 text-left text-sm transition ${
                                                        isSelected
                                                            ? "border-blue-500 bg-blue-50 text-blue-900"
                                                            : "border-slate-200 bg-white text-slate-700 hover:bg-blue-50"
                                                    }`}
                                                >
                                                    <div className="flex min-w-0 items-center gap-3">
                                                        <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-slate-100">
                                                            <Building2 className="h-4 w-4 text-blue-600" />
                                                        </div>
                                                        <div className="min-w-0">
                                                            <div className="truncate font-medium">
                                                                {
                                                                    department.name
                                                                }
                                                            </div>
                                                            <div className="truncate text-xs text-slate-500">
                                                                {department
                                                                    .division
                                                                    ?.name ||
                                                                    department
                                                                        .division
                                                                        ?.code ||
                                                                    "-"}
                                                            </div>
                                                        </div>
                                                    </div>
                                                    <div className="flex shrink-0 items-center gap-2">
                                                        {isSelected ? (
                                                            <span className="flex h-5 w-5 items-center justify-center rounded-full bg-blue-600">
                                                                <Check className="h-3 w-3 text-white" />
                                                            </span>
                                                        ) : null}
                                                    </div>
                                                </button>
                                            );
                                        })
                                    ) : (
                                        <div className="py-6 text-center text-sm text-slate-500">
                                            No departments found.
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="space-y-3">
                        <div className="rounded-2xl border border-blue-100 bg-gradient-to-br from-slate-50 via-white to-blue-50/80 p-3 shadow-sm">
                            <div className="mb-3 flex items-center justify-between gap-3">
                                <div>
                                    <p className="text-sm font-semibold text-slate-800">
                                        Signatories
                                    </p>
                                    <p className="text-xs text-slate-500">
                                        Office head and department head for the
                                        selected department.
                                    </p>
                                </div>
                            </div>

                            <div className="grid gap-2 md:grid-cols-2">
                                {employeesLoading || isLoadingEmployeeData ? (
                                    <>
                                        <SignatorySkeleton />
                                        <SignatorySkeleton />
                                    </>
                                ) : officeHeadSignatory ||
                                  departmentHeadSignatory ? (
                                    [
                                        {
                                            label: "Office Head",
                                            missing: "Missing office head",
                                            signatory: officeHeadSignatory,
                                        },
                                        {
                                            label: "Department Head",
                                            missing: "Missing department head",
                                            signatory: departmentHeadSignatory,
                                        },
                                    ].map(({ label, missing, signatory }) => (
                                        <div
                                            key={label}
                                            className="rounded-xl border border-slate-200 bg-white/80 p-3"
                                        >
                                            <div className="flex items-center gap-3">
                                                <EmployeeAvatar
                                                    employee={
                                                        signatory?.employee
                                                    }
                                                    name={signatory?.name}
                                                    className="h-10 w-10"
                                                />
                                                <div className="min-w-0">
                                                    <div className="truncate text-[11px] font-medium uppercase tracking-wide text-blue-600">
                                                        {label}
                                                    </div>
                                                    <div className="truncate text-sm font-semibold text-slate-900">
                                                        {signatory?.name ||
                                                            missing}
                                                    </div>
                                                    <div
                                                        className={`truncate text-xs ${
                                                            signatory?.missing
                                                                ? "text-orange-600"
                                                                : "text-slate-500"
                                                        }`}
                                                    >
                                                        {signatory?.missing
                                                            ? missing
                                                            : signatory?.position}
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    ))
                                ) : (
                                    <div className="rounded-xl border border-slate-200 bg-white/80 px-3 py-6 text-center text-sm text-slate-500 md:col-span-2">
                                        No signatories to show.
                                    </div>
                                )}
                            </div>
                        </div>

                        <div className="rounded-xl border border-slate-200 bg-white shadow-sm">
                            <div className="flex items-center justify-between border-b border-slate-100 px-4 py-3">
                                <div>
                                    <div className="text-sm font-semibold text-slate-800">
                                        Employees to Print
                                    </div>
                                    <div className="text-xs text-slate-500">
                                        {printEmployees.length} employee
                                        {printEmployees.length === 1 ? "" : "s"}
                                    </div>
                                </div>
                                <span className="rounded-full bg-blue-50 px-2 py-1 text-xs font-semibold text-blue-700">
                                    {formatMonth(selectedMonth)} {selectedYear}
                                </span>
                            </div>

                            <div className="h-[17rem] divide-y overflow-y-auto rounded-b-xl">
                                {employeesLoading ? (
                                    Array.from({ length: 4 }).map(
                                        (_, index) => (
                                            <EmployeeSkeleton key={index} />
                                        ),
                                    )
                                ) : paginatedEmployees.length ? (
                                    paginatedEmployees.map((employee) => (
                                        <div
                                            key={employee.id}
                                            className="flex items-center justify-between gap-3 px-3 py-2.5 text-sm"
                                        >
                                            <div className="flex min-w-0 items-center gap-3">
                                                <EmployeeAvatar
                                                    employee={employee}
                                                    name={employee.full_name}
                                                    className="h-9 w-9"
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
                                                    <div
                                                        className={`truncate text-xs ${
                                                            employeeData[
                                                                employee.id
                                                            ]?.signatory
                                                                ?.missing
                                                                ? "text-orange-600"
                                                                : "text-blue-600"
                                                        }`}
                                                    >
                                                        Signatory:{" "}
                                                        {employeeData[
                                                            employee.id
                                                        ]?.signatory?.name ||
                                                            "Loading..."}
                                                    </div>
                                                </div>
                                            </div>
                                            <span className="shrink-0 rounded-full bg-slate-100 px-2 py-1 text-xs font-medium text-slate-600">
                                                Ready
                                            </span>
                                        </div>
                                    ))
                                ) : (
                                    <div className="py-6 text-center text-sm text-slate-500">
                                        No employees selected.
                                    </div>
                                )}
                            </div>

                            {totalEmployeePages > 1 ? (
                                <div className="flex items-center justify-end gap-1 border-t border-slate-100 px-3 py-2 text-xs">
                                    <Button
                                        type="button"
                                        variant="outline"
                                        size="sm"
                                        className="h-7 px-2 text-xs"
                                        disabled={employeePage === 1}
                                        onClick={() =>
                                            setEmployeePage((page) =>
                                                Math.max(1, page - 1),
                                            )
                                        }
                                    >
                                        Prev
                                    </Button>
                                    <span className="px-2 text-slate-500">
                                        {employeePage} / {totalEmployeePages}
                                    </span>
                                    <Button
                                        type="button"
                                        variant="outline"
                                        size="sm"
                                        className="h-7 px-2 text-xs"
                                        disabled={
                                            employeePage === totalEmployeePages
                                        }
                                        onClick={() =>
                                            setEmployeePage((page) =>
                                                Math.min(
                                                    totalEmployeePages,
                                                    page + 1,
                                                ),
                                            )
                                        }
                                    >
                                        Next
                                    </Button>
                                </div>
                            ) : null}
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
                                    signatory={
                                        data.signatories?.division_head ||
                                        data.signatory
                                    }
                                />
                            );
                        })}
                    </div>

                    <DialogFooter className="gap-2 lg:col-span-2">
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

export default DepartmentPrintDialog;
