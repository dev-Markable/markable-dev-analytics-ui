import React from 'react';
import Container from "@mui/material/Container";
import {createTheme, ThemeProvider} from "@mui/material";

const theme = createTheme({
    typography: {
        fontFamily: '"Montserrat"'
    },
});

const MainContainerComponent = ({children}) => (
    <ThemeProvider theme={theme}>
        <Container maxWidth="lg"
                   sx={{background: 'white', mt: 2, p: 2, borderRadius: 2, height: '90%', overflow: 'auto'}}>
            {children}
        </Container>
    </ThemeProvider>
)

export default MainContainerComponent