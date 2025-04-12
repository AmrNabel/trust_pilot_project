import React from 'react';
import { IconButton, Tooltip, useTheme } from '@mui/material';
import { Brightness4, Brightness7 } from '@mui/icons-material';

export default function ThemeToggle() {
  const theme = useTheme();

  return (
    <Tooltip
      title={`Switch to ${
        theme.palette.mode === 'dark' ? 'light' : 'dark'
      } mode`}
    >
      <IconButton color='inherit'>
        {theme.palette.mode === 'dark' ? <Brightness7 /> : <Brightness4 />}
      </IconButton>
    </Tooltip>
  );
}
