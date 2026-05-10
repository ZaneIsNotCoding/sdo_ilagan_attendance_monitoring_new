import React, { useEffect, useMemo, useState } from "react";
import { usePage } from "@inertiajs/react";

import Header from "./Partials/Header";
import EmployeeList from "./Partials/EmployeeList";

const getName = (employee) =>
    [employee?.first_name, employee?.middle_name, employee?.last_name]
        .filter(Boolean)
        .join(" ")
        .replace(/\s+/g, " ")
        .trim() ||
    employee?.name ||
    "Unknown Employee";

const toArray = (value) => {
    if (Array.isArray(value)) return value;
    if (Array.isArray(value?.data)) return value.data;
    if (value && typeof value === "object") return Object.values(value);
    return [];
};

const createRows = (employees, attendances, leaves) => {
    const employeeList = toArray(employees);
    const attendanceList = toArray(attendances);
    const leaveList = toArray(leaves);
    const leaveMap = new Map(
        leaveList.map((leave) => [leave.employee_id, leave]),
    );
    const rows = new Map();

    employeeList.forEach((employee) => {
        const leave = leaveMap.get(employee.id);

        rows.set(employee.id, {
            id: employee.id,
            employee_id: employee.id,
            name: getName(employee),
            station: employee.station?.name || "Division Office",
            station_id: employee.station?.id || null,
            position: employee.position || "Employee",
            profile_img: employee.profile_img || null,
            leave_type: employee.leave_type || leave?.leave_type || null,
            am_in: "",
            am_out: "",
            pm_in: "",
            pm_out: "",
        });
    });

    attendanceList.forEach((attendance) => {
        const id = attendance.employee?.id || attendance.employee_id;
        const row = rows.get(id);

        if (!row) return;

        rows.set(id, {
            ...row,
            am_in: attendance.am?.am_time_in || row.am_in,
            am_out: attendance.am?.am_time_out || row.am_out,
            pm_in: attendance.pm?.pm_time_in || row.pm_in,
            pm_out: attendance.pm?.pm_time_out || row.pm_out,
        });
    });

    return [...rows.values()].sort((a, b) => a.name.localeCompare(b.name));
};

const AttendanceMonitoring = ({
    attendances = [],
    employees = [],
    leaves = [],
    stations = [],
}) => {
    console.log({ stations });
    const stationList = useMemo(() => toArray(stations), [stations]);
    const rows = useMemo(
        () => createRows(employees, attendances, leaves),
        [employees, attendances, leaves],
    );
    const [search, setSearch] = useState("");
    const [selectedStation, setSelectedStation] = useState("all");
    const [page, setPage] = useState(1);
    const [time, setTime] = useState(new Date());

    useEffect(() => {
        const timer = setInterval(() => setTime(new Date()), 1000);
        return () => clearInterval(timer);
    }, []);

    const filteredRows = useMemo(() => {
        const keyword = search.toLowerCase().trim();

        return rows.filter((row) => {
            const matchesStation =
                selectedStation === "all" ||
                String(row.station_id) === String(selectedStation);

            return (
                matchesStation &&
                (!keyword ||
                    row.name.toLowerCase().includes(keyword) ||
                    row.station.toLowerCase().includes(keyword))
            );
        });
    }, [rows, search, selectedStation]);

    const perPage = 12;
    const pageCount = Math.max(1, Math.ceil(filteredRows.length / perPage));

    useEffect(() => {
        setPage((value) => Math.min(value, pageCount));
    }, [pageCount]);

    const visibleRows = filteredRows.slice(
        (page - 1) * perPage,
        page * perPage,
    );

    return (
        <div className="min-h-screen text-[#070d3f]">
            <Header time={time} />
            <EmployeeList
                filteredRows={filteredRows}
                page={page}
                pageCount={pageCount}
                perPage={perPage}
                search={search}
                selectedStation={selectedStation}
                setPage={setPage}
                setSearch={setSearch}
                setSelectedStation={setSelectedStation}
                stations={stationList}
                visibleRows={visibleRows}
            />
        </div>
    );
};

export default AttendanceMonitoring;
