import { Button } from "@/components/ui/button";
import {
    Pagination,
    PaginationContent,
    PaginationItem,
    PaginationLink,
    PaginationNext,
    PaginationPrevious,
} from "@/components/ui/pagination";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import { Trash2, LandPlot, CheckCircle2, XCircle } from "lucide-react";
import React, { useState } from "react";
import ConfirmPasswordDialog from "@/Components/ConfirmPasswordDialog";
import AssignStationAdminModal from "./AddStationAdminModal";

const ITEMS_PER_PAGE = 10;

const StationAdminList = ({
    stations = [],
    school_admins = [],
    employees = [],
}) => {
    const [currentPage, setCurrentPage] = useState(1);
    const [selectedStationForAssign, setSelectedStationForAssign] =
        useState(null);

    const stationRows = stations.map((station) => {
        const admin = school_admins.find(
            (a) => a.employee?.station_id === station.id,
        );

        return {
            station,
            admin: admin || null,
        };
    });

    const totalPages = Math.ceil(stationRows.length / ITEMS_PER_PAGE);

    const paginatedRows = stationRows.slice(
        (currentPage - 1) * ITEMS_PER_PAGE,
        currentPage * ITEMS_PER_PAGE,
    );

    const handlePageChange = (page) => {
        if (page < 1 || page > totalPages) return;
        setCurrentPage(page);
    };

    const getFullName = (emp) => {
        if (!emp) return "-";
        return `${emp.first_name || ""} ${emp.middle_name || ""} ${emp.last_name || ""}`
            .replace(/\s+/g, " ")
            .trim();
    };

    const startIndex = (currentPage - 1) * ITEMS_PER_PAGE + 1;
    const endIndex = Math.min(currentPage * ITEMS_PER_PAGE, stationRows.length);
    const totalEntries = stationRows.length;

    return (
        <div className="rounded-xl">
            {/* HEADER */}
            <div className="flex justify-between items-center mb-4">
                <div>
                    <h2 className="text-lg font-bold">
                        Station Administrator List
                    </h2>
                    <p className="text-sm text-gray-500">
                        Manage station assignments
                    </p>
                </div>
            </div>

            {/* TABLE */}
            <div className="overflow-x-auto border rounded-lg">
                <Table className="w-full table-fixed">
                    <TableHeader>
                        <TableRow className="bg-blue-900 hover:bg-blue-800">
                            <TableHead className="text-white text-left px-10 w-[20%]">
                                Employee Name
                            </TableHead>
                            <TableHead className="text-white p-3 w-[15%]">
                                Code
                            </TableHead>
                            <TableHead className="text-white p-3 w-[30%]">
                                Station
                            </TableHead>

                            <TableHead className="text-white p-3 w-[10%]">
                                Status
                            </TableHead>
                            <TableHead className="text-white text-center p-3 w-[10%]">
                                Actions
                            </TableHead>
                        </TableRow>
                    </TableHeader>

                    <TableBody>
                        {paginatedRows.length > 0 ? (
                            paginatedRows.map(({ station, admin }) => {
                                const emp = admin?.employee;

                                return (
                                    <TableRow
                                        key={station.id}
                                        className={`h-[64px] transition ${
                                            !admin
                                                ? "bg-gray-100 hover:bg-gray-200"
                                                : "bg-white hover:bg-blue-50"
                                        }`}
                                    >
                                        <TableCell className="p-3">
                                            <div className="flex items-center gap-3">
                                                <div className="w-8 h-8 min-w-[32px] min-h-[32px] rounded-full bg-blue-300 text-blue-600 flex items-center justify-center text-xs font-bold">
                                                    {emp
                                                        ? getFullName(emp)
                                                              .split(" ")
                                                              .map((n) => n[0])
                                                              .join("")
                                                        : "-"}
                                                </div>

                                                <div className="min-w-0">
                                                    <div className="font-medium truncate">
                                                        {emp
                                                            ? getFullName(emp)
                                                            : "No Admin Assigned"}
                                                    </div>
                                                    {/* ✅ POSITION */}
                                                    {emp && (
                                                        <div className="text-xs text-gray-600 truncate">
                                                            {emp.position ||
                                                                "-"}
                                                        </div>
                                                    )}

                                                    {emp && (
                                                        <div className="text-xs text-gray-500 truncate">
                                                            {emp?.user?.email ||
                                                                ""}
                                                        </div>
                                                    )}
                                                </div>
                                            </div>
                                        </TableCell>
                                        {/* CODE */}
                                        <TableCell className="p-3 font-medium">
                                            {station.code || "-"}
                                        </TableCell>

                                        {/* STATION NAME */}
                                        <TableCell className="p-3">
                                            <div className="flex items-center gap-2 min-w-0">
                                                <div className="w-7 h-7 min-w-[28px] flex items-center justify-center rounded-full bg-gray-300">
                                                    <LandPlot className="w-4 h-4 text-blue-600" />
                                                </div>
                                                <span className="truncate">
                                                    {station.name}
                                                </span>
                                            </div>
                                        </TableCell>

                                        {/* STATUS */}
                                        <TableCell className="p-3">
                                            {admin ? (
                                                <span className="px-2 py-1 text-xs font-semibold bg-green-200 text-green-800 rounded-full inline-flex items-center gap-2">
                                                    <CheckCircle2 size={14} />
                                                    Assigned
                                                </span>
                                            ) : (
                                                <span className="px-2 py-1 text-xs font-semibold bg-red-200 text-red-800 rounded-full inline-flex items-center gap-2">
                                                    <XCircle size={14} />
                                                    Missing
                                                </span>
                                            )}
                                        </TableCell>

                                        {/* ACTIONS */}
                                        <TableCell className="p-3 text-center">
                                            {admin ? (
                                                <ConfirmPasswordDialog
                                                    trigger={
                                                        <Button
                                                            size="icon"
                                                            className="bg-red-100 text-red-600 hover:bg-red-500 hover:text-white rounded-full"
                                                        >
                                                            <Trash2 className="h-4 w-4" />
                                                        </Button>
                                                    }
                                                    title="Remove Station Admin"
                                                    description="Remove assigned admin from this station."
                                                    itemLabel="Station Admin"
                                                    itemName={getFullName(emp)}
                                                    method="delete"
                                                />
                                            ) : (
                                                <Button
                                                    size="sm"
                                                    className="bg-white text-blue-600 border border-blue-600 hover:bg-blue-600 hover:text-white"
                                                    onClick={() =>
                                                        setSelectedStationForAssign(
                                                            station.id,
                                                        )
                                                    }
                                                >
                                                    Assign
                                                </Button>
                                            )}
                                        </TableCell>
                                    </TableRow>
                                );
                            })
                        ) : (
                            <TableRow>
                                <TableCell
                                    colSpan="5"
                                    className="text-center p-5 text-gray-500"
                                >
                                    No Stations Found
                                </TableCell>
                            </TableRow>
                        )}
                    </TableBody>
                </Table>
            </div>

            {/* PAGINATION */}
            <div className="flex items-center mt-4">
                <div className="text-sm text-gray-500 font-medium">
                    Showing {startIndex} to {endIndex} of {totalEntries} entries
                </div>

                <div className="ml-auto">
                    {totalPages > 1 && (
                        <Pagination>
                            <PaginationPrevious
                                onClick={() =>
                                    handlePageChange(currentPage - 1)
                                }
                            />
                            <PaginationContent>
                                {Array.from({ length: totalPages }, (_, i) => (
                                    <PaginationItem key={i}>
                                        <PaginationLink
                                            isActive={currentPage === i + 1}
                                            onClick={() =>
                                                handlePageChange(i + 1)
                                            }
                                        >
                                            {i + 1}
                                        </PaginationLink>
                                    </PaginationItem>
                                ))}
                            </PaginationContent>
                            <PaginationNext
                                onClick={() =>
                                    handlePageChange(currentPage + 1)
                                }
                            />
                        </Pagination>
                    )}
                </div>
            </div>

            <AssignStationAdminModal
                open={!!selectedStationForAssign}
                setOpen={() => setSelectedStationForAssign(null)}
                employees={employees}
                stations={stations}
                stationId={selectedStationForAssign}
            />
        </div>
    );
};

export default StationAdminList;
