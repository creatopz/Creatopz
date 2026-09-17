/**
 * Lead / Visitor Communicator Agent -- rule-based FAQ + lead-qualification
 * widget for public pages. Not a free-form LLM: it matches visitor
 * questions against a small, curated set of answers pulled straight from
 * copy that's already live elsewhere on the site (for-brands.html's FAQ,
 * the platform-fee figure, the admin-mediated flow), so nothing it says
 * is invented. Anything it can't answer confidently -- and anything that
 * touches negotiated pricing, contracts, or payment specifics -- gets
 * handed to a lead-capture form instead of guessed at, flagged
 * needs_human_review for the team.
 *
 * Include after js/supabase-client.js and js/utils.js on any public page.
 * Skips itself entirely inside the admin/dashboard shell (.dash-shell),
 * which already has its own contact tools.
 */

const LEAD_AGENT_FAQ = [
  {
    match: /\b(fee|fees|cost|costs|pricing|price|charge|commission)\b/i,
    answer: "Creatopz charges a flat 15% platform fee on top of whatever budget a brand sets — that's the only charge. No listing fee, no subscription, on either side.",
  },
  {
    match: /\b(how (does|do) (it|creatopz) work|what is creatopz|what do you do)\b/i,
    answer: "A brand posts a brief with a budget and niche, our team shortlists matching creators, the brand confirms who they want, and we make the introduction. Every match is mediated by our team — no cold DMs.",
  },
  {
    match: /\bi'?m a creator\b|\b(creator|influencer)\b.*\b(join|sign ?up|apply|become|list)\b|\b(join|sign ?up|apply|become|list)\b.*\b(creator|influencer)\b/i,
    answer: "Sign up as a creator, get verified, and set your rate card by content type. From there you can apply to open briefs, or our team can shortlist you directly. Every profile is checked before it goes live in the directory.",
  },
  {
    match: /\bi'?m a brand\b|\b(brand|company|business)\b.*\b(join|sign ?up|post|hire|campaign|brief)\b|\b(post|hire|campaign|brief)\b.*\b(brand|creator)\b/i,
    answer: "Sign up as a brand, post a brief with your budget and niche, and our team brings you a shortlist of vetted creators against it. You approve who you want — nothing is finalised without you.",
  },
  {
    match: /\b(where|location|based|office|jodhpur|address)\b/i,
    answer: "We're based in Jodhpur, Rajasthan, India.",
  },
  {
    match: /\b(fake|real|verify|verified|genuine|bought followers)\b/i,
    answer: "Every listed creator is checked before they go live in the directory — we look at engagement and content history, not just a follower count.",
  },
  {
    match: /\b(talk to (a )?creator|contact (a )?creator directly|dm)\b/i,
    answer: "Not until a match is finalised — we mediate every application and introduction ourselves so nothing gets lost or ghosted.",
  },
];

// Anything matching this should never get a canned answer -- it's a
// negotiation, a contract term, or a payment specific to one deal, and
// per the coordination rules for this agent system, that always goes to
// a human rather than getting answered on the agent's own authority.
const LEAD_AGENT_ESCALATE = /\b(negotiate|discount|custom (price|pricing|deal|quote)|lower the fee|refund|invoice|contract|dispute|cancel my|chargeback|legal)\b/i;

const LEAD_AGENT_HIGH_INTENT = /\b(sign ?up|apply|hire|budget|campaign|collab|quote|interested|work with|book|get started)\b/i;

