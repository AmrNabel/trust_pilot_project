import React, { useState } from 'react';
import { IconButton, Tooltip, useTheme } from '@mui/material';
import {
  Brightness4,
  Brightness7,
  DarkMode,
  LightMode,
} from '@mui/icons-material';

export default function ThemeToggle() {
  const theme = useTheme();
  const [hovered, setHovered] = useState(false);

  const isDarkMode = theme.palette.mode === 'dark';

  return (
    <Tooltip
      title={`Switch to ${isDarkMode ? 'light' : 'dark'} mode`}
      arrow
      placement='bottom'
    >
      <IconButton
        color='inherit'
        sx={{
          position: 'relative',
          transition: theme.transitions.create(
            ['transform', 'background-color'],
            {
              duration: theme.transitions.duration.shorter,
            }
          ),
          borderRadius: '50%',
          p: 1,
          '&:hover': {
            backgroundColor: theme.palette.action.hover,
            transform: 'scale(1.05)',
          },
        }}
        onMouseEnter={() => setHovered(true)}
        onMouseLeave={() => setHovered(false)}
      >
        {isDarkMode ? (
          <LightMode
            sx={{
              color: 'primary.light',
              transform: hovered ? 'rotate(30deg)' : 'rotate(0deg)',
              transition: theme.transitions.create(['transform', 'color'], {
                duration: theme.transitions.duration.standard,
              }),
              filter: hovered
                ? 'drop-shadow(0 0 3px rgba(255, 235, 59, 0.7))'
                : 'none',
            }}
          />
        ) : (
          <DarkMode
            sx={{
              color: 'primary.dark',
              transform: hovered ? 'rotate(30deg)' : 'rotate(0deg)',
              transition: theme.transitions.create(['transform', 'color'], {
                duration: theme.transitions.duration.standard,
              }),
            }}
          />
        )}
      </IconButton>
    </Tooltip>
  );
}
