import React, { useRef, useState } from "react";
import { Head, router } from "@inertiajs/react";
import AuthenticatedLayout from "@/Layouts/AuthenticatedLayout";
import { LandPlot } from "lucide-react";

import StationList from "./Partials/StationList";
import StationAdminList from "./Partials/StationAdminList";

const StationManagement = ({
    stations = [],
    stationAdminRows = [],
    stationStats = {},
    addStationModal = false,
    assignStationModal = null,
    editStationModal = null,
    deleteStationModal = null,
    removeStationAdminModal = null,
    search = "",
    stationLimit = 5,
    adminLimit = 10,
}) => {
    const sectionRef = useRef(null);
    const [highlightedStationId, setHighlightedStationId] = useState(null);
    const [highlightRequestKey, setHighlightRequestKey] = useState(0);

    const focusStationRow = (stationId, adminPage = null) => {
        if (!stationId) return;

        setHighlightedStationId(stationId);
        setHighlightRequestKey((value) => value + 1);

        if (adminPage) {
            const params = new URLSearchParams(window.location.search);
            params.set("admin_page", adminPage);
            params.set("admin_limit", adminLimit);

            router.get(route("stationmanagement"), Object.fromEntries(params), {
                preserveState: true,
                preserveScroll: true,
                replace: true,
            });
        }

        sectionRef.current?.scrollIntoView({
            behavior: "smooth",
            block: "start",
        });
    };
    console.log("StationManagement render", {
        stations,
        stationAdminRows,
        stationStats,
        search,
        stationLimit,
        adminLimit,
    });
    return (
        <AuthenticatedLayout
            header={
                <div className="flex items-center gap-5">
                    <LandPlot className="w-5 h-5 text-blue-600" />
                    <span>Station Management</span>
                </div>
            }
        >
            <Head title="Station Management" />
            <main>
                <div className="mb-5">
                    <StationList
                        stations={stations}
                        stationStats={stationStats}
                        stationLimit={stationLimit}
                        addStationModal={addStationModal}
                        editStationModal={editStationModal}
                        deleteStationModal={deleteStationModal}
                        onAssignNow={focusStationRow}
                    />
                </div>
                <div
                    ref={sectionRef}
                    className="rounded-xl p-4 border-2 shadow-lg"
                >
                    <StationAdminList
                        stationRows={stationAdminRows}
                        search={search}
                        adminLimit={adminLimit}
                        assignStationModal={assignStationModal}
                        removeStationAdminModal={removeStationAdminModal}
                        highlightedStationId={highlightedStationId}
                        highlightRequestKey={highlightRequestKey}
                    />
                </div>
            </main>
        </AuthenticatedLayout>
    );
};

export default StationManagement;
