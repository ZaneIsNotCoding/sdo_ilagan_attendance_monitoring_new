"use client";

import React, { useRef, useState } from "react";
import html2pdf from "html2pdf.js";
import dayjs from "dayjs";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/Components/ui/button";
import { Briefcase, FileText, Printer, User } from "lucide-react";
import ApplicationLeaveReport from "@/Pages/DocumentsFormats/ApplicationLeaveReport";
import FloatingInput from "@/components/floating-input";

const paperSizeOptions = {
    legal: { label: "Legal", width: 816, height: 1344, previewScale: 0.66 },
    a4: { label: "A4", width: 794, height: 1123, previewScale: 0.72 },
};

const ApplicationLeavePrintDialog = ({ open, onClose, application }) => {
    const previewRef = useRef(null);
    const pdfRef = useRef(null);
    const [isGenerating, setIsGenerating] = useState(false);
    const [paperSize, setPaperSize] = useState("legal");
    const [signatories, setSignatories] = useState({
        recommendingOfficerName: "MARY ANN M. BELTRAN, LIB, PhD.",
        recommendingOfficerTitle: "Administrative Officer V",
        approvingOfficerName: "CHERYL R. RAMIRO, PhD, CESO VI",
        approvingOfficerTitle: "ASSISTANT SCHOOLS DIVISION SUPERINTENDENT",
    });

    const updateSignatory = (field, value) => {
        setSignatories((current) => ({
            ...current,
            [field]: value,
        }));
    };

    const handleDownloadPDF = async () => {
        if (!pdfRef.current || !application) return;

        const selectedPaper = paperSizeOptions[paperSize];
        setIsGenerating(true);
        await new Promise((resolve) => setTimeout(resolve, 150));

        await html2pdf()
            .set({
                margin: 0,
                filename: `Application_For_Leave_${(
                    application.employee_name ||
                    application.employee?.full_name ||
                    "Employee"
                ).replace(/\s+/g, "_")}.pdf`,
                image: { type: "jpeg", quality: 1 },
                html2canvas: {
                    scale: 2,
                    useCORS: true,
                    scrollX: 0,
                    scrollY: 0,
                },
                jsPDF: {
                    unit: "px",
                    format: [selectedPaper.width, selectedPaper.height],
                    orientation: "portrait",
                },
            })
            .from(pdfRef.current)
            .save();

        setIsGenerating(false);
        onClose();
    };

    if (!open || !application) return null;

    const fullName =
        application.employee_name ||
        application.employee?.full_name ||
        application.employee?.name ||
        "";

    const reportProps = {
        paperSize,
        officeDepartment: application.office_department || "",
        employeeName: fullName,
        dateOfFiling: application.date_of_filing
            ? dayjs(application.date_of_filing).format("MMMM D, YYYY")
            : "",
        position: application.position || application.employee?.position || "",
        salary: application.salary || "",
        typeOfLeave: application.type_of_leave || "",
        typeOfLeaveOther: application.type_of_leave_other || "",
        leaveLocation: application.leave_location || "",
        leaveLocationDetails: application.leave_location_details || "",
        sickLeaveLocation: application.sick_leave_location || "",
        illness: application.illness || "",
        womenIllness: application.women_illness || "",
        studyLeavePurpose: application.study_leave_purpose || "",
        otherPurpose: application.other_purpose || "",
        workingDays: application.working_days || "",
        inclusiveDates: application.inclusive_dates || "",
        commutation: application.commutation || "",
        ...signatories,
    };
    const selectedPaper = paperSizeOptions[paperSize];

    return (
        <Dialog open={open} onOpenChange={onClose}>
            <DialogContent className="flex max-h-[90vh] w-[95vw] max-w-4xl flex-col overflow-hidden p-4">
                <DialogHeader className="shrink-0 pb-2">
                    <DialogTitle>Application for Leave Preview</DialogTitle>
                    <DialogDescription>
                        Preview and download the leave application before
                        printing.
                    </DialogDescription>
                </DialogHeader>

                <div className="grid shrink-0 gap-3 rounded-md border bg-white p-3 md:grid-cols-2">
                    <label className="flex h-12 items-center gap-2 rounded-md border px-3 text-sm text-gray-700">
                        <FileText className="h-4 w-4 text-gray-500" />
                        <span className="shrink-0 font-medium">Paper</span>
                        <select
                            value={paperSize}
                            onChange={(event) => setPaperSize(event.target.value)}
                            className="h-9 flex-1 rounded-md border border-gray-300 bg-white px-2 text-sm outline-none focus:border-blue-500"
                        >
                            {Object.entries(paperSizeOptions).map(
                                ([value, option]) => (
                                    <option key={value} value={value}>
                                        {option.label}
                                    </option>
                                ),
                            )}
                        </select>
                    </label>
                    <FloatingInput
                        label="7.B Officer Name"
                        icon={User}
                        name="recommending_officer_name"
                        value={signatories.recommendingOfficerName}
                        onChange={(e) =>
                            updateSignatory(
                                "recommendingOfficerName",
                                e.target.value,
                            )
                        }
                    />
                    <FloatingInput
                        label="7.B Officer Position"
                        icon={Briefcase}
                        name="recommending_officer_title"
                        value={signatories.recommendingOfficerTitle}
                        onChange={(e) =>
                            updateSignatory(
                                "recommendingOfficerTitle",
                                e.target.value,
                            )
                        }
                    />
                    <FloatingInput
                        label="Approving Officer Name"
                        icon={User}
                        name="approving_officer_name"
                        value={signatories.approvingOfficerName}
                        onChange={(e) =>
                            updateSignatory(
                                "approvingOfficerName",
                                e.target.value,
                            )
                        }
                    />
                    <FloatingInput
                        label="Approving Officer Position"
                        icon={Briefcase}
                        name="approving_officer_title"
                        value={signatories.approvingOfficerTitle}
                        onChange={(e) =>
                            updateSignatory(
                                "approvingOfficerTitle",
                                e.target.value,
                            )
                        }
                    />
                </div>

                <div className="min-h-0 flex-1 overflow-auto rounded-md border bg-gray-100 p-3">
                    <div className="flex justify-center">
                        <div
                            className="origin-top"
                            style={{
                                transform: `scale(${selectedPaper.previewScale})`,
                                transformOrigin: "top center",
                            }}
                        >
                            <div
                                className="bg-white shadow"
                                style={{ width: `${selectedPaper.width}px` }}
                            >
                                <ApplicationLeaveReport
                                    ref={previewRef}
                                    {...reportProps}
                                />
                            </div>
                        </div>
                    </div>
                </div>

                <DialogFooter className="mt-4 shrink-0 border-t border-gray-200 bg-white pt-3 sm:justify-end">
                    <Button
                        type="button"
                        variant="outline"
                        onClick={onClose}
                        disabled={isGenerating}
                    >
                        Cancel
                    </Button>

                    <Button
                        type="button"
                        variant="blue"
                        onClick={handleDownloadPDF}
                        disabled={isGenerating}
                    >
                        <Printer className="mr-2 h-4 w-4" />
                        {isGenerating ? "Generating..." : "Download PDF"}
                    </Button>
                </DialogFooter>

                <div className="fixed -left-[10000px] top-0 z-[-1]">
                    <div
                        className="bg-white"
                        style={{ width: `${selectedPaper.width}px` }}
                    >
                        <ApplicationLeaveReport ref={pdfRef} {...reportProps} />
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    );
};

export default ApplicationLeavePrintDialog;
