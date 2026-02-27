import React from 'react';
import { Box, Skeleton } from '@mui/material';

const TableSkeletonRow = ({ columns = 6, hasBorder = true }) => {
    // Распределение ширины колонок (на основе ваших размеров)
    const columnWidths = ['25%', '10%', '10%', '10%', '10%', '15%'];

    return (
        <Box
            sx={{
                display: 'flex',
                ...(hasBorder && { borderBottom: 1, borderColor: 'divider' }),
                p: 2
            }}
        >
            {columnWidths.slice(0, columns).map((width, index) => (
                <Skeleton
                    key={index}
                    variant="text"
                    sx={{ width, mr: index < columns - 1 ? 2 : 0 }}
                />
            ))}
        </Box>
    );
};

export const TableSkeleton = () => {
    return (
        <Box sx={{ width: '100%' }}>
            {/* Заголовок */}
            <Box sx={{
                display: 'flex',
                backgroundColor: '#f5f5f5',
                borderBottom: 1,
                borderColor: 'divider',
                p: 2
            }}>
                <Skeleton variant="text" sx={{ width: '25%', mr: 2 }} />
                <Skeleton variant="text" sx={{ width: '10%', mr: 2 }} />
                <Skeleton variant="text" sx={{ width: '10%', mr: 2 }} />
                <Skeleton variant="text" sx={{ width: '10%', mr: 2 }} />
                <Skeleton variant="text" sx={{ width: '10%', mr: 2 }} />
                <Skeleton variant="text" sx={{ width: '15%' }} />
            </Box>

            {/* 10 строк данных */}
            {[...Array(10)].map((_, index) => (
                <TableSkeletonRow key={index} />
            ))}
        </Box>
    );
};

export default TableSkeleton;