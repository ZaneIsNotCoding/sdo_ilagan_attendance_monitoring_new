import React from "react";
import { Head } from "@inertiajs/react";
import AuthenticatedLayout from "@/Layouts/AuthenticatedLayout";
import { LandPlot } from "lucide-react";

import StationList from "./Partials/StationList";
import StationAdminList from "./Partials/StationAdminList";
import useStationManagementFocus from "./hooks/useStationManagementFocus";

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
    const {
        focusStationRow,
        highlightedStationId,
        highlightRequestKey,
        sectionRef,
    } = useStationManagementFocus({
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
