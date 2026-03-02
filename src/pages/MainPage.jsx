import React from "react";
import MainContainerComponent from "../component/container/MainContainerComponent.jsx";
import LineChartComponent from "../component/LineChartComponent.jsx";
import KaitenLineChartComponent from "../component/KaitenLineChartComponent.jsx";
import {Box, Grid, Paper, Typography, CircularProgress} from "@mui/material";
import TodayIcon from '@mui/icons-material/Today';
import ShowChartIcon from '@mui/icons-material/ShowChart';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import BugReportIcon from '@mui/icons-material/BugReport';
import DoneAllIcon from '@mui/icons-material/DoneAll';
import {useChartData} from "../hooks/useChartData";
// import { useKaitenData } from "../hooks/useKaitenData"; // если есть

const MainPage = () => {
    const {data: gitData, loading: gitLoading, error: gitError} = useChartData();
    // const { data: kaitenData, loading: kaitenLoading, error: kaitenError } = useKaitenData();

    // Статистика для Git из реальных данных
    const totalCommits = gitData.reduce((sum, item) => sum + item.commits, 0);
    const avgCommits = gitData.length > 0
        ? Math.round(totalCommits / gitData.length)
        : 0;
    const maxCommits = gitData.length > 0
        ? Math.max(...gitData.map(item => item.commits))
        : 0;
    const maxCommitDay = gitData.find(item => item.commits === maxCommits);

    // Статистика для Kaiten (пока моковые данные)
    const totalDefects = 0;
    const avgDefects = 0;
    const maxDefects = 0;
    const maxDefectDay = null;

    if (gitLoading) {
        return (
            <MainContainerComponent>
                <Box sx={{display: 'flex', justifyContent: 'center', alignItems: 'center', height: '80vh'}}>
                    <CircularProgress sx={{color: '#2ea043'}}/>
                </Box>
            </MainContainerComponent>
        );
    }

    if (gitError) {
        return (
            <MainContainerComponent>
                <Box sx={{p: 3, textAlign: 'center'}}>
                    <Typography color="error">Ошибка загрузки: {gitError}</Typography>
                </Box>
            </MainContainerComponent>
        );
    }

    return (
        <MainContainerComponent>
            {/* Секция Git */}
            <Typography variant="h5" sx={{fontWeight: 500, mb: 2, color: '#2ea043'}}>
                📊 Git активность
            </Typography>

            <Grid container spacing={3} sx={{mb: 4, display: 'flex', justifyContent: 'space-between'}}>
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
                            backgroundColor: '#f0f0f0',
                            borderRadius: '50%',
                            width: 56,
                            height: 56,
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center'
                        }}>
                            <ShowChartIcon sx={{color: '#2ea043', fontSize: 28}}/>
                        </Box>
                        <Box>
                            <Typography variant="h4" sx={{fontWeight: 'bold', color: '#2ea043'}}>
                                {totalCommits}
                            </Typography>
                            <Typography variant="body2" color="text.secondary">
                                Всего коммитов
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
                            backgroundColor: '#f0f0f0',
                            borderRadius: '50%',
                            width: 56,
                            height: 56,
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center'
                        }}>
                            <TrendingUpIcon sx={{color: '#2ea043', fontSize: 28}}/>
                        </Box>
                        <Box>
                            <Typography variant="h4" sx={{fontWeight: 'bold', color: '#2ea043'}}>
                                {avgCommits}
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
                            backgroundColor: '#f0f0f0',
                            borderRadius: '50%',
                            width: 56,
                            height: 56,
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center'
                        }}>
                            <TodayIcon sx={{color: '#2ea043', fontSize: 28}}/>
                        </Box>
                        <Box>
                            <Typography variant="h4" sx={{fontWeight: 'bold', color: '#2ea043'}}>
                                {maxCommits}
                            </Typography>
                            <Typography variant="body2" color="text.secondary">
                                {maxCommitDay ? `Максимум (${maxCommitDay.date})` : 'Максимум'}
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
                            backgroundColor: '#f0f0f0',
                            borderRadius: '50%',
                            width: 56,
                            height: 56,
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center'
                        }}>
                            <ShowChartIcon sx={{color: '#2ea043', fontSize: 28}}/>
                        </Box>
                        <Box>
                            <Typography variant="h4" sx={{fontWeight: 'bold', color: '#2ea043'}}>
                                {gitData.length}
                            </Typography>
                            <Typography variant="body2" color="text.secondary">
                                Дней в периоде
                            </Typography>
                        </Box>
                    </Paper>
                </Grid>

                {/* Git график */}
                <Grid item xs={12} sx={{width: '100%'}}>
                    <Paper
                        elevation={0}
                        sx={{
                            p: 2,
                            borderRadius: 2,
                            border: '1px solid',
                            borderColor: 'rgba(0, 0, 0, 0.08)',
                            backgroundColor: '#fafafa',
                        }}
                    >
                        <LineChartComponent/>
                    </Paper>
                </Grid>
            </Grid>

            {/* Секция Kaiten (пока с моковыми данными) */}
            <Typography variant="h5" sx={{fontWeight: 500, mb: 2, color: '#00a3ff', mt: 6}}>
                🎯 Kaiten активность (в разработке)
            </Typography>

            <Grid container spacing={3} sx={{mb: 4, opacity: 0.5, display: 'flex', justifyContent: 'space-between'}}>
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
                            backgroundColor: '#f0f0f0',
                            borderRadius: '50%',
                            width: 56,
                            height: 56,
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center'
                        }}>
                            <BugReportIcon sx={{color: '#00a3ff', fontSize: 28}}/>
                        </Box>
                        <Box>
                            <Typography variant="h4" sx={{fontWeight: 'bold', color: '#00a3ff'}}>
                                {totalDefects}
                            </Typography>
                            <Typography variant="body2" color="text.secondary">
                                Всего закрыто
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
                            backgroundColor: '#f0f0f0',
                            borderRadius: '50%',
                            width: 56,
                            height: 56,
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center'
                        }}>
                            <DoneAllIcon sx={{color: '#00a3ff', fontSize: 28}}/>
                        </Box>
                        <Box>
                            <Typography variant="h4" sx={{fontWeight: 'bold', color: '#00a3ff'}}>
                                {avgDefects}
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
                            backgroundColor: '#f0f0f0',
                            borderRadius: '50%',
                            width: 56,
                            height: 56,
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center'
                        }}>
                            <TodayIcon sx={{color: '#00a3ff', fontSize: 28}}/>
                        </Box>
                        <Box>
                            <Typography variant="h4" sx={{fontWeight: 'bold', color: '#00a3ff'}}>
                                {maxDefects}
                            </Typography>
                            <Typography variant="body2" color="text.secondary">
                                Максимум
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
                            backgroundColor: '#f0f0f0',
                            borderRadius: '50%',
                            width: 56,
                            height: 56,
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center'
                        }}>
                            <BugReportIcon sx={{color: '#00a3ff', fontSize: 28}}/>
                        </Box>
                        <Box>
                            <Typography variant="h4" sx={{fontWeight: 'bold', color: '#00a3ff'}}>
                                0
                            </Typography>
                            <Typography variant="body2" color="text.secondary">
                                Дней в периоде
                            </Typography>
                        </Box>
                    </Paper>
                </Grid>

                {/* Kaiten график (заглушка) */}
                <Grid item xs={12} sx={{width: '100%'}}>
                    <Paper
                        elevation={0}
                        sx={{
                            p: 2,
                            borderRadius: 2,
                            border: '1px solid',
                            borderColor: 'rgba(0, 0, 0, 0.08)',
                            backgroundColor: '#fafafa',
                            display: 'flex',
                            justifyContent: 'center',
                            alignItems: 'center',
                            height: 400
                        }}
                    >
                        <Typography color="text.secondary">
                            Данные по Kaiten скоро будут доступны
                        </Typography>
                    </Paper>
                </Grid>
            </Grid>
        </MainContainerComponent>
    );
};

export default MainPage;