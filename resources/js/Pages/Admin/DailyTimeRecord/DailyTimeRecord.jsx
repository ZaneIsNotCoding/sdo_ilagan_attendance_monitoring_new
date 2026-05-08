import React, { useEffect, useState } from "react";
import { router } from "@inertiajs/react";
import { Head } from "@inertiajs/react";
import AuthenticatedLayout from "@/Layouts/AuthenticatedLayout";
import { CalendarClock } from "lucide-react";

import EmployeeTable from "./Partials/EmployeeTable";
import PrintDialog from "./Partials/PrintDialog"; // <-- import dialog

const formatSearchDisplay = (value) =>
    String(value || "")
        .replace(/^\d+\s+/, "")
        .trim();

const Daily_Time_Record = ({
    time_record,
    offices = [],
    search = "",
    office = "all",
    limit = 10,
}) => {
    const employees = Array.isArray(time_record?.data)
        ? time_record.data
        : Array.isArray(time_record)
          ? time_record
          : [];
    const [searchInput, setSearchInput] = useState(formatSearchDisplay(search));
    const [selectedEmployeeId, setSelectedEmployeeId] = useState(null);
    const [selectedOffice, setSelectedOffice] = useState(office || "all");
    const [selectedEmployees, setSelectedEmployees] = useState({});
    const [dialogOpen, setDialogOpen] = useState(false); // dialog state

    useEffect(() => {
        setSearchInput(formatSearchDisplay(search));
        const matchedOffice = offices.find((item) => item.name === office);

        setSelectedOffice(office === "all" ? "all" : matchedOffice?.id || "all");
    }, [search, office, offices]);

    const applyFilters = ({
        searchValue = searchInput,
        officeValue = selectedOffice,
        pageValue,
        limitValue = limit,
    } = {}) => {
        const query = {
            limit: limitValue,
        };

        if (searchValue && searchValue.trim()) {
            query.search = searchValue.trim();
        }

        const matchedOffice = offices.find(
            (item) => Number(item.id) === Number(officeValue),
        );

        if (matchedOffice) {
            query.office = matchedOffice.name;
        }

        if (pageValue && pageValue > 1) {
            query.page = pageValue;
        }

        router.get(route("dailytimerecord"), query, {
            preserveState: true,
            preserveScroll: true,
            replace: true,
        });
    };

    const handleSelectEmployee = (employee) => {
        router.visit(
            `/dailytimerecord/${
                employee.id
            }-${employee.first_name.toLowerCase()}`,
            { preserveState: true, preserveScroll: true },
        );
    };

    const selectedList = employees.filter((emp) => selectedEmployees[emp.id]);

    return (
        <AuthenticatedLayout
            header={
                <div className="flex items-center gap-5">
                    <CalendarClock className="w-5 h-5 text-blue-600" />
                    <span>Daily Time Record Management</span>
                </div>
            }
        >
            <Head title="AMS" />
            <main>
                {!selectedEmployeeId && (
                    <>
                        <EmployeeTable
                            employees={employees}
                            pagination={time_record}
                            onSelect={handleSelectEmployee}
                            selectedEmployees={selectedEmployees}
                            setSelectedEmployees={setSelectedEmployees}
                            search={searchInput}
                            setSearch={setSearchInput}
                            offices={offices}
                            selectedOffice={selectedOffice}
                            setSelectedOffice={setSelectedOffice}
                            applyFilters={applyFilters}
                            selectedCount={selectedList.length}
                            onPrintSelected={() => setDialogOpen(true)}
                        />

                        <PrintDialog
                            open={dialogOpen}
                            onClose={() => setDialogOpen(false)}
                            selectedEmployees={selectedList}
                            attendances={selectedList.flatMap(
                                (emp) => emp.attendances || [],
                            )}
                        />
                    </>
                )}
            </main>
        </AuthenticatedLayout>
    );
};

export default Daily_Time_Record;
