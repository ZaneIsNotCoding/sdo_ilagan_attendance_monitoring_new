"use client";

import React, { useState, useMemo, useEffect } from "react";
import AuthenticatedLayout from "@/Layouts/AuthenticatedLayout";
import { Head } from "@inertiajs/react";
import dayjs from "dayjs";
import localeData from "dayjs/plugin/localeData";
import AttendanceTable from "./Partials/AttendanceTable";
import NoAttendanceTable from "./Partials/NoAttendanceTable";
import EmployeeLeaveTable from "./Partials/EmployeeLeaveTable";
import {
    CustomDropdownCheckbox,
    CustomDropdownCheckboxObject,
} from "@/components/dropdown-menu-main";
import { toast } from "sonner";
import { usePage } from "@inertiajs/react";
import {
    Pagination,
    PaginationContent,
    PaginationLink,
    PaginationItem,
    PaginationPrevious,
    PaginationNext,
} from "@/components/ui/pagination";

dayjs.extend(localeData);

const AttendanceManagement = ({
    incomplete_attendances,
    employees,
    attendance_lookup,
    employee_leaves,
    offices = [],
}) => {
    // --- Filter states ---
    const [selectedOffice, setSelectedOffice] = useState("all");
    const [selectedYear, setSelectedYear] = useState(dayjs().format("YYYY"));
    const [selectedMonth, setSelectedMonth] = useState(dayjs().format("MMMM"));
    const [selectedDay, setSelectedDay] = useState(dayjs().format("DD"));

    // --- Pagination states ---
    const [attendancePage, setAttendancePage] = useState(1);
    const [noAttendancePage, setNoAttendancePage] = useState(1);
    const [leavePage, setLeavePage] = useState(1);
    const recordsPerPage = 7;

    const years = useMemo(
        () =>
            Array.from(
                new Set(
                    incomplete_attendances.map((a) =>
                        dayjs(a.date).format("YYYY"),
                    ),
                ),
            ).sort(),
        [incomplete_attendances],
    );

    const months = useMemo(() => dayjs.months(), []);
    const monthIndex = months.indexOf(selectedMonth);

    const days = useMemo(() => {
        if (monthIndex < 0 || !selectedYear) return [];
        const totalDays = dayjs(
            `${selectedYear}-${monthIndex + 1}-01`,
            "YYYY-M-DD",
        ).daysInMonth();
        return Array.from({ length: totalDays }, (_, i) =>
            String(i + 1).padStart(2, "0"),
        );
    }, [monthIndex, selectedYear]);

    useEffect(() => {
        if (!days.includes(selectedDay)) setSelectedDay(days[0] || "01");
    }, [days, selectedDay]);

    // --- Filtered attendance records ---
    const filteredRecords = useMemo(
        () =>
            incomplete_attendances.filter((att) => {
                const matchesOffice =
                    selectedOffice === "all" ||
                    att.employee?.office_id === selectedOffice;
                const matchesYear =
                    dayjs(att.date).format("YYYY") === selectedYear;
                const matchesMonth =
                    dayjs(att.date).format("MMMM") === selectedMonth;
                const matchesDay = dayjs(att.date).format("DD") === selectedDay;
                return matchesOffice && matchesYear && matchesMonth && matchesDay;
            }),
        [
            incomplete_attendances,
            selectedOffice,
            selectedYear,
            selectedMonth,
            selectedDay,
        ],
    );

    const totalAttendancePages = Math.ceil(
        filteredRecords.length / recordsPerPage,
    );
    const paginatedRecords = filteredRecords.slice(
        (attendancePage - 1) * recordsPerPage,
        attendancePage * recordsPerPage,
    );

    // --- Employees without attendance ---
    const selectedMonthNumber = dayjs(
        `${selectedYear}-${selectedMonth}-01`,
        "YYYY-MMMM-DD",
    ).format("MM");
    const selectedDateKey = `${selectedYear}-${selectedMonthNumber}-${selectedDay.padStart(
        2,
        "0",
    )}`;

    const leaveLookup = useMemo(() => {
        const map = new Map();
        employee_leaves.forEach((leave) => {
            const key = `${leave.employee_id}_${leave.date}`;
            map.set(key, leave.leave_type);
        });
        return map;
    }, [employee_leaves]);

    const employeesWithoutAttendance = useMemo(() => {
        return employees.filter((emp) => {
            const lookupKey = `${emp.id}_${selectedDateKey}`;
            const selectedDateObj = dayjs(selectedDateKey, "YYYY-MM-DD");
            const isWeekend = [0, 6].includes(selectedDateObj.day());

            const hasLeave = leaveLookup.has(lookupKey);

            return (
                !attendance_lookup[lookupKey] &&
                !isWeekend &&
                !hasLeave &&
                (selectedOffice === "all" ||
                    emp.office_id === selectedOffice)
            );
        });
    }, [
        employees,
        selectedDateKey,
        attendance_lookup,
        leaveLookup,
        selectedOffice,
    ]);

    const employeesWithLeave = useMemo(() => {
        return employees
            .map((emp) => {
                const lookupKey = `${emp.id}_${selectedDateKey}`;
                const leaveType = leaveLookup.get(lookupKey) || null;
                const hasAttendance = !!attendance_lookup[lookupKey];

                if (
                    (leaveType || !hasAttendance) &&
                    (selectedOffice === "all" ||
                        emp.office_id === selectedOffice)
                ) {
                    return {
                        ...emp,
                        leave_type: leaveType,
                        hasAttendance,
                    };
                }
                return null;
            })
            .filter(Boolean);
    }, [
        employees,
        leaveLookup,
        selectedDateKey,
        attendance_lookup,
        selectedOffice,
    ]);

    // --- Paginations ---
    const totalNoAttendancePages = Math.ceil(
        employeesWithoutAttendance.length / recordsPerPage,
    );
    const paginatedEmployeesWithoutAttendance =
        employeesWithoutAttendance.slice(
            (noAttendancePage - 1) * recordsPerPage,
            noAttendancePage * recordsPerPage,
        );

    const totalLeavePages = Math.ceil(
        employeesWithLeave.length / recordsPerPage,
    );
    const paginatedEmployeesForLeave = employeesWithLeave.slice(
        (leavePage - 1) * recordsPerPage,
        leavePage * recordsPerPage,
    );

    const { flash } = usePage().props || {};
    useEffect(() => {
        if (flash?.success) toast.success(flash.success);
    }, [flash?.success]);

    return (
        <AuthenticatedLayout header="Attendance Management">
            <Head title="AMS" />
            <main className="p-6 space-y-4">
                {/* Filters */}
                <div className="flex items-center justify-between gap-4 mb-4">
                    <CustomDropdownCheckboxObject
                        label="Select Office"
                        items={offices}
                        selected={selectedOffice}
                        buttonLabel={
                            offices.find((office) => office.id === selectedOffice)
                                ?.name || "All Offices"
                        }
                        onChange={(val) => {
                            setSelectedOffice(val);
                        }}
                        buttonVariant="green"
                        className="w-[215px]"
                    />
                    <div className="flex gap-4">
                        <CustomDropdownCheckbox
                            label="Day"
                            items={days}
                            selected={selectedDay}
                            onChange={setSelectedDay}
                            buttonVariant="indigo"
                        />
                        <CustomDropdownCheckbox
                            label="Month"
                            items={months}
                            selected={selectedMonth}
                            onChange={setSelectedMonth}
                            buttonVariant="cyan"
                        />
                        <CustomDropdownCheckbox
                            label="Year"
                            items={years}
                            selected={selectedYear}
                            onChange={setSelectedYear}
                            buttonVariant="blue"
                        />
                    </div>
                </div>

                {/* Incomplete Attendances */}
                <div className="rounded-xl p-4 mt-4 border-2 border-blue-100 shadow-lg">
                    <h2 className="text-xl font-semibold mb-2">
                        Employees With Incomplete Attendances
                    </h2>
                    <AttendanceTable records={paginatedRecords} />
                    {totalAttendancePages > 1 && (
                        <Pagination className="my-2 justify-end">
                            <PaginationPrevious
                                disabled={attendancePage === 1}
                                onClick={() =>
                                    setAttendancePage(attendancePage - 1)
                                }
                            />
                            <PaginationContent>
                                {Array.from(
                                    { length: totalAttendancePages },
                                    (_, i) => (
                                        <PaginationItem key={i}>
                                            <PaginationLink
                                                isActive={
                                                    attendancePage === i + 1
                                                }
                                                onClick={() =>
                                                    setAttendancePage(i + 1)
                                                }
                                            >
                                                {i + 1}
                                            </PaginationLink>
                                        </PaginationItem>
                                    ),
                                )}
                            </PaginationContent>
                            <PaginationNext
                                disabled={
                                    attendancePage === totalAttendancePages
                                }
                                onClick={() =>
                                    setAttendancePage(attendancePage + 1)
                                }
                            />
                        </Pagination>
                    )}
                </div>

                {/* No Attendance */}
                <div className="rounded-xl p-4 mt-4 border-2 border-red-100 shadow-lg">
                    <h2 className="text-xl font-semibold mt-6 mb-2">
                        Employees With No Attendance
                    </h2>
                    <NoAttendanceTable
                        employees={paginatedEmployeesWithoutAttendance}
                        selectedDate={selectedDateKey}
                    />
                    {totalNoAttendancePages > 1 && (
                        <Pagination className="my-2 justify-end">
                            <PaginationPrevious
                                disabled={noAttendancePage === 1}
                                onClick={() =>
                                    setNoAttendancePage(noAttendancePage - 1)
                                }
                            />
                            <PaginationContent>
                                {Array.from(
                                    { length: totalNoAttendancePages },
                                    (_, i) => (
                                        <PaginationItem key={i}>
                                            <PaginationLink
                                                isActive={
                                                    noAttendancePage === i + 1
                                                }
                                                onClick={() =>
                                                    setNoAttendancePage(i + 1)
                                                }
                                            >
                                                {i + 1}
                                            </PaginationLink>
                                        </PaginationItem>
                                    ),
                                )}
                            </PaginationContent>
                            <PaginationNext
                                disabled={
                                    noAttendancePage === totalNoAttendancePages
                                }
                                onClick={() =>
                                    setNoAttendancePage(noAttendancePage + 1)
                                }
                            />
                        </Pagination>
                    )}
                </div>

                {/* Employee Leave Management */}
                <div className="rounded-xl p-4 mt-4 border-2 border-yellow-100 shadow-lg">
                    <h2 className="text-xl font-semibold mt-6 mb-2">
                        Employees Leave
                    </h2>
                    <EmployeeLeaveTable
                        employees={paginatedEmployeesForLeave} // use employees with leave
                        selectedDate={selectedDateKey}
                    />
                    {totalLeavePages > 1 && (
                        <Pagination className="my-2 justify-end">
                            <PaginationPrevious
                                disabled={leavePage === 1}
                                onClick={() => setLeavePage(leavePage - 1)}
                            />
                            <PaginationContent>
                                {Array.from(
                                    { length: totalLeavePages },
                                    (_, i) => (
                                        <PaginationItem key={i}>
                                            <PaginationLink
                                                isActive={leavePage === i + 1}
                                                onClick={() =>
                                                    setLeavePage(i + 1)
                                                }
                                            >
                                                {i + 1}
                                            </PaginationLink>
                                        </PaginationItem>
                                    ),
                                )}
                            </PaginationContent>
                            <PaginationNext
                                disabled={leavePage === totalLeavePages}
                                onClick={() => setLeavePage(leavePage + 1)}
                            />
                        </Pagination>
                    )}
                </div>
            </main>
        </AuthenticatedLayout>
    );
};

export default AttendanceManagement;
