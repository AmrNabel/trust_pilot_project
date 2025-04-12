import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  UserCredential,
  User,
} from 'firebase/auth';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { auth, db } from './firebase';

// Type for user role
export type UserRole = 'user' | 'admin';

// Interface for extended user info stored in Firestore
export interface UserInfo {
  uid: string;
  email: string;
  role: UserRole;
  createdAt: Date;
}

// Register a new user
export const registerUser = async (
  email: string,
  password: string
): Promise<UserCredential> => {
  const userCredential = await createUserWithEmailAndPassword(
    auth,
    email,
    password
  );

  // Create user document in Firestore with default role 'user'
  await setDoc(doc(db, 'users', userCredential.user.uid), {
    uid: userCredential.user.uid,
    email: userCredential.user.email,
    role: 'user',
    createdAt: new Date(),
  });

  return userCredential;
};

// Sign in existing user
export const loginUser = async (
  email: string,
  password: string
): Promise<UserCredential> => {
  return await signInWithEmailAndPassword(auth, email, password);
};

// Sign out user
export const logoutUser = async (): Promise<void> => {
  return await signOut(auth);
};

// Get user role from Firestore
export const getUserRole = async (user: User): Promise<UserRole> => {
  const docRef = doc(db, 'users', user.uid);
  const docSnap = await getDoc(docRef);

  if (docSnap.exists()) {
    return docSnap.data().role as UserRole;
  }

  return 'user'; // Default role if not found
};

// Check if user is admin
export const isAdmin = async (user: User | null): Promise<boolean> => {
  if (!user) return false;

  const role = await getUserRole(user);
  return role === 'admin';
};
