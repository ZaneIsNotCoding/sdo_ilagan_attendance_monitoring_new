"use client";

import React, { useEffect, useRef, useState } from "react";
import axios from "axios";
import { Search, UserCheck } from "lucide-react";
import FloatingInput from "@/components/floating-input";

export default function PublicEmployeePicker({
    value = "",
    selectedEmployeeId = "",
    onSearchChange,
    onSelect,
    error,
}) {
    const [query, setQuery] = useState(value || "");
    const [matches, setMatches] = useState([]);
    const [loading, setLoading] = useState(false);
    const [focused, setFocused] = useState(false);
    const requestRef = useRef(0);
    const wrapperRef = useRef(null);

    useEffect(() => {
        setQuery(value || "");
    }, [value]);

    useEffect(() => {
        const trimmedQuery = query.trim();

        if (!trimmedQuery || selectedEmployeeId) {
            requestRef.current += 1;
            setMatches([]);
            setLoading(false);
            return;
        }

        setLoading(true);
        const requestId = requestRef.current + 1;
        requestRef.current = requestId;

        const timeout = window.setTimeout(() => {
            axios
                .get(route("public.employees.search"), {
                    params: { search: trimmedQuery },
                })
                .then((response) => {
                    if (requestRef.current !== requestId) return;
                    setMatches(response.data || []);
                })
                .catch(() => {
                    if (requestRef.current !== requestId) return;
                    setMatches([]);
                })
                .finally(() => {
                    if (requestRef.current !== requestId) return;
                    setLoading(false);
                });
        }, 250);

        return () => window.clearTimeout(timeout);
    }, [query, selectedEmployeeId]);

    useEffect(() => {
        const closeSuggestions = (event) => {
            if (
                wrapperRef.current &&
                !wrapperRef.current.contains(event.target)
            ) {
                setFocused(false);
            }
        };

        document.addEventListener("mousedown", closeSuggestions);

        return () => document.removeEventListener("mousedown", closeSuggestions);
    }, []);

    const handleChange = (event) => {
        const nextValue = event.target.value;
        setQuery(nextValue);
        onSearchChange?.(nextValue);
        setFocused(true);
    };

    const handleSelect = (employee) => {
        setQuery(employee.full_name || "");
        setFocused(false);
        setMatches([]);
        onSelect?.(employee);
    };

    const showSuggestions =
        focused && !selectedEmployeeId && (loading || matches.length > 0);

    return (
        <div ref={wrapperRef} className="relative">
            <FloatingInput
                label="Search employee name or ID"
                icon={Search}
                name="employee_search"
                value={query}
                onChange={handleChange}
                onFocus={() => setFocused(true)}
            />

            {selectedEmployeeId && (
                <div className="mt-2 inline-flex items-center gap-2 rounded-lg bg-emerald-50 px-3 py-2 text-xs font-semibold text-emerald-700">
                    <UserCheck className="h-4 w-4" />
                    Employee ID #{selectedEmployeeId} selected
                </div>
            )}

            {error && <p className="mt-1 text-sm text-red-500">{error}</p>}

            {showSuggestions && (
                <div className="absolute left-0 top-full z-50 mt-2 w-full overflow-hidden rounded-xl border border-slate-200 bg-white shadow-2xl">
                    <div className="border-b bg-slate-50 px-3 py-2 text-xs font-semibold uppercase tracking-wide text-slate-500">
                        {loading ? "Searching..." : "Select employee"}
                    </div>

                    {!loading &&
                        matches.map((employee) => (
                            <button
                                key={employee.id}
                                type="button"
                                className="flex w-full items-start justify-between gap-3 px-3 py-2 text-left text-sm transition hover:bg-blue-50"
                                onClick={() => handleSelect(employee)}
                            >
                                <div className="min-w-0">
                                    <div className="truncate font-medium text-slate-800">
                                        {employee.full_name}
                                    </div>
                                    <div className="truncate text-xs text-slate-500">
                                        {[
                                            employee.position,
                                            employee.office,
                                            employee.station,
                                        ]
                                            .filter(Boolean)
                                            .join(" | ")}
                                    </div>
                                </div>

                                <span className="shrink-0 rounded-full bg-blue-100 px-2 py-1 text-[11px] font-semibold text-blue-700">
                                    ID #{employee.id}
                                </span>
                            </button>
                        ))}
                </div>
            )}
        </div>
    );
}
