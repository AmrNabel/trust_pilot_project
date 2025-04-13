'use client';

import React, { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import {
  Container,
  Paper,
  Typography,
  TextField,
  Button,
  Box,
  Rating,
  Alert,
  CircularProgress,
  InputLabel,
  Stack,
  Divider,
  IconButton,
} from '@mui/material';
import {
  ArrowBack,
  Star,
  CloudUpload,
  Delete as DeleteIcon,
} from '@mui/icons-material';
import { useAuth } from '@/lib/contexts/AuthContext';
import { getServiceById, getReviewById, updateReview } from '@/lib/firestore';
import { Service, Review } from '@/lib/firestore';
import { FormSubmitEvent, RatingValue } from '@/types';
import { styled } from '@mui/material/styles';
import TranslatedText from '@/app/components/TranslatedText';

// Custom styled component for file upload
const VisuallyHiddenInput = styled('input')({
  clip: 'rect(0 0 0 0)',
  clipPath: 'inset(50%)',
  height: 1,
  overflow: 'hidden',
  position: 'absolute',
  bottom: 0,
  left: 0,
  whiteSpace: 'nowrap',
  width: 1,
});

export default function EditReviewPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const reviewId = searchParams.get('reviewId');
  const serviceId = searchParams.get('serviceId');

  const { user, loading: authLoading } = useAuth();

  const [service, setService] = useState<Service | null>(null);
  const [review, setReview] = useState<Review | null>(null);
  const [rating, setRating] = useState<RatingValue | null>(null);
  const [comment, setComment] = useState('');
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [loadingData, setLoadingData] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [notFound, setNotFound] = useState(false);
  const [unauthorized, setUnauthorized] = useState(false);
  const [removeExistingImage, setRemoveExistingImage] = useState(false);

  // Authentication check with delayed redirect to avoid flash
  useEffect(() => {
    // Check internet connection
    const isOffline = !navigator.onLine;
    if (isOffline) {
      setError(
        'You are currently offline. Please check your internet connection.'
      );
    }

    // Only redirect if auth is fully loaded and no user is found
    let redirectTimeout: NodeJS.Timeout;
    if (!authLoading && !user) {
      console.log('No user found, redirecting to login...');
      redirectTimeout = setTimeout(() => {
        router.push('/login');
      }, 500); // Short delay to avoid redirect flash
    }

    return () => {
      if (redirectTimeout) clearTimeout(redirectTimeout);
    };
  }, [user, authLoading, router]);

  // Fetch review and service details
  useEffect(() => {
    const fetchData = async () => {
      if (!reviewId || !serviceId) {
        setError('Review or service information is missing');
        setLoadingData(false);
        return;
      }

      if (!user) {
        return; // Wait for auth to complete
      }

      if (!navigator.onLine) {
        setError(
          'You are offline. Please check your internet connection to load review details.'
        );
        setLoadingData(false);
        return;
      }

      try {
        // Fetch the review
        const reviewData = await getReviewById(reviewId);
        if (!reviewData) {
          setNotFound(true);
          setLoadingData(false);
          return;
        }

        // Check if the user owns this review
        if (reviewData.userId !== user.uid) {
          setUnauthorized(true);
          setLoadingData(false);
          return;
        }

        setReview(reviewData);
        setRating(reviewData.rating as RatingValue);
        setComment(reviewData.comment);

        if (reviewData.imageUrl) {
          setPreviewUrl(reviewData.imageUrl);
        }

        // Fetch the service
        const serviceData = await getServiceById(serviceId);
        if (!serviceData) {
          setError('Service not found');
        } else {
          setService(serviceData);
        }
      } catch (err: any) {
        console.error('Error fetching data:', err);
        const errorMessage =
          err?.code === 'failed-precondition' ||
          err?.message?.includes('offline')
            ? 'Failed to load data because you are offline'
            : 'Failed to load review details';
        setError(errorMessage);
      } finally {
        setLoadingData(false);
      }
    };

    if (user) {
      fetchData();
    }
  }, [reviewId, serviceId, user]);

  // Handle image file selection
  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];

      // Check file size (limit to 5MB)
      if (file.size > 5 * 1024 * 1024) {
        setError('Image file is too large. Maximum size is 5MB.');
        return;
      }

      // Check file type
      if (!file.type.startsWith('image/')) {
        setError('Only image files are allowed.');
        return;
      }

      setImageFile(file);

      // Create preview URL
      const reader = new FileReader();
      reader.onload = () => {
        setPreviewUrl(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  // Handle form submission
  const handleSubmit = async (e: FormSubmitEvent) => {
    e.preventDefault();

    if (!navigator.onLine) {
      setError(
        'You are offline. Please check your internet connection to update a review.'
      );
      return;
    }

    if (!user) {
      setError('You must be logged in to update a review');
      return;
    }

    if (!rating) {
      setError('Please select a rating');
      return;
    }

    if (!comment.trim()) {
      setError('Please provide a comment for your review');
      return;
    }

    if (!reviewId) {
      setError('Review ID is missing');
      return;
    }

    try {
      setLoading(true);
      setError(null);

      // Prepare update data
      const updateData = {
        rating,
        comment,
      };

      // Add remove image flag
      const shouldRemoveImage = removeExistingImage && !imageFile;

      // Update the review with or without a new image
      await updateReview(
        reviewId,
        updateData,
        imageFile || undefined,
        shouldRemoveImage
      );

      setSuccess(true);

      // Redirect after 2 seconds
      setTimeout(() => {
        router.push('/my-reviews');
      }, 2000);
    } catch (err: any) {
      console.error('Error updating review:', err);
      const errorMessage =
        err?.code === 'failed-precondition' || err?.message?.includes('offline')
          ? 'Failed to update review because you are offline. Please check your internet connection.'
          : 'Failed to update review. Please try again.';
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  // Handle special cases
  if (!user) {
    return (
      <Container maxWidth='md' sx={{ py: 4 }}>
        <Alert severity='info'>
          <TranslatedText
            textKey='loginRequired'
            fallback='You need to be logged in to edit a review. Redirecting to login page...'
          />
        </Alert>
      </Container>
    );
  }

  if (loadingData) {
    return (
      <Container maxWidth='md' sx={{ py: 4 }}>
        <Box
          sx={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <CircularProgress size={24} sx={{ mr: 1 }} />
          <Typography variant='body1'>
            <TranslatedText
              textKey='loadingReview'
              fallback='Loading review details...'
            />
          </Typography>
        </Box>
      </Container>
    );
  }

  if (notFound) {
    return (
      <Container maxWidth='md' sx={{ py: 4 }}>
        <Alert severity='error' sx={{ mb: 3 }}>
          <TranslatedText
            textKey='reviewNotFound'
            fallback='Review not found. It may have been deleted.'
          />
        </Alert>
        <Button
          component={Link}
          href='/my-reviews'
          startIcon={<ArrowBack />}
          variant='contained'
        >
          <TranslatedText
            textKey='backToMyReviews'
            fallback='Back to My Reviews'
          />
        </Button>
      </Container>
    );
  }

  if (unauthorized) {
    return (
      <Container maxWidth='md' sx={{ py: 4 }}>
        <Alert severity='error' sx={{ mb: 3 }}>
          <TranslatedText
            textKey='unauthorizedReview'
            fallback='You do not have permission to edit this review.'
          />
        </Alert>
        <Button
          component={Link}
          href='/my-reviews'
          startIcon={<ArrowBack />}
          variant='contained'
        >
          <TranslatedText
            textKey='backToMyReviews'
            fallback='Back to My Reviews'
          />
        </Button>
      </Container>
    );
  }

  if (error && !service) {
    return (
      <Container maxWidth='md' sx={{ py: 4 }}>
        <Alert severity='error' sx={{ mb: 3 }}>
          {error}
        </Alert>
        <Button
          component={Link}
          href='/my-reviews'
          startIcon={<ArrowBack />}
          variant='contained'
        >
          <TranslatedText
            textKey='Back To My Reviews'
            fallback='Back to My Reviews'
          />
        </Button>
      </Container>
    );
  }

  // Image preview and delete section
  const renderImageSection = () => (
    <Box>
      <InputLabel htmlFor='image' sx={{ mb: 1 }}>
        <TranslatedText textKey='image' fallback='Image' /> (
        <TranslatedText textKey='optional' fallback='Optional' />)
      </InputLabel>
      <Button component='label' variant='outlined' startIcon={<CloudUpload />}>
        <TranslatedText textKey='uploadImage' fallback='Upload Image' />
        <VisuallyHiddenInput
          type='file'
          accept='image/*'
          onChange={handleImageChange}
        />
      </Button>
      <Typography variant='caption' display='block' sx={{ mt: 1 }}>
        <TranslatedText
          textKey='Image Requirements'
          fallback='Max size: 5MB. Formats: JPG, PNG, GIF'
        />
      </Typography>

      {previewUrl && (
        <Box sx={{ mt: 2, textAlign: 'center' }}>
          <Typography variant='subtitle2' sx={{ mb: 1 }}>
            <TranslatedText textKey='Image Preview' fallback='Image Preview' />
          </Typography>
          <Box sx={{ position: 'relative', display: 'inline-block' }}>
            <img
              src={previewUrl}
              alt='Preview'
              style={{
                maxWidth: '100%',
                maxHeight: '300px',
                objectFit: 'contain',
                borderRadius: '4px',
              }}
            />
            {!imageFile && !removeExistingImage && review?.imageUrl && (
              <IconButton
                sx={{
                  position: 'absolute',
                  top: 8,
                  right: 8,
                  bgcolor: 'rgba(255, 255, 255, 0.7)',
                  '&:hover': {
                    bgcolor: 'rgba(255, 255, 255, 0.9)',
                  },
                }}
                onClick={() => {
                  setRemoveExistingImage(true);
                  setPreviewUrl(null);
                }}
                aria-label='delete image'
              >
                <DeleteIcon />
              </IconButton>
            )}
            {imageFile && (
              <IconButton
                sx={{
                  position: 'absolute',
                  top: 8,
                  right: 8,
                  bgcolor: 'rgba(255, 255, 255, 0.7)',
                  '&:hover': {
                    bgcolor: 'rgba(255, 255, 255, 0.9)',
                  },
                }}
                onClick={() => {
                  setImageFile(null);
                  // If we had an original image and aren't removing it, restore it
                  if (review?.imageUrl && !removeExistingImage) {
                    setPreviewUrl(review.imageUrl);
                  } else {
                    setPreviewUrl(null);
                  }
                }}
                aria-label='delete image'
              >
                <DeleteIcon />
              </IconButton>
            )}
          </Box>
        </Box>
      )}

      {removeExistingImage && !imageFile && (
        <Box sx={{ mt: 2, textAlign: 'center' }}>
          <Alert severity='warning' sx={{ display: 'inline-flex', mb: 1 }}>
            <TranslatedText
              textKey='imageWillBeRemoved'
              fallback='The image will be removed from your review.'
            />
          </Alert>
          <Box>
            <Button
              variant='text'
              color='primary'
              size='small'
              onClick={() => {
                setRemoveExistingImage(false);
                if (review?.imageUrl) {
                  setPreviewUrl(review.imageUrl);
                }
              }}
            >
              <TranslatedText textKey='undoRemove' fallback='Undo removal' />
            </Button>
          </Box>
        </Box>
      )}
    </Box>
  );

  return (
    <Container maxWidth='md' sx={{ py: 4 }}>
      <Button
        component={Link}
        href='/my-reviews'
        startIcon={<ArrowBack />}
        sx={{ mb: 2 }}
      >
        <TranslatedText
          textKey='Back To My Reviews'
          fallback='Back to My Reviews'
        />
      </Button>

      <Paper elevation={3} sx={{ p: 4 }}>
        <Typography variant='h4' component='h1' gutterBottom>
          <TranslatedText textKey='Edit Review' fallback='Edit Review' />
        </Typography>

        {service && (
          <Box sx={{ mb: 3, display: 'flex', alignItems: 'center' }}>
            {service.imageUrl ? (
              <Box
                component='img'
                src={service.imageUrl}
                alt={service.name}
                sx={{
                  width: 60,
                  height: 60,
                  borderRadius: 1,
                  mr: 2,
                  objectFit: 'cover',
                }}
              />
            ) : null}
            <Box>
              <Typography variant='h6'>{service.name}</Typography>
              <Typography variant='body2' color='text.secondary'>
                {service.category} • {service.location}
              </Typography>
            </Box>
          </Box>
        )}

        <Divider sx={{ my: 2 }} />

        <Alert severity='info' sx={{ mb: 3 }}>
          <Typography variant='body1' fontWeight='medium'>
            <TranslatedText
              textKey='Edit Review Note'
              fallback='Note: After editing, your review will require approval before it appears publicly.'
            />
          </Typography>
        </Alert>

        {success ? (
          <Alert severity='success' sx={{ mb: 3 }}>
            <TranslatedText
              textKey='Review Updated'
              fallback='Your review has been updated successfully! Redirecting to your reviews...'
            />
          </Alert>
        ) : (
          <Box component='form' onSubmit={handleSubmit} noValidate>
            {error && (
              <Alert severity='error' sx={{ mb: 3 }}>
                {error}
              </Alert>
            )}

            {review && review.pending && (
              <Alert severity='info' sx={{ mb: 3 }}>
                <TranslatedText
                  textKey='reviewPendingApproval'
                  fallback='This review is pending approval. Editing will require re-approval.'
                />
              </Alert>
            )}

            <Stack spacing={3}>
              <Box>
                <InputLabel htmlFor='rating' sx={{ mb: 1 }}>
                  <TranslatedText textKey='rating' fallback='Rating' />*
                </InputLabel>
                <Rating
                  name='rating'
                  value={rating}
                  onChange={(_, newValue) => {
                    setRating(newValue as RatingValue);
                  }}
                  precision={1}
                  size='large'
                  emptyIcon={
                    <Star style={{ opacity: 0.55 }} fontSize='inherit' />
                  }
                />
              </Box>

              <TextField
                fullWidth
                label={<TranslatedText textKey='comment' fallback='Comment' />}
                multiline
                rows={4}
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                required
                placeholder='Share your experience with this service...'
              />

              {renderImageSection()}

              <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                <Button
                  component={Link}
                  href='/my-reviews'
                  variant='outlined'
                  disabled={loading}
                >
                  <TranslatedText textKey='cancel' fallback='Cancel' />
                </Button>
                <Button
                  type='submit'
                  variant='contained'
                  color='primary'
                  disabled={loading}
                  startIcon={
                    loading ? (
                      <CircularProgress size={20} color='inherit' />
                    ) : null
                  }
                >
                  <TranslatedText
                    textKey='Update Review'
                    fallback='Update Review'
                  />
                </Button>
              </Box>
            </Stack>
          </Box>
        )}
      </Paper>
    </Container>
  );
}
