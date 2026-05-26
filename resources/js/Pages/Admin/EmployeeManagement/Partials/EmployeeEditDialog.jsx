import React from "react";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import {
    HoverCard,
    HoverCardContent,
    HoverCardTrigger,
} from "@/components/ui/hover-card";
import { Button } from "@/components/ui/button";
import FloatingInput from "@/components/floating-input";
import {
    BadgeCheck,
    Briefcase,
    Building2,
    CheckCircle,
    FileSpreadsheetIcon,
    Image as ImageIcon,
    ShieldAlert,
    UploadCloud,
    User,
    X,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import ConfirmPasswordDialog from "@/Components/ConfirmPasswordDialog";
import useEmployeeEditForm from "../hooks/useEmployeeEditForm";
import {
    CustomDropdownCheckbox,
    CustomDropdownCheckboxObject,
    CustomDropdownWorkSchedule,
} from "@/components/dropdown-menu-main";

const EmployeeEditDialog = ({
    editForm,
    setEditForm,
    editOpen,
    setEditOpen,
    offices = [],
    stations = [],
    workSchedules = [],
    userStationId,
}) => {
    const {
        buildUpdatePayload,
        canEditOffice,
        clearNewProfileImage,
        displayImage,
        fileInputRef,
        handleNameChange,
        handleProfileImageChange,
        initials,
        isHead,
        previewUrl,
        safeForm,
        scheduleItems,
        selectedOffice,
        selectedStation,
        selectedWorkSchedule,
        updateForm,
    } = useEmployeeEditForm({
        editForm,
        editOpen,
        offices,
        setEditForm,
        stations,
        userStationId,
        workSchedules,
    });

    const handleOpenChange = (nextOpen) => {
        setEditOpen(nextOpen);
    };

    return (
        <Dialog open={editOpen} onOpenChange={handleOpenChange}>
            <DialogContent className="max-h-[92vh] overflow-y-auto border-0 p-0 sm:max-w-[56rem]">
                <div className="relative overflow-hidden rounded-2xl border border-blue-100 bg-white">
                    <div className="absolute inset-x-0 top-0 h-24 bg-blue-700" />

                    <div className="relative px-5 py-4">
                        <DialogHeader className="mb-12 text-white">
                            <div className="flex items-start gap-4">
                                <div className="flex h-11 w-11 items-center justify-center rounded-3xl bg-white/15 backdrop-blur">
                                    <BadgeCheck className="h-6 w-6" />
                                </div>
                                <div>
                                    <DialogTitle className="text-lg font-bold text-white">
                                        Edit Employee
                                    </DialogTitle>
                                    <DialogDescription className="max-w-2xl text-sm text-blue-100">
                                        Update profile photo, identity,
                                        assignment, work type, and employment
                                        status.
                                    </DialogDescription>
                                </div>
                            </div>
                        </DialogHeader>

                        <div className="grid gap-4 lg:grid-cols-[280px_1fr]">
                            <div className="rounded-3xl border border-slate-200 bg-gradient-to-b from-slate-50 to-white p-5 shadow-sm">
                                <div className="flex items-center gap-3">
                                    <div className="rounded-2xl bg-blue-100 p-2 text-blue-700">
                                        <ImageIcon className="h-5 w-5" />
                                    </div>
                                    <div>
                                        <p className="font-semibold text-slate-800">
                                            Profile Photo
                                        </p>
                                        <p className="text-xs text-slate-500">
                                            Upload a new employee photo.
                                        </p>
                                    </div>
                                </div>

                                <div className="flex flex-col items-center mt-5">
                                    <div className="relative">
                                        <div className="flex h-36 w-36 items-center justify-center overflow-hidden rounded-full border-4 border-white bg-gradient-to-br from-blue-100 to-slate-200 shadow-[0_12px_30px_-18px_rgba(15,23,42,0.55)]">
                                            {displayImage ? (
                                                <img
                                                    src={displayImage}
                                                    alt="Profile preview"
                                                    className="h-full w-full object-cover"
                                                />
                                            ) : (
                                                <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-blue-600 to-sky-400 text-4xl font-bold text-white">
                                                    {initials || (
                                                        <User className="h-12 w-12" />
                                                    )}
                                                </div>
                                            )}
                                        </div>

                                        {previewUrl && (
                                            <button
                                                type="button"
                                                onClick={clearNewProfileImage}
                                                className="absolute right-2 top-2 rounded-full bg-white p-2 text-slate-600 shadow-md transition hover:bg-slate-100"
                                                aria-label="Remove new profile image"
                                            >
                                                <X className="h-4 w-4" />
                                            </button>
                                        )}
                                    </div>

                                    <div className="mt-5 w-full">
                                        <input
                                            ref={fileInputRef}
                                            id="edit_profile_img"
                                            type="file"
                                            accept="image/*"
                                            onChange={handleProfileImageChange}
                                            className="hidden"
                                        />

                                        <label
                                            htmlFor="edit_profile_img"
                                            className="flex cursor-pointer items-center justify-center gap-2 rounded-2xl border border-dashed border-blue-200 bg-white px-4 py-3 text-sm font-medium text-blue-700 transition hover:border-blue-400 hover:bg-blue-50"
                                        >
                                            <UploadCloud className="h-4 w-4" />
                                            Change Photo
                                        </label>

                                        <p className="mt-2 text-center text-xs text-slate-500">
                                            JPG, PNG, or WEBP up to 2MB.
                                        </p>
                                    </div>
                                </div>
                            </div>

                            <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
                                <div className="mb-4">
                                    <h3 className="text-base font-semibold text-slate-800">
                                        Employee Details
                                    </h3>
                                    <p className="text-sm text-slate-500">
                                        Keep employee profile and assignment
                                        data accurate.
                                    </p>
                                </div>

                                <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                                    <FloatingInput
                                        label="First Name"
                                        icon={User}
                                        value={safeForm.first_name || ""}
                                        onChange={(event) =>
                                            handleNameChange(
                                                "first_name",
                                                event.target.value,
                                            )
                                        }
                                    />

                                    <FloatingInput
                                        label="Last Name"
                                        icon={User}
                                        value={safeForm.last_name || ""}
                                        onChange={(event) =>
                                            handleNameChange(
                                                "last_name",
                                                event.target.value,
                                            )
                                        }
                                    />

                                    <FloatingInput
                                        label="Middle Name"
                                        icon={User}
                                        value={safeForm.middle_name || ""}
                                        onChange={(event) =>
                                            handleNameChange(
                                                "middle_name",
                                                event.target.value,
                                            )
                                        }
                                    />

                                    <FloatingInput
                                        label="Position"
                                        icon={Briefcase}
                                        value={safeForm.position || ""}
                                        onChange={(event) =>
                                            updateForm(
                                                "position",
                                                event.target.value,
                                            )
                                        }
                                    />

                                    <div className="relative w-full md:col-span-2">
                                        <FloatingInput
                                            label="Station"
                                            icon={Building2}
                                            value={selectedStation?.name || ""}
                                            readOnly
                                            inputClassName="truncate pr-12"
                                        />

                                        <div className="absolute right-2 top-0 flex h-full items-center">
                                            <CustomDropdownCheckbox
                                                label="Select Station"
                                                items={
                                                    stations?.map(
                                                        (station) =>
                                                            station.name,
                                                    ) || []
                                                }
                                                selected={selectedStation?.name}
                                                onChange={(value) => {
                                                    const station =
                                                        stations?.find(
                                                            (item) =>
                                                                item.name ===
                                                                value,
                                                        );

                                                    updateForm(
                                                        "station_id",
                                                        station?.id || "",
                                                    );
                                                }}
                                                buttonVariant="white"
                                                iconOnly
                                            />
                                        </div>
                                    </div>

                                    <div className="relative w-full md:col-span-2">
                                        <FloatingInput
                                            label="Office"
                                            icon={Building2}
                                            value={selectedOffice?.name || ""}
                                            readOnly
                                            inputClassName="truncate pr-12"
                                        />

                                        {isHead ? (
                                            <div className="absolute right-2 top-0 flex h-full items-center">
                                                <HoverCard>
                                                    <HoverCardTrigger asChild>
                                                        <button
                                                            type="button"
                                                            className="cursor-pointer"
                                                        >
                                                            <Badge className="flex items-center gap-1 border border-red-300 bg-red-100 text-red-700">
                                                                <ShieldAlert className="h-3.5 w-3.5" />
                                                            </Badge>
                                                        </button>
                                                    </HoverCardTrigger>

                                                    <HoverCardContent
                                                        side="left"
                                                        align="center"
                                                        sideOffset={10}
                                                        collisionPadding={24}
                                                        className="z-[120] w-64 rounded-lg border bg-white px-3 py-2 text-xs shadow-md"
                                                    >
                                                        <div className="font-medium text-red-600">
                                                            Head Assignment
                                                            Active
                                                        </div>
                                                        <p className="mt-1 text-slate-600">
                                                            Remove the head
                                                            assignment first
                                                            before changing the
                                                            office.
                                                        </p>
                                                    </HoverCardContent>
                                                </HoverCard>
                                            </div>
                                        ) : (
                                            <div
                                                className={`absolute right-2 top-0 flex h-full items-center ${
                                                    !canEditOffice
                                                        ? "pointer-events-none opacity-50"
                                                        : ""
                                                }`}
                                            >
                                                <CustomDropdownCheckboxObject
                                                    label="Select Office"
                                                    items={offices}
                                                    selected={
                                                        safeForm.office_id || ""
                                                    }
                                                    onChange={(value) =>
                                                        updateForm(
                                                            "office_id",
                                                            value,
                                                        )
                                                    }
                                                    buttonVariant="white"
                                                    iconOnly
                                                    disabled={!canEditOffice}
                                                />
                                            </div>
                                        )}
                                    </div>

                                    <div className="relative w-full">
                                        <FloatingInput
                                            label="Work Schedule"
                                            icon={Briefcase}
                                            value={
                                                [
                                                    selectedWorkSchedule
                                                        ?.work_type?.name,
                                                    selectedWorkSchedule?.name ||
                                                        safeForm.work_schedule
                                                            ?.name,
                                                ]
                                                    .filter(Boolean)
                                                    .join(" - ") || ""
                                            }
                                            inputClassName="truncate pr-12"
                                            readOnly
                                        />

                                        <div className="absolute right-2 top-0 flex h-full items-center">
                                            <CustomDropdownWorkSchedule
                                                label="Select Work Schedule"
                                                items={scheduleItems}
                                                selected={
                                                    safeForm.work_schedule_id ||
                                                    ""
                                                }
                                                onChange={(value) =>
                                                    updateForm(
                                                        "work_schedule_id",
                                                        value,
                                                    )
                                                }
                                                buttonVariant="white"
                                                iconOnly
                                            />
                                        </div>
                                    </div>

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

                                        <div className="absolute right-2 top-0 flex h-full items-center">
                                            <CustomDropdownCheckbox
                                                label="Select Status"
                                                items={["Active", "Inactive"]}
                                                selected={
                                                    safeForm.active_status
                                                        ? "Active"
                                                        : "Inactive"
                                                }
                                                onChange={(value) =>
                                                    updateForm(
                                                        "active_status",
                                                        value === "Active"
                                                            ? 1
                                                            : 0,
                                                    )
                                                }
                                                buttonVariant="white"
                                                iconOnly
                                            />
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <DialogFooter className="mt-5 gap-2">
                            <Button
                                type="button"
                                variant="outline"
                                onClick={() => setEditOpen(false)}
                            >
                                Cancel
                            </Button>

                            {safeForm?.id && (
                                <ConfirmPasswordDialog
                                    trigger={
                                        <Button variant="blue">
                                            Save Changes
                                        </Button>
                                    }
                                    action={route(
                                        "employees.update",
                                        safeForm.id,
                                    )}
                                    method="put"
                                    data={buildUpdatePayload()}
                                    forceFormData={
                                        safeForm.profile_img instanceof File
                                    }
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
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    );
};

export default EmployeeEditDialog;
