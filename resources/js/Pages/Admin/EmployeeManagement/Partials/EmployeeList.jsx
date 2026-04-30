import React, { useEffect, useMemo, useRef, useState } from "react";
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
import { SquarePen, Search, User } from "lucide-react";
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
import EmployeeAvatar from "@/Components/EmployeeAvatar";

const ITEMS_PER_PAGE = 10;

const formatEmployeeSearchName = (emp) =>
    [emp.first_name, emp.middle_name, emp.last_name]
        .filter(Boolean)
        .join(" ")
        .replace(/\s+/g, " ")
        .trim();

const EmployeeList = ({
    employees = [],
    filteredEmployees,
    isRegistered,
    handleEdit,
    searchInput,
    setSearchInput,
    applySearch,
    offices = [],
    selectedOffice,
    setSelectedOffice,
    statusOptions,
    statusFilter,
    setStatusFilter,
}) => {
    const [currentPage, setCurrentPage] = useState(1);
    const [showSuggestions, setShowSuggestions] = useState(false);
    const searchBoxRef = useRef(null);

    const totalPages = Math.ceil(filteredEmployees.length / ITEMS_PER_PAGE);
    const paginatedEmployees = filteredEmployees.slice(
        (currentPage - 1) * ITEMS_PER_PAGE,
        currentPage * ITEMS_PER_PAGE,
    );

    const handlePageChange = (page) => {
        if (page < 1 || page > totalPages) return;
        setCurrentPage(page);
    };

    const suggestionMatches = useMemo(() => {
        const query = (searchInput || "").trim().toLowerCase();

        if (!query) {
            return [];
        }

        return employees
            .filter((emp) => {
                const fullName = formatEmployeeSearchName(emp).toLowerCase();
                const employeeId = String(emp.id || "").toLowerCase();

                return fullName.includes(query) || employeeId.includes(query);
            })
            .slice(0, 8)
            .map((emp) => ({
                id: emp.id,
                label: formatEmployeeSearchName(emp) || "-",
                meta: [emp.office?.name, emp.office?.division?.code]
                    .filter(Boolean)
                    .join(" • "),
                search: formatEmployeeSearchName(emp) || "",
            }));
    }, [employees, searchInput]);

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (
                searchBoxRef.current &&
                !searchBoxRef.current.contains(event.target)
            ) {
                setShowSuggestions(false);
            }
        };

        document.addEventListener("mousedown", handleClickOutside);

        return () => {
            document.removeEventListener("mousedown", handleClickOutside);
        };
    }, []);

    return (
        <div className="rounded-2xl p-4 mt-4 border border-blue-100 shadow-lg">
            <div className="rounded-xl">
                <div className="flex items-center justify-between mb-4 gap-4">
                    {/* LEFT SIDE */}
                    <div className="min-w-0">
                        <h2 className="text-l font-bold">Employee List</h2>
                        <p className="text-sm text-gray-500">
                            Manage employee records
                        </p>
                    </div>

                    {/* RIGHT SIDE */}
                    <div className="flex items-start gap-4 ">
                        <div ref={searchBoxRef} className="relative w-full">
                            <FloatingInput
                                label="Search Employee"
                                icon={Search}
                                name="search"
                                value={searchInput}
                                onChange={(e) => {
                                    setSearchInput(e.target.value);
                                    setCurrentPage(1);
                                    setShowSuggestions(true);
                                }}
                                onFocus={() => setShowSuggestions(true)}
                                onKeyDown={(e) => {
                                    if (e.key === "Enter") {
                                        e.preventDefault();
                                        applySearch(searchInput);
                                        setCurrentPage(1);
                                        setShowSuggestions(false);
                                    }
                                }}
                            />

                            {showSuggestions && searchInput.trim() ? (
                                <div className="absolute right-0 top-full z-50 mt-2 w-full overflow-hidden rounded-xl border border-slate-200 bg-white shadow-2xl">
                                    <div className="border-b bg-slate-50 px-3 py-2 text-xs font-semibold uppercase tracking-wide text-slate-500">
                                        Suggestions
                                    </div>

                                    <div className="max-h-72 overflow-y-auto">
                                        {suggestionMatches.length > 0 ? (
                                            suggestionMatches.map((emp) => (
                                                <button
                                                    key={emp.id}
                                                    type="button"
                                                    onMouseDown={() => {
                                                        setSearchInput(
                                                            emp.label,
                                                        );
                                                        applySearch(
                                                            `${emp.id} ${emp.label}`,
                                                        );
                                                        setCurrentPage(1);
                                                        setShowSuggestions(
                                                            false,
                                                        );
                                                    }}
                                                    className="flex w-full items-start justify-between gap-3 px-3 py-2 text-left text-sm transition hover:bg-blue-50"
                                                >
                                                    <div className="min-w-0">
                                                        <div className="truncate font-medium text-slate-800">
                                                            {emp.label}
                                                        </div>
                                                        <div className="truncate text-xs text-slate-500">
                                                            {emp.meta}
                                                        </div>
                                                    </div>

                                                    <span className="shrink-0 rounded-full bg-blue-100 px-2 py-1 text-[11px] font-semibold text-blue-700">
                                                        Search
                                                    </span>
                                                </button>
                                            ))
                                        ) : (
                                            <div className="px-3 py-4 text-sm text-slate-500">
                                                No employee matches found.
                                            </div>
                                        )}
                                    </div>
                                </div>
                            ) : null}
                        </div>

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
                            label="Select Office"
                            items={offices}
                            selected={selectedOffice}
                            buttonLabel={
                                offices.find(
                                    (office) => office.id === selectedOffice,
                                )?.name || "All Offices"
                            }
                            onChange={(val) => {
                                setSelectedOffice(val);
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
                            <TableHead className="text-white text-left px-16 w-[25%]">
                                Employee Name
                            </TableHead>
                            <TableHead className="text-white text-left w-[20%]">
                                Position
                            </TableHead>
                            <TableHead className="text-white text-left w-[25%]">
                                Office
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
                                    <TableCell className="p-3">
                                        <div className="flex gap-3 min-w-0">
                                            {/* Avatar */}
                                            <EmployeeAvatar
                                                employee={emp}
                                                name={formatEmployeeSearchName(
                                                    emp,
                                                )}
                                            />

                                            {/* Name + badge */}
                                            <div className="flex items-center gap-2 min-w-0">
                                                <span className="font-medium truncate max-w-[150px]">
                                                    {formatEmployeeSearchName(
                                                        emp,
                                                    )}
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

                                    {/* OFFICE */}
                                    <TableCell className="p-3">
                                        <div className="flex items-center gap-2 min-w-0">
                                            <div className="w-7 h-7 min-w-[28px] flex items-center justify-center rounded-full bg-gray-300">
                                                <Building2 className="w-4 h-4 text-blue-600" />
                                            </div>

                                            <span className="truncate">
                                                {emp.office?.name || "-"}
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
