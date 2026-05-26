import React from "react";

const box = (checked) => (
    <span
        style={{
            display: "inline-block",
            width: "10px",
            height: "10px",
            border: "1px solid #000",
            marginRight: "5px",
            textAlign: "center",
            lineHeight: "9px",
            fontSize: "9px",
            fontFamily: "Arial, sans-serif",
        }}
    >
        {checked ? "x" : ""}
    </span>
);

const line = (value = "", width = "150px") => (
    <span
        style={{
            display: "inline-block",
            width,
            maxWidth: "100%",
            borderBottom: "1px solid #000",
            minHeight: "15px",
            padding: "0 4px 3px",
            lineHeight: 1,
            boxSizing: "border-box",
            verticalAlign: "bottom",
        }}
    >
        {value}
    </span>
);

const cellStyle = {
    border: "1px solid #000",
    padding: "3px 5px",
    verticalAlign: "top",
};

const headerCellStyle = {
    ...cellStyle,
    padding: "3px 6px",
    fontWeight: "bold",
    textAlign: "center",
    backgroundColor: "#f7f7f7",
};

const paperLayouts = {
    legal: {
        width: "816px",
        minHeight: "1344px",
        padding: "34px 50px",
        fontSize: "10px",
        headerTop: "10px",
        sectionLineHeight: 1.5,
    },
    a4: {
        width: "794px",
        minHeight: "1123px",
        padding: "20px 38px",
        fontSize: "9px",
        headerTop: "6px",
        sectionLineHeight: 1.32,
    },
};

const leaveTypes = [
    {
        label: "Vacation Leave",
        detail: "(Sec. 51, Rule XVI, Omnibus Rules Implementing E.O. No. 292)",
    },
    {
        label: "Mandatory/Forced Leave",
        detail: "(Sec. 25, Rule XVI, Omnibus Rules Implementing E.O. No. 292)",
    },
    {
        label: "Sick Leave",
        detail: "(Sec. 43, Rule XVI, Omnibus Rules Implementing E.O. No. 292)",
    },
    {
        label: "Maternity Leave",
        detail: "(R.A. No. 11210 / IRR issued by CSC, DOLE and SSS)",
    },
    {
        label: "Paternity Leave",
        detail: "(R.A. No. 8187 / CSC MC No. 71, s. 1998, as amended)",
    },
    {
        label: "Special Privilege Leave",
        detail: "(Sec. 21, Rule XVI, Omnibus Rules Implementing E.O. No. 292)",
    },
    {
        label: "Solo Parent Leave",
        detail: "(R.A. No. 8972 / CSC MC No. 8, s. 2004)",
    },
    {
        label: "Study Leave",
        detail: "(Sec. 68, Rule XVI, Omnibus Rules Implementing E.O. No. 292)",
    },
    {
        label: "10-Day VAWC Leave",
        detail: "(RA No. 9262 / CSC MC No. 15, s. 2005)",
    },
    {
        label: "Rehabilitation Privilege",
        detail: "(Sec. 55, Rule XVI, Omnibus Rules Implementing E.O. No. 292)",
    },
    {
        label: "Special Leave Benefits for Women",
        detail: "(RA No. 9710 / CSC MC No. 25, s. 2010)",
    },
    {
        label: "Special Emergency (Calamity) Leave",
        detail: "(CSC MC No. 2, s. 2012, as amended)",
    },
    {
        label: "Adoption Leave",
        detail: "(R.A. No. 8552)",
    },
];

