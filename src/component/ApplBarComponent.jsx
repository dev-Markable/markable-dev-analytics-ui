import React from 'react';
import AppBar from '@mui/material/AppBar';
import Box from '@mui/material/Box';
import Toolbar from '@mui/material/Toolbar';
import Typography from '@mui/material/Typography';
import Container from '@mui/material/Container';
import Button from '@mui/material/Button';
import {Link} from "react-router-dom";

const ApplBarComponent = () => {
    const pages = [
        {
            title: 'Пользователи'
            // linkName: '/orders'
        },
        {
            title: 'Репозитории'
            // linkName: '/category'
        }
    ];

    const [anchorElNav, setAnchorElNav] = React.useState(null);

    const handleOpenNavMenu = (event) => {
        setAnchorElNav(event.currentTarget);
    };

    const handleCloseNavMenu = () => {
        setAnchorElNav(null);
    };

    return (
        <React.Fragment>
            <AppBar position="static"
                    sx={{background: '#333333'}}
            >
                <Container maxWidth="lg">
                    <Toolbar disableGutters>
                        {/*<Typography*/}
                        {/*    variant="h6"*/}
                        {/*    noWrap*/}
                        {/*    component="a"*/}
                        {/*    href="/"*/}
                        {/*    sx={{*/}
                        {/*        mr: 2,*/}
                        {/*        display: {xs: 'none', md: 'flex'},*/}
                        {/*        fontFamily: 'Manrope',*/}
                        {/*        fontWeight: 700,*/}
                        {/*        letterSpacing: '.3rem',*/}
                        {/*        color: 'inherit',*/}
                        {/*        textDecoration: 'none',*/}
                        {/*    }}*/}
                        {/*>*/}
                        {/*    ATLAS*/}
                        {/*</Typography>*/}
                        <Box sx={{flexGrow: 1, display: {xs: 'none', md: 'flex'}}}>
                            {pages.map((page) => (
                                <Button
                                    key={page.title}
                                    onClick={handleCloseNavMenu}
                                    sx={{
                                        my: 2,
                                        color: 'white',
                                        display: 'block',
                                        textTransform: 'none',
                                        fontFamily: 'Manrope'
                                    }}
                                    // component={Link} to={page.linkName}
                                >
                                    {page.title}
                                </Button>
                            ))}
                        </Box>
                    </Toolbar>
                </Container>
            </AppBar>
        </React.Fragment>
    );
}

export default ApplBarComponent;