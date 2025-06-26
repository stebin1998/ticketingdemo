// Authentication Service - Handles Firebase + MongoDB integration
import { auth } from '../firebase';
import { onAuthStateChanged, signInWithEmailAndPassword, createUserWithEmailAndPassword, signInWithPopup, GoogleAuthProvider, signOut } from 'firebase/auth';

const API_BASE_URL = 'http://localhost:4556';

export class AuthService {
  static currentUser = null;
  static userProfile = null;
  static listeners = [];
  static currentToken = null;
  static isCreatingSeller = false; // Flag to prevent auto-sync during seller creation

  /**
   * Initialize authentication listener with loginFlag dependency pattern
   * This is the core of our session control system
   */
  static initializeAuth(setLoginFlag) {
    console.log('🔄 Initializing AuthService...');
    
    // Set up Firebase auth state listener
    return onAuthStateChanged(auth, async (firebaseUser) => {
      console.log('🔄 Firebase auth state changed:', firebaseUser?.email || 'No user');
      
      try {
        if (firebaseUser) {
          // Step 1: Firebase authenticated user detected
          this.currentUser = firebaseUser;
          
          // Step 1.5: Get and store Firebase token
          this.currentToken = await firebaseUser.getIdToken();
          console.log('🔑 Firebase token obtained');
          
          // Step 2: Query MongoDB for user profile/role (skip if creating seller)
          if (!this.isCreatingSeller) {
            const userProfile = await this.syncUserWithMongoDB(firebaseUser);
            this.userProfile = userProfile;
          } else {
            console.log('⏸️ Skipping auto-sync during seller creation');
            // Still fetch existing profile without creating new one
            this.userProfile = await this.getUserProfile(firebaseUser.uid);
          }
          
          console.log('✅ User authenticated and synced:', {
            email: firebaseUser.email,
            role: this.userProfile?.role,
            uid: firebaseUser.uid
          });
          
        } else {
          // User logged out
          this.currentUser = null;
          this.userProfile = null;
          this.currentToken = null;
          console.log('🚪 User logged out');
        }
        
        // Step 3: Trigger loginFlag to update UI
        setLoginFlag(prev => !prev);
        
        // Notify all listeners
        this.notifyListeners();
        
      } catch (error) {
        console.error('❌ Error in auth state change:', error);
        setLoginFlag(prev => !prev); // Still trigger update even on error
      }
    });
  }

  /**
   * Sync Firebase user with MongoDB backend
   * This implements the Firebase → MongoDB query pattern you wanted
   */
  static async syncUserWithMongoDB(firebaseUser, role = 'user', sellerInfo = null) {
    try {
      console.log('🔄 Syncing user with MongoDB:', firebaseUser.email);
      
      // First, try to get existing user profile
      const existingUser = await this.getUserProfile(firebaseUser.uid);
      
      if (existingUser) {
        // If we have seller info or need to upgrade role, update the user
        if (sellerInfo || (role === 'seller' && existingUser.role !== 'seller')) {
          console.log('🔄 Updating existing user to seller with business info');
          return await this.updateUserInMongoDB(firebaseUser.uid, role, sellerInfo);
        }
        
        console.log('✅ Found existing user profile');
        return existingUser;
      }
      
      // If no existing user, create new one
      console.log('🆕 Creating new user in MongoDB');
      return await this.createUserInMongoDB(firebaseUser, role, sellerInfo);
      
    } catch (error) {
      console.error('❌ Error syncing with MongoDB:', error);
      throw error;
    }
  }

  /**
   * Get user profile from MongoDB by Firebase UID
   */
  static async getUserProfile(firebaseUID) {
    try {
      // For profile fetching, we don't need auth since it's during login process
      const response = await fetch(`${API_BASE_URL}/auth/profile/${firebaseUID}`);
      
      if (response.ok) {
        return await response.json();
      } else if (response.status === 404) {
        return null; // User doesn't exist in MongoDB yet
      } else {
        throw new Error('Failed to fetch user profile');
      }
    } catch (error) {
      console.error('❌ Error fetching user profile:', error);
      throw error;
    }
  }

