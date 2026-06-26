import { onDocumentDeleted } from "firebase-functions/v2/firestore";
import { getFirestore, FieldValue } from "firebase-admin/firestore";
import * as logger from "firebase-functions/logger";

const db = getFirestore();

interface DeletedListingData {
  sellerId: string;
  boostDebt?: number;
}

export const onListingDeleted = onDocumentDeleted(
  "publicListings/{listingId}",
  async (event) => {
    const listingId = event.params.listingId;
    const deletedData = event.data?.data() as DeletedListingData | undefined;

    if (!deletedData) {
      logger.warn(`onListingDeleted: no data snapshot for deleted listing ${listingId}, skipping.`);
      return;
    }

    const { sellerId, boostDebt } = deletedData;

    if (!sellerId) {
      logger.warn(
        `onListingDeleted: listing ${listingId} had no sellerId, cannot carry over boost debt.`
      );
      return;
    }

    if (typeof boostDebt !== "number" || !Number.isFinite(boostDebt) || boostDebt <= 0) {
      return;
    }

    const userProfileRef = db.collection("userProfiles").doc(sellerId);

    try {
      await userProfileRef.update({
        outstandingBoostDebt: FieldValue.increment(boostDebt),
      });

      logger.info(
        `onListingDeleted: carried R${boostDebt} boost debt from deleted listing ${listingId} to seller ${sellerId}'s account balance.`,
        { listingId, sellerId, boostDebt }
      );
    } catch (error) {
      logger.error(
        `onListingDeleted: failed to carry over boost debt for seller ${sellerId} (listing ${listingId}).`,
        { listingId, sellerId, boostDebt, error }
      );
      throw error;
    }
  }
);