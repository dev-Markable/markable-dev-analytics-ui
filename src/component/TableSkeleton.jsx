import React from 'react';
import { Box, Skeleton, Paper } from '@mui/material';

const TableSkeleton = () => {
    return (
        <Paper sx={{
            width: '100%',
            border: 1,
            borderRadius: 2,
            borderColor: 'divider',
            overflow: 'hidden'
        }}>
            {/* Заголовок таблицы с иконками */}
            <Box sx={{
                display: 'flex',
                backgroundColor: '#f5f5f5',
                borderBottom: 1,
                borderColor: 'divider',
                p: 2
            }}>
                <Box sx={{ display: 'flex', alignItems: 'center', width: '25%', mr: 2 }}>
                    <Skeleton variant="circular" width={24} height={24} sx={{ mr: 1 }} />
                    <Skeleton variant="text" sx={{ width: '70%' }} />
                </Box>
                {[...Array(5)].map((_, index) => (
                    <Box key={index} sx={{ display: 'flex', alignItems: 'center', width: '10%', mr: 2 }}>
                        <Skeleton variant="circular" width={20} height={20} sx={{ mr: 1 }} />
                        <Skeleton variant="text" sx={{ width: '60%' }} />
                    </Box>
                ))}
            </Box>

            {/* Строки таблицы */}
            {[...Array(10)].map((_, rowIndex) => (
                <Box
                    key={rowIndex}
                    sx={{
                        display: 'flex',
                        borderBottom: rowIndex < 9 ? 1 : 0,
                        borderColor: 'divider',
                        p: 2,
                        backgroundColor: rowIndex % 2 === 0 ? 'white' : '#fafafa'
                    }}
                >
                    {/* Email колонка */}
                    <Box sx={{ width: '25%', mr: 2 }}>
                        <Skeleton
                            variant="text"
                            animation="wave"
                            sx={{ width: '90%' }}
                        />
                    </Box>

                    {/* Числовые колонки */}
                    {[...Array(5)].map((_, colIndex) => (
                        <Box key={colIndex} sx={{ width: '10%', mr: 2 }}>
                            <Skeleton
                                variant="text"
                                animation="wave"
                                sx={{ width: '60%', mx: 'auto' }}
                            />
                        </Box>
                    ))}
                </Box>
            ))}
        </Paper>
    );
};

export default TableSkeleton;