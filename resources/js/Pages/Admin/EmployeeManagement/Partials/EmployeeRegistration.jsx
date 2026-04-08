import React, { useState, useEffect } from "react";
import FloatingInput from "@/components/floating-input";
import { User, Briefcase, Building2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
    AlertDialog,
    AlertDialogTrigger,
    AlertDialogContent,
    AlertDialogHeader,
    AlertDialogTitle,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogCancel,
    AlertDialogAction,
} from "@/components/ui/alert-dialog";
import { CustomDropdownCheckbox, CustomDropdownCheckboxObject } from "@/components/dropdown-menu-main";
import { router } from "@inertiajs/react";
import { toast } from "sonner";

const work_type_choices = ["Full", "Fixed", "Work From Home"];

const EmployeeRegistration = ({ userStationId, departments })  => {
        const [form, setForm] = useState({
            first_name: "",
            middle_name: "",
            last_name: "",
            position: "",
            department_id: "",
            work_type: "",
            station_id: "",
        });

    useEffect(() => {
        setForm((prev) => ({
            ...prev,
            station_id: userStationId,
            department: userStationId !== 1 ? "Not Applicable" : "",
        }));
    }, [userStationId]);

    const handleFormChange = (e) => {
        const { name, value } = e.target;

        if (["first_name", "middle_name", "last_name"].includes(name)) {
            const regex = /^[A-Za-z\s-]*$/;
            if (!regex.test(value)) return;
        }

        setForm({ ...form, [name]: value });
    };

    const handleAddEmployee = () => {
        router.post(route("employees.store"), form, {
            preserveScroll: true,
            onSuccess: () => {
                setForm({
                    first_name: "",
                    middle_name: "",
                    last_name: "",
                    position: "",
                    department_id: userStationId !== 1 ? "Not Applicable" : "",
                    work_type: "",
                    station_id: userStationId,
                });

                toast.success("Employee added successfully 🎉", {
                    description: `${form.first_name} ${form.last_name} has been registered.`,
                });

                router.reload({
                    only: [
                        "employeesList",
                        "registeredList",
                        "unregisteredList",
                    ],
                });
            },
        });
    };

    return (
        <div className="bg-gradient-to-br from-blue-100 to-white shadow-lg rounded-2xl p-6 border border-gray-100 md:col-span-2 flex flex-col">
            <h2 className="text-l font-bold text-gray-800 mb-6 flex items-center gap-3">
                <User className="w-6 h-6 text-blue-600" />
                Employee Registration
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                {/* First Name */}
                <FloatingInput
                    label="First Name"
                    icon={User}
                    name="first_name"
                    value={form.first_name}
                    onChange={handleFormChange}
                />

                {/* Department */}
                <div className="relative w-full">
                    <FloatingInput
                        label="Department"
                        icon={Building2}
                        value={departments?.find(d => d.id === form.department_id)?.name || ""}
                        readOnly
                        onChange={() => {}}
                    />
                    <div className={`absolute right-2 top-0 h-full flex items-center ${
                        Number(userStationId) !== 1 ? "pointer-events-none opacity-50" : ""
                    }`}>
                        <CustomDropdownCheckboxObject
                            label="Select Department"
                            items={departments}
                            onChange={(val) =>
                                setForm((prev) => ({
                                    ...prev,
                                    department_id: val,
                                }))
                            }
                            buttonVariant="white"
                            iconOnly
                            disabled={userStationId !== 1}
                        />
                    </div>
                </div>

                {/* Middle Name */}
                <FloatingInput
                    label="Middle Name"
                    icon={User}
                    name="middle_name"
                    value={form.middle_name}
                    onChange={handleFormChange}
                />

                {/* Position */}
                <FloatingInput
                    label="Position"
                    icon={Briefcase}
                    name="position"
                    value={form.position}
                    onChange={handleFormChange}
                />

                {/* Last Name */}
                <FloatingInput
                    label="Last Name"
                    icon={User}
                    name="last_name"
                    value={form.last_name}
                    onChange={handleFormChange}
                />

                {/* Work Type */}
                <div className="relative w-full">
                    <FloatingInput
                        label="Work Type"
                        icon={Briefcase}
                        value={form.work_type || ""}
                        readOnly
                        onChange={() => {}}
                    />
                    <div className="absolute right-2 top-0 h-full flex items-center">
                        <CustomDropdownCheckbox
                            label="Select Work Type"
                            items={work_type_choices}
                            selected={""}
                            onChange={(val) =>
                                setForm({ ...form, work_type: val })
                            }
                            buttonVariant="white"
                            iconOnly
                        />
                    </div>
                </div>
            </div>

            {/* Button */}
            <AlertDialog>
                <div className="cursor-pointer w-full flex justify-center">
                    <AlertDialogTrigger asChild>
                        <Button
                            variant="blue"
                            disabled={
                                !form.first_name ||
                                !form.middle_name ||
                                !form.last_name ||
                                !form.position ||
                                !form.department_id ||
                                !form.work_type ||
                                !form.station_id
                            }
                            className="w-full"
                        >
                            Add Employee
                        </Button>
                    </AlertDialogTrigger>
                </div>

                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>
                            Confirm Add Employee
                        </AlertDialogTitle>
                        <AlertDialogDescription>
                            Are you sure you want to add this employee?
                        </AlertDialogDescription>
                    </AlertDialogHeader>

                    <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction
                            onClick={handleAddEmployee}
                            className="bg-blue-600 hover:bg-blue-700 hover:text-white"
                        >
                            Confirm
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </div>
    );
};

export default EmployeeRegistration;
