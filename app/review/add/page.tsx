'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';
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
  Tooltip,
  LinearProgress,
} from '@mui/material';
import { ArrowBack, Star, CloudUpload, Warning } from '@mui/icons-material';
import { useAuth } from '@/lib/contexts/AuthContext';
import { getServiceById, createReview } from '@/lib/firestore';
import { Service } from '@/lib/firestore';
import { FormSubmitEvent, RatingValue } from '@/types';
import { styled } from '@mui/material/styles';
import { ContentAnalysisResult } from '@/lib/perspective';
import { useTranslation } from 'react-i18next';
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

export default function AddReviewPage() {
  const { t } = useTranslation();
  const router = useRouter();
  const searchParams = useSearchParams();
  const serviceId = searchParams.get('serviceId');

  const { user, loading: authLoading } = useAuth();

  const [service, setService] = useState<Service | null>(null);
  const [rating, setRating] = useState<RatingValue | null>(null);
  const [comment, setComment] = useState('');
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [loadingService, setLoadingService] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  // Content analysis state
  const [analyzing, setAnalyzing] = useState(false);
  const [contentFeedback, setContentFeedback] =
    useState<ContentAnalysisResult | null>(null);
  const [showContentWarning, setShowContentWarning] = useState(false);
  const [flaggedWords, setFlaggedWords] = useState<string[]>([]);
  const [feedbackMessage, setFeedbackMessage] = useState<string | null>(null);
  const analyzeTimeoutRef = useRef<NodeJS.Timeout | null>(null);

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

  // Fetch service details
  useEffect(() => {
    const fetchServiceDetails = async () => {
      // if (!serviceId) {
      //   setError('Service ID is missing');
      //   setLoadingService(false);
      //   return;
      // }

      if (!navigator.onLine) {
        setError(
          'You are offline. Please check your internet connection to load service details.'
        );
        setLoadingService(false);
        return;
      }

      try {
        // const serviceData = await getServiceById(serviceId);
        // if (!serviceData) {
        //   setError('Service not found');
        // } else {
        //   setService(serviceData);
        // }
      } catch (err: any) {
        console.error('Error fetching service:', err);
        const errorMessage =
          err?.code === 'failed-precondition' ||
          err?.message?.includes('offline')
            ? 'Failed to load service details because you are offline'
            : 'Failed to load service details';
        setError(errorMessage);
      } finally {
        setLoadingService(false);
      }
    };

    fetchServiceDetails();
  }, [serviceId]);

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

  // Debounced content analysis
  const analyzeContent = useCallback(async (text: string) => {
    if (text.length < 5) {
      console.log('Text too short for analysis:', text);
      return; // Don't analyze very short text
    }

    if (analyzeTimeoutRef.current) {
      clearTimeout(analyzeTimeoutRef.current);
    }

    analyzeTimeoutRef.current = setTimeout(async () => {
      try {
        setAnalyzing(true);
        const response = await fetch('/api/content-analysis', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ text }),
        });

        const data = await response.json();

        if (data.success && data.result) {
          setContentFeedback(data.result);
          setShowContentWarning(!data.result.passed);
          setFlaggedWords(data.result.flaggedWords || []);
          setFeedbackMessage(data.details || null);
        }
      } catch (err) {
        console.error('Error analyzing content:', err);
        // Don't show error to user, just log it
      } finally {
        setAnalyzing(false);
      }
    }, 800); // Debounce time of 800ms
  }, []);

  // Analyze content when comment changes
  useEffect(() => {
    if (comment.length > 5) {
      analyzeContent(comment);
    } else {
      setContentFeedback(null);
      setShowContentWarning(false);
    }

    return () => {
      if (analyzeTimeoutRef.current) {
        clearTimeout(analyzeTimeoutRef.current);
      }
    };
  }, [comment, analyzeContent]);

  // Handle comment change
  const handleCommentChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newComment = e.target.value;
    setComment(newComment);
    setError(null); // Clear general errors when comment changes
  };

  // Handle form submission
  const handleSubmit = async (e: FormSubmitEvent) => {
    e.preventDefault();

    // First check if our content analysis detected any issues
    if (showContentWarning) {
      const errorMessage =
        feedbackMessage ||
        'Your review may contain inappropriate content. Please revise your comment or try more neutral language.';
      setError(errorMessage);
      console.log('Submission blocked due to content warning:', errorMessage);
      return;
    }

    if (!navigator.onLine) {
      setError(
        'You are offline. Please check your internet connection to submit a review.'
      );
      return;
    }

    if (!user) {
      setError('You must be logged in to submit a review');
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

    try {
      setLoading(true);
      setError(null);

      await createReview(
        {
          serviceId: serviceId as string,
          userId: user.uid,
          userEmail: user.email as string,
          rating,
          comment,
        },
        imageFile || undefined
      );

      setSuccess(true);

      // Clear form
      setRating(null);
      setComment('');
      setImageFile(null);
      setPreviewUrl(null);

      // Redirect after 2 seconds
      setTimeout(() => {
        router.push(`/service/${serviceId}`);
      }, 2000);
    } catch (err: any) {
      console.error('Error submitting review:', err);
      const errorMessage =
        err?.code === 'failed-precondition' || err?.message?.includes('offline')
          ? 'Failed to submit review because you are offline. Please check your internet connection.'
          : err.message || 'Failed to submit review. Please try again.';
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  if (!user) {
    return (
      <Container maxWidth='md' sx={{ py: 4 }}>
        <Alert severity='info'>
          You need to be logged in to submit a review. Redirecting to login
          page...
        </Alert>
      </Container>
    );
  }

  if (loadingService) {
    return (
      <Container maxWidth='md' sx={{ py: 4 }}>
        <CircularProgress />
        <Typography variant='body1' sx={{ ml: 2 }}>
          Loading service details...
        </Typography>
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
          href='/'
          startIcon={<ArrowBack />}
          variant='contained'
        >
          Back to Home
        </Button>
      </Container>
    );
  }

  return (
    <Container maxWidth='md' sx={{ py: 4 }}>
      <Button
        component={Link}
        href={`/service/${serviceId}`}
        startIcon={<ArrowBack />}
        sx={{ mb: 3 }}
      >
        Back to Service
      </Button>

      <Paper elevation={3} sx={{ p: 4, borderRadius: 2 }}>
        <Typography variant='h4' component='h1' gutterBottom>
          Add Review
        </Typography>

        {service && (
          <Box sx={{ mb: 3 }}>
            <Typography variant='h6'>{service.name}</Typography>
            <Typography variant='body2' color='text.secondary'>
              {service.category} • {service.location}
            </Typography>
          </Box>
        )}

        <Divider sx={{ my: 2 }} />

        {success ? (
          <Alert severity='success' sx={{ my: 2 }}>
            Your review has been submitted successfully! It will be visible
            after approval by an admin. Redirecting to service page...
          </Alert>
        ) : (
          <form onSubmit={handleSubmit}>
            {error && (
              <Alert severity='error' sx={{ mb: 3 }}>
                {error}
              </Alert>
            )}

            <Box sx={{ mb: 3 }}>
              <InputLabel htmlFor='rating' sx={{ mb: 1 }}>
                Your Rating*
              </InputLabel>
              <Rating
                name='rating'
                value={rating}
                onChange={(_, newValue) =>
                  setRating((newValue as RatingValue) || null)
                }
                precision={1}
                size='large'
                emptyIcon={
                  <Star style={{ opacity: 0.55 }} fontSize='inherit' />
                }
              />
            </Box>

            <Box sx={{ position: 'relative' }}>
              <TextField
                fullWidth
                multiline
                rows={4}
                label='Your Review*'
                value={comment}
                onChange={handleCommentChange}
                placeholder='What did you like or dislike about this service? Provide details to help others.'
                margin='normal'
                required
                inputProps={{ maxLength: 1000 }}
                helperText={`${comment.length}/1000 characters`}
                error={showContentWarning}
              />

              {/* Content analysis feedback */}
              {analyzing && (
                <LinearProgress
                  sx={{
                    mt: 1,
                    height: 4,
                    borderRadius: 2,
                  }}
                />
              )}

              {showContentWarning && contentFeedback && (
                <Box sx={{ mt: 1 }}>
                  <Alert
                    severity={
                      contentFeedback.contentType === 'educational_abuse'
                        ? 'error'
                        : 'warning'
                    }
                    icon={<Warning fontSize='inherit' />}
                    sx={{
                      alignItems: 'center',
                      bgcolor:
                        flaggedWords.length > 0 &&
                        contentFeedback.contentType === 'educational_abuse'
                          ? 'rgba(211, 47, 47, 0.2)'
                          : flaggedWords.length > 0
                          ? 'rgba(211, 47, 47, 0.1)'
                          : undefined,
                      borderLeft:
                        flaggedWords.length > 0 &&
                        contentFeedback.contentType === 'educational_abuse'
                          ? '4px solid #b71c1c'
                          : flaggedWords.length > 0
                          ? '4px solid #d32f2f'
                          : undefined,
                    }}
                  >
                    <Typography
                      variant='body2'
                      sx={{
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'flex-start',
                      }}
                    >
                      <Box sx={{ fontWeight: 'bold', mb: 1 }}>
                        {contentFeedback.contentType === 'educational_abuse' ? (
                          <TranslatedText
                            textKey='educationalAbuseWarning'
                            fallback='Your review contains inappropriate content directed at educators, which violates our community guidelines.'
                          />
                        ) : flaggedWords.some((word) =>
                            [
                              'متناك',
                              'ابن متناكة',
                              'كس',
                              'زب',
                              'طيز',
                              'نيك',
                              'شرموط',
                              'متناكة',
                              'كلب',
                              'عرص',
                            ].includes(word)
                          ) ? (
                          <TranslatedText
                            textKey='egyptianDialectWarning'
                            fallback='Your review contains inappropriate Egyptian dialect terms that are not allowed.'
                          />
                        ) : (
                          <TranslatedText
                            textKey='inappropriateContent'
                            fallback='Your review may contain inappropriate language. Please edit your review to use more constructive language.'
                          />
                        )}
                      </Box>
                      {flaggedWords.length > 0 && (
                        <Box sx={{ mt: 0.5 }}>
                          <TranslatedText
                            textKey='flaggedTerms'
                            fallback='Flagged terms:'
                          />
                          :
                          <Box
                            component='span'
                            sx={{ fontWeight: 'medium', color: 'error.main' }}
                          >
                            {flaggedWords[0]}
                          </Box>
                        </Box>
                      )}
                      <Box
                        sx={{ mt: 1, fontSize: '0.85rem', fontStyle: 'italic' }}
                      >
                        <TranslatedText
                          textKey='moderationHelp'
                          fallback='We encourage respectful and constructive feedback. Please avoid using negative or offensive language when describing your experience.'
                        />
                      </Box>
                    </Typography>
                  </Alert>
                </Box>
              )}
            </Box>

            <Box sx={{ mt: 3, mb: 3 }}>
              <InputLabel htmlFor='image-upload' sx={{ mb: 1 }}>
                Add a Photo (Optional)
              </InputLabel>
              <Button
                component='label'
                variant='outlined'
                startIcon={<CloudUpload />}
              >
                Upload Image
                <VisuallyHiddenInput
                  id='image-upload'
                  type='file'
                  accept='image/*'
                  onChange={handleImageChange}
                />
              </Button>

              {previewUrl && (
                <Box sx={{ mt: 2 }}>
                  <img
                    src={previewUrl}
                    alt='Preview'
                    style={{
                      maxWidth: '100%',
                      maxHeight: '200px',
                      objectFit: 'contain',
                      borderRadius: '4px',
                    }}
                  />
                  <Button
                    variant='text'
                    color='error'
                    size='small'
                    onClick={() => {
                      setImageFile(null);
                      setPreviewUrl(null);
                    }}
                    sx={{ mt: 1 }}
                  >
                    Remove Image
                  </Button>
                </Box>
              )}
            </Box>

            <Button
              type='submit'
              variant='contained'
              color='primary'
              size='large'
              disabled={loading || showContentWarning}
              startIcon={loading ? <CircularProgress size={20} /> : null}
            >
              {loading ? 'Submitting...' : 'Submit Review'}
            </Button>
          </form>
        )}
      </Paper>
    </Container>
  );
}
