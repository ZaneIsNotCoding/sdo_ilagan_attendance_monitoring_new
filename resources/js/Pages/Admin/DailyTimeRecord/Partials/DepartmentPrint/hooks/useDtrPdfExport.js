import { useState } from "react";
import html2pdf from "html2pdf.js";

const useDtrPdfExport = ({ onClose, pdfRefs, selectedMonth, selectedYear }) => {
    const [isGenerating, setIsGenerating] = useState(false);

    const handleDownloadPDF = async (employees) => {
        setIsGenerating(true);

        for (const employee of employees) {
            const element = pdfRefs.current[employee.id];
            if (!element) continue;

            await new Promise((resolve) => setTimeout(resolve, 50));

            await html2pdf()
                .set({
                    margin: 0.5,
                    filename: `DTR_${(employee.full_name || "employee").replace(
                        /\s+/g,
                        "_",
                    )}_${selectedYear}-${String(selectedMonth).padStart(
                        2,
                        "0",
                    )}.pdf`,
                    image: { type: "jpeg", quality: 0.98 },
                    html2canvas: { scale: 2 },
                    jsPDF: {
                        unit: "in",
                        format: "letter",
                        orientation: "portrait",
                    },
                })
                .from(element)
                .save();
        }

        setIsGenerating(false);
        onClose();
    };

    return {
        handleDownloadPDF,
        isGenerating,
    };
};

export default useDtrPdfExport;

