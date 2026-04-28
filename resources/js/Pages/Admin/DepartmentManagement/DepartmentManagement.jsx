import React, { useState, useEffect, useRef } from "react";
import { Head, router } from "@inertiajs/react";
import AuthenticatedLayout from "@/Layouts/AuthenticatedLayout";
import DepartmentHeadList from "./Partials/DepartmentHeadList";
import DepartmentList from "./Partials/DepartmentList";
import { Building2 } from "lucide-react";

const DepartmentManagement = ({
    dept_heads = [],
    employees = [],
    departments = [],
}) => {
    const sectionRef = useRef(null);

    return (
        <AuthenticatedLayout
            header={
                <div className="flex items-center gap-5">
                    <Building2 className="w-5 h-5 text-blue-600" />
                    <span>Department Management</span>
                </div>
            }
        >
            <Head title="Department Management" />

            <main>
                <div className="mb-5">
                    <DepartmentList
                        dept_heads={dept_heads}
                        departments={departments}
                        onAssignNow={() => {
                            sectionRef.current?.scrollIntoView({
                                behavior: "smooth",
                                block: "start",
                            });
                        }}
                    />
                </div>
                <div
                    ref={sectionRef}
                    className="rounded-xl p-4 border-2 shadow-lg"
                >
                    <DepartmentHeadList
                        dept_heads={dept_heads}
                        employees={employees}
                        departments={departments}
                    />
                </div>
            </main>
        </AuthenticatedLayout>
    );
};

export default DepartmentManagement;
