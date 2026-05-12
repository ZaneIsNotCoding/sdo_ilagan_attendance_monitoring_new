import React, { useEffect, useRef, useState } from "react";
import axios from "axios";
import {
    CheckCircle2,
    Clock3,
    Loader2,
    Search,
    XCircle,
    X,
} from "lucide-react";
import {
    Pagination,
    PaginationContent,
    PaginationItem,
    PaginationLink,
    PaginationNext,
    PaginationPrevious,
} from "@/components/ui/pagination";
import FloatingInput from "@/components/floating-input";
import EmployeeAvatar from "@/Components/EmployeeAvatar";
import SchoolList from "./SchoolList";

const EmployeeCard = ({ row }) => {
    const status = row.status || "Absent";
    const isPresent = status === "Present";
    const isLate = status === "Late";
    const isAbsent = status === "Absent";

    return (
        <div className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm shadow-slate-200/50">
            <div className="flex items-start gap-4">
                <EmployeeAvatar employee={row} className="h-20 w-20" />
                <div className="min-w-0 flex-1">
                    <p className="truncate text-base font-black text-[#070d3f]">
                        {row.name}
                    </p>
                    <p className="mt-1 truncate text-xs font-semibold text-slate-500">
                        {row.position}
                    </p>
                    <p className="truncate text-xs font-semibold text-slate-500">
                        {row.station}
                    </p>
                </div>
                <span
                    className={`inline-flex shrink-0 items-center gap-1 rounded-full px-3 py-1.5 text-xs font-black shadow-sm ${
                        isPresent
                            ? "bg-emerald-500 text-white shadow-emerald-200"
                            : isLate
                              ? "bg-amber-400 text-[#070d3f] shadow-amber-200"
                              : isAbsent
                                ? "bg-rose-500 text-white shadow-rose-200"
                                : "bg-slate-500 text-white shadow-slate-200"
                    }`}
                >
                    {isPresent && <CheckCircle2 className="h-3.5 w-3.5" />}
                    {isLate && <Clock3 className="h-3.5 w-3.5" />}
                    {isAbsent && <XCircle className="h-3.5 w-3.5" />}
                    {status}
                </span>
            </div>

            <div className="mt-4">
                <div className="grid grid-cols-4 gap-3 text-center">
                    <div>
                        <p className="truncate text-sm font-black text-[#070d3f]">
                            {row.am_in || "-"}
                        </p>
                        <p className="text-xs font-semibold text-slate-400">
                            AM In
                        </p>
                    </div>
                    <div>
                        <p className="truncate text-sm font-black text-[#070d3f]">
                            {row.am_out || "-"}
                        </p>
                        <p className="text-xs font-semibold text-slate-400">
                            AM Out
                        </p>
                    </div>
                    <div>
                        <p className="truncate text-sm font-black text-[#070d3f]">
                            {row.pm_in || "-"}
                        </p>
                        <p className="text-xs font-semibold text-slate-400">
                            PM In
                        </p>
                    </div>
                    <div>
                        <p className="truncate text-sm font-black text-[#070d3f]">
                            {row.pm_out || "-"}
                        </p>
                        <p className="text-xs font-semibold text-slate-400">
                            PM Out
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
};

const EmployeeList = ({
    employees,
    goToPage,
    rows,
    search,
    selectedStation,
    selectedStationCode,
    selectedStationName,
    selectStation,
    setSearch,
    setStationSearch,
    submitSearch,
    stationSearch,
    stations,
}) => {
    const [suggestionMatches, setSuggestionMatches] = useState([]);
    const [suggestionsLoading, setSuggestionsLoading] = useState(false);
    const [showSuggestions, setShowSuggestions] = useState(false);
    const suggestionRequestRef = useRef(0);
    const searchBoxRef = useRef(null);
    const page = employees?.current_page || 1;
    const pageCount = employees?.last_page || 1;
    const perPage = employees?.per_page || 12;
    const total = employees?.total || 0;
    const startIndex = employees?.from || 0;
    const endIndex = employees?.to || 0;

    useEffect(() => {
        const query = search.trim();

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
                .get(route("attendance-monitoring.employees.suggestions"), {
                    params: {
                        search: query,
                        station_code: selectedStationCode,
                        station_name: selectedStationName,
                    },
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
    }, [search, selectedStationCode, selectedStationName]);

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

    const selectSuggestion = (suggestion) => {
        const nextValue = suggestion.name || "";

        setSearch(nextValue);
        setShowSuggestions(false);
        submitSearch(nextValue);
    };

    const clearSearch = () => {
        setSearch("");
        setSuggestionMatches([]);
        setShowSuggestions(false);
        submitSearch("");
    };

    return (
        <section className="w-full px-10 py-6">
            <SchoolList
                selectedStation={selectedStation}
                selectStation={selectStation}
                setStationSearch={setStationSearch}
                stationSearch={stationSearch}
                stations={stations}
            />

            <div className="w-full">
                <div className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm shadow-slate-200/50">
                    <div className="mb-5 flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
                        <div>
                            <h2 className="text-lg font-black">
                                {selectedStationName}
                            </h2>
                        </div>

                        <div className="flex items-center gap-3">
                            <div
                                ref={searchBoxRef}
                                className="relative w-[22.5rem]"
                            >
                                <form
                                    onSubmit={(event) => {
                                        event.preventDefault();
                                        submitSearch(search);
                                        setShowSuggestions(false);
                                    }}
                                    className="relative"
                                >
                                    <FloatingInput
                                        label="Search Employee"
                                        icon={Search}
                                        name="attendance_employee_search"
                                        value={search}
                                        onChange={(event) => {
                                            setSearch(event.target.value);
                                            setShowSuggestions(true);
                                        }}
                                        onKeyDown={(event) => {
                                            if (event.key === "Enter") {
                                                event.preventDefault();
                                                submitSearch(search);
                                                setShowSuggestions(false);
                                            }
                                        }}
                                    />
                                    {search ? (
                                        <button
                                            type="button"
                                            onClick={clearSearch}
                                            className="absolute right-3 top-1/2 flex h-5 w-5 -translate-y-1/2 items-center justify-center rounded-full bg-slate-100 text-slate-500 transition hover:bg-[#141b6d] hover:text-white"
                                            aria-label="Clear employee search"
                                        >
                                            <X className="h-3 w-3" />
                                        </button>
                                    ) : null}
                                </form>

                                {showSuggestions && search.trim() ? (
                                    <div className="absolute right-0 top-full z-50 mt-2 w-full overflow-hidden rounded-lg border border-slate-200 bg-white shadow-2xl">
                                        <div className="border-b bg-[#f4f6ff] px-3 py-2 text-xs font-semibold uppercase text-[#141b6d]">
                                            Results for "{search.trim()}"
                                        </div>

                                        <div className="max-h-72 overflow-y-auto">
                                            {suggestionsLoading ? (
                                                <div className="flex items-center gap-3 px-3 py-4 text-sm text-slate-500">
                                                    <span className="flex h-8 w-8 items-center justify-center rounded-full bg-[#eef1ff] text-[#141b6d]">
                                                        <Loader2 className="h-4 w-4 animate-spin" />
                                                    </span>
                                                    <div>
                                                        <div className="font-medium text-slate-700">
                                                            Searching
                                                            employees...
                                                        </div>
                                                        <div className="text-xs text-slate-400">
                                                            Checking names and
                                                            ID
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
                                                            className="flex w-full items-start justify-between gap-3 px-3 py-2 text-left text-sm transition hover:bg-[#f4f6ff]"
                                                        >
                                                            <div className="min-w-0">
                                                                <div className="truncate font-medium text-slate-800">
                                                                    {
                                                                        suggestion.name
                                                                    }
                                                                </div>
                                                                <div className="truncate text-xs text-slate-500">
                                                                    {suggestion.position ||
                                                                        "Employee"}
                                                                </div>
                                                            </div>

                                                            <span className="shrink-0 rounded-full bg-[#eef1ff] px-2 py-1 text-[11px] font-semibold text-[#141b6d]">
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
                        </div>
                    </div>

                    <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
                        {rows.map((row) => (
                            <EmployeeCard key={row.employee_id} row={row} />
                        ))}
                    </div>

                    {rows.length === 0 && (
                        <div className="py-16 text-center text-sm font-semibold text-slate-500">
                            No attendance records found.
                        </div>
                    )}

                    <div className="mt-7 flex items-center">
                        <div className="text-sm font-semibold text-slate-500">
                            Showing {total === 0 ? 0 : startIndex} to{" "}
                            {endIndex || Math.min(page * perPage, total)} of{" "}
                            {total}
                        </div>

                        <div className="ml-auto">
                            {pageCount > 1 && (
                                <Pagination>
                                    <PaginationPrevious
                                        onClick={() =>
                                            goToPage(Math.max(1, page - 1))
                                        }
                                    />
                                    <PaginationContent>
                                        {Array.from(
                                            { length: pageCount },
                                            (_, index) => (
                                                <PaginationItem key={index}>
                                                    <PaginationLink
                                                        isActive={
                                                            page === index + 1
                                                        }
                                                        onClick={() =>
                                                            goToPage(index + 1)
                                                        }
                                                    >
                                                        {index + 1}
                                                    </PaginationLink>
                                                </PaginationItem>
                                            ),
                                        )}
                                    </PaginationContent>
                                    <PaginationNext
                                        onClick={() =>
                                            goToPage(
                                                Math.min(pageCount, page + 1),
                                            )
                                        }
                                    />
                                </Pagination>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
};

export default EmployeeList;
