import React from 'react';
import { useParams, useSearchParams } from 'react-router-dom';
import MainContainerComponent from '../component/container/MainContainerComponent.jsx';
import {
    Box,
    Typography,
    Avatar,
    Chip,
    Grid,
    CircularProgress,
    Paper,
    Alert,
    Divider,
    Stack
} from '@mui/material';
import EmailIcon from '@mui/icons-material/Email';
import CalendarTodayIcon from '@mui/icons-material/CalendarToday';
import FolderIcon from '@mui/icons-material/Folder';
import DateRangeIcon from '@mui/icons-material/DateRange';
import { useUserProfile } from '../hooks/useUserProfile';
import StatsCards from '../component/UserProfile/StatsCards';
import AISummaryCard from '../component/UserProfile/AISummaryCard';
import ActivityHeatmap from '../component/UserProfile/ActivityHeatmap';
import TasksTable from '../component/UserProfile/TasksTable';

const UserProfilePage = () => {
    const { email } = useParams();
    const [searchParams] = useSearchParams();

    const startDate = searchParams.get('start');
    const endDate = searchParams.get('end');

    // Формируем URL для API
    const apiUrl = React.useMemo(() => {
        let url = `/users/${encodeURIComponent(email)}`;
        if (startDate && endDate) {
            url += `?start=${startDate}&end=${endDate}`;
        }
        return url;
    }, [email, startDate, endDate]);

    const { profile, loading, error } = useUserProfile(apiUrl);

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

    if (!profile) {
        return (
            <MainContainerComponent>
                <Box sx={{ p: 3, textAlign: 'center' }}>
                    <Typography color="text.secondary">Пользователь не найден</Typography>
                </Box>
            </MainContainerComponent>
        );
    }

    const maxHourValue = Math.max(...Object.values(profile.activityByHour || {}), 1);
    const maxDayValue = Math.max(...Object.values(profile.activityByDay || {}), 1);

    const formatDate = (dateStr) => {
        if (!dateStr) return null;
        const date = new Date(dateStr);
        return date.toLocaleDateString('ru-RU', { day: 'numeric', month: 'long', year: 'numeric' });
    };

    return (
        <MainContainerComponent>
            <Box sx={{ p: { xs: 2, md: 3 } }}>
                {/* Баннер с периодом */}
                {startDate && endDate && (
                    <Alert
                        severity="info"
                        icon={<DateRangeIcon />}
                        sx={{ mb: 3, borderRadius: 2 }}
                    >
                        Показана статистика за период: {formatDate(startDate)} — {formatDate(endDate)}
                    </Alert>
                )}

                {/* Шапка профиля */}
                <Paper
                    elevation={0}
                    sx={{
                        p: { xs: 2, md: 3 },
                        mb: 4,
                        borderRadius: 2,
                        border: '1px solid rgba(0, 0, 0, 0.08)',
                        background: 'linear-gradient(135deg, #f8f9fa 0%, #ffffff 100%)',
                    }}
                >
                    <Stack direction={{ xs: 'column', sm: 'row' }} spacing={3} alignItems="center">
                        <Avatar
                            sx={{
                                width: 100,
                                height: 100,
                                bgcolor: '#f1c40f',
                                fontSize: 40,
                                fontWeight: 'bold',
                                boxShadow: '0 4px 12px rgba(0,0,0,0.1)'
                            }}
                        >
                            {profile.username?.charAt(0).toUpperCase()}
                        </Avatar>
                        <Box sx={{ flex: 1, textAlign: { xs: 'center', sm: 'left' } }}>
                            <Typography variant="h4" sx={{ fontWeight: 500, mb: 1 }}>
                                {profile.username}
                            </Typography>
                            <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} sx={{ mb: 2, flexWrap: 'wrap' }}>
                                <Chip
                                    icon={<EmailIcon />}
                                    label={profile.email}
                                    size="small"
                                    variant="outlined"
                                />
                                <Chip
                                    icon={<CalendarTodayIcon />}
                                    label={`Активен с ${profile.joinedDate}`}
                                    size="small"
                                    variant="outlined"
                                />
                            </Stack>
                            <Stack direction="row" spacing={1} flexWrap="wrap" justifyContent={{ xs: 'center', sm: 'flex-start' }}>
                                {profile.repositories?.map(repo => (
                                    <Chip
                                        key={repo}
                                        icon={<FolderIcon />}
                                        label={repo}
                                        size="small"
                                        sx={{ backgroundColor: 'rgba(46, 160, 67, 0.1)' }}
                                    />
                                ))}
                            </Stack>
                        </Box>
                    </Stack>
                </Paper>

                {/* Карточки статистики */}
                <StatsCards profile={profile} />

                {/* AI Summary */}
                <AISummaryCard summary={profile.aiSummary} />

                <Typography variant="h5" sx={{ fontWeight: 500, mb: 2, color: '#2ea043' }}>
                    📈 Активность
                </Typography>
                <Grid container spacing={3} sx={{mb: 4}}>

                    <ActivityHeatmap
                        title="Активность по дням недели"
                        data={profile.activityByDay}
                        type="day"
                        maxValue={maxDayValue}
                    />


                    <ActivityHeatmap
                        title="Активность по часам"
                        data={profile.activityByHour}
                        type="hour"
                        maxValue={maxHourValue}
                    />

                </Grid>

                {/* Задачи */}
                <Typography variant="h5" sx={{ fontWeight: 500, mb: 2, color: '#2ea043' }}>
                    🎯 Задачи
                </Typography>
                <TasksTable tasks={profile.tasks} />
            </Box>
        </MainContainerComponent>
    );
};

export default UserProfilePage;