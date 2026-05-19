import { useCallback, useEffect } from "react";

const defaultScrollSelector = "[data-page-scroll]";

const usePreservedPageScroll = ({
    storageKey,
    selector = defaultScrollSelector,
}) => {
    const restorePageScroll = useCallback(() => {
        const savedScrollTop = sessionStorage.getItem(storageKey);
        const scroller = document.querySelector(selector);

        if (!savedScrollTop || !scroller) {
            return;
        }

        requestAnimationFrame(() => {
            scroller.scrollTop = Number(savedScrollTop);
            sessionStorage.removeItem(storageKey);
        });
    }, [selector, storageKey]);

    const rememberPageScroll = useCallback(() => {
        const scroller = document.querySelector(selector);

        if (!scroller) {
            return;
        }

        sessionStorage.setItem(storageKey, String(scroller.scrollTop));
    }, [selector, storageKey]);

    useEffect(() => {
        restorePageScroll();
    }, [restorePageScroll]);

    return {
        rememberPageScroll,
        restorePageScroll,
    };
};

export default usePreservedPageScroll;
