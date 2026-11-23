// ---------------------------
// German Flashcards (with examples + type menu)
// - SM-2 spaced repetition
// - SpeechSynthesis pronunciation
// - Loads CSV with columns: de,en,type,example,example_en
// - Type filter menu (multi-select + select all)
// ---------------------------

const STORAGE_KEY = "de_flashcards_state_v3";
const CSV_URL_KEY = "de_flashcards_csv_url_v1";
const AUTOSPEAK_KEY = "de_flashcards_autospeak_v1";
const TYPES_KEY = "de_flashcards_selected_types_v1";
const CASE_FILTER_KEY = "de_flashcards_selected_grammar_cases_v1";

// If this file exists alongside index.html, it will be auto-loaded:
const DEFAULT_CSV_FILENAME = "flashcard_final_with_examples.csv";

// Fallback tiny deck
const FALLBACK_CARDS = [
  { de: "Hallo", en: "Hello", type: "other", example: "Hallo! Wie geht's?", example_en: "Hello! How are you?" },
  { de: "Danke", en: "Thanks", type: "other", example: "Danke für deine Hilfe.", example_en: "Thanks for your help." }
];

function nowMs() { return Date.now(); }
function clamp(n, lo, hi) { return Math.max(lo, Math.min(hi, n)); }

// ---------- SM-2 ----------
function initProgressForCards(cards) {
  const t = nowMs();
  return cards.map(() => ({
    reps: 0,
    intervalDays: 0,
    ease: 2.5,
    dueMs: t
  }));
}

function sm2Update(p, quality) {
  const q = clamp(quality, 0, 5);
  let { reps, intervalDays, ease } = p;

  if (q < 3) {
    reps = 0;
    intervalDays = 0;
    ease = Math.max(1.3, ease - 0.2);
    return { reps, intervalDays, ease, dueMs: nowMs() + 5 * 60 * 1000 }; // 5 min
  }

  reps += 1;
  if (reps === 1) intervalDays = 1;
  else if (reps === 2) intervalDays = 6;
  else intervalDays = Math.round(intervalDays * ease);

  ease = ease + (0.1 - (5 - q) * (0.08 + (5 - q) * 0.02));
  ease = Math.max(1.3, ease);

  return {
    reps,
    intervalDays,
    ease,
    dueMs: nowMs() + intervalDays * 24 * 60 * 60 * 1000
  };
}

// ---------- CSV parsing ----------
function parseCSV(text) {
  const rows = [];
  let row = [], cur = "", inQuotes = false;

  for (let i = 0; i < text.length; i++) {
    const ch = text[i];
    const next = text[i + 1];

    if (ch === '"') {
      if (inQuotes && next === '"') { cur += '"'; i++; }
      else inQuotes = !inQuotes;
    } else if (ch === "," && !inQuotes) {
      row.push(cur); cur = "";
    } else if ((ch === "\n" || ch === "\r") && !inQuotes) {
      if (ch === "\r" && next === "\n") i++;
      row.push(cur); rows.push(row);
      row = []; cur = "";
    } else {
      cur += ch;
    }
  }
  if (cur.length || row.length) { row.push(cur); rows.push(row); }
  return rows;
}

function rowsToCards(rows) {
  if (!rows.length) return [];
  const headers = rows[0].map(h => (h || "").trim().toLowerCase());

  const idx = (name) => headers.indexOf(name);
  const deI = idx("de");
  const enI = idx("en");
  const typeI = idx("type");
  const exI = idx("example");
  const exEnI = idx("example_en");
  const caseI = idx("case_type");
  const noteI = idx("grammar_note");

  const get = (r, i, fallback = "") => (i >= 0 ? (r[i] || "") : fallback);

  return rows.slice(1)
    .map(r => ({
      de: get(r, deI, r[0] || "").trim(),
      en: get(r, enI, r[1] || "").trim(),
      type: (get(r, typeI, "other") || "other").trim().toLowerCase(),
      example: (get(r, exI, "") || "").trim(),
      example_en: (get(r, exEnI, "") || "").trim(),
      caseType: (get(r, caseI, "") || "").trim().toLowerCase(),
      grammarNote: (get(r, noteI, "") || "").trim(),
    }))
    .filter(c => c.de && c.en);
}

