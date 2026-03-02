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
import { Box, Typography, Paper, CircularProgress } from '@mui/material';
import { useChartData } from '../hooks/useChartData';
import { formatShortDate } from '../api/types/chart';

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
                    backgroundColor: 'rgba(22, 27, 34, 0.95)',
                    color: 'white',
                    border: '1px solid rgba(48, 54, 61, 0.5)',
                    borderRadius: 2,
                }}
            >
                <Typography variant="body2" sx={{ fontWeight: 'bold', mb: 0.5, color: '#e6edf3' }}>
                    {label}
                </Typography>
                <Typography variant="body2" sx={{ color: '#3fb950' }}>
                    Коммитов: {payload[0].value}
                </Typography>
            </Paper>
        );
    }
    return null;
};

const LineChartComponent = () => {
    const { data, loading, error } = useChartData();

    // Форматируем даты для отображения на оси X
    const formattedData = data.map(item => ({
        ...item,
        shortDate: formatShortDate(item.date)
    }));

    if (loading) {
        return (
            <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: 400 }}>
                <CircularProgress sx={{ color: '#2ea043' }} />
            </Box>
        );
    }

    if (error) {
        return (
            <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: 400 }}>
                <Typography color="error">{error}</Typography>
            </Box>
        );
    }

    if (data.length === 0) {
        return (
            <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: 400 }}>
                <Typography color="text.secondary">Нет данных для отображения</Typography>
            </Box>
        );
    }

    return (
        <Box sx={{ width: '100%', height: '100%' }}>
            <ResponsiveContainer width="100%" height={400}>
                <ComposedChart
                    data={formattedData}
                    margin={{ top: 20, right: 30, left: 20, bottom: 20 }}
                >
                    <defs>
                        <linearGradient id="colorCommits" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="#2ea043" stopOpacity={0.3}/>
                            <stop offset="95%" stopColor="#2ea043" stopOpacity={0}/>
                        </linearGradient>
                    </defs>

                    <CartesianGrid
                        strokeDasharray="3 3"
                        stroke="#2d333b"
                        vertical={false}
                    />

                    <XAxis
                        dataKey="shortDate"
                        tick={{ fontSize: 12, fill: '#768390' }}
                        interval={6}
                        axisLine={false}
                        tickLine={false}
                    />

                    <YAxis
                        tick={{ fontSize: 12, fill: '#768390' }}
                        axisLine={false}
                        tickLine={false}
                        allowDecimals={false}
                    />

                    <Tooltip content={<CustomTooltip />} />

                    <Area
                        type="monotone"
                        dataKey="commits"
                        stroke="none"
                        fill="url(#colorCommits)"
                    />

                    <Line
                        type="monotone"
                        dataKey="commits"
                        stroke="#2ea043"
                        strokeWidth={2.5}
                        dot={false}
                        activeDot={{
                            r: 6,
                            fill: '#2ea043',
                            stroke: '#0d1117',
                            strokeWidth: 2
                        }}
                    />

                    <Brush
                        dataKey="shortDate"
                        height={30}
                        stroke="#2ea043"
                        fill="rgba(46, 160, 67, 0.1)"
                        travellerWidth={10}
                        gap={5}
                        startIndex={0}
                        endIndex={formattedData.length - 1}
                    />
                </ComposedChart>
            </ResponsiveContainer>
        </Box>
    );
};

export default LineChartComponent;