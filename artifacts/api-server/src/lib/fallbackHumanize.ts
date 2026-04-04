const WORD_REPLACEMENTS: Record<string, string> = {
  utilize: "use",
  utilizes: "uses",
  utilized: "used",
  utilizing: "using",
  utilization: "use",
  implement: "set up",
  implements: "sets up",
  implemented: "set up",
  implementing: "setting up",
  implementation: "setup",
  facilitate: "help",
  facilitates: "helps",
  facilitated: "helped",
  facilitate: "help",
  leverages: "uses",
  leverage: "use",
  leveraging: "using",
  leveraged: "used",
  generate: "create",
  generates: "creates",
  generated: "created",
  generating: "creating",
  demonstrate: "show",
  demonstrates: "shows",
  demonstrated: "showed",
  demonstrating: "showing",
  obtain: "get",
  obtains: "gets",
  obtained: "got",
  obtaining: "getting",
  additionally: "also",
  furthermore: "plus",
  subsequently: "then",
  consequently: "so",
  therefore: "so",
  thus: "so",
  however: "but",
  nevertheless: "still",
  nonetheless: "still",
  regarding: "about",
  pertaining: "relating",
  aforementioned: "mentioned",
  aforementioned: "above",
  methodology: "method",
  methodologies: "methods",
  algorithm: "method",
  algorithms: "methods",
  functionality: "features",
  capabilities: "features",
  parameters: "settings",
  configuration: "setup",
  initiate: "start",
  initiates: "starts",
  initiated: "started",
  terminate: "end",
  terminates: "ends",
  terminated: "ended",
  commence: "start",
  commences: "starts",
  commenced: "started",
  endeavor: "effort",
  endeavors: "efforts",
  endeavor: "try",
  approximately: "about",
  sufficient: "enough",
  numerous: "many",
  substantial: "large",
  significant: "important",
  significant: "big",
  optimal: "best",
  optimized: "improved",
  enhance: "improve",
  enhances: "improves",
  enhanced: "improved",
  enhancing: "improving",
  provide: "give",
  provides: "gives",
  provided: "gave",
  providing: "giving",
  require: "need",
  requires: "needs",
  required: "needed",
  requiring: "needing",
  ensure: "make sure",
  ensures: "makes sure",
  ensured: "made sure",
  ensuring: "making sure",
  perform: "do",
  performs: "does",
  performed: "did",
  performing: "doing",
  conduct: "do",
  conducts: "does",
  conducted: "did",
  conducting: "doing",
  indicate: "show",
  indicates: "shows",
  indicated: "showed",
  indicating: "showing",
  assist: "help",
  assists: "helps",
  assisted: "helped",
  assisting: "helping",
  accomplish: "achieve",
  accomplishes: "achieves",
  accomplished: "achieved",
  accomplishing: "achieving",
  commence: "begin",
  commences: "begins",
  advanced: "smart",
  sophisticated: "advanced",
  comprehensive: "complete",
  contemporary: "modern",
  prevalent: "common",
  incorporate: "include",
  incorporates: "includes",
  incorporated: "included",
  incorporating: "including",
};

const CONNECTORS = [
  "In fact,",
  "To put it simply,",
  "What's more,",
  "Basically,",
  "The thing is,",
  "At its core,",
  "In practice,",
  "Worth noting,",
];

function replaceWords(text: string): string {
  return text.replace(/\b(\w+)\b/g, (word) => {
    const lower = word.toLowerCase();
    const replacement = WORD_REPLACEMENTS[lower];
    if (!replacement) return word;
    if (word[0] === word[0].toUpperCase() && word[0] !== word[0].toLowerCase()) {
      return replacement.charAt(0).toUpperCase() + replacement.slice(1);
    }
    return replacement;
  });
}

function splitIntoSentences(text: string): string[] {
  return text
    .split(/(?<=[.!?])\s+/)
    .map((s) => s.trim())
    .filter((s) => s.length > 0);
}

function restructureSentence(sentence: string): string {
  const endsWithPunct = /[.!?]$/.test(sentence);
  const base = sentence.replace(/[.!?]$/, "").trim();
  const punct = endsWithPunct ? sentence.slice(-1) : ".";

  if (base.startsWith("It is important") || base.startsWith("It is essential")) {
    return base.replace(/^It is (important|essential) (to|that)/, "You really need to") + punct;
  }

  if (base.match(/^(The|This|These|Those) \w+ (is|are) (very|extremely|highly)/i)) {
    return base.replace(/(very|extremely|highly)/i, "quite") + punct;
  }

  if (base.match(/^In order to/i)) {
    return base.replace(/^In order to/i, "To") + punct;
  }

  return base + punct;
}

export function fallbackHumanize(text: string): string {
  const sentences = splitIntoSentences(text);
  if (sentences.length === 0) return text;

  const result: string[] = [];

  for (let i = 0; i < sentences.length; i++) {
    let sentence = sentences[i];

    sentence = replaceWords(sentence);
    sentence = restructureSentence(sentence);

    if (i > 0 && i % 3 === 0 && Math.random() > 0.4) {
      const connector = CONNECTORS[i % CONNECTORS.length];
      const lower = sentence.charAt(0).toLowerCase() + sentence.slice(1);
      sentence = `${connector} ${lower}`;
    }

    if (sentence.length > 120 && sentence.includes(",")) {
      const parts = sentence.split(",");
      if (parts.length > 2) {
        const mid = Math.floor(parts.length / 2);
        const first = parts.slice(0, mid).join(",") + ".";
        const second = parts.slice(mid).join(",").trim();
        const secondCap = second.charAt(0).toUpperCase() + second.slice(1);
        result.push(first, secondCap);
        continue;
      }
    }

    result.push(sentence);
  }

  return result.join(" ").replace(/\s+/g, " ").trim();
}
