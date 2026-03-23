import React from "react";
import MainContainerComponent from "../component/container/MainContainerComponent.jsx";
import LineChartComponent from "../component/LineChartComponent.jsx";
import CommitsTable from "../component/CommitsTable.jsx";
import { Box, Grid, Paper, Typography, CircularProgress } from "@mui/material";
import { useCommitsData } from "../hooks/useCommitsData";
import TodayIcon from '@mui/icons-material/Today';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import DateRangeIcon from '@mui/icons-material/DateRange';
import PersonIcon from '@mui/icons-material/Person';

const GitCommitsPage = () => {
    const { data, loading, error } = useCommitsData();

    // Статистика
    const totalCommits = data.reduce((sum, item) => sum + item.totalCommits, 0);
    const totalMergeCommits = data.reduce((sum, item) => sum + item.totalMergeCommits, 0);
    const avgCommitsPerDay = data.length > 0
        ? Math.round(totalCommits / data.length)
        : 0;
    const maxCommits = data.length > 0
        ? Math.max(...data.map(item => item.totalCommits))
        : 0;
    const maxCommitDay = data.find(item => item.totalCommits === maxCommits);

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
                    <Typography color="error">Ошибка загрузки: {error}</Typography>
                </Box>
            </MainContainerComponent>
        );
    }

    return (
        <MainContainerComponent>
            <Box sx={{ p: 3 }}>
                {/* Карточки статистики */}
                <Grid container spacing={3} sx={{ mb: 4, display: 'flex', justifyContent: 'space-between' }}>
                    <Grid item xs={12} md={3}>
                        <Paper
                            elevation={0}
                            sx={{
                                p: 3,
                                borderRadius: 2,
                                border: '1px solid',
                                borderColor: 'rgba(0, 0, 0, 0.08)',
                                backgroundColor: '#fafafa',
                                display: 'flex',
                                alignItems: 'center',
                                gap: 2
                            }}
                        >
                            <Box sx={{
                                backgroundColor: 'rgba(241, 196, 15, 0.1)',
                                borderRadius: '50%',
                                width: 56,
                                height: 56,
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center'
                            }}>
                                <PersonIcon sx={{ color: '#f1c40f', fontSize: 28 }} />
                            </Box>
                            <Box>
                                <Typography variant="h4" sx={{ fontWeight: 'bold', color: '#f1c40f' }}>
                                    {data.reduce((sum, day) => sum + (day.details?.length || 0), 0)}
                                </Typography>
                                <Typography variant="body2" color="text.secondary">
                                    Уникальных авторов
                                </Typography>
                            </Box>
                        </Paper>
                    </Grid>

                    <Grid item xs={12} md={3}>
                        <Paper
                            elevation={0}
                            sx={{
                                p: 3,
                                borderRadius: 2,
                                border: '1px solid',
                                borderColor: 'rgba(0, 0, 0, 0.08)',
                                backgroundColor: '#fafafa',
                                display: 'flex',
                                alignItems: 'center',
                                gap: 2
                            }}
                        >
                            <Box sx={{
                                backgroundColor: 'rgba(241, 196, 15, 0.1)',
                                borderRadius: '50%',
                                width: 56,
                                height: 56,
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center'
                            }}>
                                <TrendingUpIcon sx={{ color: '#f1c40f', fontSize: 28 }} />
                            </Box>
                            <Box>
                                <Typography variant="h4" sx={{ fontWeight: 'bold', color: '#f1c40f' }}>
                                    {avgCommitsPerDay}
                                </Typography>
                                <Typography variant="body2" color="text.secondary">
                                    В среднем в день
                                </Typography>
                            </Box>
                        </Paper>
                    </Grid>

                    <Grid item xs={12} md={3}>
                        <Paper
                            elevation={0}
                            sx={{
                                p: 3,
                                borderRadius: 2,
                                border: '1px solid',
                                borderColor: 'rgba(0, 0, 0, 0.08)',
                                backgroundColor: '#fafafa',
                                display: 'flex',
                                alignItems: 'center',
                                gap: 2
                            }}
                        >
                            <Box sx={{
                                backgroundColor: 'rgba(241, 196, 15, 0.1)',
                                borderRadius: '50%',
                                width: 56,
                                height: 56,
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center'
                            }}>
                                <TodayIcon sx={{ color: '#f1c40f', fontSize: 28 }} />
                            </Box>
                            <Box>
                                <Typography variant="h4" sx={{ fontWeight: 'bold', color: '#f1c40f' }}>
                                    {maxCommits}
                                </Typography>
                                <Typography variant="body2" color="text.secondary">
                                    {maxCommitDay ? `Максимум (${new Date(maxCommitDay.date).toLocaleDateString('ru-RU')})` : 'Максимум'}
                                </Typography>
                            </Box>
                        </Paper>
                    </Grid>

                    <Grid item xs={12} md={3}>
                        <Paper
                            elevation={0}
                            sx={{
                                p: 3,
                                borderRadius: 2,
                                border: '1px solid',
                                borderColor: 'rgba(0, 0, 0, 0.08)',
                                backgroundColor: '#fafafa',
                                display: 'flex',
                                alignItems: 'center',
                                gap: 2
                            }}
                        >
                            <Box sx={{
                                backgroundColor: 'rgba(241, 196, 15, 0.1)',
                                borderRadius: '50%',
                                width: 56,
                                height: 56,
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center'
                            }}>
                                <DateRangeIcon sx={{ color: '#f1c40f', fontSize: 28 }} />
                            </Box>
                            <Box>
                                <Typography variant="h4" sx={{ fontWeight: 'bold', color: '#f1c40f' }}>
                                    {data.length}
                                </Typography>
                                <Typography variant="body2" color="text.secondary">
                                    Дней в периоде
                                </Typography>
                            </Box>
                        </Paper>
                    </Grid>
                </Grid>

                {/* График */}
                <Paper
                    elevation={0}
                    sx={{
                        p: 2,
                        borderRadius: 2,
                        border: '1px solid',
                        borderColor: 'rgba(0, 0, 0, 0.08)',
                        backgroundColor: '#fafafa',
                        mb: 4
                    }}
                >
                    <Typography variant="h6" gutterBottom sx={{ mb: 2, color: '#2ea043' }}>
                        📈 Динамика коммитов
                    </Typography>
                    <LineChartComponent data={data.map(item => ({
                        date: item.date,
                        commits: item.totalCommits
                    }))} />
                </Paper>

                {/* Таблица */}
                <Typography variant="h6" sx={{ mb: 2, color: '#2ea043' }}>
                    📋 Детальная статистика по дням
                </Typography>

                <CommitsTable data={data} loading={loading} />
            </Box>
        </MainContainerComponent>
    );
};

export default GitCommitsPage;