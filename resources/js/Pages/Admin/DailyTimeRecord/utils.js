export const formatSearchDisplay = (value) =>
    String(value || "")
        .replace(/^\d+\s+/, "")
        .trim();

export const extractTimeRecordEmployees = (timeRecord) =>
    Array.isArray(timeRecord?.data)
        ? timeRecord.data
        : Array.isArray(timeRecord)
          ? timeRecord
          : [];

export const resolveCurrentDateParts = ({ month, year }) => {
    const currentDate = new Date();

    return {
        currentMonth: month || currentDate.getMonth() + 1,
        currentYear: year || currentDate.getFullYear(),
    };
};

