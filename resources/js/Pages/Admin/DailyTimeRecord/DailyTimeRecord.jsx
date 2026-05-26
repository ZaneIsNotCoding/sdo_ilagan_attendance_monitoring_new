import React, { useMemo, useState } from "react";
import { Head, router } from "@inertiajs/react";
import { toast } from "sonner";
import AuthenticatedLayout from "@/Layouts/AuthenticatedLayout";
import { CalendarClock } from "lucide-react";

import EmployeeList from "./Partials/EmployeeList";
import PrintDialog from "./Partials/PrintDialog";
import DepartmentPrintDialog from "./Partials/DepartmentPrintDialog";
import EmployeePreviewDtr from "./Partials/EmployeePreviewDtr";
import RecomputeDtrDialog from "./Partials/RecomputeDtrDialog";
import WorkScheduleSettings from "./Partials/WorkScheduleSettings/WorkScheduleSettings";
import useDailyTimeRecordFilters from "./hooks/useDailyTimeRecordFilters";
import useDailyTimeRecordModals from "./hooks/useDailyTimeRecordModals";
import usePreservedPageScroll from "./hooks/usePreservedPageScroll";
import { extractTimeRecordEmployees, resolveCurrentDateParts } from "./utils";
import {
    sortAlphabetically,
    sortEmployeesAlphabetically,
} from "@/lib/utils";

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
    const employees = useMemo(
        () =>
            sortEmployeesAlphabetically(
                extractTimeRecordEmployees(time_record),
            ),
        [time_record],
    );
    const sortedOffices = useMemo(
        () => sortAlphabetically(offices, "name"),
        [offices],
    );
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
        offices: sortedOffices,
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
    const [recomputeEmployee, setRecomputeEmployee] = useState(null);

    const handleUndoRecompute = (undo) => {
        if (!undo?.token || !undo?.employee_id) return;

        rememberPageScroll();

        router.post(
            route("dailytimerecord.recompute.undo", undo.employee_id),
            {
                token: undo.token,
            },
            {
                preserveScroll: true,
                preserveState: true,
                onSuccess: () => {
                    toast.success("Daily time record recompute undone.", {
                        duration: 3000,
                    });
                },
                onFinish: restorePageScroll,
            },
        );
    };

    const showRecomputeUndoToast = (undo) => {
        const toastId = `dtr-recompute-${undo.token}`;
        let secondsLeft = 8;
        let timer;

        const showToast = () => {
            toast.success("Daily time record recomputed.", {
                id: toastId,
                description: `Undo available for ${secondsLeft}s.`,
                duration: secondsLeft * 1000,
                action: {
                    label: "Undo",
                    onClick: () => {
                        clearInterval(timer);
                        toast.dismiss(toastId);
                        handleUndoRecompute(undo);
                    },
                },
            });
        };

        timer = setInterval(() => {
            secondsLeft -= 1;

            if (secondsLeft <= 0) {
                clearInterval(timer);
                return;
            }

            showToast();
        }, 1000);

        showToast();
    };

    const openRecomputeDialog = (employee) => {
        setRecomputeEmployee(employee);
    };

    const closeRecomputeDialog = () => {
        setRecomputeEmployee(null);
    };

    const handleRecomputeEmployee = ({ from, to }) => {
        if (!recomputeEmployee) return;

        rememberPageScroll();

        router.post(
            route("dailytimerecord.recompute", recomputeEmployee.id),
            {
                from,
                to,
            },
            {
                preserveScroll: true,
                preserveState: true,
                onSuccess: (page) => {
                    const undo = page.props.flash?.recomputeUndo;

                    if (!undo) return;

                    showRecomputeUndoToast(undo);
                    closeRecomputeDialog();
                },
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
                    offices={sortedOffices}
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
                    onRecomputeEmployee={openRecomputeDialog}
                />

                <RecomputeDtrDialog
                    employee={recomputeEmployee}
                    onClose={closeRecomputeDialog}
                    onSubmit={handleRecomputeEmployee}
                    selectedMonth={selectedMonth}
                    selectedYear={selectedYear}
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

