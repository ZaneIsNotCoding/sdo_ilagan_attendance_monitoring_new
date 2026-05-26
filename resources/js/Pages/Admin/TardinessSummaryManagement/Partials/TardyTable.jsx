import React from "react";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import { Button } from "@/Components/ui/button";
import { CustomDropdownCheckbox } from "@/components/dropdown-menu-main";
import FloatingInput from "@/components/floating-input";
import EmployeeAvatar from "@/Components/EmployeeAvatar";
import { Download, Search } from "lucide-react";

const TardyTable = ({
    filteredSummary,
    monthList,
    selectedYear,
    setSelectedYear,
    years,
    departments,
    selectedDepartment,
    setSelectedDepartment,
    search,
    setSearch,
    applyFilters,
    onDownloadPDF,
}) => {
    return (
        <div className="rounded-xl">
            <div className="mb-4 flex items-start justify-between gap-4">
                <div className="min-w-0">
                    <h2 className="text-lg font-bold text-slate-900">
                        Employee Records
                    </h2>
                    <p className="text-sm text-gray-500">
                        Monthly converted tardiness by employee
                    </p>
                </div>

                <div className="grid w-full grid-cols-1 items-center gap-4 xl:ml-auto xl:w-auto xl:grid-cols-[320px_140px_240px_150px]">
                    <FloatingInput
                        label="Search Employee"
                        icon={Search}
                        name="tardy_summary_search"
                        value={search}
                        onChange={(event) => setSearch(event.target.value)}
                        onKeyDown={(event) => {
                            if (event.key === "Enter") {
                                event.preventDefault();
                                applyFilters({ searchValue: search });
                            }
                        }}
                    />
                    <CustomDropdownCheckbox
                        label="Select Year"
                        items={years}
                        selected={selectedYear}
                        onChange={(nextYear) => {
                            setSelectedYear(nextYear);
                            applyFilters({ yearValue: nextYear });
                        }}
                        buttonVariant="outline"
                        className="h-10 border-slate-200 bg-slate-50 text-slate-700 hover:bg-slate-100"
                    />
                    <CustomDropdownCheckbox
                        label="Select Department"
                        items={departments}
                        selected={selectedDepartment}
                        onChange={(nextDepartment) => {
                            setSelectedDepartment(nextDepartment);
                            applyFilters({ departmentValue: nextDepartment });
                        }}
                        buttonVariant="outline"
                        className="h-10 border-slate-200 bg-slate-50 text-slate-700 hover:bg-slate-100"
                    />
                    <Button
                        type="button"
                        onClick={onDownloadPDF}
                        className="h-10 gap-2 whitespace-nowrap bg-blue-700 text-white hover:bg-blue-800"
                    >
                        <Download className="h-4 w-4" />
                        Download PDF
                    </Button>
                </div>
            </div>

            <div className="overflow-x-auto rounded-lg border">
                <Table className="w-full min-w-[1180px] table-fixed">
                    <TableHeader>
                        <TableRow className="bg-blue-900 hover:bg-blue-800">
                            <TableHead className="sticky left-0 z-10 w-[260px] bg-blue-900 pl-6 text-white">
                                Employee Name
                            </TableHead>
                            {monthList.map((month) => (
                                <TableHead
                                    key={month}
                                    className="w-[86px] text-center text-white"
                                >
                                    {month.slice(0, 3)}
                                </TableHead>
                            ))}
                            <TableHead className="w-[100px] text-center text-white">
                                Total
                            </TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {filteredSummary.length > 0 ? (
                            filteredSummary.map((data, index) => {
                                const employee = data.employee || {};

                                return (
                                    <TableRow
                                        key={employee.id || index}
                                        className="group h-[64px] transition hover:bg-blue-50"
                                    >
                                        <TableCell className="sticky left-0 z-10 bg-white p-3 transition group-hover:bg-blue-50">
                                            <div className="flex min-w-0 items-center gap-3">
                                                <EmployeeAvatar
                                                    employee={employee}
                                                    name={employee.full_name}
                                                    className="h-9 w-9"
                                                />

                                                <div className="min-w-0">
                                                    <div className="truncate font-medium">
                                                        {employee.full_name ||
                                                            "-"}
                                                    </div>
                                                    <div className="truncate text-xs text-gray-500">
                                                        {employee.department ||
                                                            "-"}
                                                    </div>
                                                </div>
                                            </div>
                                        </TableCell>

                                        {monthList.map((month, i) => {
                                            const val = Number(
                                                data.tardyPerMonths[
                                                    selectedYear
                                                ]?.[i + 1] || 0,
                                            );

                                            return (
                                                <TableCell
                                                    key={month}
                                                    className="p-3 text-center text-sm text-gray-700"
                                                >
                                                    <span
                                                        className={
                                                            val > 0
                                                                ? "font-medium text-gray-800"
                                                                : "text-gray-400"
                                                        }
                                                    >
                                                        {val > 0
                                                            ? val.toFixed(2)
                                                            : "0"}
                                                    </span>
                                                </TableCell>
                                            );
                                        })}

                                        <TableCell className="p-3 text-center">
                                            <span className="text-sm font-semibold text-gray-900">
                                                {Number(
                                                    data.tardyPerYear[
                                                        selectedYear
                                                    ] || 0,
                                                ).toFixed(2)}
                                            </span>
                                        </TableCell>
                                    </TableRow>
                                );
                            })
                        ) : (
                            <TableRow>
                                <TableCell
                                    colSpan={14}
                                    className="py-8 text-center text-gray-500"
                                >
                                    No tardiness summary records found.
                                </TableCell>
                            </TableRow>
                        )}
                    </TableBody>
                </Table>
            </div>
        </div>
    );
};

export default TardyTable;
