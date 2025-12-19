export const buildMatchPayload = (boy, girl) => {
  const [m_year, m_month, m_day] = boy.dob.split("-").map(Number);
  const [m_hour, m_min] = boy.time.split(":").map(Number);

  const [f_year, f_month, f_day] = girl.dob.split("-").map(Number);
  const [f_hour, f_min] = girl.time.split(":").map(Number);

  return {
    m_day,
    m_month,
    m_year,
    m_hour,
    m_min,
    m_lat: boy.lat,
    m_lon: boy.lon,
    m_tzone: boy.tz,

    f_day,
    f_month,
    f_year,
    f_hour,
    f_min,
    f_lat: girl.lat,
    f_lon: girl.lon,
    f_tzone: girl.tz,
  };
};
