import { authEndpoints } from './endpoints/auth';
import { userEndpoints } from './endpoints/user';
import { imageEndpoints } from './endpoints/image';
import { friendEndpoints } from './endpoints/friend';
import { exploreEndpoints } from './endpoints/explore';

// Export organized API
export const api = {
  auth: authEndpoints,
  user: userEndpoints,
  image: imageEndpoints,
  friend: friendEndpoints,
  explore: exploreEndpoints,
};

// Export individual endpoints for convenience
export { authEndpoints, userEndpoints, imageEndpoints, friendEndpoints, exploreEndpoints };

// Export client for custom requests if needed
export { apiClient } from './client';

