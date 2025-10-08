/**
 * @file packages/shared-utils/src/constants/features.js
 * @description Centralized feature flag configuration for all apps.
 *              Use these flags to enable or disable features dynamically.
 */

export const FEATURES = {
  /**
   * @feature ENABLE_IMAGE_STORAGE
   * @description Controls whether fuel bill images are uploaded to Firebase Storage.
   *              Set to `true` to enable image storage, `false` to disable.
   *
   *              ⚠️ IMPORTANT: Firebase Storage requires a Blaze plan (pay-as-you-go)
   *              even for free tier usage. If you are on the Spark plan (free),
   *              you must set this to `false` to avoid deployment errors related
   *              to Firebase Storage rules or billing.
   *
   *              When `false`:
   *              - Images will NOT be uploaded to Firebase Storage.
   *              - `billImageUrl` field in Firestore records will be `null` or absent.
   *              - The "View Receipt" feature in Fuel History will not show images.
   *              - The app remains 100% free to run on Spark plan.
   *
   *              When `true`:
   *              - Images will be compressed and uploaded to Firebase Storage.
   *              - `billImageUrl` will be stored in Firestore.
   *              - "View Receipt" will display the image.
   *              - Requires Firebase project to be on Blaze plan and Storage rules deployed.
   *              - Costs are minimal for typical usage (e.g., ~$0.10-$0.50/month for 100s of images).
   */
  ENABLE_IMAGE_STORAGE: false,
};

export default FEATURES;
