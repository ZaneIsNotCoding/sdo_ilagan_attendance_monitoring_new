import React, { useEffect, useState } from "react";
import {
    Pagination,
    PaginationContent,
    PaginationItem,
    PaginationLink,
    PaginationNext,
    PaginationPrevious,
} from "@/components/ui/pagination";

// highlight
function highlight(text, search) {
    if (!search) return text;

    const parts = text.split(new RegExp(`(${search})`, "gi"));

    return parts.map((part, i) =>
        part.toLowerCase() === search.toLowerCase() ? (
            <span key={i} className="bg-yellow-200 text-black px-1 rounded">
                {part}
            </span>
        ) : (
            part
        ),
    );
}

// debounce
function useDebounce(value, delay = 300) {
    const [debounced, setDebounced] = useState(value);

    useEffect(() => {
        const t = setTimeout(() => setDebounced(value), delay);
        return () => clearTimeout(t);
    }, [value]);

    return debounced;
}

export default function MainContent({
    users,
    selectedStation,
    employeeSearch,
    setEmployeeSearch,
    currentPage,
    setCurrentPage,
}) {
    const debouncedSearch = useDebounce(employeeSearch);
    const usersPerPage = 20;

    const filteredUsers = (
        selectedStation === "All Stations"
            ? users
            : users.filter((u) => u.station === selectedStation)
    ).filter((u) => {
        const term = debouncedSearch.toLowerCase();
        return (
            u.name.toLowerCase().includes(term) ||
            u.station.toLowerCase().includes(term)
        );
    });

    const totalPages = Math.ceil(filteredUsers.length / usersPerPage);

    const paginatedUsers = filteredUsers.slice(
        (currentPage - 1) * usersPerPage,
        currentPage * usersPerPage,
    );

    useEffect(() => {
        setCurrentPage(1);
    }, [debouncedSearch, selectedStation]);

    return (
        <div className="lg:col-span-3 bg-white rounded-2xl shadow p-6">
            {/* TOP BAR */}
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3 mb-5">
                {/* LEGEND */}
                <div className="flex flex-wrap gap-4 text-sm">
                    <span className="flex items-center gap-2">
                        <span className="w-2 h-2 bg-green-500 rounded-full"></span>
                        In
                    </span>
                    <span className="flex items-center gap-2">
                        <span className="w-2 h-2 bg-red-500 rounded-full"></span>
                        Out
                    </span>
                    <span className="flex items-center gap-2">
                        <span className="w-2 h-2 bg-yellow-400 rounded-full"></span>
                        With Slip
                    </span>
                    <span className="flex items-center gap-2">
                        <span className="w-2 h-2 bg-purple-500 rounded-full"></span>
                        On Travel
                    </span>
                </div>

                {/* SEARCH */}
                <div className="relative w-full md:w-64">
                    <input
                        type="text"
                        placeholder="Search employee or station..."
                        value={employeeSearch}
                        onChange={(e) => setEmployeeSearch(e.target.value)}
                        className="w-full pl-9 pr-3 py-2 text-xs rounded-full border bg-gray-50 focus:bg-white focus:ring-2 focus:ring-blue-500 focus:outline-none transition"
                    />

                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm">
                        🔍
                    </span>
                </div>
            </div>

            {/* GRID */}
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3">
                {paginatedUsers.map((user, i) => (
                    <div
                        key={i}
                        className={`relative rounded-xl p-3 text-center border transition hover:shadow-md ${
                            user.active
                                ? "bg-blue-600 text-white"
                                : "bg-gray-50"
                        }`}
                    >
                        {/* BADGES */}
                        <div className="absolute top-1 right-1 flex flex-col gap-1">
                            {user.withSlip && (
                                <span className="text-[9px] px-1.5 py-0.5 bg-yellow-400 text-black rounded">
                                    Slip
                                </span>
                            )}
                            {user.onTravel && (
                                <span className="text-[9px] px-1.5 py-0.5 bg-purple-500 text-white rounded">
                                    Travel
                                </span>
                            )}
                        </div>

                        <div className="w-10 h-10 mx-auto mb-2 rounded-full bg-white/30 flex items-center justify-center">
                            {user.name.charAt(0)}
                        </div>

                        <p className="text-xs truncate">
                            {highlight(user.name, debouncedSearch)}
                        </p>
                        <p className="text-[10px]">
                            {highlight(user.station, debouncedSearch)}
                        </p>
                        <p className="text-[10px]">{user.time}</p>
                    </div>
                ))}
            </div>

            {/* PAGINATION */}
            <div className="mt-6 flex justify-center">
                <Pagination>
                    <PaginationContent>
                        <PaginationItem>
                            <PaginationPrevious
                                href="#"
                                onClick={(e) => {
                                    e.preventDefault();
                                    if (currentPage > 1)
                                        setCurrentPage(currentPage - 1);
                                }}
                            />
                        </PaginationItem>

                        {Array.from({ length: totalPages }).map((_, i) => {
                            const page = i + 1;
                            return (
                                <PaginationItem key={page}>
                                    <PaginationLink
                                        href="#"
                                        isActive={currentPage === page}
                                        onClick={(e) => {
                                            e.preventDefault();
                                            setCurrentPage(page);
                                        }}
                                    >
                                        {page}
                                    </PaginationLink>
                                </PaginationItem>
                            );
                        })}

                        <PaginationItem>
                            <PaginationNext
                                href="#"
                                onClick={(e) => {
                                    e.preventDefault();
                                    if (currentPage < totalPages)
                                        setCurrentPage(currentPage + 1);
                                }}
                            />
                        </PaginationItem>
                    </PaginationContent>
                </Pagination>
            </div>
        </div>
    );
}
