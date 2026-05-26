export const defaultFingerprintServiceUrl = `http://${window.location.hostname}:5000`;

export const statusOptions = ["Active", "Inactive"];

export const formatSearchDisplay = (value) =>
    String(value || "")
        .replace(/^\d+\s+/, "")
        .trim();

export const formatFingerprintRegistrationParam = (employee) =>
    [employee?.id, employee?.full_name || employee?.label]
        .filter(Boolean)
        .join(" ")
        .trim();

export const findOfficeByName = (offices, value) =>
    offices.find((office) => office.name === value);

export const extractEmployeeRows = (employeesList) =>
    Array.isArray(employeesList?.data)
        ? employeesList.data
        : Array.isArray(employeesList)
          ? employeesList
          : [];

export const clampAvailableFingers = (value) => {
    const available = Number(value ?? 3);

    if (Number.isNaN(available)) {
        return 3;
    }

    return Math.min(Math.max(available, 0), 3);
};