async function loadCardsFromCSVUrl(url) {
  const res = await fetch(url, { cache: "no-store" });
  if (!res.ok) throw new Error(`CSV fetch failed (${res.status})`);
  const text = await res.text();
  const cards = rowsToCards(parseCSV(text));
  if (!cards.length) throw new Error("No valid cards found in CSV.");
  return cards;
}

async function tryAutoLoadLocalCSV() {
  try {
    const cards = await loadCardsFromCSVUrl(DEFAULT_CSV_FILENAME);
    return cards;
  } catch {
    return null;
  }
}

// ---------- Grammar enrichment and progress migration ----------
function cardIdentity(c) {
  if (c.grammarId) return "grammar:" + c.grammarId;
  return "vocab:" + [c.type || "other", c.de, c.en].join("|").toLowerCase();
}

function extendWithGrammar(cards) {
  const grammar = window.GERMAN_GRAMMAR || { pronounCards: [], verbCards: [] };
  const verbMap = new Map(grammar.verbCards.map(v => [v.de.toLowerCase(), v]));
  const baseCards = cards.filter(c => c && c.de && c.en && !c.grammarId);
  const existingVerbs = new Set();

  const enriched = baseCards.map(c => {
    const copy = { ...c };
    const verbName = (c.de || "").trim().toLowerCase();
    if ((c.type || "").toLowerCase() === "verb") {
      existingVerbs.add(verbName);
      const info = verbMap.get(verbName);
      if (info) {
        copy.caseType = info.caseType;
        copy.grammarNote = info.grammarNote;
        copy.caseExample = info.example;
        copy.caseExampleEn = info.example_en;
      }
    }
    return copy;
  });

  // Preserve existing vocabulary, adding verb cards only when absent.
  const extraVerbs = grammar.verbCards
    .filter(v => !existingVerbs.has(v.de.toLowerCase()))
    .map(v => ({ ...v }));
  return [...enriched, ...grammar.pronounCards.map(c => ({ ...c })), ...extraVerbs];
}

function reconcileStudyState(previous, cards) {
  const oldProgress = new Map();
  (previous.cards || []).forEach((c, i) => {
    const key = cardIdentity(c);
    if (!oldProgress.has(key) && previous.progress && previous.progress[i]) {
      oldProgress.set(key, previous.progress[i]);
    }
  });
  const fresh = initProgressForCards(cards);
  const progress = cards.map((c, i) => oldProgress.get(cardIdentity(c)) || fresh[i]);
  const allTypes = uniqueTypes(cards);
  const savedTypes = loadSavedTypes();
  const previousTypes = savedTypes && savedTypes.length ? savedTypes : previous.selectedTypes;
  const selectedTypes = Array.isArray(previousTypes) && previousTypes.length
    ? previousTypes.filter(t => allTypes.includes(t.toLowerCase()))
    : allTypes;

  const lastCard = previous.cards && previous.cards[previous.lastIndex];
  const lastIndex = lastCard
    ? cards.findIndex(c => cardIdentity(c) === cardIdentity(lastCard))
    : -1;

  return {
    version: 4,
    cards,
    progress,
    lastIndex,
    selectedTypes: selectedTypes.length ? selectedTypes : allTypes,
    selectedCaseFilters: loadCaseFilters() || previous.selectedCaseFilters || []
  };
}

// ---------- Speech ----------
function pickGermanVoice() {
  const voices = speechSynthesis.getVoices();
  return voices.find(v => (v.lang || "").toLowerCase().startsWith("de"))
      || voices.find(v => (v.name || "").toLowerCase().includes("german"))
      || null;
}

