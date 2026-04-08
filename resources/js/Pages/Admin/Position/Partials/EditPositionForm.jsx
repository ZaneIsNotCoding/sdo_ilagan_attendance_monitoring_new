import React, { useEffect } from "react";
import { useForm } from "@inertiajs/react";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription,
    DialogFooter,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
    BriefcaseBusiness,
    Layers3,
    Building2,
    Hash,
    Pencil,
} from "lucide-react";

const EditPositionForm = ({ open, setOpen, position }) => {
    const { data, setData, put, processing, errors, reset, clearErrors } =
        useForm({
            position_name: "",
            category: "",
            level: "",
            salary_grade: "",
        });

    useEffect(() => {
        if (open && position) {
            setData({
                position_name: position.position_name || "",
                category: position.category || "",
                level: position.level || "",
                salary_grade: position.salary_grade || "",
            });
            clearErrors();
        }
    }, [open, position]);

    const handleClose = () => {
        reset();
        clearErrors();
        setOpen(false);
    };

    const handleOpenChange = (isOpen) => {
        if (!isOpen) {
            reset();
            clearErrors();
        }

        setOpen(isOpen);
    };

    const handleSubmit = (e) => {
        e.preventDefault();

        put(route("position.update", position.id), {
            preserveScroll: true,
            onSuccess: () => {
                reset();
                clearErrors();
                setOpen(false);
            },
        });
    };

    const inputClass =
        "h-11 rounded-xl border-gray-300 bg-white shadow-sm focus-visible:ring-2 focus-visible:ring-blue-500";

    const selectClass =
        "w-full h-11 rounded-xl border border-gray-300 bg-white px-3 text-sm shadow-sm outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-500";

    return (
        <Dialog open={open} onOpenChange={handleOpenChange}>
            <DialogContent className="sm:max-w-2xl p-0 overflow-hidden rounded-2xl border-0 shadow-2xl">
                <DialogHeader className="bg-gradient-to-r from-amber-600 via-orange-500 to-yellow-500 px-6 py-6 text-white">
                    <div className="flex items-start gap-4">
                        <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-white/15 backdrop-blur-sm">
                            <Pencil className="h-6 w-6" />
                        </div>

                        <div className="space-y-1">
                            <DialogTitle className="text-xl font-bold tracking-tight">
                                Edit Position
                            </DialogTitle>
                            <DialogDescription className="text-orange-50">
                                Update the selected position record and modify
                                its classification details.
                            </DialogDescription>
                        </div>
                    </div>
                </DialogHeader>

                <form onSubmit={handleSubmit} className="px-6 py-6">
                    <div className="mb-6 rounded-xl border border-orange-100 bg-orange-50 px-4 py-3">
                        <p className="text-sm text-orange-900">
                            Review and update the position details below before
                            saving your changes.
                        </p>
                    </div>

                    <div className="space-y-5">
                        <div>
                            <label className="mb-2 flex items-center gap-2 text-sm font-semibold text-gray-700">
                                <BriefcaseBusiness className="h-4 w-4 text-orange-600" />
                                Position Name
                            </label>
                            <Input
                                className={inputClass}
                                value={data.position_name}
                                onChange={(e) =>
                                    setData("position_name", e.target.value)
                                }
                                placeholder="e.g. Teacher I, Principal I, Administrative Aide"
                            />
                            {errors.position_name && (
                                <p className="mt-1 text-sm text-red-500">
                                    {errors.position_name}
                                </p>
                            )}
                        </div>

                        <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
                            <div>
                                <label className="mb-2 flex items-center gap-2 text-sm font-semibold text-gray-700">
                                    <Layers3 className="h-4 w-4 text-orange-600" />
                                    Category
                                </label>
                                <select
                                    className={selectClass}
                                    value={data.category}
                                    onChange={(e) =>
                                        setData("category", e.target.value)
                                    }
                                >
                                    <option value="">Select category</option>
                                    <option value="Teaching">Teaching</option>

                                    <option value="Non-Teaching">
                                        Non-Teaching
                                    </option>
                                </select>
                                {errors.category && (
                                    <p className="mt-1 text-sm text-red-500">
                                        {errors.category}
                                    </p>
                                )}
                            </div>

                            <div>
                                <label className="mb-2 flex items-center gap-2 text-sm font-semibold text-gray-700">
                                    <Building2 className="h-4 w-4 text-orange-600" />
                                    Level
                                </label>
                                <select
                                    className={selectClass}
                                    value={data.level}
                                    onChange={(e) =>
                                        setData("level", e.target.value)
                                    }
                                >
                                    <option value="">Select level</option>
                                    <option value="School">School</option>
                                    <option value="Division">Division</option>
                                    <option value="Regional">Regional</option>
                                </select>
                                {errors.level && (
                                    <p className="mt-1 text-sm text-red-500">
                                        {errors.level}
                                    </p>
                                )}
                            </div>
                        </div>

                        <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
                            <div>
                                <label className="mb-2 flex items-center gap-2 text-sm font-semibold text-gray-700">
                                    <Hash className="h-4 w-4 text-orange-600" />
                                    Salary Grade
                                </label>
                                <Input
                                    type="number"
                                    className={inputClass}
                                    value={data.salary_grade}
                                    min={1}
                                    onChange={(e) =>
                                        setData("salary_grade", e.target.value)
                                    }
                                    placeholder="Enter salary grade"
                                />
                                {errors.salary_grade && (
                                    <p className="mt-1 text-sm text-red-500">
                                        {errors.salary_grade}
                                    </p>
                                )}
                            </div>

                            <div className="flex items-end">
                                <div className="w-full rounded-xl border border-dashed border-gray-300 bg-gray-50 px-4 py-3">
                                    <p className="text-sm font-medium text-gray-700">
                                        Status
                                    </p>
                                    <p className="mt-1 text-sm text-gray-500">
                                        This position is currently{" "}
                                        <span className="font-semibold text-green-600">
                                            {position?.status || "active"}
                                        </span>
                                        .
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>

                    <DialogFooter className="mt-8 flex-col-reverse gap-2 border-t pt-5 sm:flex-row sm:justify-end">
                        <Button
                            type="button"
                            variant="outline"
                            className="w-full rounded-xl sm:w-auto"
                            onClick={handleClose}
                            disabled={processing}
                        >
                            Cancel
                        </Button>

                        <Button
                            type="submit"
                            className="w-full rounded-xl bg-orange-600 hover:bg-orange-700 sm:w-auto"
                            disabled={processing}
                        >
                            {processing ? "Updating..." : "Update Position"}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
};

export default EditPositionForm;
