import React, { useMemo, useState } from "react";
import {
    MaterialReactTable,
    useMaterialReactTable,
} from 'material-react-table';
import { MRT_Localization_RU } from 'material-react-table/locales/ru';
import {
    Box,
    Typography,
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableRow,
    Collapse,
    Chip,
    Avatar
} from '@mui/material';
import Button from "@mui/material/Button";
import FileDownloadIcon from '@mui/icons-material/FileDownload';
import { mkConfig, generateCsv, download } from 'export-to-csv';
import { getCommitsColumns } from './commitsTableColumns';
import PersonIcon from '@mui/icons-material/Person';

const csvConfig = mkConfig({
    fieldSeparator: ',',
    decimalSeparator: '.',
    useKeysAsHeaders: true,
});

// Компонент детализации по пользователям
const UserDetailsPanel = ({ row }) => {
    const dayData = row.original;
    const [open, setOpen] = useState(true);

    if (!dayData.details || dayData.details.length === 0) {
        return (
            <Collapse in={open} timeout="auto">
                <Box sx={{ p: 3, backgroundColor: '#f8f9fa', textAlign: 'center' }}>
                    <Typography color="text.secondary">
                        Нет данных по пользователям за этот день
                    </Typography>
                </Box>
            </Collapse>
        );
    }

    return (
        <Collapse in={open} timeout="auto">
            <Box sx={{ p: 3, backgroundColor: '#f8f9fa' }}>
                <Typography variant="subtitle1" sx={{ mb: 2, fontWeight: 'bold', color: '#333' }}>
                    👥 Активность пользователей {new Date(dayData.date).toLocaleDateString('ru-RU')}
                </Typography>

                <Table size="small" sx={{ backgroundColor: 'white' }}>
                    <TableHead>
                        <TableRow sx={{ backgroundColor: '#f0f0f0' }}>
                            <TableCell>Пользователь</TableCell>
                            <TableCell align="center">Коммиты</TableCell>
                            <TableCell align="center">Merge</TableCell>
                            <TableCell align="center">Добавлено</TableCell>
                            <TableCell align="center">Удалено</TableCell>
                            <TableCell align="center">Тесты</TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {dayData.details.map((user) => (
                            <TableRow key={user.email} hover>
                                <TableCell>
                                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                        <Typography variant="body2">{user.email}</Typography>
                                    </Box>
                                </TableCell>
                                <TableCell align="center">
                                    <Chip
                                        label={user.commits}
                                        size="small"
                                        sx={{ backgroundColor: '#f1c40f', color: '#333', minWidth: 40 }}
                                    />
                                </TableCell>
                                <TableCell align="center">{user.mergeCommits}</TableCell>
                                <TableCell align="center" sx={{ color: '#4caf50' }}>
                                    +{user.addedLines}
                                </TableCell>
                                <TableCell align="center" sx={{ color: '#f44336' }}>
                                    -{user.deletedLines}
                                </TableCell>
                                <TableCell align="center" sx={{ color: '#2196f3' }}>
                                    {user.testAddedLines}
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>

                {/* Итоги по дню */}
                <Box sx={{ mt: 2, display: 'flex', gap: 2, justifyContent: 'flex-end' }}>
                    <Typography variant="caption" sx={{ color: '#666' }}>
                        Всего пользователей: {dayData.details.length}
                    </Typography>
                    <Typography variant="caption" sx={{ color: '#f1c40f' }}>
                        Коммитов: {dayData.totalCommits}
                    </Typography>
                </Box>
            </Box>
        </Collapse>
    );
};

const CommitsTable = ({ data = [], loading = false }) => {
    const columns = useMemo(() => getCommitsColumns(), []);

    const handleExportData = () => {
        if (data.length === 0) {
            alert('Нет данных для экспорта');
            return;
        }

        // Экспортируем агрегированные данные
        const exportData = data.map(item => ({
            date: new Date(item.date).toLocaleDateString('ru-RU'),
            commits: item.totalCommits,
            mergeCommits: item.totalMergeCommits,
            addedLines: item.totalAddedLines,
            deletedLines: item.totalDeletedLines,
            testAddedLines: item.totalTestAddedLines,
            activeUsers: item.details?.length || 0
        }));

        const csv = generateCsv(csvConfig)(exportData);
        download(csvConfig)(csv);
    };

    const handleExportUserDetails = (dayData) => {
        if (!dayData.details || dayData.details.length === 0) {
            alert('Нет детальных данных для экспорта');
            return;
        }

        const exportData = dayData.details.map(user => ({
            date: new Date(dayData.date).toLocaleDateString('ru-RU'),
            email: user.email,
            commits: user.commits,
            mergeCommits: user.mergeCommits,
            addedLines: user.addedLines,
            deletedLines: user.deletedLines,
            testAddedLines: user.testAddedLines
        }));

        const csv = generateCsv(csvConfig)(exportData);
        download(csvConfig)(csv);
    };

    const table = useMaterialReactTable({
        columns,
        data,
        initialState: {
            sorting: [
                { id: 'date', desc: true },
            ],
            pagination: { pageIndex: 0, pageSize: 15 },
        },
        localization: MRT_Localization_RU,

        // Настройки детализации
        enableExpanding: true,
        renderDetailPanel: ({ row }) => <UserDetailsPanel row={row} />,
        positionExpandColumn: 'last',

        muiTableBodyRowProps: ({ row }) => ({
            onClick: () => row.toggleExpanded(),
            sx: {
                cursor: 'pointer',
                '&:hover': {
                    backgroundColor: 'rgba(241, 196, 15, 0.05)',
                },
            },
        }),

        muiTableBodyCellProps: {
            sx: {
                fontSize: '0.95rem',
                py: 1.5,
            },
        },

        muiTableHeadCellProps: {
            align: 'center',
            sx: {
                fontWeight: 'bold',
                py: 1.5,
            },
        },

        muiTopToolbarProps: {
            sx: {
                '& .MuiIconButton-root': {
                    '&:hover': {
                        color: '#f1c40f',
                    },
                },
            },
        },

        muiTablePaperProps: {
            elevation: 0,
            sx: {
                boxShadow: 'none',
                border: 'none',
                overflow: 'hidden',
            }
        },

        enableGlobalFilter: true,
        enableColumnFilters: true,
        enableSorting: true,

        renderTopToolbarCustomActions: () => (
            <Box sx={{ display: 'flex', gap: '16px', padding: '8px', flexWrap: 'wrap', alignItems: 'center' }}>
                <Button
                    sx={{
                        textTransform: 'none',
                        color: '#333333',
                        '&:hover': {
                            backgroundColor: 'rgba(241, 196, 15, 0.1)',
                        },
                    }}
                    onClick={handleExportData}
                    startIcon={
                        <FileDownloadIcon
                            sx={{
                                color: 'rgba(241, 196, 15, 1)',
                            }}
                        />
                    }
                >
                    Скачать статистику
                </Button>

                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                    <Typography variant="body2" sx={{ color: '#666' }}>
                        Всего дней: {data.length}
                    </Typography>
                </Box>
            </Box>
        ),

        state: {
            isLoading: loading,
        },
    });

    return <MaterialReactTable table={table} />;
};

export default CommitsTable;