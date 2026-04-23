const T = {
  es: {
    title: "Respiración guiada",
    sub: "Inhala · retén · exhala · vacío — con señales opcionales.",
    in: "Inhala (s)",
    h1: "Retén (s)",
    ex: "Exhala (s)",
    h2: "Vacío (s)",
    beep: "Pitido al cambio",
    voice: "Voz guía",
    start: "Iniciar",
    stop: "Detener",
    phases: ["Inhala", "Retén", "Exhala", "Vacío"],
    breathTab: "Respiración",
    yogaTab: "Yoga",
    yogaIntro: "Secuencia suave — mantené cada postura con respiración nasal.",
    hold: "Mantener durante",
    unl: "Sin límite",
    min5: "5 min",
    min10: "10 min",
    min15: "15 min",
    done: "Sesión completa",
    zen: "Respira. El silencio también es un mantra.",
    voiceGender: "Tipo de voz",
    female: "Femenina",
    male: "Masculina",
  },
  en: {
    title: "Guided breathing",
    sub: "Inhale · hold · exhale · empty — optional cues.",
    in: "Inhale (s)",
    h1: "Hold (s)",
    ex: "Exhale (s)",
    h2: "Empty (s)",
    beep: "Beep on change",
    voice: "Voice cue",
    start: "Start",
    stop: "Stop",
    phases: ["Inhale", "Hold", "Exhale", "Empty"],
    breathTab: "Breath",
    yogaTab: "Yoga",
    yogaIntro: "Gentle sequence — hold each pose with nasal breathing.",
    hold: "Hold for",
    unl: "No limit",
    min5: "5 min",
    min10: "10 min",
    min15: "15 min",
    done: "Session complete",
    zen: "Breathe. Silence is also a mantra.",
    voiceGender: "Voice type",
    female: "Female",
    male: "Male",
  },
};

const FEMALE_HINTS = [
  "female", "femenina", "femenino", "mujer", "woman",
  "samantha", "karen", "victoria", "monica", "mónica", "paulina",
  "lupe", "marisol", "esperanza", "elena", "isabela", "sabina",
  "zira", "hazel", "fiona", "moira", "tessa", "veena",
  "google español", "google us english", "google uk english female",
];

const MALE_HINTS = [
  "male", "masculino", "masculina", "hombre", "man",
  "diego", "jorge", "daniel", "alex", "fred", "carlos",
  "juan", "miguel", "enrique", "david", "mark", "rishi", "thomas", "guy",
  "google uk english male",
];

const YOGA = {
  es: [
    { n: "Tadasana", d: "Pies juntos, columna larga, hombros abajo." },
    { n: "Urdhva Hastasana", d: "Brazos arriba, palmas enfrentadas o juntas." },
    { n: "Uttanasana", d: "Inclinación hacia adelante, rodillas microflex." },
    { n: "Adho Mukha Svanasana", d: "Perro boca abajo — empujá el suelo." },
    { n: "Balasana", d: "Niño — descanso sobre talones." },
    { n: "Savasana", d: "Boca arriba, palmas arriba, soltar peso." },
  ],
  en: [
    { n: "Mountain", d: "Feet together, tall spine, shoulders down." },
    { n: "Upward salute", d: "Arms overhead, palms facing or together." },
    { n: "Standing fold", d: "Forward fold, soft knees." },
    { n: "Downward dog", d: "Hands and feet grounded, hips high." },
    { n: "Child’s pose", d: "Rest on heels, arms extended or back." },
    { n: "Corpse pose", d: "On your back, palms up, fully release." },
  ],
};

let lang = "es";
let gender = "female";
let tick = null;
let phaseI = 0;
let left = 0;
let seq = [];
let duration = 0;
let elapsed = 0;

function pickVoice() {
  const all = window.speechSynthesis.getVoices();
  if (!all || !all.length) return null;
  const langPrefix = lang === "es" ? "es" : "en";
  const ofLang = all.filter((v) => v.lang && v.lang.toLowerCase().startsWith(langPrefix));
  const pool = ofLang.length ? ofLang : all;
  const hints = gender === "male" ? MALE_HINTS : FEMALE_HINTS;
  const match = pool.find((v) => hints.some((h) => v.name.toLowerCase().includes(h)));
  return match || pool[0] || null;
}

