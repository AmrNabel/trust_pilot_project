import React, { useState } from 'react';
import {
  AppBar,
  Box,
  Toolbar,
  IconButton,
  Typography,
  Menu,
  MenuItem,
  Container,
  Avatar,
  Button,
  Tooltip,
  useMediaQuery,
  useTheme,
  Drawer,
  List,
  ListItem,
  ListItemButton,
  ListItemText,
  ListItemIcon,
  Divider,
} from '@mui/material';
import {
  Menu as MenuIcon,
  Close as CloseIcon,
  AccountCircle,
  Login,
  Logout,
  AddBusiness,
  RateReview,
  Home,
  AdminPanelSettings,
} from '@mui/icons-material';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/contexts/AuthContext';
import ThemeToggle from './ThemeToggle';
import NavbarLogo from './NavbarLogo';

export default function Navbar() {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [userMenuAnchor, setUserMenuAnchor] = useState<null | HTMLElement>(
    null
  );
  const router = useRouter();
  const { user, isAdmin, logout } = useAuth();

  // Handle user menu opening
  const handleUserMenuOpen = (event: React.MouseEvent<HTMLElement>) => {
    setUserMenuAnchor(event.currentTarget);
  };

  // Handle user menu closing
  const handleUserMenuClose = () => {
    setUserMenuAnchor(null);
  };

  // Handle logout
  const handleLogout = async () => {
    handleUserMenuClose();
    await logout();
    router.push('/');
  };

  // Toggle drawer
  const toggleDrawer = () => {
    setDrawerOpen(!drawerOpen);
  };

  return (
    <AppBar position='sticky' color='default' elevation={1}>
      <Container maxWidth='xl'>
        <Toolbar disableGutters>
          {/* Mobile Hamburger */}
          {isMobile && (
            <IconButton
              size='large'
              aria-label='open drawer'
              edge='start'
              onClick={toggleDrawer}
              sx={{ mr: 1 }}
            >
              {drawerOpen ? <CloseIcon /> : <MenuIcon />}
            </IconButton>
          )}

          {/* Logo */}
          <NavbarLogo />

          {/* Desktop Navigation Links */}
          {!isMobile && (
            <Box sx={{ flexGrow: 1, display: 'flex', ml: 2 }}>
              <Button
                component={Link}
                href='/'
                sx={{ my: 2, color: 'text.primary', display: 'block' }}
                startIcon={<Home />}
              >
                Home
              </Button>

              {user && (
                <Button
                  component={Link}
                  href='/service/add'
                  sx={{ my: 2, color: 'text.primary', display: 'block' }}
                  startIcon={<AddBusiness />}
                >
                  Add Service
                </Button>
              )}

              {isAdmin && (
                <Button
                  component={Link}
                  href='/admin'
                  sx={{ my: 2, color: 'text.primary', display: 'block' }}
                  startIcon={<AdminPanelSettings />}
                >
                  Admin
                </Button>
              )}
            </Box>
          )}

          {/* Theme Toggle & User Menu */}
          <Box sx={{ flexGrow: 0, display: 'flex', alignItems: 'center' }}>
            <ThemeToggle />

            {user ? (
              <>
                <Tooltip title='User menu'>
                  <IconButton onClick={handleUserMenuOpen} sx={{ ml: 1 }}>
                    <Avatar
                      alt={user.displayName || 'User'}
                      src={user.photoURL || undefined}
                      sx={{ width: 32, height: 32 }}
                    >
                      {user.displayName?.[0] || <AccountCircle />}
                    </Avatar>
                  </IconButton>
                </Tooltip>
                <Menu
                  id='user-menu'
                  anchorEl={userMenuAnchor}
                  anchorOrigin={{
                    vertical: 'bottom',
                    horizontal: 'right',
                  }}
                  keepMounted
                  transformOrigin={{
                    vertical: 'top',
                    horizontal: 'right',
                  }}
                  open={Boolean(userMenuAnchor)}
                  onClose={handleUserMenuClose}
                >
                  <MenuItem onClick={handleUserMenuClose} disabled>
                    <Typography variant='body2' color='text.secondary'>
                      Signed in as:{' '}
                      <strong>{user.displayName || user.email}</strong>
                    </Typography>
                  </MenuItem>
                  <Divider />
                  <MenuItem
                    component={Link}
                    href='/profile'
                    onClick={handleUserMenuClose}
                  >
                    Profile
                  </MenuItem>
                  <MenuItem
                    component={Link}
                    href='/my-reviews'
                    onClick={handleUserMenuClose}
                  >
                    My Reviews
                  </MenuItem>
                  <Divider />
                  <MenuItem onClick={handleLogout}>
                    <ListItemIcon>
                      <Logout fontSize='small' />
                    </ListItemIcon>
                    Logout
                  </MenuItem>
                </Menu>
              </>
            ) : (
              <Button
                component={Link}
                href='/login'
                variant='contained'
                sx={{ ml: 1 }}
                startIcon={<Login />}
              >
                Sign In
              </Button>
            )}
          </Box>
        </Toolbar>
      </Container>

      {/* Mobile Drawer */}
      <Drawer
        anchor='left'
        open={drawerOpen && isMobile}
        onClose={toggleDrawer}
        sx={{
          '& .MuiDrawer-paper': {
            width: '75%',
            maxWidth: 280,
            pt: 2,
          },
        }}
      >
        <List sx={{ width: '100%' }}>
          <ListItem disablePadding>
            <ListItemButton component={Link} href='/' onClick={toggleDrawer}>
              <ListItemIcon>
                <Home />
              </ListItemIcon>
              <ListItemText primary='Home' />
            </ListItemButton>
          </ListItem>

          {user && (
            <ListItem disablePadding>
              <ListItemButton
                component={Link}
                href='/service/add'
                onClick={toggleDrawer}
              >
                <ListItemIcon>
                  <AddBusiness />
                </ListItemIcon>
                <ListItemText primary='Add Service' />
              </ListItemButton>
            </ListItem>
          )}

          {isAdmin && (
            <ListItem disablePadding>
              <ListItemButton
                component={Link}
                href='/admin'
                onClick={toggleDrawer}
              >
                <ListItemIcon>
                  <AdminPanelSettings />
                </ListItemIcon>
                <ListItemText primary='Admin Panel' />
              </ListItemButton>
            </ListItem>
          )}

          <Divider sx={{ my: 1 }} />

          {user ? (
            <>
              <ListItem disablePadding>
                <ListItemButton
                  component={Link}
                  href='/profile'
                  onClick={toggleDrawer}
                >
                  <ListItemIcon>
                    <AccountCircle />
                  </ListItemIcon>
                  <ListItemText primary='Profile' />
                </ListItemButton>
              </ListItem>
              <ListItem disablePadding>
                <ListItemButton
                  component={Link}
                  href='/my-reviews'
                  onClick={toggleDrawer}
                >
                  <ListItemIcon>
                    <RateReview />
                  </ListItemIcon>
                  <ListItemText primary='My Reviews' />
                </ListItemButton>
              </ListItem>
              <Divider sx={{ my: 1 }} />
              <ListItem disablePadding>
                <ListItemButton onClick={handleLogout}>
                  <ListItemIcon>
                    <Logout />
                  </ListItemIcon>
                  <ListItemText primary='Logout' />
                </ListItemButton>
              </ListItem>
            </>
          ) : (
            <ListItem disablePadding>
              <ListItemButton
                component={Link}
                href='/login'
                onClick={toggleDrawer}
              >
                <ListItemIcon>
                  <Login />
                </ListItemIcon>
                <ListItemText primary='Sign In' />
              </ListItemButton>
            </ListItem>
          )}
        </List>
      </Drawer>
    </AppBar>
  );
}
