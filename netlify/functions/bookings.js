const { connectLambda, getStore } = require("@netlify/blobs");
const MAX_DURATION = 4;

function json(statusCode, body) {
  return {
    statusCode,
    headers: {
      "content-type": "application/json; charset=utf-8",
      "cache-control": "no-store",
    },
    body: JSON.stringify(body),
  };
}

function validateDate(date) {
  if (typeof date !== "string" || !/^\d{4}-\d{2}-\d{2}$/.test(date)) {
    return false;
  }

  const parsed = new Date(date + "T00:00:00Z");
  return !Number.isNaN(parsed.getTime());
}

function toBooking(payload) {
  const date = String(payload.date || "").trim();
  const startHour = Number(payload.startHour);
  const durationHours = Number(payload.durationHours);
  const name = String(payload.name || "").trim();
  const phone = String(payload.phone || "").trim();

  if (!validateDate(date)) {
    return { error: "Ugyldig dato." };
  }

  if (!Number.isInteger(startHour) || startHour < 0 || startHour > 23) {
    return { error: "Ugyldig starttid." };
  }

  if (!Number.isInteger(durationHours) || durationHours < 1 || durationHours > MAX_DURATION) {
    return { error: "Varighed skal være mellem 1 og 4 timer." };
  }

  if (startHour + durationHours > 24) {
    return { error: "Bookingen må ikke gå ud over dagens sidste time." };
  }

  if (!name || name.length > 80) {
    return { error: "Ugyldigt navn." };
  }

  if (!phone || phone.length > 40) {
    return { error: "Ugyldigt telefonnummer." };
  }

  return {
    date,
    startHour,
    durationHours,
    name,
    phone,
  };
}

function overlaps(existing, candidate) {
  const existingStart = existing.startHour;
  const existingEnd = existing.startHour + existing.durationHours;
  const candidateStart = candidate.startHour;
  const candidateEnd = candidate.startHour + candidate.durationHours;
  return candidateStart < existingEnd && candidateEnd > existingStart;
}

function normalizeDayPayload(payload, date) {
  if (!payload || typeof payload !== "object" || !Array.isArray(payload.bookings)) {
    return { date, bookings: [] };
  }

  const bookings = payload.bookings
    .filter((entry) => {
      return (
        entry &&
        validateDate(entry.date) &&
        Number.isInteger(entry.startHour) &&
        Number.isInteger(entry.durationHours) &&
        typeof entry.name === "string" &&
        typeof entry.phone === "string"
      );
    })
    .sort((a, b) => a.startHour - b.startHour);

  return { date, bookings };
}

function publicBooking(entry) {
  return {
    id: entry.id,
    date: entry.date,
    startHour: entry.startHour,
    durationHours: entry.durationHours,
    name: entry.name,
  };
}

async function getDayRecord(store, key, date) {
  const record = await store.getWithMetadata(key, { type: "json" });

  if (!record) {
    return {
      etag: null,
      day: { date, bookings: [] },
    };
  }

  return {
    etag: record.etag || null,
    day: normalizeDayPayload(record.data, date),
  };
}

exports.handler = async function handler(event) {
  try {
    connectLambda(event);
    const store = getStore({ name: "tennisklub-bookings", consistency: "strong" });

    if (event.httpMethod === "GET") {
      const date = event.queryStringParameters && event.queryStringParameters.date;
      if (!validateDate(date)) {
        return json(400, { error: "Dato skal være på formatet YYYY-MM-DD." });
      }

      const key = "bookings/" + date + ".json";
      const dayRecord = await getDayRecord(store, key, date);

      return json(200, {
        timezone: "Europe/Copenhagen",
        bookings: dayRecord.day.bookings.map(publicBooking),
      });
    }

    if (event.httpMethod === "POST") {
      const payload = event.body ? JSON.parse(event.body) : {};
      const booking = toBooking(payload);

      if (booking.error) {
        return json(400, { error: booking.error });
      }

      const key = "bookings/" + booking.date + ".json";

      for (let attempt = 0; attempt < 5; attempt += 1) {
        const dayRecord = await getDayRecord(store, key, booking.date);
        const day = dayRecord.day;
        const etag = dayRecord.etag;

        if (day.bookings.some((entry) => overlaps(entry, booking))) {
          return json(409, { error: "Tidsrummet er allerede booket. Vælg venligst et andet tidspunkt." });
        }

        const created = {
          id: Date.now() + "-" + Math.random().toString(36).slice(2, 8),
          date: booking.date,
          startHour: booking.startHour,
          durationHours: booking.durationHours,
          name: booking.name,
          phone: booking.phone,
          createdAt: new Date().toISOString(),
        };

        const nextDay = {
          date: booking.date,
          bookings: day.bookings.concat(created).sort((a, b) => a.startHour - b.startHour),
        };

        const writeOptions = etag ? { onlyIfMatch: etag } : {};
        const result = await store.setJSON(key, nextDay, writeOptions);

        if (!result || result.modified !== false) {
          return json(201, {
            ok: true,
            booking: publicBooking(created),
            bookings: nextDay.bookings.map(publicBooking),
          });
        }
      }

      return json(409, {
        error: "Bookingen kunne ikke gennemføres pga. samtidige ændringer. Prøv igen.",
      });
    }

    return json(405, { error: "Metode ikke tilladt." });
  } catch (error) {
    return json(500, {
      error: "Intern fejl i bookingserver.",
      detail: (error && error.message) || "Ukendt fejl",
    });
  }
};
