import React, { useState } from "react";
import { Loader2, Search, X } from "lucide-react";
import FloatingInput from "@/components/floating-input";
import useSearchSuggestions from "../hooks/useSearchSuggestions";

const SchoolList = ({
    selectedStation,
    selectStation,
    setStationSearch,
    stationSearch,
    stations,
}) => {
    const [selectedSuggestion, setSelectedSuggestion] = useState(null);
    const {
        searchBoxRef,
        showSuggestions,
        setShowSuggestions,
        suggestionMatches,
        setSuggestionMatches,
        suggestionsLoading,
    } = useSearchSuggestions({
        query: stationSearch,
        routeName: "attendance-monitoring.stations.suggestions",
    });

    const stationTabs = selectedSuggestion ? [selectedSuggestion] : stations;
    const stationGroups = stationTabs.length > 5 ? [0, 1] : [0];

    const selectSuggestion = (station) => {
        setSelectedSuggestion(station);
        setStationSearch(station.name || "");
        setShowSuggestions(false);
        selectStation(station);
    };

    const clearSearch = () => {
        const sdoStation =
            stations.find((station) => station.code === "SDO") || stations[0];

        setSelectedSuggestion(null);
        setSuggestionMatches([]);
        setStationSearch("");
        setShowSuggestions(false);

        if (sdoStation) {
            selectStation(sdoStation);
        }
    };

    return (
        <div className="mb-10">
            <style>{`
                @keyframes school-drift {
                    from { transform: translateX(0); }
                    to { transform: translateX(-50%); }
                }
            `}</style>
            <div className="mb-3 flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
                <h2 className="text-base font-black">Schools</h2>
                <div ref={searchBoxRef} className="relative w-96">
                    <form
                        onSubmit={(event) => {
                            event.preventDefault();

                            if (suggestionMatches.length > 0) {
                                selectSuggestion(suggestionMatches[0]);
                            }
                        }}
                        className="relative"
                    >
                        <FloatingInput
                            label="Search Station"
                            icon={Search}
                            name="attendance_station_search"
                            value={stationSearch}
                            onChange={(event) => {
                                const value = event.target.value;

                                setStationSearch(value);
                                if (!value.trim()) {
                                    setSelectedSuggestion(null);
                                }
                                setShowSuggestions(true);
                            }}
                            onKeyDown={(event) => {
                                if (
                                    event.key === "Enter" &&
                                    suggestionMatches.length > 0
                                ) {
                                    event.preventDefault();
                                    selectSuggestion(suggestionMatches[0]);
                                }
                            }}
                        />
                        {stationSearch ? (
                            <button
                                type="button"
                                onClick={clearSearch}
                                className="absolute right-3 top-1/2 flex h-5 w-5 -translate-y-1/2 items-center justify-center rounded-full bg-slate-100 text-slate-500 transition hover:bg-[#141b6d] hover:text-white"
                                aria-label="Clear station search"
                            >
                                <X className="h-3 w-3" />
                            </button>
                        ) : null}
                    </form>

                    {showSuggestions && stationSearch.trim() ? (
                        <div className="absolute right-0 top-full z-50 mt-2 w-full overflow-hidden rounded-lg border border-slate-200 bg-white shadow-2xl">
                            <div className="border-b bg-[#f4f6ff] px-3 py-2 text-xs font-semibold uppercase text-[#141b6d]">
                                Results for "{stationSearch.trim()}"
                            </div>

                            <div className="max-h-72 overflow-y-auto">
                                {suggestionsLoading ? (
                                    <div className="flex items-center gap-3 px-3 py-4 text-sm text-slate-500">
                                        <span className="flex h-8 w-8 items-center justify-center rounded-full bg-[#eef1ff] text-[#141b6d]">
                                            <Loader2 className="h-4 w-4 animate-spin" />
                                        </span>
                                        <div>
                                            <div className="font-medium text-slate-700">
                                                Searching stations...
                                            </div>
                                            <div className="text-xs text-slate-400">
                                                Checking names and codes
                                            </div>
                                        </div>
                                    </div>
                                ) : suggestionMatches.length > 0 ? (
                                    suggestionMatches.map((station) => (
                                        <button
                                            key={station.id}
                                            type="button"
                                            onMouseDown={() =>
                                                selectSuggestion(station)
                                            }
                                            className="flex w-full items-start justify-between gap-3 px-3 py-2 text-left text-sm transition hover:bg-[#f4f6ff]"
                                        >
                                            <div className="min-w-0">
                                                <div className="truncate font-medium text-slate-800">
                                                    {station.name}
                                                </div>
                                                <div className="truncate text-xs text-slate-500">
                                                    {station.code || "No code"}
                                                </div>
                                            </div>

                                            <span className="shrink-0 rounded-full bg-[#eef1ff] px-2 py-1 text-[11px] font-semibold text-[#141b6d]">
                                                Select
                                            </span>
                                        </button>
                                    ))
                                ) : (
                                    <div className="px-3 py-4 text-sm text-slate-500">
                                        No station matches found.
                                    </div>
                                )}
                            </div>
                        </div>
                    ) : null}
                </div>
            </div>
            <div className="relative overflow-hidden">
                <div className="pointer-events-none absolute left-0 top-0 h-full" />
                <div className="pointer-events-none absolute right-0 top-0 z-10 h-full w-8 bg-gradient-to-l from-white to-transparent" />
                <div
                    className="flex w-max flex-nowrap items-center gap-3"
                    style={{
                        animation:
                            stationTabs.length > 5
                                ? "school-drift 750s linear infinite"
                                : "none",
                    }}
                >
                    {stationGroups.map((group) => (
                        <div
                            key={group}
                            className="flex shrink-0 flex-nowrap items-center gap-3"
                            aria-hidden={group === 1}
                        >
                            {stationTabs.map((station) => (
                                <button
                                    key={`${group}-${station.id}`}
                                    type="button"
                                    onClick={() => selectStation(station)}
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

