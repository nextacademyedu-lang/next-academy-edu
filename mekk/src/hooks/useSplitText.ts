'use client';

import { useEffect, useRef, useCallback } from 'react';
import SplitType from 'split-type';

type SplitTypes = 'chars' | 'words' | 'lines';

/**
 * useSplitText — splits text into chars/words/lines using SplitType.
 * Returns a ref to attach to the text element and the split result.
 */
export function useSplitText(types: SplitTypes[] = ['words']) {
    const elementRef = useRef<HTMLElement>(null);
    const splitRef = useRef<SplitType | null>(null);

    const split = useCallback(() => {
        if (!elementRef.current) return null;

        // Revert previous split if any
        if (splitRef.current) {
            splitRef.current.revert();
        }

        const instance = new SplitType(elementRef.current, {
            types: types.join(', ') as 'chars' | 'words' | 'lines',
        });

        splitRef.current = instance;
        return instance;
    }, [types]);

    useEffect(() => {
        const instance = split();

        return () => {
            if (instance) {
                instance.revert();
            }
        };
    }, [split]);

    return { ref: elementRef, splitRef, reSplit: split };
}
