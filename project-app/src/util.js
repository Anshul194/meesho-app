export const formatDateTime = (timestamp) => {
  const dateObj = new Date(timestamp);

  // Define options for formatting the date
  const options = {
    day: "2-digit", // Add leading zeros if necessary
    month: "2-digit", // Add leading zeros if necessary
    year: "numeric", // 4-digit year
  };

  // Format the date portion using the specified options
  const date = dateObj.toLocaleDateString("en-IN", options); // "en-GB" for the "dd-mm-yyyy" format

  // Get time portion
  const time = dateObj.toLocaleTimeString();

  // Concatenate date and time
  return `${date} ${time}`;
};

export const getStatusColor = (status) => {
  switch (status) {
    case "Pending":
      return "#FFC300";
    case "Rejected":
      return "red";
    case "Approved":
      return "green";

    case "Order Placed":
      return "green";
    case "Right RTO Return":
      return "green";
    case "Right Customer Return":
      return "green";
    case "Cancelled":
      return "green";

    case "Wrong RTO Return":
      return "red";
    case "Wrong Customer Return":
      return "red";

    default:
      return "green";
  }
};

export const API_ENDPOINT = process.env.REACT_APP_API_ENDPOINT;
