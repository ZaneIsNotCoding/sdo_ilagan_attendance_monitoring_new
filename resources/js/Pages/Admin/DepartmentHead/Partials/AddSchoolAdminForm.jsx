import React, { useState } from "react";
import { router } from "@inertiajs/react";

const AddSchoolAdminForm = ({ employees = [], stations = [], close }) => {
    const [selectedStation, setSelectedStation] = useState("");
    const [selectedEmployee, setSelectedEmployee] = useState("");

    const filteredEmployees = employees.filter(
        (emp) => emp.station_id == selectedStation
    );

    const handleSubmit = (e) => {
        e.preventDefault();

        router.post(route("departmenthead.store"), {
            employee_id: selectedEmployee,
            type: "school_admin",
        }, {
            onSuccess: () => {
                setSelectedStation("");
                setSelectedEmployee("");
                close();
            }
        });
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-4 mb-4">

            {/* Station */}
            <select
                className="w-full border p-2 rounded"
                value={selectedStation}
                onChange={(e) => {
                    setSelectedStation(e.target.value);
                    setSelectedEmployee("");
                }}
            >
                <option value="">Select Station</option>
                {stations.map((s) => (
                    <option key={s.id} value={s.id}>
                        {s.name}
                    </option>
                ))}
            </select>

            {/* Employee */}
            <select
                className="w-full border p-2 rounded"
                value={selectedEmployee}
                onChange={(e) => setSelectedEmployee(e.target.value)}
                disabled={!selectedStation}
            >
                <option value="">
                    {selectedStation ? "Select Employee" : "Select station first"}
                </option>

                {filteredEmployees.map((emp) => (
                    <option key={emp.id} value={emp.id}>
                        {emp.first_name} {emp.last_name}
                    </option>
                ))}
            </select>

            <button
                type="submit"
                className="bg-blue-600 text-white px-4 py-2 rounded"
                disabled={!selectedEmployee}
            >
                Add School Admin
            </button>
        </form>
    );
};

export default AddSchoolAdminForm;  