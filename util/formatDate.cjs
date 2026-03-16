function formatDate(timestamptz) {
  const date = new Date(timestamptz);

  const formatted = new Intl.DateTimeFormat("th-TH", {
    dateStyle: "medium",
    timeStyle: "short"
  }).format(date);

  return formatted;
}

module.exports = formatDate;