import { useEffect, useMemo, useState } from "react";

const useEditOfficeForm = ({ divisions, office, open, setOpen }) => {
    const [divisionId, setDivisionId] = useState("");
    const [name, setName] = useState("");
    const [openConfirm, setOpenConfirm] = useState(false);
    const divisionOptions = useMemo(
        () =>
            divisions.map((division) => ({
                ...division,
                name: [division.code, division.name].filter(Boolean).join(" - "),
            })),
        [divisions],
    );
    const selectedDivisionLabel =
        divisionOptions.find(
            (division) => String(division.id) === String(divisionId),
        )?.name || "Select division";
    const canSubmit =
        Boolean(office?.id) &&
        divisionId &&
        name.trim().length > 0 &&
        (divisionId !== office?.division_id?.toString?.() ||
            name.trim() !== (office?.name || "").trim());

    useEffect(() => {
        if (office) {
            setDivisionId(office.division_id?.toString?.() || "");
            setName(office.name || "");
        }
    }, [office]);

    useEffect(() => {
        if (!open) setOpenConfirm(false);
    }, [open]);

    const handleSuccess = () => {
        setOpenConfirm(false);
        setOpen(false);
    };

    return {
        canSubmit,
        divisionId,
        divisionOptions,
        handleSuccess,
        name,
        openConfirm,
        selectedDivisionLabel,
        setDivisionId,
        setName,
        setOpenConfirm,
    };
};

export default useEditOfficeForm;
