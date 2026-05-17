import React, { useEffect, useMemo, useState } from "react";
import { router } from "@inertiajs/react";
import { Head } from "@inertiajs/react";
import AuthenticatedLayout from "@/Layouts/AuthenticatedLayout";
import { CalendarClock } from "lucide-react";

import EmployeeList from "./Partials/EmployeeList";
import PrintDialog from "./Partials/PrintDialog"; // <-- import dialog
import DepartmentPrintDialog from "./Partials/DepartmentPrintDialog";
import EmployeePreviewDtr from "./Partials/EmployeePreviewDtr";

const formatSearchDisplay = (value) =>
    String(value || "")
        .replace(/^\d+\s+/, "")
        .trim();

const Daily_Time_Record = ({
    time_record,
    offices = [],
    search = "",
    office = "all",
    month,
    year,
    limit = 10,
    previewDtrModal = null,
    printDtrModal = null,
    departmentPrintModal = null,
}) => {
    const currentDate = new Date();
    const currentMonth = month || currentDate.getMonth() + 1;
    const currentYear = year || currentDate.getFullYear();
    const employees = Array.isArray(time_record?.data)
        ? time_record.data
        : Array.isArray(time_record)
          ? time_record
          : [];
    const [searchInput, setSearchInput] = useState(formatSearchDisplay(search));
    const [selectedOffice, setSelectedOffice] = useState(office || "all");
    const [selectedMonth, setSelectedMonth] = useState(Number(currentMonth));
    const [selectedYear, setSelectedYear] = useState(String(currentYear));
    const [selectedEmployees, setSelectedEmployees] = useState({});
    const [dialogOpen, setDialogOpen] = useState(Boolean(printDtrModal));
    const [printEmployees, setPrintEmployees] = useState(
        printDtrModal?.employee ? [printDtrModal.employee] : [],
    );
    const [departmentDialogOpen, setDepartmentDialogOpen] = useState(
        Boolean(departmentPrintModal),
    );
    const initialPrintEmployeeData = useMemo(
        () =>
            printDtrModal?.employee && printDtrModal?.details
                ? {
                      [printDtrModal.employee.id]: printDtrModal.details,
                  }
                : {},
        [printDtrModal],
    );

    useEffect(() => {
        setSearchInput(formatSearchDisplay(search));
        const matchedOffice = offices.find((item) => item.name === office);

        setSelectedOffice(office === "all" ? "all" : matchedOffice?.id || "all");
        setSelectedMonth(Number(currentMonth));
        setSelectedYear(String(currentYear));
    }, [search, office, offices, currentMonth, currentYear]);

    useEffect(() => {
        setDialogOpen(Boolean(printDtrModal));
        setPrintEmployees(
            printDtrModal?.employee ? [printDtrModal.employee] : [],
        );
    }, [printDtrModal]);

    useEffect(() => {
        setDepartmentDialogOpen(Boolean(departmentPrintModal));
    }, [departmentPrintModal]);

    const applyFilters = ({
        searchValue = searchInput,
        officeValue = selectedOffice,
        monthValue = selectedMonth,
        yearValue = selectedYear,
        pageValue,
        limitValue = limit,
    } = {}) => {
        const query = {
            limit: limitValue,
            month: monthValue,
            year: yearValue,
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
            only: ["time_record", "search", "office", "month", "year", "limit"],
            preserveState: true,
            preserveScroll: true,
            replace: true,
        });
    };

    const handlePreviewEmployee = (employee) => {
        const params = new URLSearchParams(window.location.search);

        params.set("modal", "preview-dtr");
        params.set("employee_id", employee.id);
        params.set("name", employee.full_name || employee.first_name || "");

        router.get(route("dailytimerecord"), Object.fromEntries(params), {
            preserveState: true,
            preserveScroll: true,
            replace: true,
        });
    };

    const openPrintDialog = (nextEmployees) => {
        const nextSelection = {};
        const firstEmployee = nextEmployees[0];

        nextEmployees.forEach((emp) => {
            nextSelection[emp.id] = true;
        });

        setSelectedEmployees(nextSelection);
        setPrintEmployees(nextEmployees);
        setDialogOpen(true);

        if (!firstEmployee) {
            return;
        }

        const params = new URLSearchParams(window.location.search);

        params.set("modal", "print-dtr");
        params.set("employee_id", firstEmployee.id);
        params.set(
            "name",
            firstEmployee.full_name || firstEmployee.first_name || "",
        );

        router.get(route("dailytimerecord"), Object.fromEntries(params), {
            only: ["printDtrModal"],
            preserveState: true,
            preserveScroll: true,
            replace: true,
        });
    };

    const closePrintDialog = () => {
        const params = new URLSearchParams(window.location.search);

        params.delete("modal");
        params.delete("employee_id");
        params.delete("name");

        setDialogOpen(false);
        setPrintEmployees([]);

        router.get(route("dailytimerecord"), Object.fromEntries(params), {
            only: ["printDtrModal"],
            preserveState: true,
            preserveScroll: true,
            replace: true,
        });
    };

    const closePreviewDtr = () => {
        const params = new URLSearchParams(window.location.search);

        params.delete("modal");
        params.delete("employee_id");
        params.delete("name");

        router.get(route("dailytimerecord"), Object.fromEntries(params), {
            preserveState: true,
            preserveScroll: true,
            replace: true,
        });
    };

    const openDepartmentPrintDialog = () => {
        const params = new URLSearchParams(window.location.search);

        params.set("modal", "print-department");
        setDepartmentDialogOpen(true);

        router.get(route("dailytimerecord"), Object.fromEntries(params), {
            only: ["departmentPrintModal"],
            preserveState: true,
            preserveScroll: true,
            replace: true,
        });
    };

    const closeDepartmentPrintDialog = () => {
        const params = new URLSearchParams(window.location.search);

        params.delete("modal");
        params.delete("name");

        setDepartmentDialogOpen(false);

        router.get(route("dailytimerecord"), Object.fromEntries(params), {
            only: ["departmentPrintModal"],
            preserveState: true,
            preserveScroll: true,
            replace: true,
        });
    };

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
                <EmployeeList
                    employees={employees}
                    pagination={time_record}
                    selectedEmployees={selectedEmployees}
                    setSelectedEmployees={setSelectedEmployees}
                    search={searchInput}
                    setSearch={setSearchInput}
                    offices={offices}
                    selectedOffice={selectedOffice}
                    setSelectedOffice={setSelectedOffice}
                    selectedMonth={selectedMonth}
                    setSelectedMonth={setSelectedMonth}
                    selectedYear={selectedYear}
                    setSelectedYear={setSelectedYear}
                    applyFilters={applyFilters}
                    onPreviewEmployee={handlePreviewEmployee}
                    onPrintEmployee={(employee) => openPrintDialog([employee])}
                    onPrintDepartment={openDepartmentPrintDialog}
                />

                <PrintDialog
                    open={dialogOpen}
                    onClose={closePrintDialog}
                    selectedEmployees={printEmployees}
                    initialEmployeeData={initialPrintEmployeeData}
                    selectedMonth={selectedMonth}
                    selectedYear={selectedYear}
                />

                <DepartmentPrintDialog
                    open={departmentDialogOpen}
                    onClose={closeDepartmentPrintDialog}
                    initialDepartmentName={departmentPrintModal?.name || ""}
                    selectedMonth={selectedMonth}
                    selectedYear={selectedYear}
                />

                <EmployeePreviewDtr
                    open={!!previewDtrModal}
                    onClose={closePreviewDtr}
                    previewDtrModal={previewDtrModal}
                    selectedMonth={selectedMonth}
                    selectedYear={selectedYear}
                />
            </main>
        </AuthenticatedLayout>
    );
};

export default Daily_Time_Record;
