import React from 'react';
import Container from "@mui/material/Container";
import {createTheme, ThemeProvider, Box} from "@mui/material";

const theme = createTheme({
    typography: {
        fontFamily: '"Manrope"'
    },
});

const MainContainerComponent = ({children}) => (
    <ThemeProvider theme={theme}>
        {/* Внешний контейнер для управления высотой */}
        <Box sx={{
            height: '93vh', // 👈 90% от высоты окна браузера
            display: 'flex',
            flexDirection: 'column',
            p: 0, // убираем отступы
        }}>
            <Container
                maxWidth="lg"
                sx={{
                    background: 'white',
                    mt: 2,
                    p: 2,
                    borderRadius: 2,
                    height: '100%', // 👈 занимает всю высоту родителя
                    display: 'flex',
                    flexDirection: 'column',
                    overflow: 'hidden', // скрываем переполнение
                }}
            >
                {/* Внутренний контейнер со скроллом */}
                <Box sx={{
                    flex: 1,
                    overflow: 'auto',
                    pr: 1, // небольшой отступ для скроллбара
                    // Стилизация скроллбара (опционально)
                    '&::-webkit-scrollbar': {
                        width: '8px',
                    },
                    '&::-webkit-scrollbar-track': {
                        background: '#f1f1f1',
                        borderRadius: '4px',
                    },
                    '&::-webkit-scrollbar-thumb': {
                        background: '#c1c1c1',
                        borderRadius: '4px',
                        '&:hover': {
                            background: '#a1a1a1',
                        },
                    },
                }}>
                    {children}
                </Box>
            </Container>
        </Box>
    </ThemeProvider>
)

export default MainContainerComponent