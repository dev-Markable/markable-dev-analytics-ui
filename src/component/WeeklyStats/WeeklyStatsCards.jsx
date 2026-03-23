import React from 'react';
import {Box, Grid, Paper, Typography } from '@mui/material';
import ShowChartIcon from '@mui/icons-material/ShowChart';
import MergeIcon from '@mui/icons-material/Merge';
import AddIcon from '@mui/icons-material/Add';
import DeleteIcon from '@mui/icons-material/Delete';
import ScienceIcon from '@mui/icons-material/Science';

const StatCard = ({ title, value, icon: Icon, color, bgColor }) => (
    <Paper
        elevation={0}
        sx={{
            p: 2,
            borderRadius: 2,
            border: '1px solid rgba(0, 0, 0, 0.08)',
            backgroundColor: '#fafafa',
            display: 'flex',
            alignItems: 'center',
            gap: 2
        }}
    >
        <Box sx={{
            backgroundColor: bgColor || 'rgba(241, 196, 15, 0.1)',
            borderRadius: '50%',
            width: 48,
            height: 48,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
        }}>
            <Icon sx={{ color: color || '#f1c40f', fontSize: 24 }} />
        </Box>
        <Box>
            <Typography variant="h5" sx={{ fontWeight: 'bold', color: color || '#f1c40f' }}>
                {value}
            </Typography>
            <Typography variant="body2" color="text.secondary">{title}</Typography>
        </Box>
    </Paper>
);

const WeeklyStatsCards = ({ week }) => {
    return (
        <Grid container spacing={2} sx={{ mb: 3, display: 'flex', justifyContent: 'space-between'}}>
            <Grid item xs={6} md={2.4}>
                <StatCard title="Всего коммитов" value={week.totalCommits} icon={ShowChartIcon} color="#2ea043" />
            </Grid>
            <Grid item xs={6} md={2.4}>
                <StatCard title="Merge коммиты" value={week.totalMergeCommits} icon={MergeIcon} color="#f1c40f" />
            </Grid>
            <Grid item xs={6} md={2.4}>
                <StatCard title="Добавлено строк" value={`+${week.totalAddedLines}`} icon={AddIcon} color="#4caf50" />
            </Grid>
            <Grid item xs={6} md={2.4}>
                <StatCard title="Удалено строк" value={`-${week.totalDeletedLines}`} icon={DeleteIcon} color="#f44336" />
            </Grid>
            <Grid item xs={6} md={2.4}>
                <StatCard title="Строк тестов" value={week.totalTestAddedLines} icon={ScienceIcon} color="#2196f3" />
            </Grid>
        </Grid>
    );
};

export default WeeklyStatsCards;