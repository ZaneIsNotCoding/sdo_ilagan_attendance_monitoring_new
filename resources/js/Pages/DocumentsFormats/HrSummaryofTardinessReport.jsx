import React from "react";

const HrSummaryofTardinessReport = React.forwardRef(
    ({ groupedByEmployee, monthRangeLabel }, ref) => {
        // Group records by department
        const departments = Array.from(
            new Set(groupedByEmployee.map((record) => record.dept))
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
                            Tardiness Summary Report
                        </h1>
                        <h2 className="text-[10px] font-semibold tracking-wider">
                            {monthRangeLabel}
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

                <div
                    ref={ref}
                    className="px-4 py-2 text-[10px] font-sans leading-tight"
                >
                    <table className="w-full table-fixed border border-black border-collapse text-center">
                        <thead className="bg-gray-200">
                            <tr>
                                <th className="border border-black px-2 py-2 w-[30px]">
                                    No.
                                </th>
                                <th className="border border-black px-2 py-2 w-[150px]">
                                    Name
                                </th>
                                <th className="border border-black px-2 py-2 w-[80px]">
                                    Month
                                </th>
                                <th className="border border-black px-2 py-2 w-[70px]">
                                    Total Tardy
                                </th>
                                <th className="border border-black px-2 py-2 w-[100px]">
                                    Equiv Day in Hours
                                </th>
                                <th className="border border-black px-2 py-2 w-[100px]">
                                    Equiv Day in Minutes
                                </th>
                                <th className="border border-black px-2 py-2 w-[80px]">
                                    Total Equivalent
                                </th>
                            </tr>
                        </thead>

                        {departments.map((dept, deptIndex) => {
                            const deptEmployees = groupedByEmployee.filter(
                                (r) => r.dept === dept
                            );
                            return (
                                <tbody key={deptIndex} className="department">
                                    {/* Department row */}
                                    <tr className="bg-gray-100 font-bold">
                                        <td
                                            colSpan={7}
                                            className="border border-black text-center py-3"
                                        >
                                            {dept}
                                        </td>
                                    </tr>

                                    {/* Employee rows */}
                                    {deptEmployees.map((emp, index) => (
                                        <tr key={index}>
                                            <td className="border border-black px-2 py-2 text-center">
                                                {index + 1}
                                            </td>
                                            <td className="border border-black px-2 py-2 text-center">
                                                {emp.name}
                                            </td>
                                            <td className="border border-black px-2 py-2 text-center">
                                                {monthRangeLabel}
                                            </td>
                                            <td className="border border-black px-2 py-2 text-center">
                                                {emp.total_tardy.toFixed(2)}
                                            </td>
                                            <td className="border border-black px-2 py-2 text-center">
                                                {emp.equi_hours.toFixed(3)}
                                            </td>
                                            <td className="border border-black px-2 py-2 text-center">
                                                {emp.equi_mins.toFixed(3)}
                                            </td>
                                            <td className="border border-black px-2 py-2 text-center">
                                                {emp.total_equi.toFixed(3)}
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            );
                        })}
                    </table>
                </div>
            </div>
        );
    }
);

export default HrSummaryofTardinessReport;

