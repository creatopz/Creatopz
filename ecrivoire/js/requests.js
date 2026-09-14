/* ==========================================================================
   ÉCRIVOIRE STUDIOS — the Wishlist Wall
   Customers post what they want us to stock; the whole shop votes; the
   admin console works the list. Storage-backed, no backend, seeded once
   with demo requests so the wall never looks empty on a first visit.
   ========================================================================== */

(function () {
  "use strict";
  const KEY = "ecrivoire_requests_v1";
  const VOTED_KEY = "ecrivoire_my_votes_v1";
  const SEED_FLAG = "ecrivoire_requests_seeded_v1";

  const SEED = [
    { title: "The Unbearable Lightness of Filing Taxes", author: "unknown / working title", genre: "Essays", notes: "Something funny about adulthood, please.", name: "Aarav", votes: 14, fulfilled: false },
    { title: "More regional poetry in translation", author: "any", genre: "Poetry", notes: "Would love a shelf of Tamil and Bengali poets in English translation.", name: "Meera", votes: 11, fulfilled: false },
    { title: "Where the Crawdads Sing", author: "Delia Owens", genre: "Fiction", notes: "Everyone keeps asking for this one — worth a shelf slot.", name: "Rohan", votes: 9, fulfilled: true },
    { title: "Graphic novels section", author: "various", genre: "Art", notes: "Even a small shelf would be wonderful.", name: "Ishaan", votes: 7, fulfilled: false }
  ];

  function load() {
    try { return JSON.parse(localStorage.getItem(KEY)) || []; } catch (e) { return []; }
  }
  function save(list) {
    try { localStorage.setItem(KEY, JSON.stringify(list)); } catch (e) {}
  }
  function loadVoted() {
    try { return JSON.parse(localStorage.getItem(VOTED_KEY)) || []; } catch (e) { return []; }
  }
  function saveVoted(ids) {
    try { localStorage.setItem(VOTED_KEY, JSON.stringify(ids)); } catch (e) {}
  }

  function seedOnce() {
    if (localStorage.getItem(SEED_FLAG)) return;
    const now = Date.now();
    const list = SEED.map((r, i) => ({
      id: "req-seed-" + i,
      createdAt: now - (SEED.length - i) * 86400000,
      ...r
    }));
    save(list);
    localStorage.setItem(SEED_FLAG, "1");
  }
  seedOnce();

  function getAll() {
    return load().slice().sort((a, b) => b.votes - a.votes);
  }
  function getRecent() {
    return load().slice().sort((a, b) => b.createdAt - a.createdAt);
  }
  function get(id) {
    return load().find((r) => r.id === id) || null;
  }

  function addRequest(data) {
    const list = load();
    const record = {
      id: "req-" + Date.now() + "-" + Math.floor(Math.random() * 1000),
      title: (data.title || "").trim() || "Untitled request",
      author: (data.author || "").trim() || "Not sure",
      genre: data.genre || "Fiction",
      notes: (data.notes || "").trim(),
      name: (data.name || "").trim() || "A reader",
      votes: 1,
      fulfilled: false,
      createdAt: Date.now()
    };
    list.unshift(record);
    save(list);
    const voted = loadVoted();
    voted.push(record.id);
    saveVoted(voted);
    return record;
  }

  function hasVoted(id) {
    return loadVoted().includes(id);
  }

  function toggleVote(id) {
    const list = load();
    const item = list.find((r) => r.id === id);
    if (!item) return null;
    const voted = loadVoted();
    const already = voted.includes(id);
    if (already) {
      item.votes = Math.max(0, item.votes - 1);
      saveVoted(voted.filter((v) => v !== id));
    } else {
      item.votes += 1;
      voted.push(id);
      saveVoted(voted);
    }
    save(list);
    return item;
  }

  function setFulfilled(id, fulfilled) {
    const list = load();
    const item = list.find((r) => r.id === id);
    if (item) { item.fulfilled = fulfilled; save(list); }
    return item;
  }

  function deleteRequest(id) {
    save(load().filter((r) => r.id !== id));
  }

  function stats() {
    const list = load();
    return {
      total: list.length,
      open: list.filter((r) => !r.fulfilled).length,
      fulfilled: list.filter((r) => r.fulfilled).length,
      votes: list.reduce((sum, r) => sum + r.votes, 0)
    };
  }

  window.EcrivoireRequests = { getAll, getRecent, get, addRequest, hasVoted, toggleVote, setFulfilled, deleteRequest, stats };
})();
