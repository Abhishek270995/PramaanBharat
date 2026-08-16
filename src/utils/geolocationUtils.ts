import { StateInfo, DistrictInfo } from '../types';

export interface LocationDetectionResult {
  state: StateInfo;
  district?: DistrictInfo;
  source: 'browser-gps' | 'reverse-geocode' | 'ip-fallback';
  cityName?: string;
}

/**
 * Calculates the Haversine distance between two latitude/longitude coordinates in kilometers
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
 * Directly finds the closest Indian district and its state across all states using geometric coordinates
 */
export function findClosestDistrict(
  lat: number,
  lon: number,
  statesList: StateInfo[]
): { state: StateInfo; district?: DistrictInfo } {
  let closestDistrict: DistrictInfo | undefined;
  let closestDistrictState: StateInfo | undefined;
  let minDistrictDist = Infinity;

  // Search across all districts of all states
  for (const state of statesList) {
    if (state.districts && state.districts.length > 0) {
      for (const dist of state.districts) {
        if (dist.coordinates && dist.coordinates.length === 2) {
          const d = getDistanceKm(lat, lon, dist.coordinates[0], dist.coordinates[1]);
          if (d < minDistrictDist) {
            minDistrictDist = d;
            closestDistrict = dist;
            closestDistrictState = state;
          }
        }
      }
    }
  }

  // If a district was found within reasonable range (< 350km)
  if (closestDistrict && closestDistrictState) {
    return { state: closestDistrictState, district: closestDistrict };
  }

  // Fallback to state center coordinates if no district matches closely
  let closestState = statesList[0];
  let minStateDist = Infinity;
  for (const st of statesList) {
    if (st.centerCoordinates) {
      const dist = getDistanceKm(lat, lon, st.centerCoordinates[0], st.centerCoordinates[1]);
      if (dist < minStateDist) {
        minStateDist = dist;
        closestState = st;
      }
    }
  }

  return { state: closestState, district: closestState.districts?.[0] };
}

/**
 * Reverse-geocodes coordinates with multi-provider fallbacks to identify State and District
 */
export async function detectUserRegion(
  lat: number,
  lon: number,
  statesList: StateInfo[]
): Promise<LocationDetectionResult> {
  // 1. Try BigDataCloud reverse geocoder (free, fast, 100% CORS enabled)
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 4000);

    const res = await fetch(
      `https://api.bigdatacloud.net/data/reverse-geocode-client?latitude=${lat}&longitude=${lon}&localityLanguage=en`,
      { signal: controller.signal }
    );
    clearTimeout(timeoutId);

    if (res.ok) {
      const data = await res.json();
      const stateName = (data.principalSubdivision || data.countrySubdivision || '').toLowerCase();
      const cityName = (data.locality || data.city || data.localityInfo?.administrative?.[2]?.name || '').toLowerCase();

      // Find state match
      const matchedState = statesList.find(st => 
        stateName.includes(st.name.toLowerCase()) || 
        st.name.toLowerCase().includes(stateName) ||
        (st.hindiName && stateName.includes(st.hindiName.toLowerCase()))
      );

      if (matchedState) {
        let matchedDistrict: DistrictInfo | undefined;
        if (matchedState.districts && matchedState.districts.length > 0) {
          // Look for city/locality match
          matchedDistrict = matchedState.districts.find(d => 
            cityName.includes(d.name.toLowerCase()) || 
            d.name.toLowerCase().includes(cityName) ||
            cityName.includes(d.id.toLowerCase())
          );
        }

        // If exact district text match wasn't found, find closest district within that state
        if (!matchedDistrict && matchedState.districts) {
          const closestInState = findClosestDistrict(lat, lon, [matchedState]);
          matchedDistrict = closestInState.district;
        }

        return {
          state: matchedState,
          district: matchedDistrict || matchedState.districts?.[0],
          source: 'reverse-geocode',
          cityName: data.locality || data.city
        };
      }
    }
  } catch {
    // Continue to next provider
  }

  // 2. Try OpenStreetMap Nominatim
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 3500);

    const response = await fetch(
      `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lon}&zoom=12&addressdetails=1`,
      { signal: controller.signal }
    );
    clearTimeout(timeoutId);

    if (response.ok) {
      const data = await response.json();
      const addr = data.address || {};
      const stateName = (addr.state || addr.province || '').toLowerCase();
      const districtOrCity = (addr.state_district || addr.county || addr.city || addr.town || '').toLowerCase();

      const matchedState = statesList.find(st => 
        stateName.includes(st.name.toLowerCase()) || 
        st.name.toLowerCase().includes(stateName)
      );

      if (matchedState) {
        let matchedDistrict: DistrictInfo | undefined;
        if (matchedState.districts) {
          matchedDistrict = matchedState.districts.find(d => 
            districtOrCity.includes(d.name.toLowerCase()) || 
            d.name.toLowerCase().includes(districtOrCity)
          );
        }
        return {
          state: matchedState,
          district: matchedDistrict || matchedState.districts?.[0],
          source: 'reverse-geocode',
          cityName: addr.city || addr.town || addr.county
        };
      }
    }
  } catch {
    // Continue to coordinate matching
  }

  // 3. Fallback: Ultra-reliable geometric coordinate calculation against all districts in India
  const geoResult = findClosestDistrict(lat, lon, statesList);
  return {
    state: geoResult.state,
    district: geoResult.district,
    source: 'browser-gps'
  };
}

