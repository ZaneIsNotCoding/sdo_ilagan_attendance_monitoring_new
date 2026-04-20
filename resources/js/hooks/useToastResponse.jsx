import { useEffect } from "react";
import { usePage } from "@inertiajs/react";
import { toast } from "sonner";

export default function useToastResponse() {
    const { flash } = usePage().props;

    useEffect(() => {
        if (flash?.success) {
            toast.success(flash.success, {
                id: Date.now(), // ✅ allow stacking
                description: "Operation successful!",
                duration: 5000,
                closeButton: true,
            });
        }

        if (flash?.error) {
            toast.error(flash.error, {
                id: Date.now(),
                description: "Operation failed!",
                duration: 5000,
                closeButton: true,
            });
        }
    }, [flash]); // ✅ key fix
}
