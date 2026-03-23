import React from 'react';
import { Box, Tooltip, Typography } from '@mui/material';
import CalendarMonthIcon from '@mui/icons-material/CalendarMonth';
import MergeIcon from '@mui/icons-material/Merge';
import CodeIcon from '@mui/icons-material/Code';
import AddIcon from '@mui/icons-material/Add';
import DeleteIcon from '@mui/icons-material/Delete';
import ScienceIcon from '@mui/icons-material/Science';

// Конфигурация для tooltip
const tooltipConfig = {
    date: {
        bgcolor: '#f1c40f',
        color: '#333333',
        icon: CalendarMonthIcon,
        title: 'Дата',
        description: 'Дата коммитов'
    },
    commits: {
        bgcolor: '#f1c40f',
        color: '#333333',
        icon: CodeIcon,
        title: 'Коммиты',
        description: 'Общее количество коммитов за день'
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
        title: 'Строк добавленно',
        description: 'Количество добавленных строк кода'
    },
    deleted: {
        bgcolor: '#f44336',
        color: '#ffffff',
        icon: DeleteIcon,
        title: 'Строк удалено',
        description: 'Количество удаленных строк кода'
    },
    testAdded: {
        bgcolor: '#2196f3',
        color: '#ffffff',
        icon: ScienceIcon,
        title: 'Строк тестов добавленно',
        description: 'Количество строк кода в тестах'
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

// Конфигурация колонок для таблицы коммитов
export const getCommitsColumns = () => [
    {
        accessorKey: 'date',
        header: '',
        size: 120,
        muiTableBodyCellProps: {
            sx: {
                fontWeight: 'bold',
            }
        },
        Cell: ({ cell }) => {
            const date = new Date(cell.getValue());
            return date.toLocaleDateString('ru-RU');
        },
        Header: () => <CustomHeader config={tooltipConfig.date} />,
    },
    {
        accessorKey: 'totalCommits',
        header: '',
        size: 80,
        muiTableBodyCellProps: {
            align: 'center',
        },
        Header: () => <CustomHeader config={tooltipConfig.commits} />,
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
        size: 80,
        muiTableBodyCellProps: {
            align: 'center',
            sx: { color: '#2196f3', fontWeight: 'bold' }
        },
        Header: () => <CustomHeader config={tooltipConfig.testAdded} />,
    },
];