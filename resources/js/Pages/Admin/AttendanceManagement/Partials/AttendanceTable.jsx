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

const AttendanceTable = ({ records }) => {
    return (
        <Table className="table-fixed">
            <TableCaption>
                List of employees with incomplete attendance records.
            </TableCaption>
            <TableHeader>
                <TableRow className="bg-blue-900 hover:bg-blue-800">
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
                {records.length > 0 ? (
                    records.map((att) => (
                        <TableRow key={att.id}>
                            <TableCell>
                                {att.employee?.first_name}{" "}
                                {att.employee?.last_name}
                            </TableCell>
                            <TableCell>
                                    {att.employee?.office?.name || "-"}
                            </TableCell>
                            <TableCell>
                                {dayjs(att.date).format("DD MMMM")}
                            </TableCell>
                            <TableCell>{att.am?.am_time_in || "-"}</TableCell>
                            <TableCell>{att.am?.am_time_out || "-"}</TableCell>
                            <TableCell>{att.pm?.pm_time_in || "-"}</TableCell>
                            <TableCell>{att.pm?.pm_time_out || "-"}</TableCell>
                            <TableCell className="flex justify-end pr-24">
                                <EditAttendanceDialog attendance={att} />
                            </TableCell>
                        </TableRow>
                    ))
                ) : (
                    <TableRow>
                        <TableCell colSpan={8} className="text-center">
                            No incomplete attendance records found
                        </TableCell>
                    </TableRow>
                )}
            </TableBody>
        </Table>
    );
};

export default AttendanceTable;
