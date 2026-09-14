/* ==========================================================================
   ÉCRIVOIRE STUDIOS — author submissions ("Publish With Us")
   Private manuscript pitches, reviewed by staff in the admin console.
   Unlike the wishlist wall this is NOT public — submissions are never
   listed anywhere except the Studio Console.
   ========================================================================== */

(function () {
  "use strict";
  const KEY = "ecrivoire_submissions_v1";
  const SEED_FLAG = "ecrivoire_submissions_seeded_v1";

  const STATUSES = ["New", "Reading", "Shortlisted", "Declined"];

  const SEED = [
    { name: "Kavya Menon", email: "kavya.writes@example.com", title: "Salt Water, Slow Fire", genre: "Fiction", pitch: "A linked-story collection about three generations of a fishing family on the Konkan coast, told backwards from a wedding to a funeral.", link: "", status: "Shortlisted" },
    { name: "Devraj Oberoi", email: "dev.oberoi@example.com", title: "Notes for a Quieter City", genre: "Essays", pitch: "Twelve short essays on Indian cities after dark — night bus routes, 24-hour dhabas, the last vendor to close.", link: "", status: "Reading" },
    { name: "Priya Nathan", email: "priya.n@example.com", title: "The Weight of Unsent Letters", genre: "Poetry", pitch: "A debut collection built entirely around letters the speaker never sent — to an ex, a late grandmother, her own younger self.", link: "", status: "New" }
  ];

  function load() {
    try { return JSON.parse(localStorage.getItem(KEY)) || []; } catch (e) { return []; }
  }
  function save(list) {
    try { localStorage.setItem(KEY, JSON.stringify(list)); } catch (e) {}
  }
  function seedOnce() {
    if (localStorage.getItem(SEED_FLAG)) return;
    const now = Date.now();
    const list = SEED.map((s, i) => ({ id: "sub-seed-" + i, createdAt: now - (SEED.length - i) * 172800000, ...s }));
    save(list);
    localStorage.setItem(SEED_FLAG, "1");
  }
  seedOnce();

  function getAll() {
    return load().slice().sort((a, b) => b.createdAt - a.createdAt);
  }
  function get(id) {
    return load().find((s) => s.id === id) || null;
  }
  function addSubmission(data) {
    const list = load();
    const record = {
      id: "sub-" + Date.now() + "-" + Math.floor(Math.random() * 1000),
      name: (data.name || "").trim() || "Anonymous",
      email: (data.email || "").trim(),
      title: (data.title || "").trim() || "Untitled manuscript",
      genre: data.genre || "Fiction",
      pitch: (data.pitch || "").trim(),
      link: (data.link || "").trim(),
      status: "New",
      createdAt: Date.now()
    };
    list.unshift(record);
    save(list);
    return record;
  }
  function setStatus(id, status) {
    const list = load();
    const item = list.find((s) => s.id === id);
    if (item) { item.status = status; save(list); }
    return item;
  }
  function deleteSubmission(id) {
    save(load().filter((s) => s.id !== id));
  }
  function stats() {
    const list = load();
    return {
      total: list.length,
      new: list.filter((s) => s.status === "New").length,
      reading: list.filter((s) => s.status === "Reading").length,
      shortlisted: list.filter((s) => s.status === "Shortlisted").length
    };
  }

  window.EcrivoireSubmissions = { STATUSES, getAll, get, addSubmission, setStatus, deleteSubmission, stats };
})();
