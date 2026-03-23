import React from 'react';
import { Box, Tooltip, Typography, Chip } from '@mui/material';
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

export const getWeeklyUserColumns = () => [
    {
        accessorKey: 'email',
        header: '',
        size: 220,
        Header: () => <CustomHeader config={tooltipConfig.user} />,
        Cell: ({ cell }) => (
            <Typography fontWeight="bold" sx={{ fontSize: '0.95rem' }}>
                {cell.getValue()}
            </Typography>
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
];