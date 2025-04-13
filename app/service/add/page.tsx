'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import {
  Container,
  Paper,
  Typography,
  TextField,
  Button,
  Box,
  Alert,
  CircularProgress,
  Divider,
  MenuItem,
  FormControl,
  InputLabel,
  Select,
  FormHelperText,
  IconButton,
} from '@mui/material';
import { ArrowBack, AddBusiness, Upload, Delete } from '@mui/icons-material';
import { useAuth } from '@/lib/contexts/AuthContext';
import { createService } from '@/lib/firestore';
import { FormSubmitEvent, ServiceCategory } from '@/types';
import { useTranslation } from 'react-i18next';

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

// Maximum file size in bytes (5MB)
const MAX_FILE_SIZE = 5 * 1024 * 1024;
// Allowed file types
const ALLOWED_FILE_TYPES = [
  'image/jpeg',
  'image/png',
  'image/gif',
  'image/webp',
];

export default function AddServicePage() {
  const { t } = useTranslation();
  const router = useRouter();
  const { user, loading: authLoading } = useAuth();
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Form state
  const [name, setName] = useState('');
  const [category, setCategory] = useState<ServiceCategory>('Other');
  const [location, setLocation] = useState('');
  const [description, setDescription] = useState('');
  const [image, setImage] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [imageError, setImageError] = useState<string | null>(null);

  // UI state
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  // Redirect to login if not authenticated
  useEffect(() => {
    let redirectTimeout: NodeJS.Timeout;

    if (!authLoading && !user) {
      console.log('No user found, redirecting to login...');
      redirectTimeout = setTimeout(() => {
        router.push('/login');
      }, 500);
    }

    return () => {
      if (redirectTimeout) clearTimeout(redirectTimeout);
    };
  }, [user, authLoading, router]);

  // Handle image selection
  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] || null;
    setImageError(null);

    // Reset the file input value to ensure onChange fires even if the same file is selected
    if (!file) {
      if (fileInputRef.current) fileInputRef.current.value = '';
      setImage(null);
      setImagePreview(null);
      return;
    }

    // Validate file type
    if (!ALLOWED_FILE_TYPES.includes(file.type)) {
      setImageError('Please upload a valid image (JPEG, PNG, GIF, or WEBP)');
      if (fileInputRef.current) fileInputRef.current.value = '';
      return;
    }

    // Validate file size
    if (file.size > MAX_FILE_SIZE) {
      setImageError('Image size should be less than 5MB');
      if (fileInputRef.current) fileInputRef.current.value = '';
      return;
    }

    // Create preview
    const reader = new FileReader();
    reader.onloadend = () => {
      setImagePreview(reader.result as string);
    };
    reader.readAsDataURL(file);

    setImage(file);
  };

  // Remove selected image
  const handleRemoveImage = () => {
    setImage(null);
    setImagePreview(null);
    setImageError(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  // Trigger file input click
  const handleUploadClick = () => {
    fileInputRef.current?.click();
  };

  // Form validation
  const isFormValid = () => {
    return (
      name.trim() !== '' &&
      location.trim() !== '' &&
      description.trim() !== '' &&
      !imageError
    );
  };

  // Handle form submission
  const handleSubmit = async (e: FormSubmitEvent) => {
    e.preventDefault();

    if (!user) {
      setError('You must be logged in to add a service');
      return;
    }

    if (!isFormValid()) {
      setError('Please fill in all required fields and fix any errors');
      return;
    }

    if (!navigator.onLine) {
      setError(
        'You are offline. Please check your internet connection to add a service.'
      );
      return;
    }

    try {
      setLoading(true);
      setError(null);

      const serviceId = await createService(
        {
          name: name.trim(),
          category,
          location: location.trim(),
          description: description.trim(),
          userId: user.uid,
        },
        image || undefined
      );

      setSuccess(true);

      // Clear form
      setName('');
      setCategory('Other');
      setLocation('');
      setDescription('');
      setImage(null);
      setImagePreview(null);
      if (fileInputRef.current) fileInputRef.current.value = '';

      // Redirect after 2 seconds to home instead of service page since it's pending
      setTimeout(() => {
        router.push('/');
      }, 2000);
    } catch (err: any) {
      console.error('Error adding service:', err);
      const errorMessage =
        err?.code === 'failed-precondition' || err?.message?.includes('offline')
          ? 'Failed to add service because you are offline. Please check your internet connection.'
          : 'Failed to add service. Please try again.';
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  // Loading state during authentication
  if (authLoading) {
    return (
      <Container maxWidth='md' sx={{ py: 4 }}>
        <Box sx={{ display: 'flex', justifyContent: 'center', py: 8 }}>
          <CircularProgress />
        </Box>
      </Container>
    );
  }

  // Not authenticated state
  if (!user) {
    return (
      <Container maxWidth='md' sx={{ py: 4 }}>
        <Alert severity='error' sx={{ mb: 3 }}>
          {error || t('loginRequired')}
        </Alert>
        <Button
          component={Link}
          href='/login'
          startIcon={<ArrowBack />}
          variant='contained'
        >
          {t('login')}
        </Button>
      </Container>
    );
  }

  return (
    <Container maxWidth='md' sx={{ py: 4 }}>
      <Button
        component={Link}
        href='/'
        startIcon={<ArrowBack />}
        sx={{ mb: 3 }}
      >
        {t('backToServices')}
      </Button>

      <Paper sx={{ p: 4, borderRadius: 2 }} elevation={3}>
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 2, gap: 1 }}>
          <AddBusiness fontSize='large' color='primary' />
          <Typography variant='h4' component='h1'>
            {t('addNewService')}
          </Typography>
        </Box>

        <Alert severity='info' sx={{ mb: 3 }}>
          {t('pendingApprovalInfo')}
        </Alert>

        {success ? (
          <Alert severity='success' sx={{ my: 2 }}>
            {t('serviceSubmitted')}
          </Alert>
        ) : (
          <form onSubmit={handleSubmit}>
            {error && (
              <Alert severity='error' sx={{ mb: 3 }}>
                {error}
              </Alert>
            )}

            <Typography variant='body1' color='text.secondary' paragraph>
              {t('createServiceDesc')}
            </Typography>

            <Divider sx={{ my: 2 }} />

            <TextField
              fullWidth
              label={t('serviceName')}
              value={name}
              onChange={(e) => setName(e.target.value)}
              margin='normal'
              required
              inputProps={{ maxLength: 100 }}
              helperText={`${name.length}/100 ${t('characters')}`}
            />

            <FormControl fullWidth margin='normal' required>
              <InputLabel id='category-label'>{t('category')}</InputLabel>
              <Select
                labelId='category-label'
                value={category}
                label={t('category')}
                onChange={(e) => setCategory(e.target.value as ServiceCategory)}
              >
                {SERVICE_CATEGORIES.map((cat) => (
                  <MenuItem key={cat} value={cat}>
                    {t(cat.toLowerCase())}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>

            <TextField
              fullWidth
              label={t('location')}
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              margin='normal'
              required
              inputProps={{ maxLength: 100 }}
              helperText={`${location.length}/100 ${t('characters')}`}
            />

            <TextField
              fullWidth
              multiline
              rows={4}
              label={t('description')}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder={t('describeService')}
              margin='normal'
              required
              inputProps={{ maxLength: 500 }}
              helperText={`${description.length}/500 ${t('characters')}`}
            />

            {/* Image Upload Section */}
            <Box sx={{ mt: 3, mb: 2 }}>
              <Typography variant='subtitle1' gutterBottom>
                {t('serviceImage')}
              </Typography>
              <input
                type='file'
                accept='image/*'
                style={{ display: 'none' }}
                ref={fileInputRef}
                onChange={handleImageChange}
              />

              {!imagePreview ? (
                <Box
                  sx={{
                    border: '2px dashed',
                    borderColor: imageError ? 'error.main' : 'divider',
                    borderRadius: 1,
                    p: 3,
                    textAlign: 'center',
                    cursor: 'pointer',
                    bgcolor: 'background.paper',
                    transition: 'background-color 0.3s',
                    '&:hover': {
                      bgcolor: 'action.hover',
                    },
                  }}
                  onClick={handleUploadClick}
                >
                  <Upload
                    sx={{ fontSize: 40, color: 'text.secondary', mb: 1 }}
                  />
                  <Typography>{t('uploadImage')}</Typography>
                  <Typography variant='body2' color='text.secondary'>
                    {t('imageTypes')}
                  </Typography>
                </Box>
              ) : (
                <Box
                  sx={{
                    position: 'relative',
                    width: '100%',
                    height: 200,
                    borderRadius: 1,
                    overflow: 'hidden',
                    mb: 1,
                  }}
                >
                  <Image
                    src={imagePreview}
                    alt='Service preview'
                    fill
                    style={{ objectFit: 'cover' }}
                  />
                  <IconButton
                    sx={{
                      position: 'absolute',
                      top: 8,
                      right: 8,
                      bgcolor: 'rgba(0,0,0,0.5)',
                      color: 'white',
                      '&:hover': {
                        bgcolor: 'rgba(0,0,0,0.7)',
                      },
                    }}
                    onClick={handleRemoveImage}
                    size='small'
                  >
                    <Delete />
                  </IconButton>
                </Box>
              )}

              {imageError && (
                <FormHelperText error>{imageError}</FormHelperText>
              )}

              <FormHelperText>{t('imageHelp')}</FormHelperText>
            </Box>

            <Box sx={{ mt: 4 }}>
              <Button
                type='submit'
                variant='contained'
                color='primary'
                size='large'
                disabled={loading || !isFormValid()}
                startIcon={
                  loading ? <CircularProgress size={20} /> : <AddBusiness />
                }
              >
                {loading ? t('creating') : t('addService')}
              </Button>
            </Box>
          </form>
        )}
      </Paper>
    </Container>
  );
}
