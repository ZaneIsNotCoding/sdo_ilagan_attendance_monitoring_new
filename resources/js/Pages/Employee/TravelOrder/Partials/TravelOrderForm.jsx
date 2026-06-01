"use client";

import React from "react";
import { useForm } from "@inertiajs/react";
import FloatingInput from "@/components/floating-input";
import PublicEmployeePicker from "../../Shared/PublicEmployeePicker";
import {
    User,
    Briefcase,
    Building2,
    FileText,
    Users,
    CalendarDays,
    MapPin,
    Wallet,
} from "lucide-react";

export default function TravelAuthorityForm({ onClose, employee }) {
    const employeeName = employee?.full_name || employee?.name || "";
    const employeePosition = employee?.position || "";
    const employeeStation =
        employee?.station?.name || employee?.permanent_station || "";

    const { data, setData, post, processing, reset, errors } = useForm({
        employee_id: employee?.id || "",
        employee_name: employeeName,
        position: employeePosition,
        permanent_station: employeeStation,
        purpose_of_travel: "",
        host_of_activity: "",
        inclusive_dates: "",
        destination: "",
        fund_source: "",
    });

    const clearSelectedEmployee = (name) => {
        setData("employee_id", "");
        setData("employee_name", name);
        setData("position", "");
        setData("permanent_station", "");
    };

    const selectEmployee = (selectedEmployee) => {
        setData("employee_id", selectedEmployee.id);
        setData("employee_name", selectedEmployee.full_name || "");
        setData("position", selectedEmployee.position || "");
        setData("permanent_station", selectedEmployee.station || "");
    };

    const submit = (e) => {
        e.preventDefault();

        post("/employee/travel-order", {
            onSuccess: () => {
                reset();
                onClose();
            },
            onError: (err) => console.log(err),
        });
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm">
            <div className="max-h-[90vh] w-[720px] overflow-y-auto rounded-2xl bg-white p-8 shadow-2xl">
                <div className="mb-6 text-center">
                    <h2 className="text-2xl font-bold text-gray-800">
                        Travel Authority
                    </h2>
                    <p className="text-sm text-gray-500">
                        Fill out travel details
                    </p>
                </div>

                <form onSubmit={submit} className="space-y-5">
                    <PublicEmployeePicker
                        value={data.employee_name}
                        selectedEmployeeId={data.employee_id}
                        onSearchChange={clearSelectedEmployee}
                        onSelect={selectEmployee}
                        error={errors.employee_id}
                    />

                    {/* Employee Info */}
                    <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                        <FloatingInput
                            label="Name"
                            icon={User}
                            name="employee_name"
                            value={data.employee_name}
                            onChange={() => {}}
                            readOnly
                        />
                        {errors.employee_name && (
                            <p className="text-sm text-red-500">
                                {errors.employee_name}
                            </p>
                        )}

                        <FloatingInput
                            label="Position / Designation"
                            icon={Briefcase}
                            name="position"
                            value={data.position}
                            onChange={() => {}}
                            readOnly
                        />
                        {errors.position && (
                            <p className="text-sm text-red-500">
                                {errors.position}
                            </p>
                        )}

                        <div className="md:col-span-2">
                            <FloatingInput
                                label="Permanent Station"
                                icon={Building2}
                                name="permanent_station"
                                value={data.permanent_station}
                                onChange={() => {}}
                                readOnly
                            />
                            {errors.permanent_station && (
                                <p className="text-sm text-red-500">
                                    {errors.permanent_station}
                                </p>
                            )}
                        </div>
                    </div>

                    {/* Purpose */}
                    <div>
                        <FloatingInput
                            label="Purpose of Travel"
                            icon={FileText}
                            name="purpose_of_travel"
                            value={data.purpose_of_travel}
                            onChange={(e) =>
                                setData("purpose_of_travel", e.target.value)
                            }
                        />
                        {errors.purpose_of_travel && (
                            <p className="text-sm text-red-500">
                                {errors.purpose_of_travel}
                            </p>
                        )}
                    </div>

                    {/* Host */}
                    <div>
                        <FloatingInput
                            label="Host of Activity"
                            icon={Users}
                            name="host_of_activity"
                            value={data.host_of_activity}
                            onChange={(e) =>
                                setData("host_of_activity", e.target.value)
                            }
                        />
                    </div>

                    {/* Dates */}
                    <div>
                        <FloatingInput
                            label="Inclusive Dates"
                            icon={CalendarDays}
                            type="date"
                            name="inclusive_dates"
                            value={data.inclusive_dates}
                            onChange={(e) =>
                                setData("inclusive_dates", e.target.value)
                            }
                        />
                    </div>

                    {/* Destination + Fund */}
                    <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                        <FloatingInput
                            label="Destination"
                            icon={MapPin}
                            name="destination"
                            value={data.destination}
                            onChange={(e) =>
                                setData("destination", e.target.value)
                            }
                        />

                        <FloatingInput
                            label="Fund Source"
                            icon={Wallet}
                            name="fund_source"
                            value={data.fund_source}
                            onChange={(e) =>
                                setData("fund_source", e.target.value)
                            }
                        />
                    </div>

                    {/* Buttons */}
                    <div className="flex justify-between border-t pt-4">
                        <button
                            type="button"
                            onClick={onClose}
                            className="rounded-lg border px-4 py-2"
                        >
                            Cancel
                        </button>

                        <button
                            type="submit"
                            disabled={processing}
                            className="rounded-lg bg-blue-600 px-5 py-2 text-white"
                        >
                            {processing ? "Submitting..." : "Submit"}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
