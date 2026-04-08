import React, { useState } from "react";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import { router } from "@inertiajs/react";

const AddDepartmentHeadForm = ({
    open,
    setOpen,
    employees = [],
    departments = [],
    assignedDepartments = [],
}) => {
    const [selectedDept, setSelectedDept] = useState("");
    const [selectedEmployee, setSelectedEmployee] = useState("");

    // 🚫 remove already assigned departments
    const availableDepartments = departments.filter(
        (dept) => !assignedDepartments.includes(dept.id)
    );

    // 👇 employees under selected department
    const filteredEmployees = employees.filter(
        (emp) => emp.department_id == selectedDept
    );

    const handleSubmit = (e) => {
        e.preventDefault();

        router.post(
            route("departmenthead.store"),
            {
                employee_id: selectedEmployee,
            },
            {
                onSuccess: () => {
                    setOpen(false);
                    setSelectedDept("");
                    setSelectedEmployee("");
                },
            }
        );
    };

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogContent className="max-w-lg">
                <DialogHeader>
                    <DialogTitle>Add Department Head</DialogTitle>
                </DialogHeader>

                <form onSubmit={handleSubmit} className="space-y-4">
                    {/* Department */}
                    <div>
                        <label className="block mb-1 font-medium">
                            Select Department
                        </label>

                        <select
                            className="w-full border rounded p-2"
                            value={selectedDept}
                            onChange={(e) => {
                                setSelectedDept(e.target.value);
                                setSelectedEmployee("");
                            }}
                        >
                            <option value="">Select Department</option>

                            {availableDepartments.map((dept) => (
                                <option key={dept.id} value={dept.id}>
                                    {dept.name}
                                </option>
                            ))}
                        </select>
                    </div>

                    {/* Employee */}
                    <div>
                        <label className="block mb-1 font-medium">
                            Select Employee
                        </label>

                        <select
                            className="w-full border rounded p-2"
                            value={selectedEmployee}
                            onChange={(e) =>
                                setSelectedEmployee(e.target.value)
                            }
                            disabled={!selectedDept}
                        >
                            <option value="">
                                {selectedDept
                                    ? "Select Employee"
                                    : "Select department first"}
                            </option>

                            {filteredEmployees.map((emp) => (
                                <option key={emp.id} value={emp.id}>
                                    {emp.first_name} {emp.last_name}
                                </option>
                            ))}
                        </select>
                    </div>

                    {/* Submit */}
                    <button
                        type="submit"
                        className="w-full bg-blue-600 text-white p-2 rounded hover:bg-blue-700"
                        disabled={!selectedDept || !selectedEmployee}
                    >
                        Add Department Head
                    </button>
                </form>
            </DialogContent>
        </Dialog>
    );
};

export default AddDepartmentHeadForm;