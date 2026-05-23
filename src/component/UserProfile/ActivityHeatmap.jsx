import React from 'react';
import { Paper, Typography, Box } from '@mui/material';
import {
    Tooltip as RechartsTooltip,
    ResponsiveContainer,
    BarChart,
    Bar,
    XAxis,
    YAxis,
    CartesianGrid,
    Cell,
    LabelList
} from 'recharts';

const dayNames = {
    'пн': 'ПН',
    'вт': 'ВТ',
    'ср': 'СР',
    'чт': 'ЧТ',
    'пт': 'ПТ',
    'сб': 'СБ',
    'вс': 'ВС'
};

const dayNamesFull = {
    'пн': 'Понедельник',
    'вт': 'Вторник',
    'ср': 'Среда',
    'чт': 'Четверг',
    'пт': 'Пятница',
    'сб': 'Суббота',
    'вс': 'Воскресенье'
};

const hourColors = [
    '#ebedf0', '#9be9a8', '#40c463', '#30a14e', '#216e39'
];

const getBarColor = (value, maxValue) => {
    if (value === 0) return hourColors[0];
    const intensity = value / maxValue;
    if (intensity < 0.25) return hourColors[1];
    if (intensity < 0.5) return hourColors[2];
    if (intensity < 0.75) return hourColors[3];
    return hourColors[4];
};

// Кастомный компонент для отображения значений по центру бара с фоном (горизонтальные бары)
const renderCustomizedLabelHorizontal = (props) => {
    const { x, y, width, height, value } = props;
    if (value === 0) return null;

    const centerX = x + width / 2;
    const centerY = y + height / 2;
    const labelWidth = 40;
    const labelHeight = 20;

    return (
        <g>
            <rect
                x={centerX - labelWidth / 2}
                y={centerY - labelHeight / 2}
                width={labelWidth}
                height={labelHeight}
                fill="rgba(200, 200, 200, 0.8)"
                rx={4}
                ry={4}
                style={{ backdropFilter: 'blur(4px)' }}
            />
            <text
                x={centerX}
                y={centerY}
                fill="#333"
                textAnchor="middle"
                dominantBaseline="middle"
                fontSize={11}
                fontWeight="bold"
            >
                {value}
            </text>
        </g>
    );
};

// Кастомный компонент для отображения значений по центру бара с фоном (вертикальные бары)
const renderCustomizedLabelVertical = (props) => {
    const { x, y, width, height, value } = props;
    if (value === 0) return null;

    const centerX = x + width / 2;
    const centerY = y + height / 2;
    const labelWidth = 30;
    const labelHeight = 18;

    // Для низких баров (меньше 30px) размещаем метку над баром
    if (height < 30) {
        return (
            <g>
                <rect
                    x={centerX - labelWidth / 2}
                    y={y - labelHeight - 2}
                    width={labelWidth}
                    height={labelHeight}
                    fill="rgba(200, 200, 200, 0.8)"
                    rx={4}
                    ry={4}
                />
                <text
                    x={centerX}
                    y={y - labelHeight / 2 - 2}
                    fill="#333"
                    textAnchor="middle"
                    dominantBaseline="middle"
                    fontSize={10}
                    fontWeight="bold"
                >
                    {value}
                </text>
            </g>
        );
    }

    return (
        <g>
            <rect
                x={centerX - labelWidth / 2}
                y={centerY - labelHeight / 2}
                width={labelWidth}
                height={labelHeight}
                fill="rgba(200, 200, 200, 0.8)"
                rx={4}
                ry={4}
            />
            <text
                x={centerX}
                y={centerY}
                fill="#333"
                textAnchor="middle"
                dominantBaseline="middle"
                fontSize={10}
                fontWeight="bold"
            >
                {value}
            </text>
        </g>
    );
};

