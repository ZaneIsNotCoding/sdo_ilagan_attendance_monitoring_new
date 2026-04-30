import React, { useEffect, useState } from "react";
import { router } from "@inertiajs/react";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Building2, Sparkles } from "lucide-react";
import { CustomDropdownCheckboxObject } from "@/components/dropdown-menu-main";

const AddOfficeModal = ({ open, setOpen, divisions = [] }) => {
    const [divisionId, setDivisionId] = useState("");
    const [name, setName] = useState("");
    const selectedDivision = divisions.find(
        (division) => String(division.id) === String(divisionId),
    );

    useEffect(() => {
        if (open) {
            setDivisionId("");
            setName("");
        }
    }, [open]);

    const handleSubmit = (e) => {
        e.preventDefault();
        router.post(
            route("office.storeOffice"),
            { division_id: divisionId, name },
            { onSuccess: () => setOpen(false) },
        );
    };

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogContent className="max-w-md overflow-hidden rounded-2xl p-0">
                <div className="bg-slate-900 px-5 py-4 text-white">
                    <DialogHeader>
                        <DialogTitle className="flex items-center gap-2 text-white">
                            <Building2 className="h-5 w-5" />
                            Add Office
                        </DialogTitle>
                        <DialogDescription className="text-slate-300">
                            Create a new office under a division.
                        </DialogDescription>
                    </DialogHeader>
                </div>

                <form
                    onSubmit={handleSubmit}
                    className="space-y-4 px-5 pb-5 pt-4"
                >
                    <div className="rounded-xl border border-slate-200 bg-slate-50 p-3">
                        <div className="flex items-start gap-3">
                            <div className="rounded-xl bg-white p-2 shadow-sm">
                                <Sparkles className="h-4 w-4 text-slate-700" />
                            </div>

                            <div>
                                <p className="text-sm font-semibold text-slate-800">
                                    Office Details
                                </p>
                                <p className="mt-0.5 text-xs leading-5 text-slate-500">
                                    Choose the division and give the office a
                                    clear name.
                                </p>
                            </div>
                        </div>
                    </div>

                    <div>
                        <label className="mb-2 block text-sm font-medium text-slate-700">
                            Division
                        </label>
                        <CustomDropdownCheckboxObject
                            items={divisions}
                            selected={divisionId}
                            onChange={setDivisionId}
                            buttonLabel={
                                selectedDivision
                                    ? `${selectedDivision.code} - ${selectedDivision.name}`
                                    : "Select division"
                            }
                            buttonVariant="outline"
                            className="h-11 w-full justify-between rounded-xl border-slate-300 bg-white px-3 text-sm shadow-sm hover:bg-slate-50"
                        />
                    </div>

                    <div>
                        <label className="mb-2 block text-sm font-medium text-slate-700">
                            Office Name
                        </label>
                        <input
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            className="h-11 w-full rounded-xl border border-slate-300 px-3 text-sm shadow-sm outline-none focus:border-slate-500 focus:ring-2 focus:ring-slate-100"
                            placeholder="Enter office name"
                        />
                    </div>

                    <div className="flex justify-end gap-2 pt-1">
                        <Button
                            type="button"
                            variant="outline"
                            onClick={() => setOpen(false)}
                        >
                            Cancel
                        </Button>
                        <Button
                            type="submit"
                            disabled={!divisionId || !name}
                            className="bg-slate-900 text-white hover:bg-slate-700"
                        >
                            Save
                        </Button>
                    </div>
                </form>
            </DialogContent>
        </Dialog>
    );
};

export default AddOfficeModal;
