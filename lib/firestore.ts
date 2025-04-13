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
export const getServices = async (): Promise<Service[]> => {
  const servicesCollection = collection(db, 'services');
  const q = query(servicesCollection, orderBy('name'));
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
    'id' | 'createdAt' | 'averageRating' | 'reviewCount'
  >,
  imageFile?: File
): Promise<string> => {
  // Prepare service data with default values
  const newService: Omit<Service, 'id'> = {
    ...serviceData,
    averageRating: 0,
    reviewCount: 0,
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
  searchTerm: string
): Promise<Service[]> => {
  if (!searchTerm.trim()) {
    return getServices(); // Return all services if search term is empty
  }

  const searchTermLower = searchTerm.toLowerCase();

  // Get all services first (could be optimized with Firestore indexing for larger applications)
  const servicesCollection = collection(db, 'services');
  const snapshot = await getDocs(servicesCollection);

  // Filter the services client-side based ONLY on the service name
  const filteredServices = snapshot.docs
    .map((doc) => ({ id: doc.id, ...doc.data() } as Service))
    .filter((service) => service.name.toLowerCase().includes(searchTermLower));

  return filteredServices;
};
