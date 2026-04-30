"use client";

import React, { useState } from "react";
import dayjs from "dayjs";
import {
    Table,
    TableBody,
    TableCaption,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import { router } from "@inertiajs/react";
import { CustomDropdownCheckbox } from "@/components/dropdown-menu-main";
import {
    AlertDialog,
    AlertDialogTrigger,
    AlertDialogContent,
    AlertDialogHeader,
    AlertDialogFooter,
    AlertDialogTitle,
    AlertDialogDescription,
    AlertDialogAction,
    AlertDialogCancel,
} from "@/components/ui/alert-dialog";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";

const EmployeeLeaveTable = ({ employees, selectedDate }) => {
    const [leaveTypes, setLeaveTypes] = useState({});
    const [loading, setLoading] = useState({});
    const [selectedEmp, setSelectedEmp] = useState(null);

    const leaveOptions = [
        { label: "None", value: null },
        { label: "Sick Leave", value: "SL" },
        { label: "Official Business", value: "OB" },
        { label: "Vacation Leave", value: "VL" },
    ];

    const handleLeaveChange = (empId, selectedLabel) => {
        const selected = leaveOptions.find(
            (opt) => opt.label === selectedLabel,
        );
        setLeaveTypes((prev) => ({
            ...prev,
            [empId]: selected ? selected.value : null,
        }));
    };

    const handleAssign = (empId) => {
        const selectedLeaveCode = leaveTypes[empId] ?? null;

        setLoading((prev) => ({ ...prev, [empId]: true }));

        if (selectedLeaveCode === null) {
            // Delete leave
            router.delete("/attendance/leave", {
                data: {
                    employee_id: empId,
                    date: selectedDate,
                },
                onSuccess: () => {
                    toast.success("Leave removed successfully!");
                    setLeaveTypes((prev) => ({ ...prev, [empId]: null }));
                },
                onError: () => {
                    toast.error("Failed to remove leave.");
                },
                onFinish: () =>
                    setLoading((prev) => ({ ...prev, [empId]: false })),
            });
            return;
        }

        // Otherwise assign leave
        router.post(
            "/attendance/leave",
            {
                employee_id: empId,
                leave_type: selectedLeaveCode,
                date: selectedDate,
            },
            {
                onSuccess: () => {
                    toast.success("Leave assigned successfully!");
                    setLeaveTypes((prev) => ({
                        ...prev,
                        [empId]: selectedLeaveCode,
                    }));
                },
                onError: () => {
                    toast.error("Failed to assign leave.");
                },
                onFinish: () =>
                    setLoading((prev) => ({ ...prev, [empId]: false })),
            },
        );
    };

    return (
        <Table className="table-fixed">
            <TableCaption>
                Assign or update leave type for employees without attendance
            </TableCaption>
            <TableHeader>
                <TableRow className="bg-yellow-900 hover:bg-yellow-800">
                    <TableHead>Employee</TableHead>
                                <TableHead>Office</TableHead>
                    <TableHead>Date</TableHead>
                    <TableHead>Leave Type</TableHead>
                    <TableHead></TableHead>
                </TableRow>
            </TableHeader>
            <TableBody>
                {employees.length > 0 ? (
                    employees.map((emp) => {
                        const currentValue =
                            leaveOptions.find(
                                (opt) =>
                                    opt.value ===
                                    (leaveTypes.hasOwnProperty(emp.id)
                                        ? leaveTypes[emp.id]
                                        : emp.leave_type),
                            )?.label || "";

                        return (
                            <TableRow key={emp.id}>
                                <TableCell>
                                    {emp.first_name} {emp.last_name}
                                </TableCell>
                                <TableCell>
                                                {emp.office?.name || "-"}
                                </TableCell>
                                <TableCell>
                                    {dayjs(selectedDate).format("DD MMMM")}
                                </TableCell>
                                <TableCell className="w-48">
                                    <CustomDropdownCheckbox
                                        label="Select Leave"
                                        items={leaveOptions.map(
                                            (opt) => opt.label,
                                        )}
                                        selected={currentValue}
                                        onChange={(value) =>
                                            handleLeaveChange(emp.id, value)
                                        }
                                        buttonVariant="green"
                                    />
                                </TableCell>
                                <TableCell className="flex justify-end pr-24">
                                    <AlertDialog>
                                        <AlertDialogTrigger asChild>
                                            <Button
                                                variant="green"
                                                disabled={loading[emp.id]}
                                                onClick={() =>
                                                    setSelectedEmp(emp)
                                                }
                                            >
                                                {loading[emp.id]
                                                    ? "Assigning..."
                                                    : "Assign"}
                                            </Button>
                                        </AlertDialogTrigger>
                                        <AlertDialogContent>
                                            <AlertDialogHeader>
                                                <AlertDialogTitle>
                                                    Confirm Leave Assignment
                                                </AlertDialogTitle>
                                                <AlertDialogDescription>
                                                    Are you sure you want to
                                                    assign{" "}
                                                    <strong>
                                                        {currentValue}
                                                    </strong>{" "}
                                                    to {emp.first_name}{" "}
                                                    {emp.last_name} on{" "}
                                                    {dayjs(selectedDate).format(
                                                        "DD MMMM YYYY",
                                                    )}
                                                    ?
                                                </AlertDialogDescription>
                                            </AlertDialogHeader>
                                            <AlertDialogFooter>
                                                <AlertDialogCancel>
                                                    Cancel
                                                </AlertDialogCancel>
                                                <AlertDialogAction
                                                    className="bg-green-600 hover:bg-green-700"
                                                    onClick={() =>
                                                        handleAssign(emp.id)
                                                    }
                                                >
                                                    Confirm
                                                </AlertDialogAction>
                                            </AlertDialogFooter>
                                        </AlertDialogContent>
                                    </AlertDialog>
                                </TableCell>
                            </TableRow>
                        );
                    })
                ) : (
                    <TableRow>
                        <TableCell colSpan={5} className="text-center">
                            No employees without attendance
                        </TableCell>
                    </TableRow>
                )}
            </TableBody>
        </Table>
    );
};

export default EmployeeLeaveTable;
