import { useEffect, useState } from "react";
import { router, usePage } from "@inertiajs/react";

const useWorkTypeFormModal = ({ mode, open, onClose, workType }) => {
    const { errors = {} } = usePage().props;
    const [name, setName] = useState("");
    const [confirmOpen, setConfirmOpen] = useState(false);
    const isEdit = mode === "edit";
    const payload = { name: name.trim() };
    const canSubmit = Boolean(payload.name);

    useEffect(() => {
        if (!open) return;

        setName(workType?.name || "");
        setConfirmOpen(false);
    }, [open, workType]);

    const submitAdd = (event) => {
        event.preventDefault();

        router.post(route("dailytimerecord.worktypes.store"), payload, {
            onSuccess: onClose,
        });
    };

    return {
        canSubmit,
        confirmOpen,
        errors,
        isEdit,
        name,
        payload,
        setConfirmOpen,
        setName,
        submitAdd,
    };
};

export default useWorkTypeFormModal;
