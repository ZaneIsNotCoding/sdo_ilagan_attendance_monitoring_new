import React, { useEffect, useMemo, useRef, useState } from "react";
import { router } from "@inertiajs/react";
import { Button } from "@/components/ui/button";
import {
    Pagination,
    PaginationContent,
    PaginationItem,
    PaginationLink,
    PaginationNext,
    PaginationPrevious,
} from "@/components/ui/pagination";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import { Trash2, LandPlot, CheckCircle2, XCircle } from "lucide-react";
import ConfirmPasswordDialog from "@/Components/ConfirmPasswordDialog";
import AssignStationAdminModal from "./AssignStationAdminModal";
import FloatingInput from "@/components/floating-input";
import { Search } from "lucide-react";
import EmployeeAvatar from "@/Components/EmployeeAvatar";

const ITEMS_PER_PAGE = 10;

const getStationHighlightKey = (station) => {
    if (!station) return null;

    return `${station.source || "station"}:${
        station.source === "sdo" ? station.record_id || station.id : station.id
    }`;
};

const StationAdminList = ({
    stations = [],
    school_admins = [],
    employees = [],
    search = "",
    highlightedStationId = null,
    highlightRequestKey = 0,
}) => {
    const [currentPage, setCurrentPage] = useState(1);
    const [selectedStationForAssign, setSelectedStationForAssign] =
        useState(null);
    const [animatedStationId, setAnimatedStationId] = useState(null);
    const [searchTerm, setSearchTerm] = useState(search || "");
    const [showSuggestions, setShowSuggestions] = useState(false);
    const animationTimeoutRef = useRef(null);
    const searchBoxRef = useRef(null);

    useEffect(() => {
        setSearchTerm(search || "");
    }, [search]);

    const stationRows = useMemo(
        () =>
            stations.map((station) => {
                let admin = null;

                if (station.source === "station") {
                    admin = school_admins.find(
                        (a) =>
                            String(a.employee?.station_id) ===
                                String(station.id) &&
                            a.type === "school_admin",
                    );
                }

                if (station.source === "sdo") {
                    admin = school_admins.find(
                        (a) => a.type === station.role,
                    );
                }

                return {
                    station,
                    admin: admin || null,
                };
            }),
        [school_admins, stations],
    );

    const visibleStationRows = useMemo(() => {
        if (!search.trim()) {
            return stationRows;
        }

        const query = search.trim().toLowerCase();

        return stationRows.filter((row) => {
            const name = (row.station.name || "").toLowerCase();
            const code = (row.station.code || "").toLowerCase();

            return name.includes(query) || code.includes(query);
        });
    }, [search, stationRows]);

    const suggestionMatches = useMemo(() => {
        const query = searchTerm.trim().toLowerCase();

        if (!query) {
            return [];
        }

        return stations
            .filter((station) => {
                const name = (station.name || "").toLowerCase();
                return name.includes(query);
            })
            .slice(0, 8)
            .map((station) => ({
                id: station.id,
                label: station.name,
                meta: station.code ? `${station.code}` : "No code",
                search: station.name,
            }));
    }, [searchTerm, stations]);

    const highlightedStationIndex = useMemo(
        () =>
            visibleStationRows.findIndex(
                (row) =>
                    String(getStationHighlightKey(row.station)) ===
                    String(highlightedStationId),
            ),
        [highlightedStationId, visibleStationRows],
    );

    useEffect(() => {
        if (highlightedStationId == null || highlightedStationIndex < 0) {
            return;
        }

        const targetPage =
            Math.floor(highlightedStationIndex / ITEMS_PER_PAGE) + 1;

        setCurrentPage(targetPage);
        setAnimatedStationId(highlightedStationId);

        if (animationTimeoutRef.current) {
            clearTimeout(animationTimeoutRef.current);
        }

        animationTimeoutRef.current = setTimeout(() => {
            setAnimatedStationId(null);
        }, 2200);
    }, [highlightedStationId, highlightedStationIndex, highlightRequestKey]);

    useEffect(() => {
        return () => {
            if (animationTimeoutRef.current) {
                clearTimeout(animationTimeoutRef.current);
            }
        };
    }, []);

    const totalPages = Math.ceil(visibleStationRows.length / ITEMS_PER_PAGE);

    const paginatedRows = visibleStationRows.slice(
        (currentPage - 1) * ITEMS_PER_PAGE,
        currentPage * ITEMS_PER_PAGE,
    );

    const handlePageChange = (page) => {
        if (page < 1 || page > totalPages) return;
        setCurrentPage(page);
    };

    const getFullName = (emp) => {
        if (!emp) return "-";
        return `${emp.first_name || ""} ${emp.middle_name || ""} ${emp.last_name || ""}`
            .replace(/\s+/g, " ")
            .trim();
    };

    const totalEntries = visibleStationRows.length;
    const startIndex =
        totalEntries === 0 ? 0 : (currentPage - 1) * ITEMS_PER_PAGE + 1;
    const endIndex = Math.min(currentPage * ITEMS_PER_PAGE, totalEntries);

    const submitSearch = (value) => {
        router.get(
            route("stationmanagement"),
            value && value.trim() ? { search: value.trim() } : {},
            {
                preserveState: true,
                preserveScroll: true,
                replace: true,
            },
        );
    };

    const selectSuggestion = (suggestion) => {
        const nextValue = suggestion.search || suggestion.label || "";
        setSearchTerm(nextValue);
        setShowSuggestions(false);
        submitSearch(nextValue);
    };

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

    useEffect(() => {
        setCurrentPage(1);
    }, [searchTerm]);

    return (
        <div className="rounded-xl">
            <div className="flex items-start justify-between gap-4 mb-4">
                <div>
                    <h2 className="text-lg font-bold">
                        Station Administrator List
                    </h2>
                    <p className="text-sm text-gray-500">
                        Manage station assignments
                    </p>
                </div>

                <div ref={searchBoxRef} className="relative w-full max-w-sm">
                    <form
                        onSubmit={(e) => {
                            e.preventDefault();
                            submitSearch(searchTerm);
                            setCurrentPage(1);
                            setShowSuggestions(false);
                        }}
                        className="space-y-2"
                    >
                        <FloatingInput
                            label="Search Station"
                            icon={Search}
                            name="station-admin-search"
                            value={searchTerm}
                            onChange={(e) => {
                                setSearchTerm(e.target.value);
                                setShowSuggestions(true);
                            }}
                            onKeyDown={(e) => {
                                if (e.key === "Enter") {
                                    e.preventDefault();
                                    submitSearch(searchTerm);
                                    setCurrentPage(1);
                                    setShowSuggestions(false);
                                }
                            }}
                        />
                    </form>

                    {showSuggestions && searchTerm.trim() ? (
                        <div className="absolute right-0 top-full z-50 mt-2 w-full overflow-hidden rounded-xl border border-slate-200 bg-white shadow-2xl">
                            <div className="border-b bg-slate-50 px-3 py-2 text-xs font-semibold uppercase tracking-wide text-slate-500">
                                Stations
                            </div>

                            <div className="max-h-72 overflow-y-auto">
                                {suggestionMatches.length > 0 ? (
                                    suggestionMatches.map((suggestion) => (
                                        <button
                                            key={suggestion.id}
                                            type="button"
                                            onMouseDown={() =>
                                                selectSuggestion(suggestion)
                                            }
                                            className="flex w-full items-start justify-between gap-3 px-3 py-2 text-left text-sm transition hover:bg-blue-50"
                                        >
                                            <div className="min-w-0">
                                                <div className="truncate font-medium text-slate-800">
                                                    {suggestion.label}
                                                </div>
                                                <div className="truncate text-xs text-slate-500">
                                                    {suggestion.meta}
                                                </div>
                                            </div>

                                            <span className="shrink-0 rounded-full bg-blue-100 px-2 py-1 text-[11px] font-semibold text-blue-700">
                                                Search
                                            </span>
                                        </button>
                                    ))
                                ) : (
                                    <div className="px-3 py-4 text-sm text-slate-500">
                                        No station matches found.
                                    </div>
                                )}
                            </div>
                        </div>
                    ) : null}
                </div>
            </div>

            <div className="overflow-x-auto border rounded-lg">
                <Table className="w-full table-fixed">
                    <TableHeader>
                        <TableRow className="bg-blue-900 hover:bg-blue-800">
                            <TableHead className="text-white text-left px-10 w-[20%]">
                                Employee Name
                            </TableHead>
                            <TableHead className="text-white p-3 w-[15%]">
                                Code
                            </TableHead>
                            <TableHead className="text-white p-3 w-[25%]">
                                Station
                            </TableHead>
                            <TableHead className="text-white p-3 w-[10%]">
                                Status
                            </TableHead>
                            <TableHead className="text-white p-3 w-[10%]">
                                Date Assigned
                            </TableHead>
                            <TableHead className="text-white text-center p-3 w-[10%]">
                                Actions
                            </TableHead>
                        </TableRow>
                    </TableHeader>

                    <TableBody>
                        {paginatedRows.length > 0 ? (
                            paginatedRows.map(({ station, admin }) => {
                                const emp = admin?.employee;
                                const isHighlighted =
                                    String(getStationHighlightKey(station)) ===
                                    String(animatedStationId);

                                return (
                                    <TableRow
                                        key={station.id}
                                        className={`h-[64px] transition ${
                                            isHighlighted
                                                ? "bg-amber-50 ring-1 ring-inset ring-amber-300 hover:bg-amber-100"
                                                : !admin
                                                  ? "bg-gray-100 hover:bg-gray-200"
                                                  : "bg-white hover:bg-blue-50"
                                        }`}
                                    >
                                        <TableCell className="p-3">
                                            <div className="flex items-center gap-3">
                                                <EmployeeAvatar
                                                    employee={emp}
                                                    name={getFullName(emp)}
                                                    className="h-8 w-8"
                                                />

                                                <div className="min-w-0">
                                                    <div className="font-medium truncate">
                                                        {emp
                                                            ? getFullName(emp)
                                                            : "No Admin Assigned"}
                                                    </div>
                                                    {emp && (
                                                        <div className="text-xs text-gray-600 truncate">
                                                            {emp.position ||
                                                                "-"}
                                                        </div>
                                                    )}

                                                    {emp && (
                                                        <div className="text-xs text-gray-500 truncate">
                                                            {emp?.user?.email ||
                                                                ""}
                                                        </div>
                                                    )}
                                                </div>
                                            </div>
                                        </TableCell>

                                        <TableCell className="p-3 font-medium">
                                            {station.code || "-"}
                                        </TableCell>

                                        <TableCell className="p-3">
                                            <div className="flex items-center gap-2 min-w-0">
                                                <div className="w-7 h-7 min-w-[28px] flex items-center justify-center rounded-full bg-gray-300">
                                                    <LandPlot className="w-4 h-4 text-blue-600" />
                                                </div>
                                                <span className="truncate">
                                                    {station.name}
                                                </span>
                                            </div>
                                        </TableCell>

                                        <TableCell className="p-3">
                                            {admin ? (
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
                                            {emp?.user?.created_at
                                                ? new Date(
                                                      emp.user.created_at,
                                                  ).toLocaleDateString(
                                                      "en-PH",
                                                      {
                                                          year: "numeric",
                                                          month: "short",
                                                          day: "numeric",
                                                      },
                                                  )
                                                : "-"}
                                        </TableCell>

                                        <TableCell className="p-3 text-center">
                                            {admin ? (
                                                <ConfirmPasswordDialog
                                                    action={route(
                                                        "stationadmin.destroy",
                                                        admin.id,
                                                    )}
                                                    trigger={
                                                        <Button
                                                            size="icon"
                                                            className="bg-red-100 text-red-600 hover:bg-red-500 hover:text-white rounded-full"
                                                        >
                                                            <Trash2 className="h-4 w-4" />
                                                        </Button>
                                                    }
                                                    title="Remove Station Admin"
                                                    description="Remove assigned admin from this station."
                                                    itemLabel="Station Admin"
                                                    itemName={getFullName(emp)}
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
                                                    onClick={() =>
                                                        setSelectedStationForAssign(
                                                            {
                                                                station_id:
                                                                    station.source ===
                                                                    "sdo"
                                                                        ? station.station_id
                                                                        : station.id,
                                                                role:
                                                                    station.source ===
                                                                    "sdo"
                                                                        ? station.role
                                                                        : "school_admin",
                                                                source: station.source,
                                                            },
                                                        )
                                                    }
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
                                    className="text-center p-5 text-gray-500"
                                >
                                    No Stations Found
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

            <AssignStationAdminModal
                open={!!selectedStationForAssign}
                setOpen={() => setSelectedStationForAssign(null)}
                employees={employees}
                stations={stations}
                stationData={selectedStationForAssign}
            />
        </div>
    );
};

export default StationAdminList;
