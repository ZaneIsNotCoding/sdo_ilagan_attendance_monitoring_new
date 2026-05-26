"use client";

import React, { useEffect } from "react";
import { useForm } from "@inertiajs/react";

import FloatingInput from "@/components/floating-input";

import {
    User,
    Briefcase,
    Building2,
    FileText,
    MapPin,
    CalendarDays,
} from "lucide-react";

export default function LocatorSlipForm({ onClose, employee }) {
    const employeeName = employee?.full_name || employee?.name || "";
    const employeePosition = employee?.position || "";
    const employeeStation =
        employee?.station?.name || employee?.permanent_station || "";

    const { data, setData, post, processing, reset, errors } = useForm({
        employee_id: "",
        employee_name: "",
        position: "",
        permanent_station: "",
        purpose_of_travel: "",
        destination: "",
        travel_datetime: "",
        travel_type: "",
    });

    const submit = (e) => {
        e.preventDefault();

        post("/employee/locator-slip", {
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
                        Locator Slip
                    </h2>
                    <p className="text-sm text-gray-500">
                        Fill out the details below
                    </p>
                </div>

                <form onSubmit={submit} className="space-y-5">
                    {/* Employee Info */}
                    <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                        <FloatingInput
                            label="Name"
                            icon={User}
                            name="employee_name"
                            value={data.employee_name}
                            onChange={(e) =>
                                setData("employee_name", e.target.value)
                            }
                        />

                        <FloatingInput
                            label="Position / Designation"
                            icon={Briefcase}
                            name="position"
                            value={data.position}
                            onChange={(e) =>
                                setData("position", e.target.value)
                            }
                        />

                        <div className="md:col-span-2">
                            <FloatingInput
                                label="Permanent Station"
                                icon={Building2}
                                name="permanent_station"
                                value={data.permanent_station}
                                onChange={(e) =>
                                    setData("permanent_station", e.target.value)
                                }
                            />
                        </div>
                    </div>

                    {/* Purpose */}
                    <FloatingInput
                        label="Purpose of Travel"
                        icon={FileText}
                        name="purpose_of_travel"
                        value={data.purpose_of_travel}
                        onChange={(e) =>
                            setData("purpose_of_travel", e.target.value)
                        }
                    />

                    {/* Travel Type */}
                    <div>
                        <label className="text-sm font-medium text-gray-700">
                            Travel Type
                        </label>

                        <div className="mt-3 flex gap-6 rounded-xl border p-4">
                            <label className="flex cursor-pointer items-center gap-2">
                                <input
                                    type="radio"
                                    name="travel_type"
                                    value="official_business"
                                    checked={
                                        data.travel_type === "official_business"
                                    }
                                    onChange={(e) =>
                                        setData("travel_type", e.target.value)
                                    }
                                />
                                Official Business
                            </label>

                            <label className="flex cursor-pointer items-center gap-2">
                                <input
                                    type="radio"
                                    name="travel_type"
                                    value="official_time"
                                    checked={
                                        data.travel_type === "official_time"
                                    }
                                    onChange={(e) =>
                                        setData("travel_type", e.target.value)
                                    }
                                />
                                Official Time
                            </label>
                        </div>

                        {errors.travel_type && (
                            <p className="mt-1 text-sm text-red-500">
                                {errors.travel_type}
                            </p>
                        )}
                    </div>

                    {/* Date + Destination */}
                    <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                        <FloatingInput
                            label="Date and Time"
                            icon={CalendarDays}
                            type="datetime-local"
                            name="travel_datetime"
                            value={data.travel_datetime}
                            onChange={(e) =>
                                setData("travel_datetime", e.target.value)
                            }
                        />

                        <FloatingInput
                            label="Destination"
                            icon={MapPin}
                            name="destination"
                            value={data.destination}
                            onChange={(e) =>
                                setData("destination", e.target.value)
                            }
                        />
                    </div>

                    {/* Errors */}
                    {Object.keys(errors).length > 0 && (
                        <div className="space-y-1">
                            {Object.entries(errors).map(([key, value]) => (
                                <p key={key} className="text-sm text-red-500">
                                    {value}
                                </p>
                            ))}
                        </div>
                    )}

                    {/* Buttons */}
                    <div className="flex justify-between gap-3 border-t pt-4">
                        <div className="flex gap-2">
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
                                className="rounded-lg bg-blue-600 px-5 py-2 text-white disabled:opacity-50"
                            >
                                {processing ? "Submitting..." : "Submit"}
                            </button>
                        </div>
                    </div>
                </form>
            </div>
        </div>
    );
}

