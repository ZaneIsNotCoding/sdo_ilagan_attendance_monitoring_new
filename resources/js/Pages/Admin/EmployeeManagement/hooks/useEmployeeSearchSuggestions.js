import { useEffect, useRef, useState } from "react";
import axios from "axios";

const useEmployeeSearchSuggestions = ({
    enabled = true,
    params = {},
    query,
    routeName = "employees.suggestions",
}) => {
    const [showSuggestions, setShowSuggestions] = useState(false);
    const [suggestionMatches, setSuggestionMatches] = useState([]);
    const [suggestionsLoading, setSuggestionsLoading] = useState(false);
    const searchBoxRef = useRef(null);
    const suggestionRequestRef = useRef(0);
    const paramsKey = JSON.stringify(params);

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (
                searchBoxRef.current &&
                !searchBoxRef.current.contains(event.target)
            ) {
                setShowSuggestions(false);
            }
        };

        document.addEventListener("mousedown", handleClickOutside);

        return () => {
            document.removeEventListener("mousedown", handleClickOutside);
        };
    }, []);

    useEffect(() => {
        if (!enabled || !showSuggestions) {
            setSuggestionMatches([]);
            setSuggestionsLoading(false);
            return;
        }

        const search = String(query || "").trim();

        if (!search) {
            setSuggestionMatches([]);
            setSuggestionsLoading(false);
            return;
        }

        setSuggestionsLoading(true);
        const requestId = suggestionRequestRef.current + 1;
        suggestionRequestRef.current = requestId;

        const timeout = setTimeout(() => {
            axios
                .get(route(routeName), {
                    params: {
                        search,
                        ...JSON.parse(paramsKey || "{}"),
                    },
                })
                .then((response) => {
                    if (suggestionRequestRef.current !== requestId) return;

                    setSuggestionMatches(response.data || []);
                })
                .catch(() => {
                    if (suggestionRequestRef.current !== requestId) return;

                    setSuggestionMatches([]);
                })
                .finally(() => {
                    if (suggestionRequestRef.current !== requestId) return;

                    setSuggestionsLoading(false);
                });
        }, 250);

        return () => clearTimeout(timeout);
    }, [enabled, paramsKey, query, routeName, showSuggestions]);

    return {
        searchBoxRef,
        setShowSuggestions,
        showSuggestions,
        suggestionMatches,
        suggestionsLoading,
    };
};

export default useEmployeeSearchSuggestions;
