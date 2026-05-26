import React from "react";

const AdminSummaryofTardinessReport = React.forwardRef(
    ({ summary, selectedYear }, ref) => {
        const monthList = [
            "Jan",
            "Feb",
            "Mar",
            "Apr",
            "May",
            "June",
            "July",
            "Aug",
            "Sept",
            "Oct",
            "Nov",
            "Dec",
        ];

        // Get unique departments
        const departments = Array.from(
            new Set(summary.map((e) => e.employee.department))
        );

        return (
            <div
                ref={ref}
                className="px-4 py-2 text-[10px] font-sans leading-tight"
            >
                <div className="relative flex items-center mb-3 justify-between">
                    {/* Left Logo */}
                    <div>
                        <img
                            src="/sdo-pic.jpg"
                            alt="Left Logo"
                            className="w-16 h-16 object-contain"
                        />
                    </div>

                    {/* Center Title */}
                    <div className="absolute left-1/2 transform -translate-x-1/2 text-center">
                        <h1 className="text-[12px] font-bold uppercase tracking-wide">
                            SUMMARY OF TARDINESS
                        </h1>
                        <h2 className="text-[10px] font-semibold tracking-wider">
                            {selectedYear}
                        </h2>
                    </div>

                    {/* Right Logo */}
                    <div>
                        <img
                            src="/logo-copy.png"
                            alt="Right Logo"
                            className="w-16 h-16 object-contain"
                        />
                    </div>
                </div>

                <table className="w-full table-fixed border border-black border-collapse text-center">
                    <thead className="bg-gray-200">
                        <tr>
                            <th
                                rowSpan={2}
                                className="border border-black px-2 py-2 w-[30px]"
                            >
                                No.
                            </th>
                            <th
                                rowSpan={2}
                                className="border border-black px-2 py-2 w-[150px]"
                            >
                                Name
                            </th>
                            <th
                                colSpan={12}
                                className="border border-black px-2 py-2 text-[9px]"
                            >
                                Number of hours
                            </th>
                            <th
                                rowSpan={2}
                                className="border border-black px-2 py-2 w-[50px]"
                            >
                                Total
                            </th>
                        </tr>
                        <tr>
                            {monthList.map((month, idx) => (
                                <th
                                    key={idx}
                                    className="border border-black px-2 py-2 text-[9px]"
                                >
                                    {month}
                                </th>
                            ))}
                        </tr>
                    </thead>

                    {departments.map((dept, deptIndex) => {
                        const deptEmployees = summary.filter(
                            (e) => e.employee.department === dept
                        );
                        if (!deptEmployees.length) return null;

                        return (
                            <tbody key={deptIndex} className="department">
                                {/* Department row */}
                                <tr style={{ pageBreakInside: "avoid" }}>
                                    <td
                                        colSpan={monthList.length + 3}
                                        className="border border-black font-bold text-center bg-gray-100 py-3"
                                    >
                                        {dept}
                                    </td>
                                </tr>

                                {/* Employee rows */}
                                {deptEmployees.map((emp, index) => (
                                    <tr
                                        key={index}
                                        style={{ pageBreakInside: "avoid" }}
                                    >
                                        <td className="border border-black px-2 py-2 text-center">
                                            {index + 1}
                                        </td>
                                        <td className="border border-black px-2 py-2 text-center">
                                            {emp.employee.full_name}
                                        </td>
                                        {monthList.map((_, monthIndex) => (
                                            <td
                                                key={monthIndex}
                                                className="border border-black px-2 py-2 text-center"
                                            >
                                                {emp.tardyPerMonths[
                                                    selectedYear
                                                ]?.[monthIndex + 1]?.toFixed(
                                                    2
                                                ) || "0.00"}
                                            </td>
                                        ))}
                                        <td className="border border-black px-2 py-2 text-center">
                                            {emp.tardyPerYear[
                                                selectedYear
                                            ]?.toFixed(2) || "0.00"}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        );
                    })}
                </table>
            </div>
        );
    }
);

export default AdminSummaryofTardinessReport;

