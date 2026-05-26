import { useEffect, useMemo, useState } from "react";
import { router } from "@inertiajs/react";

const useAddOfficeForm = ({ divisions, open, setOpen }) => {
    const [divisionId, setDivisionId] = useState("");
    const [name, setName] = useState("");
    const selectedDivision = useMemo(
        () =>
            divisions.find(
                (division) => String(division.id) === String(divisionId),
            ),
        [divisions, divisionId],
    );

    useEffect(() => {
        if (open) {
            setDivisionId("");
            setName("");
        }
    }, [open]);

    const handleSubmit = (event) => {
        event.preventDefault();

        router.post(
            route("office.storeOffice"),
            { division_id: divisionId, name },
            { onSuccess: () => setOpen(false) },
        );
    };

    return {
        divisionId,
        handleSubmit,
        name,
        selectedDivision,
        setDivisionId,
        setName,
    };
};

export default useAddOfficeForm;
