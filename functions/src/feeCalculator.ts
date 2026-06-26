export const STANDARD_COMMISSION_RATE = 0.07; // 7%
export const PRO_COMMISSION_RATE = 0.05; // 5%

export interface CalculateFeesParams {
  salePrice: number;
  wasProAtListingCreation: boolean;
  listingBoostDebt?: number;
  accountBoostDebt?: number;
}

export interface CalculateFeesResult {
  salePrice: number;
  commissionRate: number;
  commissionAmount: number;
  listingBoostDebt: number;
  accountBoostDebt: number;
  totalBoostDebtDeducted: number;
  remainingAccountBoostDebt: number;
  sellerPayout: number;
}

export function calculateFees(params: CalculateFeesParams): CalculateFeesResult {
  const {
    salePrice,
    wasProAtListingCreation,
    listingBoostDebt = 0,
    accountBoostDebt = 0,
  } = params;

  if (typeof salePrice !== "number" || !Number.isFinite(salePrice) || salePrice <= 0) {
    throw new Error(`feeCalculator: salePrice must be a positive finite number, got ${salePrice}`);
  }

  if (
    typeof listingBoostDebt !== "number" ||
    !Number.isFinite(listingBoostDebt) ||
    listingBoostDebt < 0
  ) {
    throw new Error(
      `feeCalculator: listingBoostDebt must be a non-negative finite number, got ${listingBoostDebt}`
    );
  }

  if (
    typeof accountBoostDebt !== "number" ||
    !Number.isFinite(accountBoostDebt) ||
    accountBoostDebt < 0
  ) {
    throw new Error(
      `feeCalculator: accountBoostDebt must be a non-negative finite number, got ${accountBoostDebt}`
    );
  }

  const commissionRate = wasProAtListingCreation ? PRO_COMMISSION_RATE : STANDARD_COMMISSION_RATE;
  const commissionAmount = roundToCents(salePrice * commissionRate);
  const afterCommission = roundToCents(salePrice - commissionAmount);
  const totalBoostDebtOwed = roundToCents(listingBoostDebt + accountBoostDebt);
  const totalBoostDebtDeducted = Math.min(totalBoostDebtOwed, afterCommission);
  const unpaidPortion = roundToCents(totalBoostDebtOwed - totalBoostDebtDeducted);
  const remainingAccountBoostDebt = Math.min(unpaidPortion, accountBoostDebt);
  const sellerPayout = roundToCents(afterCommission - totalBoostDebtDeducted);

  return {
    salePrice,
    commissionRate,
    commissionAmount,
    listingBoostDebt,
    accountBoostDebt,
    totalBoostDebtDeducted,
    remainingAccountBoostDebt,
    sellerPayout,
  };
}

function roundToCents(amount: number): number {
  return Math.round((amount + Number.EPSILON) * 100) / 100;
}