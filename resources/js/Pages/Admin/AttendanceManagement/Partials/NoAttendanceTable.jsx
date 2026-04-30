import React from "react";
import dayjs from "dayjs";
import {
    Table,
    TableBody,
    TableCaption,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import EditAttendanceDialog from "./EditAttendanceDialog";

const NoAttendanceTable = ({ employees, selectedDate }) => {
    const selectedDateObj = dayjs(selectedDate, "YYYY-MM-DD");
    const isWeekend = [0, 6].includes(selectedDateObj.day());

    const displayEmployees = isWeekend ? [] : employees;

    return (
        <Table className="table-fixed">
            <TableCaption>
                Employees who have no attendance record for the selected date
                (excluding Saturday & Sunday).
            </TableCaption>
            <TableHeader>
                <TableRow className="bg-red-900 hover:bg-red-800">
                    <TableHead>Employee</TableHead>
                    <TableHead>Office</TableHead>
                    <TableHead>Date</TableHead>
                    <TableHead>AM Time In</TableHead>
                    <TableHead>AM Time Out</TableHead>
                    <TableHead>PM Time In</TableHead>
                    <TableHead>PM Time Out</TableHead>
                    <TableHead></TableHead>
                </TableRow>
            </TableHeader>
            <TableBody>
                {isWeekend ? (
                    <TableRow>
                        <TableCell colSpan={8} className="text-center">
                            Selected day is Saturday/Sunday
                        </TableCell>
                    </TableRow>
                ) : displayEmployees.length > 0 ? (
                    displayEmployees.map((emp) => (
                        <TableRow key={emp.id}>
                            <TableCell>
                                {emp.first_name} {emp.last_name}
                            </TableCell>
                        <TableCell>{emp.office?.name || "-"}</TableCell>
                            <TableCell>
                                {dayjs(selectedDate).format("DD MMMM")}
                            </TableCell>
                            <TableCell>-</TableCell>
                            <TableCell>-</TableCell>
                            <TableCell>-</TableCell>
                            <TableCell>-</TableCell>
                            <TableCell className="flex justify-end pr-24">
                                <EditAttendanceDialog
                                    attendance={{
                                        employee_id: emp.id,
                                        employee: emp,
                                        date: selectedDate,
                                        am: {
                                            am_time_in: null,
                                            am_time_out: null,
                                        },
                                        pm: {
                                            pm_time_in: null,
                                            pm_time_out: null,
                                        },
                                    }}
                                />
                            </TableCell>
                        </TableRow>
                    ))
                ) : (
                    <TableRow>
                        <TableCell colSpan={8} className="text-center">
                            All employees have attendance
                        </TableCell>
                    </TableRow>
                )}
            </TableBody>
        </Table>
    );
};

export default NoAttendanceTable;
