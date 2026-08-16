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
 * Directly finds the closest Indian district and its state using exact geometric GPS coordinates
 */
export function findClosestDistrict(
  lat: number,
  lon: number,
  statesList: StateInfo[]
): { state: StateInfo; district?: DistrictInfo; distanceKm: number } {
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

  if (closestDistrict && closestDistrictState) {
    return { state: closestDistrictState, district: closestDistrict, distanceKm: minDistrictDist };
  }

  // Fallback to state center coordinates if needed
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

  return { state: closestState, district: closestState.districts?.[0], distanceKm: minStateDist };
}

/**
 * Reverse-geocodes coordinates with multi-tier fallbacks to identify State and District with high accuracy
 */
export async function detectUserRegion(
  lat: number,
  lon: number,
  statesList: StateInfo[]
): Promise<LocationDetectionResult> {
  // 1. Primary Precision: GPS Geometric Triangulation against all Indian Districts
  const geoResult = findClosestDistrict(lat, lon, statesList);

  // If geometric distance to a district center is close (< 75km), GPS coordinate is ground-truth!
  if (geoResult.district && geoResult.distanceKm < 75) {
    return {
      state: geoResult.state,
      district: geoResult.district,
      source: 'browser-gps',
      cityName: geoResult.district.name
    };
  }

  // 2. Try reverse geocoders if coordinates are in border areas or wider radius
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 3500);

    const res = await fetch(
      `https://api.bigdatacloud.net/data/reverse-geocode-client?latitude=${lat}&longitude=${lon}&localityLanguage=en`,
      { signal: controller.signal }
    );
    clearTimeout(timeoutId);

    if (res.ok) {
      const data = await res.json();
      const stateName = (data.principalSubdivision || data.countrySubdivision || '').toLowerCase();
      
      // Check all administrative levels for exact district name
      const adminNames: string[] = [];
      if (Array.isArray(data.localityInfo?.administrative)) {
        for (const item of data.localityInfo.administrative) {
          if (item.name) adminNames.push(item.name.toLowerCase());
        }
      }
      if (data.locality) adminNames.push(data.locality.toLowerCase());
      if (data.city) adminNames.push(data.city.toLowerCase());

      const matchedState = statesList.find(st => 
        stateName.includes(st.name.toLowerCase()) || 
        st.name.toLowerCase().includes(stateName) ||
        (st.hindiName && stateName.includes(st.hindiName.toLowerCase()))
      );

      if (matchedState && matchedState.districts) {
        // Find if any admin name matches a district in this state
        let matchedDistrict: DistrictInfo | undefined;
        for (const adm of adminNames) {
          matchedDistrict = matchedState.districts.find(d => 
            adm.includes(d.name.toLowerCase()) || 
            d.name.toLowerCase().includes(adm) ||
            adm.includes(d.id.toLowerCase())
          );
          if (matchedDistrict) break;
        }

        if (!matchedDistrict) {
          const closestInState = findClosestDistrict(lat, lon, [matchedState]);
          matchedDistrict = closestInState.district;
        }

        return {
          state: matchedState,
          district: matchedDistrict || matchedState.districts[0],
          source: 'reverse-geocode',
          cityName: matchedDistrict?.name || data.locality || data.city
        };
      }
    }
  } catch {
    // Continue
  }

  // 3. OpenStreetMap Nominatim Fallback
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 3000);

    const response = await fetch(
      `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lon}&zoom=12&addressdetails=1`,
      { signal: controller.signal }
    );
    clearTimeout(timeoutId);

    if (response.ok) {
      const data = await response.json();
      const addr = data.address || {};
      const stateName = (addr.state || addr.province || '').toLowerCase();
      
      const adminNames = [
        addr.county,
        addr.state_district,
        addr.district,
        addr.city,
        addr.town,
        addr.village,
        addr.municipality
      ].filter(Boolean).map((s: string) => s.toLowerCase());

      const matchedState = statesList.find(st => 
        stateName.includes(st.name.toLowerCase()) || 
        st.name.toLowerCase().includes(stateName)
      );

      if (matchedState && matchedState.districts) {
        let matchedDistrict: DistrictInfo | undefined;
        for (const name of adminNames) {
          matchedDistrict = matchedState.districts.find(d => 
            name.includes(d.name.toLowerCase()) || 
            d.name.toLowerCase().includes(name)
          );
          if (matchedDistrict) break;
        }

        return {
          state: matchedState,
          district: matchedDistrict || matchedState.districts[0],
          source: 'reverse-geocode',
          cityName: matchedDistrict?.name || addr.city || addr.town || addr.county
        };
      }
    }
  } catch {
    // Continue
  }

  // 4. Return closest geometric district
  return {
    state: geoResult.state,
    district: geoResult.district,
    source: 'browser-gps',
    cityName: geoResult.district?.name
  };
}

/**
 * IP-based location detection fallback when GPS is denied or unavailable
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

  const defaultState = statesList.find(s => s.id === 'bihar') || statesList[0];
  return {
    state: defaultState,
    district: defaultState.districts?.[0],
    source: 'ip-fallback',
    cityName: defaultState.districts?.[0]?.name
  };
}

/**
 * Requests browser GPS location with fallback to IP detection and saves to localStorage
 */
export function requestBrowserLocation(statesList: StateInfo[]): Promise<LocationDetectionResult> {
  return new Promise((resolve) => {
    if (!navigator.geolocation) {
      detectLocationByIP(statesList).then(resolve);
      return;
    }

    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        try {
          const result = await detectUserRegion(pos.coords.latitude, pos.coords.longitude, statesList);
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
            source: 'browser-gps',
            cityName: fallback.district?.name
          });
        }
      },
      async (err) => {
        console.warn('GPS permission not granted, using IP fallback:', err);
        try {
          const ipResult = await detectLocationByIP(statesList);
          resolve(ipResult);
        } catch {
          const def = statesList.find(s => s.id === 'bihar') || statesList[0];
          resolve({ state: def, district: def.districts?.[0], source: 'ip-fallback', cityName: def.districts?.[0]?.name });
        }
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 30000
      }
    );
  });
}
