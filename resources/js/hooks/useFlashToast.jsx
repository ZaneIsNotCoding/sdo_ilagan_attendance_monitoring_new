import { useEffect } from "react";
import { usePage } from "@inertiajs/react";
import { toast } from "sonner";

export default function useFlashToast(options = {}) {
    const { props } = usePage();

    const duration = options.duration || 3000;
    const showCloseButton =
        options.showCloseButton !== undefined ? options.showCloseButton : true;
    const richColors =
        options.richColors !== undefined ? options.richColors : true;

    useEffect(() => {
        if (props.success) {
            if (Array.isArray(props.success)) {
                props.success.forEach((msg) =>
                    toast.success(msg, {
                        duration,
                        closeButton: showCloseButton,
                        richColors,
                    }),
                );
            } else {
                toast.success(props.success, {
                    duration,
                    closeButton: showCloseButton,
                    richColors,
                });
            }
        }

        if (props.error) {
            if (Array.isArray(props.error)) {
                props.error.forEach((msg) =>
                    toast.error(msg, {
                        duration,
                        closeButton: showCloseButton,
                        richColors,
                    }),
                );
            } else {
                toast.error(props.error, {
                    duration,
                    closeButton: showCloseButton,
                    richColors,
                });
            }
        }
    }, [props.success, props.error, duration, showCloseButton, richColors]);
}
