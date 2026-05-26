import React, { useState, useMemo, useRef } from "react";
import { Head } from "@inertiajs/react";
import AuthenticatedLayout from "@/Layouts/AuthenticatedLayout";
import { router } from "@inertiajs/react";
import dayjs from "dayjs";
import localeData from "dayjs/plugin/localeData";
import isSameOrAfter from "dayjs/plugin/isSameOrAfter";
import isSameOrBefore from "dayjs/plugin/isSameOrBefore";
import { CustomDropdownCheckbox } from "@/components/dropdown-menu-main";
import { Button } from "@/Components/ui/button";
import { toast } from "sonner";
import html2pdf from "html2pdf.js";
import HrSummaryofTardinessReport from "@/Pages/DocumentsFormats/HrSummaryofTardinessReport";
import { sortAlphabetically, sortWithPinnedFirst } from "@/lib/utils";

import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";

import {
    AlertDialog,
    AlertDialogTrigger,
    AlertDialogContent,
    AlertDialogHeader,
    AlertDialogFooter,
    AlertDialogTitle,
    AlertDialogDescription,
    AlertDialogAction,
    AlertDialogCancel,
} from "@/components/ui/alert-dialog";

dayjs.extend(localeData);
dayjs.extend(isSameOrAfter);
dayjs.extend(isSameOrBefore);

