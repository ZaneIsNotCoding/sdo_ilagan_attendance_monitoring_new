import React from "react";
import {
    Pagination,
    PaginationContent,
    PaginationItem,
    PaginationLink,
    PaginationNext,
    PaginationPrevious,
} from "@/components/ui/pagination";
import { Button } from "@/Components/ui/button";
import EmployeeAvatar from "@/Components/EmployeeAvatar";
import { PrintableEmployeeSkeletonList } from "@/Components/Skeletons";
import { employeeDepartment, formatMonth } from "./utils";

const PrintableEmployeeList = ({
    departmentsLoading,
    employeesLoading,
    employeePage,
    employeePageNumbers,
    employeePagination,
    employees,
    selectedEmployeeSignatory,
    selectedMonth,
    selectedYear,
    totalEmployeePages,
    onChangePage,
    onOpenSignatoryPopover,
}) => (
    <div className="rounded-xl border border-slate-200 bg-white shadow-sm">
        <div className="flex items-center justify-between border-b border-slate-100 px-4 py-3">
            <div>
                <div className="text-sm font-semibold text-slate-800">
                    Employees to Print
                </div>
                <div className="text-xs text-slate-500">
                    Showing {employeePagination.from || 0} to{" "}
                    {employeePagination.to || 0} of{" "}
                    {employeePagination.total || 0}
                </div>
            </div>
            <span className="rounded-full bg-blue-50 px-2 py-1 text-xs font-semibold text-blue-700">
                {formatMonth(selectedMonth)} {selectedYear}
            </span>
        </div>

        <div className="flex h-[17.3rem] flex-col">
            <div className="min-h-0 flex-1 divide-y overflow-y-auto">
                {departmentsLoading || employeesLoading ? (
                    <PrintableEmployeeSkeletonList />
                ) : employees.length ? (
                    employees.map((employee) => {
                        const signatory = selectedEmployeeSignatory(employee);

                        return (
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
                                            {employee.full_name || "-"}
                                        </div>
                                        <div className="truncate text-xs text-slate-500">
                                            {employeeDepartment(employee)} -{" "}
                                            {employee.position || "-"}
                                        </div>
                                        <div
                                            className={`truncate text-xs ${
                                                signatory?.missing
                                                    ? "text-orange-600"
                                                    : "text-blue-600"
                                            }`}
                                        >
                                            Signatory:{" "}
                                            {signatory?.name || "Loading..."}
                                        </div>
                                    </div>
                                </div>

                                <Button
                                    type="button"
                                    variant="outline"
                                    size="sm"
                                    className="h-7 shrink-0 rounded-full border-blue-200 px-2 text-xs text-blue-700 hover:bg-blue-50"
                                    onClick={(event) =>
                                        onOpenSignatoryPopover(event, employee)
                                    }
                                >
                                    Change Signatory
                                </Button>
                            </div>
                        );
                    })
                ) : (
                    <div className="py-6 text-center text-sm text-slate-500">
                        No employees selected.
                    </div>
                )}
            </div>

            <div className="flex h-12 shrink-0 items-center justify-end px-3">
                {totalEmployeePages > 1 ? (
                    <Pagination>
                        <PaginationPrevious
                            className="h-7 px-2 text-xs"
                            onClick={() => onChangePage(employeePage - 1)}
                        />
                        <PaginationContent>
                            {employeePageNumbers.map((page) => (
                                <PaginationItem key={page}>
                                    <PaginationLink
                                        className="h-7 w-7 text-xs"
                                        isActive={employeePage === page}
                                        onClick={() => onChangePage(page)}
                                    >
                                        {page}
                                    </PaginationLink>
                                </PaginationItem>
                            ))}
                        </PaginationContent>
                        <PaginationNext
                            className="h-7 px-2 text-xs"
                            onClick={() => onChangePage(employeePage + 1)}
                        />
                    </Pagination>
                ) : null}
            </div>
        </div>
    </div>
);

export default PrintableEmployeeList;
