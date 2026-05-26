import { useEffect, useRef, useState } from "react";
import { toast } from "sonner";
import useEmployeeSearchSuggestions from "./useEmployeeSearchSuggestions";
import { clampAvailableFingers } from "../utils";

const useEmployeeFingerprintPanelUi = ({
    availableFingers,
    employees,
    scanFeedbackKey,
    scanMessage,
    scanStatus,
    scanning,
    selectedEmployee,
    selectedEmployeeRecordProp,
    startTestFingerprint,
    testMessage,
    testOpen,
    testStatus,
}) => {
    const [searchValue, setSearchValue] = useState("");
    const testStartedRef = useRef(false);
    const lastScanToastRef = useRef("");
    const lastTestToastRef = useRef("");
    const {
        searchBoxRef,
        setShowSuggestions,
        showSuggestions,
        suggestionMatches,
        suggestionsLoading,
    } = useEmployeeSearchSuggestions({
        params: { available_for_fingerprint: 1 },
        query: searchValue,
    });
    const selectedEmployeeRecord =
        (selectedEmployeeRecordProp &&
        clampAvailableFingers(selectedEmployeeRecordProp.available_fingers) > 0
            ? selectedEmployeeRecordProp
            : null) ||
        employees.find(
            (emp) =>
                String(emp.id) === String(selectedEmployee) &&
                clampAvailableFingers(emp.available_fingers) > 0,
        ) ||
        null;
    const selectedOfficeName =
        selectedEmployeeRecord?.office?.name || "Department";
    const selectedAvailableFingers = clampAvailableFingers(
        selectedEmployeeRecord?.available_fingers ??
            availableFingers(selectedEmployee),
    );
    const fingerprintStatusLabel = selectedEmployeeRecord
        ? `Available fingerprints: ${selectedAvailableFingers}/3`
        : "Choose an employee to begin";
    const panelMessage =
        scanStatus === "error"
            ? scanMessage
            : scanStatus === "success"
              ? scanMessage
              : scanning
                ? scanMessage
                : fingerprintStatusLabel;

    useEffect(() => {
        if (!testOpen) {
            testStartedRef.current = false;
            return;
        }

        if (testStartedRef.current) {
            return;
        }

        testStartedRef.current = true;
        startTestFingerprint();
    }, [testOpen, startTestFingerprint]);

    useEffect(() => {
        const cleanMessage = String(scanMessage || "").trim();

        if (
            !selectedEmployeeRecord ||
            !cleanMessage ||
            cleanMessage === "Place your fingerprint"
        ) {
            return;
        }

        const toastKey = `${scanFeedbackKey}:${scanStatus}:${cleanMessage}`;
        if (lastScanToastRef.current === toastKey) {
            return;
        }

        lastScanToastRef.current = toastKey;

        if (scanStatus === "success") {
            toast.success(cleanMessage);
        } else if (scanStatus === "error") {
            toast.error(cleanMessage);
        } else if (scanning) {
            toast(cleanMessage);
        }
    }, [
        scanStatus,
        scanMessage,
        scanFeedbackKey,
        scanning,
        selectedEmployeeRecord,
    ]);

    useEffect(() => {
        const cleanMessage = String(testMessage || "").trim();

        if (
            !testOpen ||
            !cleanMessage ||
            cleanMessage === "Waiting for scan..." ||
            cleanMessage === "Place your finger on the scanner..."
        ) {
            return;
        }

        const toastKey = `${testStatus}:${cleanMessage}`;
        if (lastTestToastRef.current === toastKey) {
            return;
        }

        lastTestToastRef.current = toastKey;

        if (testStatus === "success") {
            toast.success(cleanMessage);
        } else if (testStatus === "error") {
            toast.error(cleanMessage);
        } else {
            toast(cleanMessage);
        }
    }, [testOpen, testStatus, testMessage]);

    return {
        panelMessage,
        searchBoxRef,
        searchValue,
        selectedAvailableFingers,
        selectedEmployeeRecord,
        selectedOfficeName,
        setSearchValue,
        setShowSuggestions,
        showSuggestions,
        suggestionMatches,
        suggestionsLoading,
    };
};

export default useEmployeeFingerprintPanelUi;
