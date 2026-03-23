import React, { useMemo, useState } from 'react';
import {
    MaterialReactTable,
    useMaterialReactTable,
} from 'material-react-table';
import { MRT_Localization_RU } from 'material-react-table/locales/ru';
import { Box, Chip, IconButton, Collapse, Typography, Table, TableBody, TableCell, TableHead, TableRow } from '@mui/material';
import KeyboardArrowDownIcon from '@mui/icons-material/KeyboardArrowDown';
import KeyboardArrowUpIcon from '@mui/icons-material/KeyboardArrowUp';
import { useUserStats } from '../hooks/useUserStats';

// Компонент детализации
const DetailPanel = ({ row }) => {
    const [open, setOpen] = useState(false);
    const user = row.original;

    return (
        <Box sx={{ width: '100%' }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
                <IconButton size="small" onClick={() => setOpen(!open)}>
                    {open ? <KeyboardArrowUpIcon /> : <KeyboardArrowDownIcon />}
                </IconButton>
                <Typography variant="subtitle2">
                    Детализация по дням для {user.email}
                </Typography>
            </Box>

            <Collapse in={open} timeout="auto" unmountOnExit>
                <Box sx={{ ml: 4, mr: 2, mb: 2 }}>
                    <Table size="small" sx={{ backgroundColor: '#f8f9fa' }}>
                        <TableHead>
                            <TableRow>
                                <TableCell>Дата</TableCell>
                                <TableCell align="center">Коммиты</TableCell>
                                <TableCell align="center">Merge</TableCell>
                                <TableCell align="center">Добавлено</TableCell>
                                <TableCell align="center">Удалено</TableCell>
                                <TableCell align="center">Тесты</TableCell>
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {user.details.map((day) => (
                                <TableRow key={day.date}>
                                    <TableCell>
                                        {new Date(day.date).toLocaleDateString('ru-RU')}
                                    </TableCell>
                                    <TableCell align="center">{day.commits}</TableCell>
                                    <TableCell align="center">{day.mergeCommits}</TableCell>
                                    <TableCell align="center" sx={{ color: '#2ea043' }}>
                                        +{day.addedLines}
                                    </TableCell>
                                    <TableCell align="center" sx={{ color: '#f44336' }}>
                                        -{day.deletedLines}
                                    </TableCell>
                                    <TableCell align="center" sx={{ color: '#2196f3' }}>
                                        {day.testAddedLines}
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </Box>
            </Collapse>
        </Box>
    );
};

const UserStatsMaterialTable = () => {
    const { data, loading, error } = useUserStats();

    const columns = useMemo(
        () => [
            {
                accessorKey: 'email',
                header: 'Пользователь',
                size: 250,
                Cell: ({ cell }) => (
                    <Typography fontWeight="medium">
                        {cell.getValue()}
                    </Typography>
                ),
            },
            {
                accessorKey: 'totalCommits',
                header: 'Коммиты',
                size: 100,
                muiTableBodyCellProps: {
                    align: 'center',
                },
                Cell: ({ cell }) => (
                    <Chip
                        label={cell.getValue()}
                        size="small"
                        sx={{ backgroundColor: '#2ea043', color: 'white', minWidth: 50 }}
                    />
                ),
            },
            {
                accessorKey: 'totalMergeCommits',
                header: 'Merge',
                size: 80,
                muiTableBodyCellProps: {
                    align: 'center',
                },
            },
            {
                accessorKey: 'totalAddedLines',
                header: 'Добавлено',
                size: 100,
                muiTableBodyCellProps: {
                    align: 'center',
                    sx: { color: '#2ea043', fontWeight: 'bold' }
                },
                Cell: ({ cell }) => `+${cell.getValue()}`,
            },
            {
                accessorKey: 'totalDeletedLines',
                header: 'Удалено',
                size: 100,
                muiTableBodyCellProps: {
                    align: 'center',
                    sx: { color: '#f44336', fontWeight: 'bold' }
                },
                Cell: ({ cell }) => `-${cell.getValue()}`,
            },
            {
                accessorKey: 'totalTestAddedLines',
                header: 'Тесты',
                size: 80,
                muiTableBodyCellProps: {
                    align: 'center',
                    sx: { color: '#2196f3', fontWeight: 'bold' }
                },
            },
            {
                accessorKey: 'daysActive',
                header: 'Дней активно',
                size: 100,
                muiTableBodyCellProps: {
                    align: 'center',
                },
            },
        ],
        [],
    );

    const table = useMaterialReactTable({
        columns,
        data: data || [],
        initialState: {
            sorting: [
                { id: 'totalCommits', desc: true },
            ],
            pagination: { pageIndex: 0, pageSize: 10 },
        },
        localization: MRT_Localization_RU,
        enableExpanding: true,
        renderDetailPanel: ({ row }) => <DetailPanel row={row} />,
        positionExpandColumn: 'last',
        expandAllMode: false, // разрешаем раскрывать только одну строку за раз
        muiTableBodyCellProps: {
            sx: {
                fontSize: '0.9rem',
            },
        },
        muiTableHeadCellProps: {
            sx: {
                fontWeight: 'bold',
                backgroundColor: '#f5f5f5',
            },
        },
        muiTablePaperProps: {
            elevation: 0,
            sx: {
                border: '1px solid rgba(0, 0, 0, 0.08)',
                borderRadius: 2,
            },
        },
        // Поиск и фильтрация
        enableGlobalFilter: true,
        enableColumnFilters: true,
        enableSorting: true,
        // Кастомизация тулбара
        renderTopToolbarCustomActions: () => (
            <Box sx={{ p: 1 }}>
                <Typography variant="body2" color="text.secondary">
                    👥 Всего пользователей: {data?.length || 0}
                </Typography>
            </Box>
        ),
        // Состояния загрузки/ошибки
        state: {
            isLoading: loading,
            showAlertBanner: !!error,
        },
        muiToolbarAlertBannerProps: error ? {
            color: 'error',
            children: error,
        } : undefined,
    });

    if (error) {
        return (
            <Box sx={{ p: 3, textAlign: 'center' }}>
                <Typography color="error">Ошибка загрузки: {error}</Typography>
            </Box>
        );
    }

    return <MaterialReactTable table={table} />;
};

export default UserStatsMaterialTable;