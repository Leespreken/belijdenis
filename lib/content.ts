import { LES3_HTML, LES3_BIJLEZEN_HTML, LES3_BIJLEZEN_TITEL } from "./les3-tekst";

export type Vraag = {
  id: number;
  tekst: string;
  antwoord: string;
  open?: boolean;
  /** kernpunten: label + woorden waarvan er minstens één in het antwoord moet staan */
  kern: { label: string; alt: string[] }[];
  need: number;
  /** invuloefening voor het onthouden: {{woord|alternatief}} */
  invul?: string;
};

export type Les = {
  nr: number;
  titel: string;
  bijbel: string;
  html: string;
  bijlezenTitel?: string;
  bijlezenHtml?: string;
  vragen: Vraag[];
};

const les3: Les = {
  nr: 3,
  titel: "De belijdenisgeschriften",
  bijbel: "Hebreeën 6; Openbaring 2 en 3",
  html: LES3_HTML,
  bijlezenTitel: LES3_BIJLEZEN_TITEL,
  bijlezenHtml: LES3_BIJLEZEN_HTML,
  vragen: [
    { id: 1, tekst: "Welke algemene belijdenisgeschriften zijn er?",
      antwoord: "De Apostolische Geloofsbelijdenis (de Twaalf Artikelen), de geloofsbelijdenis van Nicéa (325) en de geloofsbelijdenis van Athanasius (333).",
      need: 3, kern: [{label:"Apostolische geloofsbelijdenis",alt:["apostolisch","twaalf artikelen","12 artikelen"]},{label:"Nicéa",alt:["nic"]},{label:"Athanasius",alt:["athanas"]}],
      invul: "De {{Apostolische}} Geloofsbelijdenis (de Twaalf Artikelen), de geloofsbelijdenis van {{Nicéa|Nicea}} (325) en de geloofsbelijdenis van {{Athanasius}} (333)." },
    { id: 2, tekst: "Welke belijdenisgeschriften kende de kerk van de Reformatie in Nederland? Door wie zijn ze opgesteld?",
      antwoord: "De Nederlandse Geloofsbelijdenis (1561, Guido de Bres); de Heidelbergse Catechismus (1563, onder andere Zacharias Ursinus en Caspar Olevianus); de Dordtse Leerregels of vijf artikelen tegen de Remonstranten (Nationale Synode te Dordrecht, 1618-1619).",
      need: 5, kern: [{label:"Nederlandse Geloofsbelijdenis",alt:["nederlandse","ngb","geloofsbelijdenis"]},{label:"Guido de Bres",alt:["bres"]},{label:"Heidelbergse Catechismus",alt:["heidelberg","hc"]},{label:"Ursinus en Olevianus",alt:["ursinus","olevianus"]},{label:"Dordtse Leerregels",alt:["dordt","leerregel","remonstrant"]},{label:"Synode van Dordrecht",alt:["synode"]}],
      invul: "De {{Nederlandse}} Geloofsbelijdenis (1561) is opgesteld door Guido de {{Bres}}. De {{Heidelbergse}} Catechismus (1563) door onder andere Zacharias {{Ursinus}} en Caspar {{Olevianus}}. De Dordtse {{Leerregels}} ontstonden op de Nationale {{Synode}} te Dordrecht (1618-1619)." },
    { id: 3, tekst: "Hoe worden deze belijdenisgeschriften genoemd?",
      antwoord: "De Drie Formulieren van Enigheid, omdat de eenheid van de waarheid naar de Schrift er in beleden wordt.",
      need: 1, kern: [{label:"Formulieren van Enigheid",alt:["formulieren","enigheid"]}],
      invul: "De drie bijzondere belijdenisgeschriften noemen we samen: de Drie Formulieren van {{Enigheid}}, omdat de eenheid van de {{waarheid}} naar de Schrift er in beleden wordt." },
    { id: 4, tekst: "Welk gezag hebben de belijdenisgeschriften, en wat betekent dat?",
      antwoord: "Ze hebben kerkelijk gezag. Ze staan niet boven Gods Woord, zoals de leeruitspraken van Rome, maar onder Gods Woord. Omdat ze op Gods Woord gegrond zijn en door de kerk van de Reformatie zijn aanvaard, hebben de formulieren van enigheid kerkelijk gezag.",
      need: 3, kern: [{label:"kerkelijk gezag",alt:["kerkelijk"]},{label:"onder Gods Woord",alt:["onder"]},{label:"gegrond op Gods Woord",alt:["woord","schrift","bijbel"]}],
      invul: "De belijdenisgeschriften hebben {{kerkelijk}} gezag. Ze staan niet {{boven}} Gods Woord, maar {{onder}} Gods Woord." },
    { id: 5, tekst: "Is de leer in de belijdenisgeschriften de leer van de Gereformeerde Gemeenten? Zo ja, wanneer en hoe is dit vastgesteld?",
      antwoord: "Ja. In 1907, bij de samenvoeging van de Ledeboeriaanse gemeenten en de Kruisgemeenten, is dit vastgelegd in het kerkelijk akkoord, waarin de leer die in Gods Woord geleerd wordt en samengevat is in de belijdenisgeschriften, van harte wordt onderschreven.",
      need: 3, kern: [{label:"ja",alt:["ja"]},{label:"1907",alt:["1907"]},{label:"kerkelijk akkoord",alt:["akkoord"]},{label:"samenvoeging",alt:["samenvoeg","ledeboer","kruis"]}],
      invul: "Ja. In {{1907}} is dit vastgelegd in het kerkelijk {{akkoord}}, bij de samenvoeging van de {{Ledeboeriaanse}} gemeenten en de {{Kruisgemeenten|Kruis}}." },
    { id: 6, tekst: "Wat versta je onder een “kerkelijk akkoord”?",
      antwoord: "Een overeenkomst in het kerkverband waarin de leer die in Gods Woord geleerd wordt en samengevat is in de belijdenisgeschriften, van harte wordt onderschreven.",
      need: 2, kern: [{label:"de leer / de belijdenis",alt:["leer","belijdenis"]},{label:"onderschreven / aanvaard",alt:["onderschr","aanvaard","instem","akkoord","overeen"]},{label:"kerkverband",alt:["kerkverband","kerk","gemeenten"]}],
      invul: "Een kerkelijk akkoord is een {{overeenkomst}} in het kerkverband waarin de {{leer}} van Gods Woord, samengevat in de belijdenisgeschriften, van harte wordt {{onderschreven}}." },
    { id: 7, tekst: "Noem drie redenen voor de noodzaak van belijdenisgeschriften.",
      antwoord: "1. Het bestaan van de kerk zelf. 2. De noodzaak van zelfverdediging. 3. Het openlijk betuigen van eendracht in de leer. 4. Het bewaren van de zuiverheid van de leer. (Drie van deze vier zijn genoeg.)",
      need: 3, kern: [{label:"bestaan van de kerk",alt:["bestaan"]},{label:"zelfverdediging",alt:["verdedig"]},{label:"eendracht in de leer",alt:["eendracht","eenheid","eens"]},{label:"zuiverheid van de leer",alt:["zuiver","bewaren"]}],
      invul: "Het {{bestaan}} van de kerk zelf; de noodzaak van {{zelfverdediging}}; het openlijk betuigen van {{eendracht}} in de leer; het bewaren van de {{zuiverheid}} van de leer." },
    { id: 8, open: true, tekst: "Om over na te denken: Wat zeg je tegen iemand die beweert: “de Bijbel is voldoende; waarom zou je dan ook nog belijdenisgeschriften nodig hebben?”",
      antwoord: "Hier is geen vast antwoord. Denk bijvoorbeeld aan: de kerk nam al heel vroeg bindende besluiten (Hand. 16:4); zonder gemeenschappelijke belijdenis is er geen kerkgemeenschap; dwalingen verspreiden zich gemakkelijk, ook bij mensen die zich op de Bijbel beroepen; de belijdenisgeschriften staan ónder Gods Woord. Belangrijker: heb je de waarheid ook zelf lief gekregen en ervaren?",
      need: 0, kern: [] },
  ],
};

export const LESSEN: Record<number, Les> = { 3: les3 };

export function normaal(t: string) {
  return (t || "").toLowerCase().normalize("NFD").replace(/[̀-ͯ]/g, "").trim();
}
export function kernpunten(v: Vraag, tekst: string) {
  const n = normaal(tekst);
  return v.kern.map((k) => k.alt.some((a) => n.includes(normaal(a))));
}
