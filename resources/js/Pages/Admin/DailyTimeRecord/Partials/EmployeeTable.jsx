import React, { useEffect, useMemo, useState } from "react";
import axios from "axios";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import { Checkbox } from "@/components/ui/checkbox";
import {
    Pagination,
    PaginationContent,
    PaginationItem,
    PaginationLink,
    PaginationNext,
    PaginationPrevious,
} from "@/components/ui/pagination";
import {
    Building2,
    BriefcaseBusiness,
    Clock3,
    Loader2,
    Printer,
    Search,
} from "lucide-react";
import EmployeeAvatar from "@/Components/EmployeeAvatar";
import FloatingInput from "@/components/floating-input";
import { CustomDropdownCheckboxObject } from "@/components/dropdown-menu-main";
import { Button } from "@/Components/ui/button";

const EmployeeTable = ({
    employees,
    onSelect,
    selectedEmployees,
    setSelectedEmployees,
    search,
    setSearch,
    offices,
    selectedOffice,
    setSelectedOffice,
    pagination,
    applyFilters,
    selectedCount,
    onPrintSelected,
}) => {
    const [selectedAll, setSelectedAll] = useState(false);
    const [showSuggestions, setShowSuggestions] = useState(false);
    const [suggestionMatches, setSuggestionMatches] = useState([]);
    const [suggestionsLoading, setSuggestionsLoading] = useState(false);
    const suggestionRequestRef = React.useRef(0);
    const searchBoxRef = React.useRef(null);
    const currentPage = pagination?.current_page || 1;
    const totalPages = pagination?.last_page || 1;
    const pageNumbers = Array.from({ length: totalPages }, (_, i) => i + 1);
    const officeItems = useMemo(
        () => [{ id: "all", name: "All Offices" }, ...offices],
        [offices],
    );
    const officeButtonLabel =
        offices.find((office) => Number(office.id) === Number(selectedOffice))
            ?.name || "All Offices";

    useEffect(() => {
        setSelectedAll(
            employees.length > 0 &&
                employees.every((emp) => selectedEmployees[emp.id]),
        );
    }, [employees, selectedEmployees]);

    const toggleSelectAll = () => {
        const nextValue = !selectedAll;
        const nextSelection = {};

        employees.forEach((emp) => {
            nextSelection[emp.id] = nextValue;
        });

        setSelectedEmployees((prev) => ({
            ...prev,
            ...nextSelection,
        }));
    };

    const toggleSelectEmployee = (id) => {
        setSelectedEmployees((prev) => ({
            ...prev,
            [id]: !prev[id],
        }));
    };

    const handlePageChange = (page) => {
        if (page < 1 || page > totalPages) return;
        applyFilters({ pageValue: page });
    };

    const submitSearch = (value) => {
        applyFilters({ searchValue: value });
    };

    const selectSuggestion = (suggestion) => {
        const nextValue = suggestion.search || suggestion.label || "";

        setSearch(nextValue);
        setShowSuggestions(false);
        submitSearch(`${suggestion.id} ${nextValue}`.trim());
    };

    useEffect(() => {
        const query = (search || "").trim();

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
                .get(route("dailytimerecord.suggestions"), {
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

        return () => clearTimeout(timeout);
    }, [search]);

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
                    <div className="min-w-0">
                        <h2 className="text-lg font-bold text-slate-900">
                            Employee Records
                        </h2>
                        <p className="text-sm text-gray-500">
                            Select employees and open their daily time records
                        </p>
                    </div>

                    <div className="grid w-full max-w-3xl grid-cols-1 items-center gap-4 md:grid-cols-[1fr_220px_auto]">
                        <div ref={searchBoxRef} className="relative">
                            <FloatingInput
                                label="Search Employee"
                                icon={Search}
                                name="search"
                                value={search}
                                onChange={(e) => {
                                    setSearch(e.target.value);
                                    setShowSuggestions(true);
                                }}
                                onFocus={() => setShowSuggestions(true)}
                                onKeyDown={(e) => {
                                    if (e.key === "Enter") {
                                        e.preventDefault();
                                        submitSearch(search);
                                        setShowSuggestions(false);
                                    }
                                }}
                            />

                            {showSuggestions && search.trim() ? (
                                <div className="absolute right-0 top-full z-50 mt-2 w-full overflow-hidden rounded-xl border border-slate-200 bg-white shadow-2xl">
                                    <div className="border-b bg-slate-50 px-3 py-2 text-xs font-semibold uppercase tracking-wide text-slate-500">
                                        Employees
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
                                                        Checking names and
                                                        offices
                                                    </div>
                                                </div>
                                            </div>
                                        ) : suggestionMatches.length > 0 ? (
                                            suggestionMatches.map(
                                                (suggestion) => (
                                                    <button
                                                        key={suggestion.id}
                                                        type="button"
                                                        onMouseDown={() =>
                                                            selectSuggestion(
                                                                suggestion,
                                                            )
                                                        }
                                                        className="flex w-full items-start justify-between gap-3 px-3 py-2 text-left text-sm transition hover:bg-blue-50"
                                                    >
                                                        <div className="min-w-0">
                                                            <div className="truncate font-medium text-slate-800">
                                                                {
                                                                    suggestion.label
                                                                }
                                                            </div>
                                                            <div className="truncate text-xs text-slate-500">
                                                                {
                                                                    suggestion.meta
                                                                }
                                                            </div>
                                                        </div>

                                                        <span className="shrink-0 rounded-full bg-blue-100 px-2 py-1 text-[11px] font-semibold text-blue-700">
                                                            Search
                                                        </span>
                                                    </button>
                                                ),
                                            )
                                        ) : (
                                            <div className="px-3 py-4 text-sm text-slate-500">
                                                No employee matches found.
                                            </div>
                                        )}
                                    </div>
                                </div>
                            ) : null}
                        </div>
                        <CustomDropdownCheckboxObject
                            label="Select Office"
                            items={officeItems}
                            selected={selectedOffice}
                            buttonLabel={officeButtonLabel}
                            onChange={(value) => {
                                const nextOffice =
                                    value === "all" ? "all" : Number(value);

                                setSelectedOffice(nextOffice);
                                applyFilters({
                                    officeValue: nextOffice,
                                });
                            }}
                            buttonVariant="green"
                        />
                        <Button
                            onClick={onPrintSelected}
                            variant="blue"
                            disabled={selectedCount === 0}
                            className="flex h-10 items-center justify-center gap-1 whitespace-nowrap px-3 py-2"
                        >
                            <Printer className="h-4 w-4" />
                            Print Selected
                        </Button>
                    </div>
                </div>
            </div>

            <div className="overflow-x-auto rounded-lg border">
                <Table className="w-full table-fixed">
                    <TableHeader>
                        <TableRow className="bg-blue-900 hover:bg-blue-800">
                            <TableHead className="w-[7%] px-4 text-white">
                                <Checkbox
                                    checked={selectedAll}
                                    onCheckedChange={toggleSelectAll}
                                    className="border-white bg-white/10 data-[state=checked]:bg-blue-500"
                                />
                            </TableHead>
                            <TableHead className="w-[30%] text-white">
                                Employee Name
                            </TableHead>
                            <TableHead className="w-[23%] text-white">
                                Position
                            </TableHead>
                            <TableHead className="w-[25%] text-white">
                                Office
                            </TableHead>
                            <TableHead className="w-[15%] text-white">
                                Work Type
                            </TableHead>
                        </TableRow>
                    </TableHeader>

                    <TableBody>
                        {employees.length > 0 ? (
                            employees.map((emp) => (
                                <TableRow
                                    key={emp.id}
                                    className="h-[64px] cursor-pointer transition hover:bg-blue-50"
                                    onClick={() => onSelect(emp)}
                                >
                                    <TableCell
                                        className="px-4"
                                        onClick={(e) => e.stopPropagation()}
                                    >
                                        <Checkbox
                                            checked={
                                                !!selectedEmployees[emp.id]
                                            }
                                            onCheckedChange={() =>
                                                toggleSelectEmployee(emp.id)
                                            }
                                        />
                                    </TableCell>

                                    <TableCell className="p-3">
                                        <div className="flex min-w-0 items-center gap-3">
                                            <EmployeeAvatar
                                                employee={emp}
                                                name={emp.full_name}
                                                className="h-9 w-9"
                                            />

                                            <div className="min-w-0">
                                                <div className="truncate font-medium text-slate-800">
                                                    {emp.full_name || "-"}
                                                </div>
                                            </div>
                                        </div>
                                    </TableCell>

                                    <TableCell className="p-3 text-gray-700">
                                        <div className="flex min-w-0 items-center gap-2">
                                            <BriefcaseBusiness className="h-4 w-4 shrink-0 text-blue-600" />
                                            <span className="truncate">
                                                {emp.position || "-"}
                                            </span>
                                        </div>
                                    </TableCell>

                                    <TableCell className="p-3">
                                        <div className="flex min-w-0 items-center gap-2">
                                            <div className="flex h-7 w-7 min-w-[28px] items-center justify-center rounded-full bg-gray-300">
                                                <Building2 className="h-4 w-4 text-blue-600" />
                                            </div>

                                            <span className="truncate text-gray-700">
                                                {emp.department || "-"}
                                            </span>
                                        </div>
                                    </TableCell>

                                    <TableCell className="p-3 text-gray-700">
                                        <div className="flex min-w-0 items-center gap-2">
                                            <Clock3 className="h-4 w-4 shrink-0 text-blue-600" />
                                            <span className="truncate">
                                                {emp.work_type || "-"}
                                            </span>
                                        </div>
                                    </TableCell>
                                </TableRow>
                            ))
                        ) : (
                            <TableRow>
                                <TableCell
                                    colSpan={5}
                                    className="py-8 text-center text-gray-500"
                                >
                                    No results found.
                                </TableCell>
                            </TableRow>
                        )}
                    </TableBody>
                </Table>
            </div>

            {totalPages > 1 && (
                <Pagination className="my-2 justify-end">
                    <PaginationPrevious
                        onClick={() => handlePageChange(currentPage - 1)}
                    />
                    <PaginationContent>
                        {pageNumbers.map((page) => (
                            <PaginationItem key={page}>
                                <PaginationLink
                                    isActive={currentPage === page}
                                    onClick={() => handlePageChange(page)}
                                >
                                    {page}
                                </PaginationLink>
                            </PaginationItem>
                        ))}
                    </PaginationContent>
                    <PaginationNext
                        onClick={() => handlePageChange(currentPage + 1)}
                    />
                </Pagination>
            )}
        </div>
    );
};

export default EmployeeTable;
