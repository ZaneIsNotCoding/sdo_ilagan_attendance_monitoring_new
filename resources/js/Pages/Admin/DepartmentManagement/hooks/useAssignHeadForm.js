import { useEffect, useMemo, useRef, useState } from "react";
import axios from "axios";
import { router } from "@inertiajs/react";

const useAssignHeadForm = ({
    collection,
    idKey,
    open,
    preselectedId = null,
    requestParam,
    setOpen,
    storePayloadKey,
    storeRoute,
}) => {
    const [targetId, setTargetId] = useState("");
    const [employeeId, setEmployeeId] = useState("");
    const [employees, setEmployees] = useState([]);
    const [employeeTotal, setEmployeeTotal] = useState(0);
    const [search, setSearch] = useState("");
    const [loading, setLoading] = useState(false);
    const requestRef = useRef(0);
    const selectedTarget = useMemo(
        () =>
            collection.find(
                (item) => String(item[idKey]) === String(targetId),
            ),
        [collection, idKey, targetId],
    );
    const selectedEmployee = useMemo(
        () => employees.find((employee) => String(employee.id) === String(employeeId)),
        [employees, employeeId],
    );
    const canSubmit = Boolean(employeeId && targetId);

    useEffect(() => {
        if (open) {
            setTargetId(preselectedId || "");
            setEmployeeId("");
            setSearch("");
        }
    }, [open, preselectedId]);

    useEffect(() => {
        if (!open || !targetId) {
            setEmployees([]);
            setEmployeeTotal(0);
            setLoading(false);
            return;
        }

        const requestId = requestRef.current + 1;
        requestRef.current = requestId;
        setLoading(true);

        const timeout = setTimeout(() => {
            axios
                .get(route("department.employees"), {
                    params: {
                        [requestParam]: targetId,
                        search: search.trim(),
                    },
                })
                .then((response) => {
                    if (requestRef.current !== requestId) return;

                    setEmployees(response.data?.data || []);
                    setEmployeeTotal(response.data?.total || 0);
                })
                .catch(() => {
                    if (requestRef.current !== requestId) return;

                    setEmployees([]);
                    setEmployeeTotal(0);
                })
                .finally(() => {
                    if (requestRef.current !== requestId) return;

                    setLoading(false);
                });
        }, 250);

        return () => clearTimeout(timeout);
    }, [open, targetId, search, requestParam]);

    const handleSubmit = (event) => {
        event.preventDefault();
        if (!canSubmit) return;

        router.post(
            route(storeRoute),
            {
                employee_id: employeeId,
                [storePayloadKey]: targetId,
            },
            { onSuccess: () => setOpen(false) },
        );
    };

    return {
        canSubmit,
        employeeId,
        employees,
        employeeTotal,
        handleSubmit,
        loading,
        search,
        selectedEmployee,
        selectedTarget,
        setEmployeeId,
        setSearch,
        targetId,
    };
};

export default useAssignHeadForm;
