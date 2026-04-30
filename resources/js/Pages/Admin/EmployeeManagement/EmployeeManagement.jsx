import React, { useState, useEffect } from "react";
import { Head, router } from "@inertiajs/react";
import AuthenticatedLayout from "@/Layouts/AuthenticatedLayout";
import { UserCog } from "lucide-react";

import EmployeeRegistration from "./Partials/EmployeeRegistration";
import EmployeeList from "./Partials/EmployeeList";
import EmployeeEditDialog from "./Partials/EmployeeEditDialog";
import FingerprintRegistrationPanel from "./Partials/EmployeeFingerprintPanel";

const EmployeeManagement = ({
    employeesList,
    filteredEmployeesList,
    offices = [],
    registeredList,
    unregisteredList,
    stations,
    userStation,
    userStationId,
    search = "",
    ...props
}) => {
    const formatSearchDisplay = (value) =>
        String(value || "")
            .replace(/^\d+\s+/, "")
            .trim();

    const [searchInput, setSearchInput] = useState(formatSearchDisplay(search));

    const [employees, setEmployees] = useState(employeesList || []);
    const [registered, setRegistered] = useState(registeredList || []);
    const [unregistered, setUnregistered] = useState(unregisteredList || []);

    const [selectedEmployee, setSelectedEmployee] = useState("");
    const [scanStatus, setScanStatus] = useState("idle");
    const [scanMessage, setScanMessage] = useState("");
    const [scanning, setScanning] = useState(false);
    const [eventSource, setEventSource] = useState(null);

    const [open, setOpen] = useState(false);

    const [testEmployee, setTestEmployee] = useState(null);
    const [testCountdown, setTestCountdown] = useState(null);
    const [testOpen, setTestOpen] = useState(false);
    const [testMessage, setTestMessage] = useState("Waiting for scan...");
    const [testStatus, setTestStatus] = useState("idle");
    const [testSource, setTestSource] = useState(null);

    const [selectedOffice, setSelectedOffice] = useState("all");
    const [statusFilter, setStatusFilter] = useState("Active");
    const statusOptions = ["Active", "Inactive"];

    // Initialize employees from props
    useEffect(() => {
        setEmployees(Array.isArray(employeesList) ? employeesList : []);
    }, [employeesList]);

    useEffect(() => {
        setSearchInput(formatSearchDisplay(search));

        if (search) {
            setSelectedOffice("all");
        }
    }, [search]);

    // Keep registered / unregistered reactive
    useEffect(() => {
        setRegistered(employees.filter((emp) => emp.available_fingers < 3));
        setUnregistered(employees.filter((emp) => emp.available_fingers === 3));
    }, [employees]);

    const isRegistered = (id) => registered?.some((reg) => reg.id === id);

    const availableFingers = (empId) => {
        const emp = employees.find((e) => e.id === empId);
        return emp ? emp.available_fingers : 3;
    };

    // Reset UI after success
    useEffect(() => {
        let timer;
        if (scanStatus === "success") {
            timer = setTimeout(() => {
                setScanning(false);
                setScanStatus("idle");
                setScanMessage("Place your fingerprint");
                setSelectedEmployee("");
            }, 5000);
        }
        return () => clearTimeout(timer);
    }, [scanStatus]);

    // Cleanup SSE on unmount
    useEffect(() => {
        return () => {
            if (eventSource) eventSource.close();
        };
    }, [eventSource]);

    const cancelScan = () => {
        if (eventSource) eventSource.close();
        setScanning(false);
        setScanStatus("idle");
        setScanMessage("Scan cancelled");
    };

    const registerFingerprint = () => {
        if (!selectedEmployee) return;

        setScanning(true);
        setScanStatus("scanning");
        setScanMessage("🔄 Starting fingerprint registration...");

        const source = new EventSource(
            `http://127.0.0.1:5000/bioRegisterSSE/${selectedEmployee}`,
        );
        setEventSource(source);

        source.onmessage = (event) => {
            try {
                const data = JSON.parse(event.data);
                if (!data || Object.keys(data).length === 0) return;

                if (data.success === null) {
                    // Still scanning
                    setScanStatus("scanning");
                    setScanMessage(data.message);
                } else if (data.success === true) {
                    // Scan success
                    setScanStatus("success");
                    setScanMessage(data.message);
                    setScanning(false);
                    source.close();

                    setEmployees((prev) =>
                        prev.map((e) =>
                            e.id === selectedEmployee
                                ? {
                                      ...e,
                                      available_fingers: Math.max(
                                          e.available_fingers - 1,
                                          0,
                                      ),
                                  }
                                : e,
                        ),
                    );
                    const emp = employees.find(
                        (e) => e.id === selectedEmployee,
                    );
                    if (emp && emp.available_fingers - 1 <= 0) {
                        setSelectedEmployee("");
                    }
                } else if (data.success === false) {
                    setScanStatus("error");
                    setScanMessage(data.message);
                    setScanning(false);
                    source.close();
                }
            } catch (err) {
                console.error("Failed to parse SSE data:", err);
                setScanStatus("error");
                setScanMessage("❌ Unexpected error occurred.");
                setScanning(false);
                source.close();
            }
        };

        source.onerror = (err) => {
            console.error("SSE connection error:", err);
            setScanStatus("error");
            setScanMessage("❌ Could not reach fingerprint service.");
            setScanning(false);
            source.close();
        };
    };

    const startTestFingerprint = () => {
        if (testSource) {
            testSource.close();
        }

        setTestMessage("Place your finger on the scanner...");
        setTestStatus("scanning"); // optional state to show animation/status

        const source = new EventSource(`http://127.0.0.1:5000/bioTestSSE`);
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

                    setTestEmployee({
                        first_name,
                        middle_name,
                        last_name,
                        position,
                        office,
                    });

                    setTestStatus("success");
                    setTestMessage(
                        `✅ Match: ${first_name} ${last_name} (${office?.name || "No office"} - ${position})`,
                    );

                    // countdown to reset UI
                    let count = 3;
                    setTestCountdown(count);
                    const interval = setInterval(() => {
                        count -= 1;
                        setTestCountdown(count);
                        if (count <= 0) {
                            clearInterval(interval);
                            setTestCountdown(null);
                            setTestStatus("scanning");
                            setTestMessage(
                                "Place your finger on the scanner...",
                            );
                        }
                    }, 1000);
                } else if (data.message) {
                    setTestStatus("error");
                    setTestMessage(`❌ ${data.message}`);

                    // optional retry countdown
                    let count = 3;
                    const interval = setInterval(() => {
                        count -= 1;
                        if (count <= 0) {
                            clearInterval(interval);
                            setTestStatus("scanning");
                            setTestMessage(
                                "Place your finger on the scanner...",
                            );
                        }
                    }, 1000);
                }
            } catch (err) {
                console.error("SSE parse error:", err);
                setTestStatus("error");
                setTestMessage("❌ Test error.");
            }
        };

        source.onerror = (err) => {
            console.error("SSE error:", err);
            setTestStatus("error");
            setTestMessage("❌ Lost connection to fingerprint service.");
            source.close();

            setTimeout(() => startTestFingerprint(), 3000);
        };
    };

    const fingerOptions = [
        { value: 1, label: "Finger 1" },
        { value: 2, label: "Finger 2" },
        { value: 3, label: "Finger 3" },
    ];

    const [form, setForm] = useState({
        first_name: "",
        middle_name: "",
        last_name: "",
        position: "",
        office_id: "",
        work_type: "",
    });

    const [editOpen, setEditOpen] = useState(false);

    const [editForm, setEditForm] = useState(null);

    const handleEdit = (employee) => {
        setEditForm(employee);
        setEditOpen(true);
    };

    const visibleEmployees = Array.isArray(filteredEmployeesList)
        ? filteredEmployeesList
        : employees;

    const filteredEmployees = visibleEmployees.filter((emp) => {
        // Office filter
        const matchesOffice =
            selectedOffice === "all"
                ? true
                : emp.office_id === Number(selectedOffice);

        // Status filter
        const matchesStatus =
            statusFilter === "All Status"
                ? true
                : statusFilter === "Active"
                  ? emp.active_status === "Active" || emp.active_status === 1
                  : emp.active_status === "Inactive" || emp.active_status === 0;

        return matchesOffice && matchesStatus;
    });

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
                    />
                    <FingerprintRegistrationPanel
                        employees={employees}
                        unregistered={unregistered}
                        selectedEmployee={selectedEmployee}
                        setSelectedEmployee={setSelectedEmployee}
                        availableFingers={availableFingers}
                        scanning={scanning}
                        scanStatus={scanStatus}
                        scanMessage={scanMessage}
                        cancelScan={cancelScan}
                        registerFingerprint={registerFingerprint}
                        open={open}
                        setOpen={setOpen}
                        testOpen={testOpen}
                        setTestOpen={setTestOpen}
                        testSource={testSource}
                        testMessage={testMessage}
                        setTestMessage={setTestMessage}
                        testStatus={testStatus}
                        setTestStatus={setTestStatus}
                        startTestFingerprint={startTestFingerprint}
                    />
                </div>

                <EmployeeList
                    employees={employees}
                    filteredEmployees={filteredEmployees}
                    isRegistered={isRegistered}
                    handleEdit={handleEdit}
                    searchInput={searchInput}
                    setSearchInput={setSearchInput}
                    applySearch={(value) => {
                        setSelectedOffice("all");
                        router.get(
                            route("employeemanagement"),
                            value && value.trim()
                                ? { search: value.trim() }
                                : {},
                            {
                                preserveState: true,
                                preserveScroll: true,
                                replace: true,
                            },
                        );
                    }}
                    offices={offices}
                    selectedOffice={selectedOffice}
                    setSelectedOffice={setSelectedOffice}
                    statusOptions={statusOptions}
                    statusFilter={statusFilter}
                    setStatusFilter={setStatusFilter}
                />

                <EmployeeEditDialog
                    editForm={editForm}
                    setEditForm={setEditForm}
                    editOpen={editOpen}
                    setEditOpen={setEditOpen}
                    offices={offices}
                    stations={stations}
                    userStationId={userStationId}
                />
            </main>
        </AuthenticatedLayout>
    );
};

export default EmployeeManagement;
