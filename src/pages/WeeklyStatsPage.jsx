import React, { useState, useEffect, useMemo } from 'react';
import MainContainerComponent from '../component/container/MainContainerComponent.jsx';
import { Box, Paper, Typography, CircularProgress } from '@mui/material';
import { useWeeklyStats } from '../hooks/useWeeklyStats';
import { WeeklyTabs, WeeklyStatsCards, WeeklyUsersTable } from '../component/WeeklyStats';
import { useTeamFilter } from '../context/TeamFilterContext';
import QrCodeScannerIcon from '@mui/icons-material/QrCodeScanner'

// Класс для недели с методами (восстанавливаем функциональность)
class WeekData {
    constructor(data) {
        Object.assign(this, data);
    }

    getWeekLabel() {
        const start = new Date(this.weekStart).toLocaleDateString('ru-RU', {
            day: 'numeric',
            month: 'short'
        });
        const end = new Date(this.weekEnd).toLocaleDateString('ru-RU', {
            day: 'numeric',
            month: 'short'
        });
        return `${start} - ${end}`;
    }
}

const WeeklyStatsPage = () => {
    const { data: weeks, loading, error } = useWeeklyStats();
    const { filterByTeam, isTeamFilterEnabled } = useTeamFilter();

    // Фильтруем данные по команде маркировки
    const filteredWeeks = useMemo(() => {
        if (!weeks || weeks.length === 0) return [];

        if (!isTeamFilterEnabled) return weeks;

        const filtered = weeks.map(week => {
            // Получаем отфильтрованных авторов
            const topAuthorsList = week.topAuthors ? Object.values(week.topAuthors) : [];
            const filteredAuthors = filterByTeam(topAuthorsList, 'email');

            // Если нет участников команды в этой неделе, пропускаем её
            if (filteredAuthors.length === 0) return null;

            // Преобразуем обратно в объект
            const filteredTopAuthors = filteredAuthors.reduce((acc, author) => {
                acc[author.email] = author;
                return acc;
            }, {});

            // Пересчитываем общую статистику для отфильтрованных пользователей
            const filteredTotalCommits = filteredAuthors.reduce((sum, a) => sum + (a.commits || 0), 0);
            const filteredTotalMergeCommits = filteredAuthors.reduce((sum, a) => sum + (a.mergeCommits || 0), 0);
            const filteredTotalAddedLines = filteredAuthors.reduce((sum, a) => sum + (a.addedLines || 0), 0);
            const filteredTotalDeletedLines = filteredAuthors.reduce((sum, a) => sum + (a.deletedLines || 0), 0);
            const filteredTotalTestAddedLines = filteredAuthors.reduce((sum, a) => sum + (a.testAddedLines || 0), 0);

            // Создаем новый объект недели с сохранением всех полей и добавляем метод getWeekLabel
            const weekData = {
                ...week,
                topAuthors: filteredTopAuthors,
                totalCommits: filteredTotalCommits,
                totalMergeCommits: filteredTotalMergeCommits,
                totalAddedLines: filteredTotalAddedLines,
                totalDeletedLines: filteredTotalDeletedLines,
                totalTestAddedLines: filteredTotalTestAddedLines,
                uniqueAuthors: filteredAuthors.length
            };

            // Преобразуем в экземпляр класса WeekData для сохранения методов
            return new WeekData(weekData);
        }).filter(week => week !== null);

        return filtered;
    }, [weeks, filterByTeam, isTeamFilterEnabled]);

    // Вычисляем индекс последней вкладки на основе отфильтрованных недель
    const lastWeekIndex = filteredWeeks.length > 0 ? filteredWeeks.length - 1 : 0;

    // Устанавливаем selectedWeek сразу на последнюю вкладку (без useEffect)
    const [selectedWeek, setSelectedWeek] = useState(lastWeekIndex);

    // Обновляем selectedWeek, когда filteredWeeks меняется
    useEffect(() => {
        const newLastIndex = filteredWeeks.length > 0 ? filteredWeeks.length - 1 : 0;
        setSelectedWeek(newLastIndex);
    }, [filteredWeeks.length]);

    // Безопасное получение текущей недели
    const safeSelectedWeek = filteredWeeks.length > 0
        ? Math.min(selectedWeek, filteredWeeks.length - 1)
        : 0;
    const currentWeek = filteredWeeks.length > 0 && safeSelectedWeek >= 0
        ? filteredWeeks[safeSelectedWeek]
        : null;

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

    if (filteredWeeks.length === 0 || !currentWeek) {
        return (
            <MainContainerComponent>
                <Box sx={{ p: 3, textAlign: 'center' }}>
                    <Typography color="text.secondary">
                        {isTeamFilterEnabled
                            ? 'Нет данных по участникам команды маркировки'
                            : 'Нет данных для отображения'}
                    </Typography>
                </Box>
            </MainContainerComponent>
        );
    }

    return (
        <MainContainerComponent>
            <Box sx={{ p: 3 }}>
                {/* Индикатор активного фильтра */}
                {isTeamFilterEnabled && (
                    <Paper
                        elevation={0}
                        sx={{
                            p: 1.5,
                            mb: 2,
                            borderRadius: 2,
                            backgroundColor: 'rgba(241, 196, 15, 0.1)',
                            border: '1px solid rgba(241, 196, 15, 0.3)',
                            display: 'flex',
                            alignItems: 'center',
                            gap: 1
                        }}
                    >
                        <QrCodeScannerIcon sx={{ color: '#f1c40f', fontSize: 20 }} />
                        <Typography variant="body2" sx={{ color: '#f1c40f' }}>
                            Режим "Команда маркировки" активен — показаны только участники команды
                        </Typography>
                    </Paper>
                )}

                <WeeklyTabs
                    weeks={filteredWeeks}
                    selectedWeek={safeSelectedWeek}
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