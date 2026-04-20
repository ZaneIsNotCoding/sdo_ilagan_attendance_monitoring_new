"use client";

import React, { useState, useEffect } from "react";
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

const EditDepartment = ({ open, setOpen, department }) => {
    const [name, setName] = useState("");

    useEffect(() => {
        if (department) {
            setName(department.name || "");
        }
    }, [department]);

    const handleUpdate = () => {
        if (!name.trim()) return;

        router.put(
            route("department.updateDepartment", department.id),
            {
                name: name,
            },
            {
                onSuccess: () => {
                    setOpen(false);
                },
            },
        );
    };

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogContent className="max-w-md">
                <DialogHeader>
                    <DialogTitle>Edit Department</DialogTitle>
                    <DialogDescription>
                        Update department name here.
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
                            onClick={handleUpdate}
                        >
                            Save
                        </Button>
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    );
};

export default EditDepartment;
