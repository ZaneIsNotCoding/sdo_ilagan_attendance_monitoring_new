import React from "react";
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
import { usePage } from "@inertiajs/react";
import { Building2, Save, ShieldCheck } from "lucide-react";
import useEditDivisionForm from "../hooks/useEditDivisionForm";

const EditDivisionModal = ({ open, setOpen, division }) => {
    const { errors = {} } = usePage().props;
    const {
        canSubmit,
        code,
        handleSuccess,
        name,
        openConfirm,
        setCode,
        setName,
        setOpenConfirm,
    } = useEditDivisionForm({ division, open, setOpen });

    return (
        <>
            <Dialog open={open} onOpenChange={setOpen}>
                <DialogContent className="max-w-md overflow-hidden rounded-2xl p-0">
                    <div className="bg-blue-700 px-5 py-4 text-white">
                        <DialogHeader>
                            <DialogTitle className="flex items-center gap-2 text-white">
                                <Building2 className="h-5 w-5" />
                                Edit Division
                            </DialogTitle>
                            <DialogDescription className="text-blue-100">
                                Update the division code and name.
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
                                        Editing a division requires password
                                        confirmation.
                                    </p>
                                </div>
                            </div>
                        </div>

                        <div>
                            <label
                                htmlFor="edit_division_code"
                                className="mb-2 block text-sm font-medium text-slate-700"
                            >
                                Code
                            </label>
                            <Input
                                id="edit_division_code"
                                value={code}
                                onChange={(e) => setCode(e.target.value)}
                                className="h-11 rounded-xl border-blue-200 bg-white text-sm shadow-sm focus-visible:ring-blue-500"
                            />
                            <InputError
                                message={errors.code}
                                className="mt-2 text-xs"
                            />
                        </div>

                        <div>
                            <label
                                htmlFor="edit_division_name"
                                className="mb-2 block text-sm font-medium text-slate-700"
                            >
                                Division name
                            </label>
                            <Input
                                id="edit_division_name"
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
                title="Confirm Division Update"
                description="Please confirm your password before updating this division."
                action={
                    division ? route("department.updateDepartment", division.id) : ""
                }
                method="put"
                data={{ code: code.trim(), name: name.trim() }}
                danger={false}
                itemLabel="Division"
                itemName={division?.name || ""}
                confirmText="Update Division"
                processingText="Updating..."
                note="The division will be saved immediately after password confirmation."
                onSuccess={handleSuccess}
                onError={() => setOpenConfirm(true)}
                open={openConfirm}
                onOpenChange={setOpenConfirm}
            />
        </>
    );
};

export default EditDivisionModal;
