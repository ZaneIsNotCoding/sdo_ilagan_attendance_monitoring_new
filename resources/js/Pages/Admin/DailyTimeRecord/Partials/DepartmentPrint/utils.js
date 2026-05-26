import dayjs from "dayjs";

export const EMPLOYEES_PER_PAGE = 3;
export const SIGNATORY_POPOVER_WIDTH = 360;

const monthNames = [
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

export const formatMonth = (month) =>
    monthNames[Number(month) - 1] || monthNames[0];

export const employeeDepartment = (employee) =>
    employee?.department || employee?.office?.name || "No Department";

export const employeeSignatory = (employee, employeeData, type) =>
    employeeData[employee.id]?.signatories?.[type] || {
        name: "Loading signatory...",
        position: type === "division_head" ? "Division Head" : "Office Head",
        office: employeeDepartment(employee),
        employee: null,
        missing: true,
    };

export const signatoryChoices = [
    { value: "office_head", label: "Office Head" },
    { value: "division_head", label: "Division Head" },
];

export const signatoryKey = (signatory) =>
    signatory?.employee?.id
        ? `employee:${signatory.employee.id}`
        : [
              signatory?.label,
              signatory?.name,
              signatory?.position,
              signatory?.office,
          ].join("|");

export const generateLogs = (timeRecord, selectedMonth, selectedYear) => {
    const attendances = timeRecord.attendances || [];
    const month = String(selectedMonth).padStart(2, "0");
    const start = dayjs(`${selectedYear}-${month}-01`).startOf("month");
    const end = dayjs(`${selectedYear}-${month}-01`).endOf("month");
    const days = [];
    let current = start;

    while (current.isBefore(end) || current.isSame(end, "day")) {
        days.push(current);
        current = current.add(1, "day");
    }

    return days.map((date) => {
        const attendance = attendances.find((item) =>
            dayjs(item.date).isSame(date, "day"),
        );

        return {
            date: date.format("YYYY-MM-DD"),
            amIn: attendance?.am?.am_time_in || "-",
            amOut: attendance?.am?.am_time_out || "-",
            pmIn: attendance?.pm?.pm_time_in || "-",
            pmOut: attendance?.pm?.pm_time_out || "-",
            undertime: attendance?.tardiness_record?.converted_tardy || "-",
        };
    });
};