function speakGerman(text, rate = 1.0) {
  if (!("speechSynthesis" in window)) {
    alert("Speech not supported in this browser.");
    return;
  }
  speechSynthesis.cancel();
  const u = new SpeechSynthesisUtterance(text);
  u.lang = "de-DE";
  u.rate = rate;
  const v = pickGermanVoice();
  if (v) u.voice = v;
  speechSynthesis.speak(u);
}

document.addEventListener("click", () => speechSynthesis.getVoices(), { once: true });
speechSynthesis.onvoiceschanged = () => speechSynthesis.getVoices();

// ---------- Persistence / State ----------
function initState(cards) {
  const types = uniqueTypes(cards);
  const savedTypes = loadSavedTypes();
  const selectedTypes = (savedTypes && savedTypes.length) ? savedTypes : types; // default: all

  return {
    version: 3,
    cards,
    progress: initProgressForCards(cards),
    lastIndex: -1,
    selectedTypes,
    selectedCaseFilters: loadCaseFilters() || []
  };
}

function loadState() {
  const raw = localStorage.getItem(STORAGE_KEY);
  if (!raw) return initState(FALLBACK_CARDS);

  try {
    const s = JSON.parse(raw);
    if (!s.cards || !Array.isArray(s.cards) || !s.cards.length) return initState(FALLBACK_CARDS);

    if (!s.progress || s.progress.length !== s.cards.length) {
      s.progress = initProgressForCards(s.cards);
    } else {
      const t = nowMs();
      s.progress = s.progress.map(p => ({
        reps: Number.isFinite(p.reps) ? p.reps : 0,
        intervalDays: Number.isFinite(p.intervalDays) ? p.intervalDays : 0,
        ease: Number.isFinite(p.ease) ? Math.max(1.3, p.ease) : 2.5,
        dueMs: Number.isFinite(p.dueMs) ? p.dueMs : t
      }));
    }

    const types = uniqueTypes(s.cards);
    const savedTypes = loadSavedTypes();
    s.selectedTypes = (savedTypes && savedTypes.length) ? savedTypes : (s.selectedTypes && s.selectedTypes.length ? s.selectedTypes : types);

    if (!Number.isFinite(s.lastIndex)) s.lastIndex = -1;
    if (!Array.isArray(s.selectedCaseFilters)) s.selectedCaseFilters = loadCaseFilters() || [];
    return s;
  } catch {
    return initState(FALLBACK_CARDS);
  }
}

function saveState() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
}

function saveSelectedTypes(types) {
  localStorage.setItem(TYPES_KEY, JSON.stringify(types));
}

function loadSavedTypes() {
  try {
    const raw = localStorage.getItem(TYPES_KEY);
    if (!raw) return null;
    const arr = JSON.parse(raw);
    return Array.isArray(arr) ? arr : null;
  } catch {
    return null;
  }
}

function saveCaseFilters(filters) {
  localStorage.setItem(CASE_FILTER_KEY, JSON.stringify(filters));
}
function loadCaseFilters() {
  try {
    const raw = localStorage.getItem(CASE_FILTER_KEY);
    const parsed = raw ? JSON.parse(raw) : null;
    return Array.isArray(parsed) ? parsed : null;
  } catch {
    return null;
  }
}

// ---------- Type filtering helpers ----------
function uniqueTypes(cards) {
  const set = new Set(cards.map(c => (c.type || "other").toLowerCase().trim()));
  return [...set].filter(Boolean).sort();
}

function activeIndicesForSelectedTypes() {
  const selected = new Set((state.selectedTypes || []).map(t => t.toLowerCase()));
  const idxs = [];
  for (let i = 0; i < state.cards.length; i++) {
    const t = (state.cards[i].type || "other").toLowerCase();
    if (!selected.has(t)) continue;
    const caseFocus = state.selectedCaseFilters || [];
    const c = state.cards[i];
    if (caseFocus.length && !caseFocus.includes(c.type + ":" + c.caseType)) continue;
    idxs.push(i);
  }
  return idxs;
}

