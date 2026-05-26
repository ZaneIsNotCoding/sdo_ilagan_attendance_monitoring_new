import { useState } from "react";
import axios from "axios";
import { Switch } from "@/components/ui/switch";
import { toast } from "sonner";
import useAppUrl from "@/hooks/useAppUrl";

const StatusSwitchCell = ({ emp, onStatusUpdated }) => {
    const API_URL = useAppUrl();

    const [checked, setChecked] = useState(emp.status === "active");
    const [loading, setLoading] = useState(false);

    const handleToggle = async (value) => {
        const previous = checked;
        setChecked(value);
        setLoading(true);

        try {
            const response = await axios.patch(
                `${API_URL}/department-head/${emp.id}/toggle-status`,
                {
                    status: value ? "active" : "inactive",
                },
            );

            toast.success(
                response.data.message || "Status updated successfully.",
            );

            onStatusUpdated?.(emp.id, value ? "active" : "inactive");
        } catch (error) {
            setChecked(previous);

            toast.error(
                error.response?.data?.message || "Failed to update status.",
            );
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="flex justify-center items-center gap-2">
            <Switch
                checked={checked}
                onCheckedChange={handleToggle}
                disabled={loading}
            />
            <span className="text-xs text-gray-600">
                {checked ? "Active" : "Inactive"}
            </span>
        </div>
    );
};

export default StatusSwitchCell;

