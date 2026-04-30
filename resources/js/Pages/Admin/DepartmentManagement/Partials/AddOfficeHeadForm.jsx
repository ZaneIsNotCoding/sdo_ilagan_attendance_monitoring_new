import React, { useEffect, useMemo, useState } from "react";
import { router } from "@inertiajs/react";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import FloatingInput from "@/components/floating-input";
import { Building2, Check, Search, ShieldCheck, Users } from "lucide-react";
import EmployeeAvatar from "@/Components/EmployeeAvatar";

const AddOfficeHeadForm = ({
    open,
    setOpen,
    employees = [],
    offices = [],
    preselectedOffice = null,
}) => {
    const [officeId, setOfficeId] = useState("");
    const [employeeId, setEmployeeId] = useState("");
    const [search, setSearch] = useState("");

    useEffect(() => {
        if (open) {
            setOfficeId(preselectedOffice || "");
            setEmployeeId("");
            setSearch("");
        }
    }, [open, preselectedOffice]);

    const selectedOffice = useMemo(
        () => offices.find((office) => String(office.id) === String(officeId)),
        [offices, officeId],
    );

    const selectedEmployee = useMemo(
        () => employees.find((emp) => String(emp.id) === String(employeeId)),
        [employees, employeeId],
    );

    const filteredEmployees = useMemo(() => {
        return employees
            .filter(
                (emp) =>
                    !officeId || String(emp.office_id) === String(officeId),
            )
            .filter((emp) => {
                const fullName =
                    `${emp.first_name || ""} ${emp.middle_name || ""} ${emp.last_name || ""}`
                        .replace(/\s+/g, " ")
                        .trim()
                        .toLowerCase();

                return fullName.includes(search.toLowerCase());
            });
    }, [employees, officeId, search]);

    const canSubmit = Boolean(employeeId && officeId);

    const handleSubmit = (e) => {
        e.preventDefault();
        if (!canSubmit) return;

        router.post(
            route("departmenthead.storeHead"),
            { employee_id: employeeId, office_id: officeId },
            { onSuccess: () => setOpen(false) },
        );
    };

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogContent className="max-w-md overflow-hidden rounded-2xl p-0">
                <div className="bg-blue-700 px-5 py-4 text-white">
                    <DialogHeader>
                        <DialogTitle className="flex items-center gap-2 text-white">
                            <ShieldCheck className="h-5 w-5" />
                            Assign Office Head
                        </DialogTitle>
                        <DialogDescription className="text-blue-100">
                            Choose an office and assign one employee as its
                            head.
                        </DialogDescription>
                    </DialogHeader>
                </div>

                <form
                    onSubmit={handleSubmit}
                    className="space-y-3 px-5 pb-5 pt-2"
                >
                    <div className="rounded-xl border border-blue-100 bg-blue-50 p-3 ">
                        <div className="flex items-start gap-3">
                            <div className="rounded-xl bg-white p-2 shadow-sm">
                                <Building2 className="h-5 w-5 text-blue-600" />
                            </div>

                            <div className="flex gap-2 text-sm">
                                <div className="min-w-0">
                                    <div className="font-semibold text-blue-700 truncate">
                                        {selectedOffice?.name ||
                                            "No office selected"}
                                    </div>

                                    <p className="text-xs text-slate-500">
                                        {selectedOffice?.division?.name ||
                                            "Choose an office from the list first"}
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="pt-2 pb-2">
                        <FloatingInput
                            label="Search employee"
                            icon={Search}
                            name="office-head-search"
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                        />
                    </div>

                    <div className="rounded-xl border border-slate-200 bg-white shadow-sm ">
                        <div className="flex items-center justify-between border-b border-slate-100 px-4 py-3">
                            <div className="flex items-center gap-2 text-sm font-medium text-slate-700">
                                <Users className="h-4 w-4 text-blue-600" />
                                Employees
                            </div>
                            <div className="text-xs text-slate-400">
                                {filteredEmployees.length} found
                            </div>
                        </div>

                        <div className="h-[12rem] space-y-2 overflow-y-auto p-2">
                            {filteredEmployees.length > 0 ? (
                                filteredEmployees.map((emp) => {
                                    const fullName =
                                        `${emp.first_name || ""} ${emp.middle_name || ""} ${emp.last_name || ""}`
                                            .replace(/\s+/g, " ")
                                            .trim();
                                    const isSelected =
                                        String(employeeId) === String(emp.id);

                                    return (
                                        <button
                                            key={emp.id}
                                            type="button"
                                            onClick={() =>
                                                setEmployeeId(emp.id)
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
                                                        {emp.position || "-"}
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

                    <div className="rounded-xl border border-slate-200 bg-blue-50 px-4 py-3">
                        {selectedEmployee ? (
                            <div className="flex items-center gap-3">
                                <EmployeeAvatar employee={selectedEmployee} />

                                <div className="min-w-0 flex-1">
                                    <div className="truncate text-sm font-semibold text-slate-900">
                                        {selectedEmployee.first_name}{" "}
                                        {selectedEmployee.last_name}
                                    </div>
                                    <div className="truncate text-xs text-slate-500">
                                        {selectedEmployee.position || "-"}
                                    </div>
                                </div>

                                <span className="rounded-full bg-blue-200 px-2 py-1 text-xs font-medium text-blue-700">
                                    Selected
                                </span>
                            </div>
                        ) : (
                            <div className="text-center text-sm text-slate-400">
                                No employee selected
                            </div>
                        )}
                    </div>

                    <div className="flex justify-end gap-2 pt-1">
                        <Button
                            type="button"
                            variant="outline"
                            onClick={() => setOpen(false)}
                        >
                            Cancel
                        </Button>
                        <Button
                            type="submit"
                            disabled={!canSubmit}
                            className="bg-blue-600 text-white hover:bg-blue-700"
                        >
                            Assign Admin
                        </Button>
                    </div>
                </form>
            </DialogContent>
        </Dialog>
    );
};

export default AddOfficeHeadForm;
