import React from "react";
import { Clock3 } from "lucide-react";

import ApplicationLogo from "@/Components/ApplicationLogo";

const Header = ({ time }) => {
    const today = time.toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric",
    });

    const dayName = time.toLocaleDateString("en-US", {
        weekday: "long",
    });

    const clock = time.toLocaleTimeString("en-US", {
        hour: "numeric",
        minute: "2-digit",
        second: "2-digit",
    });

    return (
        <header className="flex flex-col bg-blue-50 px-10 py-3 text-[#070d3f] shadow-sm shadow-slate-200/60 lg:flex-row lg:items-center lg:justify-between">
            <div className="flex items-center gap-3">
                <div className="flex h-14 w-14 shrink-0 items-center justify-center">
                    <ApplicationLogo className="h-14 w-auto" />
                </div>
                <div>
                    <div className="text-lg font-black leading-tight">
                        TimeVault
                    </div>
                    <div className="max-w-md text-[10px] font-semibold uppercase tracking-wide text-slate-500">
                        Securing Attendance and Tardiness Data with Biometrics
                    </div>
                </div>
            </div>

            <div className="rounded-lg px-2 py-1 text-right">
                <div className="text-right">
                    <p className="flex items-center justify-end gap-2 text-base font-black">
                        <Clock3 className="h-4 w-4" />
                        {clock}
                    </p>
                    <p className="text-xs font-semibold text-slate-500">
                        {today} &bull; {dayName}
                    </p>
                </div>
            </div>
        </header>
    );
};

export default Header;
