import { onSchedule } from "firebase-functions/v2/scheduler";
import { getFirestore, FieldValue } from "firebase-admin/firestore";
import { getStorage } from "firebase-admin/storage";
import * as logger from "firebase-functions/logger";

const db = getFirestore();

const RETENTION_DAYS = 30;

interface UserProfileData {
  id?: string;
  sellerType?: "individual" | "business";
  onboardedAt?: string;
  selfieUrl?: string;
  idPhotoUrl?: string;
  kycDataPurged?: boolean;
}

/**
 * POPIA data-minimisation: runs daily and permanently deletes the raw KYC
 * selfie / ID document images (from both Cloud Storage and their Firestore
 * URL fields) for any individual seller whose onboardedAt is more than
 * RETENTION_DAYS old and hasn't been purged yet.
 *
 * Verification RESULT fields (kycStatus, isIdVerified, trustScore,
 * idNumberMasked, banking info) are deliberately left untouched -- only the
 * raw biometric/ID images are purged, since that's the sensitive personal
 * data POPIA's retention limitation applies to. The fact that a user was
 * verified, and when, remains on record.
 *
 * Business sellers never upload a selfie/ID photo (see src/app/verify),
 * so they're naturally skipped by the selfieUrl/idPhotoUrl check.
 */
export const purgeExpiredKycData = onSchedule(
  "every day 03:00",
  async () => {
    const cutoffIso = new Date(
      Date.now() - RETENTION_DAYS * 24 * 60 * 60 * 1000
    ).toISOString();

    const expiredSnap = await db
      .collection("userProfiles")
      .where("onboardedAt", "<=", cutoffIso)
      .get();

    if (expiredSnap.empty) {
      logger.info("purgeExpiredKycData: no profiles past retention window.");
      return;
    }

    const bucket = getStorage().bucket();
    let purgedCount = 0;

    for (const docSnap of expiredSnap.docs) {
      const profile = docSnap.data() as UserProfileData;
      const uid = docSnap.id;

      // Already purged, or nothing to purge (business seller / never
      // completed individual KYC).
      if (profile.kycDataPurged === true) continue;
      if (!profile.selfieUrl && !profile.idPhotoUrl) continue;

      try {
        await Promise.all([
          bucket.file(`kyc/${uid}/selfie.jpg`).delete({ ignoreNotFound: true }),
          bucket.file(`kyc/${uid}/id_doc.jpg`).delete({ ignoreNotFound: true }),
        ]);

        await docSnap.ref.update({
          selfieUrl: FieldValue.delete(),
          idPhotoUrl: FieldValue.delete(),
          kycDataPurged: true,
          kycDataPurgedAt: FieldValue.serverTimestamp(),
        });

        purgedCount++;
        logger.info(`purgeExpiredKycData: purged KYC images for user ${uid}.`);
      } catch (error) {
        // One bad profile shouldn't stop the rest of the batch.
        logger.error(
          `purgeExpiredKycData: failed to purge KYC images for user ${uid}.`,
          { error }
        );
      }
    }

    logger.info(
      `purgeExpiredKycData: checked ${expiredSnap.size} profile(s), purged ${purgedCount}.`
    );
  }
);