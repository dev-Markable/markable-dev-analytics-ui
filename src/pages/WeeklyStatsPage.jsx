import React, { useState } from 'react';
import MainContainerComponent from '../component/container/MainContainerComponent.jsx';
import { Box, Paper, Typography, CircularProgress } from '@mui/material';
import { useWeeklyStats } from '../hooks/useWeeklyStats';
import { WeeklyTabs, WeeklyStatsCards, WeeklyUsersTable } from '../component/WeeklyStats';

const WeeklyStatsPage = () => {
    const { data: weeks, loading, error } = useWeeklyStats();
    const [selectedWeek, setSelectedWeek] = useState(0);

    if (loading) {
        return (
            <MainContainerComponent>
                <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '80vh' }}>
                    <CircularProgress sx={{ color: '#2ea043' }} />
                </Box>
            </MainContainerComponent>
        );
    }

    if (error) {
        return (
            <MainContainerComponent>
                <Box sx={{ p: 3, textAlign: 'center' }}>
                    <Typography color="error">Ошибка: {error}</Typography>
                </Box>
            </MainContainerComponent>
        );
    }

    if (weeks.length === 0) {
        return (
            <MainContainerComponent>
                <Box sx={{ p: 3, textAlign: 'center' }}>
                    <Typography color="text.secondary">Нет данных для отображения</Typography>
                </Box>
            </MainContainerComponent>
        );
    }

    const currentWeek = weeks[selectedWeek];

    return (
        <MainContainerComponent>
            <Box sx={{ p: 3 }}>
                <WeeklyTabs
                    weeks={weeks}
                    selectedWeek={selectedWeek}
                    onChange={(e, newValue) => setSelectedWeek(newValue)}
                />
                <Box sx={{ mt: 2 }}>
                    <WeeklyStatsCards week={currentWeek} />
                    <WeeklyUsersTable
                        weekData={currentWeek}
                        weekStart={currentWeek.weekStart}
                        weekEnd={currentWeek.weekEnd}
                    />
                </Box>
            </Box>
        </MainContainerComponent>
    );
};

export default WeeklyStatsPage;