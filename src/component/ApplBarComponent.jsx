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
import { useNavigate } from "react-router-dom";

// Импортируем иконки для Material UI
import ShowChartIcon from '@mui/icons-material/ShowChart';
import CalendarTodayIcon from '@mui/icons-material/CalendarToday';
import PeopleIcon from '@mui/icons-material/People';
import FileUploadIcon from '@mui/icons-material/FileUpload';
import AssessmentIcon from '@mui/icons-material/Assessment';
import MergeIcon from '@mui/icons-material/Merge';
import FolderIcon from '@mui/icons-material/Folder';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import BugReportIcon from '@mui/icons-material/BugReport';
import BoardIcon from '@mui/icons-material/Dashboard';
import SportsIcon from '@mui/icons-material/Sports';
import GroupIcon from '@mui/icons-material/Group';

const ApplBarComponent = () => {
    const navigate = useNavigate();
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

    const handleNavigation = (path) => {
        handleCloseMenu();
        navigate(path);
    };

    const open = Boolean(anchorEl);

    const menuItems = {
        'Аналитика Git': [
            { title: 'Коммиты', link: '/git/commits', icon: <ShowChartIcon fontSize="small" /> },
            { title: 'Статистика по неделям', link: '/git/weekly', icon: <CalendarTodayIcon fontSize="small" /> },
            { title: 'Статистика по пользователям', link: '/git/users', icon: <PeopleIcon fontSize="small" /> },
            { title: 'Ручная выгрузка', link: '/git/manual', icon: <FileUploadIcon fontSize="small" /> }
        ],
        'Аналитика Kaiten': [
            { title: 'Задачи', link: '/kaiten/tasks', icon: <AssessmentIcon fontSize="small" /> },
            { title: 'Доски', link: '/kaiten/boards', icon: <BoardIcon fontSize="small" /> },
            { title: 'Спринты', link: '/kaiten/sprints', icon: <SportsIcon fontSize="small" /> },
            { title: 'Статистика команды', link: '/kaiten/team', icon: <GroupIcon fontSize="small" /> }
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
                                    backgroundColor: 'rgba(51, 51, 51, 0.95)',
                                    backdropFilter: 'blur(10px)',
                                    color: 'white',
                                    minWidth: '280px',
                                    mt: 1,
                                    borderRadius: 2,
                                    boxShadow: '0 8px 32px rgba(0,0,0,0.4)',
                                    border: '1px solid rgba(241, 196, 15, 0.1)',
                                }
                            }}
                        >
                            <List sx={{ p: 1 }}>
                                {currentMenu && menuItems[currentMenu]?.map((item) => (
                                    <ListItem key={item.title} disablePadding>
                                        <ListItemButton
                                            onClick={() => handleNavigation(item.link)}
                                            sx={{
                                                borderRadius: 1,
                                                transition: 'all 0.2s',
                                                '&:hover': {
                                                    backgroundColor: 'rgba(241, 196, 15, 0.15)',
                                                    transform: 'translateX(4px)',
                                                }
                                            }}
                                        >
                                            <Box sx={{
                                                mr: 2,
                                                display: 'flex',
                                                alignItems: 'center',
                                                color: '#f1c40f'
                                            }}>
                                                {item.icon}
                                            </Box>
                                            <ListItemText
                                                primary={item.title}
                                                primaryTypographyProps={{
                                                    fontFamily: 'Manrope',
                                                    fontSize: '0.95rem',
                                                    fontWeight: 400,
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