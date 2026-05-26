import React, { useState, useEffect, useRef } from "react";
import { Head } from "@inertiajs/react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Fingerprint, User2, Search } from "lucide-react";
import { AttendanceTable } from "./Partials/AttendanceTable";
import { getEmployeeName } from "@/lib/utils";

const defaultFingerprintServiceUrl = `http://${window.location.hostname}:5000`;

const Attendance = ({
    attendances,
    fingerprintServiceUrl = defaultFingerprintServiceUrl,
}) => {
    const [time, setTime] = useState(new Date());
    const [employee, setEmployee] = useState(null);
    const [scanMessage, setScanMessage] = useState("Place your fingerprint");
    const [scanStatus, setScanStatus] = useState("idle");
    const [retryCountdown, setRetryCountdown] = useState(null);
    const [successCountdown, setSuccessCountdown] = useState(null);
    const [dailyAttendance, setDailyAttendance] = useState(attendances || []);
    const [showAMPromptModal, setShowAMPromptModal] = useState(false);
    const [amPromptData, setAMPromptData] = useState(null);
    const [showPMPromptModal, setShowPMPromptModal] = useState(false);
    const [pmPromptData, setPMPromptData] = useState(null);
    const [activeTab, setActiveTab] = useState(
        new Date().getHours() < 12 ? "AM" : "PM",
    );
    const [search, setSearch] = useState("");
    const eventSourceRef = useRef(null);

    useEffect(() => {
        const timer = setInterval(() => setTime(new Date()), 1000);
        return () => clearInterval(timer);
    }, []);

    useEffect(() => startFingerprintLogin(), []);

    const startRetryCountdown = (seconds, callback) => {
        setRetryCountdown(seconds);
        let count = seconds;
        const interval = setInterval(() => {
            count -= 1;
            setRetryCountdown(count);
            if (count <= 0) {
                clearInterval(interval);
                setRetryCountdown(null);
                callback();
            }
        }, 1000);
    };

    const startFingerprintLogin = () => {
        if (eventSourceRef.current) eventSourceRef.current.close();
        setScanStatus("scanning");
        setScanMessage("Place your fingerprint");

        const eventSource = new EventSource(`${fingerprintServiceUrl}/bioLogin`);
        eventSourceRef.current = eventSource;

        eventSource.onmessage = (event) => {
            try {
                const dataStr = event.data.startsWith("data:")
                    ? event.data.slice(5)
                    : event.data;
                const data = JSON.parse(dataStr);
                if (!data || Object.keys(data).length === 0) return;

                const now = new Date();
                const timeStr = now.toTimeString().split(" ")[0];
                const session = data.session;

                if (data.prompt) {
                    if (data.prompt_type === "AM") {
                        setScanStatus("prompt");
                        setScanMessage(data.message);
                        setAMPromptData({
                            employee: data.employee,
                            message: data.message,
                            options: data.options,
                        });
                        setShowAMPromptModal(true);
                    } else if (data.prompt_type === "PM") {
                        setScanStatus("prompt");
                        setScanMessage(data.message);
                        setPMPromptData({
                            employee: data.employee,
                            message: data.message,
                            options: data.options,
                        });
                        setShowPMPromptModal(true);
                    }
                }

                if (data.success && data.employee) {
                    const {
                        first_name,
                        middle_name,
                        last_name,
                        position,
                        office,
                    } = data.employee;
                    setEmployee({
                        first_name,
                        middle_name,
                        last_name,
                        position,
                        office,
                    });
                    setScanStatus("success");
                    setScanMessage(`✅ ${data.message}`);

                    setDailyAttendance((prev) => {
                        const updated = [...prev];
                        const existing = updated.find(
                            (r) =>
                                r.employee.first_name === first_name &&
                                r.employee.last_name === last_name,
                        );

                        const emptyAM = { am_time_in: null, am_time_out: null };
                        const emptyPM = { pm_time_in: null, pm_time_out: null };

                        if (existing) {
                            if (session === "AM") {
                                existing.am = { ...emptyAM, ...existing.am };
                                if (data.action === "time-in")
                                    existing.am.am_time_in = timeStr;
                                if (data.action === "time-out")
                                    existing.am.am_time_out = timeStr;
                            } else {
                                existing.pm = { ...emptyPM, ...existing.pm };
                                if (data.action === "time-in")
                                    existing.pm.pm_time_in = timeStr;
                                if (data.action === "time-out")
                                    existing.pm.pm_time_out = timeStr;
                            }
                        } else {
                            updated.push({
                                id: `live-${Date.now()}`,
                                employee: {
                                    first_name,
                                    middle_name,
                                    last_name,
                                    position,
                                    office,
                                },
                                am:
                                    session === "AM"
                                        ? {
                                              am_time_in:
                                                  data.action === "time-in"
                                                      ? timeStr
                                                      : null,
                                              am_time_out:
                                                  data.action === "time-out"
                                                      ? timeStr
                                                      : null,
                                          }
                                        : { ...emptyAM },
                                pm:
                                    session === "PM"
                                        ? {
                                              pm_time_in:
                                                  data.action === "time-in"
                                                      ? timeStr
                                                      : null,
                                              pm_time_out:
                                                  data.action === "time-out"
                                                      ? timeStr
                                                      : null,
                                          }
                                        : { ...emptyPM },
                            });
                        }
                        return updated;
                    });

                    setActiveTab(session);

                    let count = 3;
                    setSuccessCountdown(count);
                    const interval = setInterval(() => {
                        count -= 1;
                        setSuccessCountdown(count);
                        if (count <= 0) {
                            clearInterval(interval);
                            setSuccessCountdown(null);
                            setScanStatus("scanning");
                            setScanMessage("Place your fingerprint");
                        }
                    }, 1000);
                } else if (data.message) {
                    setScanStatus("error");
                    setScanMessage(`❌ ${data.message}`);
                    startRetryCountdown(3, () => {
                        setScanStatus("scanning");
                        setScanMessage("Place your fingerprint");
                    });
                }
            } catch (err) {
                console.error("SSE parse error:", err);
                setScanStatus("error");
                setScanMessage("Failed to parse server response.");
            }
        };

        eventSource.onerror = (err) => {
            console.error("SSE error:", err);
            setScanStatus("error");
            setScanMessage("❌ Lost connection to fingerprint service.");
            setTimeout(() => startFingerprintLogin(), 3000);
        };
    };

    // --- Handle Prompt Choice Consistently ---
    const handlePromptChoice = (choice) => {
        setShowAMPromptModal(false);
        setShowPMPromptModal(false);
        setScanStatus("processing");
        setScanMessage(`Recording ${choice}...`);

        const eventSource = new EventSource(
            `${fingerprintServiceUrl}/bioFingerprintChoice/${
                promptData.employee.id
            }/${encodeURIComponent(choice)}`,
        );

        eventSource.onmessage = (event) => {
            try {
                const dataStr = event.data.startsWith("data:")
                    ? event.data.slice(5)
                    : event.data;
                const data = JSON.parse(dataStr);

                const now = new Date();
                const timeStr = now.toTimeString().split(" ")[0];
                const session = data.session;

                if (data.success && data.employee) {
                    const {
                        first_name,
                        middle_name,
                        last_name,
                        position,
                        office,
                    } = data.employee;
                    setEmployee({
                        first_name,
                        middle_name,
                        last_name,
                        position,
                        office,
                    });
                    setScanStatus("success");
                    setScanMessage(`✅ ${data.message}`);

                    setDailyAttendance((prev) => {
                        const updated = [...prev];
                        const existing = updated.find(
                            (r) =>
                                r.employee.first_name === first_name &&
                                r.employee.last_name === last_name,
                        );

                        const emptyAM = { am_time_in: null, am_time_out: null };
                        const emptyPM = { pm_time_in: null, pm_time_out: null };

                        if (existing) {
                            if (session === "AM") {
                                existing.am = { ...emptyAM, ...existing.am };
                                if (data.action === "time-in")
                                    existing.am.am_time_in = timeStr;
                                if (data.action === "time-out")
                                    existing.am.am_time_out = timeStr;
                            } else {
                                existing.pm = { ...emptyPM, ...existing.pm };
                                if (data.action === "time-in")
                                    existing.pm.pm_time_in = timeStr;
                                if (data.action === "time-out")
                                    existing.pm.pm_time_out = timeStr;
                            }
                        } else {
                            updated.push({
                                id: `live-${Date.now()}`,
                                employee: {
                                    first_name,
                                    middle_name,
                                    last_name,
                                    position,
                                    office,
                                },
                                am:
                                    session === "AM"
                                        ? {
                                              am_time_in:
                                                  data.action === "time-in"
                                                      ? timeStr
                                                      : null,
                                              am_time_out:
                                                  data.action === "time-out"
                                                      ? timeStr
                                                      : null,
                                          }
                                        : { ...emptyAM },
                                pm:
                                    session === "PM"
                                        ? {
                                              pm_time_in:
                                                  data.action === "time-in"
                                                      ? timeStr
                                                      : null,
                                              pm_time_out:
                                                  data.action === "time-out"
                                                      ? timeStr
                                                      : null,
                                          }
                                        : { ...emptyPM },
                            });
                        }
                        return updated;
                    });

                    setActiveTab(session);

                    let count = 3;
                    setSuccessCountdown(count);
                    const interval = setInterval(() => {
                        count -= 1;
                        setSuccessCountdown(count);
                        if (count <= 0) {
                            clearInterval(interval);
                            setSuccessCountdown(null);
                            setScanStatus("scanning");
                            setScanMessage("Place your fingerprint");
                        }
                    }, 1000);
                } else if (data.message) {
                    setScanStatus("error");
                    setScanMessage(`❌ ${data.message}`);
                    startRetryCountdown(3, () => {
                        setScanStatus("scanning");
                        setScanMessage("Place your fingerprint");
                    });
                }
            } catch (err) {
                console.error("SSE parse error:", err);
                setScanStatus("error");
                setScanMessage("Failed to parse server response.");
            } finally {
                eventSource.close();
            }
        };

        eventSource.onerror = (err) => {
            console.error("SSE error:", err);
            setScanStatus("error");
            setScanMessage("Failed to send choice to server.");
            eventSource.close();
        };
    };

    const getFingerprintColor = () => {
        switch (scanStatus) {
            case "scanning":
                return "text-blue-500 animate-pulse";
            case "processing":
                return "text-yellow-500 animate-pulse";
            case "success":
                return "text-green-500 animate-bounce";
            case "error":
                return "text-red-500";
            default:
                return "text-gray-400";
        }
    };

    return (
        <>
            <Head title="Attendance" />
            <main className="w-full flex justify-center items-center p-8 min-h-screen bg-white-600">
                <div className="grid grid-cols-5 gap-6 w-full max-w-7xl">
                    {/* Left Panel */}
                    <Card className="col-span-3 shadow-xl rounded-2xl p-6 flex flex-col justify-center border border-gray-100">
                        <CardHeader className="grid grid-cols-3 items-center mb-1">
                            <div className="flex justify-start px-4">
                                <img
                                    src="/sdo-pic.jpg"
                                    alt="Division of Ilagan Logo"
                                    className="w-20 h-20 object-contain"
                                />
                            </div>
                            <div className="text-center mx-auto">
                                <CardTitle className="text-4xl font-extrabold text-blue-900">
                                    TimeVault
                                </CardTitle>
                                <p className="text-sm text-gray-500 mt-1 tracking-wide">
                                    Biometric Attendance System
                                </p>
                            </div>
                            <div className="flex justify-end px-4">
                                <img
                                    src="/logo-copy.png"
                                    alt="Partner Logo"
                                    className="w-20 h-20 object-contain"
                                />
                            </div>
                        </CardHeader>

                        <CardContent className="h-full">
                            <div className="grid grid-cols-2 gap-6 items-center h-full">
                                {/* Fingerprint Scanner */}
                                <div className="flex flex-col items-center justify-center border-r pr-6">
                                    <Fingerprint
                                        className={`w-24 h-24 ${getFingerprintColor()}`}
                                    />
                                    <p className="mt-3 text-base font-medium text-gray-700 text-center min-h-[1.5rem]">
                                        {scanMessage}
                                    </p>
                                    <p className="text-sm font-semibold mt-1 min-h-[1.25rem] text-blue-500">
                                        {retryCountdown !== null
                                            ? `Retrying in ${retryCountdown}...`
                                            : successCountdown !== null
                                              ? `Resetting in ${successCountdown}...`
                                              : ""}
                                    </p>
                                </div>

                                {/* Employee Info + Clock */}
                                <div className="flex flex-col justify-center items-center text-center space-y-8 w-full">
                                    <Card className="w-full border border-gray-200 rounded-xl shadow-sm p-4">
                                        <CardContent className="flex items-center justify-center gap-2 text-lg font-semibold text-gray-800">
                                            <User2 className="w-5 h-5 text-gray-500" />
                                            {employee
                                                ? getEmployeeName(employee)
                                                : "No Employee Detected"}
                                        </CardContent>
                                    </Card>

                                    <Card className="w-full border border-gray-200 rounded-xl shadow-sm p-6">
                                        <CardContent className="flex flex-col items-center justify-center text-center">
                                            <div className="text-6xl font-mono font-bold text-blue-900 tracking-wider">
                                                {time.toLocaleTimeString()}
                                            </div>
                                            <div className="text-gray-600 text-sm mt-2">
                                                {time.toLocaleDateString(
                                                    undefined,
                                                    {
                                                        weekday: "long",
                                                        year: "numeric",
                                                        month: "long",
                                                        day: "numeric",
                                                    },
                                                )}
                                            </div>
                                            <div className="w-full h-1 bg-gray-200 mt-2">
                                                <div
                                                    className="h-1 bg-blue-600 transition-all"
                                                    style={{
                                                        width: `${
                                                            (time.getSeconds() /
                                                                60) *
                                                            100
                                                        }%`,
                                                    }}
                                                />
                                            </div>
                                        </CardContent>
                                    </Card>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Right Panel */}
                    <Card className="col-span-2 shadow-xl rounded-2xl p-4 flex flex-col border border-gray-100">
                        <div className="relative w-full mb-4">
                            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                            <input
                                type="text"
                                placeholder="Search employee..."
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                                className="w-full pl-10 pr-3 py-2 border rounded-md text-sm focus:ring-2 focus:ring-blue-500"
                            />
                        </div>

                        <Tabs
                            value={activeTab}
                            onValueChange={setActiveTab}
                            className="flex-1 flex flex-col"
                        >
                            <TabsList className="grid grid-cols-2 w-full mb-4 bg-gray-100 rounded-lg p-1">
                                <TabsTrigger
                                    value="AM"
                                    className="rounded-md data-[state=active]:bg-blue-600 data-[state=active]:text-white"
                                >
                                    AM
                                </TabsTrigger>
                                <TabsTrigger
                                    value="PM"
                                    className="rounded-md data-[state=active]:bg-blue-600 data-[state=active]:text-white"
                                >
                                    PM
                                </TabsTrigger>
                            </TabsList>

                            {["AM", "PM"].map((session) => (
                                <TabsContent
                                    key={session}
                                    value={session}
                                    className="h-full"
                                >
                                    <AttendanceTable
                                        dailyAttendance={dailyAttendance}
                                        session={session}
                                        search={search}
                                    />
                                </TabsContent>
                            ))}
                        </Tabs>
                    </Card>
                </div>

                {showAMPromptModal && amPromptData && (
                    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                        <div className="bg-white rounded-xl p-6 shadow-lg max-w-sm w-full text-center">
                            <h2 className="text-lg font-semibold mb-3">
                                {amPromptData.employee.first_name}{" "}
                                {amPromptData.employee.last_name}
                            </h2>
                            <p className="text-gray-700 mb-5">
                                {amPromptData.message}
                            </p>
                            <div className="flex justify-around">
                                <button
                                    className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg"
                                    onClick={() =>
                                        handlePromptChoice("AM Time-Out")
                                    }
                                >
                                    AM Time-Out
                                </button>
                                <button
                                    className="bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded-lg"
                                    onClick={() =>
                                        handlePromptChoice("PM Time-In")
                                    }
                                >
                                    PM Time-In
                                </button>
                            </div>
                        </div>
                    </div>
                )}

                {showPMPromptModal && pmPromptData && (
                    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                        <div className="bg-white rounded-xl p-6 shadow-lg max-w-sm w-full text-center">
                            <h2 className="text-lg font-semibold mb-3">
                                {pmPromptData.employee.first_name}{" "}
                                {pmPromptData.employee.last_name}
                            </h2>
                            <p className="text-gray-700 mb-5">
                                {pmPromptData.message}
                            </p>
                            <div className="flex justify-around">
                                <button
                                    className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg"
                                    onClick={() =>
                                        handlePromptChoice("PM Time-In")
                                    }
                                >
                                    PM Time-In
                                </button>
                                <button
                                    className="bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded-lg"
                                    onClick={() =>
                                        handlePromptChoice("PM Time-Out")
                                    }
                                >
                                    PM Time-Out
                                </button>
                            </div>
                        </div>
                    </div>
                )}
            </main>
        </>
    );
};

export default Attendance;


