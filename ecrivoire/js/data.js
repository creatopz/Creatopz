/* ==========================================================================
   ÉCRIVOIRE STUDIOS — demo data
   Business model: we typeset, design and print our OWN limited-run
   editions of public-domain classics (copyright expired — legally free
   to republish) under our own imprint, Écrivoire Editions. Each edition
   is numbered, released in a small monthly batch, and never reprinted
   identically once a drop sells out — so a given edition really is
   available nowhere else. Original works/authors/years below are real
   and accurate; "Écrivoire Editions" and every copy count is fictional
   demo data. Prices in INR (₹).
   ========================================================================== */

window.ECRIVOIRE_DATA = (function () {

  const GENRES = [
    "Fiction", "Poetry", "Essays", "Design & Architecture",
    "Philosophy", "Children's", "Art", "Memoir"
  ];

  const IMPRINT = "Écrivoire Editions";

  const BOOKS = [
    { id: "pride-and-prejudice", title: "Pride and Prejudice", author: "Jane Austen", genre: "Fiction", price: 349, year: 1813, pages: 279, publisher: IMPRINT, isbn: "978-1-9998-4410-2", rating: 5, badge: "Staff Pick", mark: "P", pal: 4, stampPick: true,
      editionNo: "No. 01", dropMonth: "August 2026", copiesTotal: 300, copiesLeft: 0,
      blurb: "Our first edition, and still the one people ask after most. Cloth-bound, deckle-edged, and gone within three weeks — the next print run hasn't been scheduled." },
    { id: "meditations", title: "Meditations", author: "Marcus Aurelius", genre: "Philosophy", price: 279, year: 180, pages: 224, publisher: IMPRINT, isbn: "978-1-9998-4411-9", rating: 5, badge: null, mark: "M", pal: 0, stampPick: true,
      editionNo: "No. 02", dropMonth: "August 2026", copiesTotal: 250, copiesLeft: 0,
      blurb: "A Roman emperor's private notes to himself on staying steady. Our smallest, plainest edition — and the fastest sellout we've had." },
    { id: "alice-in-wonderland", title: "Alice's Adventures in Wonderland", author: "Lewis Carroll", genre: "Children's", price: 329, year: 1865, pages: 200, publisher: IMPRINT, isbn: "978-1-9998-4412-6", rating: 5, badge: null, mark: "A", pal: 3, stampPick: true,
      editionNo: "No. 03", dropMonth: "August 2026", copiesTotal: 200, copiesLeft: 0,
      blurb: "Our edition kept the original Tenniel-style spirit but reset the type by hand. Sold out in nine days flat — ask to be notified for the next run." },
    { id: "franklin-autobiography", title: "The Autobiography of Benjamin Franklin", author: "Benjamin Franklin", genre: "Memoir", price: 349, year: 1791, pages: 260, publisher: IMPRINT, isbn: "978-1-9998-4413-3", rating: 4, badge: null, mark: "F", pal: 2,
      editionNo: "No. 04", dropMonth: "August 2026", copiesTotal: 180, copiesLeft: 4,
      blurb: "Franklin's own account of failing upward, again and again, told with more self-deprecation than most memoirs manage today. Down to our last handful." },
    { id: "leaves-of-grass", title: "Leaves of Grass", author: "Walt Whitman", genre: "Poetry", price: 299, year: 1855, pages: 96, publisher: IMPRINT, isbn: "978-1-9998-4414-0", rating: 5, badge: null, mark: "L", pal: 5,
      editionNo: "No. 05", dropMonth: "August 2026", copiesTotal: 150, copiesLeft: 0,
      blurb: "The 1855 text, before Whitman kept revising it for the rest of his life. Our August run is gone; a second printing is under discussion." },
    { id: "ten-books-architecture", title: "The Ten Books on Architecture", author: "Vitruvius", genre: "Design & Architecture", price: 599, year: -30, pages: 288, publisher: IMPRINT, isbn: "978-1-9998-4415-7", rating: 4, badge: null, mark: "V", pal: 1,
      editionNo: "No. 06", dropMonth: "August 2026", copiesTotal: 120, copiesLeft: 6,
      blurb: "The oldest surviving treatise on architecture, and somehow still the book every design student eventually gets handed. Almost gone." },
    { id: "frankenstein", title: "Frankenstein", author: "Mary Shelley", genre: "Fiction", price: 349, year: 1818, pages: 280, publisher: IMPRINT, isbn: "978-1-9998-4416-4", rating: 5, badge: "This Month", mark: "F", pal: 0,
      editionNo: "No. 07", dropMonth: "September 2026", copiesTotal: 300, copiesLeft: 42,
      blurb: "Written when Shelley was nineteen, on a bet, during one very bad summer. Our September edition is going fast — under fifty copies left." },
    { id: "dracula", title: "Dracula", author: "Bram Stoker", genre: "Fiction", price: 379, year: 1897, pages: 418, publisher: IMPRINT, isbn: "978-1-9998-4417-1", rating: 5, badge: "This Month", mark: "D", pal: 3,
      editionNo: "No. 08", dropMonth: "September 2026", copiesTotal: 300, copiesLeft: 18,
      blurb: "Told entirely in letters, diary entries and newspaper clippings — the format is still the best trick in the book. Down to a handful of copies." },
    { id: "gitanjali", title: "Gitanjali", author: "Rabindranath Tagore", genre: "Poetry", price: 249, year: 1910, pages: 104, publisher: IMPRINT, isbn: "978-1-9998-4418-8", rating: 5, badge: "This Month", mark: "G", pal: 4,
      editionNo: "No. 09", dropMonth: "September 2026", copiesTotal: 200, copiesLeft: 55,
      blurb: "Song offerings, in Tagore's own English translation — the collection that won Asia's first Nobel Prize in Literature." },
    { id: "tao-te-ching", title: "Tao Te Ching", author: "Lao Tzu", genre: "Philosophy", price: 249, year: -400, pages: 120, publisher: IMPRINT, isbn: "978-1-9998-4419-5", rating: 5, badge: "This Month", mark: "T", pal: 5,
      editionNo: "No. 10", dropMonth: "September 2026", copiesTotal: 200, copiesLeft: 71,
      blurb: "Eighty-one short chapters that have outlasted every empire that tried to ban them. Our smallest, most pocketable edition yet." },
    { id: "wizard-of-oz", title: "The Wonderful Wizard of Oz", author: "L. Frank Baum", genre: "Children's", price: 329, year: 1900, pages: 154, publisher: IMPRINT, isbn: "978-1-9998-4420-1", rating: 4, badge: "This Month", mark: "W", pal: 2,
      editionNo: "No. 11", dropMonth: "September 2026", copiesTotal: 220, copiesLeft: 33,
      blurb: "Before the film, before the ruby slippers were even red — the original is stranger and funnier than you remember." },
    { id: "leonardo-notebooks", title: "The Notebooks of Leonardo da Vinci", author: "Leonardo da Vinci", genre: "Art", price: 699, year: 1888, pages: 400, publisher: IMPRINT, isbn: "978-1-9998-4421-8", rating: 5, badge: "This Month", mark: "N", pal: 0,
      editionNo: "No. 12", dropMonth: "September 2026", copiesTotal: 150, copiesLeft: 12,
      blurb: "Compiled from the surviving notebooks — mirror-written, illustrated, and still five centuries ahead of most of our to-do lists. Almost sold out." },
    { id: "up-from-slavery", title: "Up From Slavery", author: "Booker T. Washington", genre: "Memoir", price: 329, year: 1901, pages: 236, publisher: IMPRINT, isbn: "978-1-9998-4422-5", rating: 5, badge: "This Month", mark: "U", pal: 1,
      editionNo: "No. 13", dropMonth: "September 2026", copiesTotal: 180, copiesLeft: 61,
      blurb: "An autobiography of building a school, brick by brick, out of almost nothing. Blunt, practical, and quietly devastating." },
    { id: "great-expectations", title: "Great Expectations", author: "Charles Dickens", genre: "Fiction", price: 399, year: 1861, pages: 544, publisher: IMPRINT, isbn: "978-1-9998-4423-2", rating: 5, badge: "New Drop", mark: "G", pal: 4,
      editionNo: "No. 14", dropMonth: "October 2026", copiesTotal: 250, copiesLeft: 250,
      blurb: "Just off the press this week: our October edition of Dickens's best-plotted novel, reset with a new title page and a cleaner running head." },
    { id: "self-reliance", title: "Self-Reliance and Other Essays", author: "Ralph Waldo Emerson", genre: "Essays", price: 299, year: 1841, pages: 176, publisher: IMPRINT, isbn: "978-1-9998-4424-9", rating: 4, badge: "New Drop", mark: "S", pal: 3,
      editionNo: "No. 15", dropMonth: "October 2026", copiesTotal: 200, copiesLeft: 200,
      blurb: "The essay that launched a thousand tote-bag quotes, back when it just meant thinking for yourself. Fresh off the press." },
    { id: "walden", title: "Walden", author: "Henry David Thoreau", genre: "Essays", price: 349, year: 1854, pages: 260, publisher: IMPRINT, isbn: "978-1-9998-4425-6", rating: 4, badge: "New Drop", mark: "W", pal: 5,
      editionNo: "No. 16", dropMonth: "October 2026", copiesTotal: 200, copiesLeft: 200,
      blurb: "Two years by a pond, turned into the patron saint text of everyone who's ever wanted to move to the woods for a while. New this month." },
    { id: "stones-of-venice", title: "The Stones of Venice", author: "John Ruskin", genre: "Design & Architecture", price: 549, year: 1853, pages: 312, publisher: IMPRINT, isbn: "978-1-9998-4426-3", rating: 4, badge: "New Drop", mark: "S", pal: 0,
      editionNo: "No. 17", dropMonth: "October 2026", copiesTotal: 120, copiesLeft: 120,
      blurb: "Ruskin walks Venice stone by stone and ends up writing the single most influential defence of ornament ever put on paper. Just arrived." },
    { id: "art-of-war", title: "The Art of War", author: "Sun Tzu", genre: "Philosophy", price: 279, year: -500, pages: 96, publisher: IMPRINT, isbn: "978-1-9998-4427-0", rating: 5, badge: "New Drop", mark: "A", pal: 2,
      editionNo: "No. 18", dropMonth: "October 2026", copiesTotal: 300, copiesLeft: 300,
      blurb: "Thirteen short chapters on strategy that somehow ended up on every boardroom shelf in the world. Our biggest first print run yet." },
    { id: "studies-renaissance", title: "Studies in the History of the Renaissance", author: "Walter Pater", genre: "Art", price: 499, year: 1873, pages: 240, publisher: IMPRINT, isbn: "978-1-9998-4428-7", rating: 4, badge: "New Drop", mark: "R", pal: 3,
      editionNo: "No. 19", dropMonth: "October 2026", copiesTotal: 120, copiesLeft: 120,
      blurb: "The book that scandalised Oxford in 1873 for suggesting art should be felt before it's explained. Just off the press." }
  ];

  const EVENTS = [
    { id: "ev1", date: "2026-10-02", time: "19:00", title: "Edition Launch — The October Six", place: "Online — Instagram Live", desc: "We unveil this month's six new editions live, first copies claimed on the spot." },
    { id: "ev2", date: "2026-10-09", time: "17:00", title: "Submission Office Hours", place: "Online — video call", desc: "Book a fifteen-minute slot to talk through a manuscript or a pitch before you submit." },
    { id: "ev3", date: "2026-10-16", time: "19:00", title: "Book Club — Meditations", place: "Online — video call", desc: "Théo leads a discussion on Marcus Aurelius. New members always welcome, link sent after RSVP." },
    { id: "ev4", date: "2026-10-23", time: "17:00", title: "Workshop: Hand Bookbinding", place: "Pop-up — Kaaya Studio, Bandra", desc: "Learn the exact Coptic stitch we use on every Écrivoire Edition, in person at a partner space. Materials included." },
    { id: "ev5", date: "2026-11-06", time: "16:00", title: "Kids' Storytime — Alice's Adventures in Wonderland", place: "Online — Instagram Live", desc: "Bram reads it aloud (badly, on purpose) for the under-sevens." },
    { id: "ev6", date: "2026-11-14", time: "18:00", title: "Staff Picks Live — Autumn Edition", place: "Online — Instagram Live", desc: "Four booksellers, ten editions, one very biased panel." }
  ];

  const JOURNAL = [
    { slug: "why-we-only-print-whats-free", tag: "The Model", title: "Why We Only Print What's Already Free", date: "2026-09-10", author: "Odile Ferrand", mark: "F", pal: 0,
      excerpt: "Every Écrivoire Edition is a public-domain classic — here's why we built a whole bookstore around books nobody can lose the rights to.",
      body: "We get asked a lot why we don't stock this year's big releases. The honest answer: we're not a bookshop that reorders other people's stock, we're a tiny press that designs and prints its own editions — and we can only do that, legally and without a licensing deal, with books whose copyright has expired. So every Écrivoire Edition starts life as a public-domain text: Austen, Whitman, Sun Tzu, Vitruvius. We choose the translation, set the type, pick the binding, and print a small, numbered run. Nobody else has our exact edition, because nobody else made it. It also means the words themselves were always meant to be shared — we're just the ones taking the time to make them beautiful again." },
    { slug: "how-a-manuscript-becomes-an-edition", tag: "The Model", title: "How a Manuscript Becomes an Édition", date: "2026-08-22", author: "Delphine Roux", mark: "M", pal: 1,
      excerpt: "We also publish new, original work. Here's what actually happens between a submission landing in our inbox and a book landing on the shelf.",
      body: "Alongside our classics program, we publish a small number of original manuscripts every year — first collections, debut novellas, the occasional strange nonfiction project nobody else wanted to take a chance on. A submission comes in through the Publish With Us page. Odile and I read every single one. If we love it, we call, not email — some things deserve a real conversation. From there it's usually four to six months: an editorial pass, a cover concept, a small first print run under the same Écrivoire Edition numbering as our classics. We've done three so far. We're hoping for a fourth by spring." },
    { slug: "shelve-by-feeling", tag: "Notes from the Floor", title: "Why We Shelve by Feeling, Not Genre", date: "2026-08-28", author: "Odile Ferrand", mark: "S", pal: 4,
      excerpt: "Our fiction table is arranged by mood, not alphabet. Here's the case for a slightly disobedient bookstore.",
      body: "Most stores shelve by last name because it is fast to browse and faster to restock. We do it too, mostly — but our front tables have always run on a different logic: what does this edition feel like to read at 9pm on a Tuesday? It puts Gitanjali next to Meditations not because their authors share a shelf label, but because both books ache in roughly the same key on a slow evening. Customers tell us they find things this way they would never have searched for. We believe them, because we do too." },
    { slug: "defense-of-marginalia", tag: "Craft", title: "A Short Defense of Marginalia", date: "2026-08-14", author: "Delphine Roux", mark: "D", pal: 3,
      excerpt: "Underlining, dog-ears, a coffee ring on page 40 — why we stopped apologising for how we actually read.",
      body: "There is a customer who returns her books to the used shelf still full of her pencil marks, and we have started to love her for it. A used book with marginalia is a conversation instead of a monologue — someone was here before you, and they had opinions. We keep a small shelf of ex-library and ex-somebody books precisely for their wear. New editions are wonderful. Read copies are wonderful in a different, noisier way." },
    { slug: "inside-the-bindery", tag: "Behind the Counter", title: "Inside the Bookbinding Studio", date: "2026-07-30", author: "Bram Uys", mark: "B", pal: 2,
      excerpt: "A short tour of the back room, where every single Écrivoire Edition is actually stitched together by hand.",
      body: "Past the poetry wall and down three steps is a room most customers never see: a long bench, two sewing frames, a board shear older than any of us, and a permanent smell of PVA glue. This is where every numbered copy of every edition gets its Coptic stitch, one at a time, which is also why a print run of three hundred takes us most of a month. It is also, unofficially, where the staff go to think." },
    { slug: "five-editions-slow-down", tag: "Recommends", title: "Five Editions That Taught Us to Slow Down", date: "2026-07-11", author: "Théo Bassin", mark: "T", pal: 0,
      excerpt: "A short, deliberately short, list for anyone who wants to read like they mean it.",
      body: "Meditations opens the list for obvious reasons — Marcus Aurelius knew a thing or two about staying steady under pressure. Walden belongs beside it, a whole book about deciding what actually matters. The rest — Tao Te Ching, The Stones of Venice, and one very patient novel called Great Expectations — are here because each made us finish a chapter and simply sit for a minute before starting the next." },
    { slug: "staff-picks-table", tag: "Notes from the Floor", title: "Notes from the Staff Picks Table", date: "2026-06-22", author: "Bram Uys", mark: "P", pal: 5,
      excerpt: "What we're pressing into customers' hands this season, and why the index cards are handwritten on purpose.",
      body: "Every staff pick card is written by hand because a typed recommendation reads like marketing and a handwritten one reads like a friend. We rotate the table monthly. This season: The Notebooks of Leonardo da Vinci for anyone who thinks they don't like art books, and Up From Slavery for anyone who wants a memoir with some backbone." },
    { slug: "reading-twice", tag: "Craft", title: "On Reading the Same Edition Twice", date: "2026-06-03", author: "Odile Ferrand", mark: "R", pal: 1,
      excerpt: "A bookseller on why she rereads before she recommends, and what a second pass gives you that the first can't.",
      body: "The first reading is for plot. The second is for everything the plot was hiding. I reread before I recommend because I want to remember what it feels like to already know how a book ends and still want to read it again." }
  ];

  const TESTIMONIALS = [
    { quote: "I didn't know I wanted a numbered, hand-stitched copy of Meditations until I owned one. Now I check the site every month.", who: "Collector member, since Edition No. 03" },
    { quote: "Missed the Alice in Wonderland run by two days and I am still not over it. Refresh the shop every first of the month now.", who: "Newsletter subscriber" },
    { quote: "Sent a very rough manuscript through Publish With Us expecting nothing. Odile called me the next week.", who: "First-time author" }
  ];

  const TEAM = [
    { name: "Odile Ferrand", role: "Founder & Editor", bio: "Opened Écrivoire in a former print shop after a decade in art publishing. Reads every single manuscript submission personally." },
    { name: "Théo Bassin", role: "Classics & Acquisitions", bio: "Picks which public-domain text becomes next month's edition. Has never once picked the obvious choice." },
    { name: "Delphine Roux", role: "New Authors & Events", bio: "Runs the reading series and the Publish With Us pipeline, usually simultaneously, always with tea." },
    { name: "Bram Uys", role: "Studio & Binding", bio: "Hand-stitches every numbered copy of every edition. The back room has never once been tidy." }
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
      perks: ["First access when a new edition drops", "Monthly good-list email", "Birthday bookmark, on us"] },
    { name: "Collector", price: 1499, period: "per year", featured: true, ribbon: "Most Loved",
      desc: "For the shelf that's always half a metre too full.",
      perks: ["10% off every edition", "24-hour early access before public drop", "Free rebinding once a year", "Invite to every launch night"] },
    { name: "Patron", price: 4999, period: "per year", desc: "You basically run the back room at this point.",
      perks: ["18% off every edition", "A copy of every new drop, reserved automatically", "Name on the Patron shelf plate", "Priority seats at every reading"] }
  ];

  return { GENRES, BOOKS, EVENTS, JOURNAL, TESTIMONIALS, TEAM, MASCOTS, TIERS };
})();
