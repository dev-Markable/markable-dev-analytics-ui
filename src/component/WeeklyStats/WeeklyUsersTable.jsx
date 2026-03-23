import React, { useMemo } from 'react';
import {
    MaterialReactTable,
    useMaterialReactTable,
} from 'material-react-table';
import { MRT_Localization_RU } from 'material-react-table/locales/ru';
import { Box, Typography, Button } from '@mui/material';
import FileDownloadIcon from '@mui/icons-material/FileDownload';
import { mkConfig, generateCsv, download } from 'export-to-csv';
import { getWeeklyUserColumns } from '../weeklyTableColumns';
import { useNavigate } from 'react-router-dom';

const csvConfig = mkConfig({
    fieldSeparator: ',',
    decimalSeparator: '.',
    useKeysAsHeaders: true,
});

const WeeklyUsersTable = ({ weekData, weekStart, weekEnd }) => {
    const navigate = useNavigate();
    const columns = useMemo(() => getWeeklyUserColumns(), []);

    const users = useMemo(() => {
        if (!weekData?.topAuthors) return [];

        return Object.values(weekData.topAuthors).map(author => ({
            email: author.email,
            commits: author.commits,
            mergeCommits: author.mergeCommits || 0,
            addedLines: author.addedLines,
            deletedLines: author.deletedLines,
            testAddedLines: author.testAddedLines || 0,
            net: author.addedLines - author.deletedLines
        })).sort((a, b) => b.commits - a.commits);
    }, [weekData]);

    const handleExport = () => {
        if (users.length === 0) return;
        const csv = generateCsv(csvConfig)(users);
        download(csvConfig)(csv);
    };

    const handleRowClick = (row) => {
        // Передаем период (даты недели) через URL параметры
        const params = new URLSearchParams();
        if (weekStart) params.set('start', weekStart);
        if (weekEnd) params.set('end', weekEnd);

        navigate(`/git/user/${encodeURIComponent(row.original.email)}?${params.toString()}`);
    };

    const table = useMaterialReactTable({
        columns,
        data: users,
        initialState: {
            sorting: [{ id: 'commits', desc: true }],
            pagination: { pageIndex: 0, pageSize: 10 },
        },
        localization: MRT_Localization_RU,
        enableGlobalFilter: true,
        enableColumnFilters: true,
        enableSorting: true,
        muiTableBodyCellProps: {
            sx: { py: 1.5, fontSize: '0.9rem' }
        },
        muiTableHeadCellProps: {
            sx: {
                fontWeight: 'bold',
                backgroundColor: '#f5f5f5',
                py: 1.5,
            },
        },
        muiTablePaperProps: {
            elevation: 0,
            sx: {
                boxShadow: 'none',
                border: '1px solid rgba(0, 0, 0, 0.08)',
                borderRadius: 2,
                overflow: 'hidden',
            },
        },
        muiTableBodyRowProps: ({ row }) => ({
            onClick: () => handleRowClick(row),
            sx: {
                cursor: 'pointer',
                '&:hover': {
                    backgroundColor: 'rgba(241, 196, 15, 0.05)',
                },
            },
        }),
        renderTopToolbarCustomActions: () => (
            <Box sx={{ display: 'flex', justifyContent: 'space-between', width: '100%', p: 1 }}>
                <Typography variant="subtitle2" sx={{ alignSelf: 'center', color: '#666' }}>
                    👥 Пользователи ({users.length})
                </Typography>
                <Button
                    size="small"
                    sx={{
                        textTransform: 'none',
                        color: '#333333',
                        '&:hover': { backgroundColor: 'rgba(241, 196, 15, 0.1)' },
                    }}
                    onClick={handleExport}
                    startIcon={<FileDownloadIcon sx={{ color: '#f1c40f' }} />}
                >
                    Экспорт
                </Button>
            </Box>
        ),
    });

    if (users.length === 0) {
        return (
            <Box sx={{ textAlign: 'center', py: 4 }}>
                <Typography color="text.secondary">Нет данных по пользователям за эту неделю</Typography>
            </Box>
        );
    }

    return <MaterialReactTable table={table} />;
};

export default WeeklyUsersTable;