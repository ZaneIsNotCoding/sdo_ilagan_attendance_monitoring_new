import React, { useEffect, useRef, useState } from "react";
import FloatingInput from "@/components/floating-input";
import {
    UserPlus,
    User,
    Briefcase,
    Building2,
    UploadCloud,
    Image as ImageIcon,
    X,
} from "lucide-react";
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
import {
    CustomDropdownCheckbox,
    CustomDropdownCheckboxObject,
} from "@/components/dropdown-menu-main";
import { router } from "@inertiajs/react";

const work_type_choices = ["Full", "Fixed", "Work From Home"];

const EmployeeRegistration = ({ userStationId, offices = [] }) => {
    const fileInputRef = useRef(null);
    const [previewUrl, setPreviewUrl] = useState(null);
    const [form, setForm] = useState({
        first_name: "",
        middle_name: "",
        last_name: "",
        profile_img: null,
        position: "",
        office_id: "",
        work_type: "",
        station_id: "",
    });

    const isDepartmentLocked = Number(userStationId) !== 1;

    useEffect(() => {
        setForm((prev) => ({
            ...prev,
            station_id: userStationId,
        }));
    }, [userStationId]);

    useEffect(() => {
        return () => {
            if (previewUrl?.startsWith("blob:")) {
                URL.revokeObjectURL(previewUrl);
            }
        };
    }, [previewUrl]);

    const handleFormChange = (e) => {
        const { name, value } = e.target;

        if (["first_name", "middle_name", "last_name"].includes(name)) {
            const regex = /^[A-Za-z\s-]*$/;
            if (!regex.test(value)) return;
        }

        setForm((prev) => ({ ...prev, [name]: value }));
    };

    const handleProfileImageChange = (e) => {
        const file = e.target.files?.[0];

        if (!file) return;

        if (previewUrl?.startsWith("blob:")) {
            URL.revokeObjectURL(previewUrl);
        }

        setForm((prev) => ({
            ...prev,
            profile_img: file,
        }));

        setPreviewUrl(URL.createObjectURL(file));
    };

    const clearProfileImage = () => {
        if (previewUrl?.startsWith("blob:")) {
            URL.revokeObjectURL(previewUrl);
        }

        setPreviewUrl(null);
        setForm((prev) => ({ ...prev, profile_img: null }));

        if (fileInputRef.current) {
            fileInputRef.current.value = "";
        }
    };

    const handleAddEmployee = () => {
        router.post(route("employees.store"), form, {
            preserveScroll: true,
            forceFormData: true,
            onSuccess: () => {
                if (previewUrl?.startsWith("blob:")) {
                    URL.revokeObjectURL(previewUrl);
                }

                setPreviewUrl(null);
                setForm({
                    first_name: "",
                    middle_name: "",
                    last_name: "",
                    profile_img: null,
                    position: "",
                    office_id: "",
                    work_type: "",
                    station_id: userStationId,
                });

                if (fileInputRef.current) {
                    fileInputRef.current.value = "";
                }

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

    const isFormComplete =
        form.first_name.trim() &&
        form.middle_name.trim() &&
        form.last_name.trim() &&
        form.position.trim() &&
        form.office_id &&
        form.work_type &&
        form.station_id;

    const displayOffice =
        offices?.find((office) => office.id === form.office_id)?.name || "";

    const initials =
        `${form.first_name?.[0] || ""}${form.last_name?.[0] || ""}`.toUpperCase();

    return (
        <div className="relative overflow-hidden rounded-2xl border border-blue-100 bg-white md:col-span-2">
            <div className="absolute inset-x-0 top-0 h-20 bg-blue-700" />
            <div className="relative px-5 py-4">
                <div className="mb-8 flex items-start justify-between gap-4 text-white">
                    <div className="flex items-start gap-4">
                        <div className="flex h-11 w-11 items-center justify-center rounded-3xl bg-white/15 backdrop-blur">
                            <UserPlus className="h-6 w-6" />
                        </div>

                        <div>
                            <h2 className="text-lg font-bold">
                                Employee Registration
                            </h2>
                            <p className="max-w text-sm text-blue-100">
                                Register a new employee, attach a profile photo,
                                and assign the correct station and office in
                                one place.
                            </p>
                        </div>
                    </div>
                </div>

                <div className="grid gap-4 xl:grid-cols-[320px_1fr]">
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
                                    Optional, but it makes the employee card
                                    cleaner.
                                </p>
                            </div>
                        </div>

                        <div className="mt-5 flex flex-col items-center">
                            <div className="relative">
                                <div className="flex h-36 w-36 items-center justify-center overflow-hidden rounded-full border-4 border-white bg-gradient-to-br from-blue-100 to-slate-200 shadow-[0_12px_30px_-18px_rgba(15,23,42,0.55)]">
                                    {previewUrl ? (
                                        <img
                                            src={previewUrl}
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
                                        onClick={clearProfileImage}
                                        className="absolute right-2 top-2 rounded-full bg-white p-2 text-slate-600 shadow-md transition hover:bg-slate-100"
                                        aria-label="Remove profile image"
                                    >
                                        <X className="h-4 w-4" />
                                    </button>
                                )}
                            </div>

                            <div className="mt-5 w-full">
                                <input
                                    ref={fileInputRef}
                                    id="profile_img"
                                    type="file"
                                    accept="image/*"
                                    onChange={handleProfileImageChange}
                                    className="hidden"
                                />

                                <label
                                    htmlFor="profile_img"
                                    className="flex cursor-pointer items-center justify-center gap-2 rounded-2xl border border-dashed border-blue-200 bg-white px-4 py-3 text-sm font-medium text-blue-700 transition hover:border-blue-400 hover:bg-blue-50"
                                >
                                    <UploadCloud className="h-4 w-4" />
                                    Upload Photo
                                </label>

                                <p className="mt-2 text-center text-xs text-slate-500">
                                    JPG, PNG, or WEBP up to 2MB.
                                </p>
                            </div>
                        </div>
                    </div>

                    <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
                        <div className="mb-4 flex items-center justify-between gap-4">
                            <div>
                                <h3 className="text-base font-semibold text-slate-800">
                                    Employee Details
                                </h3>
                                <p className="text-sm text-slate-500">
                                    Fill out the core identity and assignment
                                    fields.
                                </p>
                            </div>
                        </div>

                        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                            <FloatingInput
                                label="First Name"
                                icon={User}
                                name="first_name"
                                value={form.first_name}
                                onChange={handleFormChange}
                            />

                            <FloatingInput
                                label="Last Name"
                                icon={User}
                                name="last_name"
                                value={form.last_name}
                                onChange={handleFormChange}
                            />

                            <FloatingInput
                                label="Middle Name"
                                icon={User}
                                name="middle_name"
                                value={form.middle_name}
                                onChange={handleFormChange}
                            />

                            <FloatingInput
                                label="Position"
                                icon={Briefcase}
                                name="position"
                                value={form.position}
                                onChange={handleFormChange}
                            />

                            <div className="relative w-full md:col-span-2">
                                <FloatingInput
                                    label="Office"
                                    icon={Building2}
                                    value={displayOffice}
                                    readOnly
                                    onChange={() => {}}
                                />
                                <div
                                    className={`absolute right-2 top-0 flex h-full items-center ${
                                        isDepartmentLocked
                                            ? "pointer-events-none opacity-50"
                                            : ""
                                    }`}
                                >
                                    <CustomDropdownCheckboxObject
                                        label="Select Office"
                                        items={offices}
                                        onChange={(val) =>
                                            setForm((prev) => ({
                                                ...prev,
                                                office_id: val,
                                            }))
                                        }
                                        buttonVariant="white"
                                        iconOnly
                                        disabled={isDepartmentLocked}
                                    />
                                </div>
                            </div>

                            <div className="relative w-full md:col-span-2">
                                <FloatingInput
                                    label="Work Type"
                                    icon={Briefcase}
                                    value={form.work_type || ""}
                                    readOnly
                                    onChange={() => {}}
                                />
                                <div className="absolute right-2 top-0 flex h-full items-center">
                                    <CustomDropdownCheckbox
                                        label="Select Work Type"
                                        items={work_type_choices}
                                        selected={form.work_type}
                                        onChange={(val) =>
                                            setForm((prev) => ({
                                                ...prev,
                                                work_type: val,
                                            }))
                                        }
                                        buttonVariant="white"
                                        iconOnly
                                    />
                                </div>
                            </div>
                        </div>

                        <div className="mt-6">
                            <AlertDialog>
                                <AlertDialogTrigger asChild>
                                    <Button
                                        variant="blue"
                                        disabled={!isFormComplete}
                                        className="h-10 w-full rounded-xl text-base font-semibold shadow-lg shadow-blue-200 transition hover:shadow-xl hover:shadow-blue-300"
                                    >
                                        Add Employee
                                    </Button>
                                </AlertDialogTrigger>

                                <AlertDialogContent className="rounded-3xl">
                                    <AlertDialogHeader>
                                        <AlertDialogTitle>
                                            Confirm Add Employee
                                        </AlertDialogTitle>
                                        <AlertDialogDescription>
                                            Are you sure you want to add this
                                            employee?
                                        </AlertDialogDescription>
                                    </AlertDialogHeader>

                                    <AlertDialogFooter>
                                        <AlertDialogCancel>
                                            Cancel
                                        </AlertDialogCancel>
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
                    </div>
                </div>
            </div>
        </div>
    );
};

export default EmployeeRegistration;
