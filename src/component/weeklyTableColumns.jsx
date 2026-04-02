import React from 'react';
import { Box, Tooltip, Typography, Chip, Avatar } from '@mui/material';
import PersonIcon from '@mui/icons-material/Person';
import MergeIcon from '@mui/icons-material/Merge';
import CodeIcon from '@mui/icons-material/Code';
import AddIcon from '@mui/icons-material/Add';
import DeleteIcon from '@mui/icons-material/Delete';
import ScienceIcon from '@mui/icons-material/Science';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';

// Конфигурация для tooltip
const tooltipConfig = {
    user: {
        bgcolor: '#f1c40f',
        color: '#333333',
        icon: PersonIcon,
        title: 'Пользователь',
        description: 'Email пользователя'
    },
    commits: {
        bgcolor: '#f1c40f',
        color: '#333333',
        icon: CodeIcon,
        title: 'Коммиты',
        description: 'Количество коммитов за неделю'
    },
    mergeCommits: {
        bgcolor: '#f1c40f',
        color: '#333333',
        icon: MergeIcon,
        title: 'Merge коммиты',
        description: 'Количество merge коммитов за неделю'
    },
    added: {
        bgcolor: '#4caf50',
        color: '#ffffff',
        icon: AddIcon,
        title: 'Добавлено',
        description: 'Количество добавленных строк кода'
    },
    deleted: {
        bgcolor: '#f44336',
        color: '#ffffff',
        icon: DeleteIcon,
        title: 'Удалено',
        description: 'Количество удаленных строк кода'
    },
    testAdded: {
        bgcolor: '#2196f3',
        color: '#ffffff',
        icon: ScienceIcon,
        title: 'Тесты',
        description: 'Количество строк кода в тестах'
    },
    net: {
        bgcolor: '#9c27b0',
        color: '#ffffff',
        icon: TrendingUpIcon,
        title: 'Net',
        description: 'Разница между добавленными и удаленными строками'
    },
    activityIndex: {
        bgcolor: '#f1c40f',
        color: '#333333',
        icon: TrendingUpIcon,
        title: 'Индекс активности',
        description: 'Отношение добавленных строк к количеству коммитов. Показывает "ценность" коммита.'
    }
};

const CustomHeader = ({ config }) => {
    const IconComponent = config.icon;
    return (
        <Tooltip
            title={
                <Box sx={{ p: 0.5 }}>
                    <Typography variant="body2" fontWeight="bold">{config.title}</Typography>
                    <Typography variant="caption">{config.description}</Typography>
                </Box>
            }
            arrow
            placement="top"
            componentsProps={{
                tooltip: {
                    sx: {
                        bgcolor: config.bgcolor,
                        color: config.color,
                        fontSize: '0.8rem',
                        fontWeight: 'bold',
                        maxWidth: 220,
                        '& .MuiTooltip-arrow': { color: config.bgcolor },
                    },
                },
            }}
        >
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <IconComponent fontSize="small" sx={{ color: config.bgcolor }} />
            </Box>
        </Tooltip>
    );
};

// Функция для получения цвета и текста индекса активности
const getActivityIndexInfo = (value) => {
    if (value < 20) {
        return {
            color: '#f44336',
            bgColor: 'rgba(244, 67, 54, 0.1)',
            label: 'Низкая',
            icon: '🔴'
        };
    }
    if (value >= 20 && value < 40) {
        return {
            color: '#ff9800',
            bgColor: 'rgba(255, 152, 0, 0.1)',
            label: 'Средняя',
            icon: '🟡'
        };
    }
    if (value >= 40 && value < 60) {
        return {
            color: '#4caf50',
            bgColor: 'rgba(76, 175, 80, 0.1)',
            label: 'Хорошая',
            icon: '🟢'
        };
    }
    if (value >= 60) {
        return {
            color: '#9c27b0',
            bgColor: 'rgba(156, 39, 176, 0.1)',
            label: 'Легендарная',
            icon: '💎'
        };
    }
    return {
        color: '#999',
        bgColor: 'rgba(153, 153, 153, 0.1)',
        label: 'Нет данных',
        icon: '⚪'
    };
};

