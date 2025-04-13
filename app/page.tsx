'use client';

import React, { useState, useEffect, useCallback } from 'react';
import {
  Typography,
  Grid,
  Box,
  Paper,
  InputBase,
  IconButton,
  Divider,
  Alert,
  CircularProgress,
  Skeleton,
  Button,
} from '@mui/material';
import { Search as SearchIcon, AddBusiness } from '@mui/icons-material';
import ServiceCard from '@/components/ServiceCard';
import { getServices, searchServices } from '@/lib/firestore';
import { Service } from '@/lib/firestore';
import { useAuth } from '@/lib/contexts/AuthContext';
import { useLanguage } from '@/lib/contexts/LanguageContext';
import { useTranslation } from 'react-i18next';
import Link from 'next/link';

export default function Home() {
  const { t } = useTranslation();
  const { language } = useLanguage();
  const { user, isAdmin } = useAuth();
  const [services, setServices] = useState<Service[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isSearching, setIsSearching] = useState(false);

  // Fetch all services on component mount
  useEffect(() => {
    const fetchServices = async () => {
      try {
        setLoading(true);
        const servicesData = await getServices();
        setServices(servicesData);
        setError(null);
      } catch (err) {
        console.error('Error fetching services:', err);
        setError('Failed to load services. Please try again later.');
      } finally {
        setLoading(false);
      }
    };

    fetchServices();
  }, []);

  // Debounced search function
  const debouncedSearch = useCallback(async (query: string) => {
    if (!query.trim()) {
      // If search is empty, fetch all services
      try {
        const allServices = await getServices();
        setServices(allServices);
      } catch (err) {
        console.error('Error fetching services:', err);
        setError('Failed to load services. Please try again later.');
      }
      return;
    }

    try {
      setIsSearching(true);
      const results = await searchServices(query);
      setServices(results);
      setError(null);
    } catch (err) {
      console.error('Error searching services:', err);
      setError('Failed to search services. Please try again later.');
    } finally {
      setIsSearching(false);
    }
  }, []);

  // Handle search as user types
  useEffect(() => {
    const timer = setTimeout(() => {
      debouncedSearch(searchQuery);
    }, 300); // 300ms debounce delay

    return () => clearTimeout(timer);
  }, [searchQuery, debouncedSearch]);

  return (
    <Box sx={{ py: 4 }}>
      <Box
        sx={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'flex-start',
          mb: 3,
        }}
      >
        <Typography variant='h4' component='h1' gutterBottom fontWeight='bold'>
          {t('findAndReviewServices')}
        </Typography>

        {/* Add Service button for any logged in user */}
        <Box sx={{ display: 'flex', gap: 1, alignItems: 'center' }}>
          {user && (
            <Button
              component={Link}
              href='/service/add'
              variant='contained'
              color='primary'
              startIcon={<AddBusiness />}
            >
              {t('addService')}
            </Button>
          )}
        </Box>
      </Box>

      <Typography variant='body1' color='text.secondary' paragraph>
        {t('discoverServices')}
      </Typography>

      {/* Search Bar */}
      <Paper
        component='form'
        sx={{
          p: '2px 4px',
          display: 'flex',
          alignItems: 'center',
          mb: 4,
          maxWidth: 600,
        }}
        elevation={2}
        // Remove the onSubmit handler since we're auto-searching
        onSubmit={(e) => e.preventDefault()}
      >
        <InputBase
          sx={{ ml: 1, flex: 1 }}
          placeholder={t('searchServices')}
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          inputProps={{ 'aria-label': t('searchServices') }}
        />
        <Divider sx={{ height: 28, m: 0.5 }} orientation='vertical' />
        <IconButton sx={{ p: '10px' }} aria-label='search'>
          {isSearching ? <CircularProgress size={24} /> : <SearchIcon />}
        </IconButton>
      </Paper>

      {/* Error Alert */}
      {error && (
        <Alert severity='error' sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}

      {/* Services Grid */}
      {loading ? (
        <Grid container spacing={3}>
          {Array.from(new Array(6)).map((_, index) => (
            <Grid item xs={12} sm={6} md={4} key={index}>
              <Skeleton variant='rectangular' height={200} />
            </Grid>
          ))}
        </Grid>
      ) : (
        <>
          {services.length === 0 ? (
            <Alert severity='info'>{t('noServicesFound')}</Alert>
          ) : (
            <Grid container spacing={3}>
              {services.map((service) => (
                <Grid item xs={12} sm={6} md={4} key={service.id}>
                  <ServiceCard service={service} />
                </Grid>
              ))}
            </Grid>
          )}
        </>
      )}
    </Box>
  );
}