function speak(text) {
  if (!document.getElementById("voice").checked) return;
  window.speechSynthesis.cancel();
  const u = new SpeechSynthesisUtterance(text);
  u.lang = lang === "es" ? "es-AR" : "en-US";
  u.rate = 0.92;
  const v = pickVoice();
  if (v) {
    u.voice = v;
    u.lang = v.lang;
  }
  window.speechSynthesis.speak(u);
}

function beep() {
  if (!document.getElementById("beep").checked) return;
  try {
    const c = new AudioContext();
    const o = c.createOscillator();
    const g = c.createGain();
    o.connect(g);
    g.connect(c.destination);
    o.frequency.value = 880;
    g.gain.setValueAtTime(0.12, c.currentTime);
    g.gain.exponentialRampToValueAtTime(0.001, c.currentTime + 0.12);
    o.start();
    o.stop(c.currentTime + 0.12);
  } catch (_) {}
}

function buzz() {
  if (navigator.vibrate) navigator.vibrate([30, 40, 30]);
}

function applyLang() {
  const x = T[lang];
  document.documentElement.lang = lang;
  document.getElementById("h-title").textContent = x.title;
  document.getElementById("h-sub").textContent = x.sub;
  document.getElementById("lb-in").textContent = x.in;
  document.getElementById("lb-h1").textContent = x.h1;
  document.getElementById("lb-ex").textContent = x.ex;
  document.getElementById("lb-h2").textContent = x.h2;
  document.getElementById("lb-beep").textContent = x.beep;
  document.getElementById("lb-voice").textContent = x.voice;
  document.getElementById("start").textContent = x.start;
  document.getElementById("stop").textContent = x.stop;
  document.getElementById("tab-b").textContent = x.breathTab;
  document.getElementById("tab-y").textContent = x.yogaTab;
  document.getElementById("lb-hold").textContent = x.hold;
  document.getElementById("c-unl").textContent = x.unl;
  document.getElementById("c-5").textContent = x.min5;
  document.getElementById("c-10").textContent = x.min10;
  document.getElementById("c-15").textContent = x.min15;
  document.getElementById("zen-caption").textContent = x.zen;
  document.getElementById("lb-voice-gender").textContent = x.voiceGender;
  document.getElementById("g-f").textContent = x.female;
  document.getElementById("g-m").textContent = x.male;
  renderYoga();
}

function syncVoiceRow() {
  const on = document.getElementById("voice").checked;
  document.getElementById("voice-row").hidden = !on;
}

function fmtTime(totalSeconds) {
  const m = Math.floor(totalSeconds / 60);
  const s = totalSeconds % 60;
  return `${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`;
}

function updateElapsed() {
  const el = document.getElementById("elapsed");
  if (duration > 0) {
    el.hidden = false;
    const remaining = Math.max(0, duration - elapsed);
    el.textContent = `${fmtTime(elapsed)} / ${fmtTime(duration)} · ${fmtTime(remaining)}`;
  } else {
    el.hidden = false;
    el.textContent = fmtTime(elapsed);
  }
}

function renderYoga() {
  const list = document.getElementById("yoga-list");
  list.innerHTML = `<p class="sub" style="margin-bottom:1rem">${T[lang].yogaIntro}</p>`;
  YOGA[lang].forEach((p, i) => {
    const el = document.createElement("div");
    el.className = "pose";
    el.innerHTML = `<h3>${i + 1}. ${p.n}</h3><p>${p.d}</p>`;
    list.appendChild(el);
  });
}

function buildSeq() {
  const i = Math.max(1, parseInt(document.getElementById("in").value, 10) || 4);
  const a = Math.max(0, parseInt(document.getElementById("h1").value, 10) || 0);
  const e = Math.max(1, parseInt(document.getElementById("ex").value, 10) || 4);
  const b = Math.max(0, parseInt(document.getElementById("h2").value, 10) || 0);
  const p = T[lang].phases;
  const s = [];
  s.push({ label: p[0], s: i });
  if (a > 0) s.push({ label: p[1], s: a });
  s.push({ label: p[2], s: e });
  if (b > 0) s.push({ label: p[3], s: b });
  return s;
}

