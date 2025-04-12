import React from 'react';
import { Box, Typography } from '@mui/material';
import Link from 'next/link';
import { RateReview } from '@mui/icons-material';

export default function NavbarLogo() {
  return (
    <Box
      component={Link}
      href='/'
      sx={{
        display: 'flex',
        alignItems: 'center',
        textDecoration: 'none',
        color: 'inherit',
      }}
    >
      <RateReview sx={{ mr: 1, color: 'primary.main' }} />
      <Typography
        variant='h6'
        noWrap
        sx={{
          fontWeight: 700,
          letterSpacing: '.1rem',
        }}
      >
        TRUSTPILOT
      </Typography>
    </Box>
  );
}
