import React from "react";
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
import useDivisionHeadList from "../hooks/useDivisionHeadList";

const DivisionHeadList = ({
    division_heads = [],
    divisions = [],
    assignDivisionHeadModal = null,
    deleteDivisionHeadModal = null,
    onAssignNow,
    highlightedDivisionId = null,
    highlightRequestKey = 0,
}) => {
    const {
        animatedDivisionId,
        closeDepartmentModal,
        currentPage,
        endIndex,
        getFullName,
        openDepartmentModal,
        paginatedRows,
        setCurrentPage,
        startIndex,
        totalPages,
        visibleDivisionRows,
    } = useDivisionHeadList({
        division_heads,
        divisions,
        highlightedDivisionId,
        highlightRequestKey,
    });

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
                open={!!assignDivisionHeadModal}
                setOpen={(nextOpen) => {
                    if (!nextOpen) closeDepartmentModal();
                }}
                divisions={divisions}
                preselectedDivision={
                    assignDivisionHeadModal?.division_id || null
                }
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
                                            <div className="flex items-start gap-2 min-w-0">
                                                <div className="w-7 h-7 min-w-[28px] flex items-center justify-center rounded-full bg-gray-300">
                                                    <Building2 className="w-4 h-4 text-blue-600" />
                                                </div>

                                                <div className="min-w-0">
                                                    <div className="truncate font-medium">
                                                        {row.division.code}
                                                    </div>

                                                    <div className="truncate text-xs text-gray-500">
                                                        {row.division.name}
                                                    </div>
                                                </div>
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
                                                <Button
                                                    size="icon"
                                                    onClick={() =>
                                                        openDepartmentModal(
                                                            "delete-division-head",
                                                            {
                                                                head_id:
                                                                    row.head.id,
                                                            },
                                                        )
                                                    }
                                                    className="rounded-full bg-red-100 text-red-600 hover:bg-red-500 hover:text-white"
                                                    title="Delete Division Head"
                                                >
                                                    <Trash2 className="h-4 w-4" />
                                                </Button>
                                            ) : (
                                                <Button
                                                    size="sm"
                                                    className={`min-w-[60px] border border-blue-600 bg-white text-blue-600 hover:bg-blue-600 hover:text-white ${
                                                        isHighlighted
                                                            ? "animate-bounce bg-blue-600 font-semibold text-white shadow-lg shadow-blue-200"
                                                            : ""
                                                    }`}
                                                    onClick={() => {
                                                        openDepartmentModal(
                                                            "assign-division-head",
                                                            {
                                                                division_name:
                                                                    row.division
                                                                        .name,
                                                            },
                                                        );
                                                        onAssignNow?.(
                                                            row.division.id,
                                                        );
                                                    }}
                                                    title="Assign Division Head"
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

            <ConfirmPasswordDialog
                trigger={null}
                title="Delete Division Head"
                description="You are about to permanently remove this division head assignment."
                itemLabel="Division Head"
                itemName={deleteDivisionHeadModal?.employee_name || ""}
                action={
                    deleteDivisionHeadModal?.id
                        ? route(
                              "divisionhead.destroy",
                              deleteDivisionHeadModal.id,
                          )
                        : ""
                }
                method="delete"
                open={!!deleteDivisionHeadModal}
                onOpenChange={(nextOpen) => {
                    if (!nextOpen) closeDepartmentModal();
                }}
            />
        </div>
    );
};

export default DivisionHeadList;
