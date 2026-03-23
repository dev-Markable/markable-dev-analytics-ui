import React from 'react';
import MainContainerComponent from '../component/container/MainContainerComponent.jsx';
import UserStatsTable from '../component/UserStatsTable.jsx';
import {Box, Typography, Paper, Grid} from '@mui/material';
import {useUserStats} from '../hooks/useUserStats';
import PersonIcon from '@mui/icons-material/Person';
import CodeIcon from '@mui/icons-material/Code';
import AddIcon from '@mui/icons-material/Add';
import DeleteIcon from '@mui/icons-material/Delete';

const UserStatsPage = () => {
    const {data} = useUserStats();

    // Считаем общую статистику
    const totalUsers = data.length;
    const totalCommits = data.reduce((sum, user) => sum + user.totalCommits, 0);
    const totalAdded = data.reduce((sum, user) => sum + user.totalAddedLines, 0);
    const totalDeleted = data.reduce((sum, user) => sum + user.totalDeletedLines, 0);

    return (
        <MainContainerComponent>
            <Box sx={{p: 3}}>
                {/* Карточки с общей статистикой */}
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
                                backgroundColor: 'rgba(241, 196, 15, 0.1)',
                                borderRadius: '50%',
                                width: 56,
                                height: 56,
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center'
                            }}>
                                <PersonIcon sx={{color: '#f1c40f', fontSize: 28}}/>
                            </Box>
                            <Box>
                                <Typography variant="h4" sx={{fontWeight: 'bold', color: '#f1c40f'}}>
                                    {totalUsers}
                                </Typography>
                                <Typography variant="body2" color="text.secondary">
                                    Пользователей
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
                                <CodeIcon sx={{color: '#f1c40f', fontSize: 28}}/>
                            </Box>
                            <Box>
                                <Typography variant="h4" sx={{fontWeight: 'bold', color: '#f1c40f'}}>
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
                                backgroundColor: 'rgba(76, 175, 80, 0.1)',
                                borderRadius: '50%',
                                width: 56,
                                height: 56,
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center'
                            }}>
                                <AddIcon sx={{color: '#4caf50', fontSize: 28}}/>
                            </Box>
                            <Box>
                                <Typography variant="h4" sx={{fontWeight: 'bold', color: '#4caf50'}}>
                                    +{totalAdded}
                                </Typography>
                                <Typography variant="body2" color="text.secondary">
                                    Добавлено строк
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
                                backgroundColor: 'rgba(244, 67, 54, 0.1)',
                                borderRadius: '50%',
                                width: 56,
                                height: 56,
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center'
                            }}>
                                <DeleteIcon sx={{color: '#f44336', fontSize: 28}}/>
                            </Box>
                            <Box>
                                <Typography variant="h4" sx={{fontWeight: 'bold', color: '#f44336'}}>
                                    -{totalDeleted}
                                </Typography>
                                <Typography variant="body2" color="text.secondary">
                                    Удалено строк
                                </Typography>
                            </Box>
                        </Paper>
                    </Grid>
                </Grid>
                {/* Таблица */}
                <UserStatsTable/>
            </Box>
        </MainContainerComponent>
    );
};

export default UserStatsPage;