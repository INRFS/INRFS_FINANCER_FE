/* ============================================================
   INRFS – Indian Address & Pincode Auto-Fetch Service
   Resolves PIN codes from City, Area, State and vice-versa.
   Uses an offline fast-lookup directory with graceful fallback.
   ============================================================ */

/**
 * Standard Indian City & Hub to PIN code directory.
 * Maps lowercase normalized city/area names to their primary PIN codes and State.
 */
const PIN_DIRECTORY = [
  // Maharashtra
  { names: ['mumbai', 'bombay', 'south mumbai', 'nariman point', 'fort'], pin: '400001', city: 'Mumbai', state: 'Maharashtra' },
  { names: ['andheri', 'andheri west', 'andheri east', 'versova', 'lokhandwala', 'juhu'], pin: '400053', city: 'Mumbai', state: 'Maharashtra' },
  { names: ['bandra', 'bandra west', 'bandra east', 'khar', 'santacruz'], pin: '400050', city: 'Mumbai', state: 'Maharashtra' },
  { names: ['borivali', 'borivali west', 'kandivali', 'malad', 'goregaon'], pin: '400092', city: 'Mumbai', state: 'Maharashtra' },
  { names: ['thane', 'thane west', 'thane east', 'ghodbunder'], pin: '400601', city: 'Thane', state: 'Maharashtra' },
  { names: ['navi mumbai', 'vashi', 'nerul', 'kharghar', 'belapur', 'panvel'], pin: '400703', city: 'Navi Mumbai', state: 'Maharashtra' },
  { names: ['pune', 'poona', 'shivajinagar', 'deccan', 'kothrud', 'baner', 'wakad', 'hinjewadi', 'hadapsar', 'viman nagar'], pin: '411001', city: 'Pune', state: 'Maharashtra' },
  { names: ['nagpur', 'sitabuldi', 'dharampeth'], pin: '440001', city: 'Nagpur', state: 'Maharashtra' },
  { names: ['nashik', 'nasik'], pin: '422001', city: 'Nashik', state: 'Maharashtra' },
  { names: ['aurangabad', 'chhatrapati sambhajinagar'], pin: '431001', city: 'Chhatrapati Sambhajinagar', state: 'Maharashtra' },
  { names: ['solapur', 'sholapur'], pin: '413001', city: 'Solapur', state: 'Maharashtra' },
  { names: ['kolhapur'], pin: '416001', city: 'Kolhapur', state: 'Maharashtra' },
  { names: ['jalgaon'], pin: '425001', city: 'Jalgaon', state: 'Maharashtra' },

  // Delhi NCR
  { names: ['delhi', 'new delhi', 'connaught place', 'cp', 'chandni chowk', 'karol bagh'], pin: '110001', city: 'Delhi', state: 'Delhi' },
  { names: ['dwarka', 'south delhi', 'saket', 'hauz khas'], pin: '110075', city: 'Delhi', state: 'Delhi' },
  { names: ['noida', 'greater noida'], pin: '201301', city: 'Noida', state: 'Uttar Pradesh' },
  { names: ['gurgaon', 'gurugram', 'cyber city', 'dlf'], pin: '122001', city: 'Gurugram', state: 'Haryana' },
  { names: ['faridabad'], pin: '121001', city: 'Faridabad', state: 'Haryana' },
  { names: ['ghaziabad'], pin: '201001', city: 'Ghaziabad', state: 'Uttar Pradesh' },

  // Karnataka
  { names: ['bangalore', 'bengaluru', 'mg road bangalore', 'indiranagar', 'koramangala', 'whitefield', 'electronic city', 'jayanagar', 'hsr layout'], pin: '560001', city: 'Bengaluru', state: 'Karnataka' },
  { names: ['mysore', 'mysuru'], pin: '570001', city: 'Mysuru', state: 'Karnataka' },
  { names: ['hubli', 'hubballi', 'dharwad'], pin: '580020', city: 'Hubballi', state: 'Karnataka' },
  { names: ['mangalore', 'mangaluru'], pin: '575001', city: 'Mangaluru', state: 'Karnataka' },
  { names: ['belgaum', 'belagavi'], pin: '590001', city: 'Belagavi', state: 'Karnataka' },

  // Telangana & Andhra Pradesh
  { names: ['hyderabad', 'secunderabad', 'hitec city', 'banjara hills', 'jubilee hills', 'gachibowli', 'madhapur'], pin: '500001', city: 'Hyderabad', state: 'Telangana' },
  { names: ['warangal'], pin: '506001', city: 'Warangal', state: 'Telangana' },
  { names: ['visakhapatnam', 'vizag'], pin: '530001', city: 'Visakhapatnam', state: 'Andhra Pradesh' },
  { names: ['vijayawada'], pin: '520001', city: 'Vijayawada', state: 'Andhra Pradesh' },
  { names: ['guntur'], pin: '522001', city: 'Guntur', state: 'Andhra Pradesh' },
  { names: ['tirupati'], pin: '517501', city: 'Tirupati', state: 'Andhra Pradesh' },

  // Tamil Nadu
  { names: ['chennai', 'madras', 't nagar', 'anna nagar', 'adyar', 'velachery', 'guindy'], pin: '600001', city: 'Chennai', state: 'Tamil Nadu' },
  { names: ['coimbatore'], pin: '641001', city: 'Coimbatore', state: 'Tamil Nadu' },
  { names: ['madurai'], pin: '625001', city: 'Madurai', state: 'Tamil Nadu' },
  { names: ['tiruchirappalli', 'trichy'], pin: '620001', city: 'Tiruchirappalli', state: 'Tamil Nadu' },
  { names: ['salem'], pin: '636001', city: 'Salem', state: 'Tamil Nadu' },
  { names: ['tiruppur', 'tirupur'], pin: '641601', city: 'Tiruppur', state: 'Tamil Nadu' },

  // Gujarat
  { names: ['ahmedabad', 'ahmadabad', 'navrangpura', 'sg highway', 'satellite', 'maninagar'], pin: '380001', city: 'Ahmedabad', state: 'Gujarat' },
  { names: ['surat'], pin: '395001', city: 'Surat', state: 'Gujarat' },
  { names: ['vadodara', 'baroda'], pin: '390001', city: 'Vadodara', state: 'Gujarat' },
  { names: ['rajkot'], pin: '360001', city: 'Rajkot', state: 'Gujarat' },
  { names: ['bhavnagar'], pin: '364001', city: 'Bhavnagar', state: 'Gujarat' },

  // West Bengal
  { names: ['kolkata', 'calcutta', 'salt lake', 'park street', 'howrah'], pin: '700001', city: 'Kolkata', state: 'West Bengal' },
  { names: ['siliguri'], pin: '734001', city: 'Siliguri', state: 'West Bengal' },
  { names: ['durgapur'], pin: '713201', city: 'Durgapur', state: 'West Bengal' },

  // Rajasthan
  { names: ['jaipur', 'pink city', 'malviya nagar jaipur', 'c scheme'], pin: '302001', city: 'Jaipur', state: 'Rajasthan' },
  { names: ['jodhpur'], pin: '342001', city: 'Jodhpur', state: 'Rajasthan' },
  { names: ['udaipur'], pin: '313001', city: 'Udaipur', state: 'Rajasthan' },
  { names: ['kota'], pin: '324001', city: 'Kota', state: 'Rajasthan' },

  // Uttar Pradesh
  { names: ['lucknow', 'hazratganj', 'gomti nagar'], pin: '226001', city: 'Lucknow', state: 'Uttar Pradesh' },
  { names: ['kanpur'], pin: '208001', city: 'Kanpur', state: 'Uttar Pradesh' },
  { names: ['varanasi', 'banaras', 'kashi'], pin: '221001', city: 'Varanasi', state: 'Uttar Pradesh' },
  { names: ['agra'], pin: '282001', city: 'Agra', state: 'Uttar Pradesh' },
  { names: ['prayagraj', 'allahabad'], pin: '211001', city: 'Prayagraj', state: 'Uttar Pradesh' },
  { names: ['meerut'], pin: '250001', city: 'Meerut', state: 'Uttar Pradesh' },
  { names: ['bareilly'], pin: '243001', city: 'Bareilly', state: 'Uttar Pradesh' },
  { names: ['aligarh'], pin: '202001', city: 'Aligarh', state: 'Uttar Pradesh' },

  // Madhya Pradesh
  { names: ['indore'], pin: '452001', city: 'Indore', state: 'Madhya Pradesh' },
  { names: ['bhopal'], pin: '462001', city: 'Bhopal', state: 'Madhya Pradesh' },
  { names: ['jabalpur'], pin: '482001', city: 'Jabalpur', state: 'Madhya Pradesh' },
  { names: ['gwalior'], pin: '474001', city: 'Gwalior', state: 'Madhya Pradesh' },

  // Kerala
  { names: ['kochi', 'cochin', 'ernakulam'], pin: '682001', city: 'Kochi', state: 'Kerala' },
  { names: ['thiruvananthapuram', 'trivandrum'], pin: '695001', city: 'Thiruvananthapuram', state: 'Kerala' },
  { names: ['kozhikode', 'calicut'], pin: '673001', city: 'Kozhikode', state: 'Kerala' },

  // Punjab, Haryana, Chandigarh
  { names: ['chandigarh'], pin: '160001', city: 'Chandigarh', state: 'Chandigarh' },
  { names: ['ludhiana'], pin: '141001', city: 'Ludhiana', state: 'Punjab' },
  { names: ['amritsar'], pin: '143001', city: 'Amritsar', state: 'Punjab' },
  { names: ['jalandhar'], pin: '144001', city: 'Jalandhar', state: 'Punjab' },

  // Bihar, Jharkhand, Odisha
  { names: ['patna'], pin: '800001', city: 'Patna', state: 'Bihar' },
  { names: ['ranchi'], pin: '834001', city: 'Ranchi', state: 'Jharkhand' },
  { names: ['jamshedpur', 'tatanagar'], pin: '831001', city: 'Jamshedpur', state: 'Jharkhand' },
  { names: ['dhanbad'], pin: '826001', city: 'Dhanbad', state: 'Jharkhand' },
  { names: ['bhubaneswar'], pin: '751001', city: 'Bhubaneswar', state: 'Odisha' },
  { names: ['cuttack'], pin: '753001', city: 'Cuttack', state: 'Odisha' },

  // Assam & Northeast
  { names: ['guwahati'], pin: '781001', city: 'Guwahati', state: 'Assam' },
  { names: ['shillong'], pin: '793001', city: 'Shillong', state: 'Meghalaya' },

  // Jammu & Kashmir, Uttarakhand, Goa, Chhattisgarh, etc.
  { names: ['srinagar'], pin: '190001', city: 'Srinagar', state: 'Jammu & Kashmir' },
  { names: ['jammu'], pin: '180001', city: 'Jammu', state: 'Jammu & Kashmir' },
  { names: ['dehradun'], pin: '248001', city: 'Dehradun', state: 'Uttarakhand' },
  { names: ['raipur'], pin: '492001', city: 'Raipur', state: 'Chhattisgarh' },
  { names: ['panaji', 'goa'], pin: '403001', city: 'Panaji', state: 'Goa' },
];