function nextPhase() {
  if (phaseI >= seq.length) phaseI = 0;
  left = seq[phaseI].s;
  document.getElementById("phase").textContent = seq[phaseI].label;
  document.getElementById("num").textContent = String(left);
  speak(seq[phaseI].label);
  beep();
  buzz();
}

function step() {
  elapsed += 1;
  if (duration > 0 && elapsed >= duration) {
    updateElapsed();
    finishSession();
    return;
  }
  left -= 1;
  if (left <= 0) {
    phaseI += 1;
    if (phaseI >= seq.length) phaseI = 0;
    nextPhase();
  } else {
    document.getElementById("num").textContent = String(left);
  }
  updateElapsed();
}

function finishSession() {
  if (tick) window.clearInterval(tick);
  tick = null;
  window.speechSynthesis.cancel();
  document.getElementById("start").hidden = false;
  document.getElementById("stop").hidden = true;
  document.getElementById("phase").textContent = T[lang].done;
  document.getElementById("num").textContent = "0";
  speak(T[lang].done);
  beep();
  buzz();
}

document.getElementById("l-es").onclick = () => {
  lang = "es";
  document.getElementById("l-es").classList.add("is-on");
  document.getElementById("l-en").classList.remove("is-on");
  applyLang();
};
document.getElementById("l-en").onclick = () => {
  lang = "en";
  document.getElementById("l-en").classList.add("is-on");
  document.getElementById("l-es").classList.remove("is-on");
  applyLang();
};

document.getElementById("tab-b").onclick = () => {
  document.getElementById("tab-b").classList.add("is-on");
  document.getElementById("tab-y").classList.remove("is-on");
  document.getElementById("p-breath").classList.add("is-on");
  document.getElementById("p-yoga").classList.remove("is-on");
};
document.getElementById("tab-y").onclick = () => {
  document.getElementById("tab-y").classList.add("is-on");
  document.getElementById("tab-b").classList.remove("is-on");
  document.getElementById("p-yoga").classList.add("is-on");
  document.getElementById("p-breath").classList.remove("is-on");
};

document.querySelectorAll(".chips-row:not(.chips-row--two) .chip").forEach((btn) => {
  btn.addEventListener("click", () => {
    document.querySelectorAll(".chips-row:not(.chips-row--two) .chip").forEach((b) => b.classList.remove("is-on"));
    btn.classList.add("is-on");
    duration = parseInt(btn.dataset.dur, 10) || 0;
  });
});

document.querySelectorAll(".chips-row--two .chip").forEach((btn) => {
  btn.addEventListener("click", () => {
    document.querySelectorAll(".chips-row--two .chip").forEach((b) => b.classList.remove("is-on"));
    btn.classList.add("is-on");
    gender = btn.dataset.gender || "female";
  });
});

document.getElementById("voice").addEventListener("change", syncVoiceRow);

if (typeof window.speechSynthesis !== "undefined") {
  window.speechSynthesis.getVoices();
  window.speechSynthesis.addEventListener("voiceschanged", () => {});
}

document.getElementById("start").onclick = () => {
  window.speechSynthesis.cancel();
  seq = buildSeq();
  if (!seq.length) return;
  phaseI = 0;
  elapsed = 0;
  document.getElementById("start").hidden = true;
  document.getElementById("stop").hidden = false;
  nextPhase();
  updateElapsed();
  tick = window.setInterval(step, 1000);
};

document.getElementById("stop").onclick = () => {
  if (tick) window.clearInterval(tick);
  tick = null;
  window.speechSynthesis.cancel();
  document.getElementById("start").hidden = false;
  document.getElementById("stop").hidden = true;
  document.getElementById("phase").textContent = "—";
  document.getElementById("num").textContent = "0";
  document.getElementById("elapsed").hidden = true;
  elapsed = 0;
};

applyLang();
syncVoiceRow();
