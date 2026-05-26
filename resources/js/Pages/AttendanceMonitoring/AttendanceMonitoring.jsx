import React, { useEffect, useMemo, useState } from "react";
import { Head, router } from "@inertiajs/react";

import Header from "./Partials/Header";
import EmployeeList from "./Partials/EmployeeList";
import { getEmployeeName, sortAlphabetically } from "@/lib/utils";

const toArray = (value) => {
    if (Array.isArray(value)) return value;
    if (Array.isArray(value?.data)) return value.data;
    if (value && typeof value === "object") return Object.values(value);
    return [];
};

const createRows = (employees) => {
    return sortAlphabetically(
        toArray(employees?.data || employees).map((employee) => ({
            id: employee.id,
            employee_id: employee.employee_id || employee.id,
            name: getEmployeeName(employee) || "Unknown Employee",
            station: employee.station?.name || "Division Office",
            station_id: employee.station?.id || null,
            position: employee.position || "Employee",
            profile_img: employee.profile_img || null,
            am_in: employee.am_in || "",
            am_out: employee.am_out || "",
            pm_in: employee.pm_in || "",
            pm_out: employee.pm_out || "",
            status: employee.status || "Absent",
        })),
        "name",
    );
};

const AttendanceMonitoring = ({
    employees = {},
    filters = {},
    stations = [],
}) => {
    const stationList = useMemo(
        () => sortAlphabetically(toArray(stations), "name"),
        [stations],
    );
    const rows = useMemo(() => createRows(employees), [employees]);
    const [search, setSearch] = useState(filters.search || "");
    const [stationSearch, setStationSearch] = useState("");
    const [time, setTime] = useState(new Date());
    const selectedStation = filters.station_id || 1;
    const selectedStationCode = filters.station_code || "SDO";
    const selectedStationName =
        filters.station_name || "School Division Office";

    const visit = (overrides = {}) => {
        const params = new URLSearchParams(window.location.search);

        params.set("station_code", selectedStationCode);
        params.set("station_name", selectedStationName);
        params.delete("limit");

        Object.entries(overrides).forEach(([key, value]) => {
            if (value === null || value === undefined || value === "") {
                params.delete(key);
                return;
            }

            params.set(key, value);
        });

        if (!params.get("search")) params.delete("search");
        params.delete("station_search");

        router.get(route("attendance-monitoring"), Object.fromEntries(params), {
            preserveScroll: true,
            preserveState: true,
            replace: true,
        });
    };

    useEffect(() => {
        setSearch(filters.search || "");
    }, [filters.search]);

    useEffect(() => {
        console.log("Attendance employees reloaded:", employees);
    }, [employees]);

    useEffect(() => {
        const timer = setInterval(() => setTime(new Date()), 1000);
        return () => clearInterval(timer);
    }, []);

    useEffect(() => {
        const timer = setInterval(() => {
            router.reload({
                only: ["employees"],
                preserveScroll: true,
                preserveState: true,
            });
        }, 3000);

        return () => clearInterval(timer);
    }, []);

    const selectStation = (station) => {
        const stationCode = String(station?.code || "SDO").trim();
        const stationName = String(
            station?.name || "School Division Office",
        ).trim();

        visit({
            station_code: stationCode,
            station_name: stationName,
            page: 1,
        });
    };

    const goToPage = (page) => {
        visit({ page });
    };

    const submitSearch = (value) => {
        visit({ search: value?.trim() || "", page: 1 });
    };

    return (
        <div className="min-h-screen text-[#070d3f]">
            <Head title="Time Vault - AMS" />
            <Header time={time} />
            <EmployeeList
                employees={employees}
                goToPage={goToPage}
                rows={rows}
                search={search}
                selectedStation={selectedStation}
                selectedStationCode={selectedStationCode}
                selectedStationName={selectedStationName}
                selectStation={selectStation}
                setSearch={setSearch}
                setStationSearch={setStationSearch}
                submitSearch={submitSearch}
                stationSearch={stationSearch}
                stations={stationList}
            />
        </div>
    );
};

export default AttendanceMonitoring;

