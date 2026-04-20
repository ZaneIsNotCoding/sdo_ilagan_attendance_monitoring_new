import React, { useState, useMemo } from "react";
import {
    CustomDropdownCheckbox,
    CustomDropdownCheckboxObject,
} from "@/components/dropdown-menu-main";
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
import { BadgeCheckIcon, AlertCircleIcon, Building2 } from "lucide-react";

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
        currentPage * ITEMS_PER_PAGE,
    );

    const handlePageChange = (page) => {
        if (page < 1 || page > totalPages) return;
        setCurrentPage(page);
    };

    return (
        <div className="rounded-xl p-4 mt-4 border-2 shadow-lg">
            <div className="rounded-xlFempl">
                <div className="flex items-center justify-between mb-4 gap-4">
                    {/* LEFT SIDE */}
                    <div className="min-w-0">
                        <h2 className="text-lg font-bold">Employee List</h2>
                        <p className="text-sm text-gray-500">
                            Manage employee records
                        </p>
                    </div>

                    {/* RIGHT SIDE */}
                    <div className="flex items-center gap-4 ">
                        <FloatingInput
                            label="Search Employee"
                            icon={Search}
                            name="search"
                            value={search}
                            onChange={(e) => {
                                setSearch(e.target.value);
                                setCurrentPage(1);
                            }}
                        />

                        <CustomDropdownCheckbox
                            label="Select Status"
                            items={statusOptions}
                            selected={statusFilter}
                            onChange={(val) => {
                                setStatusFilter(val);
                                setCurrentPage(1);
                            }}
                            buttonVariant="blue"
                            className="w-32"
                        />

                        <CustomDropdownCheckboxObject
                            label="Select Department"
                            items={departments}
                            selected={selectedDepartment}
                            buttonLabel={
                                departments.find(
                                    (d) => d.id === selectedDepartment,
                                )?.name || "All Departments"
                            }
                            onChange={(val) => {
                                setSelectedDepartment(val);
                                setCurrentPage(1);
                            }}
                            buttonVariant="green"
                            className="w-[360px]"
                        />
                    </div>
                </div>
            </div>

            <div className="overflow-x-auto border rounded-lg">
                <Table className="w-full table-fixed">
                    <TableHeader>
                        <TableRow className="bg-blue-900 hover:bg-blue-800">
                            <TableHead className="text-white text-left px-16 w-[30%]">
                                Employee Name
                            </TableHead>
                            <TableHead className="text-white text-left w-[20%]">
                                Position
                            </TableHead>
                            <TableHead className="text-white text-left w-[20%]">
                                Department
                            </TableHead>
                            <TableHead className="text-white text-left w-[15%]">
                                Work Type
                            </TableHead>
                            <TableHead className="text-white text-left px-10 w-[10%]">
                                Actions
                            </TableHead>
                        </TableRow>
                    </TableHeader>

                    <TableBody>
                        {paginatedEmployees.length > 0 ? (
                            paginatedEmployees.map((emp) => (
                                <TableRow
                                    key={emp.id}
                                    className="h-[64px] hover:bg-blue-50 transition"
                                >
                                    {/* EMPLOYEE */}
                                    <TableCell className="p-3">
                                        <div className="flex gap-3 min-w-0">
                                            {/* Avatar */}
                                            <div className="w-8 h-8 min-w-[32px] min-h-[32px] rounded-full bg-blue-300 text-blue-600 flex items-center justify-center text-xs font-bold">
                                                {emp.full_name
                                                    .split(" ")
                                                    .map((n) => n[0])
                                                    .join("")}
                                            </div>

                                            {/* Name + badge */}
                                            <div className="flex items-center gap-2 min-w-0">
                                                <span className="font-medium truncate max-w-[150px]">
                                                    {emp.full_name}
                                                </span>

                                                <HoverCard>
                                                    <HoverCardTrigger asChild>
                                                        <div className="cursor-pointer min-w-[28px] flex justify-center">
                                                            {isRegistered(
                                                                emp.id,
                                                            ) ? (
                                                                <Badge className="bg-blue-100 text-blue-700 border border-blue-300 flex items-center gap-1">
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
                                                        {isRegistered(
                                                            emp.id,
                                                        ) ? (
                                                            <span className="flex items-center gap-1 text-blue-600 font-medium">
                                                                <span className="w-2 h-2 rounded-full bg-blue-500 animate-pulse" />
                                                                Employee is
                                                                registered
                                                            </span>
                                                        ) : (
                                                            <span className="flex items-center gap-1 text-orange-600 font-medium">
                                                                <span className="w-2 h-2 rounded-full bg-orange-500 animate-pulse" />
                                                                Employee is not
                                                                registered
                                                            </span>
                                                        )}
                                                    </HoverCardContent>
                                                </HoverCard>
                                            </div>
                                        </div>
                                    </TableCell>

                                    {/* POSITION */}
                                    <TableCell className="p-3 text-gray-700 truncate">
                                        {emp.position || "-"}
                                    </TableCell>

                                    {/* DEPARTMENT */}
                                    <TableCell className="p-3">
                                        <div className="flex items-center gap-2 min-w-0">
                                            <div className="w-7 h-7 min-w-[28px] flex items-center justify-center rounded-full bg-gray-300">
                                                <Building2 className="w-4 h-4 text-blue-600" />
                                            </div>

                                            <span className="px-3 py-1 text-sm rounded truncate">
                                                {emp.department?.name || "-"}
                                            </span>
                                        </div>
                                    </TableCell>

                                    {/* WORK TYPE */}
                                    <TableCell className="p-3 text-gray-700 truncate">
                                        {emp.work_type || "-"}
                                    </TableCell>

                                    {/* ACTIONS */}
                                    <TableCell className="p-3 text-center">
                                        <Button
                                            size="sm"
                                            className="min-w-[90px] bg-white text-blue-600 border border-blue-600 hover:bg-blue-600 hover:text-white flex items-center justify-center gap-1"
                                            onClick={() => handleEdit(emp)}
                                        >
                                            <SquarePen className="h-4 w-4" />
                                            Edit
                                        </Button>
                                    </TableCell>
                                </TableRow>
                            ))
                        ) : (
                            <TableRow>
                                <TableCell
                                    colSpan="5"
                                    className="text-center p-5 text-gray-500"
                                >
                                    No Employees Found
                                </TableCell>
                            </TableRow>
                        )}
                    </TableBody>
                </Table>
            </div>

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
