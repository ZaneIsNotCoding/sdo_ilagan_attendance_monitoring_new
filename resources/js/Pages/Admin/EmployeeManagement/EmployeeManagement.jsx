import React, { useState, useEffect, useMemo } from "react";
import { Head, router } from "@inertiajs/react";
import AuthenticatedLayout from "@/Layouts/AuthenticatedLayout";
import { Fingerprint } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
    AlertDialog,
    AlertDialogTrigger,
    AlertDialogContent,
    AlertDialogHeader,
    AlertDialogTitle,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogCancel,
    AlertDialogAction,
} from "@/components/ui/alert-dialog";

import {
    Command,
    CommandEmpty,
    CommandGroup,
    CommandInput,
    CommandItem,
    CommandList,
} from "@/components/ui/command";

import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from "@/components/ui/popover";

import EmployeeRegistration from "./Partials/EmployeeRegistration";
import EmployeeList from "./Partials/EmployeeList";
import EmployeeEditDialog from "./Partials/EmployeeEditDialog";

const EmployeeManagement = ({
    employeesList,
    departments,
    registeredList,
    unregisteredList,
    stations,
    userStation,
    userStationId,
    ...props
}) => {
    const sortedDepartments = [...departments].sort((a, b) => {
        const aName = a.name.trim().toLowerCase();
        const bName = b.name.trim().toLowerCase();

        const aIsNA = aName === "not applicable";
        const bIsNA = bName === "not applicable";

        // Not Applicable always first
        if (aIsNA) return -1;
        if (bIsNA) return 1;

        // normal A-Z
        return a.name.localeCompare(b.name);
    });

    const departmentOptions = [
        { id: "all", name: "All Departments" },
        ...sortedDepartments,
    ];
    console.log("Depts" , {departments});
    const [search, setSearch] = useState("");

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

    
    const [selectedDepartment, setSelectedDepartment] = useState("all");
    const [statusFilter, setStatusFilter] = useState("Active");
    const statusOptions = ["Active", "Inactive"];

    // Initialize employees from props
    useEffect(() => {
        setEmployees(Array.isArray(employeesList) ? employeesList : []);
    }, [employeesList]);

    // Keep registered / unregistered reactive
    useEffect(() => {
        setRegistered(employees.filter((emp) => emp.available_fingers < 3));
        setUnregistered(employees.filter((emp) => emp.available_fingers === 3));
    }, [employees]);

    const getFingerprintColor = () => {
        switch (scanStatus) {
            case "scanning":
                return "text-blue-500 animate-pulse";
            case "success":
                return "text-green-500 animate-bounce";
            case "error":
                return "text-red-500";
            default:
                return "text-gray-400";
        }
    };

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
                        department,
                    } = data.employee;

                    setTestEmployee({
                        first_name,
                        middle_name,
                        last_name,
                        position,
                        department,
                    });

                    setTestStatus("success");
                    setTestMessage(
                        `✅ Match: ${first_name} ${last_name} (${department} - ${position})`,
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
        department: "",
        work_type: "",
    });

    const [editOpen, setEditOpen] = useState(false);

    const [editForm, setEditForm] = useState(null);

    const handleEdit = (employee) => {
        setEditForm(employee);
        setEditOpen(true);
    };


    const filteredEmployees = employees.filter((emp) => {
        const matchesSearch =
            emp.first_name.toLowerCase().includes(search.toLowerCase()) ||
            emp.last_name.toLowerCase().includes(search.toLowerCase()) ||
            (emp.position &&
                emp.position.toLowerCase().includes(search.toLowerCase())) ||
            (emp.department?.name &&
                emp.department.name.toLowerCase().includes(search.toLowerCase()));

        // Department filter
        const matchesDepartment =
            selectedDepartment === "all"    
                ? true
                : emp.department_id === Number(selectedDepartment);

        // Status filter
        const matchesStatus =
            statusFilter === "All Status"
                ? true
                : statusFilter === "Active"
                  ? emp.active_status === "Active" || emp.active_status === 1
                  : emp.active_status === "Inactive" || emp.active_status === 0;

        return matchesSearch && matchesDepartment && matchesStatus;
    });

    return (
        <AuthenticatedLayout header="Employee Management">
            <Head title="AMS" />
            <main>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <EmployeeRegistration 
                        userStationId={userStationId}
                        departments={departments}
                    />
                    <div className="bg-gradient-to-br from-blue-100 to-white shadow-lg rounded-2xl p-6 border border-gray-100 flex flex-col">
                        <h2 className="text-l font-bold text-gray-800 mb-1 flex items-center gap-2">
                            <Fingerprint className="w-6 h-6 text-blue-600" />
                            Employee Fingerprint Registration
                        </h2>

                        <div className="flex flex-col items-center gap-4">
                            <Popover open={open} onOpenChange={setOpen}>
                                <PopoverTrigger asChild>
                                    <Button
                                        variant="cyan"
                                        role="combobox"
                                        className="justify-between"
                                    >
                                        {employees.find(
                                            (emp) =>
                                                emp.id === selectedEmployee,
                                        )?.full_name || "-- Choose Employee --"}
                                    </Button>
                                </PopoverTrigger>
                                <PopoverContent className="w-[300px] p-3">
                                    <Command>
                                        <CommandInput placeholder="Search employee..." />
                                        <CommandList>
                                            <CommandEmpty>
                                                No employee found.
                                            </CommandEmpty>
                                            <CommandGroup>
                                                {employees
                                                    .filter(
                                                        (emp) =>
                                                            availableFingers(
                                                                emp.id,
                                                            ) > 0,
                                                    )
                                                    .map((emp) => (
                                                        <CommandItem
                                                            key={emp.id}
                                                            onSelect={() => {
                                                                setSelectedEmployee(
                                                                    emp.id,
                                                                );
                                                                setOpen(false);
                                                            }}
                                                        >
                                                            {emp.full_name} (
                                                            {availableFingers(
                                                                emp.id,
                                                            )}{" "}
                                                            finger
                                                            {availableFingers(
                                                                emp.id,
                                                            ) !== 1
                                                                ? "s"
                                                                : ""}{" "}
                                                            available)
                                                        </CommandItem>
                                                    ))}
                                            </CommandGroup>
                                        </CommandList>
                                    </Command>
                                </PopoverContent>
                            </Popover>

                            <div className="flex flex-col items-center justify-center text-center">
                                <Fingerprint
                                    className={`w-20 h-20 transition-all duration-300 mt-5 ${getFingerprintColor()}`}
                                />
                                <p
                                    className={`text-sm font-semibold mt-4 min-h-[1.25rem] ${
                                        scanStatus === "error"
                                            ? "text-red-500"
                                            : scanStatus === "success"
                                              ? "text-green-500"
                                              : "text-blue-500"
                                    }`}
                                >
                                    {scanStatus === "error"
                                        ? scanMessage
                                        : scanStatus === "success"
                                          ? scanMessage
                                          : scanning
                                            ? scanMessage
                                            : selectedEmployee
                                              ? `${availableFingers(
                                                    selectedEmployee,
                                                )} Available Fingerprint${
                                                    availableFingers(
                                                        selectedEmployee,
                                                    ) !== 1
                                                        ? "s"
                                                        : ""
                                                } Registration`
                                              : ""}
                                </p>
                            </div>

                            <div className="cursor-pointer w-full flex justify-center gap-4">
                                <Button
                                    variant={scanning ? "cyan" : "green"}
                                    onClick={() => {
                                        if (scanning) cancelScan();
                                        else if (scanStatus === "success") {
                                            setScanning(false);
                                            setScanStatus("idle");
                                            setScanMessage(
                                                "Place your fingerprint",
                                            );
                                            setSelectedEmployee("");
                                        } else if (scanStatus === "error")
                                            registerFingerprint();
                                        else registerFingerprint();
                                    }}
                                    disabled={!selectedEmployee}
                                    className="w-60 mt-1"
                                >
                                    {scanning
                                        ? "Cancel"
                                        : scanStatus === "success"
                                          ? "Register Another"
                                          : scanStatus === "error"
                                            ? "Retry"
                                            : "Register Fingerprint"}
                                </Button>
                                <AlertDialog
                                    open={testOpen}
                                    onOpenChange={(open) => {
                                        setTestOpen(open);
                                        if (open) {
                                            // Start the continuous fingerprint test scan when dialog opens
                                            startTestFingerprint();
                                        } else {
                                            // Clean up SSE and reset UI when dialog closes
                                            if (testSource) testSource.close();
                                            setTestMessage(
                                                "Waiting for scan...",
                                            );
                                            setTestStatus("idle"); // optional, if you track status
                                        }
                                    }}
                                >
                                    <AlertDialogTrigger asChild>
                                        <Button
                                            variant="blue"
                                            className="w-60 mt-1"
                                        >
                                            Test Fingerprint
                                        </Button>
                                    </AlertDialogTrigger>

                                    <AlertDialogContent>
                                        <AlertDialogHeader>
                                            <AlertDialogTitle>
                                                Test Fingerprint
                                            </AlertDialogTitle>
                                            <AlertDialogDescription>
                                                Place your finger on the
                                                scanner. It will check against
                                                registered employees.
                                            </AlertDialogDescription>
                                        </AlertDialogHeader>

                                        <div className="flex flex-col items-center py-4">
                                            <Fingerprint
                                                className={`w-20 h-20 ${
                                                    testStatus === "scanning"
                                                        ? "text-blue-500 animate-pulse"
                                                        : testStatus ===
                                                            "success"
                                                          ? "text-green-500 animate-bounce"
                                                          : "text-red-500"
                                                }`}
                                            />
                                            <p className="mt-3 text-sm text-gray-700">
                                                {testMessage}
                                            </p>
                                        </div>

                                        <AlertDialogFooter>
                                            <AlertDialogCancel
                                                onClick={() => {
                                                    if (testSource)
                                                        testSource.close();
                                                    setTestMessage(
                                                        "Waiting for scan...",
                                                    );
                                                    setTestStatus("idle"); // optional reset
                                                }}
                                            >
                                                Close
                                            </AlertDialogCancel>
                                        </AlertDialogFooter>
                                    </AlertDialogContent>
                                </AlertDialog>
                            </div>
                        </div>
                    </div>
                </div>

                <EmployeeList
                    filteredEmployees={filteredEmployees}
                    isRegistered={isRegistered}
                    handleEdit={handleEdit}
                    search={search}
                    setSearch={setSearch}
                    departments={departments}
                    selectedDepartment={selectedDepartment}
                    setSelectedDepartment={setSelectedDepartment}
                    statusOptions={statusOptions}
                    statusFilter={statusFilter}
                    setStatusFilter={setStatusFilter}
                />

                <EmployeeEditDialog
                    editForm={editForm}
                    setEditForm={setEditForm}
                    editOpen={editOpen}
                    setEditOpen={setEditOpen}
                    departments={departments}
                    stations={stations}
                    userStationId={userStationId}
                />
            </main>
        </AuthenticatedLayout>
    );
};

export default EmployeeManagement;
