import { useEffect, useState } from "react";
import { router, usePage } from "@inertiajs/react";
import { timeInputValue } from "../utils";

const emptyForm = {
    work_type_id: "",
    name: "",
    time_in: "",
    time_out: "",
};

const useWorkScheduleFormModal = ({
    mode,
    open,
    onClose,
    workSchedule,
    workTypes = [],
}) => {
    const { errors = {} } = usePage().props;
    const [form, setForm] = useState(emptyForm);
    const [confirmOpen, setConfirmOpen] = useState(false);
    const isEdit = mode === "edit";
    const selectedWorkType = workTypes.find(
        (item) => String(item.id) === String(form.work_type_id),
    );
    const payload = {
        work_type_id: form.work_type_id,
        name: form.name.trim(),
        time_in: form.time_in,
        time_out: form.time_out,
    };
    const canSubmit = Boolean(
        payload.work_type_id &&
            payload.name &&
            payload.time_in &&
            payload.time_out,
    );

    useEffect(() => {
        if (!open) return;

        setForm({
            work_type_id: workSchedule?.work_type_id || "",
            name: workSchedule?.name || "",
            time_in: timeInputValue(workSchedule?.time_in),
            time_out: timeInputValue(workSchedule?.time_out),
        });
        setConfirmOpen(false);
    }, [open, workSchedule]);

    const updateField = (key, value) => {
        setForm((current) => ({ ...current, [key]: value }));
    };

    const submitAdd = (event) => {
        event.preventDefault();

        router.post(route("dailytimerecord.workschedules.store"), payload, {
            onSuccess: onClose,
        });
    };

    return {
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
    };
};

export default useWorkScheduleFormModal;
