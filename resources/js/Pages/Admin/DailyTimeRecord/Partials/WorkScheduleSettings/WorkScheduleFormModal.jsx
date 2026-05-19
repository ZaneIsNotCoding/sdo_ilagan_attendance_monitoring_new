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
import { CustomDropdownCheckboxObject } from "@/components/dropdown-menu-main";
import { Clock3 } from "lucide-react";
import useWorkScheduleFormModal from "./hooks/useWorkScheduleFormModal";

const WorkScheduleFormModal = ({ mode, open, onClose, workSchedule, workTypes }) => {
    const {
        canSubmit,
        confirmOpen,
        errors,
        form,
        isEdit,
        payload,
        selectedWorkType,
        setConfirmOpen,
        submitAdd,
        updateField,
    } = useWorkScheduleFormModal({
        mode,
        open,
        onClose,
        workSchedule,
        workTypes,
    });

    return (
        <>
            <Dialog open={open} onOpenChange={(nextOpen) => !nextOpen && onClose()}>
                <DialogContent className="max-w-md overflow-hidden rounded-2xl p-0">
                    <div className="bg-slate-900 px-5 py-4 text-white">
                        <DialogHeader>
                            <DialogTitle className="flex items-center gap-2 text-white">
                                <Clock3 className="h-5 w-5" />
                                {isEdit ? "Edit Work Schedule" : "Add Work Schedule"}
                            </DialogTitle>
                            <DialogDescription className="text-slate-300">
                                Set the work type and time range.
                            </DialogDescription>
                        </DialogHeader>
                    </div>

                    <form
                        onSubmit={isEdit ? (event) => event.preventDefault() : submitAdd}
                        className="space-y-4 px-5 pb-5 pt-4"
                    >
                        <div>
                            <label className="mb-2 block text-sm font-medium text-slate-700">
                                Work Type
                            </label>
                            <CustomDropdownCheckboxObject
                                items={workTypes}
                                selected={form.work_type_id}
                                onChange={(value) => updateField("work_type_id", value)}
                                buttonLabel={selectedWorkType?.name || "Select work type"}
                                buttonVariant="outline"
                                className="h-11 w-full justify-between rounded-xl border-slate-300 bg-white px-3 text-sm"
                            />
                            <InputError message={errors.work_type_id} className="mt-2" />
                        </div>

                        <div>
                            <label className="mb-2 block text-sm font-medium text-slate-700">
                                Schedule Name
                            </label>
                            <Input
                                value={form.name}
                                onChange={(event) => updateField("name", event.target.value)}
                                className="h-11 rounded-xl border-slate-300"
                                placeholder="8:00 AM - 5:00 PM"
                            />
                            <InputError message={errors.name} className="mt-2" />
                        </div>

                        <div className="grid grid-cols-2 gap-3">
                            <div>
                                <label className="mb-2 block text-sm font-medium text-slate-700">
                                    Time In
                                </label>
                                <Input
                                    type="time"
                                    value={form.time_in}
                                    onChange={(event) => updateField("time_in", event.target.value)}
                                    className="h-11 rounded-xl border-slate-300"
                                />
                                <InputError message={errors.time_in} className="mt-2" />
                            </div>
                            <div>
                                <label className="mb-2 block text-sm font-medium text-slate-700">
                                    Time Out
                                </label>
                                <Input
                                    type="time"
                                    value={form.time_out}
                                    onChange={(event) => updateField("time_out", event.target.value)}
                                    className="h-11 rounded-xl border-slate-300"
                                />
                                <InputError message={errors.time_out} className="mt-2" />
                            </div>
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
                    title="Confirm Work Schedule Update"
                    description="Please confirm your password before updating this work schedule."
                    action={
                        workSchedule?.id
                            ? route("dailytimerecord.workschedules.update", workSchedule.id)
                            : ""
                    }
                    method="put"
                    data={payload}
                    danger={false}
                    itemLabel="Work Schedule"
                    itemName={workSchedule?.name || ""}
                    confirmText="Update Work Schedule"
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

export default WorkScheduleFormModal;
