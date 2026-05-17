import React from "react";
import dayjs from "dayjs";
import { Loader2 } from "lucide-react";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";

const formatTime = (time) => {
    if (!time) return "-";

    const value = String(time);
    const timeMatch = value.match(/(\d{1,2}):(\d{2})(?::\d{2})?/);

    if (timeMatch) {
        const hour = Number(timeMatch[1]);
        const minute = timeMatch[2];
        const displayHour = hour % 12 || 12;

        return `${displayHour}:${minute}`;
    }

    const parsedTime = dayjs(value);

    return parsedTime.isValid() ? parsedTime.format("h:mm") : "-";
};

const getAllDaysInMonth = (year, month) => {
    const start = dayjs(`${year}-${month}-01`).startOf("month");
    const end = dayjs(`${year}-${month}-01`).endOf("month");
    const days = [];
    let current = start;

    while (current.isBefore(end) || current.isSame(end, "day")) {
        days.push(current);
        current = current.add(1, "day");
    }

    return days;
};

const generateLogs = (
    timeRecord,
    employeeLeaves,
    selectedMonth,
    selectedYear,
) =>
    getAllDaysInMonth(selectedYear, selectedMonth).map((date) => {
        const formattedDate = date.format("YYYY-MM-DD");
        const attendance = (timeRecord.attendances || []).find((att) =>
            dayjs(att.date).isSame(date, "day"),
        );
        const leave = employeeLeaves.find(
            (item) => item.date === formattedDate,
        );

        return {
            date: formattedDate,
            amIn: leave
                ? leave.leave_type
                : formatTime(attendance?.am?.am_time_in),
            amOut: leave
                ? leave.leave_type
                : formatTime(attendance?.am?.am_time_out),
            pmIn: leave
                ? leave.leave_type
                : formatTime(attendance?.pm?.pm_time_in),
            pmOut: leave
                ? leave.leave_type
                : formatTime(attendance?.pm?.pm_time_out),
            undertime: leave
                ? leave.leave_type
                : (attendance?.tardiness_record?.converted_tardy ?? "-"),
            isLeave: Boolean(leave),
            leave_type: leave?.leave_type ?? null,
        };
    });

const employeeFullName = (employee) =>
    employee?.full_name ||
    [employee?.first_name, employee?.middle_name, employee?.last_name]
        .filter(Boolean)
        .join(" ")
        .replace(/\s+/g, " ")
        .trim();

