export const formatTime = (value) => {
    if (!value) return "-";

    return new Date(`2000-01-01T${value}`).toLocaleTimeString("en-US", {
        hour: "numeric",
        minute: "2-digit",
    });
};

export const timeInputValue = (value) => String(value || "").slice(0, 5);

export const clearWorkScheduleModalParams = (query) => {
    query.delete("modal");
    query.delete("work_type_id");
    query.delete("work_schedule_id");
};

export const openWorkScheduleModal = (router, modal, params = {}) => {
    const query = new URLSearchParams(window.location.search);

    query.delete("work_type_id");
    query.delete("work_schedule_id");
    query.set("modal", modal);

    Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined && value !== null && value !== "") {
            query.set(key, value);
        }
    });

    router.get(route("dailytimerecord"), Object.fromEntries(query), {
        preserveState: true,
        preserveScroll: true,
        replace: true,
    });
};

export const closeWorkScheduleModal = (router) => {
    const query = new URLSearchParams(window.location.search);
    clearWorkScheduleModalParams(query);

    router.get(route("dailytimerecord"), Object.fromEntries(query), {
        preserveState: true,
        preserveScroll: true,
        replace: true,
    });
};
