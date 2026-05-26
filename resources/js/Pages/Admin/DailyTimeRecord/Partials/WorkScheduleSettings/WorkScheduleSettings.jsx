import React from "react";
import { router } from "@inertiajs/react";
import DeleteWorkScheduleDialogs from "./DeleteWorkScheduleDialogs";
import WorkScheduleFormModal from "./WorkScheduleFormModal";
import WorkScheduleList from "./WorkScheduleList";
import WorkTypeFormModal from "./WorkTypeFormModal";
import { closeWorkScheduleModal, openWorkScheduleModal } from "./utils";

const WorkScheduleSettings = ({
    addWorkScheduleModal = false,
    addWorkTypeModal = false,
    deleteWorkScheduleModal = null,
    deleteWorkTypeModal = null,
    editWorkScheduleModal = null,
    editWorkTypeModal = null,
    workSchedules = [],
    workTypes = [],
}) => {
    const closeModal = () => closeWorkScheduleModal(router);
    const openModal = (modal, params = {}) =>
        openWorkScheduleModal(router, modal, params);

    return (
        <>
            <WorkScheduleList
                onOpenModal={openModal}
                workSchedules={workSchedules}
                workTypes={workTypes}
            />

            <WorkTypeFormModal
                mode="add"
                open={addWorkTypeModal}
                onClose={closeModal}
            />
            <WorkTypeFormModal
                mode="edit"
                open={!!editWorkTypeModal}
                onClose={closeModal}
                workType={editWorkTypeModal}
            />
            <WorkScheduleFormModal
                mode="add"
                open={addWorkScheduleModal}
                onClose={closeModal}
                workTypes={workTypes}
            />
            <WorkScheduleFormModal
                mode="edit"
                open={!!editWorkScheduleModal}
                onClose={closeModal}
                workSchedule={editWorkScheduleModal}
                workTypes={workTypes}
            />

            <DeleteWorkScheduleDialogs
                deleteWorkScheduleModal={deleteWorkScheduleModal}
                deleteWorkTypeModal={deleteWorkTypeModal}
                onClose={closeModal}
            />
        </>
    );
};

export default WorkScheduleSettings;

