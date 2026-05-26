import React, { useState, useMemo, useRef } from "react";
import { Head, router } from "@inertiajs/react";
import AuthenticatedLayout from "@/Layouts/AuthenticatedLayout";
import html2pdf from "html2pdf.js";

import TardyTable from "./Partials/TardyTable";
import SummaryofTardinessReport from "../../DocumentsFormats/AdminSummaryofTardinessReport";
import { sortAlphabetically, sortWithPinnedFirst } from "@/lib/utils";

const TardySummary = ({
    summary,
    departments: departmentOptions = [],
    years: yearOptions = [],
    search = "",
    department = "All Departments",
    year,
}) => {
    const pdfRef = useRef();
    const monthList = [
        "January",
        "February",
        "March",
        "April",
        "May",
        "June",
        "July",
        "August",
        "September",
        "October",
        "November",
        "December",
    ];

    const currentYear = new Date().getFullYear().toString();
    const [searchInput, setSearchInput] = useState(search);
    const [selectedDepartment, setSelectedDepartment] = useState(department);
    const [selectedYear, setSelectedYear] = useState(
        year || currentYear,
    );

    const departments = useMemo(
        () =>
            sortWithPinnedFirst(
                ["All Departments", ...new Set(departmentOptions)],
                ["All Departments"],
            ),
        [departmentOptions],
    );

    const years = useMemo(
        () =>
            yearOptions.length
                ? yearOptions.map(String)
                : [currentYear],
        [currentYear, yearOptions],
    );

    const filteredSummary = useMemo(
        () => sortAlphabetically(summary, "employee.full_name"),
        [summary],
    );

    const applyFilters = ({
        searchValue = searchInput,
        departmentValue = selectedDepartment,
        yearValue = selectedYear,
    } = {}) => {
        const query = {
            year: yearValue,
        };

        if (searchValue && searchValue.trim()) {
            query.search = searchValue.trim();
        }

        if (
            departmentValue &&
            departmentValue !== "All Departments"
        ) {
            query.department = departmentValue;
        }

        router.get(route("tardysummary"), query, {
            only: [
                "summary",
                "departments",
                "years",
                "search",
                "department",
                "year",
            ],
            preserveState: true,
            preserveScroll: true,
            replace: true,
        });
    };

    const handleDownloadPDF = () => {
        const element = pdfRef.current;
        html2pdf()
            .set({
                margin: 0.5,
                filename: `Tardiness_Summary_${selectedYear}.pdf`,
                image: { type: "jpeg", quality: 0.98 },
                html2canvas: { scale: 2 },
                jsPDF: {
                    unit: "in",
                    format: "letter",
                    orientation: "portrait",
                },
            })
            .from(element)
            .save();
    };

    return (
        <AuthenticatedLayout header="Summary of Tardiness">
            <Head title="Summary of Tardiness" />
            <main>
                <div className="rounded-2xl border border-blue-100 bg-white p-4 shadow-lg">
                    <TardyTable
                        filteredSummary={filteredSummary}
                        monthList={monthList}
                        selectedYear={selectedYear}
                        setSelectedYear={setSelectedYear}
                        years={years}
                        departments={departments}
                        selectedDepartment={selectedDepartment}
                        setSelectedDepartment={setSelectedDepartment}
                        search={searchInput}
                        setSearch={setSearchInput}
                        applyFilters={applyFilters}
                        onDownloadPDF={handleDownloadPDF}
                    />

                    <div style={{ display: "none" }}>
                        <SummaryofTardinessReport
                            ref={pdfRef}
                            summary={filteredSummary}
                            selectedYear={selectedYear}
                        />
                    </div>
                </div>
            </main>
        </AuthenticatedLayout>
    );
};

export default TardySummary;
