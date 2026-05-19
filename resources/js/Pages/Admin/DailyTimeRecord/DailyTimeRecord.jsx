import React from "react";
import { Head, router } from "@inertiajs/react";
import AuthenticatedLayout from "@/Layouts/AuthenticatedLayout";
import { CalendarClock } from "lucide-react";

import EmployeeList from "./Partials/EmployeeList";
import PrintDialog from "./Partials/PrintDialog";
import DepartmentPrintDialog from "./Partials/DepartmentPrintDialog";
import EmployeePreviewDtr from "./Partials/EmployeePreviewDtr";
import WorkScheduleSettings from "./Partials/WorkScheduleSettings/WorkScheduleSettings";
import useDailyTimeRecordFilters from "./hooks/useDailyTimeRecordFilters";
import useDailyTimeRecordModals from "./hooks/useDailyTimeRecordModals";
import usePreservedPageScroll from "./hooks/usePreservedPageScroll";
import { extractTimeRecordEmployees, resolveCurrentDateParts } from "./utils";

const recomputeScrollKey = "dtr-recompute-scroll-top";

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
    workTypes = [],
    workSchedules = [],
    addWorkTypeModal = false,
    addWorkScheduleModal = false,
    editWorkTypeModal = null,
    editWorkScheduleModal = null,
    deleteWorkTypeModal = null,
    deleteWorkScheduleModal = null,
}) => {
    const { currentMonth, currentYear } = resolveCurrentDateParts({
        month,
        year,
    });
    const employees = extractTimeRecordEmployees(time_record);
    const {
        applyFilters,
        searchInput,
        selectedMonth,
        selectedOffice,
        selectedYear,
        setSearchInput,
        setSelectedMonth,
        setSelectedOffice,
        setSelectedYear,
    } = useDailyTimeRecordFilters({
        currentMonth,
        currentYear,
        limit,
        office,
        offices,
        search,
    });
    const {
        closeDepartmentPrintDialog,
        closePreviewDtr,
        closePrintDialog,
        departmentDialogOpen,
        dialogOpen,
        handlePreviewEmployee,
        initialPrintEmployeeData,
        openDepartmentPrintDialog,
        openPrintDialog,
        printEmployees,
        selectedEmployees,
        setSelectedEmployees,
    } = useDailyTimeRecordModals({
        departmentPrintModal,
        printDtrModal,
    });
    const { rememberPageScroll, restorePageScroll } = usePreservedPageScroll({
        storageKey: recomputeScrollKey,
    });

    const handleRecomputeEmployee = (employee) => {
        rememberPageScroll();

        router.post(
            route("dailytimerecord.recompute", employee.id),
            {
                month: selectedMonth,
                year: selectedYear,
            },
            {
                preserveScroll: true,
                preserveState: true,
                onFinish: restorePageScroll,
            },
        );
    };

    return (
        <AuthenticatedLayout
            header={
                <div className="flex items-center gap-5">
                    <CalendarClock className="h-5 w-5 text-blue-600" />
                    <span>Daily Time Record Management</span>
                </div>
            }
        >
            <Head title="AMS" />
            <main>
                <WorkScheduleSettings
                    workTypes={workTypes}
                    workSchedules={workSchedules}
                    addWorkTypeModal={addWorkTypeModal}
                    addWorkScheduleModal={addWorkScheduleModal}
                    editWorkTypeModal={editWorkTypeModal}
                    editWorkScheduleModal={editWorkScheduleModal}
                    deleteWorkTypeModal={deleteWorkTypeModal}
                    deleteWorkScheduleModal={deleteWorkScheduleModal}
                />

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
                    onRecomputeEmployee={handleRecomputeEmployee}
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
