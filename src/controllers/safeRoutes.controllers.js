import dotenv from 'dotenv';
dotenv.config();

import fetch from "node-fetch";
import { SafeRoute } from "../models/safeRoutes.models.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";

// function to calculate tile coordinates 
const lngToTileX = (longitude, zoom) => Math.floor(((longitude + 180) / 360) * Math.pow(2, zoom));
const latToTileY = (latitude, zoom) => Math.floor(
  ((1 - Math.log(Math.tan(latitude * Math.PI / 180) + 1 / Math.cos(latitude * Math.PI / 180)) / Math.PI) / 2) * Math.pow(2, zoom)
);

// Enter the current location

const getSafeRoute = asyncHandler(async (req, res) => {
  const { startLocation, destination } = req.body;

  if (!startLocation || !destination) {
    throw new ApiError(400, "Required Start and End locations");
  }

  // api import
  const routingApiKey = process.env.GEOAPIFY_ROUTING_API_KEY;
  const placesApiKey = process.env.GEOAPIFY_PLACES_API_KEY;
  const mapTilesApiKey = process.env.GEOAPIFY_MAP_TILES_API_KEY;

  const routingBaseUrl = "https://api.geoapify.com/v1/routing";
  const placesBaseUrl = "https://api.geoapify.com/v2/places";
  const mapTilesBaseUrl = "https://maps.geoapify.com/v1/tile/osm-carto";

  // api call to geoapify routing api
  const routingUrl = `${routingBaseUrl}?waypoints=${encodeURIComponent(startLocation.lat + ',' + startLocation.lon)}|${encodeURIComponent(destination.lat + ',' + destination.lon)}&mode=drive&apiKey=${routingApiKey}`;
  console.log("Routing URL:", routingUrl);

  try {
    const response = await fetch(routingUrl, { method: "GET" });
    if (!response.ok) {
      throw new ApiError(400, "Failed to fetch routing data");
    }

    const data = await response.json();
    
    // places api variables
    const minLat = Math.min(startLocation.lat, destination.lat) - 0.05;
    const maxLat = Math.max(startLocation.lat, destination.lat) + 0.05;
    const minLon = Math.min(startLocation.lon, destination.lon) - 0.05;
    const maxLon = Math.max(startLocation.lon, destination.lon) + 0.05;

    const categories = [
      "healthcare.pharmacy",
      "healthcare.hospital"
    ].join(",")

    // call to geoapify places api
    const placesUrl = `${placesBaseUrl}?categories=${categories}&filter=rect%3A${minLon}%2C${minLat}%2C${maxLon}%2C${maxLat}&limit=20&apiKey=${placesApiKey}`;

    console.log("Places Url:", placesUrl);

    const placesResponse = await fetch(placesUrl, { method: "GET" });

    if (!placesResponse.ok) {
      throw new ApiError(400, "Failed to fetch places data");
    }

    const placesData = await placesResponse.json();
    // generating map tile for start location to destination
    const zoomLevel = 12;
    const startTileX = lngToTileX(startLocation.lon, zoomLevel);
    const startTileY = latToTileY(startLocation.lat, zoomLevel)
    const destinationTileX = lngToTileX(destination.lon, zoomLevel)
    const destinationTileY = latToTileY(destination.lat, zoomLevel)

    //generate maptile url
    const startMapTileUrl = `${mapTilesBaseUrl}/${zoomLevel}/${startTileX}/${startTileY}.png?apiKey=${mapTilesApiKey}`;
    const destinationMapTileUrl = `${mapTilesBaseUrl}/${zoomLevel}/${destinationTileX}/${destinationTileY}.png?apiKey=${mapTilesApiKey}`;
    
    console.log("Start Map Tile URL:", startMapTileUrl);
    console.log("Destination Map Tile URL:", destinationMapTileUrl);


    // start and destination locations
    console.log("Start Location:", startLocation);
    console.log("Destination:", destination);

    // Save locations to database
    const locationUpload = await SafeRoute.create({
      startLocation: startLocation,
      destination: destination
    });

    if (!locationUpload) {
      throw new ApiError(400, "Location upload failed");
    }

    return res.status(200).json(new ApiResponse(200, {
      route: data,
      places: placesData.features,
      location: locationUpload,
      mapTiles: {
        startMapTileUrl: startMapTileUrl,
        destinationMapTileUrl: destinationMapTileUrl,
      }
    }, "Route and location data fetched successfully"));

  } catch (error) {
    throw new ApiError(500, error.message || "Internal Server Error");
  }
});

export { getSafeRoute };
