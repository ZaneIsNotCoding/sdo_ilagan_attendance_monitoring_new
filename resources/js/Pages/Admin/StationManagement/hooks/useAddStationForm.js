import { useEffect, useState } from "react";
import { router } from "@inertiajs/react";

const useAddStationForm = ({ open, setOpen }) => {
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
            route("stations.store"),
            {
                code: code.trim() || null,
                name: name.trim(),
            },
            {
                onSuccess: () => setOpen(false),
            },
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

export default useAddStationForm;

