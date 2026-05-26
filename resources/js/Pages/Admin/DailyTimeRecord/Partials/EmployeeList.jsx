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
import {
    Building2,
    AlertTriangle,
    Clock3,
    Eye,
    Printer,
    RefreshCw,
    Search,
} from "lucide-react";
import EmployeeAvatar from "@/Components/EmployeeAvatar";
import FloatingInput from "@/components/floating-input";
import {
    CustomDropdownCheckbox,
    CustomDropdownCheckboxObject,
} from "@/components/dropdown-menu-main";
import { Button } from "@/Components/ui/button";
import { SuggestionSkeletonList } from "@/Components/Skeletons";
import {
    HoverCard,
    HoverCardContent,
    HoverCardTrigger,
} from "@/components/ui/hover-card";
import useEmployeeListControls, {
    formatWorkSchedule,
    monthOptions,
} from "../hooks/useEmployeeListControls";

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
    onRecomputeEmployee,
}) => {
    const displayedEmployees = employees;
    const {
        currentPage,
        handlePageChange,
        officeButtonLabel,
        officeItems,
        pageNumbers,
        searchBoxRef,
        selectSuggestion,
        selectedMonthLabel,
        setShowSuggestions,
        showSuggestions,
        submitSearch,
        suggestionMatches,
        suggestionsLoading,
        totalPages,
        yearOptions,
    } = useEmployeeListControls({
        applyFilters,
        offices,
        pagination,
        search,
        selectedMonth,
        selectedOffice,
        selectedYear,
        setSearch,
    });

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

                    <div className="grid w-full grid-cols-1 items-center gap-4 xl:ml-auto xl:w-auto xl:grid-cols-[340px_132px_135px_112px_180px]">
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
                                            <SuggestionSkeletonList count={3} />
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
                            <TableHead className="w-[23%] text-white">
                                Office
                            </TableHead>
                            <TableHead className="w-[17%] text-white">
                                Work Schedule
                            </TableHead>
                            <TableHead className="w-[13%] text-center text-white">
                                Actions
                            </TableHead>
                        </TableRow>
                    </TableHeader>

                    <TableBody>
                        {displayedEmployees.length > 0 ? (
                            displayedEmployees.map((emp) => {
                                const hasWorkType = Boolean(
                                    emp.work_type ||
                                        emp.work_schedule?.work_type_id ||
                                        emp.work_schedule?.work_type,
                                );

                                return (
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
                                                    <div className="truncate font-medium">
                                                        {emp.full_name || "-"}
                                                    </div>
                                                </div>
                                            </div>
                                        </TableCell>

                                        <TableCell className="p-3 text-gray-700">
                                            <div className="flex min-w-0 items-center gap-2">
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

                                                <div className="min-w-0">
                                                    <div className="truncate font-medium">
                                                        {emp.department || "-"}
                                                    </div>
                                                    <div className="truncate text-xs text-gray-500">
                                                        {emp.office?.division
                                                            ?.name || "-"}
                                                    </div>
                                                </div>
                                            </div>
                                        </TableCell>

                                        <TableCell className="p-3 text-gray-700">
                                            <div className="flex min-w-0 items-center gap-2">
                                                {hasWorkType ? (
                                                    <Clock3 className="h-5 w-5 shrink-0 text-blue-600" />
                                                ) : null}
                                                <div className="min-w-0">
                                                    {hasWorkType ? (
                                                        <>
                                                            <div className="truncate font-medium text-gray-800">
                                                                {emp.work_type ||
                                                                    "-"}
                                                            </div>
                                                            <div className="truncate text-xs text-gray-500">
                                                                {formatWorkSchedule(
                                                                    emp.work_schedule,
                                                                ) || "-"}
                                                            </div>
                                                        </>
                                                    ) : (
                                                        <div className="w-fit rounded-full border border-amber-200 bg-amber-50 px-2 py-0.5 text-[11px] font-medium text-amber-700">
                                                            Missing work
                                                            schedule
                                                        </div>
                                                    )}
                                                </div>
                                            </div>
                                        </TableCell>

                                        <TableCell className="p-3">
                                            <div className="flex justify-center gap-2">
                                                {hasWorkType ? (
                                                    <>
                                                        <Button
                                                            type="button"
                                                            size="icon"
                                                            variant="outline"
                                                            onClick={() =>
                                                                onPreviewEmployee?.(
                                                                    emp,
                                                                )
                                                            }
                                                            className="h-8 w-8 rounded-full border-blue-200 text-blue-700 hover:bg-blue-50"
                                                            title="Preview DTR"
                                                        >
                                                            <Eye className="h-4 w-4" />
                                                        </Button>
                                                        <Button
                                                            type="button"
                                                            size="icon"
                                                            variant="outline"
                                                            onClick={() =>
                                                                onPrintEmployee?.(
                                                                    emp,
                                                                )
                                                            }
                                                            className="h-8 w-8 rounded-full border-blue-200 text-blue-700 hover:bg-blue-50"
                                                            title="Print DTR"
                                                        >
                                                            <Printer className="h-4 w-4" />
                                                        </Button>
                                                        <Button
                                                            type="button"
                                                            size="icon"
                                                            variant="outline"
                                                            onClick={() =>
                                                                onRecomputeEmployee?.(
                                                                    emp,
                                                                )
                                                            }
                                                            className="h-8 w-8 rounded-full border-blue-200 text-blue-700 hover:bg-blue-50"
                                                            title="Recompute DTR"
                                                        >
                                                            <RefreshCw className="h-4 w-4" />
                                                        </Button>
                                                    </>
                                                ) : (
                                                    <HoverCard openDelay={150}>
                                                        <HoverCardTrigger asChild>
                                                            <Button
                                                                type="button"
                                                                size="icon"
                                                                aria-disabled="true"
                                                                onClick={(
                                                                    event,
                                                                ) =>
                                                                    event.preventDefault()
                                                                }
                                                                className="h-8 w-8 animate-pulse cursor-not-allowed rounded-full border border-amber-300 bg-amber-100 text-amber-700 opacity-100 shadow-[0_0_12px_rgba(245,158,11,0.75)] hover:bg-amber-100"
                                                            >
                                                                <AlertTriangle className="h-4 w-4" />
                                                            </Button>
                                                        </HoverCardTrigger>
                                                        <HoverCardContent
                                                            side="left"
                                                            align="center"
                                                            className="w-fit rounded-lg border border-amber-200 bg-amber-50 px-3 py-2 text-xs font-medium text-amber-700 shadow-md"
                                                        >
                                                            Work type missing
                                                        </HoverCardContent>
                                                    </HoverCard>
                                                )}
                                            </div>
                                        </TableCell>
                                    </TableRow>
                                );
                            })
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

