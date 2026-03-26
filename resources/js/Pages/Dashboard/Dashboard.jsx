import React, { useEffect, useState, useRef } from "react";
import { usePage } from "@inertiajs/react";

import Header from "./Partials/Header";
import MainContent from "./Partials/MainContent";
import RightPanels from "./Partials/RightPanel";

export default function Dashboard() {
    const { stations = [], users: serverUsers = [] } = usePage().props;

    const stationList = ["All Stations", ...stations.map((s) => s.name)];

    const [selectedStation, setSelectedStation] = useState("All Stations");
    const [open, setOpen] = useState(false);
    const [search, setSearch] = useState("");

    const [employeeSearch, setEmployeeSearch] = useState("");
    const [currentPage, setCurrentPage] = useState(1);

    const sidePerPage = 5;
    const [slipPage, setSlipPage] = useState(1);
    const [travelPage, setTravelPage] = useState(1);

    const dropdownRef = useRef();

    // const users = backendUsers; // 👈 UNCOMMENT THIS WHEN BACKEND START

    useEffect(() => {
        function handleClickOutside(e) {
            if (
                dropdownRef.current &&
                !dropdownRef.current.contains(e.target)
            ) {
                setOpen(false);
            }
        }

        document.addEventListener("mousedown", handleClickOutside);
        return () =>
            document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    const stationNames =
        stations.length > 0 ? stations.map((s) => s.name) : ["No Station"];

    // // 🔴 BACKEND USERS (KEEP FOR FUTURE)
    // const backendUsers = useMemo(() => {
    //     return serverUsers.map((u) => ({
    //         name: u.name,
    //         time: u.time_in ?? "No Logs",
    //         active: !!u.time_in,
    //         withSlip: u.with_slip ?? false,
    //         onTravel: u.on_travel ?? false,
    //         station: u.station?.name || "No Station",
    //     }));
    // }, [serverUsers]);

    const users = Array.from({ length: 100 }).map((_, i) => ({
        name: `Employee ${i + 1}`,
        time: i % 3 === 0 ? "No Logs" : "07:45 AM",
        active: i % 3 !== 0,
        withSlip: i % 5 === 0,
        onTravel: i % 7 === 0,
        station: stationNames[i % stationNames.length],
    }));

    return (
        <div className="min-h-screen bg-gray-100">
            <Header
                {...{
                    selectedStation,
                    setSelectedStation,
                    open,
                    setOpen,
                    search,
                    setSearch,
                    dropdownRef,
                    stationList,
                    users,
                }}
            />

            <div className="p-6 grid lg:grid-cols-4 gap-4">
                <MainContent
                    {...{
                        users,
                        selectedStation,
                        employeeSearch,
                        setEmployeeSearch,
                        currentPage,
                        setCurrentPage,
                    }}
                />

                <RightPanels
                    {...{
                        users,
                        selectedStation,
                        slipPage,
                        setSlipPage,
                        travelPage,
                        setTravelPage,
                        sidePerPage,
                    }}
                />
            </div>
        </div>
    );
}
