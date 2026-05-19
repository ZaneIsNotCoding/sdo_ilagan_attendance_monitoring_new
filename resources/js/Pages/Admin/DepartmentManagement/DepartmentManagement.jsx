import React from "react";
import { Head } from "@inertiajs/react";
import AuthenticatedLayout from "@/Layouts/AuthenticatedLayout";
import DepartmentHeadList from "./Partials/DepartmentHeadList";
import DivisionHeadList from "./Partials/DivisionHeadList";
import DepartmentList from "./Partials/DepartmentList";
import { Building2 } from "lucide-react";
import useDepartmentManagementFocus from "./hooks/useDepartmentManagementFocus";

const DepartmentManagement = ({
    office_heads = [],
    filtered_office_heads = [],
    division_heads = [],
    divisions = [],
    offices = [],
    office_search = "",
    addDivisionModal = false,
    addOfficeModal = false,
    editDivisionModal = null,
    editOfficeModal = null,
    deleteOfficeModal = null,
    assignOfficeHeadModal = null,
    assignDivisionHeadModal = null,
    deleteOfficeHeadModal = null,
    deleteDivisionHeadModal = null,
}) => {
    const {
        focusOfficeRow,
        highlightedOfficeId,
        highlightRequestKey,
        sectionRef,
    } = useDepartmentManagementFocus();

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
                        addDivisionModal={addDivisionModal}
                        addOfficeModal={addOfficeModal}
                        editDivisionModal={editDivisionModal}
                        editOfficeModal={editOfficeModal}
                        deleteOfficeModal={deleteOfficeModal}
                        onAssignNow={focusOfficeRow}
                    />
                </div>

                <div
                    ref={sectionRef}
                    className="mt-5 space-y-5 rounded-xl p-4 border-2 shadow-lg"
                >
                    <DivisionHeadList
                        division_heads={division_heads}
                        divisions={divisions}
                        assignDivisionHeadModal={assignDivisionHeadModal}
                        deleteDivisionHeadModal={deleteDivisionHeadModal}
                    />
                </div>
                <div
                    ref={sectionRef}
                    className="mt-5 space-y-5 rounded-xl p-4 border-2 shadow-lg"
                >
                    <DepartmentHeadList
                        office_heads={office_heads}
                        filteredOfficeHeads={filtered_office_heads}
                        divisions={divisions}
                        offices={offices}
                        assignOfficeHeadModal={assignOfficeHeadModal}
                        deleteOfficeHeadModal={deleteOfficeHeadModal}
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
