import React from 'react';
import {
  Card,
  CardContent,
  Typography,
  Box,
  Rating,
  Avatar,
  CardMedia,
  Chip,
  Button,
  CardActions,
} from '@mui/material';
import { CheckCircle, Cancel } from '@mui/icons-material';
import { Review } from '@/lib/firestore';
import { formatDistanceToNow } from 'date-fns';

interface ReviewCardProps {
  review: Review;
  isAdmin?: boolean;
  isPending?: boolean;
  onApprove?: (id: string) => void;
  onReject?: (id: string) => void;
}

const ReviewCard: React.FC<ReviewCardProps> = ({
  review,
  isAdmin = false,
  isPending = false,
  onApprove,
  onReject,
}) => {
  const { id, rating, comment, userEmail, imageUrl, createdAt } = review;

  const formattedDate = createdAt
    ? formatDistanceToNow(createdAt.toDate(), { addSuffix: true })
    : 'Recently';

  return (
    <Card
      sx={{
        mb: 2,
        borderLeft: isPending ? '4px solid orange' : undefined,
      }}
    >
      <CardContent>
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
          <Avatar sx={{ mr: 2, bgcolor: 'primary.main' }}>
            {userEmail.charAt(0).toUpperCase()}
          </Avatar>
          <Box>
            <Typography variant='subtitle2'>{userEmail}</Typography>
            <Box sx={{ display: 'flex', alignItems: 'center' }}>
              <Rating value={rating} readOnly size='small' />
              <Typography variant='body2' color='text.secondary' sx={{ ml: 1 }}>
                {formattedDate}
              </Typography>
              {isPending && (
                <Chip
                  label='Pending'
                  size='small'
                  color='warning'
                  sx={{ ml: 1 }}
                />
              )}
            </Box>
          </Box>
        </Box>

        <Typography variant='body1' paragraph>
          {comment}
        </Typography>

        {imageUrl && (
          <CardMedia
            component='img'
            image={imageUrl}
            alt='Review image'
            sx={{
              maxHeight: 200,
              maxWidth: 400,
              objectFit: 'contain',
              borderRadius: 1,
              mb: 2,
            }}
          />
        )}
      </CardContent>

      {isAdmin && isPending && (
        <CardActions sx={{ justifyContent: 'flex-end' }}>
          <Button
            startIcon={<Cancel />}
            color='error'
            onClick={() => onReject && id && onReject(id)}
          >
            Reject
          </Button>
          <Button
            startIcon={<CheckCircle />}
            color='success'
            onClick={() => onApprove && id && onApprove(id)}
          >
            Approve
          </Button>
        </CardActions>
      )}
    </Card>
  );
};

export default ReviewCard;
