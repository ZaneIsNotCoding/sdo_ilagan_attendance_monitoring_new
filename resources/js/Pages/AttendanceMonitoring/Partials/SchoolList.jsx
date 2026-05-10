import React from "react";

const SchoolList = ({
    selectedStation,
    setPage,
    setSelectedStation,
    stations,
}) => {
    const schoolTabs = [{ id: "all", name: "All Schools" }, ...stations];

    const selectStation = (stationId) => {
        setSelectedStation(stationId);
        setPage(1);
    };

    return (
        <div className="mb-5">
            <style>{`
                @keyframes school-drift {
                    from { transform: translateX(0); }
                    to { transform: translateX(-50%); }
                }
            `}</style>
            <h2 className="mb-3 text-base font-black">Schools</h2>
            <div className="relative overflow-hidden">
                <div className="pointer-events-none absolute left-0 top-0 z-10 h-full w-8 bg-gradient-to-r from-white to-transparent" />
                <div className="pointer-events-none absolute right-0 top-0 z-10 h-full w-8 bg-gradient-to-l from-white to-transparent" />
                <div
                    className="flex w-max flex-nowrap items-center gap-3"
                    style={{
                        animation:
                            stations.length > 5
                                ? "school-drift 750s linear infinite"
                                : "none",
                    }}
                >
                    {[0, 1].map((group) => (
                        <div
                            key={group}
                            className="flex shrink-0 flex-nowrap items-center gap-3"
                            aria-hidden={group === 1}
                        >
                            {schoolTabs.map((station) => (
                                <button
                                    key={`${group}-${station.id}`}
                                    type="button"
                                    onClick={() => selectStation(station.id)}
                                    className={`shrink-0 rounded-lg border px-5 py-3 text-xs font-black shadow-sm ${
                                        String(selectedStation) ===
                                        String(station.id)
                                            ? "border-[#141b6d] bg-[#141b6d] text-white"
                                            : "border-slate-200 bg-white text-[#070d3f]"
                                    }`}
                                >
                                    {station.name}
                                </button>
                            ))}
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default SchoolList;
