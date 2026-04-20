import React, { useState, useEffect, useMemo } from "react";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { router } from "@inertiajs/react";
import { Search, Check, UserRound, Building2, BadgeCheck } from "lucide-react";
import FloatingInput from "@/components/floating-input";

const AddDepartmentHeadForm = ({
    open,
    setOpen,
    employees = [],
    departments = [],
    preselectedDept = null,
}) => {
    const [selectedDept, setSelectedDept] = useState("");
    const [selectedEmployee, setSelectedEmployee] = useState(null);
    const [search, setSearch] = useState("");

    useEffect(() => {
        if (open) {
            setSelectedDept(preselectedDept || "");
            setSelectedEmployee(null);
            setSearch("");
        }
    }, [open, preselectedDept]);

    const deptName = departments.find((d) => d.id == selectedDept)?.name || "";

    const filteredEmployees = useMemo(() => {
        return employees
            .filter((emp) => emp.department_id == selectedDept)
            .filter((emp) =>
                `${emp.first_name} ${emp.last_name}`
                    .toLowerCase()
                    .includes(search.toLowerCase()),
            );
    }, [employees, selectedDept, search]);

    const handleSubmit = () => {
        if (!selectedEmployee) return;

        router.post(
            route("departmenthead.storeHead"),
            {
                employee_id: selectedEmployee.id,
            },
            {
                onSuccess: () => setOpen(false),
            },
        );
    };

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogContent className="max-w-md rounded-2xl p-0 overflow-hidden">
                {/* HEADER */}
                <div className="bg-gradient-to-r from-blue-600 to-blue-500 p-5 text-white">
                    <DialogHeader>
                        <DialogTitle className="flex items-center gap-2 text-white">
                            <BadgeCheck className="w-5 h-5" />
                            Assign Department Head
                        </DialogTitle>

                        <DialogDescription className="text-blue-100">
                            Select an employee to assign as department head.
                        </DialogDescription>
                    </DialogHeader>
                </div>

                {/* BODY */}
                <div className="space-y-4 px-5 pb-5 pt-1">
                    {/* Department Badge */}
                    <div className="flex items-center gap-4 border rounded-lg p-3 bg-blue-50">
                        <Building2 className="w-4 h-4 text-blue-600" />
                        <span className="text-sm text-gray-500">
                            Department:
                        </span>
                        <span className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-sm font-semibold">
                            {deptName || "Not selected"}
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
                    <div className="border rounded-lg h-[180px] overflow-y-auto divide-y bg-white">
                        {filteredEmployees.length > 0 ? (
                            filteredEmployees.map((emp) => (
                                <div
                                    key={emp.id}
                                    onClick={() => setSelectedEmployee(emp)}
                                    className="flex items-center justify-between p-3 cursor-pointer hover:bg-blue-50 transition"
                                >
                                    {/* LEFT */}
                                    <div className="flex items-center gap-3">
                                        <div className="w-9 h-9 rounded-full bg-blue-100 text-blue-700 flex items-center justify-center text-xs font-bold">
                                            {emp.first_name[0]}
                                            {emp.last_name[0]}
                                        </div>

                                        <div>
                                            <div className="text-sm font-medium text-gray-800">
                                                {emp.first_name} {emp.last_name}
                                            </div>
                                            <div className="text-xs text-gray-500">
                                                {emp.position}
                                            </div>
                                        </div>
                                    </div>

                                    {/* SELECTED */}
                                    {selectedEmployee?.id === emp.id && (
                                        <div className="w-5 h-5 bg-blue-600 rounded-full flex items-center justify-center">
                                            <Check className="w-3 h-3 text-white" />
                                        </div>
                                    )}
                                </div>
                            ))
                        ) : (
                            <div className="p-3 text-sm text-gray-400 text-center">
                                No employees found
                            </div>
                        )}
                    </div>

                    {/* SELECTED INFO */}
                    <div className="border rounded-lg p-3 bg-blue-50">
                        {selectedEmployee ? (
                            <div className="flex items-center gap-3">
                                <UserRound className="w-5 h-5 text-blue-600" />

                                <div className="flex-1">
                                    <div className="text-sm font-semibold">
                                        {selectedEmployee.first_name}{" "}
                                        {selectedEmployee.last_name}
                                    </div>
                                    <div className="text-xs text-gray-500">
                                        {selectedEmployee.position}
                                    </div>
                                </div>

                                <span className="text-xs px-2 py-1 bg-blue-200 text-blue-700 rounded-full font-medium">
                                    Selected
                                </span>
                            </div>
                        ) : (
                            <div className="text-sm text-gray-400 text-center">
                                No employee selected
                            </div>
                        )}
                    </div>

                    {/* BUTTONS */}
                    <div className="flex justify-end gap-2 pt-2">
                        <Button
                            variant="outline"
                            onClick={() => setOpen(false)}
                        >
                            Cancel
                        </Button>

                        <Button
                            onClick={handleSubmit}
                            disabled={!selectedEmployee}
                            className="bg-blue-600 hover:bg-blue-700 text-white"
                        >
                            Assign Head
                        </Button>
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    );
};

export default AddDepartmentHeadForm;
