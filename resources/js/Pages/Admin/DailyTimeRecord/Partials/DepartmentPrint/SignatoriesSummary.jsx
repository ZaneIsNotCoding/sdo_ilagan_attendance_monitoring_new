import React from "react";
import EmployeeAvatar from "@/Components/EmployeeAvatar";
import { SignatorySkeleton } from "@/Components/Skeletons";

const SignatoryCard = ({ label, missing, signatory }) => (
    <div className="rounded-xl border border-slate-200 bg-white/80 p-3">
        <div className="flex items-center gap-3">
            <EmployeeAvatar
                employee={signatory?.employee}
                name={signatory?.name}
                className="h-10 w-10"
            />
            <div className="min-w-0">
                <div className="truncate text-[11px] font-medium uppercase tracking-wide text-blue-600">
                    {label}
                </div>
                <div className="truncate text-sm font-semibold text-slate-900">
                    {signatory?.name || missing}
                </div>
                <div
                    className={`truncate text-xs ${
                        signatory?.missing ? "text-orange-600" : "text-slate-500"
                    }`}
                >
                    {signatory?.missing ? missing : signatory?.position}
                </div>
            </div>
        </div>
    </div>
);

const SignatoriesSummary = ({
    isLoading,
    officeHeadSignatory,
    divisionHeadSignatory,
}) => (
    <div className="rounded-2xl border border-blue-100 bg-gradient-to-br from-slate-50 via-white to-blue-50/80 p-3 shadow-sm">
        <div className="mb-3 flex items-center justify-between gap-3">
            <div>
                <p className="text-sm font-semibold text-slate-800">
                    Signatories
                </p>
                <p className="text-xs text-slate-500">
                    Office head and division head for the selected department.
                </p>
            </div>
        </div>

        <div className="grid gap-2 md:grid-cols-2">
            {isLoading ? (
                <>
                    <SignatorySkeleton />
                    <SignatorySkeleton />
                </>
            ) : officeHeadSignatory || divisionHeadSignatory ? (
                [
                    {
                        label: "Office Head",
                        missing: "Missing office head",
                        signatory: officeHeadSignatory,
                    },
                    {
                        label: "Division Head",
                        missing: "Missing division head",
                        signatory: divisionHeadSignatory,
                    },
                ].map((item) => <SignatoryCard key={item.label} {...item} />)
            ) : (
                <div className="rounded-xl border border-slate-200 bg-white/80 px-3 py-6 text-center text-sm text-slate-500 md:col-span-2">
                    No signatories to show.
                </div>
            )}
        </div>
    </div>
);

export default SignatoriesSummary;
