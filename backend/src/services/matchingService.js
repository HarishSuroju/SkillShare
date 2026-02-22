const geoUtils = require('../utils/geoUtils');

const calculateScore = (provider, userLat, userLng) => {

  const [lng, lat] = provider.location.coordinates;

  const distance = geoUtils.calculateDistanceKm(
    userLat,
    userLng,
    lat,
    lng
  );

  const distanceScore = geoUtils.calculateDistanceScore(distance);

  const ratingScore = provider.rating / 5;
  const completionScore = provider.completionRate;
  const responseScore = Math.max(0, 1 - (provider.responseTimeAvg / 60));

  const finalScore =
    (0.4 * distanceScore) +
    (0.3 * ratingScore) +
    (0.2 * completionScore) +
    (0.1 * responseScore);

  return finalScore;
};

exports.rankProviders = (providers, userLat, userLng) => {
  return providers
    .map(p => ({
      provider: p,
      score: calculateScore(p, userLat, userLng)
    }))
    .sort((a, b) => b.score - a.score)
    .map(item => item.provider);
};