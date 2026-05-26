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
import { Printer } from "lucide-react";
import TravelAuthorityReport from "@/Pages/DocumentsFormats/TravelOrderReport";

const TravelOrderPrintDialog = ({ open, onClose, order }) => {
    const previewRef = useRef(null);
    const pdfRef = useRef(null);
    const [isGenerating, setIsGenerating] = useState(false);

    const handleDownloadPDF = async () => {
        if (!pdfRef.current || !order) return;

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
                    format: [794, 1123],
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
    };

    return (
        <Dialog open={open} onOpenChange={onClose}>
            <DialogContent className="w-[95vw] max-w-4xl max-h-[90vh] overflow-hidden p-4">
                <DialogHeader className="pb-2">
                    <DialogTitle>Travel Authority Preview</DialogTitle>
                </DialogHeader>

                {/* Preview */}
                <div className="max-h-[65vh] overflow-auto rounded-md border bg-gray-100 p-3">
                    <div className="flex justify-center">
                        <div className="origin-top scale-[0.72] sm:scale-[0.82]">
                            <div className="w-[794px] bg-white shadow">
                                <TravelAuthorityReport
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

                {/* Hidden PDF */}
                <div className="fixed -left-[10000px] top-0 z-[-1]">
                    <div className="w-[794px] bg-white">
                        <TravelAuthorityReport ref={pdfRef} {...reportProps} />
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    );
};

export default TravelOrderPrintDialog;

