import React from "react";
import { Skeleton } from "@/components/ui/skeleton";

export const SuggestionSkeletonList = ({
    count = 2,
    lines = 2,
    actionClassName = "h-6 w-14 rounded-full",
    className = "space-y-2 px-3 py-3",
    itemClassName = "flex items-center justify-between gap-3",
}) => (
    <div className={className}>
        {Array.from({ length: count }).map((_, index) => (
            <div key={index} className={itemClassName}>
                <div className="min-w-0 flex-1 space-y-2">
                    <Skeleton className="h-4 w-3/4" />
                    {lines >= 2 ? <Skeleton className="h-3 w-1/2" /> : null}
                    {lines >= 3 ? <Skeleton className="h-3 w-2/5" /> : null}
                </div>
                {actionClassName ? (
                    <Skeleton className={actionClassName} />
                ) : null}
            </div>
        ))}
    </div>
);

export const SelectableEmployeeSkeletonList = ({
    count = 3,
    className = "",
}) => (
    <>
        {Array.from({ length: count }).map((_, index) => (
            <div
                key={index}
                className={`flex w-full items-center justify-between rounded-xl px-3 py-2 ${className}`}
            >
                <div className="flex min-w-0 flex-1 items-center gap-3">
                    <Skeleton className="h-10 w-10 shrink-0 rounded-full" />

                    <div className="min-w-0 flex-1 space-y-2">
                        <Skeleton className="h-4 w-3/4" />
                        <Skeleton className="h-3 w-1/2" />
                    </div>
                </div>

                <Skeleton className="ml-3 h-5 w-5 shrink-0 rounded-full" />
            </div>
        ))}
    </>
);

export const PrintableEmployeeSkeleton = () => (
    <div className="flex items-center justify-between gap-3 px-3 py-2.5">
        <div className="flex min-w-0 items-center gap-3">
            <Skeleton className="h-9 w-9 shrink-0 rounded-full" />
            <div className="min-w-0 space-y-2">
                <Skeleton className="h-4 w-44" />
                <Skeleton className="h-3 w-60 max-w-full" />
            </div>
        </div>
        <Skeleton className="h-6 w-14 rounded-full" />
    </div>
);

export const PrintableEmployeeSkeletonList = ({ count = 4 }) => (
    <>
        {Array.from({ length: count }).map((_, index) => (
            <PrintableEmployeeSkeleton key={index} />
        ))}
    </>
);

export const SignatorySkeleton = () => (
    <div className="rounded-xl border border-slate-200 bg-white/80 p-2.5">
        <div className="flex items-center gap-3">
            <Skeleton className="h-9 w-9 shrink-0 rounded-full" />
            <div className="min-w-0 flex-1 space-y-2">
                <Skeleton className="h-3 w-24" />
                <Skeleton className="h-4 w-36" />
                <Skeleton className="h-3 w-28" />
            </div>
        </div>
    </div>
);

export const SignatoryChoiceSkeleton = () => (
    <div className="flex items-center justify-between rounded-xl border border-slate-200 bg-white/80 px-3 py-3">
        <div className="flex min-w-0 items-center gap-3">
            <Skeleton className="h-10 w-10 shrink-0 rounded-full" />
            <div className="min-w-0 flex-1 space-y-2">
                <Skeleton className="h-4 w-28" />
                <Skeleton className="h-3 w-40" />
            </div>
        </div>
        <Skeleton className="ml-3 h-6 w-6 shrink-0 rounded-full" />
    </div>
);

export const DepartmentSkeletonList = ({ count = 4 }) => (
    <div className="space-y-2">
        {Array.from({ length: count }).map((_, index) => (
            <div
                key={index}
                className="rounded-xl border border-slate-100 bg-white px-3 py-2"
            >
                <Skeleton className="h-4 w-3/4" />
                <Skeleton className="mt-2 h-3 w-1/2" />
            </div>
        ))}
    </div>
);
