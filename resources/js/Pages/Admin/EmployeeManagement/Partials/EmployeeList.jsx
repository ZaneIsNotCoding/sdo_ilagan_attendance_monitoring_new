import React, { useEffect, useMemo, useRef, useState } from "react";
import axios from "axios";
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
import { SquarePen, Search, User, Loader2 } from "lucide-react";
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

const formatEmployeeSearchName = (emp) =>
    [emp.first_name, emp.middle_name, emp.last_name]
        .filter(Boolean)
        .join(" ")
        .replace(/\s+/g, " ")
        .trim();

const EmployeeList = ({
    employees = [],
    filteredEmployees = [],
    pagination,
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
    applyFilters,
}) => {
    const [showSuggestions, setShowSuggestions] = useState(false);
    const [suggestionMatches, setSuggestionMatches] = useState([]);
    const [suggestionsLoading, setSuggestionsLoading] = useState(false);
    const searchBoxRef = useRef(null);
    const suggestionRequestRef = useRef(0);
    const officeItems = useMemo(
        () => [{ id: "all", name: "All Offices" }, ...offices],
        [offices],
    );

    const currentPage = pagination?.current_page || 1;
    const totalPages = pagination?.last_page || 1;
    const paginatedEmployees = filteredEmployees;
    const pageNumbers = useMemo(() => {
        if (totalPages <= 7) {
            return Array.from({ length: totalPages }, (_, i) => i + 1);
        }

        const pages = [1];
        const start = Math.max(2, currentPage - 1);
        const end = Math.min(totalPages - 1, currentPage + 1);

        if (start > 2) {
            pages.push("start-ellipsis");
        }

        for (let page = start; page <= end; page += 1) {
            pages.push(page);
        }

        if (end < totalPages - 1) {
            pages.push("end-ellipsis");
        }

        pages.push(totalPages);

        return pages;
    }, [currentPage, totalPages]);

    const handlePageChange = (page) => {
        if (page < 1 || page > totalPages) return;
        applyFilters({ pageValue: page });
    };

    useEffect(() => {
        const query = (searchInput || "").trim();

        if (!query) {
            setSuggestionMatches([]);
            setSuggestionsLoading(false);
            return;
        }

        setSuggestionsLoading(true);
        const requestId = suggestionRequestRef.current + 1;
        suggestionRequestRef.current = requestId;

        const timeout = setTimeout(() => {
            axios
                .get(route("employees.suggestions"), {
                    params: { search: query },
                })
                .then((response) => {
                    if (suggestionRequestRef.current !== requestId) return;

                    setSuggestionMatches(response.data || []);
                })
                .catch(() => {
                    if (suggestionRequestRef.current !== requestId) return;

                    setSuggestionMatches([]);
                })
                .finally(() => {
                    if (suggestionRequestRef.current !== requestId) return;

                    setSuggestionsLoading(false);
                });
        }, 250);

        return () => {
            clearTimeout(timeout);
        };
    }, [searchInput]);

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
                                    setShowSuggestions(true);
                                }}
                                onFocus={() => setShowSuggestions(true)}
                                onKeyDown={(e) => {
                                    if (e.key === "Enter") {
                                        e.preventDefault();
                                        applySearch(searchInput);
                                        setShowSuggestions(false);
                                    }
                                }}
                            />

                            {showSuggestions && searchInput.trim() ? (
                                <div className="absolute right-0 top-full z-50 mt-2 w-full overflow-hidden rounded-xl border border-slate-200 bg-white shadow-2xl">
                                    <div className="border-b bg-slate-50 px-3 py-2 text-xs font-semibold uppercase tracking-wide text-slate-500">
                                        Results for "{searchInput.trim()}"
                                    </div>

                                    <div className="max-h-72 overflow-y-auto">
                                        {suggestionsLoading ? (
                                            <div className="flex items-center gap-3 px-3 py-4 text-sm text-slate-500">
                                                <span className="flex h-8 w-8 items-center justify-center rounded-full bg-blue-50 text-blue-600">
                                                    <Loader2 className="h-4 w-4 animate-spin" />
                                                </span>
                                                <div>
                                                    <div className="font-medium text-slate-700">
                                                        Searching employees...
                                                    </div>
                                                    <div className="text-xs text-slate-400">
                                                        Checking names and IDs
                                                    </div>
                                                </div>
                                            </div>
                                        ) : suggestionMatches.length > 0 ? (
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
                                applyFilters({ statusValue: val });
                            }}
                            buttonVariant="blue"
                            className="w-32"
                        />

                        <CustomDropdownCheckboxObject
                            label="Select Office"
                            items={officeItems}
                            selected={selectedOffice}
                            buttonLabel={
                                offices.find(
                                    (office) =>
                                        Number(office.id) ===
                                        Number(selectedOffice),
                                )?.name || "All Offices"
                            }
                            onChange={(val) => {
                                const nextOffice =
                                    val === "all" ? "all" : Number(val);

                                setSelectedOffice(nextOffice);
                                applyFilters({ officeValue: nextOffice });
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
                        {pageNumbers.map((page) => (
                            <PaginationItem key={page}>
                                {typeof page === "number" ? (
                                    <PaginationLink
                                        isActive={currentPage === page}
                                        onClick={() => handlePageChange(page)}
                                    >
                                        {page}
                                    </PaginationLink>
                                ) : (
                                    <span className="flex h-9 min-w-9 items-center justify-center px-2 text-sm font-medium text-slate-400">
                                        ...
                                    </span>
                                )}
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
