import React from 'react';
import { Box, Typography } from '@mui/material';
import Img from "../img/empty.png";

const EmptyTableState = () => {
    return (
        <Box
            sx={{
                height: 800,
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                p: 4
            }}
        >
            <Box
                component="img"
                alt="left Img"
                src={Img}
                sx={{
                    width: '80%',
                }}/>

            <Typography variant="h6" color="text.secondary" gutterBottom>
                Нет данных для отображения
            </Typography>

            <Typography variant="body2" color="text.secondary" align="center" sx={{ maxWidth: 400 }}>
                Выберите период и нажмите кнопку "Выгрузить", чтобы получить статистику по коммитам
            </Typography>
        </Box>
    );
};

export default EmptyTableState;