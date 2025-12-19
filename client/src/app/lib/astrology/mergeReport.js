export const mergeMatchReport = (r) => {
  const ashtakoot = r.ashtakoot?.data;
  const manglik = r.manglik?.data;
  const astro = r.astro_details || r.astroDetails?.data;

  return {
    summary: {
      guna_score: ashtakoot?.total?.received_points,
      max_score: ashtakoot?.total?.total_points,
      minimum_required: ashtakoot?.total?.minimum_required,

      guna_result: ashtakoot?.conclusion?.report,

      manglik_status: manglik?.conclusion?.report || null,

      compatibility: ashtakoot?.total?.received_points >=
        ashtakoot?.total?.minimum_required
        ? "Acceptable Match"
        : "Low Match",
    },

    ashtakoot,
    dashakoot: r.dashakoot?.data,
    manglik,
    obstructions: r.obstructions?.data,
    planet_details: r.planet_details || r.planetDetails?.data,
    birth_details: r.birth_details || r.birthDetails?.data,
    astro_details: astro,
  };
};
