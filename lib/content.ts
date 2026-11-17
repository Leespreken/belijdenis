import { LES1_HTML } from "./les1-tekst";
import { LES2_HTML } from "./les2-tekst";
import { LES3_HTML, LES3_BIJLEZEN_HTML, LES3_BIJLEZEN_TITEL } from "./les3-tekst";
import { LES8_HTML, LES8_BIJLEZEN_HTML, LES8_BIJLEZEN_TITEL } from "./les8-tekst";
import { LES9_HTML, LES9_BIJLEZEN_HTML, LES9_BIJLEZEN_TITEL } from "./les9-tekst";

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
  /** overige verwijzingen uit het kadertje, bv. "NGB: art. 27-29", "HC: vr. 1-5" */
  overig?: string[];
  html: string;
  bijlezenTitel?: string;
  bijlezenHtml?: string;
  /** een optionele les telt niet mee in de volgorde/voortgang */
  optioneel?: boolean;
  vragen: Vraag[];
};

const les1: Les = {
  nr: 1,
  titel: "Belijdenis-doen",
  bijbel: "Romeinen 10:1-10",
  overig: ["NGB: art. 27-29", "KB: 'Uit de geschiedenis van het Kort Begrip'"],
  html: LES1_HTML,
  vragen: [
    { id: 1, tekst: "Wat is belijden?",
      antwoord: "Belijden is uitkomen voor wat God in Zijn Woord gezegd heeft. Oprecht belijden is vrucht van een geestelijke beslissing, en een openbaring van het verborgen geloof in het hart.",
      need: 2, kern: [{label:"uitkomen voor Gods Woord",alt:["uitkomen","woord"]},{label:"vrucht van het geloof/een beslissing",alt:["vrucht","beslissing"]}],
      invul: "Belijden is {{uitkomen}} voor wat God in Zijn Woord gezegd heeft. Oprecht belijden is {{vrucht}} van een geestelijke beslissing." },
    { id: 2, tekst: "Wat is geloven?",
      antwoord: "Geloven is iemands getuigenis voor waarachtig aannemen. Het geloof rust op Gods belofte en niet op iets in of op onszelf.",
      need: 2, kern: [{label:"getuigenis aannemen",alt:["getuigenis","aannemen"]},{label:"rust op Gods belofte",alt:["belofte"]}],
      invul: "Geloven is iemands {{getuigenis}} voor waarachtig aannemen. Het geloof rust op Gods {{belofte}} en niet op onszelf." },
    { id: 3, tekst: "Waar rust het geloof op en waarom?",
      antwoord: "Het geloof rust op Gods belofte en niet op iets in of op onszelf. In de nood wordt het geloof geboren: temidden van schuldverslagenheid, hulpeloosheid en onwaardigheid vlucht het geloof tot Gods genade.",
      need: 2, kern: [{label:"Gods belofte",alt:["belofte"]},{label:"niet op onszelf",alt:["onszelf","zelf"]},{label:"vlucht tot Gods genade",alt:["genade","vlucht"]}],
      invul: "Het geloof rust op Gods {{belofte}} en niet op iets in onszelf. In de nood vlucht het geloof tot Gods {{genade}}." },
    { id: 4, tekst: "Hoe ging het belijdenis-doen in de vroeg-christelijke kerk?",
      antwoord: "Pas na het doen van belijdenis werd men gedoopt en toegelaten tot de christelijke kerk; de christenen die belijdenis gedaan hadden, lieten daarna hun kinderen dopen. Uit de afgelegde belijdenissen zijn de Twaalf Artikelen des geloofs gegroeid.",
      need: 2, kern: [{label:"pas ná belijdenis gedoopt",alt:["gedoopt","doop"]},{label:"Twaalf Artikelen gegroeid",alt:["twaalf artikelen","12 artikelen"]}],
      invul: "In de vroeg-christelijke kerk werd men pas ná het doen van {{belijdenis}} gedoopt. Uit deze belijdenissen zijn de {{Twaalf}} Artikelen des geloofs gegroeid." },
    { id: 5, tekst: "Hoe ging het belijdenis doen tijdens de Reformatie?",
      antwoord: "De Reformatie keerde terug tot de orde van de vroeg-christelijke kerk, brak met het Roomse vormsel en handhaafde de kinderdoop. De nadruk lag op het catechetisch onderwijs aan de gedoopte kinderen, gericht op een openlijke aanvaarding van hun doop, met bij Calvijn de gelegenheid tot openbare belijdenis vlak vóór de bediening van het Heilig Avondmaal.",
      need: 3, kern: [{label:"brak met het vormsel",alt:["vormsel"]},{label:"catechetisch onderwijs",alt:["catech","onderwijs"]},{label:"vóór het Avondmaal (Calvijn)",alt:["avondmaal","calvijn"]}],
      invul: "De Reformatie brak met het Roomse {{vormsel}} en legde de nadruk op {{catechetisch}} onderwijs aan de gedoopte kinderen, gericht op aanvaarding van hun doop vlak vóór het Heilig {{Avondmaal}}." },
    { id: 6, tekst: "Was er in de tijd van de Reformatie verband tussen belijdenis en Avondmaal?",
      antwoord: "Ja, er was verband tussen belijdenis en Avondmaal, maar het Avondmaal volgde niet automatisch op de belijdenis; dit blijkt uit de vragen van de zelfbeproeving voor het Avondmaal die van Calvijn afkomstig zijn.",
      need: 2, kern: [{label:"wel verband",alt:["verband"]},{label:"niet automatisch",alt:["automatisch"]},{label:"zelfbeproeving (Calvijn)",alt:["zelfbeproeving","calvijn"]}],
      invul: "Er was wel {{verband}} tussen belijdenis en Avondmaal, maar het Avondmaal volgde niet {{automatisch}} op de belijdenis." },
    { id: 7, tekst: "Wat zegt art. 27 NGB van de ware kerk?",
      antwoord: "Dat niemand zich op zichzelf behoort te houden, maar dat allen schuldig zijn zich bij de ware kerk te voegen, haar eenheid te onderhouden, zich aan haar onderwijzing en tucht te onderwerpen, en de hals te buigen onder het juk van Jezus Christus.",
      need: 2, kern: [{label:"zich bij de kerk voegen",alt:["voegen"]},{label:"onder haar onderwijzing en tucht",alt:["onderwijzing","tucht"]}],
      invul: "Niemand behoort op {{zichzelf}} te staan, maar allen zijn schuldig zich bij de kerk te {{voegen}} en zich te onderwerpen aan haar onderwijzing en {{tucht}}." },
    { id: 8, open: true, tekst: "Om over na te denken: Zeg heel in het kort wat belijdenis-doen inhoudt.",
      antwoord: "Hier is geen vast antwoord. Denk aan: belijdenis doen is met de mond uitkomen voor het geloof van het hart, een keus om aan de zijde van Gods volk te staan, in het besef dat dit alleen door Gods genade kan.",
      need: 0, kern: [] },
    { id: 9, open: true, tekst: "Om over na te denken: Wat mag van een belijdend lid van de gemeente verwacht worden?",
      antwoord: "Hier is geen vast antwoord. Denk aan: een leven naar de belijdenis, trouw gebruik van Woord en sacrament, onderwerping aan het opzicht van de kerkenraad, en de voortdurende strijd om niet in een 'historisch' belijden te blijven steken.",
      need: 0, kern: [] },
  ],
};

