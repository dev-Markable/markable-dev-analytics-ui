import React from 'react';
import { Box, Tooltip, Typography } from '@mui/material';
import PersonIcon from '@mui/icons-material/Person';
import MergeIcon from '@mui/icons-material/Merge';
import CodeIcon from '@mui/icons-material/Code';
import AddIcon from '@mui/icons-material/Add';
import DeleteIcon from '@mui/icons-material/Delete';
import ScienceIcon from '@mui/icons-material/Science';

// Конфигурация для tooltip
const tooltipConfig = {
    user: {
        bgcolor: '#f1c40f',
        color: '#333333',
        icon: PersonIcon,
        title: 'Пользователь',
        description: 'Email пользователя scm'
    },
    mergeCommits: {
        bgcolor: '#f1c40f',
        color: '#333333',
        icon: MergeIcon,
        title: 'Merge коммиты',
        description: 'Количество коммитов, которые являются слияниями веток'
    },
    commits: {
        bgcolor: '#f1c40f',
        color: '#333333',
        icon: CodeIcon,
        title: 'Коммиты',
        description: 'Количество коммитов (не включая merge коммиты)'
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
        description: 'Количество строк кода, добавленных в тестовых файлах'
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

// Конфигурация колонок
export const getColumns = () => [
    {
        accessorKey: 'email',
        header: '',
        size: 180,
        muiTableBodyCellProps: {
            sx: {
                fontWeight: 'bold',
            }
        },
        Header: () => <CustomHeader config={tooltipConfig.user} />,
    },
    {
        accessorKey: 'mergeCommits',
        header: '',
        size: 10,
        Header: () => <CustomHeader config={tooltipConfig.mergeCommits} />,
    },
    {
        accessorKey: 'commits',
        header: '',
        size: 10,
        Header: () => <CustomHeader config={tooltipConfig.commits} />,
    },
    {
        accessorKey: 'added',
        header: '',
        size: 10,
        muiTableBodyCellProps: {
            sx: {
                color: '#4caf50',
            }
        },
        Header: () => <CustomHeader config={tooltipConfig.added} />,
    },
    {
        accessorKey: 'deleted',
        header: '',
        size: 10,
        muiTableBodyCellProps: {
            sx: {
                color: '#f44336',
            }
        },
        Header: () => <CustomHeader config={tooltipConfig.deleted} />,
    },
    {
        accessorKey: 'testAdded',
        header: '',
        size: 10,
        muiTableBodyCellProps: {
            sx: {
                color: '#2196f3',
            }
        },
        Header: () => <CustomHeader config={tooltipConfig.testAdded} />,
    },
];