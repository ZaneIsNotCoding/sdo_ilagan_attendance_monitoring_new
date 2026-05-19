import { useEffect, useRef, useState } from "react";
import { router } from "@inertiajs/react";

const emptyEmployeeForm = (stationId = "") => ({
    first_name: "",
    middle_name: "",
    last_name: "",
    profile_img: null,
    position: "",
    office_id: "",
    work_schedule_id: "",
    station_id: stationId,
});

const isNameValue = (value) => /^[A-Za-z\s-]*$/.test(value);

const revokePreviewUrl = (url) => {
    if (url?.startsWith("blob:")) {
        URL.revokeObjectURL(url);
    }
};

const useEmployeeRegistrationForm = ({
    offices = [],
    userStationId,
    workSchedules = [],
}) => {
    const fileInputRef = useRef(null);
    const [previewUrl, setPreviewUrl] = useState(null);
    const [form, setForm] = useState(emptyEmployeeForm(userStationId));
    const isDepartmentLocked = Number(userStationId) !== 1;
    const displayOffice =
        offices?.find((office) => office.id === form.office_id)?.name || "";
    const scheduleItems = workSchedules;
    const selectedSchedule = scheduleItems.find(
        (schedule) => Number(schedule.id) === Number(form.work_schedule_id),
    );
    const displayWorkSchedule =
        [selectedSchedule?.work_type?.name, selectedSchedule?.name]
            .filter(Boolean)
            .join(" - ");
    const initials =
        `${form.first_name?.[0] || ""}${form.last_name?.[0] || ""}`.toUpperCase();
    const isFormComplete =
        form.first_name.trim() &&
        form.middle_name.trim() &&
        form.last_name.trim() &&
        form.position.trim() &&
        form.office_id &&
        form.work_schedule_id &&
        form.station_id;

    useEffect(() => {
        setForm((prev) => ({
            ...prev,
            station_id: userStationId,
        }));
    }, [userStationId]);

    useEffect(() => {
        return () => revokePreviewUrl(previewUrl);
    }, [previewUrl]);

    const handleFormChange = (e) => {
        const { name, value } = e.target;

        if (["first_name", "middle_name", "last_name"].includes(name)) {
            if (!isNameValue(value)) return;
        }

        setForm((prev) => ({ ...prev, [name]: value }));
    };

    const updateFormValue = (name, value) => {
        setForm((prev) => ({
            ...prev,
            [name]: value,
        }));
    };

    const handleProfileImageChange = (e) => {
        const file = e.target.files?.[0];

        if (!file) return;

        revokePreviewUrl(previewUrl);

        setForm((prev) => ({
            ...prev,
            profile_img: file,
        }));
        setPreviewUrl(URL.createObjectURL(file));
    };

    const clearProfileImage = () => {
        revokePreviewUrl(previewUrl);
        setPreviewUrl(null);
        setForm((prev) => ({ ...prev, profile_img: null }));

        if (fileInputRef.current) {
            fileInputRef.current.value = "";
        }
    };

    const resetForm = () => {
        revokePreviewUrl(previewUrl);
        setPreviewUrl(null);
        setForm(emptyEmployeeForm(userStationId));

        if (fileInputRef.current) {
            fileInputRef.current.value = "";
        }
    };

    const handleAddEmployee = () => {
        router.post(route("employees.store"), form, {
            preserveScroll: true,
            forceFormData: true,
            onSuccess: () => {
                resetForm();
                router.reload({
                    only: ["filteredEmployeesList"],
                });
            },
        });
    };

    return {
        clearProfileImage,
        displayOffice,
        displayWorkSchedule,
        fileInputRef,
        form,
        handleAddEmployee,
        handleFormChange,
        handleProfileImageChange,
        initials,
        isDepartmentLocked,
        isFormComplete,
        previewUrl,
        scheduleItems,
        updateFormValue,
    };
};

export default useEmployeeRegistrationForm;
