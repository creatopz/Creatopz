/* ==========================================================================
   ÉCRIVOIRE STUDIOS — demo data
   Everything below is fictional catalogue data for a working front-end
   demo: no backend, no real ISBNs, no real people. Prices in INR (₹).
   ========================================================================== */

window.ECRIVOIRE_DATA = (function () {

  const GENRES = [
    "Fiction", "Poetry", "Essays", "Design & Architecture",
    "Philosophy", "Children's", "Art", "Memoir"
  ];

  const BOOKS = [
    { id: "quiet-hour", title: "The Quiet Hour", author: "Marguerite Sol", genre: "Fiction", price: 499, year: 2026, pages: 312, publisher: "Ferrous & Kin", isbn: "978-1-9998-4410-2", rating: 5, badge: "New", mark: "Q", pal: 0, stampPick: true,
      blurb: "A widow reopens her late husband's letterpress shop and, one broadside at a time, relearns how to speak. Sol writes silence the way other novelists write noise — with total control." },
    { id: "field-notes-nothing", title: "Field Notes on Nothing", author: "Théo Bassin", genre: "Essays", price: 349, year: 2025, pages: 208, publisher: "Low Tide Press", isbn: "978-1-9998-4411-9", rating: 4, badge: "Staff Pick", mark: "F", pal: 3,
      blurb: "Fourteen essays on the art of doing nothing well: waiting rooms, layovers, Sundays. A quiet argument for attention as its own reward." },
    { id: "salt-marrow", title: "Salt & Marrow", author: "Inès Duval", genre: "Poetry", price: 299, year: 2024, pages: 96, publisher: "Éditions Corvine", isbn: "978-1-9998-4412-6", rating: 5, badge: null, mark: "S", pal: 1,
      blurb: "Duval's second collection returns to the coast of her childhood — fishing boats, church bells, a mother's hands — with a saltier, harder line than her debut." },
    { id: "architecture-of-silence", title: "The Architecture of Silence", author: "Lior Adler", genre: "Design & Architecture", price: 1499, year: 2023, pages: 264, publisher: "Plinth Books", isbn: "978-1-9998-4413-3", rating: 5, badge: "Bestseller", mark: "A", pal: 2, stampPick: true,
      blurb: "A survey of buildings designed around sound's absence — libraries, chapels, listening rooms — and what they teach us about restraint." },
    { id: "minor-chorus", title: "A Minor Chorus", author: "Wren Okafor", genre: "Fiction", price: 449, year: 2026, pages: 288, publisher: "Ferrous & Kin", isbn: "978-1-9998-4414-0", rating: 4, badge: null, mark: "M", pal: 4,
      blurb: "Four cousins inherit a lake house and a decade of unspoken grievances. Okafor's ensemble prose moves like a well-run kitchen — fast, exact, warm underneath." },
    { id: "walking-slowly", title: "On Walking Slowly", author: "Petra Lindqvist", genre: "Philosophy", price: 399, year: 2022, pages: 176, publisher: "North Field", isbn: "978-1-9998-4415-7", rating: 5, badge: "Signed", mark: "W", pal: 5,
      blurb: "A philosopher's field guide to unhurried movement, drawing on Nordic walking traditions and the phenomenology of the footstep." },
    { id: "left-handed-atlas", title: "The Left-Handed Atlas", author: "Casimir Novak", genre: "Essays", price: 549, year: 2024, pages: 240, publisher: "Low Tide Press", isbn: "978-1-9998-4416-4", rating: 4, badge: null, mark: "L", pal: 0,
      blurb: "Essays on maps that were wrong on purpose — propaganda cartography, decoy islands, borders drawn to mislead — and why we trust lines on paper." },
    { id: "little-weathers", title: "Little Weathers", author: "Yuki Amano", genre: "Children's", price: 349, year: 2026, pages: 40, publisher: "Acorn & Thread", isbn: "978-1-9998-4417-1", rating: 5, badge: "New", mark: "L", pal: 3,
      blurb: "A picture book about a child who keeps a jar of weather — one for every mood — illustrated with the softest, strangest little storms." },
    { id: "marrow-of-the-city", title: "Marrow of the City", author: "Bram Uys", genre: "Memoir", price: 449, year: 2023, pages: 256, publisher: "North Field", isbn: "978-1-9998-4418-8", rating: 4, badge: null, mark: "M", pal: 1,
      blurb: "A former night-shift paramedic's account of a decade spent learning a city by its emergencies." },
    { id: "studies-in-grey", title: "Studies in Grey", author: "Odile Ferrand", genre: "Art", price: 1899, year: 2021, pages: 320, publisher: "Plinth Books", isbn: "978-1-9998-4419-5", rating: 5, badge: "Bestseller", mark: "S", pal: 2, stampPick: true,
      blurb: "A monograph on painters who refused colour — thirty careers built entirely from the space between black and white." },
    { id: "unfinished-room", title: "The Unfinished Room", author: "Sana Iqbal", genre: "Fiction", price: 499, year: 2025, pages: 344, publisher: "Ferrous & Kin", isbn: "978-1-9998-4420-1", rating: 4, badge: null, mark: "U", pal: 4,
      blurb: "An architect is hired to finish a house her estranged mentor left half-built, and half-explained." },
    { id: "elegy-typewriter", title: "Elegy for a Typewriter", author: "Callum Reyes", genre: "Poetry", price: 329, year: 2022, pages: 88, publisher: "Éditions Corvine", isbn: "978-1-9998-4421-8", rating: 4, badge: null, mark: "E", pal: 5,
      blurb: "A debut collection written entirely on a 1962 Olivetti, about the objects we outlive and the ones that outlive us." },
    { id: "margins-hold", title: "What the Margins Hold", author: "Delphine Roux", genre: "Essays", price: 379, year: 2024, pages: 192, publisher: "Low Tide Press", isbn: "978-1-9998-4422-5", rating: 5, badge: "Staff Pick", mark: "W", pal: 0,
      blurb: "An essayist reads other people's marginalia in secondhand books and reconstructs the readers who left it." },
    { id: "grammar-of-light", title: "The Grammar of Light", author: "Anouk Verhoeven", genre: "Philosophy", price: 599, year: 2026, pages: 224, publisher: "North Field", isbn: "978-1-9998-4423-2", rating: 5, badge: null, mark: "G", pal: 3,
      blurb: "On how different languages describe the hour after sunrise, and what that says about how we think." },
    { id: "small-hours", title: "Small Hours, Loud Thoughts", author: "Milo Tanaka", genre: "Memoir", price: 449, year: 2026, pages: 264, publisher: "Acorn & Thread", isbn: "978-1-9998-4424-9", rating: 4, badge: "New", mark: "S", pal: 1,
      blurb: "A composer's memoir of insomnia, told in movements instead of chapters." },
    { id: "theory-of-doors", title: "A Theory of Doors", author: "Esme Falkner", genre: "Design & Architecture", price: 1299, year: 2023, pages: 208, publisher: "Plinth Books", isbn: "978-1-9998-4425-6", rating: 5, badge: "Signed", mark: "T", pal: 2,
      blurb: "A design historian traces the threshold — hinges, thresholds, welcome mats — as the most honest object in any building." },
    { id: "cartographers-daughter", title: "The Cartographer's Daughter", author: "Marguerite Sol", genre: "Fiction", price: 459, year: 2021, pages: 296, publisher: "Ferrous & Kin", isbn: "978-1-9998-4426-3", rating: 4, badge: null, mark: "C", pal: 5,
      blurb: "Sol's debut: a young mapmaker inherits her father's unfinished survey of a coastline that keeps quietly moving." }
  ];

  const EVENTS = [
    { id: "ev1", date: "2026-10-02", time: "19:00", title: "Reading: A Minor Chorus with Wren Okafor", place: "Main Room", desc: "Okafor reads from the new novel and takes questions, followed by a signing." },
    { id: "ev2", date: "2026-10-09", time: "18:30", title: "Poetry & Wine — Open Mic", place: "Back Room", desc: "Bring five minutes of your own work or someone else's. First glass on the house." },
    { id: "ev3", date: "2026-10-16", time: "19:00", title: "Book Club — On Walking Slowly", place: "Main Room", desc: "This month's pick, discussed over tea. New members always welcome." },
    { id: "ev4", date: "2026-10-23", time: "17:00", title: "Workshop: Hand Bookbinding", place: "Studio", desc: "A two-hour, hands-on class in the Coptic stitch. Materials included, all levels." },
    { id: "ev5", date: "2026-11-06", time: "19:00", title: "Launch: The Grammar of Light", place: "Main Room", desc: "Anouk Verhoeven in conversation on the eve of publication." },
    { id: "ev6", date: "2026-11-14", time: "18:00", title: "Staff Picks Live — Autumn Edition", place: "Main Room", desc: "Three booksellers, ten books, one very biased panel." }
  ];

  const JOURNAL = [
    { slug: "shelve-by-feeling", tag: "Notes from the Floor", title: "Why We Shelve by Feeling, Not Genre", date: "2026-08-28", author: "Odile Ferrand", mark: "F", pal: 1,
      excerpt: "Our fiction table is arranged by mood, not alphabet. Here's the case for a slightly disobedient bookstore.",
      body: "Most stores shelve by last name because it is fast to browse and faster to restock. We do it too, mostly — but our front tables have always run on a different logic: what does this book feel like to read at 9pm on a Tuesday? A shelf arranged by feeling asks more of us, and gives more back. It forces a bookseller to actually read the book, not just log its spine. It puts Salt & Marrow next to Elegy for a Typewriter not because their authors share a surname initial, but because both books ache in roughly the same key. Customers tell us they find things this way they would never have searched for. We believe them, because we do too." },
    { slug: "defense-of-marginalia", tag: "Craft", title: "A Short Defense of Marginalia", date: "2026-08-14", author: "Delphine Roux", mark: "M", pal: 3,
      excerpt: "Underlining, dog-ears, a coffee ring on page 40 — why we stopped apologising for how we actually read.",
      body: "There is a customer who returns her books to the used shelf still full of her pencil marks, and we have started to love her for it. A used book with marginalia is a conversation instead of a monologue — someone was here before you, and they had opinions. We keep a small shelf of ex-library and ex-somebody books precisely for their wear. New copies are wonderful. Read copies are wonderful in a different, noisier way." },
    { slug: "inside-the-bindery", tag: "Behind the Counter", title: "Inside the Bookbinding Studio", date: "2026-07-30", author: "Studio Team", mark: "B", pal: 2,
      excerpt: "A short tour of the back room, where damaged spines get a second life and blank books get their first.",
      body: "Past the poetry wall and down three steps is a room most customers never see: a long bench, two sewing frames, a board shear older than any of us, and a permanent smell of PVA glue. This is where we rebind our most-loved secondhand stock and teach the Saturday workshop. It is also, unofficially, where the staff go to think." },
    { slug: "five-books-slow-down", tag: "Recommends", title: "Five Books That Taught Us to Slow Down", date: "2026-07-11", author: "Théo Bassin", mark: "S", pal: 0,
      excerpt: "A short, deliberately short, list for anyone who wants to read like they mean it.",
      body: "On Walking Slowly opens the list for obvious reasons. Field Notes on Nothing belongs beside it, an argument for boredom as a discipline. The rest — a poetry collection, a design monograph, one very patient novel — are here because each made us finish a chapter and simply sit for a minute before starting the next." },
    { slug: "staff-picks-table", tag: "Notes from the Floor", title: "Notes from the Staff Picks Table", date: "2026-06-22", author: "Bram Uys", mark: "P", pal: 4,
      excerpt: "What we're pressing into customers' hands this season, and why the index cards are handwritten on purpose.",
      body: "Every staff pick card is written by hand because a typed recommendation reads like marketing and a handwritten one reads like a friend. We rotate the table monthly. This season: Studies in Grey for anyone who thinks they don't like art books, and What the Margins Hold for anyone who has ever bought a book for its previous owner's notes." },
    { slug: "reading-twice", tag: "Craft", title: "On Reading the Same Book Twice", date: "2026-06-03", author: "Marguerite Sol", mark: "R", pal: 5,
      excerpt: "A novelist on why she rereads before she writes, and what a second pass gives you that the first can't.",
      body: "The first reading is for plot. The second is for everything the plot was hiding. I reread before I write because I want to remember what it feels like to already know how a sentence ends and still want to read it again." }
  ];

  const TESTIMONIALS = [
    { quote: "The only shop where I've bought a book because of how the till receipt was folded.", who: "Local reader, six years running" },
    { quote: "Staff picks that are actually picks. I have never once regretted the little handwritten card.", who: "Newsletter subscriber" },
    { quote: "I came in for a gift and left with four books for myself. Budget accordingly.", who: "First-time visitor" }
  ];

  const TEAM = [
    { name: "Odile Ferrand", role: "Founder & Head Bookseller", bio: "Opened Écrivoire in a former print shop after a decade in art publishing. Still shelves the art wall herself." },
    { name: "Théo Bassin", role: "Essays & Ideas", bio: "Can find you the right essay collection for almost any mood in under a minute. Undefeated so far." },
    { name: "Delphine Roux", role: "Fiction & Events", bio: "Runs the reading series and the book club, usually simultaneously, always with tea." },
    { name: "Bram Uys", role: "Studio & Binding", bio: "Teaches the Saturday bookbinding workshop and keeps the back room from ever being tidy." }
  ];

  // The mascot family — Inkling (our purple cow) and friends, used in the
  // "Meet the Crew" scroll carousel and scattered as scroll-triggered doodles.
  const MASCOTS = [
    { id: "inkling", name: "Inkling", role: "Chief Purple Cow. Reads everything twice.", pal: 1 },
    { id: "spine", name: "Spine", role: "The book with eyes. Never judges a cover.", pal: 0 },
    { id: "nib", name: "Nib", role: "The quill. Writes every shelf card by hand.", pal: 3 },
    { id: "brew", name: "Brew", role: "The teacup. Fuels the whole back room.", pal: 2 },
    { id: "glow", name: "Glow", role: "The lamp. Stays on past closing.", pal: 5 },
    { id: "fold", name: "Fold", role: "The bookmark ghost. Haunts unfinished novels.", pal: 4 }
  ];

  // The Purple Cow Club — membership tiers (display-only, luxury flavour).
  const TIERS = [
    { name: "Reader", price: 0, period: "forever free", desc: "Every visitor's default. Early word on drops and events.",
      perks: ["Wishlist voting rights", "Monthly good-list email", "Birthday bookmark, on us"] },
    { name: "Collector", price: 1499, period: "per year", featured: true, ribbon: "Most Loved",
      desc: "For the shelf that's always half a metre too full.",
      perks: ["10% off every visit", "First access to signed & limited stock", "Free rebinding once a year", "Invite to preview nights"] },
    { name: "Patron", price: 4999, period: "per year", desc: "You basically run the back room at this point.",
      perks: ["18% off every visit", "A book hand-picked for you, quarterly", "Name on the Patron shelf plate", "Priority seats at every reading"] }
  ];

  return { GENRES, BOOKS, EVENTS, JOURNAL, TESTIMONIALS, TEAM, MASCOTS, TIERS };
})();