const ApplicationLeaveReport = React.forwardRef(
    (
        {
            officeDepartment = "",
            employeeName = "",
            dateOfFiling = "",
            position = "",
            salary = "",
            typeOfLeave = "",
            typeOfLeaveOther = "",
            leaveLocation = "",
            leaveLocationDetails = "",
            sickLeaveLocation = "",
            illness = "",
            womenIllness = "",
            studyLeavePurpose = "",
            otherPurpose = "",
            workingDays = "",
            inclusiveDates = "",
            commutation = "",
            recommendingOfficerName = "MARY ANN M. BELTRAN, LIB, PhD.",
            recommendingOfficerTitle = "Administrative Officer V",
            approvingOfficerName = "CHERYL R. RAMIRO, PhD, CESO VI",
            approvingOfficerTitle = "ASSISTANT SCHOOLS DIVISION SUPERINTENDENT",
            paperSize = "legal",
        },
        ref,
    ) => {
        const layout = paperLayouts[paperSize] || paperLayouts.legal;
        const rawName = String(employeeName).replace(/\s+/g, " ").trim();
        const commaNameParts = rawName.split(",").map((part) => part.trim());
        const nameParts =
            commaNameParts.length > 1
                ? commaNameParts[1].split(/\s+/)
                : rawName.split(/\s+/);
        const lastName =
            commaNameParts.length > 1
                ? commaNameParts[0]
                : nameParts.length > 1
                  ? nameParts[nameParts.length - 1]
                  : rawName;
        const firstName =
            commaNameParts.length > 1
                ? nameParts[0] || ""
                : nameParts.length > 1
                  ? nameParts[0]
                  : "";
        const middleName =
            commaNameParts.length > 1
                ? nameParts.slice(1).join(" ")
                : nameParts.length > 2
                  ? nameParts.slice(1, -1).join(" ")
                  : "";

        return (
            <div
                ref={ref}
                style={{
                    width: layout.width,
                    minHeight: layout.minHeight,
                    backgroundColor: "#fff",
                    color: "#000",
                    fontFamily: "Arial, Helvetica, sans-serif",
                    fontSize: layout.fontSize,
                    padding: layout.padding,
                    boxSizing: "border-box",
                    margin: "0 auto",
                }}
            >
                <div style={{ fontSize: "10px", fontStyle: "italic" }}>
                    Civil Service Form No. 6
                    <br />
                    Revised 2020
                </div>

                <div
                    style={{
                        display: "grid",
                        gridTemplateColumns: "90px 1fr 90px",
                        alignItems: "center",
                        marginTop: layout.headerTop,
                    }}
                >
                    <img
                        src="/img/logo.png"
                        alt="Logo"
                        style={{
                            width: "58px",
                            justifySelf: "center",
                        }}
                    />
                    <div
                        style={{
                            textAlign: "center",
                            lineHeight: 1.15,
                        }}
                    >
                        <div
                            style={{
                                fontFamily: "OldEnglish",
                                fontSize: "13px",
                            }}
                        >
                            Republic of the Philippines
                        </div>
                        <div
                            style={{
                                fontFamily: "OldEnglish",
                                fontSize: "20px",
                                fontWeight: "bold",
                            }}
                        >
                            Department of Education
                        </div>
                        <div style={{ fontSize: "10px", fontWeight: "bold" }}>
                            SCHOOLS DIVISION OFFICE - CITY OF ILAGAN
                        </div>
                        <div style={{ fontSize: "9px" }}>
                            INHS Compound, Claravall St., San Vicente, City of
                            Ilagan, Isabela
                        </div>
                        <div
                            style={{
                                marginTop: "5px",
                                fontSize: "21px",
                                fontWeight: "bold",
                                letterSpacing: 0,
                            }}
                        >
                            APPLICATION FOR LEAVE
                        </div>
                    </div>
                    <div />
                </div>

                <table
                    style={{
                        width: "100%",
                        marginTop: "5px",
                        borderCollapse: "collapse",
                        tableLayout: "fixed",
                    }}
                >
                    <tbody>
                        <tr>
                            <td style={{ ...cellStyle, width: "34%" }}>
                                1. OFFICE/DEPARTMENT
                                <br />
                                {line(officeDepartment, "180px")}
                            </td>
                            <td colSpan={2} style={{ ...cellStyle, width: "66%" }}>
                                2. NAME
                                <span style={{ marginLeft: "85px" }}>
                                    (Last)
                                </span>
                                <span style={{ marginLeft: "95px" }}>
                                    (First)
                                </span>
                                <span style={{ marginLeft: "95px" }}>
                                    (Middle)
                                </span>
                                <br />
                                {line(lastName, "145px")} {line(firstName, "145px")}{" "}
                                {line(middleName, "125px")}
                            </td>
                        </tr>
                        <tr>
                            <td style={cellStyle}>
                                3. DATE OF FILING {line(dateOfFiling, "120px")}
                            </td>
                            <td style={cellStyle}>
                                4. POSITION {line(position, "185px")}
                            </td>
                            <td style={cellStyle}>
                                5. SALARY {line(salary, "105px")}
                            </td>
                        </tr>
                        <tr>
                            <td colSpan={3} style={headerCellStyle}>
                                6. DETAILS OF APPLICATION
                            </td>
                        </tr>
                        <tr>
                            <td colSpan={2} style={{ ...cellStyle, width: "50%" }}>
                                <b>6.A TYPE OF LEAVE TO BE AVAILED OF</b>
                                <div
                                    style={{
                                        marginTop: "8px",
                                        lineHeight: layout.sectionLineHeight,
                                    }}
                                >
                                    {leaveTypes.map((leaveType) => (
                                        <div key={leaveType.label}>
                                            {box(typeOfLeave === leaveType.label)}
                                            <span>{leaveType.label}</span>{" "}
                                            <span style={{ fontSize: "6.7px" }}>
                                                {leaveType.detail}
                                            </span>
                                        </div>
                                    ))}
                                    <div style={{ marginTop: "18px" }}>
                                        Others: {line(typeOfLeaveOther, "210px")}
                                    </div>
                                </div>
                            </td>
                            <td style={cellStyle}>
                                <b>6.B DETAILS OF LEAVE</b>
                                <div
                                    style={{
                                        marginTop: "8px",
                                        lineHeight:
                                            layout.sectionLineHeight + 0.05,
                                    }}
                                >
                                    <i>
                                        In case of Vacation/Special Privilege
                                        Leave:
                                    </i>
                                    <div>
                                        {box(leaveLocation === "within_philippines")}
                                        Within the Philippines{" "}
                                        {line(
                                            leaveLocation ===
                                                "within_philippines"
                                                ? leaveLocationDetails
                                                : "",
                                            "110px",
                                        )}
                                    </div>
                                    <div>
                                        {box(leaveLocation === "abroad")}
                                        Abroad (Specify){" "}
                                        {line(
                                            leaveLocation === "abroad"
                                                ? leaveLocationDetails
                                                : "",
                                            "132px",
                                        )}
                                    </div>

                                    <div style={{ marginTop: "7px" }}>
                                        <i>In case of Sick Leave:</i>
                                    </div>
                                    <div>
                                        {box(sickLeaveLocation === "in_hospital")}
                                        In Hospital (Specify Illness){" "}
                                        {line(
                                            sickLeaveLocation === "in_hospital"
                                                ? illness
                                                : "",
                                            "92px",
                                        )}
                                    </div>
                                    <div>
                                        {box(sickLeaveLocation === "out_patient")}
                                        Out Patient (Specify Illness){" "}
                                        {line(
                                            sickLeaveLocation === "out_patient"
                                                ? illness
                                                : "",
                                            "92px",
                                        )}
                                    </div>

                                    <div style={{ marginTop: "7px" }}>
                                        <i>
                                            In case of Special Leave Benefits
                                            for Women:
                                        </i>
                                    </div>
                                    <div>
                                        (Specify Illness){" "}
                                        {line(womenIllness, "145px")}
                                    </div>

                                    <div style={{ marginTop: "7px" }}>
                                        <i>In case of Study Leave:</i>
                                    </div>
                                    <div>
                                        {box(
                                            studyLeavePurpose ===
                                                "masters_degree",
                                        )}
                                        Completion of Master's Degree
                                    </div>
                                    <div>
                                        {box(
                                            studyLeavePurpose ===
                                                "bar_board_review",
                                        )}
                                        BAR/Board Examination Review
                                    </div>

                                    <div style={{ marginTop: "5px" }}>
                                        <i>Other purpose:</i>
                                    </div>
                                    <div>
                                        {box(otherPurpose === "monetization")}
                                        Monetization of Leave Credits
                                    </div>
                                    <div>
                                        {box(otherPurpose === "terminal_leave")}
                                        Terminal Leave
                                    </div>
                                </div>
                            </td>
                        </tr>
                        <tr>
                            <td colSpan={2} style={cellStyle}>
                                <b>6.C NUMBER OF WORKING DAYS APPLIED FOR</b>
                                <br />
                                {line(workingDays, "220px")}
                                <br />
                                <br />
                                <b>INCLUSIVE DATES</b>
                                <br />
                                {line(inclusiveDates, "260px")}
                            </td>
                            <td style={cellStyle}>
                                <b>6.D COMMUTATION</b>
                                <div style={{ marginTop: "10px" }}>
                                    {box(commutation === "not_requested")}
                                    Not Requested
                                </div>
                                <div>{box(commutation === "requested")}Requested</div>
                                <div
                                    style={{
                                        marginTop: "26px",
                                        textAlign: "center",
                                    }}
                                >
                                    {line("", "210px")}
                                    <br />
                                    (Signature of Applicant)
                                </div>
                            </td>
                        </tr>
                        <tr>
                            <td colSpan={3} style={headerCellStyle}>
                                7. DETAILS OF ACTION ON APPLICATION
                            </td>
                        </tr>
                        <tr>
                            <td colSpan={2} style={cellStyle}>
                                <b>7.A CERTIFICATION OF LEAVE CREDITS</b>
                                <div style={{ textAlign: "center", marginTop: "8px" }}>
                                    As of {line("", "150px")}
                                </div>
                                <table
                                    style={{
                                        width: "78%",
                                        margin: "8px auto 18px",
                                        borderCollapse: "collapse",
                                        tableLayout: "fixed",
                                    }}
                                >
                                    <tbody>
                                        <tr>
                                            <td style={cellStyle} />
                                            <td style={cellStyle}>
                                                Vacation Leave
                                            </td>
                                            <td style={cellStyle}>Sick Leave</td>
                                        </tr>
                                        <tr>
                                            <td style={cellStyle}>
                                                <i>Total Earned</i>
                                            </td>
                                            <td style={cellStyle} />
                                            <td style={cellStyle} />
                                        </tr>
                                        <tr>
                                            <td style={cellStyle}>
                                                <i>Less this application</i>
                                            </td>
                                            <td style={cellStyle} />
                                            <td style={cellStyle} />
                                        </tr>
                                        <tr>
                                            <td style={cellStyle}>
                                                <i>Balance</i>
                                            </td>
                                            <td style={cellStyle} />
                                            <td style={cellStyle} />
                                        </tr>
                                    </tbody>
                                </table>
                                {line("", "330px")}
                            </td>
                            <td style={cellStyle}>
                                <b>7.B RECOMMENDATION</b>
                                <div style={{ marginTop: "12px" }}>
                                    {box(false)}For approval
                                </div>
                                <div>
                                    {box(false)}For disapproval due to{" "}
                                    {line("", "115px")}
                                </div>
                                <div style={{ marginTop: "48px", textAlign: "center" }}>
                                    <b>
                                        <u>{recommendingOfficerName}</u>
                                    </b>
                                    <br />
                                    {recommendingOfficerTitle}
                                </div>
                            </td>
                        </tr>
                        <tr>
                            <td colSpan={2} style={{ ...cellStyle, height: "90px" }}>
                                <b>7.C APPROVED FOR</b>
                                <div style={{ marginTop: "6px", marginLeft: "18px" }}>
                                    {line("", "70px")} days with pay
                                    <br />
                                    {line("", "70px")} days without pay
                                    <br />
                                    {line("", "70px")} others (Specify)
                                </div>
                            </td>
                            <td style={{ ...cellStyle, height: "90px" }}>
                                <b>7.D DISAPPROVED DUE TO:</b>
                                <br />
                                <div style={{ marginTop: "8px", lineHeight: 1.8 }}>
                                    {line("", "92%")}
                                    <br />
                                    {line("", "92%")}
                                    <br />
                                    {line("", "92%")}
                                </div>
                            </td>
                        </tr>
                        <tr>
                            <td
                                colSpan={3}
                                style={{
                                    ...cellStyle,
                                    height: "105px",
                                    textAlign: "center",
                                    verticalAlign: "bottom",
                                    paddingBottom: "12px",
                                }}
                            >
                                <b>
                                    <u>{approvingOfficerName}</u>
                                </b>
                                <br />
                                {approvingOfficerTitle}
                            </td>
                        </tr>
                    </tbody>
                </table>
            </div>
        );
    },
);

export default ApplicationLeaveReport;

