import React from 'react';
import { Tabs, Tab, Box, Typography } from '@mui/material';

const WeeklyTabs = ({ weeks, selectedWeek, onChange }) => {
    return (
        <Tabs
            value={selectedWeek}
            onChange={onChange}
            variant="scrollable"
            scrollButtons="auto"
            sx={{
                borderBottom: '1px solid rgba(0,0,0,0.08)',
                '& .MuiTab-root': {
                    textTransform: 'none',
                    minHeight: 48,
                    '&.Mui-selected': { color: '#f1c40f' },
                },
                '& .MuiTabs-indicator': { backgroundColor: '#f1c40f' },
            }}
        >
            {weeks.map((week, idx) => (
                <Tab
                    key={idx}
                    label={
                        <Box sx={{ textAlign: 'center', py: 1 }}>
                            <Typography variant="body2" sx={{ fontWeight: 'bold' }}>
                                {week.getWeekLabel()}
                            </Typography>
                            <Typography variant="caption" color="text.secondary">
                                {week.totalCommits} коммитов
                            </Typography>
                        </Box>
                    }
                />
            ))}
        </Tabs>
    );
};

export default WeeklyTabs;