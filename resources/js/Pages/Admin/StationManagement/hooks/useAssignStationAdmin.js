import { useEffect, useMemo, useState } from "react";
import axios from "axios";
import { router } from "@inertiajs/react";

const useAssignStationAdmin = ({ open, setOpen, stations, stationData }) => {
    const selectedStationId = stationData?.station_id || stationData?.id || "";
    const selectedRole = stationData?.role || "school_admin";
    const selectedSource = stationData?.source || "station";
    const [selectedEmployee, setSelectedEmployee] = useState(null);
    const [employees, setEmployees] = useState([]);
    const [employeeTotal, setEmployeeTotal] = useState(0);
    const [employeesLoading, setEmployeesLoading] = useState(false);
    const [search, setSearch] = useState("");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const passwordChecks = useMemo(
        () => ({
            hasMinLength: password.length >= 6,
            hasUppercase: /[A-Z]/.test(password),
            hasNumber: /\d/.test(password),
        }),
        [password],
    );
    const isPasswordValid =
        passwordChecks.hasMinLength &&
        passwordChecks.hasUppercase &&
        passwordChecks.hasNumber;
    const doPasswordsMatch =
        password.length > 0 &&
        confirmPassword.length > 0 &&
        password === confirmPassword;
    const stationName = useMemo(() => {
        return (
            stationData?.name ||
            stations.find((station) => {
                if (selectedSource === "sdo") {
                    return (
                        station.source === "sdo" &&
                        station.station_id == selectedStationId &&
                        station.role === selectedRole
                    );
                }

                return station.id == selectedStationId;
            })?.name ||
            ""
        );
    }, [
        stationData,
        stations,
        selectedStationId,
        selectedRole,
        selectedSource,
    ]);

    useEffect(() => {
        if (open) {
            setSelectedEmployee(null);
            setEmployees([]);
            setEmployeeTotal(0);
            setSearch("");
            setEmail("");
            setPassword("");
            setConfirmPassword("");
        }
    }, [open]);

    useEffect(() => {
        if (!open || !selectedStationId) {
            setEmployees([]);
            setEmployeeTotal(0);
            setEmployeesLoading(false);
            return;
        }

        let isCurrentRequest = true;

        setEmployeesLoading(true);

        const timeout = setTimeout(() => {
            axios
                .get(route("stationadmin.employees"), {
                    params: {
                        station_id: selectedStationId,
                        search,
                    },
                })
                .then((response) => {
                    if (!isCurrentRequest) return;

                    setEmployees(response.data?.data || []);
                    setEmployeeTotal(response.data?.total || 0);
                })
                .catch(() => {
                    if (!isCurrentRequest) return;

                    setEmployees([]);
                    setEmployeeTotal(0);
                })
                .finally(() => {
                    if (!isCurrentRequest) return;

                    setEmployeesLoading(false);
                });
        }, 250);

        return () => {
            isCurrentRequest = false;
            clearTimeout(timeout);
        };
    }, [open, selectedStationId, search]);

    const handleSubmit = () => {
        if (
            !selectedEmployee ||
            !stationData ||
            !email ||
            !isPasswordValid ||
            !doPasswordsMatch
        ) {
            return;
        }

        router.post(
            route("stationadmin.store"),
            {
                employee_id: selectedEmployee.id,
                station_id: selectedStationId,
                role: selectedRole,
                email,
                password,
                password_confirmation: confirmPassword,
            },
            {
                onSuccess: () => {
                    setOpen(false);
                },
            },
        );
    };

    return {
        confirmPassword,
        doPasswordsMatch,
        email,
        employeeTotal,
        employees,
        employeesLoading,
        handleSubmit,
        isPasswordValid,
        password,
        passwordChecks,
        search,
        selectedEmployee,
        setConfirmPassword,
        setEmail,
        setPassword,
        setSearch,
        setSelectedEmployee,
        stationName,
    };
};

export default useAssignStationAdmin;
