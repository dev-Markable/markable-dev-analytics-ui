import React, {useMemo} from "react";
import {
    MaterialReactTable,
    useMaterialReactTable,
} from 'material-react-table';
import {MRT_Localization_RU} from 'material-react-table/locales/ru';
import {Box, Paper, Stack} from '@mui/material';
import Button from "@mui/material/Button";
import FileDownloadIcon from '@mui/icons-material/FileDownload';
import {mkConfig, generateCsv, download} from 'export-to-csv';
import {getColumns} from './tableColumns';
import TableSkeleton from './TableSkeleton';
import EmptyTableState from './EmptyTableState';
import NoDataState from './NoDataState';
import Typography from "@mui/material/Typography";
import Error from "../img/error.png";


const csvConfig = mkConfig({
    fieldSeparator: ',',
    decimalSeparator: '.',
    useKeysAsHeaders: true,
});

const DataTable = ({data = [], loading = false, error = null, hasRequestBeenMade = false}) => {
    const columns = useMemo(() => getColumns(), []);

    const handleExportData = () => {
        if (data.length === 0) {
            alert('Нет данных для экспорта');
            return;
        }
        const csv = generateCsv(csvConfig)(data);
        download(csvConfig)(csv);
    };

    // Показываем таблицу с данными
    const table = useMaterialReactTable({
        columns,
        data,
        initialState: {
            sorting: [
                {id: 'commits', desc: true},
            ],
            pagination: {pageIndex: 0, pageSize: 15},
        },
        localization: MRT_Localization_RU,
        muiTableBodyCellProps: {
            align: 'center',
        },
        muiTableHeadCellProps: {
            align: 'center',
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
            }
        },
        renderTopToolbarCustomActions: () => (
            <Box
                sx={{
                    display: 'flex',
                    gap: '16px',
                    padding: '8px',
                    flexWrap: 'wrap',
                }}
            >
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
                    Скачать
                </Button>
            </Box>
        ),
    });

    // Показываем скелетон во время загрузки
    if (loading) {
        return (
            <Box sx={{width: '100%'}}>
                <TableSkeleton/>
            </Box>
        );
    }

    // Показываем сообщение об ошибке
    if (error) {
        return (
            <Stack spacing={2} sx={{
                height: 800,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
            }}>
                <Box
                    component="img"
                    alt="Error"
                    src={Error}
                    sx={{
                        width: '80%',
                    }}/>

                <Typography color="error" align="center">
                    {error}
                </Typography>
            </Stack>
        );
    }

    // Если данных нет - показываем разные заглушки
    if (data.length === 0) {
        // Если запрос еще не делали - приветственная картинка
        if (!hasRequestBeenMade) {
            return <EmptyTableState />;
        }
        // Если запрос делали, но данных нет - "ничего не найдено"
        return <NoDataState />;
    }

    return <MaterialReactTable table={table} />;
};

export default DataTable;