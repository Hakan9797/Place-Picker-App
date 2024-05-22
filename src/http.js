// Async function to fetch available places from the server
export async function fetchAvailablePlaces() {
  // Send a GET request to 'http://localhost:3000/places'
  const response = await fetch("http://localhost:3000/places");
  // Parse the response as JSON
  const resData = await response.json();

  // If the response is not OK, throw an error
  if (!response.ok) {
    throw new Error("Failed to fetch places");
  }

  // Return the places data from the response
  return resData.places;
}

// Async function to fetch user-specific places from the server
export async function fetchUserPlaces() {
  // Send a GET request to 'http://localhost:3000/user-places'
  const response = await fetch("http://localhost:3000/user-places");
  // Parse the response as JSON
  const resData = await response.json();

  // If the response is not OK, throw an error
  if (!response.ok) {
    throw new Error("Failed to fetch user places");
  }

  // Return the user places data from the response
  return resData.places;
}

// Async function to update user-specific places on the server
export async function updateUserPlaces(places) {
  // Send a PUT request to 'http://localhost:3000/user-places'
  // Include the updated places data in the request body as JSON
  const response = await fetch("http://localhost:3000/user-places", {
    method: "PUT",
    body: JSON.stringify({ places }),
    headers: {
      "Content-Type": "application/json",
    },
  });

  // Parse the response as JSON
  const resData = await response.json();

  // If the response is not OK, throw an error
  if (!response.ok) {
    throw new Error("Failed to update user data.");
  }

  // Return the message from the response
  return resData.message;
}
