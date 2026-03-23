import React from 'react';
import {Grid, Paper, Typography, Box} from '@mui/material';
import ShowChartIcon from '@mui/icons-material/ShowChart';
import MergeIcon from '@mui/icons-material/Merge';
import AddIcon from '@mui/icons-material/Add';
import DeleteIcon from '@mui/icons-material/Delete';
import ScienceIcon from '@mui/icons-material/Science';
import TodayIcon from '@mui/icons-material/Today';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';

const StatCard = ({title, value, icon: Icon, color, bgColor, subtitle}) => (
    <Paper
        elevation={0}
        sx={{
            p: 2.5,
            borderRadius: 2,
            border: '1px solid rgba(0, 0, 0, 0.08)',
            backgroundColor: '#fafafa',
            display: 'flex',
            alignItems: 'center',
            gap: 2,
            height: '100%',
            minHeight: 120
        }}
    >
        <Box sx={{
            backgroundColor: bgColor || 'rgba(46, 160, 67, 0.1)',
            borderRadius: '50%',
            width: 48,
            height: 48,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            flexShrink: 0
        }}>
            <Icon sx={{color: color || '#2ea043', fontSize: 26}}/>
        </Box>
        <Box sx={{flex: 1}}>
            <Typography variant="h4" sx={{fontWeight: 'bold', color: color || '#2ea043', lineHeight: 1.2}}>
                {value}
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{mt: 0.5}}>
                {title}
            </Typography>
            {subtitle && (
                <Typography variant="caption" color="text.secondary" sx={{mt: 0.5, display: 'block'}}>
                    {subtitle}
                </Typography>
            )}
        </Box>
    </Paper>
);

const StatsCards = ({profile}) => {
    if (!profile) return null;

    const peakDayEntry = Object.entries(profile.activityByDay || {})
        .sort((a, b) => b[1] - a[1])[0];

    const stats = [
        {
            title: "Всего коммитов",
            value: profile.totalCommits || 0,
            icon: ShowChartIcon,
            color: "#2ea043"
        },
        {
            title: "Merge коммиты",
            value: profile.totalMergeCommits || 0,
            icon: MergeIcon,
            color: "#f1c40f",
            bgColor: "rgba(241, 196, 15, 0.1)"
        },
        {
            title: "Добавлено строк",
            value: `+${profile.totalAddedLines || 0}`,
            icon: AddIcon,
            color: "#4caf50",
            bgColor: "rgba(76, 175, 80, 0.1)"
        },
        {
            title: "Удалено строк",
            value: `-${profile.totalDeletedLines || 0}`,
            icon: DeleteIcon,
            color: "#f44336",
            bgColor: "rgba(244, 67, 54, 0.1)"
        },
        {
            title: "Тестов добавлено",
            value: profile.totalTestAddedLines || 0,
            icon: ScienceIcon,
            color: "#2196f3",
            bgColor: "rgba(33, 150, 243, 0.1)"
        },
        {
            title: "Активных дней",
            value: `${profile.activeDays || 0} / ${profile.totalDays || 0}`,
            icon: TodayIcon,
            color: "#9c27b0",
            bgColor: "rgba(156, 39, 176, 0.1)",
            subtitle: `${(profile.avgCommitsPerDay || 0).toFixed(1)} коммитов/день`
        },
        {
            title: "Пик активности",
            value: peakDayEntry ? peakDayEntry[0] : "нет данных",
            icon: TrendingUpIcon,
            color: "#ff9800",
            bgColor: "rgba(255, 152, 0, 0.1)",
            subtitle: peakDayEntry ? `${peakDayEntry[1]} коммитов` : ""
        }
    ];

    return (
        <Grid container spacing={2}
              sx={{mb: 4, display: 'flex', alignItems: 'center', justifyContent: 'center'}}>
            {stats.map((stat, idx) => (
                <StatCard {...stat} />
            ))}
        </Grid>
    );
};

export default StatsCards;