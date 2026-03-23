import React, { useMemo, useState } from 'react';
import {
    MaterialReactTable,
    useMaterialReactTable,
} from 'material-react-table';
import { MRT_Localization_RU } from 'material-react-table/locales/ru';
import {
    Box,
    Paper,
    Typography,
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableRow,
    Collapse
} from '@mui/material';
import { mkConfig, generateCsv, download } from 'export-to-csv';
import { getUserColumns } from './userTableColumns';
import { useUserStats } from '../hooks/useUserStats';
import FileDownloadIcon from '@mui/icons-material/FileDownload';
import Button from "@mui/material/Button";

const csvConfig = mkConfig({
    fieldSeparator: ',',
    decimalSeparator: '.',
    useKeysAsHeaders: true,
});

// Компонент детализации (открывается сразу при клике на строку)
const DetailPanel = ({ row }) => {
    const user = row.original;
    const [open, setOpen] = useState(true); // всегда открыто при рендере

    return (
        <Collapse in={open} timeout="auto">
            <Box sx={{ p: 3, backgroundColor: '#f8f9fa' }}>
                <Typography variant="subtitle1" sx={{ mb: 2, fontWeight: 'bold', color: '#333' }}>
                    Детализация по дням для {user.email}
                </Typography>
                <Table size="small" sx={{ backgroundColor: 'white' }}>
                    <TableHead>
                        <TableRow sx={{ backgroundColor: '#f0f0f0' }}>
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
                            <TableRow key={day.date} hover>
                                <TableCell>
                                    {new Date(day.date).toLocaleDateString('ru-RU')}
                                </TableCell>
                                <TableCell align="center">{day.commits}</TableCell>
                                <TableCell align="center">{day.mergeCommits}</TableCell>
                                <TableCell align="center" sx={{ color: '#4caf50' }}>
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
    );
};

const UserStatsTable = () => {
    const { data, loading, error } = useUserStats();
    const columns = useMemo(() => getUserColumns(), []);

    const handleExportData = () => {
        if (data.length === 0) {
            alert('Нет данных для экспорта');
            return;
        }

        // Экспортируем агрегированные данные
        const exportData = data.map(user => ({
            email: user.email,
            totalCommits: user.totalCommits,
            mergeCommits: user.totalMergeCommits,
            addedLines: user.totalAddedLines,
            deletedLines: user.totalDeletedLines,
            testAddedLines: user.totalTestAddedLines,
            daysActive: user.daysActive
        }));

        const csv = generateCsv(csvConfig)(exportData);
        download(csvConfig)(csv);
    };

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
        // Отключаем стандартный expand
        enableExpanding: false,
        // Включаем детализацию
        renderDetailPanel: ({ row }) => <DetailPanel row={row} />,
        // Отключаем иконку раскрытия
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
            sx: {
                fontWeight: 'bold',
                py: 1.5,
            },
        },
        muiTablePaperProps: {
            elevation: 0,
            sx: {
                boxShadow: 'none',
                border: 'none',
                overflow: 'hidden',
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
        enableGlobalFilter: true,
        enableColumnFilters: true,
        enableSorting: true,
        renderTopToolbarCustomActions: () => (
            <Box sx={{ display: 'flex', gap: '16px', padding: '8px', flexWrap: 'wrap' }}>
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
            </Box>
        ),
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
            <Paper sx={{ p: 4, textAlign: 'center' }}>
                <Typography color="error">Ошибка загрузки: {error}</Typography>
            </Paper>
        );
    }

    return <MaterialReactTable table={table} />;
};

export default UserStatsTable;