import { Button } from "@/components/ui/button";
import { FunnelX } from "lucide-react";
import { router } from "@inertiajs/react";

export default function ClearFilterButton({ routeName, routeParams = {} }) {
    const handleClear = () => {
        const safeParams =
            routeParams && typeof routeParams === "object" ? routeParams : {};

        router.visit(route(routeName, safeParams), {
            method: "get",
            data: {}, // Clear all query params
            replace: true,
            preserveScroll: true,
        });
    };

    return (
        <div className="relative group z-30">
            <Button
                variant="outline"
                onClick={handleClear}
                className="flex items-center gap-2 border-red-500 text-red-500 hover:bg-red-500 hover:text-white"
            >
                <FunnelX className="w-4 h-4" />
            </Button>
            <div className="absolute left-1/2 -translate-x-1/2 mt-2 w-max px-3 py-1.5 rounded-md bg-red-600 text-white text-xs opacity-0 group-hover:opacity-100 transition-opacity duration-200 z-10">
                Reset Filters
            </div>
        </div>
    );
}
