import { useEffect, useRef, useState } from "react";
import { router } from "@inertiajs/react";
import {
    clampAvailableFingers,
    formatFingerprintRegistrationParam,
} from "../utils";

const useFingerprintPanel = ({
    filteredEmployees,
    fingerprintServiceUrl,
    selectedFingerprintEmployeeProp,
    testFingerprintModal,
}) => {
    const [selectedEmployee, setSelectedEmployee] = useState(
        selectedFingerprintEmployeeProp?.id || "",
    );
    const [selectedFingerprintEmployee, setSelectedFingerprintEmployee] =
        useState(selectedFingerprintEmployeeProp);
    const [scanStatus, setScanStatus] = useState("idle");
    const [scanMessage, setScanMessage] = useState("");
    const [scanFeedbackKey, setScanFeedbackKey] = useState(0);
    const [scanning, setScanning] = useState(false);
    const registerSourceRef = useRef(null);
    const [testOpen, setTestOpen] = useState(Boolean(testFingerprintModal));
    const [testMessage, setTestMessage] = useState("Waiting for scan...");
    const [testStatus, setTestStatus] = useState("idle");
    const [testSource, setTestSource] = useState(null);

    useEffect(() => {
        setSelectedEmployee(selectedFingerprintEmployeeProp?.id || "");
        setSelectedFingerprintEmployee(selectedFingerprintEmployeeProp);
    }, [selectedFingerprintEmployeeProp]);

    useEffect(() => {
        setTestOpen(Boolean(testFingerprintModal));
    }, [testFingerprintModal]);

    const findCurrentEmployee = (empId) =>
        String(selectedFingerprintEmployee?.id) === String(empId)
            ? selectedFingerprintEmployee
            : filteredEmployees.find((emp) => String(emp.id) === String(empId));

    const isRegistered = (id) => {
        const emp = findCurrentEmployee(id);

        return emp ? Number(emp.available_fingers ?? 3) < 3 : false;
    };

    const availableFingers = (empId) => {
        const emp = findCurrentEmployee(empId);

        return clampAvailableFingers(emp?.available_fingers);
    };

    const stopRegisterSource = (source = registerSourceRef.current) => {
        if (source) {
            source.close();
        }

        if (!source || registerSourceRef.current === source) {
            registerSourceRef.current = null;
        }
    };

    const clearFingerprintEmployee = () => {
        setSelectedEmployee("");
        setSelectedFingerprintEmployee(null);

        const params = new URLSearchParams(window.location.search);
        params.delete("fingerprint_employee_id");
        params.delete("fingerprint_registration");

        router.get(route("employeemanagement"), Object.fromEntries(params), {
            preserveState: false,
            preserveScroll: true,
            replace: true,
        });
    };

    useEffect(() => {
        let timer;

        if (scanStatus === "success") {
            timer = setTimeout(() => {
                setScanning(false);
                setScanStatus("idle");
                setScanMessage("Place your fingerprint");
                clearFingerprintEmployee();
            }, 5000);
        }

        return () => clearTimeout(timer);
    }, [scanStatus]);

    useEffect(() => {
        return () => {
            stopRegisterSource();
        };
    }, []);

    const cancelScan = () => {
        stopRegisterSource();
        setScanning(false);
        setScanStatus("idle");
        setScanMessage("Scan cancelled");
    };

    const registerFingerprint = () => {
        if (!selectedEmployee) return;

        stopRegisterSource();
        setScanning(true);
        setScanStatus("scanning");
        setScanMessage("Starting fingerprint registration...");

        const source = new EventSource(
            `${fingerprintServiceUrl}/bioRegisterSSE/${selectedEmployee}`,
        );
        registerSourceRef.current = source;

        source.onmessage = (event) => {
            if (registerSourceRef.current !== source) return;

            try {
                const data = JSON.parse(event.data);
                if (!data || Object.keys(data).length === 0) return;

                setScanFeedbackKey((value) => value + 1);

                if (data.success === null) {
                    setScanStatus("scanning");
                    setScanMessage(data.message);
                } else if (data.success === true) {
                    setScanStatus("success");
                    setScanMessage(data.message);
                    setScanning(false);
                    stopRegisterSource(source);

                    const emp = findCurrentEmployee(selectedEmployee);

                    setSelectedFingerprintEmployee((current) =>
                        String(current?.id) === String(selectedEmployee)
                            ? {
                                  ...current,
                                  available_fingers: Math.max(
                                      Number(current.available_fingers ?? 3) -
                                          1,
                                      0,
                                  ),
                              }
                            : current,
                    );

                    if (emp && Number(emp.available_fingers ?? 3) - 1 <= 0) {
                        clearFingerprintEmployee();
                    }
                } else if (data.success === false) {
                    setScanStatus("error");
                    setScanMessage(data.message);
                    setScanning(false);
                    stopRegisterSource(source);
                }
            } catch (err) {
                console.error("Failed to parse SSE data:", err);
                setScanFeedbackKey((value) => value + 1);
                setScanStatus("error");
                setScanMessage("Unexpected error occurred.");
                setScanning(false);
                stopRegisterSource(source);
            }
        };

        source.onerror = (err) => {
            if (registerSourceRef.current !== source) return;

            console.error("SSE connection error:", err);
            setScanFeedbackKey((value) => value + 1);
            setScanStatus("error");
            setScanMessage("Could not reach fingerprint service.");
            setScanning(false);
            stopRegisterSource(source);
        };
    };

    const startTestFingerprint = () => {
        if (testSource) {
            testSource.close();
        }

        setTestMessage("Place your finger on the scanner...");
        setTestStatus("scanning");

        const source = new EventSource(`${fingerprintServiceUrl}/bioTestSSE`);
        setTestSource(source);

        source.onmessage = (event) => {
            try {
                const data = JSON.parse(event.data);

                if (!data || Object.keys(data).length === 0) return;

                if (data.success && data.employee) {
                    const { first_name, last_name, position, office } =
                        data.employee;

                    setTestStatus("success");
                    setTestMessage(
                        `Match: ${first_name} ${last_name} (${office?.name || "No office"} - ${position})`,
                    );

                    setTimeout(() => {
                        setTestStatus("scanning");
                        setTestMessage("Place your finger on the scanner...");
                    }, 3000);
                } else if (data.message) {
                    setTestStatus("error");
                    setTestMessage(`${data.message}`);

                    setTimeout(() => {
                        setTestStatus("scanning");
                        setTestMessage("Place your finger on the scanner...");
                    }, 3000);
                }
            } catch (err) {
                console.error("SSE parse error:", err);
                setTestStatus("error");
                setTestMessage("Test error.");
            }
        };

        source.onerror = (err) => {
            console.error("SSE error:", err);
            setTestStatus("error");
            setTestMessage("Lost connection to fingerprint service.");
            source.close();

            setTimeout(() => startTestFingerprint(), 3000);
        };
    };

    const selectFingerprintEmployee = (employee) => {
        setSelectedEmployee(employee.id);
        setSelectedFingerprintEmployee(employee);

        const params = new URLSearchParams(window.location.search);
        params.delete("fingerprint_employee_id");
        params.set(
            "fingerprint_registration",
            formatFingerprintRegistrationParam(employee),
        );

        router.get(route("employeemanagement"), Object.fromEntries(params), {
            preserveState: false,
            preserveScroll: true,
            replace: true,
        });
    };

    const handleTestFingerprintOpenChange = (nextOpen) => {
        setTestOpen(nextOpen);

        if (!nextOpen && testSource) {
            testSource.close();
            setTestSource(null);
        }

        const params = new URLSearchParams(window.location.search);

        if (nextOpen) {
            params.set("modal", "test-fingerprint");
            params.delete("employee_id");
        } else if (params.get("modal") === "test-fingerprint") {
            params.delete("modal");
        }

        router.get(route("employeemanagement"), Object.fromEntries(params), {
            only: ["testFingerprintModal"],
            preserveState: true,
            preserveScroll: true,
            replace: true,
        });
    };

    return {
        availableFingers,
        cancelScan,
        clearFingerprintEmployee,
        handleTestFingerprintOpenChange,
        isRegistered,
        registerFingerprint,
        scanFeedbackKey,
        scanMessage,
        scanStatus,
        scanning,
        selectedEmployee,
        selectedFingerprintEmployee,
        selectFingerprintEmployee,
        setSelectedEmployee,
        setSelectedFingerprintEmployee,
        startTestFingerprint,
        testMessage,
        testOpen,
        testStatus,
    };
};

export default useFingerprintPanel;
