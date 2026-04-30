import React, { useEffect, useMemo, useRef, useState } from "react";
import { router } from "@inertiajs/react";
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
import FloatingInput from "@/components/floating-input";
import { Building2, CheckCircle2, XCircle, Trash2, Search } from "lucide-react";
import ConfirmPasswordDialog from "@/Components/ConfirmPasswordDialog";
import AddOfficeHeadForm from "./AddOfficeHeadForm";
import EmployeeAvatar from "@/Components/EmployeeAvatar";

const ITEMS_PER_PAGE = 10;

const getOfficeSearchText = (office) =>
    [
        office?.id,
        office?.name,
        office?.division?.id,
        office?.division?.code,
        office?.division?.name,
    ]
        .filter(Boolean)
        .join(" ")
        .toLowerCase();

const DepartmentHeadList = ({
    office_heads = [],
    offices = [],
    employees = [],
    officeSearch = "",
    highlightedOfficeId = null,
    highlightRequestKey = 0,
}) => {
    const [openAdd, setOpenAdd] = useState(false);
    const [selectedOffice, setSelectedOffice] = useState(null);
    const [currentPage, setCurrentPage] = useState(1);
    const [searchInput, setSearchInput] = useState(officeSearch);
    const [isSearchFocused, setIsSearchFocused] = useState(false);
    const [animatedOfficeId, setAnimatedOfficeId] = useState(null);
    const animationTimeoutRef = useRef(null);

    useEffect(() => {
        setSearchInput(officeSearch || "");
    }, [officeSearch]);

    const getFullName = (emp) => {
        if (!emp) return "-";
        return `${emp.first_name || ""} ${emp.middle_name || ""} ${emp.last_name || ""}`
            .replace(/\s+/g, " ")
            .trim();
    };

    const rows = useMemo(() => {
        return [...offices]
            .sort((a, b) => a.name.localeCompare(b.name))
            .map((office) => ({
                office,
                head:
                    office_heads.find(
                        (h) =>
                            String(h.employee?.office_id) === String(office.id),
                    ) || null,
            }));
    }, [offices, office_heads]);

    const visibleRows = useMemo(() => {
        const query = officeSearch.trim().toLowerCase();

        if (!query) {
            return rows;
        }

        return rows.filter((row) =>
            getOfficeSearchText(row.office).includes(query),
        );
    }, [rows, officeSearch]);

    const totalPages = Math.ceil(visibleRows.length / ITEMS_PER_PAGE);

    const highlightedOfficeIndex = useMemo(
        () =>
            visibleRows.findIndex(
                (row) => String(row.office.id) === String(highlightedOfficeId),
            ),
        [highlightedOfficeId, visibleRows],
    );

    useEffect(() => {
        if (highlightedOfficeId == null || highlightedOfficeIndex < 0) {
            return;
        }

        const targetPage =
            Math.floor(highlightedOfficeIndex / ITEMS_PER_PAGE) + 1;

        setCurrentPage(targetPage);
        setAnimatedOfficeId(highlightedOfficeId);

        if (animationTimeoutRef.current) {
            clearTimeout(animationTimeoutRef.current);
        }

        animationTimeoutRef.current = setTimeout(() => {
            setAnimatedOfficeId(null);
        }, 2200);
    }, [highlightedOfficeId, highlightedOfficeIndex, highlightRequestKey]);

    useEffect(() => {
        return () => {
            if (animationTimeoutRef.current) {
                clearTimeout(animationTimeoutRef.current);
            }
        };
    }, []);

    const paginatedRows = visibleRows.slice(
        (currentPage - 1) * ITEMS_PER_PAGE,
        currentPage * ITEMS_PER_PAGE,
    );

    const handlePageChange = (page) => {
        if (page < 1 || page > totalPages) return;
        setCurrentPage(page);
    };

    const suggestions = useMemo(() => {
        const query = searchInput.trim().toLowerCase();
        if (!query) return [];

        const seen = new Set();
        const results = [];

        const pushSuggestion = (officeId, officeName, divisionName, value) => {
            const key =
                `${officeId}__${officeName}__${divisionName}__${value}`.toLowerCase();
            if (seen.has(key)) return;
            seen.add(key);
            results.push({ officeId, officeName, divisionName, value });
        };

        offices.forEach((office) => {
            const division = office.division;
            const haystack = getOfficeSearchText(office);

            if (haystack.includes(query)) {
                pushSuggestion(
                    office.id,
                    office.name,
                    division?.name || division?.code || "",
                    office.name,
                );
            }
        });

        return results.slice(0, 6);
    }, [offices, searchInput]);

    useEffect(() => {
        setCurrentPage(1);
    }, [officeSearch]);

    const runSearch = (value) => {
        setCurrentPage(1);

        router.get(
            route("departmentmanagement"),
            value.trim() ? { office_search: value.trim() } : {},
            {
                preserveState: true,
                preserveScroll: true,
                replace: true,
            },
        );
    };

    const handleSearch = (e) => {
        e.preventDefault();
        runSearch(searchInput);
    };

    const totalEntries = visibleRows.length;
    const startIndex =
        totalEntries === 0 ? 0 : (currentPage - 1) * ITEMS_PER_PAGE + 1;
    const endIndex = Math.min(currentPage * ITEMS_PER_PAGE, totalEntries);

    return (
        <div className="rounded-xl">
            <div className="flex items-start justify-between gap-4 mb-4">
                <div>
                    <h2 className="text-lg font-bold">Office Head List</h2>
                    <p className="text-sm text-gray-500">
                        Manage office head assignments
                    </p>
                </div>

                <form
                    className="relative w-full max-w-sm"
                    onSubmit={handleSearch}
                >
                    <div className="relative">
                        <FloatingInput
                            label="Search Office"
                            icon={Search}
                            name="office-search"
                            value={searchInput}
                            onChange={(e) => setSearchInput(e.target.value)}
                            onFocus={() => setIsSearchFocused(true)}
                            onBlur={() => {
                                window.setTimeout(() => {
                                    setIsSearchFocused(false);
                                }, 120);
                            }}
                            onKeyDown={(e) => {
                                if (e.key === "Enter") {
                                    e.preventDefault();
                                    runSearch(searchInput);
                                    setIsSearchFocused(false);
                                }
                            }}
                        />

                        {isSearchFocused &&
                            searchInput.trim() &&
                            suggestions.length > 0 && (
                                <div className="absolute right-0 top-full z-50 mt-2 w-full overflow-hidden rounded-xl border border-slate-200 bg-white shadow-2xl">
                                    <div className="border-b bg-slate-50 px-3 py-2 text-xs font-semibold uppercase tracking-wide text-slate-500">
                                        Offices
                                    </div>

                                    <div className="max-h-72 overflow-y-auto">
                                        {suggestions.map((item) => (
                                            <button
                                                key={`${item.officeId}-${item.officeName}-${item.value}`}
                                                type="button"
                                                className="flex w-full items-start justify-between gap-3 px-3 py-2 text-left text-sm transition hover:bg-blue-50"
                                                onClick={() => {
                                                    setSearchInput(item.value);
                                                    runSearch(item.value);
                                                    setIsSearchFocused(false);
                                                }}
                                            >
                                                <div className="min-w-0">
                                                    <div className="truncate font-medium text-slate-800">
                                                        {item.officeName}
                                                    </div>
                                                    <div className="truncate text-xs text-slate-500">
                                                        {item.divisionName}
                                                    </div>
                                                </div>

                                                <span className="shrink-0 rounded-full bg-blue-100 px-2 py-1 text-[11px] font-semibold text-blue-700">
                                                    Search
                                                </span>
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            )}
                    </div>
                </form>
            </div>

            <AddOfficeHeadForm
                open={openAdd}
                setOpen={setOpenAdd}
                employees={employees}
                offices={offices}
                preselectedOffice={selectedOffice}
            />

            <div className="overflow-x-auto border rounded-lg">
                <Table className="w-full table-fixed">
                    <TableHeader>
                        <TableRow className="bg-blue-900 hover:bg-blue-800">
                            <TableHead className="text-white text-left px-10 w-[25%]">
                                Employee Name
                            </TableHead>
                            <TableHead className="text-white p-3 w-[15%]">
                                Position
                            </TableHead>
                            <TableHead className="text-white p-3 w-[25%]">
                                Office
                            </TableHead>
                            <TableHead className="text-white p-3 w-[15%]">
                                Status
                            </TableHead>
                            <TableHead className="text-white p-3 w-[10%]">
                                Date Assigned
                            </TableHead>
                            <TableHead className="text-white text-center p-3 w-[15%]">
                                Actions
                            </TableHead>
                        </TableRow>
                    </TableHeader>

                    <TableBody>
                        {paginatedRows.length > 0 ? (
                            paginatedRows.map((row) => {
                                const emp = row.head?.employee;
                                const fullName = getFullName(emp);
                                const isHighlighted =
                                    String(row.office.id) ===
                                    String(animatedOfficeId);

                                return (
                                    <TableRow
                                        key={row.office.id}
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
                                                    <div className="font-medium truncate">
                                                        {emp
                                                            ? fullName
                                                            : "No Head Assigned"}
                                                    </div>
                                                </div>
                                            </div>
                                        </TableCell>
                                        <TableCell className="p-3">
                                            <span className="truncate">
                                                {emp?.position || "-"}
                                            </span>
                                        </TableCell>
                                        <TableCell className="p-3">
                                            <div className="flex items-center gap-2 min-w-0">
                                                <div className="w-7 h-7 min-w-[28px] flex items-center justify-center rounded-full bg-gray-300">
                                                    <Building2 className="w-4 h-4 text-blue-600" />
                                                </div>
                                                <span className="truncate">
                                                    {row.office.name}
                                                </span>
                                            </div>
                                        </TableCell>
                                        <TableCell className="p-3">
                                            {row.head ? (
                                                <span className="px-2 py-1 text-xs font-semibold bg-green-200 text-green-800 rounded-full inline-flex items-center gap-2">
                                                    <CheckCircle2 size={14} />
                                                    Assigned
                                                </span>
                                            ) : (
                                                <span className="px-2 py-1 text-xs font-semibold bg-red-200 text-red-800 rounded-full inline-flex items-center gap-2">
                                                    <XCircle size={14} />
                                                    Missing
                                                </span>
                                            )}
                                        </TableCell>
                                        <TableCell className="p-3">
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
                                                            className="bg-red-100 text-red-600 hover:bg-red-500 hover:text-white rounded-full"
                                                        >
                                                            <Trash2 className="h-4 w-4" />
                                                        </Button>
                                                    }
                                                    title="Delete Office Head"
                                                    description="You are about to permanently remove this office head assignment."
                                                    itemLabel="Office Head"
                                                    itemName={getFullName(emp)}
                                                    action={route(
                                                        "departmenthead.destroy",
                                                        row.head.id,
                                                    )}
                                                    method="delete"
                                                />
                                            ) : (
                                                <Button
                                                    size="sm"
                                                    className={`bg-white text-blue-600 border border-blue-600 hover:bg-blue-600 hover:text-white ${
                                                        isHighlighted
                                                            ? "animate-bounce bg-blue-600 font-semibold text-white shadow-lg shadow-blue-200"
                                                            : ""
                                                    }`}
                                                    onClick={() => {
                                                        setSelectedOffice(
                                                            row.office.id,
                                                        );
                                                        setOpenAdd(true);
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
                                    colSpan={6}
                                    className="text-center p-5 text-gray-500"
                                >
                                    No Offices Found
                                </TableCell>
                            </TableRow>
                        )}
                    </TableBody>
                </Table>
            </div>

            <div className="flex items-center mt-4">
                <div className="text-sm text-gray-500 font-medium">
                    Showing {startIndex} to {endIndex} of {totalEntries} entries
                </div>

                <div className="ml-auto">
                    {totalPages > 1 && (
                        <Pagination>
                            <PaginationPrevious
                                onClick={() =>
                                    handlePageChange(currentPage - 1)
                                }
                            />
                            <PaginationContent>
                                {Array.from({ length: totalPages }, (_, i) => (
                                    <PaginationItem key={i}>
                                        <PaginationLink
                                            isActive={currentPage === i + 1}
                                            onClick={() =>
                                                handlePageChange(i + 1)
                                            }
                                        >
                                            {i + 1}
                                        </PaginationLink>
                                    </PaginationItem>
                                ))}
                            </PaginationContent>
                            <PaginationNext
                                onClick={() =>
                                    handlePageChange(currentPage + 1)
                                }
                            />
                        </Pagination>
                    )}
                </div>
            </div>
        </div>
    );
};

export default DepartmentHeadList;
