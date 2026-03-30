    import React from "react";
    import {
        Dialog,
        DialogContent,
        DialogHeader,
        DialogTitle,
        DialogDescription,
        DialogFooter,
        DialogClose,
    } from "@/components/ui/dialog";
    import { Button } from "@/components/ui/button";
    import FloatingInput from "@/components/floating-input";
    import { CheckCircle, Briefcase, Building2, User } from "lucide-react";
    import ConfirmPasswordDialog from "@/Components/ConfirmPasswordDialog";
    import { CustomDropdownCheckbox } from "@/components/dropdown-menu-main";
    import { router } from "@inertiajs/react";
    import { toast } from "sonner";

    const EmployeeEditDialog = ({
        editForm,
        setEditForm,
        editOpen,
        setEditOpen,
        department_choices,
        stations,
    }) => {
        const [confirmOpen, setConfirmOpen] = React.useState(false);

        // ✅ SAFE FALLBACK (prevents crash + fixes click issues)
        const safeForm = editForm || {};

        return (
            <Dialog open={editOpen} onOpenChange={setEditOpen}>
                <DialogContent className="sm:max-w-lg">
                    <DialogHeader>
                        <DialogTitle>Edit Employee</DialogTitle>
                        <DialogDescription>
                            Update employee information.
                        </DialogDescription>
                    </DialogHeader>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 my-4">
                        <FloatingInput
                            label="First Name"
                            icon={User}
                            value={safeForm.first_name || ""}
                            onChange={(e) =>
                                setEditForm((prev) => ({
                                    ...prev,
                                    first_name: e.target.value,
                                }))
                            }
                        />

                        <FloatingInput
                            label="Middle Name"
                            icon={User}
                            value={safeForm.middle_name || ""}
                            onChange={(e) =>
                                setEditForm((prev) => ({
                                    ...prev,
                                    middle_name: e.target.value,
                                }))
                            }
                        />

                        <FloatingInput
                            label="Last Name"
                            icon={User}
                            value={safeForm.last_name || ""}
                            onChange={(e) =>
                                setEditForm((prev) => ({
                                    ...prev,
                                    last_name: e.target.value,
                                }))
                            }
                        />

                        {/* Station */}
                        <div className="relative w-full">
                            <FloatingInput
                                label="Station"
                                icon={Building2}
                                value={
                                    stations?.find(
                                        (s) => s.id === safeForm.station_id
                                    )?.name || ""
                                }
                                readOnly
                            />

                            <div className="absolute right-2 top-0 h-full flex items-center">
                                <CustomDropdownCheckbox
                                    label="Select Station"
                                    items={stations?.map((s) => s.name) || []}
                                    value={
                                        stations?.find(
                                            (s) =>
                                                s.id ===
                                                Number(safeForm.station_id)
                                        )?.name
                                    }
                                    onChange={(val) => {
                                        const selectedStation = stations?.find(
                                            (s) => s.name === val
                                        );

                                        setEditForm((prev) => ({
                                            ...prev,
                                            station_id: selectedStation?.id || "",
                                        }));
                                    }}
                                    buttonVariant="white"
                                    iconOnly
                                />
                            </div>
                        </div>

                        <FloatingInput
                            label="Position"
                            icon={Briefcase}
                            value={safeForm.position || ""}
                            onChange={(e) =>
                                setEditForm((prev) => ({
                                    ...prev,
                                    position: e.target.value,
                                }))
                            }
                        />

                        {/* Department */}
                        <div className="relative w-full">
                            <FloatingInput
                                label="Department"
                                icon={Building2}
                                value={safeForm.department || ""}
                                readOnly
                            />

                            <div className="absolute right-2 top-0 h-full flex items-center">
                                <CustomDropdownCheckbox
                                    label="Select Department"
                                    items={department_choices}
                                    onChange={(val) =>
                                        setEditForm((prev) => ({
                                            ...prev,
                                            department: val,
                                        }))
                                    }
                                    buttonVariant="white"
                                    iconOnly
                                />
                            </div>
                        </div>

                        {/* Work Type */}
                        <div className="relative w-full">
                            <FloatingInput
                                label="Work Type"
                                icon={Briefcase}
                                value={safeForm.work_type || ""}
                                readOnly
                            />

                            <div className="absolute right-2 top-0 h-full flex items-center">
                                <CustomDropdownCheckbox
                                    label="Select Work Type"
                                    items={[
                                        "Full",
                                        "Fixed",
                                        "Work From Home",
                                    ]}
                                    onChange={(val) =>
                                        setEditForm((prev) => ({
                                            ...prev,
                                            work_type: val,
                                        }))
                                    }
                                    buttonVariant="white"
                                    iconOnly
                                />
                            </div>
                        </div>

                        {/* Status */}
                        <div className="relative w-full">
                            <FloatingInput
                                label="Status"
                                icon={CheckCircle}
                                value={
                                    safeForm.active_status
                                        ? "Active"
                                        : "Inactive"
                                }
                                readOnly
                            />

                            <div className="absolute right-2 top-0 h-full flex items-center">
                                <CustomDropdownCheckbox
                                    label="Select Status"
                                    items={["Active", "Inactive"]}
                                    onChange={(val) =>
                                        setEditForm((prev) => ({
                                            ...prev,
                                            active_status:
                                                val === "Active" ? 1 : 0,
                                        }))
                                    }
                                    buttonVariant="white"
                                    iconOnly
                                />
                            </div>
                        </div>
                    </div>

                   <DialogFooter>
                        <DialogClose asChild>
                            <Button variant="outline">Cancel</Button>
                        </DialogClose>

                    {safeForm?.id && (
                        <ConfirmPasswordDialog
                            trigger={<Button variant="blue">Save Changes</Button>}
                            action={route("employees.update", safeForm.id)}
                            method="put"
                            data={safeForm}

                            onSuccess={() => {
                                setEditOpen(false);
                                toast.success("Employee updated successfully 🎉");
                            }}

                            onError={(err) => {
                                console.log("❌ ERROR:", err);
                                toast.error(err.password ?? "Wrong password or validation error");
                            }}

                            confirmText="Confirm Update"
                            processingText="Updating..."
                            danger={false}
                        />
                        )}
                    </DialogFooter>
                </DialogContent>
            </Dialog>
            
        );
    };

    export default EmployeeEditDialog;