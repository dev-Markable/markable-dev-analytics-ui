import React, { useState } from 'react';
import { Paper, Typography, Box, IconButton, Collapse, Chip } from '@mui/material';
import PsychologyIcon from '@mui/icons-material/Psychology';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import ExpandLessIcon from '@mui/icons-material/ExpandLess';
import ContentCopyIcon from '@mui/icons-material/ContentCopy';

const AISummaryCard = ({ summary }) => {
    const [expanded, setExpanded] = useState(false);

    if (!summary) return null;

    return (
        <Paper
            elevation={0}
            sx={{
                p: 2,
                mb: 3,
                borderRadius: 2,
                border: '1px solid rgba(241, 196, 15, 0.3)',
                background: 'linear-gradient(135deg, rgba(241, 196, 15, 0.05) 0%, rgba(46, 160, 67, 0.05) 100%)',
                position: 'relative',
                overflow: 'hidden',
                '&::before': {
                    content: '""',
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    width: '4px',
                    height: '100%',
                    background: '#f1c40f',
                }
            }}
        >
            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <PsychologyIcon sx={{ color: '#f1c40f' }} />
                    <Typography variant="h6" sx={{ fontWeight: 500 }}>
                        AI Анализ активности
                    </Typography>
                    <Chip
                        label="beta"
                        size="small"
                        sx={{ backgroundColor: '#f1c40f', color: '#333', fontSize: '0.7rem' }}
                    />
                </Box>
                <Box>
                    <IconButton
                        onClick={() => navigator.clipboard.writeText(summary)}
                        size="small"
                        sx={{ mr: 1 }}
                        title="Копировать"
                    >
                        <ContentCopyIcon fontSize="small" />
                    </IconButton>
                    <IconButton onClick={() => setExpanded(!expanded)} size="small">
                        {expanded ? <ExpandLessIcon /> : <ExpandMoreIcon />}
                    </IconButton>
                </Box>
            </Box>

            <Collapse in={expanded} collapsedSize={100}>
                <Typography
                    variant="body2"
                    sx={{
                        mt: 2,
                        color: '#333',
                        lineHeight: 1.6,
                        whiteSpace: 'pre-wrap',
                        fontFamily: 'monospace',
                        fontSize: '0.85rem'
                    }}
                >
                    {summary}
                </Typography>
            </Collapse>

            {!expanded && (
                <Typography
                    variant="caption"
                    sx={{ display: 'block', mt: 1, color: '#666' }}
                >
                    👆 Нажмите для развертывания
                </Typography>
            )}
        </Paper>
    );
};

export default AISummaryCard;