import { useEffect, useMemo, useRef, useState } from "react";

const revokePreviewUrl = (url) => {
    if (url?.startsWith("blob:")) {
        URL.revokeObjectURL(url);
    }
};

const useEmployeeEditForm = ({
    editForm,
    editOpen,
    offices,
    setEditForm,
    stations,
    userStationId,
    workSchedules,
}) => {
    const fileInputRef = useRef(null);
    const [previewUrl, setPreviewUrl] = useState(null);
    const safeForm = editForm || {};
    const canEditOffice = Number(userStationId) === 1;
    const isHead =
        safeForm?.is_unit_head ||
        safeForm?.is_division_head ||
        safeForm?.is_department_head;
    const selectedStation = useMemo(
        () =>
            stations?.find(
                (station) => Number(station.id) === Number(safeForm.station_id),
            ),
        [stations, safeForm.station_id],
    );
    const selectedOffice = useMemo(
        () =>
            offices?.find(
                (office) => Number(office.id) === Number(safeForm.office_id),
            ),
        [offices, safeForm.office_id],
    );
    const scheduleItems = useMemo(() => workSchedules, [workSchedules]);
    const selectedWorkSchedule = useMemo(
        () =>
            scheduleItems.find(
                (schedule) =>
                    Number(schedule.id) === Number(safeForm.work_schedule_id),
            ),
        [scheduleItems, safeForm.work_schedule_id],
    );
    const currentImageUrl =
        typeof safeForm.profile_img === "string" && safeForm.profile_img
            ? `/storage/${safeForm.profile_img}`
            : null;
    const displayImage = previewUrl || currentImageUrl;
    const initials =
        `${safeForm.first_name?.[0] || ""}${safeForm.last_name?.[0] || ""}`.toUpperCase();

    useEffect(() => {
        if (!editOpen) {
            setPreviewUrl(null);
            if (fileInputRef.current) {
                fileInputRef.current.value = "";
            }
        }
    }, [editOpen]);

    useEffect(() => {
        return () => revokePreviewUrl(previewUrl);
    }, [previewUrl]);

    const updateForm = (key, value) => {
        setEditForm((prev) => ({
            ...(prev || {}),
            [key]: value,
        }));
    };

    const handleNameChange = (key, value) => {
        const regex = /^[A-Za-z\s-]*$/;
        if (!regex.test(value)) return;

        updateForm(key, value);
    };

    const handleProfileImageChange = (event) => {
        const file = event.target.files?.[0];
        if (!file) return;

        revokePreviewUrl(previewUrl);
        updateForm("profile_img", file);
        setPreviewUrl(URL.createObjectURL(file));
    };

    const clearNewProfileImage = () => {
        revokePreviewUrl(previewUrl);
        setPreviewUrl(null);
        updateForm("profile_img", safeForm.original_profile_img || "");

        if (fileInputRef.current) {
            fileInputRef.current.value = "";
        }
    };

    const buildUpdatePayload = () => {
        const payload = { ...safeForm };

        delete payload.full_name;
        delete payload.office;
        delete payload.original_profile_img;
        delete payload.is_department_head;
        delete payload.is_division_head;
        delete payload.is_unit_head;
        delete payload.is_school_admin;
        delete payload.department;
        delete payload.work_type;
        delete payload.work_schedule;

        if (!(payload.profile_img instanceof File)) {
            delete payload.profile_img;
        }

        return payload;
    };

    useEffect(() => {
        if (
            editOpen &&
            safeForm.profile_img &&
            !safeForm.original_profile_img
        ) {
            updateForm("original_profile_img", safeForm.profile_img);
        }
    }, [editOpen, safeForm.profile_img, safeForm.original_profile_img]);

    return {
        buildUpdatePayload,
        canEditOffice,
        clearNewProfileImage,
        displayImage,
        fileInputRef,
        handleNameChange,
        handleProfileImageChange,
        initials,
        isHead,
        previewUrl,
        safeForm,
        scheduleItems,
        selectedOffice,
        selectedStation,
        selectedWorkSchedule,
        updateForm,
    };
};

export default useEmployeeEditForm;
