import {
  collection,
  doc,
  getDoc,
  getDocs,
  setDoc,
  updateDoc,
  deleteDoc,
  query,
  where,
  orderBy,
  limit,
  serverTimestamp,
  Timestamp,
  addDoc,
  DocumentReference,
} from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { v4 as uuidv4 } from 'uuid';
import { db, storage } from './firebase';
import { isContentAppropriate } from './perspective';

// Service interface
export interface Service {
  id?: string;
  name: string;
  category: string;
  location: string;
  description: string;
  imageUrl?: string;
  averageRating?: number;
  reviewCount?: number;
  createdAt?: Timestamp;
  pending?: boolean;
  userId?: string;
}

// Review interface
export interface Review {
  id?: string;
  serviceId: string;
  userId: string;
  userEmail: string;
  rating: number;
  comment: string;
  imageUrl?: string;
  pending: boolean;
  createdAt?: Timestamp;
}

// Get all services
export const getServices = async (
  includePending: boolean = false
): Promise<Service[]> => {
  const servicesCollection = collection(db, 'services');
  const constraints = [];

  if (!includePending) {
    // Only get approved services by default
    constraints.push(where('pending', '==', false));
  }

  const q = query(servicesCollection, ...constraints, orderBy('name'));
  const snapshot = await getDocs(q);

  return snapshot.docs.map((doc) => {
    return { id: doc.id, ...doc.data() } as Service;
  });
};

// Get service by ID
export const getServiceById = async (id: string): Promise<Service | null> => {
  const docRef = doc(db, 'services', id);
  const docSnap = await getDoc(docRef);

  if (docSnap.exists()) {
    return { id: docSnap.id, ...docSnap.data() } as Service;
  }

  return null;
};

// Get reviews for a service
export const getReviewsByServiceId = async (
  serviceId: string,
  showPending: boolean = false
): Promise<Review[]> => {
  const reviewsCollection = collection(db, 'reviews');

  // Only show approved reviews unless showPending is true
  const constraints = [where('serviceId', '==', serviceId)];
  if (!showPending) {
    constraints.push(where('pending', '==', false));
  }

  const q = query(
    reviewsCollection,
    ...constraints,
    orderBy('createdAt', 'desc')
  );

  const snapshot = await getDocs(q);

  return snapshot.docs.map((doc) => {
    return { id: doc.id, ...doc.data() } as Review;
  });
};

// Get all pending reviews (for admin)
export const getPendingReviews = async (): Promise<Review[]> => {
  const reviewsCollection = collection(db, 'reviews');
  const q = query(
    reviewsCollection,
    where('pending', '==', true),
    orderBy('createdAt', 'desc')
  );

  const snapshot = await getDocs(q);

  return snapshot.docs.map((doc) => {
    return { id: doc.id, ...doc.data() } as Review;
  });
};

// Create a new review
export const createReview = async (
  review: Omit<Review, 'id' | 'createdAt' | 'pending'>,
  imageFile?: File
): Promise<string> => {
  // First, check if the review comment is appropriate
  const isAppropriate = await isContentAppropriate(review.comment);

  if (!isAppropriate) {
    throw new Error(
      'Your review contains inappropriate content. Please revise your comment and try again.'
    );
  }

  // Prepare review data
  const reviewData: Omit<Review, 'id'> = {
    ...review,
    pending: true, // All reviews start as pending
    createdAt: serverTimestamp() as Timestamp,
  };

  // Upload image if provided
  if (imageFile) {
    const imageRef = ref(storage, `reviews/${uuidv4()}`);
    await uploadBytes(imageRef, imageFile);
    reviewData.imageUrl = await getDownloadURL(imageRef);
  }

  // Add review to Firestore
  const reviewRef = await addDoc(collection(db, 'reviews'), reviewData);

  return reviewRef.id;
};

// Approve or reject a review
export const updateReviewStatus = async (
  reviewId: string,
  approve: boolean
): Promise<void> => {
  const reviewRef = doc(db, 'reviews', reviewId);
  const reviewSnap = await getDoc(reviewRef);

  if (!reviewSnap.exists()) {
    throw new Error('Review does not exist');
  }

  const review = reviewSnap.data() as Review;

  if (approve) {
    // Approve the review
    await updateDoc(reviewRef, { pending: false });

    // Update service rating
    await updateServiceRating(review.serviceId);
  } else {
    // Delete the review if not approved
    await deleteDoc(reviewRef);
  }
};

// Update service rating based on approved reviews
export const updateServiceRating = async (serviceId: string): Promise<void> => {
  const approvedReviews = await getReviewsByServiceId(serviceId);

  if (approvedReviews.length === 0) return;

  // Calculate average rating
  const totalRating = approvedReviews.reduce(
    (sum, review) => sum + review.rating,
    0
  );
  const averageRating = totalRating / approvedReviews.length;

  // Update service document
  const serviceRef = doc(db, 'services', serviceId);
  await updateDoc(serviceRef, {
    averageRating,
    reviewCount: approvedReviews.length,
  });
};

