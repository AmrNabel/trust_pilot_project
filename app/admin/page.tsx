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
} from '@mui/material';
import { AdminPanelSettings, AddBusiness } from '@mui/icons-material';
import { useAuth } from '@/lib/contexts/AuthContext';
import { getPendingReviews, updateReviewStatus } from '@/lib/firestore';
import { Review } from '@/lib/firestore';
import ReviewCard from '@/components/ReviewCard';
import Link from 'next/link';

export default function AdminPage() {
  const router = useRouter();
  const { user, isAdmin, loading: authLoading } = useAuth();

  const [pendingReviews, setPendingReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [actionInProgress, setActionInProgress] = useState(false);

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
        setLoading(true);
        const reviews = await getPendingReviews();
        setPendingReviews(reviews);
      } catch (err) {
        console.error('Error fetching pending reviews:', err);
        setError('Failed to load pending reviews');
      } finally {
        setLoading(false);
      }
    };

    if (!authLoading && user && isAdmin) {
      fetchPendingReviews();
    }
  }, [user, isAdmin, authLoading]);

  // Handle approval of a review
  const handleApprove = async (reviewId: string) => {
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
  const handleReject = async (reviewId: string) => {
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

  // Loading state
  if (authLoading || loading) {
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
          Pending Reviews
        </Typography>

        <Divider sx={{ mb: 3 }} />

        {error && (
          <Alert severity='error' sx={{ mb: 3 }}>
            {error}
          </Alert>
        )}

        {actionInProgress && (
          <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
            <CircularProgress size={20} sx={{ mr: 1 }} />
            <Typography variant='body2'>Processing...</Typography>
          </Box>
        )}

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
                    onApprove={handleApprove}
                    onReject={handleReject}
                  />
                </ListItem>
              ))}
            </List>
          </>
        )}
      </Paper>
    </Container>
  );
}