// ---------- Scheduling (uses only active subset) ----------
function pickNextIndex(state, lastIndex) {
  const t = nowMs();
  const prog = state.progress;
  const active = activeIndicesForSelectedTypes();

  if (!active.length) return -1;

  // ✅ Find all cards that are due
  const due = active.filter(i => prog[i].dueMs <= t);

  // ✅ If any due, pick RANDOM due card
  if (due.length) {
    let choices = due;

    // Avoid immediate repeat if possible
    if (due.length > 1 && lastIndex >= 0) {
      choices = due.filter(i => i !== lastIndex);
      if (!choices.length) choices = due;
    }

    return choices[Math.floor(Math.random() * choices.length)];
  }

  // ✅ If none due yet, pick random active card anyway
  let choices = active;
  if (active.length > 1 && lastIndex >= 0) {
    choices = active.filter(i => i !== lastIndex);
    if (!choices.length) choices = active;
  }

  return choices[Math.floor(Math.random() * choices.length)];
}


function dueCountActive() {
  const t = nowMs();
  const active = activeIndicesForSelectedTypes();
  return active.filter(i => state.progress[i].dueMs <= t).length;
}

function formatDue(ms) {
  const t = nowMs();
  const diff = ms - t;
  if (diff <= 0) return "due now";
  const mins = Math.round(diff / 60000);
  if (mins < 60) return `due in ~${mins}m`;
  const hours = Math.round(mins / 60);
  if (hours < 36) return `due in ~${hours}h`;
  const days = Math.round(hours / 24);
  return `due in ~${days}d`;
}

// ---------- UI elements ----------
const frontText = document.getElementById("frontText");
const answerBlock = document.getElementById("answerBlock");
const backText  = document.getElementById("backText");
const exDe = document.getElementById("exDe");
const exEn = document.getElementById("exEn");

const flipBtn   = document.getElementById("flipBtn");
const rightBtn  = document.getElementById("rightBtn");
const wrongBtn  = document.getElementById("wrongBtn");
const resetBtn  = document.getElementById("resetBtn");
const statusLine = document.getElementById("statusLine");
const typeTag = document.getElementById("typeTag");
const grammarNoteEl = document.getElementById("grammarNote");
const grammarExDe = document.getElementById("grammarExDe");
const grammarExEn = document.getElementById("grammarExEn");

const speakBtn = document.getElementById("speakBtn");
const speakSlowBtn = document.getElementById("speakSlowBtn");
const autoSpeakToggle = document.getElementById("autoSpeakToggle");

const exportBtn = document.getElementById("exportBtn");
const importBtn = document.getElementById("importBtn");
const jsonBox   = document.getElementById("jsonBox");

const csvUrl = document.getElementById("csvUrl");
const saveCsvBtn = document.getElementById("saveCsvBtn");
const refreshCsvBtn = document.getElementById("refreshCsvBtn");
const csvFileInput = document.getElementById("csvFileInput");

// Menu overlay UI
const menuOverlay = document.getElementById("menuOverlay");
const typeList = document.getElementById("typeList");
const caseList = document.getElementById("caseList");
const clearCaseBtn = document.getElementById("clearCaseBtn");
const selectAllCasesBtn = document.getElementById("selectAllCasesBtn");
const caseSelectionStatus = document.getElementById("caseSelectionStatus");
const startBtn = document.getElementById("startBtn");
const menuBtn = document.getElementById("menuBtn");
const selectAllBtn = document.getElementById("selectAllBtn");
const selectNoneBtn = document.getElementById("selectNoneBtn");

// ---------- App ----------
let state = loadState();
let currentIndex = -1;
let showingAnswer = false;

function showMenu() {
  buildTypeList();
  menuOverlay.classList.remove("hidden");
}

function hideMenu() {
  menuOverlay.classList.add("hidden");
}

