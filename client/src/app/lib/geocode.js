export const getLatLngFromCity = async (city) => {
  if (!city) return null;

  const res = await fetch(
    `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(
      city
    )}&format=json&limit=1`
  );

  const data = await res.json();

  if (!data.length) {
    throw new Error("Location not found");
  }

  return {
    lat: parseFloat(data[0].lat),
    lon: parseFloat(data[0].lon),
  };
};
