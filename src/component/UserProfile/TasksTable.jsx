import React from 'react';
import {
    Paper,
    Typography,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    Chip,
    Box,
    IconButton,
    Collapse
} from '@mui/material';
import KeyboardArrowDownIcon from '@mui/icons-material/KeyboardArrowDown';
import KeyboardArrowUpIcon from '@mui/icons-material/KeyboardArrowUp';
import { useState } from 'react';

const TaskRow = ({ task }) => {
    const [open, setOpen] = useState(false);

    return (
        <>
            <TableRow hover sx={{ '& > *': { borderBottom: 'unset' } }}>
                <TableCell>
                    <IconButton size="small" onClick={() => setOpen(!open)}>
                        {open ? <KeyboardArrowUpIcon /> : <KeyboardArrowDownIcon />}
                    </IconButton>
                </TableCell>
                <TableCell component="th" scope="row">
                    <Typography fontWeight="medium">{task.taskNumber}</Typography>
                </TableCell>
                <TableCell>{task.taskTitle}</TableCell>
                <TableCell align="center">
                    <Chip
                        label={`${task.commits.length} коммитов`}
                        size="small"
                        sx={{ backgroundColor: '#f1c40f', color: '#333' }}
                    />
                </TableCell>
            </TableRow>
            <TableRow>
                <TableCell style={{ paddingBottom: 0, paddingTop: 0 }} colSpan={4}>
                    <Collapse in={open} timeout="auto" unmountOnExit>
                        <Box sx={{ margin: 2 }}>
                            <Typography variant="subtitle2" sx={{ mb: 1, color: '#2ea043' }}>
                                Коммиты по задаче:
                            </Typography>
                            <Table size="small">
                                <TableHead>
                                    <TableRow>
                                        <TableCell>Дата</TableCell>
                                        <TableCell>Хэш</TableCell>
                                        <TableCell align="center">Добавлено</TableCell>
                                        <TableCell align="center">Удалено</TableCell>
                                        <TableCell>Сообщение</TableCell>
                                    </TableRow>
                                </TableHead>
                                <TableBody>
                                    {task.commits.map((commit, idx) => (
                                        <TableRow key={idx}>
                                            <TableCell>
                                                {new Date(commit.commitDate).toLocaleDateString('ru-RU')}
                                            </TableCell>
                                            <TableCell>
                                                <Typography variant="caption" sx={{ fontFamily: 'monospace' }}>
                                                    {commit.hash?.substring(0, 8)}...
                                                </Typography>
                                            </TableCell>
                                            <TableCell align="center" sx={{ color: '#4caf50' }}>
                                                +{commit.added}
                                            </TableCell>
                                            <TableCell align="center" sx={{ color: '#f44336' }}>
                                                -{commit.deleted}
                                            </TableCell>
                                            <TableCell>
                                                <Typography variant="caption" sx={{ wordBreak: 'break-all' }}>
                                                    {commit.commitMessage}
                                                </Typography>
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        </Box>
                    </Collapse>
                </TableCell>
            </TableRow>
        </>
    );
};

const TasksTable = ({ tasks }) => {
    if (!tasks || tasks.length === 0) {
        return (
            <Paper sx={{ p: 3, textAlign: 'center', borderRadius: 2 }}>
                <Typography color="text.secondary">Нет данных по задачам</Typography>
            </Paper>
        );
    }

    return (
        <Paper sx={{ borderRadius: 2, border: '1px solid rgba(0,0,0,0.08)', overflow: 'hidden' }}>
            <TableContainer>
                <Table>
                    <TableHead sx={{ backgroundColor: '#f5f5f5' }}>
                        <TableRow>
                            <TableCell width="50px" />
                            <TableCell>Номер задачи</TableCell>
                            <TableCell>Название</TableCell>
                            <TableCell align="center">Коммиты</TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {tasks.map((task, idx) => (
                            <TaskRow key={idx} task={task} />
                        ))}
                    </TableBody>
                </Table>
            </TableContainer>
        </Paper>
    );
};

export default TasksTable;