import React, { useState } from "react";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { router } from "@inertiajs/react";

const AddDepartmentModal = ({ open, setOpen }) => {
    const [name, setName] = useState("");

    const handleSave = () => {
        if (!name.trim()) return;

        router.post(
            route("department.storeDepartment"),
            {
                name: name,
            },
            {
                onSuccess: () => {
                    setName("");
                    setOpen(false);
                },
            },
        );
    };

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogContent className="max-w-md">
                <DialogHeader>
                    <DialogTitle>Add Department</DialogTitle>
                    <DialogDescription>
                        Create a new department here.
                    </DialogDescription>
                </DialogHeader>

                <div className="space-y-4">
                    {/* INPUT */}
                    <Input
                        placeholder="Department name"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                    />

                    {/* FOOTER */}
                    <div className="flex justify-end gap-2 pt-2">
                        <Button
                            variant="outline"
                            onClick={() => setOpen(false)}
                        >
                            Cancel
                        </Button>

                        <Button
                            className="bg-blue-600 hover:bg-blue-700 text-white"
                            onClick={handleSave}
                        >
                            Save
                        </Button>
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    );
};

export default AddDepartmentModal;
