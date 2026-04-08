import React from "react";
import {
    Table,
    TableBody,
    TableCell,
    TableCaption,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { SquarePen, Trash2, Plus } from "lucide-react";
import {
    HoverCard,
    HoverCardContent,
    HoverCardTrigger,
} from "@/components/ui/hover-card";
import { Badge } from "@/components/ui/badge";
import { BadgeCheckIcon, AlertCircleIcon } from "lucide-react";
import {
    Pagination,
    PaginationContent,
    PaginationLink,
    PaginationItem,
    PaginationPrevious,
    PaginationNext,
} from "@/components/ui/pagination";
import { router } from "@inertiajs/react";

import FilterToggle from "@/components/FilterToggle";
import TableSearchBar from "@/components/TableSearchBar";
import ClearFilterButton from "@/components/ClearFilterButton";
import ConfirmPasswordDialog from "@/Components/ConfirmPasswordDialog";

const PositionList = ({
    positions,
    queryParams = {},
    handleEdit,
    handleAdd,
}) => {
    const data = positions?.data || [];
    const currentPage =
        positions?.current_page || Number(queryParams.page) || 1;
    const totalPages = positions?.last_page || 1;

    const handlePageChange = (page) => {
        if (page < 1 || page > totalPages) return;

        router.get(
            route("position.index"),
            { ...queryParams, page },
            {
                preserveState: true,
                replace: true,
            },
        );
    };

    const hasActiveFilters =
        queryParams.search ||
        queryParams.status ||
        queryParams.category ||
        queryParams.level;

    return (
        <div className="rounded-xl border-2 border-blue-100 shadow-lg mt-4 p-4">
            {/* Title */}
            <div className="mb-4">
                <h2 className="text-lg font-bold">Position List</h2>
            </div>

            {/* Filters + Actions */}
            <div className="flex flex-col gap-3 mb-4 lg:flex-row lg:items-center lg:justify-between">
                {/* Left: Filters */}
                <div className="flex flex-wrap items-center gap-2">
                    <FilterToggle
                        queryParams={queryParams}
                        visibleFilters={["status", "category", "level"]}
                        url="position.index"
                    />
                </div>

                {/* Right: Search + Clear + Add */}
                <div className="flex flex-col gap-2 w-full lg:w-auto sm:flex-row sm:items-center sm:justify-end">
                    <div className="w-full sm:w-[320px]">
                        <TableSearchBar
                            url="position.index"
                            queryParams={queryParams}
                            label="Search Position"
                            field="search"
                            placeholder="Search position"
                            className="max-w-none w-full"
                        />
                    </div>

                    {hasActiveFilters && (
                        <ClearFilterButton routeName="position.index" />
                    )}

                    <Button
                        variant="default"
                        className="flex items-center gap-2"
                        onClick={handleAdd}
                    >
                        <Plus className="w-4 h-4" />
                        Add Position
                    </Button>
                </div>
            </div>

            <div className="w-full">
                <div className="rounded-xl border bg-white shadow-sm overflow-hidden">
                    <div className="overflow-x-auto">
                        <Table>
                            <TableCaption className="text-gray-500 py-3">
                                Position Records
                            </TableCaption>

                            {/* HEADER */}
                            <TableHeader className="sticky top-0 z-10">
                                <TableRow className="bg-gradient-to-r from-blue-900 to-blue-700">
                                    <TableHead className="text-center text-white font-semibold">
                                        ID
                                    </TableHead>
                                    <TableHead className="text-left text-white font-semibold">
                                        Position Name
                                    </TableHead>
                                    <TableHead className="text-center text-white font-semibold">
                                        Category
                                    </TableHead>
                                    <TableHead className="text-center text-white font-semibold">
                                        Level
                                    </TableHead>
                                    <TableHead className="text-center text-white font-semibold">
                                        Salary Grade
                                    </TableHead>
                                    <TableHead className="text-center text-white font-semibold">
                                        Actions
                                    </TableHead>
                                </TableRow>
                            </TableHeader>

                            {/* BODY */}
                            <TableBody>
                                {data.length > 0 ? (
                                    data.map((position, index) => (
                                        <TableRow
                                            key={position.id}
                                            className={`
                                    transition-all duration-200
                                    ${index % 2 === 0 ? "bg-white" : "bg-gray-50"}
                                    hover:bg-blue-50 hover:shadow-sm
                                `}
                                        >
                                            <TableCell className="text-center font-medium text-gray-700 py-3">
                                                {position.id}
                                            </TableCell>

                                            <TableCell className="text-left font-semibold text-gray-800 py-3">
                                                {position.position_name}
                                            </TableCell>

                                            <TableCell className="text-center text-gray-600 py-3">
                                                {position.category || "-"}
                                            </TableCell>

                                            <TableCell className="text-center text-gray-600 py-3">
                                                {position.level || "-"}
                                            </TableCell>

                                            <TableCell className="text-center text-gray-600 py-3">
                                                {position.salary_grade ?? "-"}
                                            </TableCell>

                                            <TableCell className="flex justify-center gap-2 py-3">
                                                {/* EDIT */}
                                                <Button
                                                    size="icon"
                                                    className="rounded-full bg-blue-100 text-blue-700 hover:bg-blue-600 hover:text-white shadow-sm transition-all duration-200"
                                                    onClick={() =>
                                                        handleEdit(position)
                                                    }
                                                >
                                                    <SquarePen className="h-4 w-4" />
                                                </Button>

                                                {/* DELETE */}
                                                <ConfirmPasswordDialog
                                                    trigger={
                                                        <Button
                                                            size="icon"
                                                            className="rounded-full bg-red-100 text-red-600 hover:bg-red-600 hover:text-white shadow-sm transition-all duration-200"
                                                        >
                                                            <Trash2 className="h-4 w-4" />
                                                        </Button>
                                                    }
                                                    title="Delete Position"
                                                    description="This action will permanently delete this position."
                                                    action={route(
                                                        "position.destroy",
                                                        position.id,
                                                    )}
                                                    method="delete"
                                                    danger={true}
                                                    confirmText="Delete"
                                                    cancelText="Cancel"
                                                    processingText="Deleting..."
                                                    itemLabel="Position"
                                                    itemName={
                                                        position.position_name
                                                    }
                                                    note="This action is irreversible. Please confirm before proceeding."
                                                />
                                            </TableCell>
                                        </TableRow>
                                    ))
                                ) : (
                                    <TableRow>
                                        <TableCell
                                            colSpan={6}
                                            className="text-center py-10 text-gray-400"
                                        >
                                            No position records found.
                                        </TableCell>
                                    </TableRow>
                                )}
                            </TableBody>
                        </Table>
                    </div>
                </div>
            </div>

            {totalPages > 1 && (
                <Pagination className="my-3 justify-end">
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
            )}
        </div>
    );
};

export default PositionList;
