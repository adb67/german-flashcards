// Additional A1-A2 grammar flashcards. Loaded before app.js.
// "both" means a dative recipient AND an accusative thing in the example,
// not that every use of the verb takes two objects.
(function () {
  "use strict";

  const cases = ["nominative", "accusative", "dative"];
  const pronounRows = [
  [
    "ich",
    "I / me",
    [
      "ich",
      "mich",
      "mir"
    ],
    [
      "I",
      "me",
      "to / for me"
    ],
    [
      "Ich lerne Deutsch.",
      "Sie sieht mich.",
      "Er hilft mir."
    ],
    [
      "I am learning German.",
      "She sees me.",
      "He helps me."
    ]
  ],
  [
    "du",
    "you (informal singular)",
    [
      "du",
      "dich",
      "dir"
    ],
    [
      "you",
      "you",
      "to / for you"
    ],
    [
      "Du bist hier.",
      "Ich sehe dich.",
      "Ich helfe dir."
    ],
    [
      "You are here.",
      "I see you.",
      "I help you."
    ]
  ],
  [
    "er",
    "he / him",
    [
      "er",
      "ihn",
      "ihm"
    ],
    [
      "he",
      "him",
      "to / for him"
    ],
    [
      "Er kommt heute.",
      "Ich kenne ihn.",
      "Ich danke ihm."
    ],
    [
      "He is coming today.",
      "I know him.",
      "I thank him."
    ]
  ],
  [
    "sie-she",
    "she / her",
    [
      "sie",
      "sie",
      "ihr"
    ],
    [
      "she",
      "her",
      "to / for her"
    ],
    [
      "Sie liest ein Buch.",
      "Ich treffe sie.",
      "Ich gratuliere ihr."
    ],
    [
      "She is reading a book.",
      "I am meeting her.",
      "I congratulate her."
    ]
  ],
  [
    "es",
    "it",
    [
      "es",
      "es",
      "ihm"
    ],
    [
      "it",
      "it",
      "to / for it"
    ],
    [
      "Es ist neu.",
      "Ich kaufe es.",
      "Ich gebe ihm einen Namen."
    ],
    [
      "It is new.",
      "I am buying it.",
      "I give it a name."
    ]
  ],
  [
    "wir",
    "we / us",
    [
      "wir",
      "uns",
      "uns"
    ],
    [
      "we",
      "us",
      "to / for us"
    ],
    [
      "Wir kommen morgen.",
      "Sie besucht uns.",
      "Er schreibt uns."
    ],
    [
      "We are coming tomorrow.",
      "She is visiting us.",
      "He writes to us."
    ]
  ],
  [
    "ihr-you-plural",
    "you (informal plural)",
    [
      "ihr",
      "euch",
      "euch"
    ],
    [
      "you (plural)",
      "you (plural)",
      "to / for you (plural)"
    ],
    [
      "Ihr seid pünktlich.",
      "Ich sehe euch.",
      "Ich danke euch."
    ],
    [
      "You are on time.",
      "I see you all.",
      "I thank you all."
    ]
  ],
  [
    "sie-they",
    "they / them",
    [
      "sie",
      "sie",
      "ihnen"
    ],
    [
      "they",
      "them",
      "to / for them"
    ],
    [
      "Sie sind Freunde.",
      "Ich kenne sie.",
      "Ich helfe ihnen."
    ],
    [
      "They are friends.",
      "I know them.",
      "I help them."
    ]
  ],
  [
    "Sie-formal",
    "you (formal)",
    [
      "Sie",
      "Sie",
      "Ihnen"
    ],
    [
      "you (formal)",
      "you (formal)",
      "to / for you (formal)"
    ],
    [
      "Sie sprechen Deutsch.",
      "Ich sehe Sie.",
      "Ich danke Ihnen."
    ],
    [
      "You speak German.",
      "I see you.",
      "I thank you."
    ]
  ]
];
  const verbRows = [
  [
    "helfen",
    "to help",
    "dative",
    "Ich helfe dir.",
    "I help you."
  ],
  [
    "gefallen",
    "to be liked / to please",
    "dative",
    "Das Geschenk gefällt mir.",
    "I like the present."
  ],
  [
    "danken",
    "to thank",
    "dative",
    "Ich danke dir.",
    "I thank you."
  ],
  [
    "antworten",
    "to answer / reply",
    "dative",
    "Ich antworte dir.",
    "I reply to you.",
    "A question can use auf + accusative: Ich antworte auf die Frage."
  ],
  [
    "gehören",
    "to belong to",
    "dative",
    "Die Musikbox gehört ihm.",
    "The speaker belongs to him."
  ],
  [
    "schmecken",
    "to taste good to",
    "dative",
    "Der Salat schmeckt mir.",
    "I like the taste of the salad."
  ],
  [
    "gratulieren",
    "to congratulate",
    "dative",
    "Ich gratuliere ihr.",
    "I congratulate her."
  ],
  [
    "zuhören",
    "to listen to",
    "dative",
    "Ich höre dir zu.",
    "I listen to you."
  ],
  [
    "folgen",
    "to follow",
    "dative",
    "Er folgt mir.",
    "He follows me."
  ],
  [
    "vertrauen",
    "to trust",
    "dative",
    "Ich vertraue dir.",
    "I trust you."
  ],
  [
    "passen",
    "to fit / suit",
    "dative",
    "Die Schuhe passen mir.",
    "The shoes fit me."
  ],
  [
    "fehlen",
    "to be missing to / be missed",
    "dative",
    "Du fehlst mir.",
    "I miss you."
  ],
  [
    "begegnen",
    "to encounter / meet",
    "dative",
    "Ich begegne ihm.",
    "I meet him."
  ],
  [
    "glauben",
    "to believe someone",
    "dative",
    "Ich glaube dir.",
    "I believe you."
  ],
  [
    "sehen",
    "to see",
    "accusative",
    "Ich sehe dich.",
    "I see you."
  ],
  [
    "treffen",
    "to meet",
    "accusative",
    "Ich treffe ihn.",
    "I meet him."
  ],
  [
    "fragen",
    "to ask someone",
    "accusative",
    "Ich frage dich.",
    "I ask you."
  ],
  [
    "besuchen",
    "to visit",
    "accusative",
    "Ich besuche sie.",
    "I visit her."
  ],
  [
    "kennen",
    "to know",
    "accusative",
    "Ich kenne ihn.",
    "I know him."
  ],
  [
    "lieben",
    "to love",
    "accusative",
    "Sie liebt ihn.",
    "She loves him."
  ],
  [
    "mögen",
    "to like",
    "accusative",
    "Ich mag das Buch.",
    "I like the book."
  ],
  [
    "brauchen",
    "to need",
    "accusative",
    "Ich brauche Hilfe.",
    "I need help."
  ],
  [
    "suchen",
    "to look for",
    "accusative",
    "Ich suche dich.",
    "I am looking for you."
  ],
  [
    "finden",
    "to find",
    "accusative",
    "Ich finde das Geschenk.",
    "I find the present."
  ],
  [
    "kaufen",
    "to buy",
    "accusative",
    "Ich kaufe das Buch.",
    "I buy the book."
  ],
  [
    "hören",
    "to hear",
    "accusative",
    "Ich höre dich.",
    "I hear you."
  ],
  [
    "lesen",
    "to read",
    "accusative",
    "Ich lese das Buch.",
    "I read the book."
  ],
  [
    "essen",
    "to eat",
    "accusative",
    "Ich esse einen Apfel.",
    "I eat an apple."
  ],
  [
    "trinken",
    "to drink",
    "accusative",
    "Ich trinke einen Tee.",
    "I drink a tea."
  ],
  [
    "anrufen",
    "to call (by telephone)",
    "accusative",
    "Ich rufe dich an.",
    "I call you."
  ],
  [
    "verstehen",
    "to understand",
    "accusative",
    "Ich verstehe dich.",
    "I understand you."
  ],
  [
    "bekommen",
    "to receive",
    "accusative",
    "Ich bekomme ein Geschenk.",
    "I receive a present."
  ],
  [
    "benutzen",
    "to use",
    "accusative",
    "Ich benutze den Computer.",
    "I use the computer."
  ],
  [
    "lernen",
    "to learn",
    "accusative",
    "Ich lerne Deutsch.",
    "I am learning German."
  ],
  [
    "geben",
    "to give",
    "both",
    "Ich gebe dir ein Geschenk.",
    "I give you a present."
  ],
  [
    "schenken",
    "to give as a present",
    "both",
    "Ich schenke ihr ein Buch.",
    "I give her a book as a present."
  ],
  [
    "schicken",
    "to send",
    "both",
    "Ich schicke dir die Lieder.",
    "I send you the songs."
  ],
  [
    "zeigen",
    "to show",
    "both",
    "Ich zeige dir das Foto.",
    "I show you the photo."
  ],
  [
    "bringen",
    "to bring",
    "both",
    "Ich bringe dir einen Kaffee.",
    "I bring you a coffee."
  ],
  [
    "erzählen",
    "to tell",
    "both",
    "Ich erzähle dir eine Geschichte.",
    "I tell you a story."
  ],
  [
    "erklären",
    "to explain",
    "both",
    "Ich erkläre dir die Regel.",
    "I explain the rule to you."
  ],
  [
    "empfehlen",
    "to recommend",
    "both",
    "Ich empfehle dir ein Buch.",
    "I recommend a book to you."
  ],
  [
    "leihen",
    "to lend",
    "both",
    "Ich leihe dir mein Fahrrad.",
    "I lend you my bicycle."
  ],
  [
    "verkaufen",
    "to sell",
    "both",
    "Ich verkaufe ihm das Auto.",
    "I sell him the car."
  ],
  [
    "schreiben",
    "to write / send in writing",
    "both",
    "Ich schreibe dir eine Nachricht.",
    "I write you a message."
  ],
  [
    "sagen",
    "to tell / say",
    "both",
    "Ich sage dir die Wahrheit.",
    "I tell you the truth."
  ],
  [
    "senden",
    "to send",
    "both",
    "Ich sende dir die E-Mail.",
    "I send you the email."
  ],
  [
    "kaufen für",
    "to buy for someone (with für + accusative)",
    "accusative",
    "Ich kaufe ein Geschenk für dich.",
    "I buy a present for you.",
    "Für always takes accusative; this is not a dative recipient construction."
  ]
];

  const pronounCards = pronounRows.flatMap(([id, person, forms, meanings, examples, translations]) =>
    cases.map((caseType, i) => ({
      grammarId: "pronoun:" + id + ":" + caseType,
      de: forms[i],
      en: meanings[i] + " (" + person + "; " + caseType + ")",
      type: "pronoun",
      caseType,
      example: examples[i],
      example_en: translations[i],
      grammarNote: "Forms: " + forms.join(" → ") + " (nominative → accusative → dative)"
    }))
  );

  const verbCards = verbRows.map(([de, en, caseType, example, example_en, extra]) => ({
    grammarId: "verb:" + de,
    de,
    en,
    type: "verb",
    caseType,
    example,
    example_en,
    grammarNote: extra || (caseType === "both"
      ? "Dative = recipient/person; accusative = thing given, sent, shown etc."
      : caseType === "dative"
        ? "The person affected is dative (mir, dir, ihm, ihr ...)."
        : "The direct object is accusative (mich, dich, ihn, sie ...).")
  }));

  window.GERMAN_GRAMMAR = Object.freeze({ pronounCards, verbCards });
})();
