import { useEffect, useState } from "react";
import { router, useForm } from "@inertiajs/react";
import { AlertTriangle, ShieldAlert, Loader2, LockKeyhole } from "lucide-react";

import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogFooter,
    DialogTrigger,
    DialogDescription,
} from "@/components/ui/dialog";

export default function ConfirmPasswordDialog({
    trigger,
    title = "Confirm Action",
    description = "This action requires password confirmation before proceeding.",
    action,
    method = "delete",
    data: payload = {},
    onSuccess,
    onError,
    confirmText = "Confirm",
    cancelText = "Cancel",
    processingText = "Processing...",
    danger = true,

    itemName = "",
    itemLabel = "Selected Item",
    note = "",
    passwordLabel = "Password",
    passwordPlaceholder = "Enter your password",
    passwordHelpText = "For security purposes, please re-enter your account password.",
    showSecurityNote = true,
    open: controlledOpen,
    onOpenChange,
}) {
    const [uncontrolledOpen, setUncontrolledOpen] = useState(false);
    const open = controlledOpen ?? uncontrolledOpen;
    const setOpen = (nextOpen) => {
        setUncontrolledOpen(nextOpen);
        onOpenChange?.(nextOpen);
    };

    // ✅ added loading state
    const [loading, setLoading] = useState(false);

    const { data, setData, reset, errors, clearErrors, setError } = useForm({
        password: "",
    });

    useEffect(() => {
        if (!open) {
            reset();
            clearErrors();
        }
    }, [open, reset, clearErrors]);

    const handleSubmit = (e) => {
        e.preventDefault();

        const submitData = {
            ...payload,
            password: data.password,
        };

        const options = {
            preserveScroll: true,

            onStart: () => setLoading(true),

            onSuccess: (...args) => {
                setLoading(false);
                setOpen(false);
                reset();
                clearErrors();
                onSuccess?.(...args);
            },

            onError: (err) => {
                setLoading(false);

                if (err?.password) {
                    setError("password", err.password);
                    setData("password", "");
                }

                onError?.(err);
            },
        };

        switch (method.toLowerCase()) {
            case "post":
                router.post(action, submitData, options);
                break;

            case "put":
                router.put(action, submitData, options);
                break;

            case "patch":
                router.patch(action, submitData, options);
                break;

            case "delete":
            default:
                router.delete(action, {
                    ...options,
                    data: submitData,
                });
                break;
        }
    };

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>{trigger}</DialogTrigger>

            <DialogContent className="max-w-md overflow-hidden border-0 p-0 shadow-2xl">
                <div
                    className={`border-b px-6 py-5 ${
                        danger
                            ? "bg-red-50 dark:bg-red-950/30"
                            : "bg-blue-50 dark:bg-blue-950/30"
                    }`}
                >
                    <div className="flex items-start gap-4">
                        <div
                            className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-full ${
                                danger
                                    ? "bg-red-100 text-red-600 dark:bg-red-900/40 dark:text-red-400"
                                    : "bg-blue-100 text-blue-600 dark:bg-blue-900/40 dark:text-blue-400"
                            }`}
                        >
                            {danger ? (
                                <AlertTriangle className="h-6 w-6" />
                            ) : (
                                <ShieldAlert className="h-6 w-6" />
                            )}
                        </div>

                        <DialogHeader className="space-y-1 text-left">
                            <DialogTitle className="text-xl font-semibold">
                                {title}
                            </DialogTitle>
                            <DialogDescription className="text-sm leading-6 text-muted-foreground">
                                {description}
                            </DialogDescription>
                        </DialogHeader>
                    </div>
                </div>

                <form onSubmit={handleSubmit} className="space-y-5 px-6 py-5">
                    {itemName && (
                        <div className="rounded-xl border bg-muted/40 p-4">
                            <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                                {itemLabel}
                            </p>
                            <p className="mt-1 break-words text-sm font-semibold text-foreground">
                                {itemName}
                            </p>
                        </div>
                    )}

                    {danger && (
                        <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700 dark:border-red-900 dark:bg-red-950/20 dark:text-red-300">
                            <div className="flex items-start gap-2">
                                <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0" />
                                <p>
                                    This action may be irreversible. Please make
                                    sure you want to continue.
                                </p>
                            </div>
                        </div>
                    )}

                    {note && (
                        <div className="rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-700 dark:border-amber-900 dark:bg-amber-950/20 dark:text-amber-300">
                            <div className="flex items-start gap-2">
                                <ShieldAlert className="mt-0.5 h-4 w-4 shrink-0" />
                                <p>{note}</p>
                            </div>
                        </div>
                    )}

                    <div className="space-y-2">
                        <label className="text-sm font-medium text-foreground">
                            {passwordLabel}
                        </label>

                        <div className="relative">
                            <LockKeyhole className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                            <input
                                type="password"
                                placeholder={passwordPlaceholder}
                                className={`w-full rounded-lg border bg-background py-2.5 pl-10 pr-3 text-sm outline-none transition ${
                                    errors?.password
                                        ? "border-red-500 focus:ring-2 focus:ring-red-200"
                                        : "border-input focus:ring-2 focus:ring-ring/20"
                                }`}
                                value={data.password}
                                onChange={(e) =>
                                    setData("password", e.target.value)
                                }
                                required
                            />
                        </div>

                        {!errors?.password && passwordHelpText && (
                            <p className="text-xs leading-5 text-muted-foreground">
                                {passwordHelpText}
                            </p>
                        )}

                        {errors?.password && (
                            <p className="text-sm font-medium text-red-600">
                                {errors.password}
                            </p>
                        )}
                    </div>

                    {showSecurityNote && (
                        <div className="rounded-xl border bg-slate-50 px-4 py-3 text-xs leading-5 text-slate-600 dark:bg-slate-900/40 dark:text-slate-300">
                            Your password is only used to verify that this
                            action is authorized.
                        </div>
                    )}

                    <DialogFooter className="gap-2 sm:gap-2">
                        <button
                            type="button"
                            onClick={() => setOpen(false)}
                            disabled={loading}
                            className="inline-flex h-10 items-center justify-center rounded-lg border px-4 text-sm font-medium transition hover:bg-muted disabled:cursor-not-allowed disabled:opacity-60"
                        >
                            {cancelText}
                        </button>

                        <button
                            type="submit"
                            disabled={loading || !data.password}
                            className={`inline-flex h-10 items-center justify-center gap-2 rounded-lg px-4 text-sm font-medium text-white transition disabled:cursor-not-allowed disabled:opacity-60 ${
                                danger
                                    ? "bg-red-600 hover:bg-red-700"
                                    : "bg-blue-600 hover:bg-blue-700"
                            }`}
                        >
                            {loading && (
                                <Loader2 className="h-4 w-4 animate-spin" />
                            )}
                            {loading ? processingText : confirmText}
                        </button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}
