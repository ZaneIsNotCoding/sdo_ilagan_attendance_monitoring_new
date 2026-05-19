import { useEffect, useState } from "react";
import { router } from "@inertiajs/react";

const useAddDivisionForm = ({ open, setOpen }) => {
    const [code, setCode] = useState("");
    const [name, setName] = useState("");

    useEffect(() => {
        if (open) {
            setCode("");
            setName("");
        }
    }, [open]);

    const handleSubmit = (event) => {
        event.preventDefault();

        router.post(
            route("division.storeDivision"),
            { code, name },
            { onSuccess: () => setOpen(false) },
        );
    };

    return {
        code,
        handleSubmit,
        name,
        setCode,
        setName,
    };
};

export default useAddDivisionForm;
