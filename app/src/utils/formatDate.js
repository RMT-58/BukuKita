export function formatCreatedAtDate(createdAt) {
  console.log(createdAt);
  const date = new Date(createdAt);

  if (isNaN(date)) {
    return "Invalid date";
  }

  // Format the date as 'Month Day, Year' (e.g., "April 3, 2025")
  return date.toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}

export function formatUnixTimestamp(timestamp) {
  const timestampAsNumber = Number(timestamp); // Ensure the timestamp is a number

  // Check if the timestamp is valid
  if (isNaN(timestampAsNumber)) {
    console.error("Invalid timestamp:", timestamp);
    return "Invalid date";
  }

  const date = new Date(timestampAsNumber); // Create a Date object from the timestamp
  console.log(date, "date");

  // Format the date as 'Month Day, Year' (e.g., "April 3, 2025")
  return date.toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}
