import { astroClient } from "./client";

export const matchApis = {
  birthDetails: (payload) =>
    astroClient.post("/match_birth_details", payload),

  ashtakoot: (payload) =>
    astroClient.post("/match_ashtakoot_points", payload),

  dashakoot: (payload) =>
    astroClient.post("/match_dashakoot_points", payload),

  manglik: (payload) =>
    astroClient.post("/match_manglik_report", payload),

  obstructions: (payload) =>
    astroClient.post("/match_obstructions", payload),

  astroDetails: (payload) =>
    astroClient.post("/match_astro_details", payload),

  planetDetails: (payload) =>
    astroClient.post("/match_planet_details", payload),
};