function buildTypeList() {
  const types = uniqueTypes(state.cards);
  const selected = new Set((state.selectedTypes || []).map(t => t.toLowerCase()));

  typeList.innerHTML = "";
  for (const t of types) {
    const id = `type_${t.replace(/[^a-z0-9]+/g, "_")}`;
    const div = document.createElement("label");
    div.className = "typeItem";
    div.innerHTML = `
      <input type="checkbox" id="${id}" ${selected.has(t) ? "checked" : ""} />
      <span>${t}</span>
    `;
    typeList.appendChild(div);
  }

  const options = [
    ["pronoun:nominative", "Pronouns – nominative"],
    ["pronoun:accusative", "Pronouns – accusative"],
    ["pronoun:dative", "Pronouns – dative"],
    ["verb:dative", "Verbs – dative"],
    ["verb:accusative", "Verbs – accusative"],
    ["verb:both", "Verbs – dative + accusative"]
  ];
  const active = new Set(state.selectedCaseFilters || []);
  caseList.innerHTML = "";
  for (const [value, label] of options) {
    const row = document.createElement("label");
    row.className = "typeItem";
    const check = document.createElement("input");
    check.type = "checkbox";
    check.value = value;
    check.checked = active.has(value);
    const labelEl = document.createElement("span");
    labelEl.textContent = label;
    row.append(check, labelEl);
    caseList.appendChild(row);
  }
  updateCaseSelectionStatus();
}

function updateCaseSelectionStatus() {
  const count = readSelectedCasesFromUI().length;
  caseSelectionStatus.textContent = count === 0
    ? "No case filter: all selected word types available."
    : count === 6
      ? "All six grammar cases selected."
      : count + " of 6 grammar cases selected.";
}

caseList.addEventListener("change", updateCaseSelectionStatus);

function readSelectedTypesFromUI() {
  const checks = typeList.querySelectorAll("input[type=checkbox]");
  const types = [];
  checks.forEach(ch => {
    if (ch.checked) {
      const label = ch.parentElement.querySelector("span")?.textContent?.trim();
      if (label) types.push(label.toLowerCase());
    }
  });
  return types;
}

function readSelectedCasesFromUI() {
  return [...caseList.querySelectorAll('input[type="checkbox"]:checked')].map(el => el.value);
}
function caseLabel(caseType) {
  return caseType === "both" ? "DATIVE + ACCUSATIVE" : (caseType || "").toUpperCase();
}
function renderTypeTag(c, revealCase = false) {
  // Pronouns show their case on the front; verb case appears with the answer.
  typeTag.textContent = (c.type || "other").toUpperCase()
    + (c.caseType && (c.type === "pronoun" || revealCase)
      ? " · " + caseLabel(c.caseType) : "");
}

function renderCard() {
  const active = activeIndicesForSelectedTypes();

  if (currentIndex < 0 || !state.cards.length || !active.length) {
    statusLine.textContent = active.length ? "Loading…" : "No cards match your selected types. Open Menu and select more.";
    frontText.textContent = active.length ? "…" : "No matching cards";
    typeTag.textContent = "";
    answerBlock.classList.add("hidden");
    flipBtn.textContent = "Show answer";
    return;
  }

  const c = state.cards[currentIndex];
  const p = state.progress[currentIndex];

  frontText.textContent = c.de;
  // ✅ Show the word type on the card
renderTypeTag(c);


  // Hide answer by default
  showingAnswer = false;
  answerBlock.classList.add("hidden");
  flipBtn.textContent = "Show answer";

  statusLine.textContent =
    `Types: ${state.selectedTypes.length} selected • Due: ${dueCountActive()}/${active.length} • This card: ${formatDue(p.dueMs)}`;

  // Auto-speak
  if (autoSpeakToggle.checked) {
    setTimeout(() => speakGerman(c.de, 1.0), 120);
  }
}