// Add this new function to create a service
export const createService = async (
  serviceData: Omit<
    Service,
    'id' | 'createdAt' | 'averageRating' | 'reviewCount' | 'pending'
  >,
  imageFile?: File
): Promise<string> => {
  // Prepare service data with default values
  const newService: Omit<Service, 'id'> = {
    ...serviceData,
    averageRating: 0,
    reviewCount: 0,
    pending: true, // New services are pending by default
    createdAt: serverTimestamp() as Timestamp,
  };

  // Upload image if provided
  if (imageFile) {
    const imageRef = ref(storage, `services/${uuidv4()}`);
    await uploadBytes(imageRef, imageFile);
    newService.imageUrl = await getDownloadURL(imageRef);
  }

  // Add service to Firestore
  const serviceRef = await addDoc(collection(db, 'services'), newService);

  return serviceRef.id;
};

// Add this new function to search services
export const searchServices = async (
  searchTerm: string,
  categoryFilter?: string
): Promise<Service[]> => {
  if (!searchTerm.trim() && !categoryFilter) {
    return getServices(); // Return all approved services if no filters
  }

  const searchTermLower = searchTerm.toLowerCase();

  // Get all approved services first
  const servicesCollection = collection(db, 'services');
  const q = query(servicesCollection, where('pending', '==', false));
  const snapshot = await getDocs(q);

  // Filter the services client-side based on name and category
  let filteredServices = snapshot.docs.map(
    (doc) => ({ id: doc.id, ...doc.data() } as Service)
  );

  // Apply search term filter if provided
  if (searchTerm.trim()) {
    filteredServices = filteredServices.filter((service) =>
      service.name.toLowerCase().includes(searchTermLower)
    );
  }

  // Apply category filter if provided
  if (categoryFilter) {
    filteredServices = filteredServices.filter(
      (service) => service.category === categoryFilter
    );
  }

  return filteredServices;
};

// Get pending services (for admin)
export const getPendingServices = async (): Promise<Service[]> => {
  const servicesCollection = collection(db, 'services');
  const q = query(
    servicesCollection,
    where('pending', '==', true),
    orderBy('createdAt', 'desc')
  );

  const snapshot = await getDocs(q);

  return snapshot.docs.map((doc) => {
    return { id: doc.id, ...doc.data() } as Service;
  });
};

// Approve or reject a pending service
export const updateServiceStatus = async (
  serviceId: string,
  approve: boolean
): Promise<void> => {
  const serviceRef = doc(db, 'services', serviceId);
  const serviceSnap = await getDoc(serviceRef);

  if (!serviceSnap.exists()) {
    throw new Error('Service does not exist');
  }

  if (approve) {
    // Approve the service
    await updateDoc(serviceRef, { pending: false });
  } else {
    // Delete the service if not approved
    await deleteDoc(serviceRef);
  }
};

// Get reviews by user ID (for My Reviews page)
export const getReviewsByUserId = async (userId: string): Promise<Review[]> => {
  const reviewsCollection = collection(db, 'reviews');
  const q = query(
    reviewsCollection,
    where('userId', '==', userId),
    orderBy('createdAt', 'desc')
  );

  const snapshot = await getDocs(q);
  return snapshot.docs.map((doc) => {
    return { id: doc.id, ...doc.data() } as Review;
  });
};

// Update a review
export const updateReview = async (
  reviewId: string,
  reviewData: {
    rating?: number;
    comment?: string;
    imageUrl?: any;
  },
  imageFile?: File,
  removeImage: boolean = false
): Promise<void> => {
  const reviewRef = doc(db, 'reviews', reviewId);
  const reviewSnap = await getDoc(reviewRef);

  if (!reviewSnap.exists()) {
    throw new Error('Review does not exist');
  }

  // Check for inappropriate content if the comment is being updated
  if (reviewData.comment) {
    const isAppropriate = await isContentAppropriate(reviewData.comment);
    if (!isAppropriate) {
      throw new Error(
        'Your review contains inappropriate content. Please revise your comment and try again.'
      );
    }
  }

  const currentReview = reviewSnap.data() as Review;

  // Prepare updated data
  const updateData = { ...reviewData };

  // Handle image updates
  if (imageFile) {
    // Upload new image
    const imageRef = ref(storage, `reviews/${uuidv4()}`);
    await uploadBytes(imageRef, imageFile);
    updateData.imageUrl = await getDownloadURL(imageRef);
  } else if (removeImage) {
    // Remove existing image
    updateData.imageUrl = null;
  }

  // Update review with new data
  await updateDoc(reviewRef, {
    ...updateData,
    // For imageUrl:
    // - If new image uploaded: use new URL
    // - If image removed: use null
    // - Otherwise: keep existing (this field won't be included in updateData)
    // Reviews that are edited need to be approved again
    pending: true,
  });

  // Update service rating after a review is updated
  await updateServiceRating(currentReview.serviceId);
};

// Delete a review
export const deleteReview = async (reviewId: string): Promise<void> => {
  const reviewRef = doc(db, 'reviews', reviewId);
  const reviewSnap = await getDoc(reviewRef);

  if (!reviewSnap.exists()) {
    throw new Error('Review does not exist');
  }

  const review = reviewSnap.data() as Review;
  await deleteDoc(reviewRef);

  // Update service rating after a review is deleted
  await updateServiceRating(review.serviceId);
};

// Get a single review by ID
export const getReviewById = async (
  reviewId: string
): Promise<Review | null> => {
  const reviewRef = doc(db, 'reviews', reviewId);
  const reviewSnap = await getDoc(reviewRef);

  if (!reviewSnap.exists()) {
    return null;
  }

  return { id: reviewId, ...reviewSnap.data() } as Review;
};
