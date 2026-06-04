import { Firestore, doc, collection, addDoc, updateDoc, serverTimestamp } from "firebase/firestore";

/**
 * Escrow & Payout Manager (Phase 4)
 * Handles the secure hold and release of funds for marketplace trades.
 */
export class EscrowManager {
  constructor(private db: Firestore) {}

  async createHold(transactionId: string, buyerId: string, amount: number) {
    const holdData = {
      transactionId,
      userId: buyerId,
      amount,
      status: "held",
      heldAt: serverTimestamp(),
      type: "PLATFORM_ESCROW",
    };
    
    return addDoc(collection(this.db, "escrowHolds"), holdData);
  }

  async releaseHold(holdId: string, adminId?: string) {
    const holdRef = doc(this.db, "escrowHolds", holdId);
    await updateDoc(holdRef, {
      status: "released",
      releasedAt: serverTimestamp(),
      releasedBy: adminId || "SYSTEM_AUTO",
    });
  }

  async initiateRefund(holdId: string, reason: string) {
    const holdRef = doc(this.db, "escrowHolds", holdId);
    await updateDoc(holdRef, {
      status: "refunded",
      refundReason: reason,
      refundedAt: serverTimestamp(),
    });
  }
}
