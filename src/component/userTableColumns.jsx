import React from 'react';
import { Box, Tooltip, Typography, Chip } from '@mui/material';
import PersonIcon from '@mui/icons-material/Person';
import MergeIcon from '@mui/icons-material/Merge';
import CodeIcon from '@mui/icons-material/Code';
import AddIcon from '@mui/icons-material/Add';
import DeleteIcon from '@mui/icons-material/Delete';
import ScienceIcon from '@mui/icons-material/Science';
import TodayIcon from '@mui/icons-material/Today';

// Конфигурация для tooltip
const tooltipConfig = {
    user: {
        bgcolor: '#f1c40f',
        color: '#333333',
        icon: PersonIcon,
        title: 'Пользователь',
        description: 'Email пользователя'
    },
    totalCommits: {
        bgcolor: '#f1c40f',
        color: '#333333',
        icon: CodeIcon,
        title: 'Всего коммитов',
        description: 'Общее количество коммитов (включая merge)'
    },
    mergeCommits: {
        bgcolor: '#f1c40f',
        color: '#333333',
        icon: MergeIcon,
        title: 'Merge коммиты',
        description: 'Количество коммитов слияния'
    },
    added: {
        bgcolor: '#4caf50',
        color: '#ffffff',
        icon: AddIcon,
        title: 'Всего добавлено',
        description: 'Общее количество добавленных строк кода'
    },
    deleted: {
        bgcolor: '#f44336',
        color: '#ffffff',
        icon: DeleteIcon,
        title: 'Всего удалено',
        description: 'Общее количество удаленных строк кода'
    },
    testAdded: {
        bgcolor: '#2196f3',
        color: '#ffffff',
        icon: ScienceIcon,
        title: 'Строк тестов добавлено',
        description: 'Количество строк кода в тестах'
    },
    daysActive: {
        bgcolor: '#9c27b0',
        color: '#ffffff',
        icon: TodayIcon,
        title: 'Дней активно',
        description: 'Количество дней, когда были коммиты'
    }
};

// Компонент для кастомного заголовка с иконкой и tooltip
const CustomHeader = ({ config }) => {
    const IconComponent = config.icon;

    return (
        <Tooltip
            title={
                <Box sx={{ p: 0.5 }}>
                    <Typography variant="body2" fontWeight="bold">
                        {config.title}
                    </Typography>
                    <Typography variant="caption">
                        {config.description}
                    </Typography>
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
                        '& .MuiTooltip-arrow': {
                            color: config.bgcolor,
                        },
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

// Конфигурация колонок для таблицы пользователей
export const getUserColumns = () => [
    {
        accessorKey: 'email',
        header: '',
        size: 200,
        Cell: ({ cell }) => (
            <Typography fontWeight="bold" sx={{ fontSize: '0.95rem' }}>
                {cell.getValue()}
            </Typography>
        ),
        Header: () => <CustomHeader config={tooltipConfig.user} />,
    },
    {
        accessorKey: 'totalCommits',
        header: '',
        size: 80,
        muiTableBodyCellProps: {
            align: 'center',
        },
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
        Header: () => <CustomHeader config={tooltipConfig.totalCommits} />,
    },
    {
        accessorKey: 'totalMergeCommits',
        header: '',
        size: 70,
        muiTableBodyCellProps: {
            align: 'center',
        },
        Header: () => <CustomHeader config={tooltipConfig.mergeCommits} />,
    },
    {
        accessorKey: 'totalAddedLines',
        header: '',
        size: 80,
        muiTableBodyCellProps: {
            align: 'center',
            sx: { color: '#4caf50', fontWeight: 'bold' }
        },
        Cell: ({ cell }) => `+${cell.getValue()}`,
        Header: () => <CustomHeader config={tooltipConfig.added} />,
    },
    {
        accessorKey: 'totalDeletedLines',
        header: '',
        size: 80,
        muiTableBodyCellProps: {
            align: 'center',
            sx: { color: '#f44336', fontWeight: 'bold' }
        },
        Cell: ({ cell }) => `-${cell.getValue()}`,
        Header: () => <CustomHeader config={tooltipConfig.deleted} />,
    },
    {
        accessorKey: 'totalTestAddedLines',
        header: '',
        size: 70,
        muiTableBodyCellProps: {
            align: 'center',
            sx: { color: '#2196f3', fontWeight: 'bold' }
        },
        Header: () => <CustomHeader config={tooltipConfig.testAdded} />,
    },
    {
        accessorKey: 'daysActive',
        header: '',
        size: 80,
        muiTableBodyCellProps: {
            align: 'center',
        },
        Header: () => <CustomHeader config={tooltipConfig.daysActive} />,
    },
];