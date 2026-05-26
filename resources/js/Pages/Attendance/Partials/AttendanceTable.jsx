import React, { useState, useEffect } from "react";
import {
    Table,
    TableBody,
    TableCell,
    TableHeader,
    TableHead,
    TableRow,
} from "@/components/ui/table";
import {
    Pagination,
    PaginationContent,
    PaginationLink,
    PaginationItem,
    PaginationPrevious,
    PaginationNext,
} from "@/components/ui/pagination";

export const AttendanceTable = ({ dailyAttendance, session, search }) => {
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 8;

    const handlePageChange = (page) => setCurrentPage(page);

    const formatTime12Hour = (timeStr) => {
        if (!timeStr) return "-";
        const [hours, minutes, seconds] = timeStr.split(":").map(Number);
        const ampm = hours >= 12 ? "PM" : "AM";
        const hours12 = hours % 12 || 12;
        return `${hours12}:${minutes.toString().padStart(2, "0")}:${seconds
            .toString()
            .padStart(2, "0")} ${ampm}`;
    };

    const filteredAttendance = dailyAttendance.filter((att) =>
        `${att.employee.first_name} ${att.employee.last_name}`
            .toLowerCase()
            .includes(search.toLowerCase())
    );

    // Sort by latest log (time_out if exists, else time_in)
    const sortedAttendance = filteredAttendance.sort((a, b) => {
        const getLatestTime = (record) => {
            const r = session === "AM" ? record.am : record.pm;
            return (
                r?.[`${session.toLowerCase()}_time_out`] ??
                r?.[`${session.toLowerCase()}_time_in`] ??
                "00:00:00"
            );
        };
        return (
            new Date(`1970-01-01T${getLatestTime(b)}`) -
            new Date(`1970-01-01T${getLatestTime(a)}`)
        );
    });

    const totalPages = Math.ceil(sortedAttendance.length / itemsPerPage);
    const paginatedAttendance = sortedAttendance.slice(
        (currentPage - 1) * itemsPerPage,
        currentPage * itemsPerPage
    );

    useEffect(() => setCurrentPage(1), [search, dailyAttendance, session]);

    return (
        <div className="max-h-[400px] overflow-y-auto">
            <Table>
                <TableHeader>
                    <TableRow className="bg-blue-800 hover:bg-blue-900">
                        <TableHead className="text-center text-white">
                            Employee Name
                        </TableHead>
                        <TableHead className="text-center text-white">
                            Time In
                        </TableHead>
                        <TableHead className="text-center text-white">
                            Time Out
                        </TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {paginatedAttendance.length > 0 ? (
                        paginatedAttendance.map((att) => {
                            const record = session === "AM" ? att.am : att.pm;
                            const latestTime =
                                record?.[`${session.toLowerCase()}_time_out`] ??
                                record?.[`${session.toLowerCase()}_time_in`] ??
                                "0";
                            const rowKey = `${att.id}-${latestTime}`;

                            return (
                                <TableRow
                                    key={rowKey}
                                    className="even:bg-gray-50 hover:bg-gray-100"
                                >
                                    <TableCell className="text-center font-medium text-gray-800">
                                        {att.employee.first_name}{" "}
                                        {att.employee.last_name}
                                    </TableCell>
                                    <TableCell className="text-center text-gray-700">
                                        {formatTime12Hour(
                                            record?.[
                                                `${session.toLowerCase()}_time_in`
                                            ]
                                        )}
                                    </TableCell>
                                    <TableCell className="text-center text-gray-700">
                                        {formatTime12Hour(
                                            record?.[
                                                `${session.toLowerCase()}_time_out`
                                            ]
                                        )}
                                    </TableCell>
                                </TableRow>
                            );
                        })
                    ) : (
                        <TableRow>
                            <TableCell
                                colSpan={3}
                                className="text-center text-gray-500 italic py-4"
                            >
                                No records yet
                            </TableCell>
                        </TableRow>
                    )}
                </TableBody>
            </Table>

            {totalPages > 1 && (
                <div className="mt-4">
                    <Pagination className="my-2 justify-end">
                        <PaginationPrevious
                            disabled={currentPage === 1}
                            onClick={() => handlePageChange(currentPage - 1)}
                        />
                        <PaginationContent>
                            {Array.from({ length: totalPages }, (_, i) => (
                                <PaginationItem key={i}>
                                    <PaginationLink
                                        isActive={currentPage === i + 1}
                                        onClick={() => handlePageChange(i + 1)}
                                    >
                                        {i + 1}
                                    </PaginationLink>
                                </PaginationItem>
                            ))}
                        </PaginationContent>
                        <PaginationNext
                            disabled={currentPage === totalPages}
                            onClick={() => handlePageChange(currentPage + 1)}
                        />
                    </Pagination>
                </div>
            )}
        </div>
    );
};

