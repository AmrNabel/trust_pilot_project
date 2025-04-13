import React, { useState, useEffect } from 'react';
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
  Badge,
  Fade,
  Slide,
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
  Person,
} from '@mui/icons-material';
import Link from 'next/link';
import { useRouter, usePathname } from 'next/navigation';
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
  const [scrolled, setScrolled] = useState(false);
  const router = useRouter();
  const pathname = usePathname();
  const { user, isAdmin, logout } = useAuth();

  // Track scroll position for visual effects
  useEffect(() => {
    const handleScroll = () => {
      const offset = window.scrollY;
      setScrolled(offset > 10);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

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

  // Check if link is active
  const isActive = (path: string) => pathname === path;

  return (
    <Slide appear={false} direction='down' in={!scrolled}>
      <AppBar
        position='sticky'
        color='default'
        elevation={scrolled ? 4 : 0}
        sx={{
          transition: theme.transitions.create(
            ['background-color', 'box-shadow'],
            {
              duration: theme.transitions.duration.standard,
            }
          ),
          backdropFilter: 'blur(10px)',
          backgroundColor: scrolled
            ? theme.palette.mode === 'dark'
              ? 'rgba(18, 18, 18, 0.9)'
              : 'rgba(255, 255, 255, 0.9)'
            : theme.palette.mode === 'dark'
            ? 'rgba(18, 18, 18, 0.7)'
            : 'rgba(255, 255, 255, 0.7)',
        }}
      >
        <Container maxWidth='xl'>
          <Toolbar
            disableGutters
            sx={{
              py: 0.5,
              transition: theme.transitions.create('padding', {
                duration: theme.transitions.duration.standard,
              }),
            }}
          >
            {/* Mobile Hamburger */}
            {isMobile && (
              <Fade in={true}>
                <IconButton
                  size='large'
                  aria-label='open drawer'
                  edge='start'
                  onClick={toggleDrawer}
                  sx={{
                    mr: 1,
                    transition: theme.transitions.create('transform', {
                      duration: theme.transitions.duration.shorter,
                    }),
                    transform: drawerOpen ? 'rotate(180deg)' : 'rotate(0deg)',
                  }}
                >
                  {drawerOpen ? <CloseIcon /> : <MenuIcon />}
                </IconButton>
              </Fade>
            )}

            {/* Logo */}
            <NavbarLogo />

            {/* Desktop Navigation Links */}
            {!isMobile && (
              <Box
                sx={{
                  flexGrow: 1,
                  display: 'flex',
                  ml: 3,
                  gap: 0.5,
                }}
              >
                <Button
                  component={Link}
                  href='/'
                  sx={{
                    color: isActive('/') ? 'primary.main' : 'text.primary',
                    position: 'relative',
                    fontWeight: isActive('/') ? 600 : 500,
                    px: 2,
                    '&::after': {
                      content: '""',
                      position: 'absolute',
                      bottom: 6,
                      left: 12,
                      right: 12,
                      height: 3,
                      borderRadius: 1.5,
                      bgcolor: 'primary.main',
                      transform: isActive('/') ? 'scaleX(1)' : 'scaleX(0)',
                      transition: theme.transitions.create('transform', {
                        duration: theme.transitions.duration.shorter,
                      }),
                      opacity: 0.8,
                    },
                    '&:hover::after': {
                      transform: 'scaleX(1)',
                      opacity: 0.4,
                    },
                  }}
                  startIcon={<Home />}
                >
                  {t('home')}
                </Button>

                {user && (
                  <Button
                    component={Link}
                    href='/service/add'
                    sx={{
                      color: isActive('/service/add')
                        ? 'primary.main'
                        : 'text.primary',
                      position: 'relative',
                      fontWeight: isActive('/service/add') ? 600 : 500,
                      px: 2,
                      '&::after': {
                        content: '""',
                        position: 'absolute',
                        bottom: 6,
                        left: 12,
                        right: 12,
                        height: 3,
                        borderRadius: 1.5,
                        bgcolor: 'primary.main',
                        transform: isActive('/service/add')
                          ? 'scaleX(1)'
                          : 'scaleX(0)',
                        transition: theme.transitions.create('transform', {
                          duration: theme.transitions.duration.shorter,
                        }),
                        opacity: 0.8,
                      },
                      '&:hover::after': {
                        transform: 'scaleX(1)',
                        opacity: 0.4,
                      },
                    }}
                    startIcon={<AddBusiness />}
                  >
                    {t('addService')}
                  </Button>
                )}

                {isAdmin && (
                  <Button
                    component={Link}
                    href='/admin'
                    sx={{
                      color: isActive('/admin')
                        ? 'primary.main'
                        : 'text.primary',
                      position: 'relative',
                      fontWeight: isActive('/admin') ? 600 : 500,
                      px: 2,
                      '&::after': {
                        content: '""',
                        position: 'absolute',
                        bottom: 6,
                        left: 12,
                        right: 12,
                        height: 3,
                        borderRadius: 1.5,
                        bgcolor: 'primary.main',
                        transform: isActive('/admin')
                          ? 'scaleX(1)'
                          : 'scaleX(0)',
                        transition: theme.transitions.create('transform', {
                          duration: theme.transitions.duration.shorter,
                        }),
                        opacity: 0.8,
                      },
                      '&:hover::after': {
                        transform: 'scaleX(1)',
                        opacity: 0.4,
                      },
                    }}
                    startIcon={<AdminPanelSettings />}
                  >
                    {t('adminPanel')}
                  </Button>
                )}
              </Box>
            )}

            {/* Theme Toggle, Language Selector & User Menu */}
            <Box
              sx={{
                flexGrow: 0,
                display: 'flex',
                alignItems: 'center',
                gap: 0.5,
              }}
            >
              <Fade in={true}>
                <Box sx={{ mr: 0.5 }}>
                  <ThemeToggle />
                </Box>
              </Fade>

              <Fade in={true} style={{ transitionDelay: '50ms' }}>
                <Box>
                  <LanguageSelector />
                </Box>
              </Fade>

              {user ? (
                <Fade in={true} style={{ transitionDelay: '100ms' }}>
                  <>
                    <Tooltip title={t('profile')}>
                      <IconButton
                        onClick={handleUserMenuOpen}
                        sx={{
                          ml: 1,
                          transition: theme.transitions.create('transform', {
                            duration: theme.transitions.duration.shorter,
                          }),
                          '&:hover': {
                            transform: 'scale(1.05)',
                          },
                        }}
                      >
                        <Avatar
                          alt={user.displayName || 'User'}
                          src={user.photoURL || undefined}
                          sx={{
                            width: 36,
                            height: 36,
                            border: '2px solid',
                            borderColor: 'primary.main',
                          }}
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
                      TransitionComponent={Fade}
                      sx={{
                        '& .MuiPaper-root': {
                          borderRadius: 2,
                          minWidth: 180,
                          boxShadow:
                            theme.palette.mode === 'dark'
                              ? '0 4px 20px rgba(0,0,0,0.5)'
                              : '0 4px 20px rgba(0,0,0,0.1)',
                        },
                      }}
                    >
                      <Box sx={{ px: 2, py: 1 }}>
                        <Typography variant='body2' color='text.secondary'>
                          {t('signedInAs')}{' '}
                        </Typography>
                        <Typography variant='subtitle2' fontWeight={600} noWrap>
                          {user.displayName || user.email}
                        </Typography>
                      </Box>
                      <Divider sx={{ my: 1 }} />
                      <MenuItem
                        component={Link}
                        href='/profile'
                        onClick={handleUserMenuClose}
                        sx={{
                          borderRadius: 1,
                          mx: 1,
                          width: 'calc(100% - 16px)',
                        }}
                      >
                        <ListItemIcon>
                          <Person fontSize='small' />
                        </ListItemIcon>
                        {t('profile')}
                      </MenuItem>
                      <MenuItem
                        component={Link}
                        href='/my-reviews'
                        onClick={handleUserMenuClose}
                        sx={{
                          borderRadius: 1,
                          mx: 1,
                          width: 'calc(100% - 16px)',
                        }}
                      >
                        <ListItemIcon>
                          <RateReview fontSize='small' />
                        </ListItemIcon>
                        {t('myReviews')}
                      </MenuItem>
                      <Divider sx={{ my: 1 }} />
                      <MenuItem
                        onClick={handleLogout}
                        sx={{
                          borderRadius: 1,
                          mx: 1,
                          width: 'calc(100% - 16px)',
                        }}
                      >
                        <ListItemIcon>
                          <Logout fontSize='small' />
                        </ListItemIcon>
                        {t('logout')}
                      </MenuItem>
                    </Menu>
                  </>
                </Fade>
              ) : (
                <Fade in={true} style={{ transitionDelay: '100ms' }}>
                  <Button
                    component={Link}
                    href='/login'
                    variant='contained'
                    sx={{
                      ml: 1,
                      fontWeight: 600,
                      px: 2,
                      py: 1,
                      boxShadow:
                        theme.palette.mode === 'dark'
                          ? '0 4px 12px rgba(0,131,143,0.6)'
                          : '0 4px 12px rgba(0,131,143,0.3)',
                      transition: theme.transitions.create(
                        ['transform', 'box-shadow'],
                        {
                          duration: theme.transitions.duration.shorter,
                        }
                      ),
                      '&:hover': {
                        transform: 'translateY(-2px)',
                        boxShadow:
                          theme.palette.mode === 'dark'
                            ? '0 6px 16px rgba(0,131,143,0.8)'
                            : '0 6px 16px rgba(0,131,143,0.5)',
                      },
                    }}
                    startIcon={<Login />}
                  >
                    {t('signIn')}
                  </Button>
                </Fade>
              )}
            </Box>

            {/* Mobile Drawer */}
            <Drawer
              anchor='left'
              open={isMobile && drawerOpen}
              onClose={toggleDrawer}
              sx={{
                '& .MuiDrawer-paper': {
                  boxSizing: 'border-box',
                  width: 280,
                  borderRadius: '0 16px 16px 0',
                },
              }}
              transitionDuration={300}
            >
              <Box sx={{ p: 2.5 }}>
                <Box
                  sx={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    mb: 2,
                  }}
                >
                  <NavbarLogo />
                  <Box sx={{ display: 'flex', gap: 0.5 }}>
                    <ThemeToggle />
                    <LanguageSelector />
                  </Box>
                </Box>
                <Divider sx={{ my: 1 }} />

                {user && (
                  <Box
                    sx={{
                      mb: 2,
                      mt: 1.5,
                      display: 'flex',
                      alignItems: 'center',
                      gap: 1.5,
                    }}
                  >
                    <Avatar
                      alt={user.displayName || 'User'}
                      src={user.photoURL || undefined}
                      sx={{
                        width: 42,
                        height: 42,
                        border: '2px solid',
                        borderColor: 'primary.main',
                      }}
                    >
                      {user.displayName?.[0] || <AccountCircle />}
                    </Avatar>
                    <Box>
                      <Typography variant='body2' color='text.secondary'>
                        {t('signedInAs')}
                      </Typography>
                      <Typography variant='subtitle2' fontWeight={600} noWrap>
                        {user.displayName || user.email}
                      </Typography>
                    </Box>
                  </Box>
                )}

                <List sx={{ pt: 0 }}>
                  <ListItem disablePadding>
                    <ListItemButton
                      component={Link}
                      href='/'
                      onClick={toggleDrawer}
                      sx={{
                        borderRadius: 2,
                        mb: 0.5,
                        bgcolor: isActive('/')
                          ? 'action.selected'
                          : 'transparent',
                      }}
                    >
                      <ListItemIcon>
                        <Home color={isActive('/') ? 'primary' : 'inherit'} />
                      </ListItemIcon>
                      <ListItemText
                        primary={t('home')}
                        primaryTypographyProps={{
                          fontWeight: isActive('/') ? 600 : 400,
                          color: isActive('/')
                            ? 'primary.main'
                            : 'text.primary',
                        }}
                      />
                    </ListItemButton>
                  </ListItem>

                  {user && (
                    <ListItem disablePadding>
                      <ListItemButton
                        component={Link}
                        href='/service/add'
                        onClick={toggleDrawer}
                        sx={{
                          borderRadius: 2,
                          mb: 0.5,
                          bgcolor: isActive('/service/add')
                            ? 'action.selected'
                            : 'transparent',
                        }}
                      >
                        <ListItemIcon>
                          <AddBusiness
                            color={
                              isActive('/service/add') ? 'primary' : 'inherit'
                            }
                          />
                        </ListItemIcon>
                        <ListItemText
                          primary={t('addService')}
                          primaryTypographyProps={{
                            fontWeight: isActive('/service/add') ? 600 : 400,
                            color: isActive('/service/add')
                              ? 'primary.main'
                              : 'text.primary',
                          }}
                        />
                      </ListItemButton>
                    </ListItem>
                  )}

                  {isAdmin && (
                    <ListItem disablePadding>
                      <ListItemButton
                        component={Link}
                        href='/admin'
                        onClick={toggleDrawer}
                        sx={{
                          borderRadius: 2,
                          mb: 0.5,
                          bgcolor: isActive('/admin')
                            ? 'action.selected'
                            : 'transparent',
                        }}
                      >
                        <ListItemIcon>
                          <AdminPanelSettings
                            color={isActive('/admin') ? 'primary' : 'inherit'}
                          />
                        </ListItemIcon>
                        <ListItemText
                          primary={t('adminPanel')}
                          primaryTypographyProps={{
                            fontWeight: isActive('/admin') ? 600 : 400,
                            color: isActive('/admin')
                              ? 'primary.main'
                              : 'text.primary',
                          }}
                        />
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
                          sx={{
                            borderRadius: 2,
                            mb: 0.5,
                            bgcolor: isActive('/profile')
                              ? 'action.selected'
                              : 'transparent',
                          }}
                        >
                          <ListItemIcon>
                            <Person
                              color={
                                isActive('/profile') ? 'primary' : 'inherit'
                              }
                            />
                          </ListItemIcon>
                          <ListItemText
                            primary={t('profile')}
                            primaryTypographyProps={{
                              fontWeight: isActive('/profile') ? 600 : 400,
                              color: isActive('/profile')
                                ? 'primary.main'
                                : 'text.primary',
                            }}
                          />
                        </ListItemButton>
                      </ListItem>
                      <ListItem disablePadding>
                        <ListItemButton
                          component={Link}
                          href='/my-reviews'
                          onClick={toggleDrawer}
                          sx={{
                            borderRadius: 2,
                            mb: 0.5,
                            bgcolor: isActive('/my-reviews')
                              ? 'action.selected'
                              : 'transparent',
                          }}
                        >
                          <ListItemIcon>
                            <RateReview
                              color={
                                isActive('/my-reviews') ? 'primary' : 'inherit'
                              }
                            />
                          </ListItemIcon>
                          <ListItemText
                            primary={t('myReviews')}
                            primaryTypographyProps={{
                              fontWeight: isActive('/my-reviews') ? 600 : 400,
                              color: isActive('/my-reviews')
                                ? 'primary.main'
                                : 'text.primary',
                            }}
                          />
                        </ListItemButton>
                      </ListItem>
                      <Divider sx={{ my: 1.5 }} />
                      <ListItem disablePadding>
                        <ListItemButton
                          onClick={handleLogout}
                          sx={{
                            borderRadius: 2,
                            bgcolor: 'error.main',
                            color: 'white',
                            '&:hover': {
                              bgcolor: 'error.dark',
                            },
                          }}
                        >
                          <ListItemIcon>
                            <Logout sx={{ color: 'white' }} />
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
                        sx={{
                          borderRadius: 2,
                          mt: 1,
                          bgcolor: 'primary.main',
                          color: 'white',
                          '&:hover': {
                            bgcolor: 'primary.dark',
                          },
                        }}
                      >
                        <ListItemIcon>
                          <Login sx={{ color: 'white' }} />
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
    </Slide>
  );
}
