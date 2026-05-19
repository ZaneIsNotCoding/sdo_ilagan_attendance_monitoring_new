import { useEffect, useState } from "react";

const useEditStationForm = ({ open, setOpen, station }) => {
    const [code, setCode] = useState("");
    const [name, setName] = useState("");
    const [openConfirm, setOpenConfirm] = useState(false);
    const isSdoAssignment = station?.source === "sdo";
    const action = isSdoAssignment
        ? station?.record_id
            ? route("stationassignments.update", station.record_id)
            : ""
        : station?.id
          ? route("stations.update", station.id)
          : "";
    const canSubmit =
        Boolean(isSdoAssignment ? station?.record_id : station?.id) &&
        name.trim().length > 0 &&
        (code.trim() !== (station?.code || "").trim() ||
            name.trim() !== (station?.name || "").trim());

    useEffect(() => {
        if (station) {
            setCode(station.code || "");
            setName(station.name || "");
        }
    }, [station]);

    useEffect(() => {
        if (!open) setOpenConfirm(false);
    }, [open]);

    const handleSuccess = () => {
        setOpenConfirm(false);
        setOpen(false);
    };

    return {
        action,
        canSubmit,
        code,
        handleSuccess,
        isSdoAssignment,
        name,
        openConfirm,
        setCode,
        setName,
        setOpenConfirm,
    };
};

export default useEditStationForm;
