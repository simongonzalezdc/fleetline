/**
 * Bundled sample corpus. Lets missions run fully offline and deterministically
 * (for demos, tests, and judges without network access). Each entry is
 * original text written for this project; refs are addressed as
 * "corpus:<key>" in mission sources.
 */

export interface CorpusEntry {
  key: string;
  label: string;
  title: string;
  text: string;
}

export const CORPUS: CorpusEntry[] = [
  {
    key: "ai-news",
    label: "AI news roundup",
    title: "The Wednesday AI Roundup: Agents Go Mainstream",
    text: `Agent fleets moved from research demos to production workflows this quarter, and three shifts explain most of the momentum. First, orchestration frameworks standardized around open protocols, which let a supervisor agent delegate work to specialized workers built by different teams. Companies running these fleets report that the bottleneck moved from model quality to task routing: deciding which worker gets which job, and how results are merged. Second, voice became a serious control surface. Hands-free operation turned out to matter less for consumers and more for operators: people managing machines, kitchens, warehouses, and incidents want their eyes and hands free. Voice plus a structured tool protocol means a supervisor can accept a mission, dispatch workers, and report back without a screen. Third, local-first deployments arrived. Running fleets on premises, with no cloud dependency, removed both the per-call cost and the data-residency objection that stalled enterprise adoption for two years. The remaining hard problems are failure recovery, cost accounting per mission, and auditing what a fleet actually did after the fact. Teams that solve audit trails for autonomous workers will win the trust of regulated industries.`,
  },
  {
    key: "coffee-science",
    label: "Coffee extraction science",
    title: "Extraction Science: Why Grind Size Controls Everything",
    text: `Coffee extraction is a diffusion problem, and grind size is the dial that controls the rate. Water pulls flavor compounds out of coffee particles at different speeds: acids first, then sugars, then the bitter compounds that arrive late. A fine grind presents more surface area, so extraction races through all three phases in seconds; a coarse grind spreads the same journey over minutes. Espresso exploits the fast lane under nine bars of pressure, while cold brew simply waits long enough for a coarse grind to finish. The practical failure modes are named after the imbalance: under-extraction tastes sour because the acids finished while the sugars never got going, and over-extraction tastes bitter because the late compounds overwhelmed the party. Temperature shifts the whole curve the same way grind size does, which is why a grinder adjustment is usually a better first fix than a temperature change. Baristas who track their ratio of coffee to water, grind setting, and brew time can reproduce any cup within a day of practice, and every serious café keeps that log per bean.`,
  },
  {
    key: "city-cycling",
    label: "Urban cycling report",
    title: "City Cycling Report: Protected Lanes Pay for Themselves",
    text: `Cities that built protected bike lanes saw measurable returns within three years, according to a review of a dozen North American programs. The mechanism is unglamorous: painted lanes were ignored by drivers and avoided by riders, while physical separation changed behavior on day one. Ridership on protected corridors typically doubled, and the new riders skewed toward women, older residents, and parents with children, groups that surveys had consistently labeled interested but frightened. Retail along the corridors rose slightly, contradicting the standard merchant fear of losing parking, because people arriving by bike visited more often and spent similar amounts per trip. Injury counts fell faster than ridership rose, which researchers attribute to the safety-in-numbers effect plus the simple physics of separation. The fiscal case came from cost per mile: paint and bollards cost a fraction of a road rebuild, and the health savings from active commuting showed up in insurance claims data within five years. The review's conclusion is that the debate is no longer whether protected lanes work but which streets get them first.`,
  },
  {
    key: "sleep-research",
    label: "Sleep research notes",
    title: "Sleep Notes: Consistency Beats Duration",
    text: `Sleep researchers have converged on an inconvenient finding: a consistent schedule helps more than an extra hour on weekends. The body's circadian system treats irregular sleep like repeated jet lag, and late weekend mornings shift Monday's internal clock late enough that researchers gave it a name, social jet lag. Studies tracking thousands of wearable users found that variance in bedtime predicted daytime grogginess better than average duration did. The practical protocol is boring and effective: same wake time every day, morning light within an hour of waking, and caffeine before noon, because caffeine's half-life means an afternoon cup is still working at bedtime. Evening screens matter less than their brightness and the anxiety they carry; a dim reader with calm material does little harm. Deep sleep concentrates in the first half of the night, which is why going to bed much later than usual costs the most restorative stage disproportionately. Naps under twenty-five minutes restore attention without the groggy wake-from-deep-sleep penalty, and athletes who nap systematically outperform matched groups that skip them.`,
  },
];

export function corpusByKey(key: string): CorpusEntry | undefined {
  return CORPUS.find((e) => e.key === key);
}

export function defaultSources(): string[] {
  return CORPUS.map((e) => `corpus:${e.key}`);
}
