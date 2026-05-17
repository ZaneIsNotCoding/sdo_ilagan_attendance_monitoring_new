import React, { useState, useEffect, useRef } from "react";
import { Head, router } from "@inertiajs/react";
import AuthenticatedLayout from "@/Layouts/AuthenticatedLayout";
import { UserCog } from "lucide-react";

import EmployeeRegistration from "./Partials/EmployeeRegistration";
import EmployeeList from "./Partials/EmployeeList";
import EmployeeEditDialog from "./Partials/EmployeeEditDialog";
import FingerprintRegistrationPanel from "./Partials/EmployeeFingerprintPanel";

const defaultFingerprintServiceUrl = `http://${window.location.hostname}:5000`;

const EmployeeManagement = ({
    filteredEmployeesList,
    offices = [],
    workSchedules = [],
    stations,
    userStation,
    userStationId,
    search = "",
    status = "Active",
    officeName = "all",
    limit = 10,
    editEmployeeModal = null,
    selectedFingerprintEmployee: selectedFingerprintEmployeeProp = null,
    testFingerprintModal = false,
    fingerprintServiceUrl = defaultFingerprintServiceUrl,
    ...props
}) => {
    const formatSearchDisplay = (value) =>
        String(value || "")
            .replace(/^\d+\s+/, "")
            .trim();
    const formatFingerprintRegistrationParam = (employee) =>
        [employee?.id, employee?.full_name || employee?.label]
            .filter(Boolean)
            .join(" ")
            .trim();

    const [searchInput, setSearchInput] = useState(formatSearchDisplay(search));
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

    const findOfficeByName = (value) =>
        offices.find((office) => office.name === value);

    const [selectedOffice, setSelectedOffice] = useState(
        findOfficeByName(officeName)?.id || "all",
    );
    const [statusFilter, setStatusFilter] = useState(status || "Active");
    const statusOptions = ["Active", "Inactive"];

    const filteredEmployees = Array.isArray(filteredEmployeesList?.data)
        ? filteredEmployeesList.data
        : Array.isArray(filteredEmployeesList)
          ? filteredEmployeesList
          : [];

    useEffect(() => {
        setSearchInput(formatSearchDisplay(search));
        setSelectedOffice(findOfficeByName(officeName)?.id || "all");
        setStatusFilter(status || "Active");
    }, [search, officeName, status, offices]);

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
        const available = Number(emp?.available_fingers ?? 3);

        return Math.min(Math.max(available, 0), 3);
    };

    // Reset UI after success
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

    const stopRegisterSource = (source = registerSourceRef.current) => {
        if (source) {
            source.close();
        }

        if (!source || registerSourceRef.current === source) {
            registerSourceRef.current = null;
        }
    };

    // Cleanup SSE on unmount
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
        setScanMessage("🔄 Starting fingerprint registration...");

        const source = new EventSource(
            `${fingerprintServiceUrl}/bioRegisterSSE/${selectedEmployee}`,
        );
        registerSourceRef.current = source;

        source.onmessage = (event) => {
            if (registerSourceRef.current !== source) return;

            try {
                const data = JSON.parse(event.data);
                if (!data || Object.keys(data).length === 0) return;

                if (data.success === null) {
                    // Still scanning
                    setScanFeedbackKey((value) => value + 1);
                    setScanStatus("scanning");
                    setScanMessage(data.message);
                } else if (data.success === true) {
                    // Scan success
                    setScanFeedbackKey((value) => value + 1);
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
                    setScanFeedbackKey((value) => value + 1);
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
        setTestStatus("scanning"); // optional state to show animation/status

        const source = new EventSource(`${fingerprintServiceUrl}/bioTestSSE`);
        setTestSource(source);

        source.onmessage = (event) => {
            try {
                const data = JSON.parse(event.data);

                // 🔹 Ignore heartbeat events
                if (!data || Object.keys(data).length === 0) return;

                if (data.success && data.employee) {
                    const {
                        first_name,
                        middle_name,
                        last_name,
                        position,
                        office,
                    } = data.employee;

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

    const applyEmployeeFilters = ({
        searchValue = searchInput,
        statusValue = statusFilter,
        officeValue = selectedOffice,
        pageValue,
        limitValue = limit,
    } = {}) => {
        const query = {
            status: statusValue,
            limit: limitValue,
        };

        if (searchValue && searchValue.trim()) {
            query.search = searchValue.trim();
        }

        if (officeValue !== "all") {
            const office = offices.find(
                (item) => Number(item.id) === Number(officeValue),
            );

            if (office) {
                query.office = office.name;
            }
        }

        if (pageValue && pageValue > 1) {
            query.page = pageValue;
        }

        if (selectedEmployee) {
            query.fingerprint_registration =
                formatFingerprintRegistrationParam(
                    selectedFingerprintEmployee ||
                        filteredEmployees.find(
                            (employee) =>
                                String(employee.id) ===
                                String(selectedEmployee),
                        ),
                ) || selectedEmployee;
        }

        router.get(route("employeemanagement"), query, {
            only: [
                "filteredEmployeesList",
                "search",
                "status",
                "officeName",
                "limit",
            ],
            preserveState: true,
            preserveScroll: true,
            replace: true,
        });
    };

    return (
        <AuthenticatedLayout
            header={
                <div className="flex items-center gap-5">
                    <UserCog className="w-5 h-5 text-blue-600" />
                    <span>Employee Management</span>
                </div>
            }
        >
            <Head title="Employee Management" />
            <main>
                <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
                    <EmployeeRegistration
                        userStationId={userStationId}
                        offices={offices}
                        workSchedules={workSchedules}
                    />
                    <FingerprintRegistrationPanel
                        employees={filteredEmployees}
                        selectedEmployee={selectedEmployee}
                        setSelectedEmployee={setSelectedEmployee}
                        selectedEmployeeRecord={selectedFingerprintEmployee}
                        setSelectedEmployeeRecord={
                            setSelectedFingerprintEmployee
                        }
                        onSelectEmployee={selectFingerprintEmployee}
                        onClearEmployee={clearFingerprintEmployee}
                        availableFingers={availableFingers}
                        scanning={scanning}
                        scanStatus={scanStatus}
                        scanMessage={scanMessage}
                        scanFeedbackKey={scanFeedbackKey}
                        cancelScan={cancelScan}
                        registerFingerprint={registerFingerprint}
                        testOpen={testOpen}
                        setTestOpen={handleTestFingerprintOpenChange}
                        testMessage={testMessage}
                        testStatus={testStatus}
                        startTestFingerprint={startTestFingerprint}
                    />
                </div>

                <EmployeeList
                    filteredEmployees={filteredEmployees}
                    pagination={filteredEmployeesList}
                    isRegistered={isRegistered}
                    handleEdit={handleEdit}
                    searchInput={searchInput}
                    setSearchInput={setSearchInput}
                    applySearch={(value) => {
                        applyEmployeeFilters({ searchValue: value });
                    }}
                    offices={offices}
                    selectedOffice={selectedOffice}
                    setSelectedOffice={setSelectedOffice}
                    statusOptions={statusOptions}
                    statusFilter={statusFilter}
                    setStatusFilter={setStatusFilter}
                    applyFilters={applyEmployeeFilters}
                />

                <EmployeeEditDialog
                    editForm={editForm}
                    setEditForm={setEditForm}
                    editOpen={!!editEmployeeModal}
                    setEditOpen={(nextOpen) => {
                        if (!nextOpen) closeEditEmployeeModal();
                    }}
                    offices={offices}
                    stations={stations}
                    workSchedules={workSchedules}
                    userStationId={userStationId}
                />
            </main>
        </AuthenticatedLayout>
    );
};

export default EmployeeManagement;
