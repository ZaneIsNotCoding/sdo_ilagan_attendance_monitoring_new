import { useEffect, useMemo, useRef, useState } from "react";
import axios from "axios";

const useSearchSuggestions = ({
    query,
    routeName,
    params = {},
    delay = 250,
    enabled = true,
}) => {
    const [suggestionMatches, setSuggestionMatches] = useState([]);
    const [suggestionsLoading, setSuggestionsLoading] = useState(false);
    const [showSuggestions, setShowSuggestions] = useState(false);
    const suggestionRequestRef = useRef(0);
    const searchBoxRef = useRef(null);
    const paramsKey = useMemo(() => JSON.stringify(params), [params]);

    useEffect(() => {
        const trimmedQuery = query.trim();

        if (!enabled || !trimmedQuery) {
            suggestionRequestRef.current += 1;
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
                        search: trimmedQuery,
                        ...JSON.parse(paramsKey),
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
        }, delay);

        return () => clearTimeout(timeout);
    }, [delay, enabled, paramsKey, query, routeName]);

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

    return {
        searchBoxRef,
        showSuggestions,
        setShowSuggestions,
        suggestionMatches,
        setSuggestionMatches,
        suggestionsLoading,
    };
};

export default useSearchSuggestions;
