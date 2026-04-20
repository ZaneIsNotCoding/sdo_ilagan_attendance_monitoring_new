import React from "react";
import { Head, router } from "@inertiajs/react";
import AuthenticatedLayout from "@/Layouts/AuthenticatedLayout";
import { LandPlot } from "lucide-react";

import StationAdminList from "./Partials/StationAdminList";

const StationManagement = ({
    school_admins = [],
    employees = [],
    stations = [],
}) => {
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
                <div className="rounded-xl p-4 border-2  shadow-lg">
                    <StationAdminList
                        stations={stations}
                        school_admins={school_admins}
                        employees={employees}
                    />
                </div>
            </main>
        </AuthenticatedLayout>
    );
};

export default StationManagement;
