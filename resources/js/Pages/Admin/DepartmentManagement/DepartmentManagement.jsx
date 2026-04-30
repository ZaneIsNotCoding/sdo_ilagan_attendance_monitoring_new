import React, { useRef, useState } from "react";
import { Head } from "@inertiajs/react";
import AuthenticatedLayout from "@/Layouts/AuthenticatedLayout";
import DepartmentHeadList from "./Partials/DepartmentHeadList";
import DivisionHeadList from "./Partials/DivisionHeadList";
import DepartmentList from "./Partials/DepartmentList";
import { Building2 } from "lucide-react";

const DepartmentManagement = ({
    office_heads = [],
    filtered_office_heads = [],
    division_heads = [],
    employees = [],
    divisions = [],
    offices = [],
    office_search = "",
}) => {
    const sectionRef = useRef(null);
    const [highlightedOfficeId, setHighlightedOfficeId] = useState(null);
    const [highlightRequestKey, setHighlightRequestKey] = useState(0);

    const focusOfficeRow = (officeId) => {
        if (!officeId) return;

        setHighlightedOfficeId(officeId);
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
                    <Building2 className="w-5 h-5 text-blue-600" />
                    <span>Organization Management</span>
                </div>
            }
        >
            <Head title="Organization Management" />

            <main>
                <div className="mb-5">
                    <DepartmentList
                        office_heads={office_heads}
                        divisions={divisions}
                        offices={offices}
                        onAssignNow={focusOfficeRow}
                    />
                </div>

                <div
                    ref={sectionRef}
                    className="mt-5 space-y-5 rounded-xl p-4 border-2 shadow-lg"
                >
                    <DivisionHeadList
                        division_heads={division_heads}
                        employees={employees}
                        divisions={divisions}
                    />
                </div>
                <div
                    ref={sectionRef}
                    className="mt-5 space-y-5 rounded-xl p-4 border-2 shadow-lg"
                >
                    <DepartmentHeadList
                        office_heads={office_heads}
                        filteredOfficeHeads={filtered_office_heads}
                        employees={employees}
                        divisions={divisions}
                        offices={offices}
                        highlightedOfficeId={highlightedOfficeId}
                        highlightRequestKey={highlightRequestKey}
                        officeSearch={office_search}
                    />
                </div>
            </main>
        </AuthenticatedLayout>
    );
};

export default DepartmentManagement;