const TardyConvertion = ({
    records,
    conversionHours = [],
    conversionMinutes = [],
}) => {
    const pdfRef = useRef();
    const currentMonth = dayjs().format("MMMM YYYY");

    // Build month list
    const monthList = useMemo(() => {
        const unique = Array.from(
            new Set(records.map((r) => dayjs(r.date).format("MMMM YYYY")))
        );
        return unique.sort((a, b) =>
            dayjs(a, "MMMM YYYY").isAfter(dayjs(b, "MMMM YYYY")) ? 1 : -1
        );
    }, [records]);

    const [selectedFirstMonth, setSelectedFirstMonth] = useState(() =>
        monthList.length > 0 ? monthList[0] : currentMonth
    );

    const [selectedSecondMonth, setSelectedSecondMonth] = useState(() =>
        monthList.includes(currentMonth)
            ? currentMonth
            : monthList[monthList.length - 1]
    );

    const [selectedDepartment, setSelectedDepartment] =
        useState("All Departments");

    const departments = useMemo(() => {
        const depts = Array.from(
            new Set(records.map((r) => r.dept).filter(Boolean))
        );

        return sortWithPinnedFirst(
            ["All Departments", ...depts],
            ["All Departments"]
        );
    }, [records]);

    // Filter records based on department and month range
    const filteredRecords = useMemo(() => {
        return records.filter((record) => {
            const recordMonth = dayjs(record.date).format("MMMM YYYY");
            const inDateRange =
                dayjs(recordMonth, "MMMM YYYY").isSameOrAfter(
                    dayjs(selectedFirstMonth, "MMMM YYYY")
                ) &&
                dayjs(recordMonth, "MMMM YYYY").isSameOrBefore(
                    dayjs(selectedSecondMonth, "MMMM YYYY")
                );
            const inDepartment =
                selectedDepartment === "All Departments" ||
                record.dept === selectedDepartment;
            return inDateRange && inDepartment;
        });
    }, [records, selectedFirstMonth, selectedSecondMonth, selectedDepartment]);

    // Group by employee
    const groupedByEmployee = useMemo(() => {
        const grouped = {};

        filteredRecords.forEach((rec) => {
            const key = `${rec.employee_id}-${rec.name}-${rec.dept}`;
            if (!grouped[key]) {
                grouped[key] = { ...rec, totalHours: 0, totalMinutes: 0 };
            }

            const hours = Math.floor(rec.total_tardy);
            const minutes = Math.round((rec.total_tardy - hours) * 100);

            grouped[key].totalHours += hours;
            grouped[key].totalMinutes += minutes;
        });

        const employees = Object.values(grouped).map((emp) => {
            let { totalHours, totalMinutes } = emp;

            if (totalMinutes >= 60) {
                totalHours += Math.floor(totalMinutes / 60);
                totalMinutes = totalMinutes % 60;
            }

            const equi_hours = Number(
                conversionHours.find((h) => h.hours === totalHours)
                    ?.equivalent_days || 0
            );
            const equi_mins = Number(
                conversionMinutes.find((m) => m.minutes === totalMinutes)
                    ?.equivalent_days || 0
            );

            return {
                ...emp,
                total_tardy: parseFloat(
                    `${totalHours}.${String(totalMinutes).padStart(2, "0")}`
                ),
                equi_hours,
                equi_mins,
                total_equi: equi_hours + equi_mins,
            };
        });

        return sortAlphabetically(employees, "name");
    }, [filteredRecords, conversionHours, conversionMinutes]);

    // Month range label
    const monthRangeLabel = useMemo(() => {
        const start = dayjs(selectedFirstMonth, "MMMM YYYY");
        const end = dayjs(selectedSecondMonth, "MMMM YYYY");

        if (start.isSame(end, "month") && start.isSame(end, "year"))
            return start.format("MMMM YYYY");
        if (start.isSame(end, "year"))
            return `${start.format("MMM")}–${end.format("MMM YYYY")}`;
        return `${start.format("MMM YYYY")} – ${end.format("MMM YYYY")}`;
    }, [selectedFirstMonth, selectedSecondMonth]);

    const handlePrintPDF = () => {
        const element = pdfRef.current;

        html2pdf()
            .set({
                margin: 0.5,
                filename: `HR_Tardiness_Summary_${monthRangeLabel}.pdf`,
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

    const handleSave = () => {
        const summaries = groupedByEmployee.map((record) => ({
            employee_id: record.employee_id,
            start_month: dayjs(selectedFirstMonth, "MMMM YYYY")
                .startOf("month")
                .format("YYYY-MM-DD"),
            end_month: dayjs(selectedSecondMonth, "MMMM YYYY")
                .endOf("month")
                .format("YYYY-MM-DD"),
            total_tardy: Number(record.total_tardy.toFixed(2)),
            total_hours: Number(record.equi_hours.toFixed(3)),
            total_minutes: Number(record.equi_mins.toFixed(3)),
            total_equivalent: Number(record.total_equi.toFixed(3)),
        }));

        router.post(
            route("tardy-convertions"),
            { summaries },
            {
                onError: (errors) =>
                    toast.error("Failed to save summaries", {
                        description: "Please check the form and try again.",
                    }),
                onSuccess: () => {
                    toast.success("Success 🎉", {
                        description:
                            "All tardiness summaries have been saved successfully!",
                    });
                    handlePrintPDF();
                },
            }
        );
    };

    return (
        <AuthenticatedLayout header="Tardiness Summary Report">
            <Head title="AMS" />
            <main className="flex-1 p-3">
                <div className="flex justify-between items-center mb-4">
                    <h3 className="text-lg font-semibold mb-4">
                        Tardiness Summary
                    </h3>

                    <div className="flex justify-between gap-5">
                        <CustomDropdownCheckbox
                            label="Department"
                            items={departments}
                            selected={selectedDepartment}
                            onChange={setSelectedDepartment}
                            buttonVariant="green"
                        />

                        <div className="flex items-center gap-3 w-fit">
                            <span className="text-sm font-semibold">
                                Date Range:
                            </span>
                            <CustomDropdownCheckbox
                                label="Start Month"
                                items={monthList}
                                selected={selectedFirstMonth}
                                onChange={setSelectedFirstMonth}
                                buttonVariant="cyan"
                            />
                            <span className="text-sm font-semibold text-gray-500">
                                –
                            </span>
                            <CustomDropdownCheckbox
                                label="End Month"
                                items={monthList.filter((m) =>
                                    dayjs(m, "MMMM YYYY").isSameOrAfter(
                                        dayjs(selectedFirstMonth, "MMMM YYYY")
                                    )
                                )}
                                selected={selectedSecondMonth}
                                onChange={setSelectedSecondMonth}
                                buttonVariant="indigo"
                            />
                        </div>
                    </div>
                </div>

                <Table>
                    <TableHeader>
                        <TableRow className="bg-blue-900 hover:bg-blue-800">
                            <TableHead>Name</TableHead>
                            <TableHead>Department</TableHead>
                            <TableHead>Month</TableHead>
                            <TableHead>Total Tardy</TableHead>
                            <TableHead>Equiv Day in Hours</TableHead>
                            <TableHead>Equiv Day in Minutes</TableHead>
                            <TableHead>Total</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {groupedByEmployee.map((record, idx) => (
                            <TableRow key={`${record.employee_id}-${idx}`}>
                                <TableCell>{record.name}</TableCell>
                                <TableCell>{record.dept}</TableCell>
                                <TableCell>{monthRangeLabel}</TableCell>
                                <TableCell>
                                    {record.total_tardy.toFixed(2)}
                                </TableCell>
                                <TableCell>
                                    {record.equi_hours.toFixed(3)}
                                </TableCell>
                                <TableCell>
                                    {record.equi_mins.toFixed(3)}
                                </TableCell>
                                <TableCell>
                                    {record.total_equi.toFixed(3)}
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>

                <AlertDialog>
                    <AlertDialogTrigger asChild>
                        <Button variant="green">Save All Summaries</Button>
                    </AlertDialogTrigger>

                    <AlertDialogContent>
                        <AlertDialogHeader>
                            <AlertDialogTitle>
                                {groupedByEmployee.length > 0
                                    ? "Confirm Save"
                                    : "No Records to Save"}
                            </AlertDialogTitle>
                            <AlertDialogDescription>
                                {groupedByEmployee.length > 0
                                    ? "Are you sure you want to save all tardiness summaries? This action cannot be undone."
                                    : "There are no records to save at this moment."}
                            </AlertDialogDescription>
                        </AlertDialogHeader>

                        <AlertDialogFooter>
                            <AlertDialogCancel>Close</AlertDialogCancel>
                            {groupedByEmployee.length > 0 && (
                                <AlertDialogAction
                                    onClick={handleSave}
                                    className="bg-blue-600 hover:bg-blue-700"
                                >
                                    Confirm
                                </AlertDialogAction>
                            )}
                        </AlertDialogFooter>
                    </AlertDialogContent>
                </AlertDialog>

                <div style={{ display: "none" }}>
                    <HrSummaryofTardinessReport
                        ref={pdfRef}
                        groupedByEmployee={groupedByEmployee}
                        monthRangeLabel={monthRangeLabel}
                    />
                </div>
            </main>
        </AuthenticatedLayout>
    );
};

export default TardyConvertion;

