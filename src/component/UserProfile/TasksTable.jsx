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
    Collapse,
    Link,
    Divider
} from '@mui/material';
import KeyboardArrowDownIcon from '@mui/icons-material/KeyboardArrowDown';
import KeyboardArrowUpIcon from '@mui/icons-material/KeyboardArrowUp';
import OpenInNewIcon from '@mui/icons-material/OpenInNew';
import { useState } from 'react';

const getStatusColor = (status) => {
    switch (status) {
        case 'Очередь': return '#ff9800';
        case 'В работе': return '#2196f3';
        case 'Готово': return '#4caf50';
        default: return '#9e9e9e';
    }
};

const getPriorityColor = (priority) => {
    switch (priority) {
        case 'Низкий': return '#8bc34a';
        case 'Средний': return '#ffc107';
        case 'Высокий': return '#ff9800';
        case 'Крит': return '#f44336';
        default: return '#9e9e9e';
    }
};

const TaskRow = ({ task, isKaiten }) => {
    const [open, setOpen] = useState(false);
    const cardUrl = isKaiten ? task.url : null;

    return (
        <>
            <TableRow hover sx={{ '& > *': { borderBottom: 'unset' } }}>
                <TableCell>
                    <IconButton size="small" onClick={() => setOpen(!open)}>
                        {open ? <KeyboardArrowUpIcon /> : <KeyboardArrowDownIcon />}
                    </IconButton>
                </TableCell>
                <TableCell component="th" scope="row">
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <Typography fontWeight="medium">
                            {isKaiten ? `K-${task.id}` : task.taskNumber}
                        </Typography>
                        {cardUrl && (
                            <Link href={cardUrl} target="_blank" rel="noopener">
                                <OpenInNewIcon fontSize="small" sx={{ color: '#666' }} />
                            </Link>
                        )}
                    </Box>
                </TableCell>
                <TableCell>
                    <Typography variant="body2" sx={{ maxWidth: 400 }}>
                        {isKaiten ? task.title : task.taskTitle}
                    </Typography>
                </TableCell>
                <TableCell align="center">
                    {isKaiten && (
                        <>
                            <Chip
                                label={task.status}
                                size="small"
                                sx={{ backgroundColor: getStatusColor(task.status), color: 'white', mr: 1 }}
                            />
                            {task.priority && (
                                <Chip
                                    label={task.priority}
                                    size="small"
                                    sx={{ backgroundColor: getPriorityColor(task.priority), color: 'white' }}
                                />
                            )}
                        </>
                    )}
                </TableCell>
                <TableCell align="center">
                    <Chip
                        label={`${task.commits?.length || 0} коммитов`}
                        size="small"
                        sx={{ backgroundColor: '#f1c40f', color: '#333' }}
                    />
                </TableCell>
            </TableRow>
            <TableRow>
                <TableCell style={{ paddingBottom: 0, paddingTop: 0 }} colSpan={5}>
                    <Collapse in={open} timeout="auto" unmountOnExit>
                        <Box sx={{ margin: 2 }}>
                            {isKaiten && (
                                <Box sx={{ mb: 2, display: 'flex', gap: 2, flexWrap: 'wrap' }}>
                                    <Typography variant="caption" color="text.secondary">
                                        Создана: {new Date(task.createdAt).toLocaleDateString('ru-RU')}
                                    </Typography>
                                    {task.closedAt && (
                                        <Typography variant="caption" color="text.secondary">
                                            Закрыта: {new Date(task.closedAt).toLocaleDateString('ru-RU')}
                                        </Typography>
                                    )}
                                    {task.lastMovedAt && (
                                        <Typography variant="caption" color="text.secondary">
                                            Последнее перемещение: {new Date(task.lastMovedAt).toLocaleDateString('ru-RU')}
                                        </Typography>
                                    )}
                                </Box>
                            )}

                            <Typography variant="subtitle2" sx={{ mb: 1, color: '#2ea043' }}>
                                Связанные коммиты:
                            </Typography>
                            <Table size="small" sx={{ backgroundColor: '#f8f9fa' }}>
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
                                    {task.commits?.map((commit, idx) => (
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

const TasksTable = ({ tasks = [], kaitenCards = [] }) => {
    // Получаем все ID задач из Kaiten карточек (номера задач)
    const kaitenTaskNumbers = new Set(
        kaitenCards.flatMap(card =>
            card.commits?.map(commit => commit.taskNumber).filter(Boolean) || []
        )
    );

    // Фильтруем обычные задачи: оставляем только те, которых нет в Kaiten карточках
    const filteredTasks = tasks.filter(task => {
        // Проверяем, есть ли такой taskNumber в Kaiten карточках
        return !kaitenTaskNumbers.has(task.taskNumber);
    });

    // Сортируем Kaiten карточки по количеству коммитов
    const sortedKaitenCards = [...kaitenCards].sort(
        (a, b) => (b.commits?.length || 0) - (a.commits?.length || 0)
    );

    // Сортируем обычные задачи по количеству коммитов
    const sortedTasks = [...filteredTasks].sort(
        (a, b) => (b.commits?.length || 0) - (a.commits?.length || 0)
    );

    const hasKaitenCards = sortedKaitenCards.length > 0;
    const hasTasks = sortedTasks.length > 0;

    if (!hasKaitenCards && !hasTasks) {
        return (
            <Paper sx={{ p: 3, textAlign: 'center', borderRadius: 2 }}>
                <Typography color="text.secondary">Нет данных по задачам</Typography>
            </Paper>
        );
    }

    return (
        <Paper sx={{ borderRadius: 2, border: '1px solid rgba(0,0,0,0.08)', overflow: 'hidden' }}>
            {/* Блок с Kaiten карточками */}
            {hasKaitenCards && (
                <>
                    <Box sx={{ p: 2, backgroundColor: '#f5f5f5', borderBottom: '1px solid rgba(0,0,0,0.08)' }}>
                        <Typography variant="h6" sx={{ color: '#2ea043', display: 'flex', alignItems: 'center', gap: 1 }}>
                            🎯 Задачи Kaiten
                        </Typography>
                    </Box>
                    <TableContainer>
                        <Table>
                            <TableHead sx={{ backgroundColor: '#f5f5f5' }}>
                                <TableRow>
                                    <TableCell width="50px" />
                                    <TableCell>Номер</TableCell>
                                    <TableCell>Название</TableCell>
                                    <TableCell align="center">Статус / Приоритет</TableCell>
                                    <TableCell align="center">Коммиты</TableCell>
                                </TableRow>
                            </TableHead>
                            <TableBody>
                                {sortedKaitenCards.map((card, idx) => (
                                    <TaskRow key={`kaiten-${idx}`} task={card} isKaiten={true} />
                                ))}
                            </TableBody>
                        </Table>
                    </TableContainer>
                </>
            )}

            {/* Разделитель между блоками */}
            {hasKaitenCards && hasTasks && <Divider />}

            {/* Блок с обычными задачами */}
            {hasTasks && (
                <>
                    <Box sx={{ p: 2, backgroundColor: '#f5f5f5', borderBottom: '1px solid rgba(0,0,0,0.08)' }}>
                        <Typography variant="h6" sx={{ color: '#2ea043', display: 'flex', alignItems: 'center', gap: 1 }}>
                            📝 Коммиты без привязки к Kaiten
                        </Typography>
                    </Box>
                    <TableContainer>
                        <Table>
                            <TableHead sx={{ backgroundColor: '#f5f5f5' }}>
                                <TableRow>
                                    <TableCell width="50px" />
                                    <TableCell>Номер</TableCell>
                                    <TableCell>Название</TableCell>
                                    <TableCell align="center">Статус / Приоритет</TableCell>
                                    <TableCell align="center">Коммиты</TableCell>
                                </TableRow>
                            </TableHead>
                            <TableBody>
                                {sortedTasks.map((task, idx) => (
                                    <TaskRow key={`task-${idx}`} task={task} isKaiten={false} />
                                ))}
                            </TableBody>
                        </Table>
                    </TableContainer>
                </>
            )}
        </Paper>
    );
};

export default TasksTable;