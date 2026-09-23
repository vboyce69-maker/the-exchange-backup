import { onSchedule } from "firebase-functions/v2/scheduler";
import { getFirestore, FieldValue } from "firebase-admin/firestore";
import * as logger from "firebase-functions/logger";

const db = getFirestore();

interface AuctionListingData {
  isAuction?: boolean;
  status?: "available" | "pending_sale" | "sold" | "expired";
  auctionEndDate?: string;
  auctionEnded?: boolean;
  highestBid?: number;
  highestBidderId?: string;
  price: number;
  sellerId: string;
  title?: string;
}

/**
 * Runs every 10 minutes. Finds auction listings whose auctionEndDate has
 * passed and that haven't been processed yet (auctionEnded !== true), then:
 *
 * - If there's a highest bidder: sets price to the winning bid amount (so
 *   the existing createTransaction/checkout flow -- which charges
 *   listing.price, not highestBid -- charges the correct amount), marks
 *   auctionEnded, and notifies both the winner and the seller. The listing
 *   status stays "available" so the winner can complete checkout through
 *   the normal purchase flow; createTransaction's own status check still
 *   protects against anyone else buying it out from under them once the
 *   winner starts checkout.
 * - If there were no bids: marks the listing "expired" and auctionEnded,
 *   and notifies the seller.
 *
 * Each listing is processed inside its own Firestore transaction, re-reading
 * auctionEndDate/auctionEnded at write time, so a bid placed in the same
 * moment this runs can't be silently overwritten.
 */
export const closeExpiredAuctions = onSchedule(
  "every 10 minutes",
  async () => {
    const nowIso = new Date().toISOString();

    const expiredSnap = await db
      .collection("publicListings")
      .where("isAuction", "==", true)
      .where("auctionEndDate", "<=", nowIso)
      .get();

    if (expiredSnap.empty) {
      logger.info("closeExpiredAuctions: no expired auctions found.");
      return;
    }

    logger.info(
      `closeExpiredAuctions: found ${expiredSnap.size} candidate auction(s) to check.`
    );

    for (const docSnap of expiredSnap.docs) {
      const listingId = docSnap.id;
      const listingRef = docSnap.ref;

      try {
        await db.runTransaction(async (t) => {
          const freshSnap = await t.get(listingRef);
          if (!freshSnap.exists) return;

          const listing = freshSnap.data() as AuctionListingData;

          // Already processed by a previous run, or a bid/edit raced us
          // and the end date is no longer in the past -- skip.
          if (listing.auctionEnded === true) return;
          if (!listing.auctionEndDate || listing.auctionEndDate > nowIso) return;

          if (listing.highestBidderId && listing.highestBid) {
            t.update(listingRef, {
              price: listing.highestBid,
              auctionEnded: true,
            });

            const winnerNotifRef = db.collection("notifications").doc();
            t.set(winnerNotifRef, {
              userId: listing.highestBidderId,
              listingId,
              type: "auction_won",
              title: "You Won the Auction! 🎉",
              message: `Your bid of R ${listing.highestBid.toLocaleString()} won "${listing.title ?? "the item"}". Complete payment to secure it.`,
              timestamp: FieldValue.serverTimestamp(),
              isRead: false,
            });

            const sellerNotifRef = db.collection("notifications").doc();
            t.set(sellerNotifRef, {
              userId: listing.sellerId,
              listingId,
              type: "auction_ended_sold",
              title: "Your Auction Ended",
              message: `"${listing.title ?? "Your item"}" sold for R ${listing.highestBid.toLocaleString()}, awaiting buyer payment.`,
              timestamp: FieldValue.serverTimestamp(),
              isRead: false,
            });
          } else {
            t.update(listingRef, {
              status: "expired",
              auctionEnded: true,
            });

            const sellerNotifRef = db.collection("notifications").doc();
            t.set(sellerNotifRef, {
              userId: listing.sellerId,
              listingId,
              type: "auction_ended_no_bids",
              title: "Auction Ended -- No Bids",
              message: `"${listing.title ?? "Your listing"}" ended with no bids.`,
              timestamp: FieldValue.serverTimestamp(),
              isRead: false,
            });
          }
        });

        logger.info(`closeExpiredAuctions: processed listing ${listingId}.`);
      } catch (error) {
        // One bad listing shouldn't stop the rest of the batch from
        // being processed -- log and continue.
        logger.error(
          `closeExpiredAuctions: failed to process listing ${listingId}.`,
          { error }
        );
      }
    }
  }
);