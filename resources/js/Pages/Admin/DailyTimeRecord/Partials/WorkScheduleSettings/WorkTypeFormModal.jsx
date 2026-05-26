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
import ConfirmPasswordDialog from "@/Components/ConfirmPasswordDialog";
import InputError from "@/Components/InputError";
import { TimerReset } from "lucide-react";
import useWorkTypeFormModal from "./hooks/useWorkTypeFormModal";

const WorkTypeFormModal = ({ mode, open, onClose, workType }) => {
    const {
        canSubmit,
        confirmOpen,
        errors,
        isEdit,
        name,
        payload,
        setConfirmOpen,
        setName,
        submitAdd,
    } = useWorkTypeFormModal({ mode, open, onClose, workType });

    return (
        <>
            <Dialog open={open} onOpenChange={(nextOpen) => !nextOpen && onClose()}>
                <DialogContent className="max-w-md overflow-hidden rounded-2xl p-0">
                    <div className="bg-blue-700 px-5 py-4 text-white">
                        <DialogHeader>
                            <DialogTitle className="flex items-center gap-2 text-white">
                                <TimerReset className="h-5 w-5" />
                                {isEdit ? "Edit Work Type" : "Add Work Type"}
                            </DialogTitle>
                            <DialogDescription className="text-blue-100">
                                Manage work arrangement categories.
                            </DialogDescription>
                        </DialogHeader>
                    </div>

                    <form
                        onSubmit={isEdit ? (event) => event.preventDefault() : submitAdd}
                        className="space-y-4 px-5 pb-5 pt-4"
                    >
                        <div>
                            <label className="mb-2 block text-sm font-medium text-slate-700">
                                Name
                            </label>
                            <Input
                                value={name}
                                onChange={(event) => setName(event.target.value)}
                                className="h-11 rounded-xl border-blue-200"
                                placeholder="Full, Fixed, Work From Home"
                            />
                            <InputError message={errors.name} className="mt-2" />
                        </div>

                        <div className="flex justify-end gap-2">
                            <Button type="button" variant="outline" onClick={onClose}>
                                Cancel
                            </Button>
                            {isEdit ? (
                                <Button
                                    type="button"
                                    disabled={!canSubmit}
                                    onClick={() => setConfirmOpen(true)}
                                    className="bg-blue-600 text-white hover:bg-blue-700"
                                >
                                    Save Changes
                                </Button>
                            ) : (
                                <Button
                                    type="submit"
                                    disabled={!canSubmit}
                                    className="bg-blue-600 text-white hover:bg-blue-700"
                                >
                                    Save
                                </Button>
                            )}
                        </div>
                    </form>
                </DialogContent>
            </Dialog>

            {isEdit ? (
                <ConfirmPasswordDialog
                    trigger={null}
                    title="Confirm Work Type Update"
                    description="Please confirm your password before updating this work type."
                    action={workType?.id ? route("dailytimerecord.worktypes.update", workType.id) : ""}
                    method="put"
                    data={payload}
                    danger={false}
                    itemLabel="Work Type"
                    itemName={workType?.name || ""}
                    confirmText="Update Work Type"
                    processingText="Updating..."
                    open={confirmOpen}
                    onOpenChange={setConfirmOpen}
                    onSuccess={onClose}
                    onError={() => setConfirmOpen(true)}
                />
            ) : null}
        </>
    );
};

export default WorkTypeFormModal;