export const getWeeklyUserColumns = () => [
    {
        accessorKey: 'email',
        header: '',
        size: 220,
        Header: () => <CustomHeader config={tooltipConfig.user} />,
        Cell: ({ cell }) => (
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <Avatar sx={{ width: 32, height: 32, bgcolor: '#f1c40f', fontSize: '0.9rem' }}>
                    {cell.getValue()?.charAt(0).toUpperCase()}
                </Avatar>
                <Typography fontWeight="bold" sx={{ fontSize: '0.95rem' }}>
                    {cell.getValue()}
                </Typography>
            </Box>
        ),
    },
    {
        accessorKey: 'commits',
        header: '',
        size: 80,
        muiTableBodyCellProps: { align: 'center' },
        Cell: ({ cell }) => (
            <Chip
                label={cell.getValue()}
                size="small"
                sx={{
                    backgroundColor: '#f1c40f',
                    color: '#333333',
                    fontWeight: 'bold',
                    minWidth: 50
                }}
            />
        ),
        Header: () => <CustomHeader config={tooltipConfig.commits} />,
    },
    {
        accessorKey: 'mergeCommits',
        header: '',
        size: 70,
        muiTableBodyCellProps: { align: 'center' },
        Header: () => <CustomHeader config={tooltipConfig.mergeCommits} />,
    },
    {
        accessorKey: 'addedLines',
        header: '',
        size: 80,
        muiTableBodyCellProps: { align: 'center', sx: { color: '#4caf50', fontWeight: 'bold' } },
        Cell: ({ cell }) => `+${cell.getValue()}`,
        Header: () => <CustomHeader config={tooltipConfig.added} />,
    },
    {
        accessorKey: 'deletedLines',
        header: '',
        size: 80,
        muiTableBodyCellProps: { align: 'center', sx: { color: '#f44336', fontWeight: 'bold' } },
        Cell: ({ cell }) => `-${cell.getValue()}`,
        Header: () => <CustomHeader config={tooltipConfig.deleted} />,
    },
    {
        accessorKey: 'testAddedLines',
        header: '',
        size: 70,
        muiTableBodyCellProps: { align: 'center', sx: { color: '#2196f3', fontWeight: 'bold' } },
        Header: () => <CustomHeader config={tooltipConfig.testAdded} />,
    },
    {
        accessorKey: 'net',
        header: '',
        size: 80,
        muiTableBodyCellProps: { align: 'center', sx: { fontWeight: 'bold' } },
        Cell: ({ cell }) => {
            const value = cell.getValue();
            return (
                <Typography sx={{ color: value >= 0 ? '#4caf50' : '#f44336' }}>
                    {value >= 0 ? `+${value}` : `${value}`}
                </Typography>
            );
        },
        Header: () => <CustomHeader config={tooltipConfig.net} />,
    },
    {
        accessorKey: 'activityIndex',
        header: '',
        size: 100,
        muiTableBodyCellProps: { align: 'center' },
        Header: () => <CustomHeader config={tooltipConfig.activityIndex} />,
        Cell: ({ row }) => {
            const commits = row.original.commits;
            const addedLines = row.original.addedLines;

            // Рассчитываем индекс активности (добавленные строки / количество коммитов)
            let activityIndex = 0;
            if (commits > 0) {
                activityIndex = Math.round(addedLines / commits);
            }

            const info = getActivityIndexInfo(activityIndex);

            return (
                <Tooltip title={`${info.label} активность: ${activityIndex} строк/коммит`} arrow>
                    <Chip
                        label={`${info.icon} ${activityIndex}`}
                        size="small"
                        sx={{
                            backgroundColor: info.bgColor,
                            color: info.color,
                            fontWeight: 'bold',
                            minWidth: 80,
                            border: `1px solid ${info.color}`,
                        }}
                    />
                </Tooltip>
            );
        },
    },
];