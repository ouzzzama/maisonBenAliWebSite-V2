const express = require("express");
const path = require("path");
const fs = require("fs");
const app = express();
const port = process.env.PORT || 3001;

app.use((req, res, next) => {
  if (req.path.endsWith('/index.html')) {
    res.redirect(301, req.path.slice(0, -10) || '/');
  } else if (req.path.endsWith('.html')) {
    res.redirect(301, req.path.slice(0, -5));
  } else {
    next();
  }
});

// Never expose dotfiles (.env) or server sources to the browser
const BLOCKED_PATH = /^\/(\.|server\.js$|package(-lock)?\.json$|node_modules(\/|$))/i;
app.use((req, res, next) => {
  if (BLOCKED_PATH.test(req.path)) {
    return res.status(404).type("text/plain").send("Not found");
  }
  next();
});

app.use(express.static(__dirname, { extensions: ["html"], dotfiles: "ignore" }));

// Reservation intake (property visits + Benali Cars rental requests)
app.use(express.json({ limit: "32kb" }));
const DATA_DIR = path.join(__dirname, "data");
const RESERVATION_FILE = path.join(DATA_DIR, "reservations.jsonl");

// Every website request is mirrored into the CRM (crm/), which turns it into a
// lead plus a visit/rental record. Synchronisation is best-effort: a CRM outage
// never blocks the visitor.
const CRM_URL = (process.env.CRM_URL || "http://localhost:3002").replace(/\/$/, "");

function syncToCrm(record) {
  const payload = {
    type: record.type,
    name: record.name,
    phone: record.phone,
    email: record.email,
    date: record.date,
    car: record.car,
    from: record.from,
    to: record.to,
    message: record.message,
    property: record.property,
    page: record.page
  };

  const headers = { "Content-Type": "application/json" };
  if (process.env.WEBSITE_INTAKE_KEY) headers["X-Intake-Key"] = process.env.WEBSITE_INTAKE_KEY;

  fetch(`${CRM_URL}/api/public/intake`, {
    method: "POST",
    headers,
    body: JSON.stringify(payload)
  })
    .then((response) =>
      response.json().then((body) => {
        if (!response.ok || !body.ok) throw new Error(body.error || `HTTP ${response.status}`);
        console.log("crm sync:", record.id, "→ lead", body.id, body.bookingId || body.rentalId || "");
      })
    )
    .catch((error) => console.warn("crm sync failed:", record.id, error.message));
}

function clean(value, max) {
  return typeof value === "string" ? value.replace(/[\u0000-\u001f]/g, " ").trim().slice(0, max) : "";
}

app.post("/api/reservation", (req, res) => {
  const body = req.body || {};
  const phone = clean(body.phone, 32);
  if (phone.replace(/\D/g, "").length < 6) {
    return res.status(400).json({ ok: false, error: "numéro de téléphone invalide" });
  }

  const record = {
    id: Date.now().toString(36).toUpperCase(),
    receivedAt: new Date().toISOString(),
    type: clean(body.type, 16) || "bien",
    property: clean(body.property, 80),
    name: clean(body.name, 120),
    phone: phone,
    email: clean(body.email, 160),
    date: clean(body.date, 24),
    car: clean(body.car, 60),
    from: clean(body.from, 24),
    to: clean(body.to, 24),
    message: clean(body.message, 2000),
    page: clean(body.page, 120)
  };

  try {
    fs.mkdirSync(DATA_DIR, { recursive: true });
    fs.appendFileSync(RESERVATION_FILE, JSON.stringify(record) + "\n", "utf8");
  } catch (error) {
    console.error("reservation write failed:", error.message);
    return res.status(500).json({ ok: false, error: "enregistrement impossible" });
  }

  console.log("reservation saved:", record.id, record.type, record.phone);
  syncToCrm(record);
  res.status(201).json({ ok: true, id: record.id });
});

app.get("*", (req, res) => {
  res.sendFile(path.join(__dirname, "index.html"));
});

app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});
