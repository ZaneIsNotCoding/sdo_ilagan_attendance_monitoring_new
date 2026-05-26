"use client";

import React, { useRef, useState } from "react";
import html2pdf from "html2pdf.js";
import dayjs from "dayjs";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription,
    DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/Components/ui/button";
import { Printer } from "lucide-react";
import LocatorSlipReport from "@/Pages/DocumentsFormats/LocatorSlipReport";
import { getRecordEmployeeName } from "@/lib/utils";

const LocatorSlipPrintDialog = ({ open, onClose, slip }) => {
    const previewRef = useRef(null);
    const pdfRef = useRef(null);
    const [isGenerating, setIsGenerating] = useState(false);

    const handleDownloadPDF = async () => {
        if (!pdfRef.current || !slip) return;

        setIsGenerating(true);

        await new Promise((resolve) => setTimeout(resolve, 150));

        await html2pdf()
            .set({
                margin: 0,
                filename: `Locator_Slip_${(
                    getRecordEmployeeName(slip) || "Employee"
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
                    format: [794, 1123],
                    orientation: "portrait",
                },
            })
            .from(pdfRef.current)
            .save();

        setIsGenerating(false);
        onClose();
    };

    if (!open || !slip) return null;

    const toCaps = (value) => String(value || "").toUpperCase();

    const reportProps = {
        name: toCaps(getRecordEmployeeName(slip)),
        position: toCaps(slip.position || slip.employee?.position),
        station: toCaps(
            slip.permanent_station ||
                slip.employee?.station?.name ||
                slip.employee?.permanent_station,
        ),
        purpose: toCaps(slip.purpose_of_travel),
        check_type:
            slip.travel_type === "official_business"
                ? "Official Business"
                : slip.travel_type === "official_time"
                  ? "Official Time"
                  : "",
        date_time: toCaps(
            slip.travel_datetime
                ? dayjs(slip.travel_datetime).format("MMMM D, YYYY hh:mm A")
                : "",
        ),
        destination: toCaps(slip.destination),
    };

    return (
        <Dialog open={open} onOpenChange={onClose}>
            <DialogContent className="w-[95vw] max-w-4xl max-h-[90vh] overflow-hidden p-4">
                <DialogHeader className="pb-2">
                    <DialogTitle>Locator Slip Preview</DialogTitle>
                    <DialogDescription>
                        Preview and download the locator slip before printing.
                    </DialogDescription>
                </DialogHeader>

                <div className="max-h-[65vh] overflow-auto rounded-md border bg-gray-100 p-3">
                    <div className="flex justify-center">
                        <div className="origin-top scale-[0.72] sm:scale-[0.82]">
                            <div className="w-[794px] bg-white shadow">
                                <LocatorSlipReport
                                    ref={previewRef}
                                    {...reportProps}
                                />
                            </div>
                        </div>
                    </div>
                </div>

                <DialogFooter className="mt-4 flex justify-end gap-2">
                    <Button
                        variant="outline"
                        onClick={onClose}
                        disabled={isGenerating}
                    >
                        Cancel
                    </Button>

                    <Button
                        variant="blue"
                        onClick={handleDownloadPDF}
                        disabled={isGenerating}
                    >
                        <Printer className="mr-2 h-4 w-4" />
                        {isGenerating ? "Generating..." : "Download PDF"}
                    </Button>
                </DialogFooter>

                <div className="fixed -left-[10000px] top-0 z-[-1]">
                    <div className="w-[794px] bg-white">
                        <LocatorSlipReport ref={pdfRef} {...reportProps} />
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    );
};

export default LocatorSlipPrintDialog;

