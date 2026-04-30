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
import {
    HoverCard,
    HoverCardContent,
    HoverCardTrigger,
} from "@/components/ui/hover-card";
import { Button } from "@/components/ui/button";
import FloatingInput from "@/components/floating-input";
import {
    CheckCircle,
    Briefcase,
    Building2,
    User,
    FileSpreadsheetIcon,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { ShieldAlert } from "lucide-react";
import ConfirmPasswordDialog from "@/Components/ConfirmPasswordDialog";
import {
    CustomDropdownCheckbox,
    CustomDropdownCheckboxObject,
} from "@/components/dropdown-menu-main";
import { toast } from "sonner";

const EmployeeEditDialog = ({
    editForm,
    setEditForm,
    editOpen,
    setEditOpen,
    offices = [],
    stations,
    userStationId,
}) => {
    const [confirmOpen, setConfirmOpen] = React.useState(false);
    const safeForm = editForm || {};
    const canEditOffice = userStationId === 1;

    console.log("SAFE FORM:", safeForm);

    const isHead =
        safeForm?.is_unit_head ||
        safeForm?.is_division_head ||
        safeForm?.is_department_head;

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
                                    (s) => s.id === safeForm.station_id,
                                )?.name || ""
                            }
                            readOnly
                            inputClassName="truncate pr-12"
                        />

                        <div className="absolute right-2 top-0 h-full flex items-center">
                            <CustomDropdownCheckbox
                                label="Select Station"
                                items={stations?.map((s) => s.name) || []}
                                value={
                                    stations?.find(
                                        (s) =>
                                            s.id ===
                                            Number(safeForm.station_id),
                                    )?.name
                                }
                                onChange={(val) => {
                                    const selectedStation = stations?.find(
                                        (s) => s.name === val,
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

                    {/* Office */}
                    <div className="relative w-full">
                        <FloatingInput
                            label="Office"
                            icon={Building2}
                            value={
                                offices?.find(
                                    (office) =>
                                        office.id === safeForm.office_id,
                                )?.name || ""
                            }
                            readOnly
                            inputClassName="truncate pr-12"
                        />

                        {/* HoverCard ONLY when employee is head */}
                        {isHead && (
                            <div className="absolute right-2 top-0 h-full flex items-center">
                                <HoverCard>
                                    <HoverCardTrigger asChild>
                                        <div className="cursor-pointer">
                                            <Badge className="bg-red-100 text-red-700 border border-red-300 flex items-center gap-1">
                                                <ShieldAlert className="w-3.5 h-3.5" />
                                            </Badge>
                                        </div>
                                    </HoverCardTrigger>

                                    <HoverCardContent className="text-xs px-3 py-2 rounded-lg shadow-md border bg-white w-fit">
                                        <span className="flex flex-col gap-1 text-red-600 font-medium">
                                            <div className="flex items-center gap-2">
                                                <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
                                                Head Assignment Active
                                            </div>

                                            <p className="text-gray-600 font-normal">
                                                This employee is currently
                                                assigned as a head for{" "}
                                                <span className="font-semibold text-black">
                                                    {safeForm.office?.name}
                                                </span>
                                            </p>

                                            <p className="text-red-500 font-semibold">
                                                Remove the assignment first
                                                before changing office.
                                            </p>
                                        </span>
                                    </HoverCardContent>
                                </HoverCard>
                            </div>
                        )}

                        {/* Dropdown */}
                        <div className="absolute right-2 top-0 h-full flex items-center">
                            {canEditOffice && !isHead && (
                                <CustomDropdownCheckboxObject
                                    label="Select Office"
                                    items={offices}
                                    onChange={(val) =>
                                        setEditForm((prev) => ({
                                            ...prev,
                                            office_id: val,
                                        }))
                                    }
                                    buttonVariant="white"
                                    iconOnly
                                />
                            )}
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
                                items={["Full", "Fixed", "Work From Home"]}
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
                                safeForm.active_status ? "Active" : "Inactive"
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
                                        active_status: val === "Active" ? 1 : 0,
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
                            trigger={
                                <Button variant="blue">Save Changes</Button>
                            }
                            action={route("employees.update", safeForm.id)}
                            method="put"
                            data={safeForm}
                            onSuccess={() => setEditOpen(false)}
                            onError={() => {}}
                            confirmText="Confirm Update"
                            processingText="Updating..."
                            danger={FileSpreadsheetIcon}
                            title="Confirm Employee Update"
                            description="You are about to update this employee's information."
                            itemLabel="Employee"
                            itemName={`${safeForm.first_name || ""} ${safeForm.last_name || ""}`.trim()}
                        />
                    )}
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
};

export default EmployeeEditDialog;
