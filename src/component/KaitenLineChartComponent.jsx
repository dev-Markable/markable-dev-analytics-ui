import React from 'react';
import {
    LineChart,
    Line,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
    Area,
    ComposedChart,
    Brush
} from 'recharts';
import { Box, Typography, Paper } from '@mui/material';

// Цвета Kaiten
const KAITEN_COLORS = {
    primary: '#00a3ff',    // ярко-синий
    secondary: '#0077be',  // темно-синий
    light: 'rgba(0, 163, 255, 0.1)',
    gradient: {
        start: '#00a3ff',
        end: '#0077be'
    }
};

// Кастомный Tooltip
const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
        const date = new Date(label);
        const formattedDate = date.toLocaleDateString('ru-RU', {
            day: 'numeric',
            month: 'long',
            year: 'numeric'
        });

        return (
            <Paper
                sx={{
                    p: 1.5,
                    backgroundColor: 'rgba(51, 51, 51, 0.95)',
                    color: 'white',
                    border: `1px solid ${KAITEN_COLORS.primary}`,
                    borderRadius: 2,
                }}
            >
                <Typography variant="body2" sx={{ fontWeight: 'bold', mb: 0.5 }}>
                    {label}
                </Typography>
                <Typography variant="body2" sx={{ color: KAITEN_COLORS.primary }}>
                    Закрыто дефектов: {payload[0].value}
                </Typography>
            </Paper>
        );
    }
    return null;
};

const KaitenLineChartComponent = ({ data = [] }) => {
    const formattedData = data.map(item => ({
        ...item,
        shortDate: new Date(item.date).toLocaleDateString('ru-RU', {
            day: 'numeric',
            month: 'short'
        })
    }));

    return (
        <Box sx={{ width: '100%', height: '100%' }}>
            <ResponsiveContainer width="100%" height={400}>
                <ComposedChart
                    data={formattedData}
                    margin={{ top: 20, right: 30, left: 20, bottom: 20 }}
                >
                    {/* Градиент для области под линией - синий */}
                    <defs>
                        <linearGradient id="kaitenGradient" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor={KAITEN_COLORS.primary} stopOpacity={0.2}/>
                            <stop offset="95%" stopColor={KAITEN_COLORS.primary} stopOpacity={0}/>
                        </linearGradient>
                    </defs>

                    <CartesianGrid
                        strokeDasharray="3 3"
                        stroke="#e0e0e0"
                        vertical={false}
                    />

                    <XAxis
                        dataKey="shortDate"
                        tick={{ fontSize: 12, fill: '#666' }}
                        interval={6}
                        axisLine={false}
                        tickLine={false}
                    />

                    <YAxis
                        tick={{ fontSize: 12, fill: '#666' }}
                        axisLine={false}
                        tickLine={false}
                        allowDecimals={false}
                    />

                    <Tooltip content={<CustomTooltip />} />

                    {/* Заливка под линией */}
                    <Area
                        type="monotone"
                        dataKey="defects"
                        stroke="none"
                        fill="url(#kaitenGradient)"
                    />

                    {/* Основная линия - синяя */}
                    <Line
                        type="monotone"
                        dataKey="defects"
                        stroke={KAITEN_COLORS.primary}
                        strokeWidth={3}
                        dot={false}
                        activeDot={{
                            r: 6,
                            fill: KAITEN_COLORS.primary,
                            stroke: 'white',
                            strokeWidth: 2
                        }}
                    />

                    {/* Brush для масштабирования */}
                    <Brush
                        dataKey="shortDate"
                        height={30}
                        stroke={KAITEN_COLORS.primary}
                        fill="rgba(0, 163, 255, 0.1)"
                        travellerWidth={10}
                        gap={5}
                        startIndex={0}
                        endIndex={formattedData.length > 30 ? 30 : formattedData.length - 1}
                    />
                </ComposedChart>
            </ResponsiveContainer>
        </Box>
    );
};

export default KaitenLineChartComponent;