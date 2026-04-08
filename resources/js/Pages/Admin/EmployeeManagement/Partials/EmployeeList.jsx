import React, { useState, useMemo } from "react";
import { CustomDropdownCheckbox, CustomDropdownCheckboxObject } from "@/components/dropdown-menu-main";
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
import { SquarePen, Search } from "lucide-react";
import FloatingInput from "@/components/floating-input";
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

const ITEMS_PER_PAGE = 10;

const EmployeeList = ({
    filteredEmployees,
    isRegistered,
    handleEdit,
    search,
    setSearch,
    departments,
    selectedDepartment,
    setSelectedDepartment,
    statusOptions,
    statusFilter,
    setStatusFilter,
}) => {
    const [currentPage, setCurrentPage] = useState(1);

    const totalPages = Math.ceil(filteredEmployees.length / ITEMS_PER_PAGE);
    const paginatedEmployees = filteredEmployees.slice(
        (currentPage - 1) * ITEMS_PER_PAGE,
        currentPage * ITEMS_PER_PAGE
    );

    const handlePageChange = (page) => {
        if (page < 1 || page > totalPages) return;
        setCurrentPage(page);
    };

    return (
        <div className="rounded-xl p-4 mt-4 border-2 border-blue-100 shadow-lg">
            <div className="flex justify-between items-center mb-3 gap-6">
                <h2 className="text-lg font-bold flex-shrink-0">
                    Employee List
                </h2>

                <FloatingInput
                    label="Search Employee"
                    icon={Search}
                    name="search"
                    value={search}
                    onChange={(e) => {
                        setSearch(e.target.value);
                        setCurrentPage(1); // reset page on search
                    }}
                />

                <div className="flex items-center gap-2">
                    <CustomDropdownCheckbox
                        label="Select Status"
                        items={statusOptions}
                        selected={statusFilter}
                        onChange={(val) => {
                            setStatusFilter(val);
                            setCurrentPage(1);
                        }}
                        buttonVariant="blue"
                    />

                    <CustomDropdownCheckboxObject
                        label="Select Department"
                        items={departments}
                        selected={selectedDepartment}
                        buttonLabel={
                                departments.find((d) => d.id === selectedDepartment)?.name ||
                                "All Departments"
                            }
                        onChange={(val) => {
                            setSelectedDepartment(val);
                            setCurrentPage(1);
                        }}
                        buttonVariant="green"
                    />
                </div>
            </div>

            <Table>
                <TableCaption>Employee Records</TableCaption>
                <TableHeader>
                    <TableRow className="bg-blue-900 hover:bg-blue-800">
                        <TableHead className="text-center text-white">
                            Id
                        </TableHead>
                        <TableHead className="text-center text-white">
                            Employee Name
                        </TableHead>
                        <TableHead className="text-center text-white">
                            Position
                        </TableHead>
                        <TableHead className="text-center text-white">
                            Department
                        </TableHead>
                        <TableHead className="text-center text-white">
                            Work Type
                        </TableHead>
                        <TableHead className="text-center text-white">
                            Actions
                        </TableHead>
                    </TableRow>
                </TableHeader>

                <TableBody>
                    {paginatedEmployees.map((emp) => (
                        <TableRow key={emp.id} className="hover:bg-gray-100">
                            <TableCell className="text-center">
                                {emp.id}
                            </TableCell>
                            <TableCell className="text-center">
                                <div className="flex justify-center items-center gap-2">
                                    {emp.full_name}
                                    <HoverCard>
                                        <HoverCardTrigger asChild>
                                            <div className="cursor-pointer">
                                                {isRegistered(emp.id) ? (
                                                    <Badge
                                                        variant="secondary"
                                                        className="bg-blue-100 text-blue-700 border border-blue-300 flex items-center gap-1"
                                                    >
                                                        <BadgeCheckIcon className="w-3.5 h-3.5" />
                                                    </Badge>
                                                ) : (
                                                    <Badge className="bg-yellow-100 text-yellow-700 border border-yellow-300 flex items-center gap-1">
                                                        <AlertCircleIcon className="w-3.5 h-3.5" />
                                                    </Badge>
                                                )}
                                            </div>
                                        </HoverCardTrigger>
                                        <HoverCardContent className="text-xs px-3 py-2 rounded-lg shadow-md border border-gray-200 bg-white w-fit">
                                            {isRegistered(emp.id) ? (
                                                <span className="flex items-center gap-1 text-blue-600 font-medium">
                                                    <span className="w-2 h-2 rounded-full bg-blue-500 animate-pulse" />
                                                    Employee is registered
                                                </span>
                                            ) : (
                                                <span className="flex items-center gap-1 text-orange-600 font-medium">
                                                    <span className="w-2 h-2 rounded-full bg-orange-500 animate-pulse" />
                                                    Employee is not registered
                                                </span>
                                            )}
                                        </HoverCardContent>
                                    </HoverCard>
                                </div>
                            </TableCell>
                            <TableCell className="text-center">
                                {emp.position}
                            </TableCell>
                            <TableCell className="text-center">
                                {emp.department?.name || "-"}
                            </TableCell>
                            <TableCell className="text-center">
                                {emp.work_type || "-"}
                            </TableCell>
                            <TableCell className="flex justify-center gap-2">
                                <Button
                                    variant="blue"
                                    size="icon"
                                    className="rounded-full text-black hover:bg-black hover:text-white"
                                    onClick={() => handleEdit(emp)}
                                >
                                    <SquarePen className="h-4 w-4" />
                                </Button>
                            </TableCell>
                        </TableRow>
                    ))}
                </TableBody>
            </Table>

            {/* Pagination */}
            {totalPages > 1 && (
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
            )}
        </div>
    );
};

export default EmployeeList;
