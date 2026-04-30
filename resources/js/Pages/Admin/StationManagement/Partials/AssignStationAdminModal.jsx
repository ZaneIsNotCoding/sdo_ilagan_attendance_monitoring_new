import React, { useState, useEffect, useMemo } from "react";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import InputError from "@/Components/InputError";
import { router, usePage } from "@inertiajs/react";
import {
    Search,
    Check,
    X,
    UserRound,
    LandPlot,
    BadgeCheck,
    Mail,
    LockKeyhole,
    Users,
} from "lucide-react";
import FloatingInput from "@/components/floating-input";
import EmployeeAvatar from "@/Components/EmployeeAvatar";

const AssignStationAdminModal = ({
    open,
    setOpen,
    employees = [],
    stations = [],
    stationData = null,
}) => {
    const { errors = {} } = usePage().props;
    const selectedStationId = stationData?.station_id || stationData?.id || "";
    const selectedRole = stationData?.role || "school_admin";
    const selectedSource = stationData?.source || "station";

    const [selectedEmployee, setSelectedEmployee] = useState(null);
    const [search, setSearch] = useState("");

    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");

    const passwordChecks = useMemo(
        () => ({
            hasMinLength: password.length >= 6,
            hasUppercase: /[A-Z]/.test(password),
            hasNumber: /\d/.test(password),
        }),
        [password],
    );

    const isPasswordValid =
        passwordChecks.hasMinLength &&
        passwordChecks.hasUppercase &&
        passwordChecks.hasNumber;
    const doPasswordsMatch =
        password.length > 0 &&
        confirmPassword.length > 0 &&
        password === confirmPassword;

    // reset when opened
    useEffect(() => {
        if (open) {
            setSelectedEmployee(null);
            setSearch("");
            setEmail("");
            setPassword("");
            setConfirmPassword("");
        }
    }, [open]);

    // 🔥 resolve station name properly
    const stationName = useMemo(() => {
        return (
            stations.find((s) => {
                if (selectedSource === "sdo") {
                    return (
                        s.source === "sdo" &&
                        s.station_id == selectedStationId &&
                        s.role === selectedRole
                    );
                }
                return s.id == selectedStationId;
            })?.name || ""
        );
    }, [stations, selectedStationId, selectedRole, selectedSource]);

    // 🔥 filter employees safely
    const filteredEmployees = useMemo(() => {
        return employees
            .filter((emp) => {
                // optional: you can adjust this rule
                return !emp.station_id || emp.station_id == selectedStationId;
            })
            .filter((emp) =>
                `${emp.first_name} ${emp.last_name}`
                    .toLowerCase()
                    .includes(search.toLowerCase()),
            );
    }, [employees, selectedStationId, search]);

    const handleSubmit = () => {
        if (
            !selectedEmployee ||
            !stationData ||
            !email ||
            !isPasswordValid ||
            !doPasswordsMatch
        ) {
            return;
        }

        router.post(
            route("stationadmin.store"),
            {
                employee_id: selectedEmployee.id,

                station_id:
                    selectedSource === "sdo"
                        ? selectedStationId
                        : selectedStationId,

                role: selectedRole,
                email,
                password,
                password_confirmation: confirmPassword,
            },
            {
                onSuccess: () => {
                    setOpen(false);
                },
            },
        );
    };

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogContent className="max-w-4xl rounded-2xl p-0 overflow-hidden">
                {/* HEADER */}
                <div className="bg-gradient-to-r from-blue-600 to-blue-500 p-5 text-white">
                    <DialogHeader>
                        <DialogTitle className="flex items-center gap-2 text-white">
                            <BadgeCheck className="w-5 h-5" />
                            Assign Station Admin
                        </DialogTitle>

                        <DialogDescription className="text-blue-100">
                            Select an employee to assign as station
                            administrator.
                        </DialogDescription>
                    </DialogHeader>
                </div>

                {/* BODY */}
                <div className="grid gap-4 px-5 pb-5 pt-1 lg:grid-cols-[1.15fr_0.85fr]">
                    <div className="space-y-4">
                        {/* Station Info */}
                        <div className="flex items-center gap-4 rounded-lg border bg-blue-50 p-3">
                            <LandPlot className="w-4 h-4 text-blue-600" />
                            <span className="text-sm text-gray-500">
                                Station:
                            </span>
                            <span className="rounded-full bg-blue-100 px-3 py-1 text-sm font-semibold text-blue-700">
                                {stationName || "Not selected"}
                            </span>
                        </div>

                        {/* Search */}
                        <FloatingInput
                            label="Search employee"
                            icon={Search}
                            name="search"
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                        />

                        {/* EMPLOYEE LIST */}
                        <div className="rounded-xl border border-slate-200 bg-white shadow-sm">
                            <div className="flex items-center justify-between border-b border-slate-100 px-4 py-3">
                                <div className="flex items-center gap-2 text-sm font-medium text-slate-700">
                                    <Users className="h-4 w-4 text-blue-600" />
                                    Employees
                                </div>
                                <div className="text-xs text-slate-400">
                                    {filteredEmployees.length} found
                                </div>
                            </div>

                            <div className="h-[20rem] space-y-2 overflow-y-auto p-2">
                                {filteredEmployees.length > 0 ? (
                                    filteredEmployees.map((emp) => {
                                        const fullName =
                                            `${emp.first_name || ""} ${emp.middle_name || ""} ${emp.last_name || ""}`
                                                .replace(/\s+/g, " ")
                                                .trim();
                                        const isSelected =
                                            String(selectedEmployee?.id) ===
                                            String(emp.id);

                                        return (
                                            <button
                                                key={emp.id}
                                                type="button"
                                                onClick={() =>
                                                    setSelectedEmployee(emp)
                                                }
                                                className={`flex w-full items-center justify-between rounded-xl px-3 py-2 text-left text-sm transition ${
                                                    isSelected
                                                        ? "bg-blue-100 text-blue-900"
                                                        : "hover:bg-blue-50"
                                                }`}
                                            >
                                                <div className="flex min-w-0 items-center gap-3">
                                                    <EmployeeAvatar
                                                        employee={emp}
                                                    />

                                                    <div className="min-w-0">
                                                        <div className="truncate font-medium text-slate-800">
                                                            {fullName || "-"}
                                                        </div>
                                                        <div className="truncate text-xs text-slate-500">
                                                            {emp.position ||
                                                                "-"}
                                                        </div>
                                                    </div>
                                                </div>

                                                {isSelected ? (
                                                    <div className="ml-3 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-blue-600">
                                                        <Check className="h-3 w-3 text-white" />
                                                    </div>
                                                ) : null}
                                            </button>
                                        );
                                    })
                                ) : (
                                    <div className="py-6 text-center text-sm text-slate-500">
                                        No employees found
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>

                    <div className="space-y-4">
                        {/* SELECTED */}
                        <div className="rounded-xl border border-blue-100 bg-blue-50 p-4">
                            {selectedEmployee ? (
                                <div className="flex items-center gap-3">
                                    <UserRound className="w-5 h-5 text-blue-600" />

                                    <div>
                                        <div className="text-sm font-semibold">
                                            {selectedEmployee.first_name}{" "}
                                            {selectedEmployee.last_name}
                                        </div>
                                        <div className="text-xs text-gray-500">
                                            {selectedEmployee.position}
                                        </div>
                                    </div>
                                </div>
                            ) : (
                                <div className="text-center text-sm text-gray-400">
                                    No employee selected
                                </div>
                            )}
                        </div>

                        <div className="rounded-2xl border border-blue-100 bg-gradient-to-br from-slate-50 via-white to-blue-50/80 p-4 shadow-sm">
                            <div className="mb-3">
                                <div className="flex items-center justify-between gap-3">
                                    <p className="text-sm font-semibold text-slate-800">
                                        Login Credentials
                                    </p>

                                    <span className="rounded-full bg-blue-100 px-2.5 py-1 text-[11px] font-semibold text-blue-700">
                                        {selectedEmployee
                                            ? "Ready to fill"
                                            : "Select employee first"}
                                    </span>
                                </div>

                                <p className="text-xs text-slate-500">
                                    Enter the admin account details for the
                                    selected employee.
                                </p>
                            </div>

                            <div className="space-y-3">
                                <div>
                                    <FloatingInput
                                        label="Admin email"
                                        icon={Mail}
                                        name="email"
                                        value={email}
                                        disabled={!selectedEmployee}
                                        onChange={(e) =>
                                            setEmail(e.target.value)
                                        }
                                    />
                                    <InputError
                                        message={errors.email}
                                        className="mt-2"
                                    />
                                </div>

                                <div>
                                    <FloatingInput
                                        label="Password"
                                        type="password"
                                        icon={LockKeyhole}
                                        name="password"
                                        value={password}
                                        disabled={!selectedEmployee}
                                        onChange={(e) =>
                                            setPassword(e.target.value)
                                        }
                                    />
                                    <InputError
                                        message={errors.password}
                                        className="mt-2"
                                    />
                                </div>

                                <div>
                                    <FloatingInput
                                        label="Confirm password"
                                        type="password"
                                        icon={LockKeyhole}
                                        name="password_confirmation"
                                        value={confirmPassword}
                                        disabled={!selectedEmployee}
                                        onChange={(e) =>
                                            setConfirmPassword(e.target.value)
                                        }
                                    />
                                    <InputError
                                        message={
                                            errors.password_confirmation ||
                                            (confirmPassword &&
                                            password !== confirmPassword
                                                ? "Passwords do not match."
                                                : "")
                                        }
                                        className="mt-2"
                                    />
                                </div>
                            </div>

                            <div className="mt-3 rounded-xl border border-slate-200 bg-white/80 p-3">
                                <p className="text-[11px] font-semibold uppercase tracking-[0.08em] text-slate-500">
                                    Password requirements
                                </p>

                                <div className="mt-2 space-y-2">
                                    <div
                                        className={`flex items-center gap-2 text-xs ${
                                            passwordChecks.hasMinLength
                                                ? "text-emerald-600"
                                                : "text-slate-500"
                                        }`}
                                    >
                                        {passwordChecks.hasMinLength ? (
                                            <Check className="h-3.5 w-3.5" />
                                        ) : (
                                            <X className="h-3.5 w-3.5" />
                                        )}
                                        <span>At least 6 characters</span>
                                    </div>

                                    <div
                                        className={`flex items-center gap-2 text-xs ${
                                            passwordChecks.hasUppercase
                                                ? "text-emerald-600"
                                                : "text-slate-500"
                                        }`}
                                    >
                                        {passwordChecks.hasUppercase ? (
                                            <Check className="h-3.5 w-3.5" />
                                        ) : (
                                            <X className="h-3.5 w-3.5" />
                                        )}
                                        <span>
                                            At least one uppercase letter
                                        </span>
                                    </div>

                                    <div
                                        className={`flex items-center gap-2 text-xs ${
                                            passwordChecks.hasNumber
                                                ? "text-emerald-600"
                                                : "text-slate-500"
                                        }`}
                                    >
                                        {passwordChecks.hasNumber ? (
                                            <Check className="h-3.5 w-3.5" />
                                        ) : (
                                            <X className="h-3.5 w-3.5" />
                                        )}
                                        <span>At least one number</span>
                                    </div>

                                    <div
                                        className={`flex items-center gap-2 text-xs ${
                                            doPasswordsMatch
                                                ? "text-emerald-600"
                                                : "text-slate-500"
                                        }`}
                                    >
                                        {doPasswordsMatch ? (
                                            <Check className="h-3.5 w-3.5" />
                                        ) : (
                                            <X className="h-3.5 w-3.5" />
                                        )}
                                        <span>Passwords must match</span>
                                    </div>
                                </div>
                            </div>

                            <p className="mt-3 text-[11px] leading-4 text-slate-500">
                                These credentials will be used for the
                                employee's station administrator access.
                            </p>
                        </div>
                    </div>

                    {/* ACTIONS */}
                    <div className="flex justify-end gap-2 pt-2 lg:col-span-2">
                        <Button
                            variant="outline"
                            onClick={() => setOpen(false)}
                        >
                            Cancel
                        </Button>

                        <Button
                            onClick={handleSubmit}
                            disabled={
                                !selectedEmployee ||
                                !stationData ||
                                !email ||
                                !isPasswordValid ||
                                !doPasswordsMatch
                            }
                            className="bg-blue-600 hover:bg-blue-700 text-white"
                        >
                            Assign Admin
                        </Button>
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    );
};

export default AssignStationAdminModal;
