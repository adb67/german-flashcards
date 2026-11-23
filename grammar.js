// Supplementary grammar cards for the existing German vocabulary deck.
// Case labels refer to common bare-object constructions, not every possible use.
const GRAMMAR_PRONOUN_DATA = [
  ["ich", "I / me", "ich", "mich", "mir", ["Ich lerne Deutsch.", "Er sieht mich.", "Er hilft mir."], ["I learn German.", "He sees me.", "He helps me."]],
  ["du", "you (informal singular)", "du", "dich", "dir", ["Du lernst Deutsch.", "Ich sehe dich.", "Ich antworte dir."], ["You learn German.", "I see you.", "I reply to you."]],
  ["er", "he / him", "er", "ihn", "ihm", ["Er kommt morgen.", "Ich sehe ihn.", "Ich helfe ihm."], ["He is coming tomorrow.", "I see him.", "I help him."]],
  ["sie (she)", "she / her", "sie", "sie", "ihr", ["Sie kommt morgen.", "Ich sehe sie.", "Ich helfe ihr."], ["She is coming tomorrow.", "I see her.", "I help her."]],
  ["es", "it", "es", "es", "ihm", ["Es ist neu.", "Ich kaufe es.", "Das Pferd ist krank. Ich helfe ihm."], ["It is new.", "I am buying it.", "The horse is ill. I help it."]],
  ["wir", "we / us", "wir", "uns", "uns", ["Wir kommen morgen.", "Er sieht uns.", "Er hilft uns."], ["We are coming tomorrow.", "He sees us.", "He helps us."]],
  ["ihr", "you (informal plural)", "ihr", "euch", "euch", ["Ihr lernt Deutsch.", "Ich sehe euch.", "Ich helfe euch."], ["You all learn German.", "I see you all.", "I help you all."]],
  ["sie (they)", "they / them", "sie", "sie", "ihnen", ["Sie kommen morgen.", "Ich sehe sie.", "Ich helfe ihnen."], ["They are coming tomorrow.", "I see them.", "I help them."]],
  ["Sie (formal)", "you (formal)", "Sie", "Sie", "Ihnen", ["Sie kommen morgen.", "Ich sehe Sie.", "Ich helfe Ihnen."], ["You are coming tomorrow.", "I see you.", "I help you."]]
];