const ActivityHeatmap = ({ title, data, type, maxValue }) => {
    if (!data || Object.keys(data).length === 0) {
        return (
            <Paper sx={{ p: 2, borderRadius: 2, border: '1px solid rgba(0,0,0,0.08)', height: '100%', minHeight: 400, width: '100%' }}>
                <Typography variant="h6" sx={{ mb: 2, color: '#2ea043' }}>
                    {title}
                </Typography>
                <Typography color="text.secondary" align="center" sx={{ py: 4 }}>
                    Нет данных
                </Typography>
            </Paper>
        );
    }

    const actualMaxValue = maxValue || Math.max(...Object.values(data), 1);

    // 📊 HORIZONTAL BAR CHART для активности по дням недели
    if (type === 'day') {
        const days = ['пн', 'вт', 'ср', 'чт', 'пт', 'сб', 'вс'];
        const chartData = days.map(day => ({
            name: dayNames[day],
            fullName: dayNamesFull[day],
            commits: data[day] || 0
        }));

        return (
            <Paper sx={{ p: 2, borderRadius: 2, border: '1px solid rgba(0,0,0,0.08)', height: '100%', width: '35%' }}>
                <Typography variant="h6" sx={{ mb: 2, color: '#2ea043' }}>
                    {title}
                </Typography>
                <Box sx={{ width: '100%', height: 320 }}>
                    <ResponsiveContainer width="100%" height="100%">
                        <BarChart
                            data={chartData}
                            layout="vertical"
                            margin={{ top: 5, right: 30, left: 50, bottom: 5 }}
                            barCategoryGap={8}
                        >
                            <CartesianGrid strokeDasharray="3 3" stroke="#e0e0e0" horizontal={false} />
                            <XAxis
                                type="number"
                                domain={[0, actualMaxValue]}
                                tick={{ fontSize: 11, fill: '#666' }}
                                axisLine={false}
                                tickLine={false}
                            />
                            <YAxis
                                type="category"
                                dataKey="name"
                                tick={{ fontSize: 12, fill: '#666' }}
                                width={40}
                                axisLine={false}
                                tickLine={false}
                            />
                            <RechartsTooltip
                                content={({ active, payload }) => {
                                    if (active && payload && payload.length) {
                                        return (
                                            <Paper sx={{ p: 1.5, backgroundColor: 'rgba(22, 27, 34, 0.95)', color: 'white', borderRadius: 2 }}>
                                                <Typography variant="body2" sx={{ fontWeight: 'bold', mb: 0.5 }}>
                                                    {payload[0].payload.fullName}
                                                </Typography>
                                                <Typography variant="body2" sx={{ color: '#3fb950' }}>
                                                    Коммитов: {payload[0].value}
                                                </Typography>
                                            </Paper>
                                        );
                                    }
                                    return null;
                                }}
                            />
                            <Bar
                                dataKey="commits"
                                radius={[0, 4, 4, 0]}
                                barSize={32}
                            >
                                <LabelList
                                    dataKey="commits"
                                    position="center"
                                    content={renderCustomizedLabelHorizontal}
                                />
                                {chartData.map((entry, index) => (
                                    <Cell
                                        key={`cell-${index}`}
                                        fill={getBarColor(entry.commits, actualMaxValue)}
                                    />
                                ))}
                            </Bar>
                        </BarChart>
                    </ResponsiveContainer>
                </Box>
            </Paper>
        );
    }

    // 📊 VERTICAL BAR CHART для активности по часам
    const hours = Array.from({ length: 24 }, (_, i) => i);
    const hourData = hours.map(hour => ({
        name: `${hour}:00`,
        fullName: `${hour}:00`,
        commits: data[hour] || 0
    }));

    return (
        <Paper sx={{ p: 2, borderRadius: 2, border: '1px solid rgba(0,0,0,0.08)', height: '100%', width: '55%' }}>
            <Typography variant="h6" sx={{ mb: 2, color: '#2ea043' }}>
                {title}
            </Typography>
            <Box sx={{ width: '100%', height: 320 }}>
                <ResponsiveContainer width="100%" height="100%">
                    <BarChart
                        data={hourData}
                        margin={{ top: 20, right: 10, left: 20, bottom: 20 }}
                        barCategoryGap={2}
                    >
                        <CartesianGrid strokeDasharray="3 3" stroke="#e0e0e0" vertical={false} />
                        <XAxis
                            dataKey="name"
                            tick={{ fontSize: 10, fill: '#666' }}
                            interval={3}
                            axisLine={false}
                            tickLine={false}
                        />
                        <YAxis
                            tick={{ fontSize: 10, fill: '#666' }}
                            axisLine={false}
                            tickLine={false}
                            allowDecimals={false}
                        />
                        <RechartsTooltip
                            content={({ active, payload }) => {
                                if (active && payload && payload.length) {
                                    return (
                                        <Paper sx={{ p: 1.5, backgroundColor: 'rgba(22, 27, 34, 0.95)', color: 'white', borderRadius: 2 }}>
                                            <Typography variant="body2" sx={{ fontWeight: 'bold', mb: 0.5 }}>
                                                {payload[0].payload.fullName}
                                            </Typography>
                                            <Typography variant="body2" sx={{ color: '#3fb950' }}>
                                                Коммитов: {payload[0].value}
                                            </Typography>
                                        </Paper>
                                    );
                                }
                                return null;
                            }}
                        />
                        <Bar
                            dataKey="commits"
                            radius={[4, 4, 0, 0]}
                            barSize={24}
                        >
                            <LabelList
                                dataKey="commits"
                                position="center"
                                content={renderCustomizedLabelVertical}
                            />
                            {hourData.map((entry, index) => (
                                <Cell
                                    key={`cell-${index}`}
                                    fill={getBarColor(entry.commits, actualMaxValue)}
                                />
                            ))}
                        </Bar>
                    </BarChart>
                </ResponsiveContainer>
            </Box>
        </Paper>
    );
};

export default ActivityHeatmap;