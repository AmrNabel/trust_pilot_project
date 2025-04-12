'use client';

import React, { useState, useEffect } from 'react';
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
import { getServices } from '@/lib/firestore';
import { Service } from '@/lib/firestore';
import { useAuth } from '@/lib/contexts/AuthContext';
import Link from 'next/link';

export default function Home() {
  const { user, isAdmin } = useAuth();
  const [services, setServices] = useState<Service[]>([]);
  const [filteredServices, setFilteredServices] = useState<Service[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch services on component mount
  useEffect(() => {
    const fetchServices = async () => {
      try {
        setLoading(true);
        const servicesData = await getServices();
        setServices(servicesData);
        setFilteredServices(servicesData);
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

  // Handle search functionality
  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();

    if (!searchQuery.trim()) {
      setFilteredServices(services);
      return;
    }

    const query = searchQuery.toLowerCase();
    const filtered = services.filter(
      (service) =>
        service.name.toLowerCase().includes(query) ||
        service.category.toLowerCase().includes(query) ||
        service.location.toLowerCase().includes(query)
    );

    setFilteredServices(filtered);
  };

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
          Find and Review Services
        </Typography>

        {/* Add Service button for admins */}
        {isAdmin && (
          <Button
            component={Link}
            href='/service/add'
            variant='contained'
            color='primary'
            startIcon={<AddBusiness />}
            sx={{ ml: 2 }}
          >
            Add Service
          </Button>
        )}
      </Box>

      <Typography variant='body1' color='text.secondary' paragraph>
        Discover top-rated services in your area. Read reviews from real people
        and share your own experiences.
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
        onSubmit={handleSearch}
      >
        <InputBase
          sx={{ ml: 1, flex: 1 }}
          placeholder='Search services by name, category, or location'
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          inputProps={{ 'aria-label': 'search services' }}
        />
        <Divider sx={{ height: 28, m: 0.5 }} orientation='vertical' />
        <IconButton type='submit' sx={{ p: '10px' }} aria-label='search'>
          <SearchIcon />
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
          {filteredServices.length === 0 ? (
            <Alert severity='info'>
              No services found matching your search criteria.
            </Alert>
          ) : (
            <Grid container spacing={3}>
              {filteredServices.map((service) => (
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
