'use client';

import React from 'react';
import { RoughNotation, RoughNotationProps } from 'react-rough-notation';

export interface HighlighterProps extends RoughNotationProps {
    children: React.ReactNode;
}

export const Highlighter = ({
    children,
    type = 'highlight',
    color = '#EB5E28',
    strokeWidth = 2,
    animationDuration = 800,
    iterations = 1,
    padding = [2, 4],
    multiline = true,
    show = true,
    ...props
}: HighlighterProps) => {
    return (
        <RoughNotation
            type={type}
            show={show}
            color={color}
            strokeWidth={strokeWidth}
            animationDuration={animationDuration}
            iterations={iterations}
            padding={padding}
            multiline={multiline}
            {...props}
        >
            {children}
        </RoughNotation>
    );
};
