'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import {
  Container,
  Typography,
  Box,
  Divider,
  Alert,
  CircularProgress,
  Paper,
  Tabs,
  Tab,
  List,
  ListItem,
  Button,
  Card,
  CardContent,
  CardActions,
  Grid,
} from '@mui/material';
import {
  AdminPanelSettings,
  AddBusiness,
  CheckCircle,
  Cancel,
} from '@mui/icons-material';
import { useAuth } from '@/lib/contexts/AuthContext';
import {
  getPendingReviews,
  updateReviewStatus,
  getPendingServices,
  updateServiceStatus,
} from '@/lib/firestore';
import { Review, Service } from '@/lib/firestore';
import ReviewCard from '@/components/ReviewCard';
import Link from 'next/link';

interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

function TabPanel(props: TabPanelProps) {
  const { children, value, index, ...other } = props;

  return (
    <div
      role='tabpanel'
      hidden={value !== index}
      id={`tabpanel-${index}`}
      aria-labelledby={`tab-${index}`}
      {...other}
    >
      {value === index && <Box sx={{ pt: 3 }}>{children}</Box>}
    </div>
  );
}

export default function AdminPage() {
  const router = useRouter();
  const { user, isAdmin, loading: authLoading } = useAuth();

  const [tabValue, setTabValue] = useState(0);
  const [pendingReviews, setPendingReviews] = useState<Review[]>([]);
  const [pendingServices, setPendingServices] = useState<Service[]>([]);
  const [loadingReviews, setLoadingReviews] = useState(true);
  const [loadingServices, setLoadingServices] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [actionInProgress, setActionInProgress] = useState(false);

  const handleChangeTab = (event: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue);
  };

  // Redirect if not admin
  useEffect(() => {
    if (!authLoading && (!user || !isAdmin)) {
      router.push('/');
    }
  }, [user, isAdmin, router, authLoading]);

  // Fetch pending reviews
  useEffect(() => {
    const fetchPendingReviews = async () => {
      if (!user || !isAdmin) return;

      try {
        setLoadingReviews(true);
        const reviews = await getPendingReviews();
        setPendingReviews(reviews);
      } catch (err) {
        console.error('Error fetching pending reviews:', err);
        setError('Failed to load pending reviews');
      } finally {
        setLoadingReviews(false);
      }
    };

    // Fetch pending services
    const fetchPendingServices = async () => {
      if (!user || !isAdmin) return;

      try {
        setLoadingServices(true);
        const services = await getPendingServices();
        setPendingServices(services);
      } catch (err) {
        console.error('Error fetching pending services:', err);
        setError('Failed to load pending services');
      } finally {
        setLoadingServices(false);
      }
    };

    if (!authLoading && user && isAdmin) {
      fetchPendingReviews();
      fetchPendingServices();
    }
  }, [user, isAdmin, authLoading]);

  // Handle approval of a review
  const handleApproveReview = async (reviewId: string) => {
    try {
      setActionInProgress(true);
      await updateReviewStatus(reviewId, true);

      // Update local state
      setPendingReviews((prev) =>
        prev.filter((review) => review.id !== reviewId)
      );
    } catch (err) {
      console.error('Error approving review:', err);
      setError('Failed to approve review');
    } finally {
      setActionInProgress(false);
    }
  };

  // Handle rejection of a review
  const handleRejectReview = async (reviewId: string) => {
    try {
      setActionInProgress(true);
      await updateReviewStatus(reviewId, false);

      // Update local state
      setPendingReviews((prev) =>
        prev.filter((review) => review.id !== reviewId)
      );
    } catch (err) {
      console.error('Error rejecting review:', err);
      setError('Failed to reject review');
    } finally {
      setActionInProgress(false);
    }
  };

  // Handle approval of a service
  const handleApproveService = async (serviceId: string) => {
    try {
      setActionInProgress(true);
      await updateServiceStatus(serviceId, true);

      // Update local state
      setPendingServices((prev) =>
        prev.filter((service) => service.id !== serviceId)
      );
    } catch (err) {
      console.error('Error approving service:', err);
      setError('Failed to approve service');
    } finally {
      setActionInProgress(false);
    }
  };

  // Handle rejection of a service
  const handleRejectService = async (serviceId: string) => {
    try {
      setActionInProgress(true);
      await updateServiceStatus(serviceId, false);

      // Update local state
      setPendingServices((prev) =>
        prev.filter((service) => service.id !== serviceId)
      );
    } catch (err) {
      console.error('Error rejecting service:', err);
      setError('Failed to reject service');
    } finally {
      setActionInProgress(false);
    }
  };

  // Loading state
  if (authLoading || (loadingReviews && loadingServices)) {
    return (
      <Container maxWidth='md' sx={{ py: 4 }}>
        <Box sx={{ display: 'flex', justifyContent: 'center', py: 8 }}>
          <CircularProgress />
        </Box>
      </Container>
    );
  }

  // Not authorized
  if (!user || !isAdmin) {
    return (
      <Container maxWidth='md' sx={{ py: 4 }}>
        <Alert severity='error'>
          You don't have permission to access this page
        </Alert>
      </Container>
    );
  }

  return (
    <Container maxWidth='md' sx={{ py: 4 }}>
      <Box sx={{ display: 'flex', alignItems: 'center', mb: 3, gap: 1 }}>
        <AdminPanelSettings fontSize='large' color='primary' />
        <Typography variant='h4' component='h1'>
          Admin Dashboard
        </Typography>
      </Box>

      {/* Admin Actions */}
      <Paper elevation={2} sx={{ p: 3, mb: 4, borderRadius: 2 }}>
        <Typography variant='h5' component='h2' gutterBottom>
          Admin Actions
        </Typography>
        <Box sx={{ display: 'flex', gap: 2, mt: 2 }}>
          <Button
            component={Link}
            href='/service/add'
            variant='contained'
            color='primary'
            startIcon={<AddBusiness />}
          >
            Add New Service
          </Button>
        </Box>
      </Paper>

      <Paper elevation={2} sx={{ p: 3, mb: 4, borderRadius: 2 }}>
        <Typography variant='h5' component='h2' gutterBottom>
          Pending Approvals
        </Typography>

        <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
          <Tabs
            value={tabValue}
            onChange={handleChangeTab}
            aria-label='admin tabs'
          >
            <Tab label={`Pending Reviews (${pendingReviews.length})`} />
            <Tab label={`Pending Services (${pendingServices.length})`} />
          </Tabs>
        </Box>

        {error && (
          <Alert severity='error' sx={{ mt: 3, mb: 3 }}>
            {error}
          </Alert>
        )}

        {actionInProgress && (
          <Box sx={{ display: 'flex', alignItems: 'center', mt: 3, mb: 2 }}>
            <CircularProgress size={20} sx={{ mr: 1 }} />
            <Typography variant='body2'>Processing...</Typography>
          </Box>
        )}

        <TabPanel value={tabValue} index={0}>
          {pendingReviews.length === 0 ? (
            <Alert severity='info'>No pending reviews to moderate</Alert>
          ) : (
            <>
              <Typography variant='body2' color='text.secondary' sx={{ mb: 2 }}>
                {pendingReviews.length}{' '}
                {pendingReviews.length === 1 ? 'review' : 'reviews'} waiting for
                approval
              </Typography>

              <List sx={{ p: 0 }}>
                {pendingReviews.map((review) => (
                  <ListItem key={review.id} sx={{ px: 0, display: 'block' }}>
                    <ReviewCard
                      review={review}
                      isAdmin={true}
                      isPending={true}
                      onApprove={handleApproveReview}
                      onReject={handleRejectReview}
                    />
                  </ListItem>
                ))}
              </List>
            </>
          )}
        </TabPanel>

        <TabPanel value={tabValue} index={1}>
          {pendingServices.length === 0 ? (
            <Alert severity='info'>No pending services to moderate</Alert>
          ) : (
            <>
              <Typography variant='body2' color='text.secondary' sx={{ mb: 2 }}>
                {pendingServices.length}{' '}
                {pendingServices.length === 1 ? 'service' : 'services'} waiting
                for approval
              </Typography>

              <Grid container spacing={3}>
                {pendingServices.map((service) => (
                  <Grid item xs={12} sm={6} key={service.id}>
                    <Card elevation={2}>
                      <CardContent>
                        <Typography variant='h6' gutterBottom>
                          {service.name}
                        </Typography>
                        <Typography
                          variant='body2'
                          color='text.secondary'
                          sx={{ mb: 1 }}
                        >
                          Category: {service.category}
                        </Typography>
                        <Typography
                          variant='body2'
                          color='text.secondary'
                          sx={{ mb: 1 }}
                        >
                          Location: {service.location}
                        </Typography>
                        <Typography variant='body2'>
                          {service.description.length > 100
                            ? `${service.description.substring(0, 100)}...`
                            : service.description}
                        </Typography>
                      </CardContent>
                      <CardActions>
                        <Button
                          size='small'
                          color='success'
                          startIcon={<CheckCircle />}
                          onClick={() =>
                            service.id && handleApproveService(service.id)
                          }
                        >
                          Approve
                        </Button>
                        <Button
                          size='small'
                          color='error'
                          startIcon={<Cancel />}
                          onClick={() =>
                            service.id && handleRejectService(service.id)
                          }
                        >
                          Reject
                        </Button>
                      </CardActions>
                    </Card>
                  </Grid>
                ))}
              </Grid>
            </>
          )}
        </TabPanel>
      </Paper>
    </Container>
  );
}
