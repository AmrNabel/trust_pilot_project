import React from 'react';
import { Box, Typography, useTheme } from '@mui/material';
import Link from 'next/link';
import { RateReview } from '@mui/icons-material';

export default function NavbarLogo() {
  const theme = useTheme();

  return (
    <Box
      component={Link}
      href='/'
      sx={{
        display: 'flex',
        alignItems: 'center',
        textDecoration: 'none',
        color: 'inherit',
        position: 'relative',
        transition: theme.transitions.create(['transform', 'opacity'], {
          duration: theme.transitions.duration.shorter,
        }),
        '&:hover': {
          transform: 'translateY(-1px)',
          '& .logo-icon': {
            transform: 'rotate(-10deg) scale(1.1)',
          },
        },
      }}
    >
      <RateReview
        className='logo-icon'
        sx={{
          mr: 1.2,
          color: 'primary.main',
          fontSize: '1.8rem',
          filter: `drop-shadow(0 2px 4px ${
            theme.palette.mode === 'dark'
              ? 'rgba(0, 131, 143, 0.6)'
              : 'rgba(0, 131, 143, 0.3)'
          })`,
          transition: theme.transitions.create(['transform', 'filter'], {
            duration: theme.transitions.duration.shorter,
          }),
        }}
      />
      <Typography
        variant='h6'
        noWrap
        sx={{
          fontWeight: 800,
          letterSpacing: '.15rem',
          background:
            theme.palette.mode === 'dark'
              ? 'linear-gradient(135deg, #00acc1 0%, #00838f 100%)'
              : 'linear-gradient(135deg, #006064 0%, #00838f 100%)',
          backgroundClip: 'text',
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent',
          textShadow:
            theme.palette.mode === 'dark'
              ? '0 2px 8px rgba(0, 131, 143, 0.4)'
              : 'none',
        }}
      >
        TRUSTPILOT
      </Typography>
    </Box>
  );
}
