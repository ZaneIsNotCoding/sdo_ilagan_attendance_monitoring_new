import React from "react";

const formatWorkHour = (time) => {
    if (!time) {
        return "";
    }

    const [hours = "0", minutes = "0"] = String(time).split(":");
    const date = new Date();
    date.setHours(Number(hours), Number(minutes), 0, 0);

    return date
        .toLocaleTimeString("en-US", {
            hour: "2-digit",
            minute: "2-digit",
            hour12: true,
        })
        .toLowerCase();
};

const DTRReport = React.forwardRef(
    ({ name, dateRange, logs, signatory, workSchedule }, ref) => {
    const signatoryPosition =
        signatory && !signatory.missing ? signatory.position : "";
    const officialTimeIn = formatWorkHour(workSchedule?.time_in) || "08:00 am";
    const officialTimeOut = formatWorkHour(workSchedule?.time_out) || "05:00 pm";
    const formattedMonth = new Date(dateRange.start).toLocaleDateString(
        "en-US",
        { month: "long", year: "numeric" }
    );

    // map logs into an object for quick lookup by date
    const logsMap = logs.reduce((acc, log) => {
        acc[log.date] = log;
        return acc;
    }, {});

    // generate all dates between start and end
    const getAllDates = (start, end) => {
        const dates = [];
        let current = new Date(start);
        const last = new Date(end);
        while (current <= last) {
            dates.push(new Date(current));
            current.setDate(current.getDate() + 1);
        }
        return dates;
    };

    const allDates = getAllDates(dateRange.start, dateRange.end);

    // fixed column widths (sum ~ 155mm)
    const colW = [
        "30mm",
        "15mm",
        "15mm",
        "15mm",
        "15mm",
        "15mm",
        "15mm",
        "35mm",
    ];
    const totalWidthMm = colW.reduce((s, w) => s + parseFloat(w), 0) + "mm";

    // cell style generator
    const cellStyle = (i, opts = {}) => ({
        width: colW[i],
        boxSizing: "border-box",
        padding: "2px 2px",
        fontSize: "11px",
        lineHeight: "1.2",
        height: "12px",
        verticalAlign: "middle",
        textAlign: opts.align || "center",
    });

    return (
        <div ref={ref} style={{ position: "relative", padding: "20px" }}>
            <style>
                {`
                    table.dtr-table {
                        border-collapse: collapse !important;
                        table-layout: fixed !important;
                        width: ${totalWidthMm} !important;
                        margin: 0 auto;
                    }
                    table.dtr-table th {
                        font-weight: bold;
                        padding-bottom: 6px; /* small gap */
                    }
                    table.dtr-table td {
                        font-size: 11px !important;
                        padding: 2px 2px !important;
                        line-height: 1.2 !important;
                        height: 12px !important;
                    }
                    table.dtr-table td:first-child {
                        text-align: left;
                    }
                `}
            </style>

            {/* Watermark */}
            <img
                src="/sdo-pic.jpg"
                alt="Watermark"
                style={{
                    position: "absolute",
                    top: "50%",
                    left: "50%",
                    transform: "translate(-50%, -50%)",
                    width: "70%",
                    opacity: 0.15,
                    zIndex: 0,
                }}
            />

            <div style={{ position: "relative", zIndex: 1 }}>
                {/* Header */}
                <div style={{ textAlign: "left", marginBottom: 5 }}>
                    <h5 className="font-semibold text-xs">CS Form 48</h5>
                    <h2 className="font-bold text-lg text-gray-600">
                        DAILY TIME RECORD
                    </h2>
                </div>

                <div className="flex justify-between text-xs mb-4">
                    <div>
                        <p>
                            <strong>
                                SDO City Of Ilagan Daily Time Record
                            </strong>
                        </p>
                        <p>
                            Start Date:{" "}
                            {new Date(dateRange.start).toLocaleDateString(
                                "en-US"
                            )}
                        </p>
                        <p>
                            End Date:{" "}
                            {new Date(dateRange.end).toLocaleDateString(
                                "en-US"
                            )}
                        </p>
                    </div>
                    <div>
                        <p>
                            Name: <span className="underline">{name}</span>
                        </p>
                        <p>
                            For the Month of:{" "}
                            <span className="underline">{formattedMonth} </span>
                        </p>
                        <p>
                            Official Hour for arrival: <u>{officialTimeIn}</u>
                        </p>
                        <p>
                            And Departure (Reg. Days): <u>{officialTimeOut}</u>
                        </p>
                    </div>
                </div>

                {/* Table */}
                <table className="dtr-table">
                    <colgroup>
                        {colW.map((w, i) => (
                            <col key={i} style={{ width: w }} />
                        ))}
                    </colgroup>
                    <thead>
                        <tr>
                            <th style={cellStyle(0, { align: "left" })}>
                                {name}
                            </th>
                            <th style={cellStyle(1)}>AM IN</th>
                            <th style={cellStyle(2)}>AM OUT</th>
                            <th style={cellStyle(3)}>PM IN</th>
                            <th style={cellStyle(4)}>PM OUT</th>
                            <th style={cellStyle(5)}>OT IN</th>
                            <th style={cellStyle(6)}>OT OUT</th>
                            <th style={cellStyle(7, { align: "right" })}>
                                UNDERTIME
                            </th>
                        </tr>
                    </thead>
                    <tbody>
                        {allDates.map((d, i) => {
                            const iso = d.toISOString().split("T")[0];
                            const formatted = d.toLocaleDateString("en-US"); // MM/DD/YYYY
                            const weekday = d.toLocaleDateString("en-US", {
                                weekday: "short",
                            });
                            const log = logsMap[iso] || {};
                            return (
                                <tr key={i}>
                                    <td style={cellStyle(0, { align: "left" })}>
                                        {formatted} {weekday}
                                    </td>
                                    {log.isLeave ? (
                                        <td
                                            colSpan={7}
                                            style={{
                                                ...cellStyle(1),
                                                textAlign: "center",
                                                fontWeight: "bold",
                                            }}
                                        >
                                            {{
                                                VL: "Vacation Leave",
                                                SL: "Sick Leave",
                                                OB: "Official Business",
                                                LS: "Locator Slip",
                                                TO: "Travel Order",
                                            }[log.leave_type] || log.leave_type}
                                        </td>
                                    ) : (
                                        <>
                                            <td style={cellStyle(1)}>
                                                {log.amIn || ""}
                                            </td>
                                            <td style={cellStyle(2)}>
                                                {log.amOut || ""}
                                            </td>
                                            <td style={cellStyle(3)}>
                                                {log.pmIn || ""}
                                            </td>
                                            <td style={cellStyle(4)}>
                                                {log.pmOut || ""}
                                            </td>
                                            <td style={cellStyle(5)}>
                                                {log.otIn || ""}
                                            </td>
                                            <td style={cellStyle(6)}>
                                                {log.otOut || ""}
                                            </td>
                                            <td
                                                style={cellStyle(7, {
                                                    align: "right",
                                                })}
                                            >
                                                {log.undertime || ""}
                                            </td>
                                        </>
                                    )}
                                </tr>
                            );
                        })}
                    </tbody>
                </table>

                {/* Footer */}
                <div
                    style={{ marginTop: 35, fontSize: 13, textAlign: "center" }}
                >
                    <p style={{ marginBottom: "30px" }}>
                        I certify on my honor that the above is true and correct
                        report of the hours <br /> worked/performed record of
                        which was made daily at the time of arrival and
                        departure <br /> from office.
                    </p>

                    <div
                        style={{
                            textAlign: "center",
                            fontSize: 18,
                            marginBottom: "10px", // compact overall
                            lineHeight: 1.2,
                        }}
                    >
                        <div style={{ marginBottom: "4px" }}>
                            <strong>{name.toUpperCase()}</strong>
                        </div>
                        <div
                            style={{
                                borderBottom: "1px solid black",
                                width: "250px",
                                margin: "0 auto 2px auto", // enough gap so line is below, not on text
                            }}
                        ></div>
                        <small style={{ display: "block", marginTop: "0" }}>
                            Printed Name and Signature of Employee
                        </small>
                    </div>

                    {/* Office head signature */}
                    <div
                        style={{
                            textAlign: "center",
                            fontSize: 18,
                            lineHeight: 1.2,
                        }}
                    >
                        <div style={{ marginBottom: "4px" }}>
                            <strong>
                                {(signatory?.name || "NO OFFICE HEAD ASSIGNED").toUpperCase()}
                            </strong>
                        </div>
                        <div
                            style={{
                                borderBottom: "1px solid black",
                                width: "250px",
                                margin: "0 auto 2px auto",
                            }}
                        ></div>
                        <small style={{ display: "block", marginTop: "0" }}>
                            {signatoryPosition}
                        </small>
                    </div>
                </div>
            </div>
        </div>
    );
    },
);

export default DTRReport;