function showAnswer() {
  const c = state.cards[currentIndex];
  backText.textContent = c.en;
  renderTypeTag(c, true);

  const explanation = c.caseType === "both"
    ? "Dative recipient + accusative thing in this example."
    : c.caseType === "dative" ? "The person concerned is dative."
    : c.caseType === "accusative" ? "The direct object is accusative." : "";
  grammarNoteEl.textContent = c.grammarNote || (c.type === "verb" ? explanation : "");
  grammarExDe.textContent = c.caseExample ? "Case example: " + c.caseExample : "";
  grammarExEn.textContent = c.caseExampleEn || "";
  document.getElementById("grammarDetails").classList.toggle("hidden",
    !(grammarNoteEl.textContent || grammarExDe.textContent || grammarExEn.textContent));

  exDe.textContent = c.example ? `DE: ${c.example}` : "";
  exEn.textContent = c.example_en ? `EN: ${c.example_en}` : "";

  // Only show example block if at least one exists
  const hasExample = Boolean((c.example && c.example.trim()) || (c.example_en && c.example_en.trim()));
  document.querySelector(".examples").style.display = hasExample ? "block" : "none";

  answerBlock.classList.remove("hidden");
}

function nextCard() {
  state.lastIndex = currentIndex;
  currentIndex = pickNextIndex(state, state.lastIndex);
  saveState();
  renderCard();
}

// ---------- Events ----------
flipBtn.addEventListener("click", () => {
  if (currentIndex < 0) return;
  showingAnswer = !showingAnswer;
  if (showingAnswer) {
    showAnswer();
    flipBtn.textContent = "Hide answer";
  } else {
    answerBlock.classList.add("hidden");
    renderTypeTag(state.cards[currentIndex]);
    flipBtn.textContent = "Show answer";
  }
});

speakBtn.addEventListener("click", () => {
  if (currentIndex < 0) return;
  speakGerman(state.cards[currentIndex].de, 1.0);
});
speakSlowBtn.addEventListener("click", () => {
  if (currentIndex < 0) return;
  speakGerman(state.cards[currentIndex].de, 0.85);
});

rightBtn.addEventListener("click", () => {
  if (currentIndex < 0) return;
  state.progress[currentIndex] = sm2Update(state.progress[currentIndex], 4);
  nextCard();
});

wrongBtn.addEventListener("click", () => {
  if (currentIndex < 0) return;
  state.progress[currentIndex] = sm2Update(state.progress[currentIndex], 2);
  nextCard();
});

resetBtn.addEventListener("click", () => {
  if (!confirm("Reset all progress (deck + types stay the same)?")) return;
  state.progress = initProgressForCards(state.cards);
  state.lastIndex = -1;
  saveState();
  currentIndex = pickNextIndex(state, -1);
  renderCard();
});

// Autospeak persistence
autoSpeakToggle.checked = localStorage.getItem(AUTOSPEAK_KEY) === "1";
autoSpeakToggle.addEventListener("change", () => {
  localStorage.setItem(AUTOSPEAK_KEY, autoSpeakToggle.checked ? "1" : "0");
});

// CSV URL persistence
csvUrl.value = localStorage.getItem(CSV_URL_KEY) || "";
saveCsvBtn.addEventListener("click", () => {
  localStorage.setItem(CSV_URL_KEY, csvUrl.value.trim());
  alert("Saved CSV URL.");
});

refreshCsvBtn.addEventListener("click", async () => {
  const url = (csvUrl.value || "").trim();
  if (!url) return alert("Paste a CSV URL first.");
  try {
    const cards = await loadCardsFromCSVUrl(url);
    state = initState(extendWithGrammar(cards));
    state.selectedCaseFilters = [];
    saveCaseFilters([]);
    saveSelectedTypes(state.selectedTypes);
    saveState();
    currentIndex = pickNextIndex(state, -1);
    renderCard();
    showMenu(); // let them choose types for the new deck
    alert(`Loaded ${cards.length} cards from CSV link.`);
  } catch (e) {
    alert("Refresh failed: " + e.message);
  }
});

