/**
 * Delivery Distance and Fuel Pricing Engine for Matab Tameer-e-Sehat
 * Handles dynamic distance calculations (Haversine with road winding factor)
 * and fee computations based on central store settings.
 */

export interface DeliverySettingData {
  id: string;
  storeName: string;
  storeAddress: string;
  storeLatitude: number;
  storeLongitude: number;
  pricePerKm: number;
  baseDeliveryFee: number;
  minDeliveryFee: number;
  maxLocalRadiusKm: number;
  flatCourierFee: number;
  freeShippingThreshold: number;
  isDynamicDeliveryEnabled: boolean;
  googleMapsApiKey?: string | null;
}

export const DEFAULT_DELIVERY_SETTING: DeliverySettingData = {
  id: "default",
  storeName: "Matab Tameer-e-sehat",
  storeAddress:
    "Plot no L, 41 Korangi Crossing Rd, K.D.A Allah Wala Town Sector 31 B Korangi, Karachi, Pakistan",
  storeLatitude: 24.8291,
  storeLongitude: 67.1147,
  pricePerKm: 25.0,
  baseDeliveryFee: 100.0,
  minDeliveryFee: 150.0,
  maxLocalRadiusKm: 50.0,
  flatCourierFee: 200.0,
  freeShippingThreshold: 2000.0,
  isDynamicDeliveryEnabled: true,
  googleMapsApiKey: null,
};

export interface DeliveryCalculationResult {
  distanceKm: number | null;
  deliveryFee: number;
  feeType: "DYNAMIC" | "FLAT" | "FREE";
  isWithinRadius: boolean;
  breakdown: string;
  storeLocation: {
    name: string;
    address: string;
    latitude: number;
    longitude: number;
  };
}

/**
 * Calculates high-accuracy ground distance between two coordinates in kilometers.
 * Applies an urban road winding factor (1.2x) to convert straight-line
 * great-circle distance into realistic driving road distance.
 */
export function calculateHaversineDistanceKm(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number,
  roadFactor: number = 1.2
): number {
  const R = 6371; // Earth's mean radius in km
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const radLat1 = (lat1 * Math.PI) / 180;
  const radLat2 = (lat2 * Math.PI) / 180;

  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(radLat1) * Math.cos(radLat2) * Math.sin(dLon / 2) * Math.sin(dLon / 2);

  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  const straightDistanceKm = R * c;

  // Road factor adjustment and rounding to 1 decimal place (e.g. 14.2 km)
  const estimatedRoadDistance = straightDistanceKm * roadFactor;
  return Math.round(estimatedRoadDistance * 10) / 10;
}

/**
 * Computes the final delivery charge considering distance, store rates,
 * minimum thresholds, and free shipping conditions.
 */
export function calculateDeliveryFee({
  customerLat,
  customerLng,
  subtotal = 0,
  isFreeShippingCoupon = false,
  setting = DEFAULT_DELIVERY_SETTING,
}: {
  customerLat?: number | null;
  customerLng?: number | null;
  subtotal?: number;
  isFreeShippingCoupon?: boolean;
  setting?: DeliverySettingData;
}): DeliveryCalculationResult {
  const storeLocation = {
    name: setting.storeName,
    address: setting.storeAddress,
    latitude: setting.storeLatitude,
    longitude: setting.storeLongitude,
  };

  // 1. Free Shipping Check (orders >= threshold or promo coupon)
  const qualifiesForFreeShipping =
    isFreeShippingCoupon ||
    (setting.freeShippingThreshold > 0 && subtotal >= setting.freeShippingThreshold);

  if (qualifiesForFreeShipping) {
    let distanceKm: number | null = null;
    let isWithinRadius = true;

    if (
      customerLat !== null &&
      customerLat !== undefined &&
      customerLng !== null &&
      customerLng !== undefined &&
      !isNaN(customerLat) &&
      !isNaN(customerLng)
    ) {
      distanceKm = calculateHaversineDistanceKm(
        setting.storeLatitude,
        setting.storeLongitude,
        customerLat,
        customerLng
      );
      isWithinRadius = distanceKm <= setting.maxLocalRadiusKm;
    }

    return {
      distanceKm,
      deliveryFee: 0,
      feeType: "FREE",
      isWithinRadius,
      breakdown:
        subtotal >= setting.freeShippingThreshold
          ? `Free delivery unlocked on orders over ₨ ${setting.freeShippingThreshold.toLocaleString()}`
          : "Free delivery coupon applied",
      storeLocation,
    };
  }

  // 2. If coordinates are not provided, or dynamic delivery is toggled off
  if (
    customerLat === null ||
    customerLat === undefined ||
    customerLng === null ||
    customerLng === undefined ||
    isNaN(customerLat) ||
    isNaN(customerLng) ||
    !setting.isDynamicDeliveryEnabled
  ) {
    return {
      distanceKm: null,
      deliveryFee: setting.flatCourierFee,
      feeType: "FLAT",
      isWithinRadius: false,
      breakdown: `Standard nationwide flat courier delivery: ₨ ${setting.flatCourierFee}`,
      storeLocation,
    };
  }

  // 3. Compute distance from store
  const distanceKm = calculateHaversineDistanceKm(
    setting.storeLatitude,
    setting.storeLongitude,
    customerLat,
    customerLng
  );

  // 4. If distance exceeds local delivery radius, fall back to flat courier fee
  if (distanceKm > setting.maxLocalRadiusKm) {
    return {
      distanceKm,
      deliveryFee: setting.flatCourierFee,
      feeType: "FLAT",
      isWithinRadius: false,
      breakdown: `Distance (${distanceKm} km) exceeds local delivery radius (${setting.maxLocalRadiusKm} km). Applied standard nationwide courier rate: ₨ ${setting.flatCourierFee}`,
      storeLocation,
    };
  }

  // 5. Dynamic Local Rider Pricing Formula:
  // Fee = max(minDeliveryFee, baseDeliveryFee + (distanceKm * pricePerKm))
  const calculatedFuelFee = distanceKm * setting.pricePerKm;
  const rawTotal = setting.baseDeliveryFee + calculatedFuelFee;
  const finalFee = Math.round(Math.max(setting.minDeliveryFee, rawTotal));

  return {
    distanceKm,
    deliveryFee: finalFee,
    feeType: "DYNAMIC",
    isWithinRadius: true,
    breakdown: `Local delivery: Base ₨ ${setting.baseDeliveryFee} + (${distanceKm} km × ₨ ${setting.pricePerKm}/km) = ₨ ${finalFee}`,
    storeLocation,
  };
}
