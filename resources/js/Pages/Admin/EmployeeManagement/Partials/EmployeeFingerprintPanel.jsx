import React, { useEffect, useRef, useState } from "react";
import axios from "axios";
import { Button } from "@/components/ui/button";
import { Fingerprint, Loader2, Search, User, X } from "lucide-react";
import {
    AlertDialog,
    AlertDialogTrigger,
    AlertDialogContent,
    AlertDialogHeader,
    AlertDialogTitle,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogCancel,
} from "@/components/ui/alert-dialog";

import FloatingInput from "@/components/floating-input";

const EmployeeFingerprintPanel = ({
    employees = [],
    selectedEmployee,
    setSelectedEmployee,
    selectedEmployeeRecord: selectedEmployeeRecordProp = null,
    setSelectedEmployeeRecord = () => {},
    onSelectEmployee = null,
    onClearEmployee = null,
    registerFingerprint,
    scanning,
    scanStatus,
    scanMessage,
    cancelScan,
    availableFingers,
    testOpen,
    setTestOpen,
    testMessage = "Waiting for scan...",
    testStatus = "idle",
    startTestFingerprint,
    getFingerprintColor = () => "text-gray-400",
}) => {
    const [searchValue, setSearchValue] = useState("");
    const [suggestionMatches, setSuggestionMatches] = useState([]);
    const [suggestionsLoading, setSuggestionsLoading] = useState(false);
    const [showSuggestions, setShowSuggestions] = useState(false);
    const searchBoxRef = useRef(null);
    const suggestionRequestRef = useRef(0);
    const testStartedRef = useRef(false);
    const selectedEmployeeRecord =
        selectedEmployeeRecordProp ||
        employees.find((emp) => String(emp.id) === String(selectedEmployee)) ||
        null;
    const selectedOfficeName =
        selectedEmployeeRecord?.office?.name || "Department";
    const fingerprintStatusLabel = selectedEmployeeRecord
        ? `${availableFingers(selectedEmployee)} Available Fingerprint${
              availableFingers(selectedEmployee) !== 1 ? "s" : ""
          }`
        : "Choose an employee to begin";
    const panelMessage =
        scanStatus === "error"
            ? scanMessage
            : scanStatus === "success"
              ? scanMessage
              : scanning
                ? scanMessage
                : fingerprintStatusLabel;

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
        if (!testOpen) {
            testStartedRef.current = false;
            return;
        }

        if (testStartedRef.current) {
            return;
        }

        testStartedRef.current = true;
        startTestFingerprint();
    }, [testOpen, startTestFingerprint]);

    useEffect(() => {
        if (!showSuggestions) {
            setSuggestionMatches([]);
            setSuggestionsLoading(false);
            return;
        }

        const query = searchValue.trim();
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

        return () => clearTimeout(timeout);
    }, [searchValue, showSuggestions]);

    return (
        <div className="overflow-hidden rounded-2xl border border-blue-100 bg-white shadow-lg">
            <div className="bg-blue-700 px-5 py-4 text-white">
                <div className="flex items-start gap-4">
                    <div className="flex h-11 w-11 items-center justify-center rounded-3xl bg-white/15 backdrop-blur">
                        <Fingerprint className="h-6 w-6" />
                    </div>
                    <div>
                        <h2 className="text-lg font-bold">
                            Employee Fingerprint Registration
                        </h2>
                        <p className="text-sm text-blue-100">
                            Register and verify fingerprints for employees.
                        </p>
                    </div>
                </div>
            </div>

            <div className="px-6 py-4">
                <div className="relative flex items-start gap-3">
                    <div ref={searchBoxRef} className="w-full">
                        <FloatingInput
                            label="Search Employee"
                            icon={Search}
                            name="fingerprint_employee_search"
                            value={searchValue}
                            onChange={(e) => {
                                setSearchValue(e.target.value);
                                setShowSuggestions(true);
                            }}
                            onFocus={() => setShowSuggestions(true)}
                            onClick={() => setShowSuggestions(true)}
                        />

                        {showSuggestions ? (
                            <div className="absolute left-0 right-0 top-full z-50 mt-2 overflow-hidden rounded-xl border border-slate-200 bg-white shadow-2xl">
                                <div className="border-b bg-slate-50 px-3 py-2 text-xs font-semibold uppercase tracking-wide text-slate-500">
                                    Employees
                                </div>

                                <div className="max-h-52 overflow-y-auto">
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
                                                    Checking available
                                                    fingerprints
                                                </div>
                                            </div>
                                        </div>
                                    ) : suggestionMatches.length > 0 ? (
                                        <div className="py-1">
                                            {suggestionMatches.slice(0, 10).map((emp) => (
                                                <button
                                                    key={emp.id}
                                                    type="button"
                                                    onMouseDown={() => {
                                                        setSelectedEmployee(
                                                            emp.id,
                                                        );
                                                        setSelectedEmployeeRecord(
                                                            emp,
                                                        );
                                                        onSelectEmployee?.(emp);
                                                        setSearchValue("");
                                                        setShowSuggestions(
                                                            false,
                                                        );
                                                    }}
                                                    className="flex w-full items-start justify-between gap-3 px-3 py-2 text-left text-sm transition hover:bg-blue-50"
                                                >
                                                    <div className="min-w-0">
                                                        <div className="truncate font-medium text-slate-800">
                                                            {emp.full_name ||
                                                                emp.label}
                                                        </div>
                                                        <div className="truncate text-xs text-slate-500">
                                                            {emp.meta ||
                                                                emp.office
                                                                    ?.name ||
                                                                "No Office"}
                                                        </div>
                                                        <div className="mt-1 text-xs font-medium text-blue-600">
                                                            {
                                                                emp.available_fingers
                                                            }{" "}
                                                            available
                                                            fingerprint
                                                            {emp.available_fingers !==
                                                            1
                                                                ? "s"
                                                                : ""}
                                                        </div>
                                                    </div>

                                                    <span className="shrink-0 rounded-full bg-blue-100 px-2 py-1 text-[11px] font-semibold text-blue-700">
                                                        Select
                                                    </span>
                                                </button>
                                            ))}
                                        </div>
                                    ) : (
                                        <div className="px-3 py-4 text-sm text-slate-500">
                                            No employee found.
                                        </div>
                                    )}
                                </div>
                            </div>
                        ) : null}
                    </div>

                    <Button
                        onClick={() => {
                            setSelectedEmployee("");
                            setSelectedEmployeeRecord(null);
                            onClearEmployee?.();
                            setSearchValue("");
                            setShowSuggestions(false);
                        }}
                        className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl border border-red-200 bg-white text-red-500 shadow-sm transition hover:bg-red-100"
                        aria-label="Clear selected employee"
                    >
                        <X className="h-4 w-4" />
                    </Button>
                </div>

                <div className="mt-7 grid min-h-[150px] grid-cols-[1fr_auto_1fr] items-start gap-6">
                    <div className="flex min-h-[150px] flex-col items-center text-center">
                        <div className="flex h-28 w-28 items-center justify-center overflow-hidden rounded-full bg-gradient-to-br from-blue-500 to-sky-400 text-white shadow-[0_14px_30px_-18px_rgba(59,130,246,0.85)] ring-4 ring-white">
                            {selectedEmployeeRecord?.profile_img ? (
                                <img
                                    src={`/storage/${selectedEmployeeRecord.profile_img}`}
                                    alt={selectedEmployeeRecord.full_name}
                                    className="h-full w-full object-cover"
                                />
                            ) : (
                                <User className="h-12 w-12" />
                            )}
                        </div>
                        <div className="mt-5 flex min-h-[35px] w-full max-w-[220px] flex-col items-center justify-start gap-2">
                            <p className="line-clamp-2 text-sm font-semibold leading-5 text-slate-900">
                                {selectedEmployeeRecord
                                    ? selectedEmployeeRecord.full_name
                                    : "Select Employee"}
                            </p>
                            <p className="line-clamp-2 text-sm leading-5 text-slate-500">
                                {selectedOfficeName}
                            </p>
                        </div>
                    </div>

                    <div className="h-[205px] w-px self-center bg-slate-200" />

                    <div className="flex min-h-[150px] flex-col items-center text-center">
                        <div className="flex h-28 w-28 items-center justify-center rounded-full bg-slate-100 text-slate-500 ring-4 ring-white">
                            <Fingerprint
                                className={`h-16 w-16 transition-all duration-300 ${getFingerprintColor()}`}
                            />
                        </div>
                        <div className="mt-5 flex min-h-[35px] w-full max-w-[220px] items-start justify-center">
                            <p className="text-sm leading-5 text-slate-700">
                                {selectedEmployeeRecord
                                    ? panelMessage
                                    : "Choose an employee to begin"}
                            </p>
                        </div>
                    </div>
                </div>

                <div className="mt-8 flex w-full gap-4">
                    <Button
                        variant="green"
                        onClick={() => {
                            if (scanning) cancelScan();
                            else registerFingerprint();
                        }}
                        disabled={!selectedEmployee}
                        className="h-10 flex-1 rounded-xl text-sm font-semibold"
                    >
                        {scanning
                            ? "Cancel"
                            : scanStatus === "success"
                              ? "Register Another"
                              : scanStatus === "error"
                                ? "Retry"
                                : "Register Fingerprint"}
                    </Button>

                    <AlertDialog
                        open={testOpen}
                        onOpenChange={setTestOpen}
                    >
                        <AlertDialogTrigger asChild>
                            <Button
                                variant="blue"
                                className="h-10 flex-1 rounded-xl text-sm font-semibold"
                            >
                                Test Fingerprint
                            </Button>
                        </AlertDialogTrigger>

                        <AlertDialogContent>
                            <AlertDialogHeader>
                                <AlertDialogTitle>
                                    Test Fingerprint
                                </AlertDialogTitle>
                                <AlertDialogDescription>
                                    Place your finger on the scanner. It will
                                    check against registered employees.
                                </AlertDialogDescription>
                            </AlertDialogHeader>

                            <div className="flex flex-col items-center py-4">
                                <Fingerprint
                                    className={`w-20 h-20 ${
                                        testStatus === "scanning"
                                            ? "text-blue-500 animate-pulse"
                                            : testStatus === "success"
                                              ? "text-green-500 animate-bounce"
                                              : "text-red-500"
                                    }`}
                                />
                                <p className="mt-3 text-sm text-gray-700">
                                    {testMessage}
                                </p>
                            </div>

                            <AlertDialogFooter>
                                <AlertDialogCancel>Close</AlertDialogCancel>
                            </AlertDialogFooter>
                        </AlertDialogContent>
                    </AlertDialog>
                </div>
            </div>
        </div>
    );
};

export default EmployeeFingerprintPanel;