function leadAgentInit() {
  if (document.querySelector(".dash-shell")) return;
  if (document.getElementById("leadAgentLauncher")) return;
  if (typeof supabaseClient === "undefined") return;

  const root = document.createElement("div");
  root.innerHTML = `
    <button class="lead-agent-launcher" id="leadAgentLauncher" aria-label="Chat with Creatopz" aria-expanded="false">
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M21 11.5a8.5 8.5 0 0 1-12.36 7.55L4 20l1.1-4.5A8.5 8.5 0 1 1 21 11.5z"/><circle cx="9" cy="11.5" r="1"/><circle cx="12" cy="11.5" r="1"/><circle cx="15" cy="11.5" r="1"/></svg>
    </button>
    <div class="lead-agent-panel" id="leadAgentPanel" role="dialog" aria-label="Creatopz assistant" hidden>
      <div class="lead-agent-head">
        <div><b>Creatopz Assistant</b><div class="lead-agent-sub">Rule-based — for anything else, our team follows up</div></div>
        <button class="lead-agent-close" id="leadAgentClose" aria-label="Close">&times;</button>
      </div>
      <div class="lead-agent-body" id="leadAgentBody"></div>
      <div class="lead-agent-quick" id="leadAgentQuick"></div>
      <form class="lead-agent-input" id="leadAgentForm">
        <input id="leadAgentText" placeholder="Ask a question…" autocomplete="off">
        <button type="submit" aria-label="Send">→</button>
      </form>
      <a class="lead-agent-wa" href="https://wa.me/918005673683?text=Hi%20Creatopz%2C%20I%20have%20a%20question" target="_blank" rel="noopener">or chat with us on WhatsApp →</a>
    </div>
  `;
  document.body.appendChild(root);

  const launcher = document.getElementById("leadAgentLauncher");
  const panel = document.getElementById("leadAgentPanel");
  const closeBtn = document.getElementById("leadAgentClose");
  const body = document.getElementById("leadAgentBody");
  const quick = document.getElementById("leadAgentQuick");
  const form = document.getElementById("leadAgentForm");
  const input = document.getElementById("leadAgentText");

  let opened = false;
  let unmatchedCount = 0;
  let leadFormShown = false;
  const conversationLog = [];

  function addMessage(role, html) {
    const div = document.createElement("div");
    div.className = "lead-agent-msg " + role;
    div.innerHTML = html;
    body.appendChild(div);
    body.scrollTop = body.scrollHeight;
    return div;
  }

  // items: array of strings (sent as if typed) or {label, action} (runs
  // action instead, e.g. jumping straight to the lead form).
  function setQuickReplies(items) {
    quick.innerHTML = items.map((it) => `<button type="button" class="lead-agent-chip">${escapeHtml(typeof it === "string" ? it : it.label)}</button>`).join("");
    quick.querySelectorAll(".lead-agent-chip").forEach((btn, i) => {
      const it = items[i];
      btn.addEventListener("click", () => {
        if (typeof it === "object" && it.action) it.action();
        else handleUserText(it);
      });
    });
  }

  const talkToTeamChip = {
    label: "Talk to our team",
    action: () => { addMessage("user", "Talk to our team"); setQuickReplies([]); showLeadForm("", false); },
  };

  function showLeadForm(prefillNeed, needsHumanReview) {
    if (leadFormShown) return;
    leadFormShown = true;
    setQuickReplies([]);
    const card = addMessage("bot", `
      <div class="lead-agent-form-card">
        <div>Leave your details and our team will follow up personally.</div>
        <input class="lead-agent-field" id="lfName" placeholder="Your name">
        <input class="lead-agent-field" id="lfContact" placeholder="Email, phone, or Instagram handle">
        <textarea class="lead-agent-field" id="lfNeed" rows="2" placeholder="What do you need?">${escapeHtml(prefillNeed || "")}</textarea>
        <button type="button" class="lead-agent-submit" id="lfSubmit">Send to the team</button>
      </div>
    `);
    card.querySelector("#lfSubmit").addEventListener("click", async () => {
      const name = card.querySelector("#lfName").value.trim();
      const contact = card.querySelector("#lfContact").value.trim();
      const need = card.querySelector("#lfNeed").value.trim();
      if (!name || !contact || !need) {
        addMessage("bot", "I need your name, a way to reach you, and what you need before I can send this over.");
        return;
      }
      const submitBtn = card.querySelector("#lfSubmit");
      submitBtn.disabled = true;
      submitBtn.textContent = "Sending…";
      const highIntent = LEAD_AGENT_HIGH_INTENT.test(conversationLog.join(" ") + " " + need);
      const { error } = await supabaseClient.from("leads").insert({
        name, contact, need,
        source_page: window.location.pathname.split("/").pop() || "index.html",
        high_intent: highIntent,
        needs_human_review: needsHumanReview,
      });
      if (error) {
        submitBtn.disabled = false;
        submitBtn.textContent = "Send to the team";
        addMessage("bot", "That didn't go through — mind trying again in a moment, or reaching us on WhatsApp below?");
        return;
      }
      card.querySelectorAll("input, textarea, button").forEach((el) => (el.disabled = true));
      submitBtn.textContent = "Sent ✓";
      addMessage("bot", `Thanks, ${escapeHtml(name.split(" ")[0])}! Our team will reach out at ${escapeHtml(contact)} soon.`);
    });
  }

  function handleUserText(text) {
    text = String(text).trim();
    if (!text) return;
    conversationLog.push(text);
    addMessage("user", escapeHtml(text));
    setQuickReplies([]);

    if (LEAD_AGENT_ESCALATE.test(text)) {
      addMessage("bot", "That's something our team should walk you through directly rather than me guessing.");
      showLeadForm(text, true);
      return;
    }

    const hit = LEAD_AGENT_FAQ.find((f) => f.match.test(text));
    if (hit) {
      unmatchedCount = 0;
      addMessage("bot", hit.answer);
      setQuickReplies([{ label: "Still need help? Leave your details", action: () => { setQuickReplies([]); showLeadForm("", false); } }]);
      return;
    }

    unmatchedCount++;
    if (unmatchedCount >= 2) {
      addMessage("bot", "I don't want to keep guessing — let me get our team to help with this one.");
      showLeadForm(text, false);
    } else {
      addMessage("bot", "I'm not sure about that one. Try asking about the platform fee, how it works, applying as a creator, or posting a brief — or leave your details and we'll follow up.");
      setQuickReplies(["What's the platform fee?", "How does it work?", talkToTeamChip]);
    }
  }

  function greet() {
    if (body.children.length) return;
    addMessage("bot", "Hi! I'm the Creatopz assistant. Ask me anything about the platform, or leave your details and our team will reach out.");
    setQuickReplies(["What's the platform fee?", "How does it work?", "I'm a creator", "I'm a brand", talkToTeamChip]);
  }

  function openPanel() {
    opened = true;
    panel.hidden = false;
    launcher.setAttribute("aria-expanded", "true");
    greet();
    input.focus();
  }
  function closePanel() {
    opened = false;
    panel.hidden = true;
    launcher.setAttribute("aria-expanded", "false");
  }

  launcher.addEventListener("click", () => (opened ? closePanel() : openPanel()));
  closeBtn.addEventListener("click", closePanel);
  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape" && opened) closePanel();
  });
  form.addEventListener("submit", (e) => {
    e.preventDefault();
    const text = input.value;
    input.value = "";
    handleUserText(text);
  });
}

document.addEventListener("DOMContentLoaded", leadAgentInit);
