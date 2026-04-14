import React from "react";
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
import { BriefcaseBusiness, Layers3, Building2, Hash } from "lucide-react";

const AddPositionForm = ({ open, setOpen }) => {
    const { data, setData, post, processing, errors, reset, clearErrors } =
        useForm({
            position_name: "",
            category: "",
            level: "",
            salary_grade: "",
        });

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

        post(route("position.store"), {
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
                <DialogHeader className="bg-gradient-to-r from-blue-700 via-blue-600 to-cyan-500 px-6 py-6 text-white">
                    <div className="flex items-start gap-4">
                        <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-white/15 backdrop-blur-sm">
                            <BriefcaseBusiness className="h-6 w-6" />
                        </div>

                        <div className="space-y-1">
                            <DialogTitle className="text-xl font-bold tracking-tight">
                                Add Position
                            </DialogTitle>
                            <DialogDescription className="text-blue-100">
                                Create a new position record and define its
                                classification details.
                            </DialogDescription>
                        </div>
                    </div>
                </DialogHeader>

                <form onSubmit={handleSubmit} className="px-6 py-6">
                    <div className="mb-6 rounded-xl border border-blue-100 bg-blue-50 px-4 py-3">
                        <p className="text-sm text-blue-900">
                            Fill in the position details below. Required fields
                            should be completed before saving.
                        </p>
                    </div>

                    <div className="space-y-5">
                        <div>
                            <label className="mb-2 flex items-center gap-2 text-sm font-semibold text-gray-700">
                                <BriefcaseBusiness className="h-4 w-4 text-blue-600" />
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
                                    <Layers3 className="h-4 w-4 text-blue-600" />
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
                                    <Building2 className="h-4 w-4 text-blue-600" />
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
                                    <Hash className="h-4 w-4 text-blue-600" />
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
                                        This position will be saved as{" "}
                                        <span className="font-semibold text-green-600">
                                            active
                                        </span>{" "}
                                        by default.
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>

                    <DialogFooter className="mt-8 flex-col-reverse gap-2 border-t pt-5 sm:flex-row sm:justify-end">
                        <Button
                            type="button"
                            variant="outline"
                            className="w-full sm:w-auto rounded-xl"
                            onClick={handleClose}
                            disabled={processing}
                        >
                            Cancel
                        </Button>

                        <Button
                            type="submit"
                            className="w-full sm:w-auto rounded-xl bg-blue-600 hover:bg-blue-700"
                            disabled={processing}
                        >
                            {processing ? "Saving..." : "Add Position"}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
};

export default AddPositionForm;
