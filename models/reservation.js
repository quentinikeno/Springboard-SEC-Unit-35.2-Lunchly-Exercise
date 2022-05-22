/** Reservation for Lunchly */

const moment = require("moment");

const db = require("../db");

/** A reservation for a party */

class Reservation {
	constructor({ id, customerId, numGuests, startAt, notes }) {
		this.id = id;
		this.customerId = customerId;
		this.numGuests = numGuests;
		this.startAt = startAt;
		this.notes = notes;
	}

	/** formatter for startAt */

	getformattedStartAt() {
		return moment(this.startAt).format("MMMM Do YYYY, h:mm a");
	}

	/** given a customer id, find their reservations. */

	static async getReservationsForCustomer(customerId) {
		const results = await db.query(
			`SELECT id, 
           customer_id AS "customerId", 
           num_guests AS "numGuests", 
           start_at AS "startAt", 
           notes AS "notes"
         FROM reservations 
         WHERE customer_id = $1`,
			[customerId]
		);

		return results.rows.map((row) => new Reservation(row));
	}

	/** save a reservation to database. */

	async save() {
		const result = await db.query(
			`
    INSERT INTO reservations (customer_id, start_at, num_guests, notes)
    VALUES ($1, $2, $3, $4)
    RETURNING id
    `,
			[this.customerId, this.startAt, this.numGuests, this.notes]
		);
		this.id = result.rows[0].id;
	}

	/** getter and setter for notes */

	set notes(value) {
		this._notes = value || "";
	}

	get notes() {
		return this._notes;
	}

	/** getter and setter for numGuests */

	set numGuests(value) {
		if (value < 1)
			throw new Error("Reservations must be for at least one person.");
		this._numGuests = value;
	}

	get numGuests() {
		return this._numGuests;
	}

	/** getter and setter for startAt */

	set startAt(value) {
		if (value instanceof Date && !isNaN(value)) {
			this._startAt = value;
		} else {
			throw new Error("A date is required for reservations.");
		}
	}

	get startAt() {
		return this._startAt;
	}
}

module.exports = Reservation;
