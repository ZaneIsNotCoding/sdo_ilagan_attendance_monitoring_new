import { useMemo } from "react";
import dayjs from "dayjs";

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

const useEmployeePreviewDtr = ({
    previewDtrModal,
    selectedMonth,
    selectedYear,
}) =>
    useMemo(() => {
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
        const undertimeTotal =
            previewDtrModal?.monthly_totals?.[monthKey] ?? 0;
        const previewMonthLabel = new Date(
            `${previewYear}-${previewMonth}-01`,
        ).toLocaleString("default", { month: "long" });

        return {
            fullName,
            logs,
            previewMonth,
            previewMonthLabel,
            previewYear,
            timeRecord,
            undertimeTotal,
        };
    }, [previewDtrModal, selectedMonth, selectedYear]);

export default useEmployeePreviewDtr;
