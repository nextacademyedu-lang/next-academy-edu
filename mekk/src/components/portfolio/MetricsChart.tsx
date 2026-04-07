'use client';

import React from 'react';
import {
    BarChart, Bar, LineChart, Line, AreaChart, Area,
    XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer
} from 'recharts';

export type ChartType = 'bar' | 'line' | 'area';

export interface MetricData {
    name: string;
    value: number;
    [key: string]: any;
}

export interface MetricDefinition {
    type: ChartType;
    title: string;
    data: MetricData[];
    dataKey: string;
    color: string;
}

export default function MetricsCharts({ metrics }: { metrics: MetricDefinition[] }) {
    if (!metrics || metrics.length === 0) return null;

    return (
        <div style={{ marginTop: '3rem', display: 'grid', gap: '2rem', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))' }}>
            {metrics.map((metric, idx) => (
                <div key={idx} style={{
                    padding: '1.5rem',
                    background: 'var(--bg-primary)',
                    borderRadius: '12px',
                    border: '1px solid rgba(255,255,255,0.05)',
                    boxShadow: '0 10px 30px rgba(0,0,0,0.2)'
                }}>
                    <h4 style={{
                        fontFamily: 'var(--font-heading)',
                        color: 'var(--text-primary)',
                        fontSize: '1.2rem',
                        marginBottom: '1.5rem',
                        textAlign: 'center'
                    }}>
                        {metric.title}
                    </h4>
                    <div style={{ width: '100%', height: 250 }}>
                        <ResponsiveContainer>
                            {renderChart(metric)}
                        </ResponsiveContainer>
                    </div>
                </div>
            ))}
        </div>
    );
}

function renderChart(metric: MetricDefinition) {
    const { type, data, dataKey, color } = metric;

    const commonProps = {
        data,
        margin: { top: 10, right: 10, left: -20, bottom: 0 }
    };

    switch (type) {
        case 'bar':
            return (
                <BarChart {...commonProps}>
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" vertical={false} />
                    <XAxis dataKey="name" stroke="rgba(255,255,255,0.5)" fontSize={12} tickLine={false} axisLine={false} />
                    <YAxis stroke="rgba(255,255,255,0.5)" fontSize={12} tickLine={false} axisLine={false} />
                    <Tooltip
                        cursor={{ fill: 'rgba(255,255,255,0.05)' }}
                        contentStyle={{ background: '#111', border: 'none', borderRadius: '8px', color: '#fff' }}
                        itemStyle={{ color: color }}
                    />
                    <Bar dataKey={dataKey} fill={color} radius={[4, 4, 0, 0]} maxBarSize={50} />
                </BarChart>
            );
        case 'line':
            return (
                <LineChart {...commonProps}>
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" vertical={false} />
                    <XAxis dataKey="name" stroke="rgba(255,255,255,0.5)" fontSize={12} tickLine={false} axisLine={false} />
                    <YAxis stroke="rgba(255,255,255,0.5)" fontSize={12} tickLine={false} axisLine={false} />
                    <Tooltip
                        contentStyle={{ background: '#111', border: 'none', borderRadius: '8px', color: '#fff' }}
                        itemStyle={{ color: color }}
                    />
                    <Line type="monotone" dataKey={dataKey} stroke={color} strokeWidth={3} dot={{ r: 5, fill: color, strokeWidth: 0 }} activeDot={{ r: 7 }} />
                </LineChart>
            );
        case 'area':
            return (
                <AreaChart {...commonProps}>
                    <defs>
                        <linearGradient id={`color-${dataKey}`} x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor={color} stopOpacity={0.4} />
                            <stop offset="95%" stopColor={color} stopOpacity={0} />
                        </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" vertical={false} />
                    <XAxis dataKey="name" stroke="rgba(255,255,255,0.5)" fontSize={12} tickLine={false} axisLine={false} />
                    <YAxis stroke="rgba(255,255,255,0.5)" fontSize={12} tickLine={false} axisLine={false} />
                    <Tooltip
                        contentStyle={{ background: '#111', border: 'none', borderRadius: '8px', color: '#fff' }}
                        itemStyle={{ color: color }}
                    />
                    <Area type="monotone" dataKey={dataKey} stroke={color} strokeWidth={3} fillOpacity={1} fill={`url(#color-${dataKey})`} />
                </AreaChart>
            );
        default:
            return null;
    }
}
