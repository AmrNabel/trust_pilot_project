'use client';

import React from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  AppBar,
  Toolbar,
  Typography,
  Button,
  Container,
  Box,
  Avatar,
  Menu,
  MenuItem,
  IconButton,
} from '@mui/material';
import {
  Home,
  AdminPanelSettings,
  PersonOutline,
  Login,
  Logout,
  AddBusiness,
} from '@mui/icons-material';
import { useAuth } from '@/lib/contexts/AuthContext';

const Navbar: React.FC = () => {
  const { user, isAdmin, logout } = useAuth();
  const router = useRouter();
  const [anchorEl, setAnchorEl] = React.useState<null | HTMLElement>(null);

  const handleMenu = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const handleLogout = async () => {
    try {
      await logout();
      router.push('/');
    } catch (error) {
      console.error('Logout failed:', error);
    }
    handleClose();
  };

  return (
    <AppBar position='static' color='primary'>
      <Container maxWidth='lg'>
        <Toolbar sx={{ justifyContent: 'space-between' }}>
          <Link
            href='/'
            passHref
            style={{ textDecoration: 'none', color: 'inherit' }}
          >
            <Box sx={{ display: 'flex', alignItems: 'center' }}>
              <Typography
                variant='h6'
                component='div'
                sx={{ fontWeight: 'bold' }}
              >
                Trust Pilot
              </Typography>
            </Box>
          </Link>

          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <Link
              href='/'
              passHref
              style={{ textDecoration: 'none', color: 'inherit' }}
            >
              <Button
                color='inherit'
                startIcon={<Home />}
                sx={{ display: { xs: 'none', sm: 'flex' } }}
              >
                Home
              </Button>
            </Link>

            {user ? (
              <>
                {isAdmin && (
                  <Link
                    href='/admin'
                    passHref
                    style={{ textDecoration: 'none', color: 'inherit' }}
                  >
                    <Button
                      color='inherit'
                      startIcon={<AdminPanelSettings />}
                      sx={{ display: { xs: 'none', sm: 'flex' } }}
                    >
                      Admin
                    </Button>
                  </Link>
                )}

                <IconButton
                  size='large'
                  aria-label='account menu'
                  aria-controls='menu-appbar'
                  aria-haspopup='true'
                  onClick={handleMenu}
                  color='inherit'
                >
                  <Avatar
                    sx={{ width: 32, height: 32, bgcolor: 'secondary.main' }}
                  >
                    {user.email?.charAt(0).toUpperCase() || 'U'}
                  </Avatar>
                </IconButton>
                <Menu
                  id='menu-appbar'
                  anchorEl={anchorEl}
                  anchorOrigin={{
                    vertical: 'bottom',
                    horizontal: 'right',
                  }}
                  keepMounted
                  transformOrigin={{
                    vertical: 'top',
                    horizontal: 'right',
                  }}
                  open={Boolean(anchorEl)}
                  onClose={handleClose}
                >
                  {isAdmin && (
                    <MenuItem
                      onClick={() => {
                        router.push('/admin');
                        handleClose();
                      }}
                      sx={{ display: { sm: 'none' } }}
                    >
                      <AdminPanelSettings sx={{ mr: 1, fontSize: '1.2rem' }} />
                      Admin Panel
                    </MenuItem>
                  )}
                  {isAdmin && (
                    <MenuItem
                      onClick={() => {
                        router.push('/service/add');
                        handleClose();
                      }}
                    >
                      <AddBusiness sx={{ mr: 1, fontSize: '1.2rem' }} />
                      Add Service
                    </MenuItem>
                  )}
                  <MenuItem onClick={handleLogout}>
                    <Logout sx={{ mr: 1, fontSize: '1.2rem' }} />
                    Logout
                  </MenuItem>
                </Menu>
              </>
            ) : (
              <Link
                href='/login'
                passHref
                style={{ textDecoration: 'none', color: 'inherit' }}
              >
                <Button color='inherit' startIcon={<Login />}>
                  Login
                </Button>
              </Link>
            )}
          </Box>
        </Toolbar>
      </Container>
    </AppBar>
  );
};

export default Navbar;
