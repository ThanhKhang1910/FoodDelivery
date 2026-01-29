const db = require("../config/db");

class Ride {
  static async create({
    customerId,
    serviceType,
    pickupAddress,
    destinationAddress,
    pickupLat,
    pickupLong,
    destLat,
    destLong,
    fare,
  }) {
    const query = `
      INSERT INTO Rides (customer_id, service_type, pickup_address, destination_address, pickup_lat, pickup_long, dest_lat, dest_long, fare, status)
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, 'SEARCHING')
      RETURNING *;
    `;
    const { rows } = await db.query(query, [
      customerId,
      serviceType,
      pickupAddress,
      destinationAddress,
      pickupLat,
      pickupLong,
      destLat,
      destLong,
      fare,
    ]);
    return rows[0];
  }

  static async findNearbyDrivers(lat, lng, serviceType, radiusKm = 5) {
    // Simplified query for finding online drivers nearby
    const query = `
      SELECT d.driver_id, u.full_name, d.vehicle_plate, d.current_lat, d.current_long,
             ( 6371 * acos( cos( radians($1) ) * cos( radians( d.current_lat ) ) * cos( radians( d.current_long ) - radians($2) ) + sin( radians($1) ) * sin( radians( d.current_lat ) ) ) ) AS distance
      FROM Drivers d
      JOIN Users u ON d.driver_id = u.user_id
      WHERE d.is_online = true AND d.vehicle_type = $3
      HAVING distance < $4
      ORDER BY distance ASC;
    `;
    // PostGRES fallback if HAVING fails (subquery)
    const pgQuery = `
      SELECT * FROM (
        SELECT d.driver_id, u.full_name, d.vehicle_plate, d.current_lat, d.current_long,
               ( 6371 * acos( cos( radians($1) ) * cos( radians( d.current_lat ) ) * cos( radians( d.current_long ) - radians($2) ) + sin( radians($1) ) * sin( radians( d.current_lat ) ) ) ) AS distance
        FROM Drivers d
        JOIN Users u ON d.driver_id = u.user_id
        WHERE d.is_online = true AND d.vehicle_type = $3
      ) sub
      WHERE distance < $4
      ORDER BY distance ASC;
    `;
    const { rows } = await db.query(pgQuery, [lat, lng, serviceType, radiusKm]);
    return rows;
  }

  static async updateStatus(rideId, status, driverId = null) {
    let query;
    let params;
    if (driverId) {
      query =
        "UPDATE Rides SET status = $1, driver_id = $2 WHERE ride_id = $3 RETURNING *";
      params = [status, driverId, rideId];
    } else {
      query = "UPDATE Rides SET status = $1 WHERE ride_id = $2 RETURNING *";
      params = [status, rideId];
    }
    const { rows } = await db.query(query, params);
    return rows[0];
  }

  static async getRideStatus(rideId) {
    const query = `
        SELECT r.*, u.full_name as driver_name, d.vehicle_plate
        FROM Rides r
        LEFT JOIN Users u ON r.driver_id = u.user_id
        LEFT JOIN Drivers d ON r.driver_id = d.driver_id
        WHERE r.ride_id = $1
      `;
    const { rows } = await db.query(query, [rideId]);
    return rows[0];
  }
}

module.exports = Ride;
