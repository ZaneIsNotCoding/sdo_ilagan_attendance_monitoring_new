import { useState } from "react";
import { router } from "@inertiajs/react";
import { Loader2, AlertTriangle } from "lucide-react";

import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogFooter,
    DialogTrigger,
} from "@/components/ui/dialog";

const DeleteDepartmentModal = ({ department, trigger }) => {
    const [open, setOpen] = useState(false);
    const [loading, setLoading] = useState(false);

    const handleDelete = () => {
        setLoading(true);

        router.delete(route("department.destroy", department.id), {
            preserveScroll: true,

            onSuccess: () => {
                setLoading(false);
                setOpen(false);
            },

            onError: () => {
                setLoading(false);
            },
        });
    };

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>{trigger}</DialogTrigger>

            <DialogContent className="max-w-md">
                <DialogHeader>
                    <div className="flex items-center gap-3">
                        <div className="p-2 bg-red-100 rounded-full">
                            <AlertTriangle className="text-red-600 w-5 h-5" />
                        </div>

                        <DialogTitle>Delete Department</DialogTitle>
                    </div>
                </DialogHeader>

                {/* MAIN WARNING */}
                <div className="space-y-3 text-sm text-gray-600">
                    <p>
                        Are you sure you want to delete{" "}
                        <span className="font-semibold">
                            {department?.name}
                        </span>
                        ?
                    </p>

                    {/* ADDED DESCRIPTION */}
                    <div className="rounded-lg border border-red-200 bg-red-50 p-3 text-red-700">
                        <p className="flex gap-2">
                            <AlertTriangle className="w-4 h-4 mt-0.5" />
                            <span>
                                Employees assigned to this department will be
                                unlinked. You will need to reassign them again
                                after deletion.
                            </span>
                        </p>
                    </div>
                </div>

                <DialogFooter className="gap-2">
                    <button
                        onClick={() => setOpen(false)}
                        disabled={loading}
                        className="px-4 py-2 text-sm border rounded-lg"
                    >
                        Cancel
                    </button>

                    <button
                        onClick={handleDelete}
                        disabled={loading}
                        className="px-4 py-2 text-sm text-white bg-red-600 rounded-lg flex items-center gap-2"
                    >
                        {loading && (
                            <Loader2 className="w-4 h-4 animate-spin" />
                        )}
                        {loading ? "Deleting..." : "Delete"}
                    </button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
};

export default DeleteDepartmentModal;
