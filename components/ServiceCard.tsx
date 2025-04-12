import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import {
  Card,
  CardContent,
  CardActionArea,
  CardMedia,
  Typography,
  Box,
  Chip,
  Rating,
} from '@mui/material';
import { LocationOn, Category, Store } from '@mui/icons-material';
import { Service } from '@/lib/firestore';

interface ServiceCardProps {
  service: Service;
}

const ServiceCard: React.FC<ServiceCardProps> = ({ service }) => {
  const {
    id,
    name,
    category,
    location,
    imageUrl,
    averageRating = 0,
    reviewCount = 0,
  } = service;

  return (
    <Link href={`/service/${id}`} passHref style={{ textDecoration: 'none' }}>
      <Card
        sx={{
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          transition: 'transform 0.2s ease-in-out, box-shadow 0.2s ease-in-out',
          '&:hover': {
            transform: 'translateY(-4px)',
            boxShadow: 6,
          },
        }}
      >
        <CardActionArea
          sx={{
            flexGrow: 1,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'flex-start',
          }}
        >
          {/* Service Image */}
          <Box sx={{ position: 'relative', width: '100%', height: 160 }}>
            {imageUrl ? (
              <Image
                src={imageUrl}
                alt={name}
                fill
                style={{ objectFit: 'cover' }}
              />
            ) : (
              <Box
                sx={{
                  width: '100%',
                  height: '100%',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  bgcolor: 'action.selected',
                }}
              >
                <Store
                  sx={{ fontSize: 60, color: 'text.secondary', opacity: 0.6 }}
                />
              </Box>
            )}
          </Box>

          <CardContent sx={{ width: '100%' }}>
            <Typography variant='h6' component='div' gutterBottom noWrap>
              {name}
            </Typography>

            <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
              <Category fontSize='small' color='action' sx={{ mr: 0.5 }} />
              <Chip
                label={category}
                size='small'
                color='primary'
                variant='outlined'
                sx={{ height: 24 }}
              />
            </Box>

            <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
              <LocationOn fontSize='small' color='action' sx={{ mr: 0.5 }} />
              <Typography variant='body2' color='text.secondary'>
                {location}
              </Typography>
            </Box>

            <Box
              sx={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                mt: 2,
              }}
            >
              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                <Rating
                  value={averageRating}
                  precision={0.5}
                  size='small'
                  readOnly
                />
                <Typography variant='body2' sx={{ ml: 0.5 }}>
                  ({averageRating.toFixed(1)})
                </Typography>
              </Box>
              <Typography variant='body2' color='text.secondary'>
                {reviewCount} {reviewCount === 1 ? 'review' : 'reviews'}
              </Typography>
            </Box>
          </CardContent>
        </CardActionArea>
      </Card>
    </Link>
  );
};

export default ServiceCard;