  /**
   * Update user in MongoDB backend
   */
  static async updateUserInMongoDB(firebaseUID, role = 'user', sellerInfo = null) {
    try {
      const userData = {
        role: role
      };

      // Add seller-specific information if provided
      if (role === 'seller' && sellerInfo) {
        userData.companyName = sellerInfo.companyName;
        userData.website = sellerInfo.website;
        userData.businessAddress = sellerInfo.businessAddress;
        userData.contactNumber = sellerInfo.contactNumber;
        userData.paymentInstitution = sellerInfo.paymentInstitution;
        userData.paymentInfo = sellerInfo.paymentInfo || 'Mock payment info';
      }

      const response = await fetch(`${API_BASE_URL}/auth/user`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          firebaseUID: firebaseUID,
          ...userData
        })
      });

      if (!response.ok) {
        throw new Error('Failed to update user in MongoDB');
      }

      const data = await response.json();
      console.log('✅ Updated user in MongoDB:', data.user);
      return data.user;
      
    } catch (error) {
      console.error('❌ Error updating user in MongoDB:', error);
      throw error;
    }
  }

  /**
   * Create user in MongoDB backend
   */
  static async createUserInMongoDB(firebaseUser, role = 'user', sellerInfo = null) {
    try {
      const userData = {
        firebaseUID: firebaseUser.uid,
        email: firebaseUser.email,
        displayName: firebaseUser.displayName,
        photoURL: firebaseUser.photoURL,
        role: role
      };

      // Add seller-specific information if provided
      if (role === 'seller' && sellerInfo) {
        userData.companyName = sellerInfo.companyName;
        userData.website = sellerInfo.website;
        userData.businessAddress = sellerInfo.businessAddress;
        userData.contactNumber = sellerInfo.contactNumber;
        userData.paymentInstitution = sellerInfo.paymentInstitution;
        userData.paymentInfo = sellerInfo.paymentInfo || 'Mock payment info';
      }

      console.log('📤 Sending user data to MongoDB:', userData);
      
      const response = await fetch(`${API_BASE_URL}/auth/user`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(userData)
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error('❌ MongoDB API Error:', response.status, errorText);
        throw new Error(`Failed to create user in MongoDB: ${response.status} - ${errorText}`);
      }

      const data = await response.json();
      console.log('✅ Created user in MongoDB:', data.user);
      return data.user;
      
    } catch (error) {
      console.error('❌ Error creating user in MongoDB:', error);
      throw error;
    }
  }

  /**
   * Authentication methods
   */
  static async loginWithEmail(email, password) {
    try {
      console.log('🔄 Logging in with email:', email);
      const result = await signInWithEmailAndPassword(auth, email, password);
      console.log('✅ Email login successful');
      return result;
    } catch (error) {
      console.error('❌ Email login failed:', error);
      throw error;
    }
  }

  static async signupWithEmail(email, password, role = 'user') {
    try {
      console.log('🔄 Signing up with email:', email, 'role:', role);
      const result = await createUserWithEmailAndPassword(auth, email, password);
      
      // The onAuthStateChanged listener will handle MongoDB sync
      console.log('✅ Email signup successful');
      return result;
    } catch (error) {
      console.error('❌ Email signup failed:', error);
      throw error;
    }
  }

  /**
   * Seller signup with business information
   */
  static async signupSellerWithInfo(email, password, sellerInfo) {
    let firebaseUser = null;
    
    try {
      console.log('🔄 Signing up seller with business info:', email);
      
      // Set flag to prevent auto-sync during seller creation
      this.isCreatingSeller = true;
      
      // Create Firebase account first
      const result = await createUserWithEmailAndPassword(auth, email, password);
      firebaseUser = result.user;
      
      if (firebaseUser) {
        console.log('✅ Firebase user created, now syncing with MongoDB...');
        
        // Create seller profile with business info
        await this.syncUserWithMongoDB(firebaseUser, 'seller', sellerInfo);
        console.log('✅ Seller signup with business info successful');
        
        // Clear the flag
        this.isCreatingSeller = false;
        
        return result;
      }
    } catch (error) {
      console.error('❌ Seller signup failed:', error);
      
      // Clear the flag even on error
      this.isCreatingSeller = false;
      
      // If MongoDB sync failed but Firebase user was created, clean up Firebase user
      if (firebaseUser && error.message?.includes('MongoDB')) {
        console.log('🧹 Cleaning up Firebase user due to MongoDB error...');
        try {
          await firebaseUser.delete();
          console.log('✅ Firebase user cleaned up');
        } catch (cleanupError) {
          console.error('❌ Failed to cleanup Firebase user:', cleanupError);
        }
      }
      
      // Provide more specific error messages
      if (error.message?.includes('MongoDB')) {
        throw new Error('Failed to create user profile. Please try again.');
      } else {
        throw error;
      }
    }
  }

  static async loginWithGoogle() {
    try {
      console.log('🔄 Logging in with Google');
      const provider = new GoogleAuthProvider();
      const result = await signInWithPopup(auth, provider);
      console.log('✅ Google login successful');
      return result;
    } catch (error) {
      console.error('❌ Google login failed:', error);
      throw error;
    }
  }

  static async logout() {
    try {
      console.log('🔄 Logging out');
      await signOut(auth);
      console.log('✅ Logout successful');
    } catch (error) {
      console.error('❌ Logout failed:', error);
      throw error;
    }
  }

  /**
   * Token management
   */
  static async getAuthToken() {
    try {
      if (!this.currentUser) {
        throw new Error('No authenticated user');
      }
      
      // Get fresh token (Firebase handles refresh automatically)
      const token = await this.currentUser.getIdToken();
      this.currentToken = token;
      return token;
    } catch (error) {
      console.error('❌ Error getting auth token:', error);
      throw error;
    }
  }

  static getAuthHeaders() {
    if (!this.currentToken) {
      return { 'Content-Type': 'application/json' };
    }
    
    return {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${this.currentToken}`
    };
  }

  static async makeAuthenticatedRequest(url, options = {}) {
    try {
      // Get fresh token for this request
      const token = await this.getAuthToken();
      
      const requestOptions = {
        ...options,
        headers: {
          ...options.headers,
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        }
      };

      const response = await fetch(url, requestOptions);
      
      if (response.status === 401) {
        console.error('❌ Authentication failed - redirecting to login');
        // Token might be expired, force logout
        await this.logout();
        throw new Error('Authentication expired');
      }
      
      return response;
    } catch (error) {
      console.error('❌ Authenticated request failed:', error);
      throw error;
    }
  }

  /**
   * Authorization helpers
   */
  static isAuthenticated() {
    return !!(this.currentUser && this.userProfile);
  }

  static getUserRole() {
    return this.userProfile?.role || 'guest';
  }

  static hasRole(role) {
    return this.getUserRole() === role;
  }

  static hasAnyRole(roles) {
    return roles.includes(this.getUserRole());
  }

  static canCreateEvents() {
    return this.hasAnyRole(['seller', 'admin']);
  }

  static getUserInfo() {
    if (!this.isAuthenticated()) return null;
    
    return {
      uid: this.currentUser.uid,
      email: this.currentUser.email,
      displayName: this.userProfile.displayName || this.currentUser.displayName,
      role: this.userProfile.role,
      profilePicture: this.userProfile.profilePicture || this.currentUser.photoURL,
      isActive: this.userProfile.isActive
    };
  }

  /**
   * Upgrade user to seller with business information
   */
  static async upgradeToSeller(businessInfo) {
    try {
      if (!this.currentUser) {
        throw new Error('No authenticated user');
      }

      console.log('🔄 Upgrading user to seller:', this.currentUser.email);
      
      const response = await fetch(`${API_BASE_URL}/auth/upgrade-to-seller/${this.currentUser.uid}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(businessInfo)
      });

      if (!response.ok) {
        throw new Error('Failed to upgrade to seller');
      }

      const data = await response.json();
      this.userProfile = data.user;
      
      console.log('✅ Successfully upgraded to seller');
      this.notifyListeners();
      
      return data.user;
    } catch (error) {
      console.error('❌ Error upgrading to seller:', error);
      throw error;
    }
  }

  /**
   * Listener management
   */
  static addListener(callback) {
    this.listeners.push(callback);
    return () => {
      this.listeners = this.listeners.filter(cb => cb !== callback);
    };
  }

  static notifyListeners() {
    this.listeners.forEach(callback => {
      callback({
        user: this.currentUser,
        profile: this.userProfile,
        isAuthenticated: this.isAuthenticated()
      });
    });
  }
}

export default AuthService; 