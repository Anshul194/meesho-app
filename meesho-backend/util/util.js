const dateFilter = async (start_date, end_date) => {
  let sd = new Date(start_date);
  let ed = new Date(end_date);
  sd.setHours(0, 0, 0, 0);
  ed.setHours(23, 59, 59, 999);
  return { startDate: sd, endDate: ed };
};

module.exports = {
  dateFilter,
};
