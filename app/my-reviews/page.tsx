'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  Container,
  Typography,
  Box,
  CircularProgress,
  Alert,
  Grid,
  Card,
  CardContent,
  CardActions,
  Button,
  Rating,
  Divider,
  Chip,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  Tooltip,
  Paper,
} from '@mui/material';
import {
  Delete as DeleteIcon,
  Edit as EditIcon,
  Visibility as VisibilityIcon,
  AccessTime as AccessTimeIcon,
  HourglassEmpty as PendingIcon,
} from '@mui/icons-material';
import { useAuth } from '@/lib/contexts/AuthContext';
import {
  getReviewsByUserId,
  deleteReview,
  getServiceById,
} from '@/lib/firestore';
import { Review, Service } from '@/lib/firestore';
import { formatDistanceToNow } from 'date-fns';
import TranslatedText from '@/app/components/TranslatedText';

export default function MyReviewsPage() {
  const router = useRouter();
  const { user, loading: authLoading } = useAuth();

  const [reviews, setReviews] = useState<
    Array<Review & { serviceName?: string }>
  >([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [reviewToDelete, setReviewToDelete] = useState<string | null>(null);
  const [deleteInProgress, setDeleteInProgress] = useState(false);

  // Authentication check
  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/login');
    }
  }, [user, authLoading, router]);

  // Fetch user reviews and service names
  useEffect(() => {
    const fetchUserReviews = async () => {
      if (!user) return;

      try {
        const fetchedReviews = await getReviewsByUserId(user.uid);

        // Fetch service names
        const reviewsWithServiceNames = await Promise.all(
          fetchedReviews.map(async (review) => {
            try {
              const service = await getServiceById(review.serviceId);
              return {
                ...review,
                serviceName: service?.name || 'Unknown Service',
              };
            } catch (err) {
              return {
                ...review,
                serviceName: 'Unknown Service',
              };
            }
          })
        );

        setReviews(reviewsWithServiceNames);
      } catch (err: any) {
        console.error('Error fetching reviews:', err);
        setError('Failed to load your reviews. Please try again later.');
      } finally {
        setLoading(false);
      }
    };

    if (user) {
      fetchUserReviews();
    }
  }, [user]);

  const handleOpenDeleteDialog = (reviewId: string) => {
    setReviewToDelete(reviewId);
    setDeleteDialogOpen(true);
  };

  const handleCloseDeleteDialog = () => {
    setDeleteDialogOpen(false);
    setReviewToDelete(null);
  };

  const handleDeleteReview = async () => {
    if (!reviewToDelete) return;

    try {
      setDeleteInProgress(true);
      await deleteReview(reviewToDelete);

      // Update reviews state
      setReviews(reviews.filter((review) => review.id !== reviewToDelete));

      // Success feedback
      handleCloseDeleteDialog();
    } catch (err) {
      console.error('Error deleting review:', err);
      setError('Failed to delete review. Please try again.');
    } finally {
      setDeleteInProgress(false);
    }
  };

  const handleEditReview = (reviewId: string, serviceId: string) => {
    router.push(`/review/edit?reviewId=${reviewId}&serviceId=${serviceId}`);
  };

  const handleViewService = (serviceId: string) => {
    router.push(`/service/${serviceId}`);
  };

  if (authLoading || (loading && user)) {
    return (
      <Container maxWidth='lg' sx={{ py: 4 }}>
        <Box sx={{ display: 'flex', justifyContent: 'center', my: 4 }}>
          <CircularProgress />
        </Box>
      </Container>
    );
  }

  if (!user) {
    return (
      <Container maxWidth='lg' sx={{ py: 4 }}>
        <Alert severity='warning'>
          You must be logged in to view your reviews. Please sign in.
        </Alert>
        <Button
          component={Link}
          href='/login'
          variant='contained'
          sx={{ mt: 2 }}
        >
          Go to Login
        </Button>
      </Container>
    );
  }

  return (
    <Container maxWidth='lg' sx={{ py: 4 }}>
      <Typography variant='h4' component='h1' gutterBottom>
        <TranslatedText textKey='myReviews' fallback='My Reviews' />
      </Typography>

      {error && (
        <Alert severity='error' sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}

      {reviews.length === 0 ? (
        <Paper elevation={2} sx={{ p: 4, textAlign: 'center', mt: 2 }}>
          <Typography variant='body1' sx={{ mb: 2 }}>
            <TranslatedText
              textKey='noReviewsYet'
              fallback="You haven't written any reviews yet."
            />
          </Typography>
          <Button component={Link} href='/' variant='contained' color='primary'>
            <TranslatedText
              textKey='exploreServices'
              fallback='Explore Services'
            />
          </Button>
        </Paper>
      ) : (
        <Grid container spacing={3}>
          {reviews.map((review) => (
            <Grid item xs={12} md={6} key={review.id}>
              <Card elevation={3}>
                <CardContent>
                  <Box
                    sx={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                    }}
                  >
                    <Typography variant='h6' component='div' sx={{ mb: 1 }}>
                      {review.serviceName}
                    </Typography>
                    {review.pending && (
                      <Tooltip title='Pending approval'>
                        <Chip
                          icon={<PendingIcon />}
                          label={
                            <TranslatedText
                              textKey='pending'
                              fallback='Pending'
                            />
                          }
                          color='warning'
                          size='small'
                        />
                      </Tooltip>
                    )}
                  </Box>

                  <Rating
                    value={review.rating}
                    readOnly
                    precision={0.5}
                    sx={{ mb: 1 }}
                  />

                  <Typography variant='body1' sx={{ mb: 2 }}>
                    {review.comment}
                  </Typography>

                  {review.imageUrl && (
                    <Box sx={{ mb: 2, textAlign: 'center' }}>
                      <img
                        src={review.imageUrl}
                        alt='Review'
                        style={{
                          maxWidth: '100%',
                          maxHeight: '200px',
                          borderRadius: '4px',
                        }}
                      />
                    </Box>
                  )}

                  <Box
                    sx={{
                      display: 'flex',
                      alignItems: 'center',
                      color: 'text.secondary',
                      mt: 1,
                    }}
                  >
                    <AccessTimeIcon fontSize='small' sx={{ mr: 0.5 }} />
                    <Typography variant='body2'>
                      {review.createdAt
                        ? formatDistanceToNow(review.createdAt.toDate(), {
                            addSuffix: true,
                          })
                        : 'Recently'}
                    </Typography>
                  </Box>
                </CardContent>

                <Divider />

                <CardActions
                  sx={{ justifyContent: 'space-between', px: 2, py: 1 }}
                >
                  <Button
                    size='small'
                    startIcon={<VisibilityIcon />}
                    onClick={() => handleViewService(review.serviceId)}
                  >
                    <TranslatedText
                      textKey='viewService'
                      fallback='View Service'
                    />
                  </Button>
                  <Box>
                    <Button
                      size='small'
                      startIcon={<EditIcon />}
                      color='primary'
                      onClick={() =>
                        handleEditReview(review.id!, review.serviceId)
                      }
                      sx={{ mr: 1 }}
                    >
                      <TranslatedText textKey='edit' fallback='Edit' />
                    </Button>
                    <Button
                      size='small'
                      startIcon={<DeleteIcon />}
                      color='error'
                      onClick={() => handleOpenDeleteDialog(review.id!)}
                    >
                      <TranslatedText textKey='delete' fallback='Delete' />
                    </Button>
                  </Box>
                </CardActions>
              </Card>
            </Grid>
          ))}
        </Grid>
      )}

      {/* Delete confirmation dialog */}
      <Dialog
        open={deleteDialogOpen}
        onClose={handleCloseDeleteDialog}
        aria-labelledby='delete-dialog-title'
      >
        <DialogTitle id='delete-dialog-title'>
          <TranslatedText
            textKey='confirmDeleteReview'
            fallback='Delete Review?'
          />
        </DialogTitle>
        <DialogContent>
          <DialogContentText>
            <TranslatedText
              textKey='deleteReviewConfirmation'
              fallback='Are you sure you want to delete this review? This action cannot be undone.'
            />
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDeleteDialog} disabled={deleteInProgress}>
            <TranslatedText textKey='cancel' fallback='Cancel' />
          </Button>
          <Button
            onClick={handleDeleteReview}
            color='error'
            autoFocus
            disabled={deleteInProgress}
            startIcon={
              deleteInProgress ? <CircularProgress size={20} /> : <DeleteIcon />
            }
          >
            <TranslatedText textKey='delete' fallback='Delete' />
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
}
