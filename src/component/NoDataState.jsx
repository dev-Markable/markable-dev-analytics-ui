import React from 'react';
import { Box, Typography } from '@mui/material';
import NoData from "../img/empty.png";

const NoDataState = () => {
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
                alt="No data found"
                src={NoData}
                sx={{
                    width: '80%',
                }}/>

            <Typography variant="h6" color="text.secondary" gutterBottom>
                Данные не найдены
            </Typography>

            <Typography variant="body2" color="text.secondary" align="center" sx={{ maxWidth: 400 }}>
                За выбранный период нет коммитов. Попробуйте изменить даты.
            </Typography>
        </Box>
    );
};

export default NoDataState;