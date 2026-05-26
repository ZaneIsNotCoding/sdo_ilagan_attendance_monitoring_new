import React, { useRef } from "react";
import { Printer } from "lucide-react";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/Components/ui/button";

import DepartmentPicker from "./DepartmentPrint/DepartmentPicker";
import HiddenDtrReports from "./DepartmentPrint/HiddenDtrReports";
import PrintableEmployeeList from "./DepartmentPrint/PrintableEmployeeList";
import SignatoriesSummary from "./DepartmentPrint/SignatoriesSummary";
import SignatoryPopover from "./DepartmentPrint/SignatoryPopover";
import useDepartmentPrintData from "./DepartmentPrint/hooks/useDepartmentPrintData";
import useDepartmentSignatories from "./DepartmentPrint/hooks/useDepartmentSignatories";
import useDtrPdfExport from "./DepartmentPrint/hooks/useDtrPdfExport";
import { formatMonth } from "./DepartmentPrint/utils";

const DepartmentPrintDialog = ({
    open,
    onClose,
    initialDepartmentName = "",
    selectedMonth,
    selectedYear,
}) => {
    const dialogContentRef = useRef(null);
    const pdfRefs = useRef({});

    const {
        departmentSearch,
        departmentSignatories,
        departments,
        departmentsLoading,
        employeeData,
        employeePage,
        employeePageNumbers,
        employeePagination,
        employeesLoading,
        handleDepartmentSearchChange,
        handleDepartmentSelect,
        handleEmployeePageChange,
        printEmployees,
        selectedDepartment,
        totalEmployeePages,
    } = useDepartmentPrintData({
        initialDepartmentName,
        open,
        selectedMonth,
        selectedYear,
    });

    const {
        chooseEmployeeSignatory,
        closeSignatoryPopover,
        currentDepartmentSignatories,
        divisionHeadSignatory,
        employeeSignatoryOptions,
        isLoadingEmployeeData,
        officeHeadSignatory,
        openSignatoryPopover,
        selectedEmployeeSignatory,
        selectedEmployeeSignatoryType,
        signatoryEmployee,
        signatoryPopoverPosition,
    } = useDepartmentSignatories({
        departmentSignatories,
        dialogContentRef,
        employeeData,
        open,
        printEmployees,
        selectedDepartment,
    });

    const { handleDownloadPDF, isGenerating } = useDtrPdfExport({
        onClose,
        pdfRefs,
        selectedMonth,
        selectedYear,
    });

    const isLoadingSignatories =
        !currentDepartmentSignatories &&
        (departmentsLoading || employeesLoading || isLoadingEmployeeData);

    return (
        <Dialog open={open} onOpenChange={(nextOpen) => !nextOpen && onClose()}>
            <DialogContent className="max-w-5xl overflow-hidden rounded-2xl p-0">
                <div
                    ref={dialogContentRef}
                    className="relative max-h-[92vh] overflow-y-auto"
                >
                    <div className="bg-gradient-to-r from-blue-600 to-blue-500 p-5 text-white">
                        <DialogHeader>
                            <DialogTitle className="flex items-center gap-2 text-white">
                                <Printer className="h-5 w-5" />
                                Print by Department
                            </DialogTitle>
                            <DialogDescription className="text-blue-100">
                                Printing {formatMonth(selectedMonth)}{" "}
                                {selectedYear}
                            </DialogDescription>
                        </DialogHeader>
                    </div>

                    <div className="grid gap-4 px-5 pb-5 pt-4 lg:grid-cols-[0.85fr_1.15fr]">
                        <div className="space-y-3">
                            <DepartmentPicker
                                departmentSearch={departmentSearch}
                                departments={departments}
                                departmentsLoading={departmentsLoading}
                                selectedDepartment={selectedDepartment}
                                onSearchChange={handleDepartmentSearchChange}
                                onSelectDepartment={handleDepartmentSelect}
                            />
                        </div>

                        <div className="space-y-3">
                            <SignatoriesSummary
                                isLoading={isLoadingSignatories}
                                officeHeadSignatory={officeHeadSignatory}
                                divisionHeadSignatory={divisionHeadSignatory}
                            />

                            <PrintableEmployeeList
                                departmentsLoading={departmentsLoading}
                                employeesLoading={employeesLoading}
                                employeePage={employeePage}
                                employeePageNumbers={employeePageNumbers}
                                employeePagination={employeePagination}
                                employees={printEmployees}
                                selectedEmployeeSignatory={
                                    selectedEmployeeSignatory
                                }
                                selectedMonth={selectedMonth}
                                selectedYear={selectedYear}
                                totalEmployeePages={totalEmployeePages}
                                onChangePage={handleEmployeePageChange}
                                onOpenSignatoryPopover={openSignatoryPopover}
                            />
                        </div>

                        <HiddenDtrReports
                            employeeData={employeeData}
                            pdfRefs={pdfRefs}
                            printEmployees={printEmployees}
                            selectedEmployeeSignatory={selectedEmployeeSignatory}
                            selectedMonth={selectedMonth}
                            selectedYear={selectedYear}
                        />

                        <SignatoryPopover
                            employee={signatoryEmployee}
                            employeeData={employeeData}
                            options={employeeSignatoryOptions}
                            position={signatoryPopoverPosition}
                            selectedEmployeeSignatory={selectedEmployeeSignatory}
                            selectedEmployeeSignatoryType={
                                selectedEmployeeSignatoryType
                            }
                            onChoose={chooseEmployeeSignatory}
                            onClose={closeSignatoryPopover}
                        />

                        <DialogFooter className="gap-2 lg:col-span-2">
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
                                onClick={() => handleDownloadPDF(printEmployees)}
                                disabled={
                                    !printEmployees.length ||
                                    isGenerating ||
                                    isLoadingEmployeeData
                                }
                            >
                                <Printer className="mr-1 h-4 w-4" />
                                {isGenerating
                                    ? "Generating..."
                                    : isLoadingEmployeeData
                                      ? "Loading..."
                                      : "Print"}
                            </Button>
                        </DialogFooter>
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    );
};

export default DepartmentPrintDialog;

