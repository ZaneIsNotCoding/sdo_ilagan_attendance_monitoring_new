import React from "react";

const TravelOrderReport = React.forwardRef(
    (
        {
            name = "",
            position = "",
            station = "",
            shuttle = "",
            host = "",
            dates = "",
            destination = "",
            fund = "",
        },
        ref,
    ) => {
        return (
            <div
                ref={ref}
                style={{
                    width: "794px",
                    minHeight: "1123px", // keep for print, remove if UI only
                    backgroundColor: "#fff",
                    color: "#000",
                    fontFamily: '"Times New Roman", serif',
                    fontSize: "12px",
                    padding: "20px 24px",
                    boxSizing: "border-box",
                    margin: "0 auto",
                    display: "flex",
                    flexDirection: "column",
                }}
            >
                {/* MAIN CONTENT */}
                <div style={{ flex: 1 }}>
                    {/* HEADER */}
                    <div
                        style={{
                            textAlign: "center",
                            lineHeight: 1.2,
                            marginBottom: "8px",
                        }}
                    >
                        <img
                            src="/img/logo.png"
                            alt="Logo"
                            style={{
                                width: "65px",
                                display: "block",
                                margin: "0 auto 4px auto",
                            }}
                        />

                        <div
                            style={{
                                fontSize: "16px",
                                fontFamily: "OldEnglish",
                            }}
                        >
                            Republic of the Philippines
                        </div>
                        <div
                            style={{
                                fontSize: "24px",
                                fontWeight: "bold",
                                fontFamily: "OldEnglish",
                            }}
                        >
                            Department of Education
                        </div>
                        <div style={{ fontSize: "13px", fontWeight: "bold" }}>
                            REGION II – CAGAYAN VALLEY
                        </div>
                        <div style={{ fontSize: "13px", fontWeight: "bold" }}>
                            SCHOOLS DIVISION OF THE CITY OF ILAGAN
                        </div>
                    </div>

                    <div
                        style={{
                            borderTop: "1px solid black",
                            margin: "8px 0",
                        }}
                    />

                    {/* TITLE */}
                    <div
                        style={{
                            textAlign: "center",
                            fontWeight: "bold",
                            fontSize: "16px",
                            textDecoration: "underline",
                            marginBottom: "10px",
                        }}
                    >
                        TRAVEL AUTHORITY FOR OFFICIAL LOCAL TRAVEL
                    </div>

                    {/* CONTROL NUMBER
                    <div style={{ textAlign: "right", marginBottom: "6px" }}>
                        <span
                            style={{
                                border: "1px solid black",
                                padding: "2px 10px",
                                fontSize: "11px",
                            }}
                        >
                            No. ______ 2025
                        </span>
                    </div> */}

                    {/* TABLE */}
                    <table
                        style={{
                            width: "100%",
                            borderCollapse: "collapse",
                            border: "1px solid black",
                            tableLayout: "fixed",
                        }}
                    >
                        <tbody>
                            {[
                                ["NAME", name],
                                ["Position/Designation", position],
                                ["Permanent Station", station],
                                ["TO SHUTTLE SDS", shuttle],
                                ["Host of Activity", host],
                                ["Inclusive Dates", dates],
                                ["Destination", destination],
                                ["Fund Source", fund],
                            ].map(([label, value], i) => (
                                <tr key={i}>
                                    <td
                                        style={{
                                            width: "180px",
                                            border: "1px solid black",
                                            padding: "6px 8px",
                                            fontWeight: "bold",
                                        }}
                                    >
                                        {label}
                                    </td>
                                    <td
                                        style={{
                                            border: "1px solid black",
                                            padding: "6px 8px",
                                        }}
                                    >
                                        {value}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>

                    {/* CERTIFICATION */}
                    <div style={{ marginTop: "10px", fontSize: "11px" }}>
                        <i>
                            I hereby attest that the information in this form
                            and in the supporting documents attached hereto are
                            true and correct.
                        </i>
                    </div>

                    {/* SIGNATURES */}
                    <table style={{ width: "100%", marginTop: "15px" }}>
                        <tbody>
                            <tr>
                                <td>
                                    <b>{name}</b>
                                    <br />
                                    Name and Signature of Requesting Employee
                                </td>
                                <td style={{ textAlign: "center" }}>
                                    ___________________
                                    <br />
                                    Date
                                </td>
                            </tr>

                            <tr>
                                <td style={{ paddingTop: "20px" }}>
                                    <b>CHERRY R. RAMIRO, PhD, CESO VI</b>
                                    <br />
                                    Assistant Schools Division Superintendent
                                </td>
                                <td style={{ textAlign: "center" }}>
                                    ___________________
                                    <br />
                                    Date
                                </td>
                            </tr>
                        </tbody>
                    </table>

                    {/* APPROVED */}
                    <div
                        style={{
                            marginTop: "15px",
                            fontWeight: "bold",
                        }}
                    >
                        APPROVED:
                    </div>

                    <table style={{ width: "100%", marginTop: "8px" }}>
                        <tbody>
                            <tr>
                                <td>
                                    <b>EDUARDO C. ESCORPISO JR., EdD, CESO V</b>
                                    <br />
                                    Schools Division Superintendent
                                </td>
                                <td style={{ textAlign: "center" }}>
                                    ___________________
                                    <br />
                                    Date
                                </td>
                            </tr>
                        </tbody>
                    </table>
                </div>

                {/* FOOTER (SAME AS LOCATOR SLIP) */}
                <div
                    style={{
                        marginTop: "14px",
                        borderTop: "1px solid black",
                        paddingTop: "8px",
                        fontSize: "11px",
                        fontWeight: "bold",
                    }}
                >
                    <table style={{ width: "100%" }}>
                        <tbody>
                            <tr>
                                <td style={{ width: "200px" }}>
                                    <div
                                        style={{
                                            display: "flex",
                                            gap: "6px",
                                        }}
                                    >
                                        <img
                                            src="/img/footer_logos.png"
                                            style={{ height: "46px" }}
                                        />
                                    </div>
                                </td>

                                <td
                                    style={{
                                        textAlign: "right",
                                        lineHeight: "1.2",
                                    }}
                                >
                                    Civic Center, Alibagu, City of Ilagan,
                                    Isabela
                                    <br />
                                    Telephone Nos. (078) 624-0077
                                </td>
                            </tr>
                        </tbody>
                    </table>

                    {/* SOCIAL */}
                    {/* SOCIAL */}
                    <div
                        style={{
                            marginTop: "2px",
                            display: "flex",
                            justifyContent: "flex-end",
                            gap: "16px", // spacing between items
                            fontSize: "10px",
                            fontWeight: "bold",
                            alignItems: "center",
                            flexWrap: "wrap",
                        }}
                    >
                        {/* FACEBOOK */}
                        <div
                            style={{
                                display: "flex",
                                alignItems: "center",
                                gap: "4px",
                            }}
                        >
                            <img
                                src="/img/fb_logo.png"
                                style={{
                                    height: "12px",
                                    width: "12px",
                                    objectFit: "contain",
                                }}
                                alt=""
                            />
                            <span>www.facebook.com/sdoilagan</span>
                        </div>

                        {/* EMAIL */}
                        <div
                            style={{
                                display: "flex",
                                alignItems: "center",
                                gap: "4px",
                            }}
                        >
                            <img
                                src="/img/gmail.png"
                                style={{
                                    height: "12px",
                                    width: "12px",
                                    objectFit: "contain",
                                }}
                                alt=""
                            />
                            <span>ilagan@deped.gov.ph</span>
                        </div>

                        {/* WEBSITE */}
                        <div
                            style={{
                                display: "flex",
                                alignItems: "center",
                                gap: "4px",
                            }}
                        >
                            <img
                                src="/img/internet.png"
                                style={{
                                    height: "12px",
                                    width: "12px",
                                    objectFit: "contain",
                                }}
                                alt=""
                            />
                            <span>www.sdocityofilagan.gov.ph</span>
                        </div>
                    </div>
                </div>
            </div>
        );
    },
);

export default TravelOrderReport;

