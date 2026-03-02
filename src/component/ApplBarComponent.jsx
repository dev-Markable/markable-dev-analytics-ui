import React from 'react';
import AppBar from '@mui/material/AppBar';
import Box from '@mui/material/Box';
import Toolbar from '@mui/material/Toolbar';
import Typography from '@mui/material/Typography';
import Container from '@mui/material/Container';
import Button from '@mui/material/Button';
import Popover from '@mui/material/Popover';
import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';
import ListItemText from '@mui/material/ListItemText';
import ListItemButton from '@mui/material/ListItemButton';
import ArrowDropDownIcon from '@mui/icons-material/ArrowDropDown';
import { Link } from "react-router-dom";

const ApplBarComponent = () => {
    const [anchorEl, setAnchorEl] = React.useState(null);
    const [currentMenu, setCurrentMenu] = React.useState(null);

    const handleOpenMenu = (event, menuTitle) => {
        setAnchorEl(event.currentTarget);
        setCurrentMenu(menuTitle);
    };

    const handleCloseMenu = () => {
        setAnchorEl(null);
        setCurrentMenu(null);
    };

    const open = Boolean(anchorEl);

    const menuItems = {
        'Аналитика Git': [
            { title: 'Коммиты', link: '/git/commits', icon: '📊' },
            { title: 'Ветки', link: '/git/branches', icon: '🌿' },
            { title: 'Репозитории', link: '/git/repos', icon: '📁' },
            { title: 'Статистика пользователей', link: '/git/users', icon: '👥' },
            { title: 'Ручная выгрузка статистики за период', link: '/git/manual', icon: '📅' }
        ],
        'Аналитика Kaiten': [
            { title: 'Задачи', link: '/kaiten/tasks', icon: '📋' },
            { title: 'Доски', link: '/kaiten/boards', icon: '📌' },
            { title: 'Спринты', link: '/kaiten/sprints', icon: '🏃' },
            { title: 'Статистика команды', link: '/kaiten/team', icon: '📈' }
        ]
    };

    return (
        <React.Fragment>
            <AppBar position="static" sx={{ background: '#333333' }}>
                <Container maxWidth="lg">
                    <Toolbar disableGutters>
                        <Typography
                            variant="h6"
                            noWrap
                            component="a"
                            href="/"
                            sx={{
                                mr: 2,
                                display: { xs: 'none', md: 'flex' },
                                fontFamily: 'Manrope',
                                fontWeight: 700,
                                letterSpacing: '.3rem',
                                color: 'inherit',
                                textDecoration: 'none',
                            }}
                        >
                            Dev analytics
                        </Typography>

                        <Box sx={{ flexGrow: 1, display: { xs: 'none', md: 'flex' }, gap: 1 }}>
                            {Object.keys(menuItems).map((menuTitle) => (
                                <Box key={menuTitle}>
                                    <Button
                                        onClick={(e) => handleOpenMenu(e, menuTitle)}
                                        sx={{
                                            color: 'white',
                                            display: 'flex',
                                            alignItems: 'center',
                                            textTransform: 'none',
                                            fontFamily: 'Manrope',
                                            fontSize: '1rem',
                                            py: 1,
                                            px: 2,
                                            borderRadius: 1,
                                            '&:hover': {
                                                backgroundColor: 'rgba(241, 196, 15, 0.1)',
                                            },
                                            ...(currentMenu === menuTitle && {
                                                backgroundColor: 'rgba(241, 196, 15, 0.15)',
                                            })
                                        }}
                                        endIcon={<ArrowDropDownIcon sx={{
                                            transform: currentMenu === menuTitle ? 'rotate(180deg)' : 'none',
                                            transition: 'transform 0.2s'
                                        }} />}
                                    >
                                        {menuTitle}
                                    </Button>
                                </Box>
                            ))}
                        </Box>

                        {/* Выпадающее меню */}
                        <Popover
                            open={open}
                            anchorEl={anchorEl}
                            onClose={handleCloseMenu}
                            anchorOrigin={{
                                vertical: 'bottom',
                                horizontal: 'left',
                            }}
                            transformOrigin={{
                                vertical: 'top',
                                horizontal: 'left',
                            }}
                            sx={{
                                '& .MuiPaper-root': {
                                    backgroundColor: 'rgba(51, 51, 51, 0.85)',
                                    backdropFilter: 'blur(5px)',
                                    color: 'white',
                                    minWidth: '280px',
                                    mt: 1,
                                    borderRadius: 2,
                                    boxShadow: '0 8px 32px rgba(0,0,0,0.4)',
                                    border: '1px solid rgba(241, 196, 15, 0.1)'
                                }
                            }}
                        >
                            <List sx={{ p: 1 }}>
                                {currentMenu && menuItems[currentMenu]?.map((item) => (
                                    <ListItem key={item.title} disablePadding>
                                        <ListItemButton
                                            component={Link}
                                            to={item.link}
                                            onClick={handleCloseMenu}
                                            sx={{
                                                borderRadius: 1,
                                                '&:hover': {
                                                    backgroundColor: 'rgba(241, 196, 15, 0.1)',
                                                }
                                            }}
                                        >
                                            <Box sx={{ mr: 2, fontSize: '1.2rem' }}>{item.icon}</Box>
                                            <ListItemText
                                                primary={item.title}
                                                primaryTypographyProps={{
                                                    fontFamily: 'Manrope',
                                                    fontSize: '0.95rem'
                                                }}
                                            />
                                        </ListItemButton>
                                    </ListItem>
                                ))}
                            </List>
                        </Popover>
                    </Toolbar>
                </Container>
            </AppBar>
        </React.Fragment>
    );
}

export default ApplBarComponent;