import { useEffect, useState } from "react";

const useEditDivisionForm = ({ division, open, setOpen }) => {
    const [code, setCode] = useState("");
    const [name, setName] = useState("");
    const [openConfirm, setOpenConfirm] = useState(false);
    const canSubmit =
        Boolean(division?.id) &&
        code.trim().length > 0 &&
        name.trim().length > 0 &&
        (code.trim() !== (division?.code || "").trim() ||
            name.trim() !== (division?.name || "").trim());

    useEffect(() => {
        if (division) {
            setCode(division.code || "");
            setName(division.name || "");
        }
    }, [division]);

    useEffect(() => {
        if (!open) setOpenConfirm(false);
    }, [open]);

    const handleSuccess = () => {
        setOpenConfirm(false);
        setOpen(false);
    };

    return {
        canSubmit,
        code,
        handleSuccess,
        name,
        openConfirm,
        setCode,
        setName,
        setOpenConfirm,
    };
};

export default useEditDivisionForm;
