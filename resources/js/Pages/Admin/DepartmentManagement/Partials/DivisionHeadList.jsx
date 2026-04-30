import React, { useEffect, useMemo, useRef, useState } from "react";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import {
    Pagination,
    PaginationContent,
    PaginationItem,
    PaginationLink,
    PaginationNext,
    PaginationPrevious,
} from "@/components/ui/pagination";
import { Button } from "@/components/ui/button";
import { Building2, CheckCircle2, Trash2 } from "lucide-react";
import ConfirmPasswordDialog from "@/Components/ConfirmPasswordDialog";
import AddDivisionHeadForm from "./AddDivisionHeadForm";
import EmployeeAvatar from "@/Components/EmployeeAvatar";

const ITEMS_PER_PAGE = 10;

const DivisionHeadList = ({
    division_heads = [],
    employees = [],
    divisions = [],
    onAssignNow,
    highlightedDivisionId = null,
    highlightRequestKey = 0,
}) => {
    const [openAdd, setOpenAdd] = useState(false);
    const [currentPage, setCurrentPage] = useState(1);
    const [selectedDivisionForAssign, setSelectedDivisionForAssign] =
        useState(null);
    const [animatedDivisionId, setAnimatedDivisionId] = useState(null);
    const animationTimeoutRef = useRef(null);

    const visibleDivisionRows = useMemo(
        () =>
            divisions.map((division) => {
                const head =
                    division_heads.find(
                        (h) => h.division_id === division.id,
                    ) || null;
                return { division, head };
            }),
        [division_heads, divisions],
    );

    const highlightedDivisionIndex = useMemo(
        () =>
            visibleDivisionRows.findIndex(
                (row) => row.division.id === highlightedDivisionId,
            ),
        [visibleDivisionRows, highlightedDivisionId],
    );

    const totalPages =
        Math.ceil(visibleDivisionRows.length / ITEMS_PER_PAGE) || 1;
    const paginatedRows = visibleDivisionRows.slice(
        (currentPage - 1) * ITEMS_PER_PAGE,
        currentPage * ITEMS_PER_PAGE,
    );

    const startIndex =
        visibleDivisionRows.length === 0
            ? 0
            : (currentPage - 1) * ITEMS_PER_PAGE + 1;
    const endIndex = Math.min(
        currentPage * ITEMS_PER_PAGE,
        visibleDivisionRows.length,
    );

    const getFullName = (emp) =>
        !emp
            ? "-"
            : `${emp.first_name || ""} ${emp.middle_name || ""} ${emp.last_name || ""}`.replace(
                  /\s+/g,
                  " ",
              );

    useEffect(() => {
        if (highlightedDivisionId == null || highlightedDivisionIndex < 0)
            return;

        setCurrentPage(
            Math.floor(highlightedDivisionIndex / ITEMS_PER_PAGE) + 1,
        );
        setAnimatedDivisionId(highlightedDivisionId);

        if (animationTimeoutRef.current)
            clearTimeout(animationTimeoutRef.current);

        animationTimeoutRef.current = setTimeout(() => {
            setAnimatedDivisionId(null);
        }, 2200);
    }, [highlightedDivisionId, highlightedDivisionIndex, highlightRequestKey]);

    useEffect(
        () => () => {
            if (animationTimeoutRef.current)
                clearTimeout(animationTimeoutRef.current);
        },
        [],
    );

    useEffect(() => {
        setCurrentPage(1);
    }, [divisions]);

    return (
        <div className="rounded-xl">
            <div className="mb-4 flex items-start justify-between gap-4">
                <div>
                    <h2 className="text-lg font-bold">Division Head List</h2>
                    <p className="text-sm text-gray-500">
                        Manage division head assignments
                    </p>
                </div>
            </div>

            <AddDivisionHeadForm
                open={openAdd}
                setOpen={setOpenAdd}
                employees={employees}
                divisions={divisions}
                preselectedDivision={selectedDivisionForAssign}
            />

            <div className="overflow-x-auto rounded-lg border">
                <Table className="w-full table-fixed">
                    <TableHeader>
                        <TableRow className="bg-blue-900 hover:bg-blue-800">
                            <TableHead className="w-[25%] px-10 text-white">
                                Employee Name
                            </TableHead>
                            <TableHead className="w-[15%] p-3 text-white">
                                Position
                            </TableHead>
                            <TableHead className="w-[25%] p-3 text-white">
                                Division
                            </TableHead>
                            <TableHead className="w-[15%] p-3 text-white">
                                Status
                            </TableHead>
                            <TableHead className="w-[10%] p-3 text-white">
                                Date Assigned
                            </TableHead>
                            <TableHead className="w-[15%] p-3 text-center text-white">
                                Actions
                            </TableHead>
                        </TableRow>
                    </TableHeader>

                    <TableBody>
                        {paginatedRows.length > 0 ? (
                            paginatedRows.map((row) => {
                                const emp = row.head?.employee;
                                const isHighlighted =
                                    row.division.id === animatedDivisionId;

                                return (
                                    <TableRow
                                        key={row.division.id}
                                        className={`h-[64px] transition ${
                                            isHighlighted
                                                ? "bg-amber-50 ring-1 ring-inset ring-amber-300 hover:bg-amber-100"
                                                : !row.head
                                                  ? "bg-gray-100 hover:bg-gray-200"
                                                  : "bg-white hover:bg-blue-50"
                                        }`}
                                    >
                                        <TableCell className="p-3">
                                            <div className="flex items-center gap-3">
                                                <EmployeeAvatar
                                                    employee={emp}
                                                />

                                                <div className="min-w-0">
                                                    <div className="truncate font-medium">
                                                        {emp
                                                            ? getFullName(emp)
                                                            : "No Head Assigned"}
                                                    </div>
                                                    {emp && (
                                                        <div className="truncate text-xs text-gray-500">
                                                            {emp.email || ""}
                                                        </div>
                                                    )}
                                                </div>
                                            </div>
                                        </TableCell>

                                        <TableCell className="p-3 text-gray-700 truncate">
                                            {emp?.position || "-"}
                                        </TableCell>

                                        <TableCell className="p-3">
                                            <div className="flex items-center gap-2 min-w-0">
                                                <div className="flex h-7 w-7 min-w-[28px] items-center justify-center rounded-full bg-gray-300">
                                                    <Building2 className="h-4 w-4 text-blue-600" />
                                                </div>

                                                <span className="truncate px-3 py-1 text-sm rounded">
                                                    {row.division.code}
                                                </span>
                                            </div>
                                            <div className="mt-1 text-xs text-gray-500">
                                                {row.division.name}
                                            </div>
                                        </TableCell>

                                        <TableCell className="p-3">
                                            {row.head ? (
                                                <span className="inline-flex min-w-[90px] items-center justify-center gap-2 rounded-full bg-green-200 px-2 py-1 text-xs font-semibold text-green-800">
                                                    <CheckCircle2 size={14} />
                                                    Assigned
                                                </span>
                                            ) : (
                                                <span className="inline-flex min-w-[90px] items-center justify-center gap-2 rounded-full bg-red-200 px-2 py-1 text-xs font-semibold text-red-800">
                                                    <CheckCircle2 size={14} />
                                                    Missing
                                                </span>
                                            )}
                                        </TableCell>

                                        <TableCell className="p-3 truncate">
                                            {row.head
                                                ? new Date(
                                                      row.head.created_at,
                                                  ).toLocaleDateString(
                                                      "en-US",
                                                      {
                                                          year: "numeric",
                                                          month: "short",
                                                          day: "numeric",
                                                      },
                                                  )
                                                : "-"}
                                        </TableCell>

                                        <TableCell className="p-3 text-center">
                                            {row.head ? (
                                                <ConfirmPasswordDialog
                                                    trigger={
                                                        <Button
                                                            size="icon"
                                                            className="rounded-full bg-red-100 text-red-600 hover:bg-red-500 hover:text-white"
                                                        >
                                                            <Trash2 className="h-4 w-4" />
                                                        </Button>
                                                    }
                                                    title="Delete Division Head"
                                                    description="You are about to permanently remove this division head assignment."
                                                    itemLabel="Division Head"
                                                    itemName={getFullName(emp)}
                                                    action={route(
                                                        "divisionhead.destroy",
                                                        row.head.id,
                                                    )}
                                                    method="delete"
                                                />
                                            ) : (
                                                <Button
                                                    size="sm"
                                                    className={`min-w-[60px] border border-blue-600 bg-white text-blue-600 hover:bg-blue-600 hover:text-white ${
                                                        isHighlighted
                                                            ? "animate-bounce bg-blue-600 font-semibold text-white shadow-lg shadow-blue-200"
                                                            : ""
                                                    }`}
                                                    onClick={() => {
                                                        setSelectedDivisionForAssign(
                                                            row.division.id,
                                                        );
                                                        setOpenAdd(true);
                                                        onAssignNow?.(
                                                            row.division.id,
                                                        );
                                                    }}
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
                                    colSpan="6"
                                    className="p-5 text-center text-gray-500"
                                >
                                    No Divisions Found
                                </TableCell>
                            </TableRow>
                        )}
                    </TableBody>
                </Table>
            </div>

            <div className="mt-4 flex items-center">
                <div className="text-sm font-medium text-gray-500">
                    Showing {startIndex} to {endIndex} of{" "}
                    {visibleDivisionRows.length} entries
                </div>

                <div className="ml-auto">
                    {totalPages > 1 && (
                        <Pagination className="w-auto">
                            <PaginationPrevious
                                onClick={() =>
                                    setCurrentPage((value) =>
                                        Math.max(1, value - 1),
                                    )
                                }
                            />

                            <PaginationContent>
                                {Array.from({ length: totalPages }, (_, i) => (
                                    <PaginationItem key={i}>
                                        <PaginationLink
                                            isActive={currentPage === i + 1}
                                            onClick={() =>
                                                setCurrentPage(i + 1)
                                            }
                                            className="text-sm"
                                        >
                                            {i + 1}
                                        </PaginationLink>
                                    </PaginationItem>
                                ))}
                            </PaginationContent>

                            <PaginationNext
                                onClick={() =>
                                    setCurrentPage((value) =>
                                        Math.min(totalPages, value + 1),
                                    )
                                }
                            />
                        </Pagination>
                    )}
                </div>
            </div>
        </div>
    );
};

export default DivisionHeadList;
