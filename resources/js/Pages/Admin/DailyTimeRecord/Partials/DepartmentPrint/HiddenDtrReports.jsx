import React from "react";
import dayjs from "dayjs";
import DTRReport from "@/Pages/DocumentsFormats/DtrReport";
import { generateLogs } from "./utils";

const HiddenDtrReports = ({
    employeeData,
    pdfRefs,
    printEmployees,
    selectedEmployeeSignatory,
    selectedMonth,
    selectedYear,
}) => (
    <div className="absolute left-[-9999px] top-0">
        {printEmployees.map((employee) => {
            const data = employeeData[employee.id];
            if (!data) return null;

            return (
                <DTRReport
                    key={employee.id}
                    ref={(element) => (pdfRefs.current[employee.id] = element)}
                    name={employee.full_name}
                    dateRange={{
                        start: dayjs(
                            `${selectedYear}-${String(selectedMonth).padStart(
                                2,
                                "0",
                            )}-01`,
                        )
                            .startOf("month")
                            .format("YYYY-MM-DD"),
                        end: dayjs(
                            `${selectedYear}-${String(selectedMonth).padStart(
                                2,
                                "0",
                            )}-01`,
                        )
                            .endOf("month")
                            .format("YYYY-MM-DD"),
                    }}
                    logs={generateLogs(
                        data.time_record,
                        selectedMonth,
                        selectedYear,
                    )}
                    monthlyTotals={data.monthly_totals}
                    signatory={selectedEmployeeSignatory(employee)}
                />
            );
        })}
    </div>
);

export default HiddenDtrReports;
