import React from "react";
import ConfirmPasswordDialog from "@/Components/ConfirmPasswordDialog";

const DeleteWorkScheduleDialogs = ({
    deleteWorkScheduleModal,
    deleteWorkTypeModal,
    onClose,
}) => (
    <>
        <ConfirmPasswordDialog
            trigger={null}
            title="Delete Work Type"
            description="Please confirm your password before deleting this work type."
            itemLabel="Work Type"
            itemName={deleteWorkTypeModal?.name || ""}
            note="Work types with schedules cannot be deleted until their schedules are removed."
            action={
                deleteWorkTypeModal?.id
                    ? route("dailytimerecord.worktypes.destroy", deleteWorkTypeModal.id)
                    : ""
            }
            method="delete"
            confirmText="Delete Work Type"
            processingText="Deleting..."
            open={!!deleteWorkTypeModal}
            onOpenChange={(nextOpen) => {
                if (!nextOpen) onClose();
            }}
        />

        <ConfirmPasswordDialog
            trigger={null}
            title="Delete Work Schedule"
            description="Please confirm your password before deleting this work schedule."
            itemLabel="Work Schedule"
            itemName={deleteWorkScheduleModal?.name || ""}
            note="Employees using this schedule may need to be reassigned first."
            action={
                deleteWorkScheduleModal?.id
                    ? route(
                          "dailytimerecord.workschedules.destroy",
                          deleteWorkScheduleModal.id,
                      )
                    : ""
            }
            method="delete"
            confirmText="Delete Work Schedule"
            processingText="Deleting..."
            open={!!deleteWorkScheduleModal}
            onOpenChange={(nextOpen) => {
                if (!nextOpen) onClose();
            }}
        />
    </>
);

export default DeleteWorkScheduleDialogs;
