import React, { useEffect, useMemo, useRef, useState } from "react";
import axios from "axios";
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
import { Skeleton } from "@/components/ui/skeleton";

const getStationHighlightKey = (station) => {
    if (!station) return null;

    return `${station.source || "station"}:${
        station.source === "sdo" ? station.record_id || station.id : station.id
    }`;
};

const StationAdminList = ({
    stationRows = {},
    search = "",
    adminLimit = 10,
    assignStationModal = null,
    removeStationAdminModal = null,
    highlightedStationId = null,
    highlightRequestKey = 0,
}) => {
    const [animatedStationId, setAnimatedStationId] = useState(null);
    const [stationRowsData, setStationRowsData] = useState(stationRows);
    const [searchTerm, setSearchTerm] = useState(search || "");
    const [suggestionMatches, setSuggestionMatches] = useState([]);
    const [suggestionsLoading, setSuggestionsLoading] = useState(false);
    const [showSuggestions, setShowSuggestions] = useState(false);
    const animationTimeoutRef = useRef(null);
    const suggestionRequestRef = useRef(0);
    const searchBoxRef = useRef(null);

    useEffect(() => {
        setSearchTerm(search || "");
    }, [search]);

    useEffect(() => {
        setStationRowsData(stationRows);
    }, [stationRows]);

    const visibleStationRows = stationRowsData?.data || [];
    const activePage = stationRowsData?.current_page || 1;
    const totalPages = stationRowsData?.last_page || 1;
    const totalEntries = stationRowsData?.total || 0;
    const startIndex = stationRowsData?.from || 0;
    const endIndex = stationRowsData?.to || 0;
    const pageNumbers = useMemo(() => {
        if (totalPages <= 7) {
            return Array.from({ length: totalPages }, (_, index) => index + 1);
        }

        const pages = [1];
        const start = Math.max(2, activePage - 1);
        const end = Math.min(totalPages - 1, activePage + 2);

        if (start > 2) {
            pages.push("start-ellipsis");
        }

        for (let page = start; page <= end; page += 1) {
            pages.push(page);
        }

        if (end < totalPages - 1) {
            pages.push("end-ellipsis");
        }

        if (!pages.includes(totalPages)) {
            pages.push(totalPages);
        }

        return pages;
    }, [activePage, totalPages]);

    useEffect(() => {
        const query = searchTerm.trim();

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
                .get(route("stations.suggestions"), {
                    params: { search: query },
                })
                .then((response) => {
                    if (suggestionRequestRef.current !== requestId) return;

                    setSuggestionMatches(
                        (response.data || []).map((station) => ({
                            id: `${station.source || "station"}:${
                                station.record_id || station.id
                            }`,
                            label: station.name,
                            meta: station.code ? `${station.code}` : "No code",
                            search: station.name,
                        })),
                    );
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
    }, [searchTerm]);

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

    const paginatedRows = visibleStationRows;

    const openAssignModal = (station) => {
        const params = new URLSearchParams(window.location.search);

        params.delete("admin_id");
        params.set("modal", "station-admin");
        params.set(
            "station_id",
            station.source === "sdo" ? station.station_id : station.id,
        );
        params.set(
            "station_role",
            station.source === "sdo" ? station.role : "school_admin",
        );
        params.set("station_source", station.source || "station");

        router.get(route("stationmanagement"), Object.fromEntries(params), {
            preserveScroll: true,
            preserveState: true,
            replace: true,
        });
    };

    const closeAssignModal = () => {
        const params = new URLSearchParams(window.location.search);

        params.delete("modal");
        params.delete("admin_id");
        params.delete("station_id");
        params.delete("station_role");
        params.delete("station_source");

        router.get(route("stationmanagement"), Object.fromEntries(params), {
            preserveScroll: true,
            preserveState: true,
            replace: true,
        });
    };

    const openRemoveAdminModal = (admin) => {
        const params = new URLSearchParams(window.location.search);

        params.delete("station_id");
        params.delete("station_role");
        params.delete("station_source");
        params.set("modal", "remove-station-admin");
        params.set("admin_id", admin.id);

        router.get(route("stationmanagement"), Object.fromEntries(params), {
            preserveScroll: true,
            preserveState: true,
            replace: true,
        });
    };

    const closeRemoveAdminModal = () => {
        const params = new URLSearchParams(window.location.search);

        params.delete("modal");
        params.delete("admin_id");
        params.delete("station_id");
        params.delete("station_role");
        params.delete("station_source");

        router.get(route("stationmanagement"), Object.fromEntries(params), {
            preserveScroll: true,
            preserveState: true,
            replace: true,
        });
    };

    const loadAdminRows = (overrides = {}) => {
        const params = new URLSearchParams(window.location.search);

        params.set("admin_page", overrides.admin_page || activePage);
        params.set("admin_limit", overrides.admin_limit || adminLimit);

        if (Object.prototype.hasOwnProperty.call(overrides, "search")) {
            if (overrides.search && overrides.search.trim()) {
                params.set("search", overrides.search.trim());
            } else {
                params.delete("search");
            }
        } else if (searchTerm.trim()) {
            params.set("search", searchTerm.trim());
        }

        axios
            .get(route("stationadmin.list"), {
                params: Object.fromEntries(params),
            })
            .then((response) => {
                setStationRowsData(response.data.stationAdminRows);
                setSearchTerm(response.data.search || "");

                const nextParams = new URLSearchParams(window.location.search);
                nextParams.set("admin_page", response.data.adminPage || 1);
                nextParams.set(
                    "admin_limit",
                    response.data.adminLimit || adminLimit,
                );

                if (response.data.search) {
                    nextParams.set("search", response.data.search);
                } else {
                    nextParams.delete("search");
                }

                window.history.replaceState(
                    {},
                    "",
                    `${route("stationmanagement")}?${nextParams.toString()}`,
                );
            })
            .catch((error) => {
                console.error("Failed to load station admin rows:", error);
            });
    };

    const handlePageChange = (page) => {
        if (page < 1 || page > totalPages) return;

        loadAdminRows({ admin_page: page });
    };

    const getFullName = (emp) => {
        if (!emp) return "-";
        return `${emp.first_name || ""} ${emp.middle_name || ""} ${emp.last_name || ""}`
            .replace(/\s+/g, " ")
            .trim();
    };

    const submitSearch = (value) => {
        loadAdminRows({
            admin_page: 1,
            search: value?.trim() || "",
        });
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
                                    setShowSuggestions(false);
                                }
                            }}
                        />
                    </form>

                    {showSuggestions && searchTerm.trim() ? (
                        <div className="absolute right-0 top-full z-50 mt-2 w-full overflow-hidden rounded-xl border border-slate-200 bg-white shadow-2xl">
                            <div className="border-b bg-slate-50 px-3 py-2 text-xs font-semibold uppercase tracking-wide text-slate-500">
                                Results for "{searchTerm.trim()}"
                            </div>

                            <div className="max-h-72 overflow-y-auto">
                                {suggestionsLoading ? (
                                    <div className="space-y-2 px-3 py-3">
                                        {Array.from({ length: 2 }).map(
                                            (_, index) => (
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
                                            ),
                                        )}
                                    </div>
                                ) : suggestionMatches.length > 0 ? (
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
                                                <Button
                                                    size="icon"
                                                    onClick={() =>
                                                        openRemoveAdminModal(
                                                            admin,
                                                        )
                                                    }
                                                    className="bg-red-100 text-red-600 hover:bg-red-500 hover:text-white rounded-full"
                                                >
                                                    <Trash2 className="h-4 w-4" />
                                                </Button>
                                            ) : (
                                                <Button
                                                    size="sm"
                                                    className={`bg-white text-blue-600 border border-blue-600 hover:bg-blue-600 hover:text-white ${
                                                        isHighlighted
                                                            ? "animate-bounce bg-blue-600 font-semibold text-white shadow-lg shadow-blue-200"
                                                            : ""
                                                    }`}
                                                    onClick={() =>
                                                        openAssignModal(station)
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
                                onClick={() => handlePageChange(activePage - 1)}
                            />
                            <PaginationContent>
                                {pageNumbers.map((page) => (
                                    <PaginationItem key={page}>
                                        {typeof page === "number" ? (
                                            <PaginationLink
                                                isActive={activePage === page}
                                                onClick={() =>
                                                    handlePageChange(page)
                                                }
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
                                onClick={() => handlePageChange(activePage + 1)}
                            />
                        </Pagination>
                    )}
                </div>
            </div>

            <AssignStationAdminModal
                open={!!assignStationModal}
                setOpen={closeAssignModal}
                stations={[]}
                stationData={assignStationModal}
            />

            <ConfirmPasswordDialog
                trigger={null}
                action={
                    removeStationAdminModal?.id
                        ? route(
                              "stationadmin.destroy",
                              removeStationAdminModal.id,
                          )
                        : ""
                }
                title="Remove Station Admin"
                description="Remove assigned admin from this station."
                itemLabel="Station Admin"
                itemName={removeStationAdminModal?.employee_name || ""}
                method="delete"
                open={!!removeStationAdminModal}
                onOpenChange={(nextOpen) => {
                    if (!nextOpen) closeRemoveAdminModal();
                }}
            />
        </div>
    );
};

export default StationAdminList;