const les2: Les = {
  nr: 2,
  titel: "De Heilige Schrift",
  bijbel: "2 Timotheüs 3:1-17",
  overig: ["NGB: art. 2-7", "HC: vr. 19"],
  html: LES2_HTML,
  vragen: [
    { id: 1, tekst: "Wat is de Bijbel?",
      antwoord: "De Bijbel is het geschreven Woord van God. Zij is in de grondtalen onfeilbaar, vanwege de inspiratie door de Heilige Geest.",
      need: 2, kern: [{label:"geschreven Woord van God",alt:["woord van god"]},{label:"onfeilbaar door inspiratie",alt:["onfeilbaar","inspiratie"]}],
      invul: "De Bijbel is het geschreven {{Woord}} van God. Zij is in de grondtalen {{onfeilbaar}}, vanwege de inspiratie door de Heilige Geest." },
    { id: 2, tekst: "a. Wat verstaan we onder de inspiratie van de Bijbel? b. Wat is in dit verband de betekenis van de woorden 'organisch' en 'mechanisch'?",
      antwoord: "Inspiratie is het bovennatuurlijke werk van de Heilige Geest, waardoor de bijbelschrijvers het Woord van God onfeilbaar hebben opgeschreven. Wij geloven een woordelijke en organische inspiratie, niet een zakelijke en mechanische: de bijbelschrijvers waren niet slechts een toetsenbord, maar werden met hun eigen persoonlijke kennis, gaven en karakter ingeschakeld.",
      need: 2, kern: [{label:"bovennatuurlijk werk van de Heilige Geest",alt:["heilige geest","bovennatuurlijk"]},{label:"organisch, niet mechanisch",alt:["organisch","mechanisch"]}],
      invul: "Inspiratie is het bovennatuurlijke werk van de {{Heilige}} Geest, waardoor de bijbelschrijvers het Woord van God onfeilbaar opschreven. Dit is een {{organische}}, geen mechanische inspiratie." },
    { id: 3, tekst: "In welke talen is de Bijbel geschreven?",
      antwoord: "Het Oude Testament is in het Hebreeuws geschreven (enkele kleine gedeelten in het Aramees); het Nieuwe Testament is in het Grieks geschreven.",
      need: 2, kern: [{label:"Hebreeuws (Oude Testament)",alt:["hebreeuws"]},{label:"Grieks (Nieuwe Testament)",alt:["grieks"]}],
      invul: "Het Oude Testament is in het {{Hebreeuws}} geschreven, op enkele gedeelten in het Aramees na. Het Nieuwe Testament is in het {{Grieks}} geschreven." },
    { id: 4, tekst: "Welke vertaling gebruiken wij en waarom?",
      antwoord: "Wij gebruiken de Statenvertaling, die tot stand kwam op besluit van de Nationale Synode van Dordrecht (1618-1619), omdat deze dicht bij de oorspronkelijke tekst blijft en de vertalers uitgingen van de woordelijke inspiratie van de Heilige Schrift.",
      need: 2, kern: [{label:"Statenvertaling",alt:["statenvertaling"]},{label:"dicht bij de grondtekst / woordelijke inspiratie",alt:["grondtekst","woordelijk","oorspronkelijk"]}],
      invul: "Wij gebruiken de {{Statenvertaling}}, ontstaan op besluit van de Synode van {{Dordrecht}}, omdat zij dicht bij de oorspronkelijke tekst blijft." },
    { id: 5, tekst: "Hoe noemen we de 66 Bijbelboeken en wat betekent dat?",
      antwoord: "We noemen ze canoniek: de woorden van de Bijbel zijn waar en betrouwbaar en een regel voor geloof en leven. 'Canon' betekent ook 'lijst': de lijst van heilige, gezaghebbende boeken die tot de Bijbel behoren.",
      need: 2, kern: [{label:"canoniek",alt:["canoniek","canon"]},{label:"lijst van gezaghebbende boeken",alt:["lijst","gezag"]}],
      invul: "We noemen de 66 bijbelboeken {{canoniek}}: 'canon' betekent {{lijst}}, de lijst van heilige boeken die wij als gezaghebbend erkennen." },
    { id: 6, tekst: "Wat heeft de Heilige Geest gedaan in de canonisatie van de Bijbel? Zie NGB, art. 2-7.",
      antwoord: "De Heilige Geest heeft de kerk er altijd bij bepaald welke boeken tot de Bijbel behoren en heeft over Gods Woord gewaakt; de NGB belijdt dat de Bijbel goddelijk gezag heeft, genoegzaam en noodzakelijk is tot zaligheid, en dat dit gezag niet door mensen of de kerk aan de Bijbel gegeven is, maar door God Zelf.",
      need: 2, kern: [{label:"Gods bijzondere zorg over Zijn Woord",alt:["zorg","gewaakt"]},{label:"gezag niet van mensen, maar van God",alt:["god zelf","gezag"]}],
      invul: "De kerk heeft altijd het {{gezag}} van de Schrift beleden: dat gezag is niet door mensen aan de Bijbel gegeven, maar door {{God}} Zelf." },
    { id: 7, tekst: "Wat zijn 'apocriefe' boeken? Hoe heeft de kerk daarover geoordeeld?",
      antwoord: "Apocrief betekent 'verborgen'. Tegenover de canonieke boeken staan de apocriefe boeken; hun herkomst is niet duidelijk en hun inhoud is twijfelachtig (NGB, art. 6).",
      need: 2, kern: [{label:"apocrief = verborgen",alt:["verborgen"]},{label:"herkomst onduidelijk / inhoud twijfelachtig",alt:["onduidelijk","twijfelachtig"]}],
      invul: "Apocrief betekent {{verborgen}}. De herkomst van de apocriefe boeken is niet duidelijk, en hun inhoud is {{twijfelachtig}}." },
    { id: 8, tekst: "Noem enkele apocriefe boeken.",
      antwoord: "Bijvoorbeeld de boeken Tobias, Judith en de Wijsheid van Jezus Sirach.",
      need: 1, kern: [{label:"bijv. Tobias/Judith/Sirach",alt:["tobias","judith","sirach","makkabee"]}] },
    { id: 9, tekst: "Wat wil zeggen dat de Bijbel 'historisch' en 'normatief' gezag heeft?",
      antwoord: "Historisch gezag wil zeggen dat de Bijbel historisch betrouwbaar is: de beschreven geschiedenissen en personen zijn geschiedkundige werkelijkheid. Normatief gezag wil zeggen dat de Bijbel bindende regel is voor geloof en leven; de Bijbel zelf wijst aan wat norm is en wat niet.",
      need: 2, kern: [{label:"historisch betrouwbaar",alt:["historisch","betrouwbaar"]},{label:"bindende regel voor geloof en leven",alt:["normatief","regel"]}],
      invul: "Historisch gezag wil zeggen dat de Bijbel {{historisch}} betrouwbaar is. Normatief gezag wil zeggen dat zij bindende {{regel}} is voor geloof en leven." },
    { id: 10, open: true, tekst: "Om over na te denken: Is het bijbellezen bij de maaltijden zinvol? Noem voor- en nadelen. Noem ook andere vormen van bijbelgebruik.",
      antwoord: "Hier is geen vast antwoord. Denk aan het gevaar van sleur tegenover de waarde van een vaste, gezamenlijke gewoonte, en aan andere vormen zoals persoonlijke bijbellezing, Bijbelstudie, het uit het hoofd leren van gedeelten en het voorlezen bij ziekenbezoek.",
      need: 0, kern: [] },
  ],
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
