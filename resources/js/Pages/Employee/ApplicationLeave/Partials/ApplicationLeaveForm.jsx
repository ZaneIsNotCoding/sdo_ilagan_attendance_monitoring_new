"use client";

import React from "react";
import { useForm } from "@inertiajs/react";
import {
    Briefcase,
    Building2,
    CalendarDays,
    Coins,
    FileText,
    Hash,
    User,
} from "lucide-react";
import FloatingInput from "@/components/floating-input";

const leaveTypes = [
    "Vacation Leave",
    "Mandatory/Forced Leave",
    "Sick Leave",
    "Maternity Leave",
    "Paternity Leave",
    "Special Privilege Leave",
    "Solo Parent Leave",
    "Study Leave",
    "10-Day VAWC Leave",
    "Rehabilitation Privilege",
    "Special Leave Benefits for Women",
    "Special Emergency (Calamity) Leave",
    "Adoption Leave",
    "Others",
];

export default function ApplicationLeaveForm({ onClose, employee }) {
    const employeeName = employee?.full_name || employee?.name || "";
    const employeePosition = employee?.position || "";
    const employeeOffice =
        employee?.office?.name ||
        employee?.department ||
        employee?.station?.name ||
        "";

    const { data, setData, post, processing, reset, errors } = useForm({
        employee_name: employeeName,
        office_department: employeeOffice,
        date_of_filing: new Date().toISOString().slice(0, 10),
        position: employeePosition,
        salary: "",
        type_of_leave: "",
        type_of_leave_other: "",
        leave_location: "",
        leave_location_details: "",
        sick_leave_location: "",
        illness: "",
        women_illness: "",
        study_leave_purpose: "",
        other_purpose: "",
        working_days: "",
        inclusive_dates: "",
        commutation: "not_requested",
    });

    const submit = (e) => {
        e.preventDefault();

        post(route("application-leave.store"), {
            onSuccess: () => {
                reset();
                onClose();
            },
        });
    };

    const errorText = (field) =>
        errors[field] ? (
            <p className="mt-1 text-sm text-red-500">{errors[field]}</p>
        ) : null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4 backdrop-blur-sm">
            <div className="max-h-[90vh] w-full max-w-5xl overflow-y-auto rounded-2xl bg-white p-6 shadow-2xl sm:p-8">
                <div className="mb-6 text-center">
                    <h2 className="text-2xl font-bold text-gray-800">
                        Application for Leave
                    </h2>
                    <p className="text-sm text-gray-500">
                        Fill out Civil Service Form No. 6 details
                    </p>
                </div>

                <form onSubmit={submit} className="space-y-6">
                    <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                        <div>
                            <FloatingInput
                                label="Office / Department"
                                icon={Building2}
                                name="office_department"
                                value={data.office_department}
                                onChange={(e) =>
                                    setData(
                                        "office_department",
                                        e.target.value,
                                    )
                                }
                            />
                            {errorText("office_department")}
                        </div>

                        <div>
                            <FloatingInput
                                label="Name"
                                icon={User}
                                name="employee_name"
                                value={data.employee_name}
                                onChange={(e) =>
                                    setData("employee_name", e.target.value)
                                }
                            />
                            {errorText("employee_name")}
                        </div>

                        <div>
                            <FloatingInput
                                label="Date of Filing"
                                icon={CalendarDays}
                                type="date"
                                name="date_of_filing"
                                value={data.date_of_filing}
                                onChange={(e) =>
                                    setData("date_of_filing", e.target.value)
                                }
                            />
                            {errorText("date_of_filing")}
                        </div>

                        <div>
                            <FloatingInput
                                label="Position"
                                icon={Briefcase}
                                name="position"
                                value={data.position}
                                onChange={(e) =>
                                    setData("position", e.target.value)
                                }
                            />
                            {errorText("position")}
                        </div>

                        <div>
                            <FloatingInput
                                label="Salary"
                                icon={Coins}
                                name="salary"
                                value={data.salary}
                                onChange={(e) =>
                                    setData("salary", e.target.value)
                                }
                            />
                            {errorText("salary")}
                        </div>

                        <div>
                            <FloatingInput
                                label="Number of Working Days"
                                icon={Hash}
                                type="number"
                                step="0.5"
                                min="0.5"
                                name="working_days"
                                value={data.working_days}
                                onChange={(e) =>
                                    setData("working_days", e.target.value)
                                }
                            />
                            {errorText("working_days")}
                        </div>

                        <div className="md:col-span-2">
                            <FloatingInput
                                label="Inclusive Dates"
                                icon={CalendarDays}
                                name="inclusive_dates"
                                value={data.inclusive_dates}
                                onChange={(e) =>
                                    setData("inclusive_dates", e.target.value)
                                }
                            />
                            {errorText("inclusive_dates")}
                        </div>
                    </div>

                    <div className="grid gap-5 lg:grid-cols-2">
                        <section className="rounded-lg border border-slate-200 p-4">
                            <h3 className="text-sm font-bold text-slate-800">
                                Type of Leave
                            </h3>
                            <div className="mt-3 grid gap-2">
                                {leaveTypes.map((leaveType) => (
                                    <label
                                        key={leaveType}
                                        className="flex cursor-pointer items-center gap-2 text-sm text-slate-700"
                                    >
                                        <input
                                            type="radio"
                                            name="type_of_leave"
                                            value={leaveType}
                                            checked={
                                                data.type_of_leave ===
                                                leaveType
                                            }
                                            onChange={(e) =>
                                                setData(
                                                    "type_of_leave",
                                                    e.target.value,
                                                )
                                            }
                                        />
                                        {leaveType}
                                    </label>
                                ))}
                            </div>
                            {errorText("type_of_leave")}

                            <div className="mt-4">
                                <FloatingInput
                                    label="Others, specify"
                                    icon={FileText}
                                    name="type_of_leave_other"
                                    value={data.type_of_leave_other}
                                    onChange={(e) =>
                                        setData(
                                            "type_of_leave_other",
                                            e.target.value,
                                        )
                                    }
                                />
                            </div>
                        </section>

                        <section className="rounded-lg border border-slate-200 p-4">
                            <h3 className="text-sm font-bold text-slate-800">
                                Details of Leave
                            </h3>

                            <div className="mt-4 space-y-4">
                                <div>
                                    <p className="text-xs font-semibold uppercase text-slate-500">
                                        Vacation / Special Privilege Leave
                                    </p>
                                    <div className="mt-2 flex flex-wrap gap-4 text-sm text-slate-700">
                                        <label className="flex items-center gap-2">
                                            <input
                                                type="radio"
                                                name="leave_location"
                                                value="within_philippines"
                                                checked={
                                                    data.leave_location ===
                                                    "within_philippines"
                                                }
                                                onChange={(e) =>
                                                    setData(
                                                        "leave_location",
                                                        e.target.value,
                                                    )
                                                }
                                            />
                                            Within the Philippines
                                        </label>
                                        <label className="flex items-center gap-2">
                                            <input
                                                type="radio"
                                                name="leave_location"
                                                value="abroad"
                                                checked={
                                                    data.leave_location ===
                                                    "abroad"
                                                }
                                                onChange={(e) =>
                                                    setData(
                                                        "leave_location",
                                                        e.target.value,
                                                    )
                                                }
                                            />
                                            Abroad
                                        </label>
                                    </div>
                                    <div className="mt-3">
                                        <FloatingInput
                                            label="Location details"
                                            icon={FileText}
                                            name="leave_location_details"
                                            value={
                                                data.leave_location_details
                                            }
                                            onChange={(e) =>
                                                setData(
                                                    "leave_location_details",
                                                    e.target.value,
                                                )
                                            }
                                        />
                                    </div>
                                </div>

                                <div>
                                    <p className="text-xs font-semibold uppercase text-slate-500">
                                        Sick Leave
                                    </p>
                                    <div className="mt-2 flex flex-wrap gap-4 text-sm text-slate-700">
                                        <label className="flex items-center gap-2">
                                            <input
                                                type="radio"
                                                name="sick_leave_location"
                                                value="in_hospital"
                                                checked={
                                                    data.sick_leave_location ===
                                                    "in_hospital"
                                                }
                                                onChange={(e) =>
                                                    setData(
                                                        "sick_leave_location",
                                                        e.target.value,
                                                    )
                                                }
                                            />
                                            In hospital
                                        </label>
                                        <label className="flex items-center gap-2">
                                            <input
                                                type="radio"
                                                name="sick_leave_location"
                                                value="out_patient"
                                                checked={
                                                    data.sick_leave_location ===
                                                    "out_patient"
                                                }
                                                onChange={(e) =>
                                                    setData(
                                                        "sick_leave_location",
                                                        e.target.value,
                                                    )
                                                }
                                            />
                                            Out patient
                                        </label>
                                    </div>
                                    <div className="mt-3">
                                        <FloatingInput
                                            label="Illness"
                                            icon={FileText}
                                            name="illness"
                                            value={data.illness}
                                            onChange={(e) =>
                                                setData(
                                                    "illness",
                                                    e.target.value,
                                                )
                                            }
                                        />
                                    </div>
                                </div>

                                <FloatingInput
                                    label="Special Leave Benefits for Women - illness"
                                    icon={FileText}
                                    name="women_illness"
                                    value={data.women_illness}
                                    onChange={(e) =>
                                        setData(
                                            "women_illness",
                                            e.target.value,
                                        )
                                    }
                                />

                                <div>
                                    <p className="text-xs font-semibold uppercase text-slate-500">
                                        Study Leave
                                    </p>
                                    <div className="mt-2 grid gap-2 text-sm text-slate-700">
                                        <label className="flex items-center gap-2">
                                            <input
                                                type="radio"
                                                name="study_leave_purpose"
                                                value="masters_degree"
                                                checked={
                                                    data.study_leave_purpose ===
                                                    "masters_degree"
                                                }
                                                onChange={(e) =>
                                                    setData(
                                                        "study_leave_purpose",
                                                        e.target.value,
                                                    )
                                                }
                                            />
                                            Completion of Master's Degree
                                        </label>
                                        <label className="flex items-center gap-2">
                                            <input
                                                type="radio"
                                                name="study_leave_purpose"
                                                value="bar_board_review"
                                                checked={
                                                    data.study_leave_purpose ===
                                                    "bar_board_review"
                                                }
                                                onChange={(e) =>
                                                    setData(
                                                        "study_leave_purpose",
                                                        e.target.value,
                                                    )
                                                }
                                            />
                                            BAR / Board Examination Review
                                        </label>
                                    </div>
                                </div>

                                <div>
                                    <p className="text-xs font-semibold uppercase text-slate-500">
                                        Other Purpose
                                    </p>
                                    <div className="mt-2 grid gap-2 text-sm text-slate-700">
                                        <label className="flex items-center gap-2">
                                            <input
                                                type="radio"
                                                name="other_purpose"
                                                value="monetization"
                                                checked={
                                                    data.other_purpose ===
                                                    "monetization"
                                                }
                                                onChange={(e) =>
                                                    setData(
                                                        "other_purpose",
                                                        e.target.value,
                                                    )
                                                }
                                            />
                                            Monetization of Leave Credits
                                        </label>
                                        <label className="flex items-center gap-2">
                                            <input
                                                type="radio"
                                                name="other_purpose"
                                                value="terminal_leave"
                                                checked={
                                                    data.other_purpose ===
                                                    "terminal_leave"
                                                }
                                                onChange={(e) =>
                                                    setData(
                                                        "other_purpose",
                                                        e.target.value,
                                                    )
                                                }
                                            />
                                            Terminal Leave
                                        </label>
                                    </div>
                                </div>

                                <div>
                                    <p className="text-xs font-semibold uppercase text-slate-500">
                                        Commutation
                                    </p>
                                    <div className="mt-2 flex flex-wrap gap-4 text-sm text-slate-700">
                                        <label className="flex items-center gap-2">
                                            <input
                                                type="radio"
                                                name="commutation"
                                                value="not_requested"
                                                checked={
                                                    data.commutation ===
                                                    "not_requested"
                                                }
                                                onChange={(e) =>
                                                    setData(
                                                        "commutation",
                                                        e.target.value,
                                                    )
                                                }
                                            />
                                            Not Requested
                                        </label>
                                        <label className="flex items-center gap-2">
                                            <input
                                                type="radio"
                                                name="commutation"
                                                value="requested"
                                                checked={
                                                    data.commutation ===
                                                    "requested"
                                                }
                                                onChange={(e) =>
                                                    setData(
                                                        "commutation",
                                                        e.target.value,
                                                    )
                                                }
                                            />
                                            Requested
                                        </label>
                                    </div>
                                    {errorText("commutation")}
                                </div>
                            </div>
                        </section>
                    </div>

                    <div className="flex justify-between gap-3 border-t pt-4">
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
                </form>
            </div>
        </div>
    );
}
