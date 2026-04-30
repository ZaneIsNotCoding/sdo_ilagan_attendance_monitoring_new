import React, { useEffect, useState } from "react";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import InputError from "@/Components/InputError";
import ConfirmPasswordDialog from "@/Components/ConfirmPasswordDialog";
import { CustomDropdownCheckboxObject } from "@/components/dropdown-menu-main";
import { usePage } from "@inertiajs/react";
import { Building2, Save, ShieldCheck } from "lucide-react";

const EditOfficeModal = ({ open, setOpen, office, divisions = [] }) => {
    const { errors = {} } = usePage().props;
    const [divisionId, setDivisionId] = useState("");
    const [name, setName] = useState("");
    const [openConfirm, setOpenConfirm] = useState(false);
    const divisionOptions = divisions.map((division) => ({
        ...division,
        name: [division.code, division.name].filter(Boolean).join(" - "),
    }));
    const selectedDivisionLabel =
        divisionOptions.find(
            (division) => String(division.id) === String(divisionId),
        )?.name || "Select division";

    useEffect(() => {
        if (office) {
            setDivisionId(office.division_id?.toString?.() || "");
            setName(office.name || "");
        }
    }, [office]);

    useEffect(() => {
        if (!open) setOpenConfirm(false);
    }, [open]);

    const canSubmit =
        Boolean(office?.id) &&
        divisionId &&
        name.trim().length > 0 &&
        (divisionId !== office?.division_id?.toString?.() ||
            name.trim() !== (office?.name || "").trim());

    return (
        <>
            <Dialog open={open} onOpenChange={setOpen}>
                <DialogContent className="max-w-md overflow-hidden rounded-2xl p-0">
                    <div className="bg-blue-700 px-5 py-4 text-white">
                        <DialogHeader>
                            <DialogTitle className="flex items-center gap-2 text-white">
                                <Building2 className="h-5 w-5" />
                                Edit Office
                            </DialogTitle>
                            <DialogDescription className="text-blue-100">
                                Update the office name and its division.
                            </DialogDescription>
                        </DialogHeader>
                    </div>

                    <div className="space-y-4 px-5 pb-5 pt-4">
                        <div className="rounded-xl border border-blue-100 bg-blue-50 p-3">
                            <div className="flex items-start gap-3">
                                <div className="rounded-xl bg-white p-2 shadow-sm">
                                    <ShieldCheck className="h-4 w-4 text-blue-600" />
                                </div>
                                <div>
                                    <p className="text-sm font-semibold text-slate-800">
                                        Protected Update
                                    </p>
                                    <p className="mt-0.5 text-xs leading-5 text-slate-500">
                                        Editing an office requires password
                                        confirmation.
                                    </p>
                                </div>
                            </div>
                        </div>

                        <div>
                            <label className="mb-2 block text-sm font-medium text-slate-700">
                                Division
                            </label>
                            <CustomDropdownCheckboxObject
                                label="Select division"
                                items={divisionOptions}
                                selected={divisionId}
                                buttonLabel={selectedDivisionLabel}
                                onChange={(val) => setDivisionId(String(val))}
                                buttonVariant="white"
                                className="h-11 w-full rounded-xl border border-blue-200 bg-white text-sm shadow-sm hover:bg-white"
                            />
                        </div>

                        <div>
                            <label
                                htmlFor="edit_office_name"
                                className="mb-2 block text-sm font-medium text-slate-700"
                            >
                                Office name
                            </label>
                            <Input
                                id="edit_office_name"
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                                className="h-11 rounded-xl border-blue-200 bg-white text-sm shadow-sm focus-visible:ring-blue-500"
                            />
                            <InputError
                                message={errors.name}
                                className="mt-2 text-xs"
                            />
                        </div>

                        <div className="flex justify-end gap-2 pt-1">
                            <Button
                                variant="outline"
                                onClick={() => setOpen(false)}
                            >
                                Cancel
                            </Button>
                            <Button
                                className="bg-blue-600 text-white hover:bg-blue-700"
                                onClick={() => setOpenConfirm(true)}
                                disabled={!canSubmit}
                            >
                                <Save className="mr-2 h-4 w-4" />
                                Save Changes
                            </Button>
                        </div>
                    </div>
                </DialogContent>
            </Dialog>

            <ConfirmPasswordDialog
                trigger={null}
                title="Confirm Office Update"
                description="Please confirm your password before updating this office."
                action={office ? route("office.updateOffice", office.id) : ""}
                method="put"
                data={{ division_id: divisionId, name: name.trim() }}
                danger={false}
                itemLabel="Office"
                itemName={office?.name || ""}
                confirmText="Update Office"
                processingText="Updating..."
                note="The office will be saved immediately after password confirmation."
                onSuccess={() => {
                    setOpenConfirm(false);
                    setOpen(false);
                }}
                onError={() => setOpenConfirm(true)}
                open={openConfirm}
                onOpenChange={setOpenConfirm}
            />
        </>
    );
};

export default EditOfficeModal;
