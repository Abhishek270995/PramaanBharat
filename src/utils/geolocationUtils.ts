import { StateInfo, DistrictInfo } from '../types';

export interface LocationDetectionResult {
  state: StateInfo;
  district?: DistrictInfo;
  source: 'reverse-geocode' | 'nearest-coordinate' | 'ip-fallback';
  cityName?: string;
}

/**
 * Calculates the Haversine distance between two latitude/longitude pairs in kilometers
 */
function getDistanceKm(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371; // Earth radius in km
  const dLat = (lat2 - lat1) * (Math.PI / 180);
  const dLon = (lon2 - lon1) * (Math.PI / 180);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1 * (Math.PI / 180)) * Math.cos(lat2 * (Math.PI / 180)) *
    Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

/**
 * Finds the closest state and district from coordinates
 */
export function findClosestRegionByCoordinates(
  lat: number,
  lon: number,
  statesList: StateInfo[]
): { state: StateInfo; district?: DistrictInfo } {
  let closestState = statesList[0];
  let minStateDist = Infinity;

  // 1. Find closest state center
  for (const st of statesList) {
    if (st.centerCoordinates) {
      const dist = getDistanceKm(lat, lon, st.centerCoordinates[0], st.centerCoordinates[1]);
      if (dist < minStateDist) {
        minStateDist = dist;
        closestState = st;
      }
    }
  }

  // 2. Find closest district within the state or adjacent states
  let closestDistrict: DistrictInfo | undefined;
  let minDistDist = Infinity;

  if (closestState.districts) {
    for (const dist of closestState.districts) {
      if (dist.coordinates) {
        const d = getDistanceKm(lat, lon, dist.coordinates[0], dist.coordinates[1]);
        if (d < minDistDist) {
          minDistDist = d;
          closestDistrict = dist;
        }
      }
    }
  }

  return { state: closestState, district: closestDistrict };
}

/**
 * Reverse geocodes coordinates via client reverse geocoding API
 */
export async function detectUserRegion(
  lat: number,
  lon: number,
  statesList: StateInfo[]
): Promise<LocationDetectionResult> {
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 3500);

    const response = await fetch(
      `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lon}&zoom=10&addressdetails=1`,
      {
        headers: { 'Accept-Language': 'en' },
        signal: controller.signal
      }
    );
    clearTimeout(timeoutId);

    if (response.ok) {
      const data = await response.json();
      const addr = data.address || {};
      const stateName = (addr.state || addr.province || '').toLowerCase();
      const cityName = (addr.city || addr.town || addr.county || addr.state_district || '').toLowerCase();

      // Find state match
      const matchedState = statesList.find(st => 
        stateName.includes(st.name.toLowerCase()) || 
        st.name.toLowerCase().includes(stateName) ||
        (st.hindiName && stateName.includes(st.hindiName))
      );

      if (matchedState) {
        let matchedDistrict: DistrictInfo | undefined;
        if (matchedState.districts && cityName) {
          matchedDistrict = matchedState.districts.find(d => 
            cityName.includes(d.name.toLowerCase()) || 
            d.name.toLowerCase().includes(cityName)
          );
        }

        return {
          state: matchedState,
          district: matchedDistrict,
          source: 'reverse-geocode',
          cityName: addr.city || addr.town || addr.county
        };
      }
    }
  } catch {
    // Fallback to geometric coordinate matching
  }

  const fallback = findClosestRegionByCoordinates(lat, lon, statesList);
  return {
    state: fallback.state,
    district: fallback.district,
    source: 'nearest-coordinate'
  };
}

/**
 * Requests browser location and returns detected State and District
 */
export function requestBrowserLocation(statesList: StateInfo[]): Promise<LocationDetectionResult> {
  return new Promise((resolve, reject) => {
    if (!navigator.geolocation) {
      reject(new Error('Geolocation is not supported by this browser.'));
      return;
    }

    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        try {
          const result = await detectUserRegion(pos.coords.latitude, pos.coords.longitude, statesList);
          // Persist user detected location in localStorage
          try {
            localStorage.setItem('pramaan_user_location', JSON.stringify({
              stateId: result.state.id,
              districtId: result.district?.id,
              stateName: result.state.name,
              districtName: result.district?.name,
              detectedAt: new Date().toISOString()
            }));
          } catch {
            // Ignore storage errors
          }
          resolve(result);
        } catch (err) {
          reject(err);
        }
      },
      (err) => {
        reject(err);
      },
      {
        enableHighAccuracy: false,
        timeout: 8000,
        maximumAge: 3600000 // Cache for 1 hour
      }
    );
  });
}
