import React, { useState } from 'react';
import MainContainerComponent from "../component/container/MainContainerComponent.jsx";
import DataTable from "../component/DataTable.jsx";
import Box from "@mui/material/Box";
import { Stack, Alert, Snackbar } from "@mui/material";
import Button from "@mui/material/Button";
import dayjs from "dayjs";
import DatePickerField from "../component/DateRangePicker.jsx";
import { useAnalysis } from "../hooks/useAnalysis";

const MainPage = () => {
    const [startDate, setStartDate] = useState(dayjs());
    const [endDate, setEndDate] = useState(dayjs());
    const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });

    const { data, loading, error, fetchAnalysis } = useAnalysis();

    const handleSubmit = async () => {
        try {
            await fetchAnalysis(startDate, endDate);
            setSnackbar({
                open: true,
                message: 'Данные успешно загружены',
                severity: 'success'
            });
        } catch (err) {
            setSnackbar({
                open: true,
                message: err.message || 'Ошибка при загрузке данных',
                severity: 'error'
            });
        }
    };

    const handleCloseSnackbar = () => {
        setSnackbar({ ...snackbar, open: false });
    };

    return (
        <MainContainerComponent>
            <Box>
                <Stack spacing={2}>
                    <Stack spacing={2}>
                        <Stack direction="row" spacing={2} sx={{ pl: 1, alignItems: "center" }}>
                            <DatePickerField
                                label="Дата начала"
                                description="Выберите дату начала периода"
                                value={startDate}
                                onChange={setStartDate}
                            />
                            <DatePickerField
                                label="Дата окончания"
                                description="Выберите дату окончания периода"
                                value={endDate}
                                onChange={setEndDate}
                            />
                            <Button
                                variant="contained"
                                onClick={handleSubmit}
                                disabled={loading}
                                sx={{
                                    textTransform: 'none',
                                    backgroundColor: 'rgba(241, 196, 15, 1)',
                                    boxShadow: 'none',
                                    minWidth: '120px',
                                    '&:hover': {
                                        backgroundColor: 'rgba(241, 196, 15, 0.9)',
                                        boxShadow: 'none',
                                    },
                                    '&:disabled': {
                                        backgroundColor: 'rgba(241, 196, 15, 0.5)',
                                    }
                                }}
                            >
                                {loading ? 'Загрузка...' : 'Выгрузить'}
                            </Button>
                        </Stack>
                    </Stack>

                    <DataTable data={data} loading={loading} error={error} />
                </Stack>
            </Box>

            <Snackbar
                open={snackbar.open}
                autoHideDuration={6000}
                onClose={handleCloseSnackbar}
                anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
            >
                <Alert onClose={handleCloseSnackbar} severity={snackbar.severity}>
                    {snackbar.message}
                </Alert>
            </Snackbar>
        </MainContainerComponent>
    );
};

export default MainPage;