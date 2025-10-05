/**
 * Feature Flags Configuration
 * 
 * Enable/disable features based on availability or billing requirements
 */

export const FEATURES = {
  // Firebase Storage for bill images
  // Set to false if Storage is not set up or billing is not enabled
  ENABLE_IMAGE_STORAGE: false,
  
  // Future feature flags can be added here
  // ENABLE_NOTIFICATIONS: true,
  // ENABLE_ANALYTICS: true,
};

export default FEATURES;

