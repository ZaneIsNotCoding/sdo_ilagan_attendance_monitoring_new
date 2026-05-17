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
    Eye,
    Printer,
    Search,
} from "lucide-react";
import EmployeeAvatar from "@/Components/EmployeeAvatar";
import FloatingInput from "@/components/floating-input";
import {
    CustomDropdownCheckbox,
    CustomDropdownCheckboxObject,
} from "@/components/dropdown-menu-main";
import { Button } from "@/Components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";

const formatWorkSchedule = (schedule) =>
    schedule?.name ||
    [schedule?.time_in, schedule?.time_out].filter(Boolean).join(" - ");

const EmployeeList = ({
    employees,
    search,
    setSearch,
    offices,
    selectedOffice,
    setSelectedOffice,
    selectedMonth,
    setSelectedMonth,
    selectedYear,
    setSelectedYear,
    pagination,
    applyFilters,
    onPreviewEmployee,
    onPrintEmployee,
    onPrintDepartment,
}) => {
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
    const displayedEmployees = employees;
    const monthOptions = [
        { value: 1, label: "January" },
        { value: 2, label: "February" },
        { value: 3, label: "March" },
        { value: 4, label: "April" },
        { value: 5, label: "May" },
        { value: 6, label: "June" },
        { value: 7, label: "July" },
        { value: 8, label: "August" },
        { value: 9, label: "September" },
        { value: 10, label: "October" },
        { value: 11, label: "November" },
        { value: 12, label: "December" },
    ];
    const selectedMonthLabel =
        monthOptions.find(
            (item) => Number(item.value) === Number(selectedMonth),
        )?.label || monthOptions[new Date().getMonth()].label;
    const yearOptions = useMemo(() => {
        const currentYear = new Date().getFullYear();

        return Array.from({ length: 7 }, (_, index) =>
            String(currentYear - 3 + index),
        ).reverse();
    }, []);

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
        <div className="mt-4 rounded-2xl border border-blue-100 bg-white p-4 shadow-lg">
            <div className="rounded-xl">
                <div className="mb-4 flex items-start justify-between gap-4">
                    <div className="min-w-0">
                        <h2 className="text-lg font-bold text-slate-900">
                            Employee Records
                        </h2>
                        <p className="text-sm text-gray-500">
                            Open, preview, and print daily time records
                        </p>
                    </div>

                    <div className="grid w-full max-w-6xl grid-cols-1 items-center gap-4 xl:grid-cols-[minmax(240px,1fr)_132px_135px_112px_180px]">
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
                                            <div className="space-y-2 px-3 py-3">
                                                {Array.from({
                                                    length: 3,
                                                }).map((_, index) => (
                                                    <div
                                                        key={index}
                                                        className="flex items-center justify-between gap-3"
                                                    >
                                                        <div className="min-w-0 flex-1 space-y-2">
                                                            <Skeleton className="h-4 w-3/4" />
                                                            <Skeleton className="h-3 w-1/2" />
                                                        </div>
                                                        <Skeleton className="h-6 w-14 rounded-full" />
                                                    </div>
                                                ))}
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
                            buttonVariant="outline"
                            className="h-10 border-slate-200 bg-slate-50 text-slate-700 hover:bg-slate-100"
                        />

                        <CustomDropdownCheckbox
                            label="Select Month"
                            items={monthOptions.map((item) => item.label)}
                            selected={selectedMonthLabel}
                            onChange={(monthLabel) => {
                                const nextMonth =
                                    monthOptions.find(
                                        (item) => item.label === monthLabel,
                                    )?.value || selectedMonth;

                                setSelectedMonth(nextMonth);
                                applyFilters({
                                    monthValue: nextMonth,
                                    pageValue: 1,
                                });
                            }}
                            buttonVariant="outline"
                            className="h-10 border-slate-200 bg-slate-50 text-slate-700 hover:bg-slate-100"
                        />

                        <CustomDropdownCheckbox
                            label="Select Year"
                            items={yearOptions}
                            selected={String(selectedYear)}
                            onChange={(nextYear) => {
                                setSelectedYear(nextYear);
                                applyFilters({
                                    yearValue: nextYear,
                                    pageValue: 1,
                                });
                            }}
                            buttonVariant="outline"
                            className="h-10 border-slate-200 bg-slate-50 text-sm text-slate-700 shadow-none"
                        />

                        <Button
                            type="button"
                            onClick={() =>
                                onPrintDepartment?.(displayedEmployees)
                            }
                            className="h-10 gap-2 whitespace-nowrap bg-blue-700 text-white hover:bg-blue-800"
                        >
                            <Printer className="h-4 w-4" />
                            Print by Department
                        </Button>
                    </div>
                </div>
            </div>

            <div className="overflow-x-auto rounded-lg border">
                <Table className="w-full table-fixed">
                    <TableHeader>
                        <TableRow className="bg-blue-900 hover:bg-blue-800">
                            <TableHead className="w-[25%] pl-12 text-white">
                                Employee Name
                            </TableHead>
                            <TableHead className="w-[20%] text-white">
                                Position
                            </TableHead>
                            <TableHead className="w-[24%] text-white">
                                Office
                            </TableHead>
                            <TableHead className="w-[19%] text-white">
                                Work Schedule
                            </TableHead>
                            <TableHead className="w-[10%] text-center text-white">
                                Actions
                            </TableHead>
                        </TableRow>
                    </TableHeader>

                    <TableBody>
                        {displayedEmployees.length > 0 ? (
                            displayedEmployees.map((emp) => (
                                <TableRow
                                    key={emp.id}
                                    className="h-[64px] transition hover:bg-blue-50"
                                >
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
                                            <div className="min-w-0">
                                                <div className="truncate font-medium text-gray-800">
                                                    {emp.work_type || "-"}
                                                </div>
                                                <div className="truncate text-xs text-gray-500">
                                                    {formatWorkSchedule(
                                                        emp.work_schedule,
                                                    ) || "-"}
                                                </div>
                                            </div>
                                        </div>
                                    </TableCell>

                                    <TableCell className="p-3">
                                        <div className="flex justify-center gap-2">
                                            <Button
                                                type="button"
                                                size="icon"
                                                variant="outline"
                                                onClick={() =>
                                                    onPreviewEmployee?.(emp)
                                                }
                                                className="h-8 w-8 border-blue-200 text-blue-700 hover:bg-blue-50"
                                                title="Preview DTR"
                                            >
                                                <Eye className="h-4 w-4" />
                                            </Button>
                                            <Button
                                                type="button"
                                                size="icon"
                                                variant="outline"
                                                onClick={() =>
                                                    onPrintEmployee?.(emp)
                                                }
                                                className="h-8 w-8 border-blue-200 text-blue-700 hover:bg-blue-50"
                                                title="Print DTR"
                                            >
                                                <Printer className="h-4 w-4" />
                                            </Button>
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

export default EmployeeList;