// [infinitive, case, English meaning, German example, English example]
const GRAMMAR_VERB_DATA = [
  ["helfen","dative","to help","Ich helfe dir.","I help you."],
  ["antworten","dative","to reply","Ich antworte dir.","I reply to you."],
  ["danken","dative","to thank","Ich danke dir.","I thank you."],
  ["gefallen","dative","to appeal to / to like","Das Lied gefällt mir.","I like the song."],
  ["schmecken","dative","to taste good to someone","Der Salat schmeckt mir.","I like the taste of the salad."],
  ["gehören","dative","to belong to","Das Buch gehört mir.","The book belongs to me."],
  ["folgen","dative","to follow","Ich folge dir.","I follow you."],
  ["passen","dative","to fit / suit","Die Schuhe passen mir.","The shoes fit me."],
  ["gratulieren","dative","to congratulate","Ich gratuliere dir.","I congratulate you."],
  ["zuhören","dative","to listen to","Ich höre dir zu.","I listen to you."],
  ["vertrauen","dative","to trust","Ich vertraue dir.","I trust you."],
  ["fehlen","dative","to be missed by","Du fehlst mir.","I miss you."],
  ["sehen","accusative","to see","Ich sehe dich.","I see you."],
  ["fragen","accusative","to ask someone","Ich frage dich.","I ask you."],
  ["besuchen","accusative","to visit","Ich besuche ihn.","I visit him."],
  ["treffen","accusative","to meet","Ich treffe sie.","I meet her."],
  ["kennen","accusative","to know","Ich kenne ihn.","I know him."],
  ["lieben","accusative","to love","Ich liebe dich.","I love you."],
  ["hören","accusative","to hear","Ich höre dich.","I hear you."],
  ["lesen","accusative","to read","Ich lese das Buch.","I read the book."],
  ["anrufen","accusative","to phone","Ich rufe dich an.","I phone you."],
  ["brauchen","accusative","to need","Ich brauche deine Hilfe.","I need your help."],
  ["essen","accusative","to eat","Ich esse einen Apfel.","I eat an apple."],
  ["suchen","accusative","to look for","Ich suche meinen Schlüssel.","I am looking for my key."],
  ["finden","accusative","to find","Ich finde die Tasche.","I find the bag."],
  ["verstehen","accusative","to understand","Ich verstehe dich.","I understand you."],
  ["unterstützen","accusative","to support","Ich unterstütze dich.","I support you."],
  ["bezahlen","accusative","to pay for","Ich bezahle die Rechnung.","I pay the bill."],
  ["geben","both","to give","Ich gebe dir das Buch.","I give you the book."],
  ["schenken","both","to give as a present","Ich schenke dir ein Buch.","I give you a book as a present."],
  ["schicken","both","to send","Ich schicke dir die Nachricht.","I send you the message."],
  ["zeigen","both","to show","Ich zeige dir das Foto.","I show you the photo."],
  ["erklären","both","to explain","Ich erkläre dir die Aufgabe.","I explain the task to you."],
  ["erzählen","both","to tell","Ich erzähle dir eine Geschichte.","I tell you a story."],
  ["empfehlen","both","to recommend","Ich empfehle dir das Buch.","I recommend the book to you."],
  ["schreiben","both","to write","Ich schreibe dir einen Brief.","I write you a letter."],
  ["sagen","both","to tell","Ich sage dir die Wahrheit.","I tell you the truth."],
  ["bringen","both","to bring","Ich bringe dir das Geschenk.","I bring you the present."],
  ["reichen","both","to hand","Ich reiche dir die Hand.","I offer you my hand."],
  ["leihen","both","to lend","Ich leihe dir das Fahrrad.","I lend you the bicycle."],
  ["anbieten","both","to offer","Ich biete dir einen Kaffee an.","I offer you a coffee."],
  ["überlassen","both","to leave / hand over","Ich überlasse dir den Platz.","I leave you the seat."],
  ["liefern","both","to deliver","Ich liefere dir das Paket.","I deliver the parcel to you."],
  ["vorstellen","both","to introduce","Ich stelle dir meinen Bruder vor.","I introduce my brother to you."],
  ["bestellen","both","to order for someone","Ich bestelle dir einen Kaffee.","I order you a coffee."]
];

const GRAMMAR_VERB_CASES = Object.fromEntries(
  GRAMMAR_VERB_DATA.map(([word, verbCase]) => [word, verbCase])
);
const GRAMMAR_CASE_OPTIONS = ["dative", "accusative", "both", "not classified"];
const GRAMMAR_CASE_LABELS = {
  nominative: "Nominative (wer?)",
  accusative: "Accusative (wen?)",
  dative: "Dative (wem?)",
  both: "Both: dative recipient + accusative thing",
  "not classified": "Not classified"
};
function grammarCaseForVerb(word) {
  return GRAMMAR_VERB_CASES[String(word || "").toLocaleLowerCase("de").trim()] || "not classified";
}

function getGrammarCards() {
  const cases = ["nominative", "accusative", "dative"];
  const cards = [];
  for (const [base, english, nom, acc, dat, exDe, exEn] of GRAMMAR_PRONOUN_DATA) {
    const forms = [nom, acc, dat];
    cases.forEach((grammaticalCase, i) => {
      cards.push({
        id: "grammar:pronoun:" + base + ":" + grammaticalCase,
        de: base,
        en: english,
        prompt: base + " (" + english + ") → " + GRAMMAR_CASE_LABELS[grammaticalCase] + "?",
        answer: forms[i],
        speak: forms[i],
        type: "pronoun · " + grammaticalCase,
        grammar_case: grammaticalCase,
        example: exDe[i],
        example_en: exEn[i]
      });
    });
  }
  for (const [verb, verbCase, en, example, example_en] of GRAMMAR_VERB_DATA) {
    cards.push({
      id: "grammar:verb:" + verb,
      de: verb,
      en: en,
      prompt: verb + " — which object case?",
      answer: GRAMMAR_CASE_LABELS[verbCase],
      speak: verb,
      type: "verb case practice",
      grammar_case: verbCase,
      example, example_en
    });
  }
  return cards;
}