// CSV file import (iPhone Files)
csvFileInput.addEventListener("change", async () => {
  const file = csvFileInput.files && csvFileInput.files[0];
  if (!file) return;

  try {
    const text = await file.text();
    const cards = rowsToCards(parseCSV(text));
    if (!cards.length) throw new Error("No valid cards found in this CSV.");

    state = initState(extendWithGrammar(cards));
    state.selectedCaseFilters = [];
    saveCaseFilters([]);
    saveSelectedTypes(state.selectedTypes);
    saveState();
    currentIndex = pickNextIndex(state, -1);
    renderCard();
    showMenu();
    alert(`Imported ${cards.length} cards from file.`);
  } catch (e) {
    alert("Import failed: " + e.message);
  } finally {
    csvFileInput.value = "";
  }
});

// JSON export/import
exportBtn.addEventListener("click", () => {
  const payload = { cards: state.cards };
  jsonBox.value = JSON.stringify(payload, null, 2);
});

importBtn.addEventListener("click", () => {
  try {
    const obj = JSON.parse(jsonBox.value);
    if (!obj.cards || !Array.isArray(obj.cards)) throw new Error("Missing cards array");

    const cards = obj.cards
      .filter(c => c && typeof c.de === "string" && typeof c.en === "string")
      .map(c => ({
        de: c.de.trim(),
        en: c.en.trim(),
        type: (c.type || "other").toString().trim().toLowerCase(),
        example: (c.example || "").toString().trim(),
        example_en: (c.example_en || "").toString().trim(),
        grammarId: (c.grammarId || "").toString().trim(),
        caseType: (c.caseType || "").toString().trim().toLowerCase(),
        grammarNote: (c.grammarNote || "").toString().trim(),
      }))
      .filter(c => c.de && c.en);

    if (!cards.length) throw new Error("No valid cards found");

    state = initState(extendWithGrammar(cards));
    state.selectedCaseFilters = [];
    saveCaseFilters([]);
    saveSelectedTypes(state.selectedTypes);
    saveState();
    currentIndex = pickNextIndex(state, -1);
    renderCard();
    showMenu();
  } catch (e) {
    alert("Import failed: " + e.message);
  }
});

// Menu overlay interactions
menuBtn.addEventListener("click", showMenu);

selectAllBtn.addEventListener("click", () => {
  const checks = typeList.querySelectorAll("input[type=checkbox]");
  checks.forEach(ch => ch.checked = true);
});

selectNoneBtn.addEventListener("click", () => {
  const checks = typeList.querySelectorAll("input[type=checkbox]");
  checks.forEach(ch => ch.checked = false);
});
selectAllCasesBtn.addEventListener("click", () => {
  caseList.querySelectorAll('input[type="checkbox"]').forEach(ch => ch.checked = true);
  updateCaseSelectionStatus();
});
clearCaseBtn.addEventListener("click", () => {
  caseList.querySelectorAll('input[type="checkbox"]').forEach(ch => ch.checked = false);
  updateCaseSelectionStatus();
});

startBtn.addEventListener("click", () => {
  const selected = readSelectedTypesFromUI();
  const selectedCases = readSelectedCasesFromUI();
  // A case-focus choice automatically includes its associated word type.
  // For example, Pronouns – dative works even when the pronoun type is unticked above.
  for (const caseFocus of selectedCases) {
    const type = caseFocus.split(":")[0];
    if (!selected.includes(type)) selected.push(type);
  }
  if (!selected.length) {
    alert("Select at least one word type or grammar case.");
    return;
  }
  state.selectedTypes = selected;
  state.selectedCaseFilters = selectedCases;
  saveSelectedTypes(selected);
  saveCaseFilters(state.selectedCaseFilters);
  saveState();

  currentIndex = pickNextIndex(state, state.lastIndex);
  hideMenu();
  renderCard();
});

// ---------- Startup ----------
(async function start() {
  // Try to auto-load local CSV file if it exists on the same host
  const cards = await tryAutoLoadLocalCSV();
  state = reconcileStudyState(state, extendWithGrammar(cards && cards.length ? cards : state.cards));
  saveState();

  currentIndex = pickNextIndex(state, state.lastIndex);
  renderCard();

  // Always show menu on first load (or if types missing)
  showMenu();
})();
