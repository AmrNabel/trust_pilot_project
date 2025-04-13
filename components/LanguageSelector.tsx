import React, { useState } from 'react';
import {
  Button,
  Menu,
  MenuItem,
  Typography,
  ListItemIcon,
  Badge,
  Tooltip,
  Box,
  useMediaQuery,
  useTheme,
  IconButton,
} from '@mui/material';
import {
  Language as LanguageIcon,
  Check,
  KeyboardArrowDown,
} from '@mui/icons-material';
import { useLanguage } from '@/lib/contexts/LanguageContext';
import { useTranslation } from 'react-i18next';

const LanguageSelector: React.FC = () => {
  const { t } = useTranslation();
  const { language, setLanguage } = useLanguage();
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));

  const handleMenu = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const changeLanguage = (lang: 'en' | 'ar') => {
    setLanguage(lang);
    handleClose();
  };

  // Determine the current language display
  const currentFlag = language === 'en' ? '🇺🇸' : '🇪🇬';
  const currentLanguageName = language === 'en' ? t('english') : t('arabic');

  return (
    <>
      {isMobile ? (
        <Tooltip title={t('language')}>
          <IconButton
            aria-label={t('language')}
            aria-controls='language-menu'
            aria-haspopup='true'
            onClick={handleMenu}
            color='inherit'
            sx={{ ml: 1 }}
          >
            <Badge
              badgeContent={
                <Typography
                  variant='caption'
                  component='span'
                  sx={{
                    fontSize: '0.7rem',
                    lineHeight: 1,
                    display: 'inline-flex',
                  }}
                >
                  {currentFlag}
                </Typography>
              }
              overlap='circular'
              anchorOrigin={{
                vertical: 'bottom',
                horizontal: 'right',
              }}
            >
              <LanguageIcon />
            </Badge>
          </IconButton>
        </Tooltip>
      ) : (
        <Button
          onClick={handleMenu}
          startIcon={<LanguageIcon />}
          endIcon={<KeyboardArrowDown />}
          sx={{
            ml: 1,
            border: `1px solid ${theme.palette.divider}`,
            borderRadius: 2,
            px: 2,
            py: 0.5,
            '&:hover': {
              backgroundColor: theme.palette.action.hover,
            },
          }}
          color='inherit'
        >
          <Box display='flex' alignItems='center'>
            <Box component='span' mr={1}>
              {currentFlag}
            </Box>
            <Typography variant='body2' component='span'>
              {currentLanguageName}
            </Typography>
          </Box>
        </Button>
      )}

      <Menu
        id='language-menu'
        anchorEl={anchorEl}
        keepMounted
        open={Boolean(anchorEl)}
        onClose={handleClose}
        anchorOrigin={{
          vertical: 'bottom',
          horizontal: 'right',
        }}
        transformOrigin={{
          vertical: 'top',
          horizontal: 'right',
        }}
        elevation={3}
        PaperProps={{
          sx: {
            mt: 0.5,
            border: `1px solid ${theme.palette.divider}`,
            borderRadius: 2,
          },
        }}
      >
        <MenuItem
          onClick={() => changeLanguage('en')}
          selected={language === 'en'}
          sx={{
            minWidth: '180px',
            py: 1,
            borderRadius: 1,
            mx: 0.5,
            ...(language === 'en' && {
              backgroundColor:
                theme.palette.mode === 'dark'
                  ? 'rgba(144, 202, 249, 0.16)'
                  : 'rgba(25, 118, 210, 0.08)',
            }),
          }}
        >
          <ListItemIcon>
            <Box
              component='span'
              role='img'
              aria-label='English'
              sx={{ fontSize: '1.2rem' }}
            >
              🇺🇸
            </Box>
          </ListItemIcon>
          <Typography variant='inherit' sx={{ flex: 1 }}>
            {t('english')}
          </Typography>
          {language === 'en' && <Check fontSize='small' color='primary' />}
        </MenuItem>
        <MenuItem
          onClick={() => changeLanguage('ar')}
          selected={language === 'ar'}
          sx={{
            minWidth: '180px',
            py: 1,
            borderRadius: 1,
            mx: 0.5,
            mt: 0.5,
            ...(language === 'ar' && {
              backgroundColor:
                theme.palette.mode === 'dark'
                  ? 'rgba(144, 202, 249, 0.16)'
                  : 'rgba(25, 118, 210, 0.08)',
            }),
          }}
        >
          <ListItemIcon>
            <Box
              component='span'
              role='img'
              aria-label='Arabic'
              sx={{ fontSize: '1.2rem' }}
            >
              🇪🇬
            </Box>
          </ListItemIcon>
          <Typography variant='inherit' sx={{ flex: 1 }}>
            {t('arabic')}
          </Typography>
          {language === 'ar' && <Check fontSize='small' color='primary' />}
        </MenuItem>
      </Menu>
    </>
  );
};

export default LanguageSelector;
