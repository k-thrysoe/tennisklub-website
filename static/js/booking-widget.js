(function () {
  var root = document.getElementById("booking-widget");
  if (!root) {
    return;
  }

  var API_BASE = "/.netlify/functions/bookings";
  var TIMEZONE = "Europe/Copenhagen";

  function pad2(value) {
    return String(value).padStart(2, "0");
  }

  function formatRange(startHour, durationHours) {
    var end = startHour + durationHours;
    return pad2(startHour) + ":00 - " + pad2(end) + ":00";
  }

  function escapeHtml(value) {
    return String(value)
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/\"/g, "&quot;")
      .replace(/'/g, "&#039;");
  }

  function createHourOptions() {
    var html = "";
    for (var hour = 0; hour < 24; hour += 1) {
      html += '<option value="' + hour + '">' + pad2(hour) + ":00</option>";
    }
    return html;
  }

  root.innerHTML =
    '<div class="booking-widget">' +
    '  <p class="booking-widget__intro">Vælg dato, starttid og varighed. Booking vises offentligt med navn.</p>' +
    '  <form id="booking-form" novalidate>' +
    '    <div class="booking-widget__grid">' +
    '      <div>' +
    '        <label for="booking-date">Dato</label>' +
    '        <input id="booking-date" name="date" type="text" required />' +
    "      </div>" +
    '      <div>' +
    '        <label for="booking-start">Starttid</label>' +
    '        <select id="booking-start" name="startHour" required>' +
    createHourOptions() +
    "        </select>" +
    "      </div>" +
    '      <div>' +
    '        <label for="booking-duration">Varighed</label>' +
    '        <select id="booking-duration" name="durationHours" required>' +
    '          <option value="1" selected>1 time</option>' +
    '          <option value="2">2 timer</option>' +
    '          <option value="3">3 timer</option>' +
    '          <option value="4">4 timer</option>' +
    "        </select>" +
    "      </div>" +
    '      <div>' +
    '        <label for="booking-name">Navn (vises offentligt)</label>' +
    '        <input id="booking-name" name="name" type="text" required maxlength="80" />' +
    "      </div>" +
    '      <div>' +
    '        <label for="booking-phone">Telefonnummer</label>' +
    '        <input id="booking-phone" name="phone" type="tel" required maxlength="40" />' +
    "      </div>" +
    "    </div>" +
    '    <button id="booking-submit" type="submit">Book bane</button>' +
    '    <div id="booking-status" class="booking-widget__status" aria-live="polite"></div>' +
    "  </form>" +
    '  <section class="booking-widget__list">' +
    '    <h3 class="booking-widget__list-title">Bookinger for valgte dato</h3>' +
    '    <div id="booking-list"></div>' +
    "  </section>" +
    "</div>";

  var form = document.getElementById("booking-form");
  var dateInput = document.getElementById("booking-date");
  var startSelect = document.getElementById("booking-start");
  var submitButton = document.getElementById("booking-submit");
  var statusEl = document.getElementById("booking-status");
  var listEl = document.getElementById("booking-list");
  var currentHour = new Date().getHours();
  startSelect.value = String(currentHour);

  function setStatus(message, type) {
    statusEl.textContent = message || "";
    statusEl.className = "booking-widget__status";
    if (type === "success") {
      statusEl.className += " is-success";
    }
    if (type === "error") {
      statusEl.className += " is-error";
    }
  }

  function getSelectedDate() {
    return dateInput.value;
  }

  function renderBookings(bookings) {
    if (!Array.isArray(bookings) || bookings.length === 0) {
      listEl.innerHTML = '<p class="booking-widget__empty">Ingen bookinger endnu.</p>';
      return;
    }

    var html = "";
    for (var i = 0; i < bookings.length; i += 1) {
      var booking = bookings[i];
      html +=
        '<article class="booking-widget__item">' +
        '  <div class="booking-widget__item-time">' +
        escapeHtml(formatRange(booking.startHour, booking.durationHours)) +
        "</div>" +
        "  <div>" +
        escapeHtml(booking.name) +
        "</div>" +
        "</article>";
    }

    listEl.innerHTML = html;
  }

  async function loadBookings(dateValue) {
    if (!dateValue) {
      renderBookings([]);
      return;
    }

    listEl.innerHTML = '<p class="booking-widget__empty">Henter bookinger...</p>';

    try {
      var response = await fetch(API_BASE + "?date=" + encodeURIComponent(dateValue));
      if (!response.ok) {
        throw new Error("Kunne ikke hente bookinger");
      }

      var data = await response.json();
      renderBookings(data.bookings || []);
    } catch (error) {
      listEl.innerHTML =
        '<p class="booking-widget__empty">Bookingserver er ikke tilgængelig lige nu.</p>';
    }
  }

  flatpickr(dateInput, {
    locale: flatpickr.l10ns.da,
    dateFormat: "Y-m-d",
    defaultDate: new Date(),
    minDate: "today",
    disableMobile: true,
    onChange: function (selectedDates, dateStr) {
      setStatus("", "");
      loadBookings(dateStr);
    },
  });

  loadBookings(getSelectedDate());

  form.addEventListener("submit", async function (event) {
    event.preventDefault();
    setStatus("", "");

    var payload = {
      date: getSelectedDate(),
      startHour: Number(document.getElementById("booking-start").value),
      durationHours: Number(document.getElementById("booking-duration").value),
      name: document.getElementById("booking-name").value.trim(),
      phone: document.getElementById("booking-phone").value.trim(),
      timezone: TIMEZONE,
    };

    if (!payload.date || !payload.name || !payload.phone) {
      setStatus("Udfyld venligst alle felter.", "error");
      return;
    }

    submitButton.disabled = true;

    try {
      var response = await fetch(API_BASE, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      var data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Booking kunne ikke gennemføres");
      }

      setStatus("Din booking er registreret.", "success");
      form.reset();
      document.getElementById("booking-duration").value = "1";
      document.getElementById("booking-start").value = String(payload.startHour);
      dateInput.value = payload.date;
      loadBookings(payload.date);
    } catch (error) {
      setStatus(error.message || "Der skete en fejl.", "error");
    } finally {
      submitButton.disabled = false;
    }
  });
})();
