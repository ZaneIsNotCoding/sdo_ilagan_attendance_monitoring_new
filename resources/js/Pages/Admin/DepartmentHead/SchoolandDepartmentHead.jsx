import React, { useState, useEffect, useRef } from "react";
import { Head, router } from "@inertiajs/react";
import AuthenticatedLayout from "@/Layouts/AuthenticatedLayout";
import DepartmentHeadList from "./Partials/DepartmentHeadList";
import AddDepartmentHeadForm from "./Partials/AddDepartmentHeadForm";

const SchoolandDepartmentHead = ({ dept_heads = [], queryParams = {}, employees }) => {
    return (
        <AuthenticatedLayout header="School Admin and Department Head Management">
            <Head title="AMS" />
            <main className="rounded-xl p-4 mt-4 border-2 border-blue-100 shadow-lg">
                <DepartmentHeadList
                    dept_heads={dept_heads}
                    queryParams={queryParams}
                ></DepartmentHeadList>
            </main>
        </AuthenticatedLayout>
    );
};

export default SchoolandDepartmentHead;
