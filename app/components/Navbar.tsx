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
import { useTranslation } from 'react-i18next';
import ThemeToggle from './ThemeToggle';
import NavbarLogo from './NavbarLogo';
import LanguageSelector from '@/components/LanguageSelector';

export default function Navbar() {
  const { t } = useTranslation();
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
                {t('home')}
              </Button>

              {user && (
                <Button
                  component={Link}
                  href='/service/add'
                  sx={{ my: 2, color: 'text.primary', display: 'block' }}
                  startIcon={<AddBusiness />}
                >
                  {t('addService')}
                </Button>
              )}

              {isAdmin && (
                <Button
                  component={Link}
                  href='/admin'
                  sx={{ my: 2, color: 'text.primary', display: 'block' }}
                  startIcon={<AdminPanelSettings />}
                >
                  {t('adminPanel')}
                </Button>
              )}
            </Box>
          )}

          {/* Theme Toggle, Language Selector & User Menu */}
          <Box sx={{ flexGrow: 0, display: 'flex', alignItems: 'center' }}>
            <ThemeToggle />
            <LanguageSelector />

            {user ? (
              <>
                <Tooltip title={t('profile')}>
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
                      {t('signedInAs')}{' '}
                      <strong>{user.displayName || user.email}</strong>
                    </Typography>
                  </MenuItem>
                  <Divider />
                  <MenuItem
                    component={Link}
                    href='/profile'
                    onClick={handleUserMenuClose}
                  >
                    {t('profile')}
                  </MenuItem>
                  <MenuItem
                    component={Link}
                    href='/my-reviews'
                    onClick={handleUserMenuClose}
                  >
                    {t('myReviews')}
                  </MenuItem>
                  <Divider />
                  <MenuItem onClick={handleLogout}>
                    <ListItemIcon>
                      <Logout fontSize='small' />
                    </ListItemIcon>
                    {t('logout')}
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
                {t('signIn')}
              </Button>
            )}
          </Box>

          {/* Mobile Drawer */}
          <Drawer
            anchor='left'
            open={isMobile && drawerOpen}
            onClose={toggleDrawer}
            sx={{
              '& .MuiDrawer-paper': { boxSizing: 'border-box', width: 240 },
            }}
          >
            <Box sx={{ p: 2 }}>
              <Box
                sx={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  mb: 1,
                }}
              >
                <NavbarLogo />
                <Box sx={{ display: 'flex' }}>
                  <ThemeToggle />
                  <LanguageSelector />
                </Box>
              </Box>
              <Divider sx={{ my: 1 }} />
              <List>
                <ListItem disablePadding>
                  <ListItemButton
                    component={Link}
                    href='/'
                    onClick={toggleDrawer}
                  >
                    <ListItemIcon>
                      <Home />
                    </ListItemIcon>
                    <ListItemText primary={t('home')} />
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
                      <ListItemText primary={t('addService')} />
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
                      <ListItemText primary={t('adminPanel')} />
                    </ListItemButton>
                  </ListItem>
                )}

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
                        <ListItemText primary={t('profile')} />
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
                        <ListItemText primary={t('myReviews')} />
                      </ListItemButton>
                    </ListItem>
                    <Divider sx={{ my: 1 }} />
                    <ListItem disablePadding>
                      <ListItemButton onClick={handleLogout}>
                        <ListItemIcon>
                          <Logout />
                        </ListItemIcon>
                        <ListItemText primary={t('logout')} />
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
                      <ListItemText primary={t('signIn')} />
                    </ListItemButton>
                  </ListItem>
                )}
              </List>
            </Box>
          </Drawer>
        </Toolbar>
      </Container>
    </AppBar>
  );
}
