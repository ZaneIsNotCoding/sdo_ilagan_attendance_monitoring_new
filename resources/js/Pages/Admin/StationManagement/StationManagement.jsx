import React, { useRef, useState } from "react";
import { Head } from "@inertiajs/react";
import AuthenticatedLayout from "@/Layouts/AuthenticatedLayout";
import { LandPlot } from "lucide-react";

import StationList from "./Partials/StationList";
import StationAdminList from "./Partials/StationAdminList";

const StationManagement = ({
    school_admins = [],
    employees = [],
    stations = [],
    search = "",
}) => {
    const sectionRef = useRef(null);
    const [highlightedStationId, setHighlightedStationId] = useState(null);
    const [highlightRequestKey, setHighlightRequestKey] = useState(0);

    const focusStationRow = (stationId) => {
        if (!stationId) return;

        setHighlightedStationId(stationId);
        setHighlightRequestKey((value) => value + 1);

        sectionRef.current?.scrollIntoView({
            behavior: "smooth",
            block: "start",
        });
    };

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
                        school_admins={school_admins}
                        onAssignNow={focusStationRow}
                    />
                </div>
                <div
                    ref={sectionRef}
                    className="rounded-xl p-4 border-2 shadow-lg"
                >
                    <StationAdminList
                        stations={stations}
                        school_admins={school_admins}
                        employees={employees}
                        search={search}
                        highlightedStationId={highlightedStationId}
                        highlightRequestKey={highlightRequestKey}
                    />
                </div>
            </main>
        </AuthenticatedLayout>
    );
};

export default StationManagement;
