import { useEffect, useState } from "react";
import { router } from "@inertiajs/react";

const useEmployeeEditModal = (editEmployeeModal) => {
    const [editForm, setEditForm] = useState(editEmployeeModal);

    useEffect(() => {
        setEditForm(editEmployeeModal);
    }, [editEmployeeModal]);

    const handleEdit = (employee) => {
        const params = new URLSearchParams(window.location.search);

        params.set("modal", "edit-employee");
        params.set("employee_id", employee.id);

        router.get(route("employeemanagement"), Object.fromEntries(params), {
            preserveState: true,
            preserveScroll: true,
            replace: true,
        });
    };

    const closeEditEmployeeModal = () => {
        const params = new URLSearchParams(window.location.search);

        params.delete("modal");
        params.delete("employee_id");

        router.get(route("employeemanagement"), Object.fromEntries(params), {
            preserveState: true,
            preserveScroll: true,
            replace: true,
        });
    };

    return {
        closeEditEmployeeModal,
        editForm,
        handleEdit,
        setEditForm,
    };
};

export default useEmployeeEditModal;
