import React from 'react';
import { Box, Typography } from '@mui/material';
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { DatePicker } from "@mui/x-date-pickers/DatePicker";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";

const DatePickerField = ({ label, description, value, onChange }) => {
    return (
        <Box>
            <LocalizationProvider dateAdapter={AdapterDayjs}>
                <DatePicker
                    sx={{
                        width: '100%',
                        '& .MuiOutlinedInput-root': {
                            '&:hover fieldset': {
                                borderColor: 'rgba(241, 196, 15, 1)',
                            },
                            '&.Mui-focused fieldset': {
                                borderColor: 'rgba(241, 196, 15, 1)',
                            },
                        },
                        '& .MuiInputLabel-root.Mui-focused': {
                            color: '#333333',
                        },
                    }}
                    slotProps={{
                        day: {
                            sx: {
                                '&.MuiPickersDay-root.Mui-selected': {
                                    backgroundColor: 'rgba(241, 196, 15, 1)',
                                }
                            }
                        }
                    }}
                    label={label}
                    value={value}
                    onChange={onChange}
                />
            </LocalizationProvider>
            <Typography variant="caption" gutterBottom sx={{ display: 'block', color: 'grey' }}>
                {description}
            </Typography>
        </Box>
    );
};

export default DatePickerField;