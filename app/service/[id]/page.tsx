'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import {
  Typography,
  Box,
  Chip,
  Divider,
  Rating,
  Button,
  Paper,
  Alert,
  Skeleton,
  List,
  ListItem,
  Card,
} from '@mui/material';
import {
  Star,
  LocationOn,
  Category,
  RateReview,
  ArrowBack,
  Store,
} from '@mui/icons-material';
import { useAuth } from '@/lib/contexts/AuthContext';
import { getServiceById, getReviewsByServiceId } from '@/lib/firestore';
import { Service, Review } from '@/lib/firestore';
import ReviewCard from '@/components/ReviewCard';
import { useTranslation } from 'react-i18next';

interface ServicePageProps {
  params: {
    id: string;
  };
}

export default function ServicePage({ params }: ServicePageProps) {
  const { id } = params;
  const { user } = useAuth();
  const router = useRouter();
  const { t } = useTranslation();

  const [service, setService] = useState<Service | null>(null);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchServiceDetails = async () => {
      try {
        setLoading(true);

        // Fetch service details
        const serviceData = await getServiceById(id);
        if (!serviceData) {
          setError('Service not found');
          return;
        }
        setService(serviceData);

        // Fetch approved reviews for the service
        const reviewsData = await getReviewsByServiceId(id);
        setReviews(reviewsData);
      } catch (err) {
        console.error('Error fetching service details:', err);
        setError('Failed to load service details. Please try again later.');
      } finally {
        setLoading(false);
      }
    };

    fetchServiceDetails();
  }, [id]);

  const handleAddReview = () => {
    if (!user) {
      router.push('/login');
      return;
    }

    router.push(`/review/add?serviceId=${id}`);
  };

  if (loading) {
    return (
      <Box sx={{ py: 4 }}>
        <Skeleton variant='text' height={60} width='70%' />
        <Box sx={{ display: 'flex', mt: 2, mb: 3, gap: 1 }}>
          <Skeleton variant='text' width={100} />
          <Skeleton variant='text' width={150} />
        </Box>
        <Skeleton variant='rectangular' height={300} sx={{ mb: 4 }} />
        <Skeleton variant='rectangular' height={100} sx={{ mb: 4 }} />

        <Divider sx={{ my: 4 }} />

        <Skeleton variant='text' height={40} width='40%' sx={{ mb: 2 }} />
        {Array.from(new Array(3)).map((_, index) => (
          <Skeleton
            key={index}
            variant='rectangular'
            height={150}
            sx={{ mb: 2 }}
          />
        ))}
      </Box>
    );
  }

  if (error || !service) {
    return (
      <Box sx={{ py: 4 }}>
        <Alert severity='error' sx={{ mb: 3 }}>
          {error || 'Service not found'}
        </Alert>
        <Button
          component={Link}
          href='/'
          startIcon={<ArrowBack />}
          variant='contained'
        >
          Back to Home
        </Button>
      </Box>
    );
  }

  const {
    name,
    category,
    location,
    description,
    imageUrl,
    averageRating = 0,
    reviewCount = 0,
    distractions = [],
  } = service;

  return (
    <Box sx={{ py: 4 }}>
      <Button
        component={Link}
        href='/'
        startIcon={<ArrowBack />}
        sx={{ mb: 3 }}
      >
        Back to Services
      </Button>

      <Typography variant='h4' component='h1' gutterBottom fontWeight='bold'>
        {name}
      </Typography>

      <Box
        sx={{
          display: 'flex',
          flexWrap: 'wrap',
          gap: 2,
          mb: 3,
          alignItems: 'center',
        }}
      >
        <Box sx={{ display: 'flex', alignItems: 'center' }}>
          <Category fontSize='small' color='action' sx={{ mr: 0.5 }} />
          <Chip label={category} color='primary' />
        </Box>

        <Box sx={{ display: 'flex', alignItems: 'center' }}>
          <LocationOn fontSize='small' color='action' sx={{ mr: 0.5 }} />
          <Typography variant='body1'>{location}</Typography>
        </Box>

        <Box sx={{ display: 'flex', alignItems: 'center' }}>
          <Star fontSize='small' color='action' sx={{ mr: 0.5 }} />
          <Rating value={averageRating} precision={0.5} readOnly />
          <Typography variant='body2' sx={{ ml: 0.5 }}>
            ({averageRating.toFixed(1)})
          </Typography>
          <Typography variant='body2' color='text.secondary' sx={{ ml: 1 }}>
            {reviewCount} {reviewCount === 1 ? 'review' : 'reviews'}
          </Typography>
        </Box>
      </Box>

      {/* District Section */}
      {distractions && distractions.length > 0 && (
        <Box sx={{ mb: 3 }}>
          <Typography variant='subtitle1' fontWeight='medium' gutterBottom>
            {t('District')}:
          </Typography>
          <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
            {distractions.map((district: string) => (
              <Chip
                key={district}
                label={district}
                color='primary'
                variant='outlined'
                size='medium'
                icon={<LocationOn />}
                sx={{
                  borderRadius: '4px',
                  fontSize: '0.9rem',
                  px: 1,
                }}
              />
            ))}
          </Box>
        </Box>
      )}

      {/* Service Image */}
      {imageUrl && (
        <Card
          sx={{
            mb: 4,
            overflow: 'hidden',
            borderRadius: 2,
            boxShadow: 2,
          }}
        >
          <Box
            sx={{
              position: 'relative',
              width: '100%',
              height: { xs: 200, sm: 300, md: 400 },
              backgroundColor: 'action.hover',
            }}
          >
            <Image
              src={imageUrl}
              alt={name}
              fill
              style={{ objectFit: 'contain' }}
              sizes='(max-width: 600px) 100vw, (max-width: 960px) 50vw, 33vw'
            />
          </Box>
        </Card>
      )}

      <Paper elevation={1} sx={{ p: 3, mb: 4, borderRadius: 2 }}>
        <Typography variant='h6' gutterBottom>
          About this service
        </Typography>
        <Typography variant='body1' paragraph>
          {description}
        </Typography>
      </Paper>

      <Box
        sx={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          mb: 2,
        }}
      >
        <Typography variant='h5' component='h2'>
          Reviews
        </Typography>

        <Button
          variant='contained'
          color='primary'
          startIcon={<RateReview />}
          onClick={handleAddReview}
        >
          Add Review
        </Button>
      </Box>

      {reviews.length === 0 ? (
        <Alert severity='info' sx={{ my: 2 }}>
          No reviews yet. Be the first to review this service!
        </Alert>
      ) : (
        <List sx={{ p: 0 }}>
          {reviews.map((review) => (
            <ListItem key={review.id} sx={{ px: 0, display: 'block' }}>
              <ReviewCard review={review} />
            </ListItem>
          ))}
        </List>
      )}
    </Box>
  );
}