/**
 * IP-based location detection fallback when GPS is not granted or fails
 */
export async function detectLocationByIP(statesList: StateInfo[]): Promise<LocationDetectionResult> {
  try {
    const res = await fetch('https://ipwho.is/');
    if (res.ok) {
      const data = await res.json();
      if (data.success && data.latitude && data.longitude) {
        return await detectUserRegion(data.latitude, data.longitude, statesList);
      }
    }
  } catch {
    // fallback
  }

  // Second IP fallback
  try {
    const res2 = await fetch('https://ipapi.co/json/');
    if (res2.ok) {
      const data2 = await res2.json();
      if (data2.latitude && data2.longitude) {
        return await detectUserRegion(data2.latitude, data2.longitude, statesList);
      }
    }
  } catch {
    // fallback
  }

  // Default to National (Delhi NCR / Central)
  const defaultState = statesList.find(s => s.id === 'delhi-ncr') || statesList[0];
  return {
    state: defaultState,
    district: defaultState.districts?.[0],
    source: 'ip-fallback'
  };
}

/**
 * Requests browser location with fallback to IP detection and saves to localStorage
 */
export function requestBrowserLocation(statesList: StateInfo[]): Promise<LocationDetectionResult> {
  return new Promise((resolve) => {
    if (!navigator.geolocation) {
      // If browser doesn't support geolocation, fallback to IP detection
      detectLocationByIP(statesList).then(resolve);
      return;
    }

    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        try {
          const result = await detectUserRegion(pos.coords.latitude, pos.coords.longitude, statesList);
          // Persist location
          try {
            localStorage.setItem('pramaan_user_location', JSON.stringify({
              stateId: result.state.id,
              districtId: result.district?.id,
              stateName: result.state.name,
              districtName: result.district?.name,
              detectedAt: new Date().toISOString()
            }));
          } catch {
            // Ignore
          }
          resolve(result);
        } catch {
          const fallback = findClosestDistrict(pos.coords.latitude, pos.coords.longitude, statesList);
          resolve({
            state: fallback.state,
            district: fallback.district,
            source: 'browser-gps'
          });
        }
      },
      async (err) => {
        console.warn('Geolocation error / permission denied, using IP fallback:', err);
        // Fallback to IP geolocation so user is never blocked with an error!
        try {
          const ipResult = await detectLocationByIP(statesList);
          resolve(ipResult);
        } catch {
          const def = statesList[0];
          resolve({ state: def, district: def.districts?.[0], source: 'ip-fallback' });
        }
      },
      {
        enableHighAccuracy: true,
        timeout: 12000,
        maximumAge: 60000
      }
    );
  });
}
