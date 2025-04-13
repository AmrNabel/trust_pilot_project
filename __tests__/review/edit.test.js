import { updateReview, getReviewById } from '../../lib/firestore';

// Mock the Firebase modules
jest.mock('../../lib/firebase', () => ({
  db: {},
  storage: {},
}));

// Mock the Firestore functions
jest.mock('firebase/firestore', () => ({
  doc: jest.fn(() => ({})),
  getDoc: jest.fn(),
  updateDoc: jest.fn().mockResolvedValue({}),
  Timestamp: {
    now: jest.fn(),
  },
}));

// Mock the Firebase Storage functions
jest.mock('firebase/storage', () => ({
  ref: jest.fn(() => ({})),
  uploadBytes: jest.fn().mockResolvedValue({}),
  getDownloadURL: jest
    .fn()
    .mockResolvedValue('https://example.com/test-image.jpg'),
}));

// Mock uuid
jest.mock('uuid', () => ({
  v4: jest.fn(() => 'test-uuid'),
}));

// Import mocked functions
import { doc, getDoc, updateDoc } from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';

describe('Review Edit Functionality', () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('getReviewById', () => {
    it('should return a review when it exists', async () => {
      // Mock the review data
      const mockReview = {
        id: 'review-123',
        serviceId: 'service-123',
        userId: 'user-123',
        userEmail: 'test@example.com',
        rating: 4,
        comment: 'Great service!',
        pending: false,
      };

      // Setup the mock implementation
      getDoc.mockResolvedValueOnce({
        exists: () => true,
        data: () => mockReview,
      });

      const result = await getReviewById('review-123');
      expect(result).toEqual({ ...mockReview, id: 'review-123' });
      expect(doc).toHaveBeenCalled();
      expect(getDoc).toHaveBeenCalled();
    });

    it('should return null when the review does not exist', async () => {
      // Setup the mock implementation
      getDoc.mockResolvedValueOnce({
        exists: () => false,
      });

      const result = await getReviewById('non-existent-id');
      expect(result).toBeNull();
      expect(doc).toHaveBeenCalled();
      expect(getDoc).toHaveBeenCalled();
    });
  });

  describe('updateReview', () => {
    const mockReview = {
      id: 'review-123',
      serviceId: 'service-123',
      userId: 'user-123',
      userEmail: 'test@example.com',
      rating: 4,
      comment: 'Great service!',
      pending: false,
    };

    beforeEach(() => {
      // Setup mock for current review
      getDoc.mockResolvedValueOnce({
        exists: () => true,
        data: () => mockReview,
      });

      // Setup mock for updated review (for service rating update)
      getDoc.mockResolvedValueOnce({
        exists: () => true,
        data: () => ({
          ...mockReview,
          rating: 5,
          comment: 'Updated comment',
          pending: true,
        }),
      });
    });

    it('should update review data without an image', async () => {
      const updateData = {
        rating: 5,
        comment: 'Updated comment',
      };

      await updateReview('review-123', updateData);

      expect(doc).toHaveBeenCalledTimes(1);
      expect(getDoc).toHaveBeenCalledTimes(1);
      expect(updateDoc).toHaveBeenCalledWith(
        expect.anything(),
        expect.objectContaining({
          ...updateData,
          pending: true,
        })
      );
    });

    it('should update review data with a new image', async () => {
      const updateData = {
        rating: 5,
        comment: 'Updated comment',
      };

      const mockImageFile = new File(['dummy content'], 'test-image.jpg', {
        type: 'image/jpeg',
      });

      await updateReview('review-123', updateData, mockImageFile);

      expect(ref).toHaveBeenCalled();
      expect(uploadBytes).toHaveBeenCalled();
      expect(getDownloadURL).toHaveBeenCalled();
      expect(updateDoc).toHaveBeenCalledWith(
        expect.anything(),
        expect.objectContaining({
          ...updateData,
          imageUrl: 'https://example.com/test-image.jpg',
          pending: true,
        })
      );
    });

    it('should remove an image from review when removeImage is true', async () => {
      const updateData = {
        rating: 5,
        comment: 'Updated comment',
      };

      await updateReview('review-123', updateData, undefined, true);

      expect(updateDoc).toHaveBeenCalledWith(
        expect.anything(),
        expect.objectContaining({
          ...updateData,
          imageUrl: null,
          pending: true,
        })
      );
    });

    it('should throw an error when review does not exist', async () => {
      // Override the mock setup
      getDoc.mockReset();
      getDoc.mockResolvedValueOnce({
        exists: () => false,
      });

      const updateData = {
        rating: 5,
        comment: 'Updated comment',
      };

      await expect(updateReview('non-existent-id', updateData)).rejects.toThrow(
        'Review does not exist'
      );
    });
  });
});