const PreviewDtrTable = ({
    logs,
    undertimeTotal,
    selectedMonth,
    selectedYear,
}) => {
    return (
        <div className="overflow-hidden rounded-xl border border-slate-200 bg-white text-xs shadow-sm">
            {selectedMonth && selectedYear ? (
                <Table className="w-full table-fixed">
                    <TableHeader>
                        <TableRow className="bg-blue-900 hover:bg-blue-800">
                            {[
                                "Date",
                                "AM In",
                                "AM Out",
                                "PM In",
                                "PM Out",
                                "Undertime",
                            ].map((head) => (
                                <TableHead
                                    key={head}
                                    className="h-8 px-2 text-center text-[11px] font-semibold text-white"
                                >
                                    {head}
                                </TableHead>
                            ))}
                        </TableRow>
                    </TableHeader>

                    <TableBody>
                        {logs.map((log) => (
                            <TableRow
                                key={log.date}
                                className="h-8 transition hover:bg-blue-50"
                            >
                                <TableCell className="px-2 py-1 text-center text-[11px] font-medium text-slate-700">
                                    {log.date}
                                </TableCell>

                                {log.isLeave ? (
                                    <TableCell
                                        className="px-2 py-1 text-center text-[11px] font-semibold text-orange-700"
                                        colSpan={4}
                                    >
                                        {log.leave_type === "VL"
                                            ? "Vacation Leave"
                                            : log.leave_type === "SL"
                                              ? "Sick Leave"
                                              : log.leave_type === "OB"
                                                ? "Official Business"
                                                : log.leave_type}
                                    </TableCell>
                                ) : (
                                    <>
                                        <TableCell className="px-2 py-1 text-center text-[11px] text-slate-600">
                                            {log.amIn}
                                        </TableCell>
                                        <TableCell className="px-2 py-1 text-center text-[11px] text-slate-600">
                                            {log.amOut}
                                        </TableCell>
                                        <TableCell className="px-2 py-1 text-center text-[11px] text-slate-600">
                                            {log.pmIn}
                                        </TableCell>
                                        <TableCell className="px-2 py-1 text-center text-[11px] text-slate-600">
                                            {log.pmOut}
                                        </TableCell>
                                    </>
                                )}

                                <TableCell className="px-2 py-1 text-center text-[11px] font-medium text-slate-700">
                                    {log.isLeave ? " " : log.undertime}
                                </TableCell>
                            </TableRow>
                        ))}

                        <TableRow className="bg-blue-900 font-bold hover:bg-blue-800">
                            <TableCell className="px-2 py-2 text-center text-[11px] text-white">
                                Total
                            </TableCell>
                            <TableCell colSpan={4}></TableCell>
                            <TableCell className="px-2 py-2 text-center text-[11px] text-white">
                                {undertimeTotal.toFixed(2)}
                            </TableCell>
                        </TableRow>
                    </TableBody>
                </Table>
            ) : (
                <p className="p-4 text-gray-600">
                    Please select a month and year to view attendance.
                </p>
            )}
        </div>
    );
};

const EmployeePreviewDtr = ({
    open,
    onClose,
    previewDtrModal = null,
    selectedMonth = dayjs().format("MM"),
    selectedYear = dayjs().format("YYYY"),
}) => {
    const timeRecord = previewDtrModal?.time_record;
    const fullName = employeeFullName(timeRecord);
    const previewMonth = String(selectedMonth).padStart(2, "0");
    const previewYear = String(selectedYear);
    const logs = timeRecord
        ? generateLogs(
              timeRecord,
              previewDtrModal?.employee_leaves || [],
              previewMonth,
              previewYear,
          )
        : [];
    const monthKey = `${previewYear}-${previewMonth}`;
    const undertimeTotal = previewDtrModal?.monthly_totals?.[monthKey] ?? 0;
    const previewMonthLabel = new Date(
        `${previewYear}-${previewMonth}-01`,
    ).toLocaleString("default", { month: "long" });

    return (
        <Dialog open={open} onOpenChange={(nextOpen) => !nextOpen && onClose()}>
            <DialogContent className="max-h-[92vh] max-w-5xl overflow-y-auto rounded-2xl">
                <DialogHeader>
                    <DialogTitle className="text-base">
                        {timeRecord
                            ? `${fullName} - DTR Preview`
                            : "Daily Time Record Preview"}
                    </DialogTitle>
                    <DialogDescription className="text-xs">
                        {timeRecord
                            ? `Attendance for ${fullName} on ${previewMonthLabel} ${previewYear}`
                            : "Compact monthly preview for the current month."}
                    </DialogDescription>
                </DialogHeader>

                {open && !previewDtrModal ? (
                    <div className="flex min-h-[18rem] items-center justify-center gap-2 text-sm text-slate-500">
                        <Loader2 className="h-5 w-5 animate-spin text-blue-600" />
                        Loading DTR preview...
                    </div>
                ) : timeRecord ? (
                    <PreviewDtrTable
                        logs={logs}
                        undertimeTotal={undertimeTotal}
                        selectedMonth={previewMonth}
                        selectedYear={previewYear}
                    />
                ) : (
                    <div className="py-8 text-center text-sm text-slate-500">
                        Unable to load DTR preview.
                    </div>
                )}
            </DialogContent>
        </Dialog>
    );
};

export default EmployeePreviewDtr;
