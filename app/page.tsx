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
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Chip,
  Stack,
  SelectChangeEvent,
} from '@mui/material';
import {
  Search as SearchIcon,
  AddBusiness,
  FilterList,
} from '@mui/icons-material';
import ServiceCard from '@/components/ServiceCard';
import { getServices, searchServices } from '@/lib/firestore';
import { Service } from '@/lib/firestore';
import { useAuth } from '@/lib/contexts/AuthContext';
import { useLanguage } from '@/lib/contexts/LanguageContext';
import { useTranslation } from 'react-i18next';
import Link from 'next/link';
import { ServiceCategory } from '@/types';

// Array of service categories
const SERVICE_CATEGORIES: ServiceCategory[] = [
  'Restaurants',
  'Retail',
  'Healthcare',
  'Technology',
  'Education',
  'Financial',
  'Home Services',
  'Professional Services',
  'Travel',
  'Entertainment',
  'Beauty & Spa',
  'Automotive',
  'Fitness',
  'Construction',
  'Legal Services',
  'Cleaning Services',
  'Pet Services',
  'Event Planning',
  'Photography',
  'Barbers & Salons',
  'Real Estate',
  'Transportation',
  'Other',
];

export default function Home() {
  const { t } = useTranslation();
  const { language } = useLanguage();
  const { user, isAdmin } = useAuth();
  const [services, setServices] = useState<Service[]>([]);
  const [allServices, setAllServices] = useState<Service[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('');
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
        setAllServices(servicesData);
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

  // Handle category change
  const handleCategoryChange = (event: SelectChangeEvent<string>) => {
    const category = event.target.value;
    setSelectedCategory(category);
    // The search will be triggered by the useEffect that watches selectedCategory
  };

  // Clear all filters
  const clearFilters = () => {
    setSelectedCategory('');
    setSearchQuery('');
    setServices(allServices);
  };

  // Debounced search function
  const debouncedSearch = useCallback(
    async (query: string) => {
      if (!query.trim() && !selectedCategory) {
        // If no filters are applied, show all services
        setServices(allServices);
        return;
      }

      try {
        setIsSearching(true);
        const results = await searchServices(
          query,
          selectedCategory || undefined
        );
        setServices(results);
        setError(null);
      } catch (err) {
        console.error('Error searching services:', err);
        setError('Failed to search services. Please try again later.');
      } finally {
        setIsSearching(false);
      }
    },
    [selectedCategory, allServices]
  );

  // Handle search as user types
  useEffect(() => {
    const timer = setTimeout(() => {
      debouncedSearch(searchQuery);
    }, 300); // 300ms debounce delay

    return () => clearTimeout(timer);
  }, [searchQuery, debouncedSearch]);

  // Also trigger search when category changes
  useEffect(() => {
    debouncedSearch(searchQuery);
  }, [selectedCategory, debouncedSearch, searchQuery]);

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

      {/* Search and Filter Section */}
      <Box sx={{ mb: 4 }}>
        <Grid container spacing={2} alignItems='center'>
          <Grid item xs={12} md={6}>
            {/* Search Bar */}
            <Paper
              component='form'
              sx={{
                p: '2px 4px',
                display: 'flex',
                alignItems: 'center',
              }}
              elevation={2}
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
          </Grid>

          <Grid item xs={12} md={6}>
            {/* Category Filter */}
            <Box sx={{ display: 'flex', gap: 2, alignItems: 'center' }}>
              <FormControl fullWidth variant='outlined' size='small'>
                <InputLabel id='category-filter-label'>
                  <Box sx={{ display: 'flex', alignItems: 'center' }}>
                    <FilterList sx={{ mr: 0.5, fontSize: '1rem' }} />
                    {t('filterByCategory')}
                  </Box>
                </InputLabel>
                <Select
                  labelId='category-filter-label'
                  value={selectedCategory}
                  onChange={handleCategoryChange}
                  label={t('filterByCategory')}
                >
                  <MenuItem value=''>
                    <em>{t('allCategories')}</em>
                  </MenuItem>
                  {SERVICE_CATEGORIES.map((category) => (
                    <MenuItem key={category} value={category}>
                      {category}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>

              {(selectedCategory || searchQuery) && (
                <Button variant='outlined' size='small' onClick={clearFilters}>
                  {t('clearFilters')}
                </Button>
              )}
            </Box>
          </Grid>
        </Grid>
      </Box>

      {/* Active Filters */}
      {(selectedCategory || searchQuery) && (
        <Box sx={{ mb: 3 }}>
          <Typography variant='body2' color='text.secondary' sx={{ mb: 1 }}>
            {t('activeFilters')}:
          </Typography>
          <Stack direction='row' spacing={1}>
            {searchQuery && (
              <Chip
                label={`${t('search')}: ${searchQuery}`}
                onDelete={() => setSearchQuery('')}
              />
            )}
            {selectedCategory && (
              <Chip
                label={`${t('category')}: ${selectedCategory}`}
                onDelete={() => setSelectedCategory('')}
              />
            )}
          </Stack>
        </Box>
      )}

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
