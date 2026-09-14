/* ==========================================================================
   ÉCRIVOIRE STUDIOS — demo data
   Real, widely-known bestselling books (public titles/authors), styled as
   flat-colour generated covers — no cover art or jacket copy is copied
   from any publisher; blurbs below are written fresh, in our own
   bookseller voice. Everything else (store, staff, events) is fictional.
   Prices in INR (₹), for a fictional demo store — not real retail data.
   ========================================================================== */

window.ECRIVOIRE_DATA = (function () {

  const GENRES = [
    "Fiction", "Poetry", "Essays", "Design & Architecture",
    "Philosophy", "Children's", "Art", "Memoir"
  ];

  const BOOKS = [
    { id: "the-alchemist", title: "The Alchemist", author: "Paulo Coelho", genre: "Fiction", price: 299, year: 1988, pages: 208, publisher: "HarperOne", isbn: "978-1-9998-4410-2", rating: 5, badge: "Bestseller", mark: "A", pal: 4, stampPick: false,
      blurb: "A shepherd sells his flock to chase a recurring dream across the desert. Thirty-odd years on, it's still the book people press into a friend's hands during a hard year." },
    { id: "the-white-tiger", title: "The White Tiger", author: "Aravind Adiga", genre: "Fiction", price: 599, year: 2008, pages: 288, publisher: "Free Press", isbn: "978-1-9998-4411-9", rating: 5, badge: "Signed", mark: "W", pal: 0, stampPick: true,
      blurb: "A driver in Delhi writes a long, unrepentant letter about how he escaped his village and clawed his way to the top. Won the Booker; still the sharpest satire on our shelf." },
    { id: "god-of-small-things", title: "The God of Small Things", author: "Arundhati Roy", genre: "Fiction", price: 399, year: 1997, pages: 340, publisher: "IndiaInk", isbn: "978-1-9998-4412-6", rating: 5, badge: "Staff Pick", mark: "G", pal: 1,
      blurb: "Twins in Kerala, a forbidden love, a family that comes quietly apart. The sentences are so precise you'll want to read half of them twice." },
    { id: "life-of-pi", title: "Life of Pi", author: "Yann Martel", genre: "Fiction", price: 399, year: 2001, pages: 336, publisher: "Knopf Canada", isbn: "978-1-9998-4413-3", rating: 4, badge: null, mark: "L", pal: 2,
      blurb: "A boy, a lifeboat, and a Bengal tiger named Richard Parker. Funnier and stranger than the film lets on." },
    { id: "milk-and-honey", title: "Milk and Honey", author: "Rupi Kaur", genre: "Poetry", price: 399, year: 2014, pages: 204, publisher: "Andrews McMeel", isbn: "978-1-9998-4414-0", rating: 4, badge: "Bestseller", mark: "M", pal: 3, stampPick: true,
      blurb: "Short, unguarded poems about surviving, loving, and leaving. The book that got an entire generation buying poetry again." },
    { id: "gitanjali", title: "Gitanjali", author: "Rabindranath Tagore", genre: "Poetry", price: 199, year: 1910, pages: 96, publisher: "Macmillan", isbn: "978-1-9998-4415-7", rating: 5, badge: "Staff Pick", mark: "G", pal: 5,
      blurb: "Song offerings, in Tagore's own English translation — the collection that won Asia's first Nobel Prize in Literature. Still the most quietly devastating book in the poetry section." },
    { id: "bad-feminist", title: "Bad Feminist", author: "Roxane Gay", genre: "Essays", price: 499, year: 2014, pages: 320, publisher: "Harper Perennial", isbn: "978-1-9998-4416-4", rating: 4, badge: null, mark: "B", pal: 0,
      blurb: "Essays on culture, contradiction, and why being an imperfect feminist beats being no feminist at all. Funny, blunt, and hard to put down." },
    { id: "consider-the-lobster", title: "Consider the Lobster", author: "David Foster Wallace", genre: "Essays", price: 499, year: 2005, pages: 343, publisher: "Little, Brown", isbn: "978-1-9998-4417-1", rating: 5, badge: null, mark: "C", pal: 3,
      blurb: "Essays on lobsters, porn awards, and John McCain's campaign bus, all written by the most footnote-obsessed mind in American nonfiction." },
    { id: "101-things-architecture-school", title: "101 Things I Learned in Architecture School", author: "Matthew Frederick", genre: "Design & Architecture", price: 899, year: 2007, pages: 132, publisher: "MIT Press", isbn: "978-1-9998-4418-8", rating: 5, badge: "Staff Pick", mark: "1", pal: 1,
      blurb: "A tiny, illustrated book of first-year architecture lessons that somehow applies to almost everything you design, build, or write." },
    { id: "poetics-of-space", title: "The Poetics of Space", author: "Gaston Bachelard", genre: "Design & Architecture", price: 599, year: 1958, pages: 241, publisher: "Beacon Press", isbn: "978-1-9998-4419-5", rating: 4, badge: null, mark: "P", pal: 2,
      blurb: "A philosopher walks through attics, drawers, and shells to ask what a house actually means to the people who live in it." },
    { id: "sapiens", title: "Sapiens: A Brief History of Humankind", author: "Yuval Noah Harari", genre: "Philosophy", price: 499, year: 2011, pages: 464, publisher: "Harper", isbn: "978-1-9998-4420-1", rating: 5, badge: "Bestseller", mark: "S", pal: 0, stampPick: true,
      blurb: "How a mid-ranking savannah ape ended up running the planet, told in one very confident, very readable sweep." },
    { id: "meditations", title: "Meditations", author: "Marcus Aurelius", genre: "Philosophy", price: 299, year: 180, pages: 254, publisher: "Penguin Classics", isbn: "978-1-9998-4421-8", rating: 5, badge: "Staff Pick", mark: "M", pal: 5,
      blurb: "A Roman emperor's private notes to himself on staying steady. Nearly two thousand years old and still the best pep talk in the shop." },
    { id: "ikigai", title: "Ikigai: The Japanese Secret to a Long and Happy Life", author: "Héctor García & Francesc Miralles", genre: "Philosophy", price: 349, year: 2016, pages: 208, publisher: "Penguin Life", isbn: "978-1-9998-4422-5", rating: 4, badge: "New", mark: "I", pal: 3,
      blurb: "A short, warm field guide to finding your reason for getting up in the morning, via the residents of Okinawa's longest-living village." },
    { id: "matilda", title: "Matilda", author: "Roald Dahl", genre: "Children's", price: 349, year: 1988, pages: 240, publisher: "Puffin", isbn: "978-1-9998-4423-2", rating: 5, badge: "Staff Pick", mark: "M", pal: 4,
      blurb: "A brilliant, unloved little girl discovers she can move things with her mind and quietly rearranges the universe in her favour." },
    { id: "very-hungry-caterpillar", title: "The Very Hungry Caterpillar", author: "Eric Carle", genre: "Children's", price: 399, year: 1969, pages: 26, publisher: "Puffin", isbn: "978-1-9998-4424-9", rating: 5, badge: "Bestseller", mark: "V", pal: 1,
      blurb: "One very small, very determined caterpillar eats his way through a week and the entire picture-book canon. A shop staple since we opened." },
    { id: "ways-of-seeing", title: "Ways of Seeing", author: "John Berger", genre: "Art", price: 499, year: 1972, pages: 166, publisher: "Penguin", isbn: "978-1-9998-4425-6", rating: 5, badge: null, mark: "W", pal: 2,
      blurb: "Four essays and four picture-essays that changed how a generation looked at paintings, adverts, and each other. Still assigned, still argued about." },
    { id: "story-of-art", title: "The Story of Art", author: "E.H. Gombrich", genre: "Art", price: 2499, year: 1950, pages: 688, publisher: "Phaidon", isbn: "978-1-9998-4426-3", rating: 5, badge: "Bestseller", mark: "S", pal: 0,
      blurb: "Reportedly the best-selling art book ever printed, and our heaviest hardcover by some distance. A genuinely brilliant one-volume history." },
    { id: "educated", title: "Educated", author: "Tara Westover", genre: "Memoir", price: 499, year: 2018, pages: 352, publisher: "Random House", isbn: "978-1-9998-4427-0", rating: 5, badge: "Bestseller", mark: "E", pal: 3,
      blurb: "A woman raised off-grid in Idaho, with no school and no birth certificate, talks her way into a PhD at Cambridge. Impossible to put down." },
    { id: "when-breath-becomes-air", title: "When Breath Becomes Air", author: "Paul Kalanithi", genre: "Memoir", price: 399, year: 2016, pages: 228, publisher: "Random House", isbn: "978-1-9998-4428-7", rating: 5, badge: "Staff Pick", mark: "B", pal: 5,
      blurb: "A neurosurgeon is diagnosed with terminal cancer mid-residency and spends his last months writing about what makes a life worth living. Keep tissues nearby." }
  ];

  const EVENTS = [
    { id: "ev1", date: "2026-10-02", time: "19:00", title: "Book Club — Sapiens", place: "Main Room", desc: "Théo leads a discussion on Harari's sweep through human history. New members always welcome." },
    { id: "ev2", date: "2026-10-09", time: "18:30", title: "Poetry & Chai — Open Mic", place: "Back Room", desc: "Bring five minutes of your own work or someone else's. First cup on the house." },
    { id: "ev3", date: "2026-10-16", time: "19:00", title: "Reading Circle — The White Tiger", place: "Main Room", desc: "Delphine hosts a close read of Adiga's Booker winner, with tea and strong opinions." },
    { id: "ev4", date: "2026-10-23", time: "17:00", title: "Workshop: Hand Bookbinding", place: "Studio", desc: "A two-hour, hands-on class in the Coptic stitch. Materials included, all levels." },
    { id: "ev5", date: "2026-11-06", time: "16:00", title: "Kids' Storytime — The Very Hungry Caterpillar", place: "Main Room", desc: "Bram reads it aloud (badly, on purpose) for the under-sevens. Snacks provided." },
    { id: "ev6", date: "2026-11-14", time: "18:00", title: "Staff Picks Live — Autumn Edition", place: "Main Room", desc: "Four booksellers, ten books, one very biased panel." }
  ];

  const JOURNAL = [
    { slug: "shelve-by-feeling", tag: "Notes from the Floor", title: "Why We Shelve by Feeling, Not Genre", date: "2026-08-28", author: "Odile Ferrand", mark: "F", pal: 1,
      excerpt: "Our fiction table is arranged by mood, not alphabet. Here's the case for a slightly disobedient bookstore.",
      body: "Most stores shelve by last name because it is fast to browse and faster to restock. We do it too, mostly — but our front tables have always run on a different logic: what does this book feel like to read at 9pm on a Tuesday? A shelf arranged by feeling asks more of us, and gives more back. It forces a bookseller to actually read the book, not just log its spine. It puts Milk and Honey next to Meditations not because their authors share a shelf label, but because both books ache in roughly the same key on a slow evening. Customers tell us they find things this way they would never have searched for. We believe them, because we do too." },
    { slug: "defense-of-marginalia", tag: "Craft", title: "A Short Defense of Marginalia", date: "2026-08-14", author: "Delphine Roux", mark: "M", pal: 3,
      excerpt: "Underlining, dog-ears, a coffee ring on page 40 — why we stopped apologising for how we actually read.",
      body: "There is a customer who returns her books to the used shelf still full of her pencil marks, and we have started to love her for it. A used book with marginalia is a conversation instead of a monologue — someone was here before you, and they had opinions. We keep a small shelf of ex-library and ex-somebody books precisely for their wear. New copies are wonderful. Read copies are wonderful in a different, noisier way." },
    { slug: "inside-the-bindery", tag: "Behind the Counter", title: "Inside the Bookbinding Studio", date: "2026-07-30", author: "Studio Team", mark: "B", pal: 2,
      excerpt: "A short tour of the back room, where damaged spines get a second life and blank books get their first.",
      body: "Past the poetry wall and down three steps is a room most customers never see: a long bench, two sewing frames, a board shear older than any of us, and a permanent smell of PVA glue. This is where we rebind our most-loved secondhand stock and teach the Saturday workshop. It is also, unofficially, where the staff go to think." },
    { slug: "five-books-slow-down", tag: "Recommends", title: "Five Books That Taught Us to Slow Down", date: "2026-07-11", author: "Théo Bassin", mark: "S", pal: 0,
      excerpt: "A short, deliberately short, list for anyone who wants to read like they mean it.",
      body: "Meditations opens the list for obvious reasons — Marcus Aurelius knew a thing or two about staying steady under pressure. Ikigai belongs beside it, a quiet argument for knowing your own reasons. The rest — Gitanjali, The Poetics of Space, and one very patient novel called Life of Pi — are here because each made us finish a chapter and simply sit for a minute before starting the next." },
    { slug: "staff-picks-table", tag: "Notes from the Floor", title: "Notes from the Staff Picks Table", date: "2026-06-22", author: "Bram Uys", mark: "P", pal: 4,
      excerpt: "What we're pressing into customers' hands this season, and why the index cards are handwritten on purpose.",
      body: "Every staff pick card is written by hand because a typed recommendation reads like marketing and a handwritten one reads like a friend. We rotate the table monthly. This season: The Story of Art for anyone who thinks they don't like art books, and Bad Feminist for anyone who wants essays with a bit of teeth." },
    { slug: "reading-twice", tag: "Craft", title: "On Reading the Same Book Twice", date: "2026-06-03", author: "Odile Ferrand", mark: "R", pal: 5,
      excerpt: "A bookseller on why she rereads before she recommends, and what a second pass gives you that the first can't.",
      body: "The first reading is for plot. The second is for everything the plot was hiding. I reread before I recommend because I want to remember what it feels like to already know how a book ends and still want to read it again." }
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

  // The mascot family — Inkling (our purple cow, in name only — the shop
  // itself is drawn in black, white and grey) and friends. Used in the
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
