"use client";

import React, { useRef, useState } from "react";
import html2pdf from "html2pdf.js";
import dayjs from "dayjs";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/Components/ui/button";
import { Briefcase, Printer, User } from "lucide-react";
import TravelAuthorityReport from "@/Pages/DocumentsFormats/TravelOrderReport";
import FloatingInput from "@/components/floating-input";

const paperSizeOptions = {
    legal: { label: "Legal", width: 816, height: 1344, previewScale: 0.66 },
    a4: { label: "A4", width: 794, height: 1123, previewScale: 0.72 },
};

const TravelOrderPrintDialog = ({ open, onClose, order }) => {
    const previewRef = useRef(null);
    const pdfRef = useRef(null);
    const [isGenerating, setIsGenerating] = useState(false);
    const [paperSize, setPaperSize] = useState("legal");
    const [signatories, setSignatories] = useState({
        recommendingOfficerName: "CHERRY R. RAMIRO, PhD, CESO VI",
        recommendingOfficerTitle: "Assistant Schools Division Superintendent",
        approvingOfficerName: "EDUARDO C. ESCORPISO JR., EdD, CESO V",
        approvingOfficerTitle: "Schools Division Superintendent",
    });

    const updateSignatory = (field, value) => {
        setSignatories((current) => ({
            ...current,
            [field]: value,
        }));
    };

    const handleDownloadPDF = async () => {
        if (!pdfRef.current || !order) return;

        const selectedPaper = paperSizeOptions[paperSize];
        setIsGenerating(true);

        await new Promise((resolve) => setTimeout(resolve, 150));

        await html2pdf()
            .set({
                margin: 0,
                filename: `Travel_Authority_${(
                    order.employee?.full_name ||
                    order.employee?.name ||
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

    if (!open || !order) return null;

    const toCaps = (value) => String(value || "").toUpperCase();

    const reportProps = {
        paperSize,
        name: toCaps(
            order.employee_name ||
                order.employee?.full_name ||
                order.employee?.name,
        ),
        position: toCaps(order.position || order.employee?.position),
        station: toCaps(
            order.permanent_station ||
                order.employee?.station?.name ||
                order.employee?.permanent_station,
        ),
        shuttle: toCaps(order.purpose_of_travel), // adjust if you add a field
        host: toCaps(order.host_of_activity),
        dates: toCaps(
            order.inclusive_dates
                ? dayjs(order.inclusive_dates).format("MMMM D, YYYY")
                : "",
        ),
        destination: toCaps(order.destination),
        fund: toCaps(order.fund_source),
        ...signatories,
    };
    const selectedPaper = paperSizeOptions[paperSize];

    return (
        <Dialog open={open} onOpenChange={onClose}>
            <DialogContent className="flex max-h-[90vh] w-[95vw] max-w-4xl flex-col overflow-hidden p-4">
                <DialogHeader className="shrink-0 pb-2">
                    <DialogTitle>Travel Authority Preview</DialogTitle>
                </DialogHeader>

                <div className="grid shrink-0 gap-3 rounded-md border bg-white p-3 md:grid-cols-2">
                    <label className="flex h-12 items-center gap-2 rounded-md border px-3 text-sm text-gray-700">
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
                        label="Recommending Officer Name"
                        icon={User}
                        name="recommending_officer_name"
                        value={signatories.recommendingOfficerName}
                        onChange={(event) =>
                            updateSignatory(
                                "recommendingOfficerName",
                                event.target.value,
                            )
                        }
                    />
                    <FloatingInput
                        label="Recommending Officer Position"
                        icon={Briefcase}
                        name="recommending_officer_title"
                        value={signatories.recommendingOfficerTitle}
                        onChange={(event) =>
                            updateSignatory(
                                "recommendingOfficerTitle",
                                event.target.value,
                            )
                        }
                    />
                    <FloatingInput
                        label="Approving Officer Name"
                        icon={User}
                        name="approving_officer_name"
                        value={signatories.approvingOfficerName}
                        onChange={(event) =>
                            updateSignatory(
                                "approvingOfficerName",
                                event.target.value,
                            )
                        }
                    />
                    <FloatingInput
                        label="Approving Officer Position"
                        icon={Briefcase}
                        name="approving_officer_title"
                        value={signatories.approvingOfficerTitle}
                        onChange={(event) =>
                            updateSignatory(
                                "approvingOfficerTitle",
                                event.target.value,
                            )
                        }
                    />
                </div>

                {/* Preview */}
                <div className="mt-3 min-h-0 flex-1 overflow-auto rounded-md border bg-gray-100 p-3">
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
                                <TravelAuthorityReport
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

                {/* Hidden PDF */}
                <div className="fixed -left-[10000px] top-0 z-[-1]">
                    <div
                        className="bg-white"
                        style={{ width: `${selectedPaper.width}px` }}
                    >
                        <TravelAuthorityReport ref={pdfRef} {...reportProps} />
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    );
};

export default TravelOrderPrintDialog;
