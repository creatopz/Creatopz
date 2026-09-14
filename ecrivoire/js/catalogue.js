/* ==========================================================================
   ÉCRIVOIRE STUDIOS — live catalogue layer
   Seed data (js/data.js) stays read-only; everything the admin console does
   — add, edit, delete — is stored as a small overlay in localStorage and
   merged in here. Every page reads the catalogue through this module, so a
   product the admin uploads shows up in Shop, Home and Search immediately.
   ========================================================================== */

(function () {
  "use strict";
  const KEY = "ecrivoire_catalogue_overlay_v1";
  const DATA = window.ECRIVOIRE_DATA;

  function load() {
    try {
      const raw = JSON.parse(localStorage.getItem(KEY));
      if (raw && typeof raw === "object") {
        return { added: raw.added || [], edited: raw.edited || {}, deletedIds: raw.deletedIds || [] };
      }
    } catch (e) {}
    return { added: [], edited: {}, deletedIds: [] };
  }
  function save(overlay) {
    try { localStorage.setItem(KEY, JSON.stringify(overlay)); } catch (e) {}
  }

  function slugify(title) {
    return (title || "untitled").toLowerCase().trim()
      .replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "") || "book";
  }
  function uniqueId(title) {
    const base = slugify(title);
    const all = getAllBooks().map((b) => b.id);
    if (!all.includes(base)) return base;
    let n = 2;
    while (all.includes(`${base}-${n}`)) n++;
    return `${base}-${n}`;
  }

  function getAllBooks() {
    const overlay = load();
    const seed = DATA.BOOKS
      .filter((b) => !overlay.deletedIds.includes(b.id))
      .map((b) => overlay.edited[b.id] ? { ...b, ...overlay.edited[b.id] } : b);
    const added = overlay.added.filter((b) => !overlay.deletedIds.includes(b.id));
    // Newest admin-added titles surface first, like a real "just in" shelf.
    return [...added, ...seed];
  }

  function getBook(id) {
    return getAllBooks().find((b) => b.id === id) || null;
  }

  function addBook(book) {
    const overlay = load();
    const id = uniqueId(book.title);
    const record = {
      id,
      title: book.title || "Untitled",
      author: book.author || "Unknown",
      genre: book.genre || DATA.GENRES[0],
      price: Math.max(0, Math.round(Number(book.price) || 0)),
      year: Number(book.year) || new Date().getFullYear(),
      pages: Number(book.pages) || 0,
      publisher: book.publisher || "Écrivoire Editions",
      isbn: book.isbn || "978-0-0000-0000-0",
      rating: Number(book.rating) || 5,
      badge: book.badge || null,
      mark: (book.mark || book.title || "É").trim().charAt(0).toUpperCase(),
      pal: Number.isInteger(book.pal) ? book.pal : Math.floor(Math.random() * 6),
      blurb: book.blurb || "A new arrival, fresh on the shelf — description coming soon.",
      stampPick: !!book.stampPick,
      editionNo: book.editionNo || null,
      dropMonth: book.dropMonth || null,
      copiesTotal: Number.isFinite(book.copiesTotal) ? book.copiesTotal : undefined,
      copiesLeft: Number.isFinite(book.copiesLeft) ? book.copiesLeft : (Number.isFinite(book.copiesTotal) ? book.copiesTotal : undefined),
      _admin: true,
      _addedAt: Date.now()
    };
    overlay.added.unshift(record);
    save(overlay);
    return record;
  }

  function updateBook(id, patch) {
    // Drop undefined-valued keys so a blank optional field never stomps an
    // existing value — only explicit edits should change anything.
    const clean = {};
    Object.keys(patch || {}).forEach((k) => { if (patch[k] !== undefined) clean[k] = patch[k]; });
    const overlay = load();
    const addedIdx = overlay.added.findIndex((b) => b.id === id);
    if (addedIdx > -1) {
      overlay.added[addedIdx] = { ...overlay.added[addedIdx], ...clean };
    } else {
      overlay.edited[id] = { ...(overlay.edited[id] || {}), ...clean };
    }
    save(overlay);
    return getBook(id);
  }

  function deleteBook(id) {
    const overlay = load();
    const addedIdx = overlay.added.findIndex((b) => b.id === id);
    if (addedIdx > -1) {
      overlay.added.splice(addedIdx, 1);
    } else if (!overlay.deletedIds.includes(id)) {
      overlay.deletedIds.push(id);
    }
    save(overlay);
  }

  function isAdminAdded(id) {
    return load().added.some((b) => b.id === id);
  }

  function resetOverlay() {
    localStorage.removeItem(KEY);
  }

  function stats() {
    const all = getAllBooks();
    return {
      totalTitles: all.length,
      totalValue: all.reduce((sum, b) => sum + (b.price || 0), 0),
      adminAdded: load().added.length
    };
  }

  window.EcrivoireCatalogue = { getAllBooks, getBook, addBook, updateBook, deleteBook, isAdminAdded, resetOverlay, stats };
})();
