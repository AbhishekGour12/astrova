import { buildMatchPayload } from "./buildPayload";
import { matchApis } from "./matchApis";
import { mergeMatchReport } from "./mergeReport";

export const getFullMatchReport = async (boy, girl) => {
  const payload = buildMatchPayload(boy, girl);

  const [
    birthDetails,
    ashtakoot,
    dashakoot,
    manglik,
    obstructions,
    astroDetails,
    planetDetails,
  ] = await Promise.all([
    matchApis.birthDetails(payload),
    matchApis.ashtakoot(payload),
    matchApis.dashakoot(payload),
    matchApis.manglik(payload),
    matchApis.obstructions(payload),
    matchApis.astroDetails(payload),
    matchApis.planetDetails(payload),
  ]);

  return mergeMatchReport({
    birthDetails,
    ashtakoot,
    dashakoot,
    manglik,
    obstructions,
    astroDetails,
    planetDetails,
  });
};
