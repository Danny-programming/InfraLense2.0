export const queryOverpass = async (bounds: { south: number, west: number, north: number, east: number }) => {
  const query = `
    [out:json][timeout:25];
    (
      node["amenity"~"school|college|university"](${bounds.south},${bounds.west},${bounds.north},${bounds.east});
      way["amenity"~"school|college|university"](${bounds.south},${bounds.west},${bounds.north},${bounds.east});
      node["amenity"~"hospital|clinic|doctors"](${bounds.south},${bounds.west},${bounds.north},${bounds.east});
      way["amenity"~"hospital|clinic|doctors"](${bounds.south},${bounds.west},${bounds.north},${bounds.east});
      node["amenity"~"bank|atm"](${bounds.south},${bounds.west},${bounds.north},${bounds.east});
      way["amenity"~"bank|atm"](${bounds.south},${bounds.west},${bounds.north},${bounds.east});
    );
    out body;
    >;
    out skel qt;
  `;

  const res = await fetch('https://overpass-api.de/api/interpreter', {
    method: 'POST',
    headers: {
      'Accept': 'application/json',
      'User-Agent': 'InfraLense/2.0 (Public Infrastructure Analysis Tool)'
    },
    body: `data=${encodeURIComponent(query)}`
  });

  const data = await res.json();
  
  const results = {
    schools: 0,
    hospitals: 0,
    banks: 0,
    elements: data.elements
  };

  data.elements.forEach((el: any) => {
    const amenity = el.tags?.amenity;
    if (['school', 'college', 'university'].includes(amenity)) results.schools++;
    if (['hospital', 'clinic', 'doctors'].includes(amenity)) results.hospitals++;
    if (['bank', 'atm'].includes(amenity)) results.banks++;
  });

  return results;
};

export const reverseGeocode = async (lat: number, lng: number) => {
  try {
    const res = await fetch(`https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${lng}&format=json&addressdetails=1`, {
      headers: {
        'User-Agent': 'InfraLense/2.0 (Public Infrastructure Analysis Tool)',
        'Accept-Language': 'en'
      }
    });
    if (!res.ok) throw new Error('Reverse Geocode Failed');
    const data = await res.json();
    
    // Attempt to find the most relevant neighborhood or suburb name
    const neighborhood = data.address.suburb || data.address.neighborhood || data.address.residential || data.address.city_district || data.address.town || data.address.city;
    
    return {
      name: neighborhood ? `${neighborhood}, ${data.address.city || ''}`.replace(/, $/, '') : data.display_name,
      city: data.address.city || data.address.town || data.address.village,
      country: data.address.country,
      countryCode: data.address.country_code,
      fullAddress: data.display_name
    };
  } catch (e) {
    console.error('Reverse Geocode error:', e);
    return null;
  }
};

export const geocode = async (query: string, viewbox?: string) => {
  const url = `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(query)}&limit=5&addressdetails=1${viewbox ? `&viewbox=${viewbox}` : ''}`;
  const res = await fetch(url, {
    headers: {
      'User-Agent': 'InfraLense/2.0 (Public Infrastructure Analysis Tool)',
      'Accept-Language': 'en'
    }
  });
  if (!res.ok) throw new Error('Geocode Failed');
  const data = await res.json();
  return data.map((item: any) => ({
    display_name: item.display_name,
    lat: parseFloat(item.lat),
    lon: parseFloat(item.lon),
    type: item.type,
    category: item.category,
    boundingbox: item.boundingbox ? [
      [parseFloat(item.boundingbox[0]), parseFloat(item.boundingbox[2])], // [south, west]
      [parseFloat(item.boundingbox[1]), parseFloat(item.boundingbox[3])]  // [north, east]
    ] : null
  }));
};
