import React from "react";
import { Check, Grid2X2, List, Search, X } from "lucide-react";
import {
    Pagination,
    PaginationContent,
    PaginationItem,
    PaginationLink,
    PaginationNext,
    PaginationPrevious,
} from "@/components/ui/pagination";
import FloatingInput from "@/components/floating-input";
import SchoolList from "./SchoolList";

const getLeaveGroup = (leaveType) => {
    const value = String(leaveType || "").toLowerCase();

    if (!value) return null;
    if (value.includes("travel")) return "travel";
    return "slip";
};

const getStatus = (row) => {
    if (getLeaveGroup(row.leave_type) === "travel") return "On Travel";
    if (row.leave_type) return "With Slip";
    if (row.am_in || row.pm_in) return "Present";
    return "Absent";
};

const EmployeeCard = ({ row }) => {
    const status = getStatus(row);
    const isPresent = status === "Present";
    const isAbsent = status === "Absent";

    return (
        <div className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm shadow-slate-200/50">
            <div className="flex items-start gap-3">
                <div className="flex h-14 w-14 shrink-0 items-center justify-center overflow-hidden rounded-full bg-slate-100 text-lg font-black text-[#17206a]">
                    {row.profile_img ? (
                        <img
                            src={row.profile_img}
                            alt={row.name}
                            className="h-full w-full object-cover"
                        />
                    ) : (
                        row.name.charAt(0)
                    )}
                </div>
                <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-black text-[#070d3f]">
                        {row.name}
                    </p>
                    <p className="mt-1 truncate text-xs font-semibold text-slate-500">
                        {row.position}
                    </p>
                    <p className="truncate text-xs font-semibold text-slate-500">
                        {row.station}
                    </p>
                </div>
            </div>

            <div className="mt-5 flex items-end justify-between">
                <div>
                    <p className="text-sm font-black text-[#070d3f]">
                        {row.am_in || row.pm_in || "-"}
                    </p>
                    <p className="text-xs font-semibold text-slate-400">
                        Time In
                    </p>
                </div>
                <span
                    className={`inline-flex items-center gap-1 rounded-full px-3 py-1 text-xs font-black ${
                        isPresent
                            ? "bg-emerald-50 text-emerald-600"
                            : isAbsent
                              ? "bg-rose-50 text-rose-600"
                              : "bg-amber-50 text-amber-600"
                    }`}
                >
                    {isPresent && <Check className="h-3 w-3" />}
                    {isAbsent && <X className="h-3 w-3" />}
                    {status}
                </span>
            </div>
        </div>
    );
};

const EmployeeList = ({
    filteredRows,
    page,
    pageCount,
    perPage,
    search,
    selectedStation,
    setPage,
    setSearch,
    setSelectedStation,
    stations,
    visibleRows,
}) => {
    return (
        <section className="w-full px-10 py-6">
            <SchoolList
                selectedStation={selectedStation}
                setPage={setPage}
                setSelectedStation={setSelectedStation}
                stations={stations}
            />

            <div className="w-full">
                <div className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm shadow-slate-200/50">
                    <div className="mb-5 flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
                        <div>
                            <h2 className="text-lg font-black">Employees</h2>
                        </div>

                        <div className="flex items-center gap-3">
                            <div className="w-72">
                                <FloatingInput
                                    label="Search Employee"
                                    icon={Search}
                                    name="attendance_employee_search"
                                    value={search}
                                    onChange={(event) => {
                                        setSearch(event.target.value);
                                        setPage(1);
                                    }}
                                />
                            </div>
                        </div>
                    </div>

                    <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
                        {visibleRows.map((row) => (
                            <EmployeeCard key={row.employee_id} row={row} />
                        ))}
                    </div>

                    {visibleRows.length === 0 && (
                        <div className="py-16 text-center text-sm font-semibold text-slate-500">
                            No attendance records found.
                        </div>
                    )}

                    <div className="mt-7 flex items-center">
                        <div className="text-sm font-semibold text-slate-500">
                            Showing{" "}
                            {filteredRows.length === 0
                                ? 0
                                : (page - 1) * perPage + 1}{" "}
                            to {Math.min(page * perPage, filteredRows.length)}{" "}
                            of {filteredRows.length}
                        </div>

                        <div className="ml-auto">
                            {pageCount > 1 && (
                                <Pagination>
                                    <PaginationPrevious
                                        onClick={() =>
                                            setPage((value) =>
                                                Math.max(1, value - 1),
                                            )
                                        }
                                    />
                                    <PaginationContent>
                                        {Array.from(
                                            { length: pageCount },
                                            (_, index) => (
                                                <PaginationItem key={index}>
                                                    <PaginationLink
                                                        isActive={
                                                            page === index + 1
                                                        }
                                                        onClick={() =>
                                                            setPage(index + 1)
                                                        }
                                                    >
                                                        {index + 1}
                                                    </PaginationLink>
                                                </PaginationItem>
                                            ),
                                        )}
                                    </PaginationContent>
                                    <PaginationNext
                                        onClick={() =>
                                            setPage((value) =>
                                                Math.min(pageCount, value + 1),
                                            )
                                        }
                                    />
                                </Pagination>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
};

export default EmployeeList;