/**
 * Searches local directory for matching PIN code given city, area, or address text.
 * @param {string} text
 * @returns {{ pin: string, city: string, state: string } | null}
 */
export function lookupLocalPincode(text) {
  if (!text || typeof text !== 'string') return null;
  const query = text.toLowerCase().trim();
  if (!query || query.length < 3) return null;

  for (const entry of PIN_DIRECTORY) {
    for (const name of entry.names) {
      if (query === name || query.includes(name) || name.includes(query)) {
        return {
          pin: entry.pin,
          city: entry.city,
          state: entry.state,
        };
      }
    }
  }
  return null;
}

/**
 * Reverse lookup city and state by PIN code.
 * @param {string} pin
 * @returns {{ city: string, state: string } | null}
 */
export function lookupByPin(pin) {
  const cleanPin = String(pin || '').trim();
  if (!/^[1-9]\d{5}$/.test(cleanPin)) return null;

  const found = PIN_DIRECTORY.find((item) => item.pin === cleanPin);
  if (found) {
    return { city: found.city, state: found.state };
  }
  return null;
}

/**
 * Automatically resolves a pincode from address fields (area, city, state, street).
 * Handles resolution gracefully without blocking or throwing.
 *
 * @param {{ area?: string, city?: string, state?: string, street?: string }} address
 * @returns {Promise<string | null>} pincode if found, otherwise null
 */
export async function autoFetchPincode(address = {}) {
  const { area = '', city = '', state = '', street = '' } = address;

  // Try specific area first
  if (area) {
    const areaResult = lookupLocalPincode(area);
    if (areaResult) return areaResult.pin;
  }

  // Try city next
  if (city) {
    const cityResult = lookupLocalPincode(city);
    if (cityResult) return cityResult.pin;
  }

  // Try street if it contains locality keywords
  if (street) {
    const streetResult = lookupLocalPincode(street);
    if (streetResult) return streetResult.pin;
  }

  // Fallback: Check if city + state matches
  if (city && state) {
    const combo = `${city} ${state}`;
    const comboResult = lookupLocalPincode(combo);
    if (comboResult) return comboResult.pin;
  }

  return null;
}
