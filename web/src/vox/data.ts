// Baked demo dataset for the static Vercel build (brief §8). Mirrors what the
// synthesis engine produces from the ~100 synthetic answers, but with curated
// theme labels so the offline demo reads well (the live backend's local fallback
// produces keyword labels; Claude produces prose). When a backend is present,
// web/src/vox/api.ts calls /api/vox/* instead of using this.
//
// Session TOPICS are real RBL1 engagement topics; ANSWERS are synthetic. Orgs
// carry NEUTRAL descriptors (§8.2). Demographics are RAW counts here — the org
// view runs them through lib/suppression.ts so thin cells hide (§6/§8.4).

export type Quote = { code: string; text: string; attrs: string[] };
export type Theme = {
  label: string;
  summary: string;
  weightPct: number;
  answerCount: number;
  sentiment: number; // -1..1
  quotes: Quote[];
  demographics: Record<string, number>; // raw chip counts within the theme
};
export type Sentiment = { positive: number; neutral: number; negative: number; avgIntensity: number };
export type HealthRow = { fillRate: number; voiceShare: number; timeToFillDays: number; dropOff: number };
export type TrendPoint = { period: string; count: number; avgSentiment: number };

export type Session = {
  id: string;
  title: string;
  prompt: string;
  vertical: string;
  orgLabel: string;
  mode: 'text' | 'voice';
  target: number;
  collected: number;
  themes: Theme[];
  sentiment: Sentiment;
  demographics: Record<string, number>; // raw, session-wide
  health: HealthRow;
  trends: TrendPoint[];
};

export type Signal = {
  code: string;
  type: 'safety_crisis' | 'fraud_spam';
  severity: 'low' | 'medium' | 'high';
  rationale: string;
  session: string;
  text: string;
  status: 'new' | 'reviewed' | 'dismissed';
};

export const LAST_SYNTHESIZED = '4 hours ago';

export const SESSIONS: Session[] = [
  {
    id: 'vox-correctional',
    title: 'Correctional Healthcare',
    prompt: 'Discussing your experience with healthcare while incarcerated.',
    vertical: 'Justice / Health',
    orgLabel: 'Health Research Org',
    mode: 'voice',
    target: 40,
    collected: 16,
    themes: [
      {
        label: 'Care delayed until it became a crisis.',
        summary: 'Sick-call requests went unanswered until conditions escalated — abscesses, untreated chronic disease, lost teeth.',
        weightPct: 38,
        answerCount: 6,
        sentiment: -0.7,
        quotes: [
          { code: 'R-2841', text: 'I put in three sick-call slips for a tooth that was abscessed. By the time anyone saw me, half my jaw was swollen.', attrs: ['Cleveland, OH', '< $20k', 'Justice-involved'] },
          { code: 'R-2838', text: 'They took me off my blood pressure meds for two weeks because the paperwork didn’t transfer.', attrs: ['Newark, NJ', 'Chronic condition'] },
        ],
        demographics: { 'Justice-involved': 6, '< $20k': 4, 'Chronic condition': 3 },
      },
      {
        label: 'Asking for care got you labeled.',
        summary: 'Respondents learned that reporting pain risked being tagged drug-seeking, so they stopped asking and went without.',
        weightPct: 31,
        answerCount: 5,
        sentiment: -0.6,
        quotes: [
          { code: 'R-2837', text: 'You learn fast that saying you’re in pain gets you labeled a drug-seeker. So you stop asking.', attrs: ['Atlanta, GA', 'Justice-involved'] },
          { code: 'R-2834', text: 'I felt invisible in there. Like my body wasn’t worth the paperwork.', attrs: ['Atlanta, GA', '< $30k'] },
        ],
        demographics: { 'Justice-involved': 5, '< $30k': 3 },
      },
      {
        label: 'One person made it survivable.',
        summary: 'The few positive accounts centered on a single nurse or PA who followed up — staffing, not staff, was the failure.',
        weightPct: 25,
        answerCount: 4,
        sentiment: 0.3,
        quotes: [
          { code: 'R-2832', text: 'A PA who actually remembered my name and followed up. One person made the whole place survivable.', attrs: ['Fresno, CA', 'Justice-involved'] },
        ],
        demographics: { 'Justice-involved': 4 },
      },
    ],
    sentiment: { positive: 2, neutral: 3, negative: 11, avgIntensity: 0.62 },
    demographics: { 'Justice-involved': 15, '< $20k': 9, '< $30k': 7, 'Chronic condition': 3, 'Reentry': 2, 'Detroit, MI': 4, 'Cleveland, OH': 3, 'Newark, NJ': 3, 'Atlanta, GA': 3, 'Fresno, CA': 3, 'Veteran': 1, 'Woman': 1, 'Medicaid': 1 },
    health: { fillRate: 0.4, voiceShare: 0.94, timeToFillDays: 12, dropOff: 0.18 },
    trends: [
      { period: 'Wk 1', count: 3, avgSentiment: -0.5 },
      { period: 'Wk 2', count: 5, avgSentiment: -0.6 },
      { period: 'Wk 3', count: 5, avgSentiment: -0.4 },
      { period: 'Wk 4', count: 3, avgSentiment: -0.3 },
    ],
  },
  {
    id: 'vox-caregiver',
    title: 'Caregiver for an aging or disabled family member',
    prompt: 'Accessing respite care, support groups, and educational materials.',
    vertical: 'Health / Caregiving',
    orgLabel: 'a foundation-housed venture studio',
    mode: 'text',
    target: 35,
    collected: 14,
    themes: [
      {
        label: 'Respite exists on paper, not in reach.',
        summary: 'Vouchers and aides were technically available but gated by months-long waitlists, distance, and turnover.',
        weightPct: 43,
        answerCount: 6,
        sentiment: -0.6,
        quotes: [
          { code: 'R-2825', text: 'Respite care exists on paper but the waitlist is eleven months long.', attrs: ['Atlanta, GA', 'Caregiver', 'Parent of 2'] },
          { code: 'R-2818', text: 'Medicaid covered the home aide but she quit and they took three months to send another.', attrs: ['Detroit, MI', 'Caregiver', 'Medicaid'] },
        ],
        demographics: { Caregiver: 6, 'Medicaid': 2 },
      },
      {
        label: 'The system pays strangers, not family.',
        summary: 'Caregivers left jobs and income to provide care that the system would fund only for outside providers.',
        weightPct: 29,
        answerCount: 4,
        sentiment: -0.5,
        quotes: [
          { code: 'R-2822', text: 'I quit my job to care for my dad... The system pays strangers but not family.', attrs: ['Newark, NJ', 'Caregiver', 'Lost income'] },
        ],
        demographics: { Caregiver: 4, 'Lost income': 1 },
      },
      {
        label: 'Plain-language help would change everything.',
        summary: 'Respondents wanted one-page checklists and hands-on training over college-level PDFs and phone-tree referrals.',
        weightPct: 28,
        answerCount: 4,
        sentiment: -0.1,
        quotes: [
          { code: 'R-2820', text: 'Everything is a PDF written at a college reading level. I just need a one-page checklist.', attrs: ['Atlanta, GA', 'Caregiver', 'ELL'] },
        ],
        demographics: { Caregiver: 4, ELL: 1 },
      },
    ],
    sentiment: { positive: 2, neutral: 4, negative: 8, avgIntensity: 0.58 },
    demographics: { Caregiver: 14, '< $30k': 6, '< $40k': 4, '$40–60k': 3, 'Medicaid': 2, 'Parent of 2': 1, 'Youth caregiver': 1, 'Senior': 1, 'ELL': 1, 'No car': 1, 'Detroit, MI': 3, 'Atlanta, GA': 3, 'Cleveland, OH': 2, 'Newark, NJ': 3, 'Fresno, CA': 2 },
    health: { fillRate: 0.4, voiceShare: 0, timeToFillDays: 9, dropOff: 0.12 },
    trends: [
      { period: 'Wk 1', count: 2, avgSentiment: -0.4 },
      { period: 'Wk 2', count: 4, avgSentiment: -0.5 },
      { period: 'Wk 3', count: 5, avgSentiment: -0.3 },
      { period: 'Wk 4', count: 3, avgSentiment: -0.2 },
    ],
  },
  {
    id: 'vox-childcare',
    title: 'Navigating child care',
    prompt: 'Parents navigating child care and current/former licensed providers.',
    vertical: 'Family / Childcare',
    orgLabel: 'a family-economics nonprofit',
    mode: 'text',
    target: 40,
    collected: 15,
    themes: [
      {
        label: 'Cost and the subsidy cliff.',
        summary: 'Up-front costs, the benefits cliff, and infant-care scarcity put care out of reach even when a voucher existed.',
        weightPct: 40,
        answerCount: 6,
        sentiment: -0.5,
        quotes: [
          { code: 'R-2814', text: 'The subsidy cliff is brutal. I got a raise of $40 a week and lost a voucher worth $900 a month.', attrs: ['Detroit, MI', '$40–60k', 'Subsidy cliff'] },
          { code: 'R-2820b', text: 'Even the subsidized ones want money up front before the voucher kicks in.', attrs: ['Detroit, MI', '< $30k', 'Medicaid'] },
        ],
        demographics: { 'Parent of 2': 3, '< $30k': 3, 'Subsidy cliff': 1 },
      },
      {
        label: 'No visibility into open, trusted spots.',
        summary: 'Parents wanted a single source of truth for openings and safety; many built informal sitter-shares instead.',
        weightPct: 33,
        answerCount: 5,
        sentiment: -0.3,
        quotes: [
          { code: 'R-2811', text: 'A single calendar that shows which centers actually have open spots.', attrs: ['Detroit, MI', '< $40k', 'WIC'] },
          { code: 'R-2802', text: 'I share a sitter with two other moms on my block. We built what the system wouldn’t give us.', attrs: ['Newark, NJ', 'Parent of 2'] },
        ],
        demographics: { Parent: 5, 'WIC': 1 },
      },
      {
        label: 'Providers are leaving the work.',
        summary: 'Current and former licensed providers described stagnant pay and paperwork driving them out.',
        weightPct: 27,
        answerCount: 4,
        sentiment: -0.4,
        quotes: [
          { code: 'R-2808', text: 'I was a licensed provider for nine years and I closed because the paperwork paid less than the work.', attrs: ['Newark, NJ', '$40–60k', 'Former provider'] },
        ],
        demographics: { 'Former provider': 1, 'Current provider': 1 },
      },
    ],
    sentiment: { positive: 3, neutral: 5, negative: 7, avgIntensity: 0.49 },
    demographics: { Parent: 9, '< $30k': 5, '< $40k': 5, '$40–60k': 3, 'Spanish-speaking': 2, 'Single parent': 2, 'WIC': 1, 'Medicaid': 1, 'No car': 1, 'Infant': 1, 'Subsidy cliff': 1, 'Detroit, MI': 4, 'Cleveland, OH': 3, 'Newark, NJ': 3, 'Atlanta, GA': 2, 'Fresno, CA': 3 },
    health: { fillRate: 0.38, voiceShare: 0, timeToFillDays: 7, dropOff: 0.1 },
    trends: [
      { period: 'Wk 1', count: 4, avgSentiment: -0.3 },
      { period: 'Wk 2', count: 4, avgSentiment: -0.4 },
      { period: 'Wk 3', count: 4, avgSentiment: -0.2 },
      { period: 'Wk 4', count: 3, avgSentiment: -0.1 },
    ],
  },
  {
    id: 'vox-ell',
    title: 'English Language Learner stories',
    prompt: 'People who struggled in school because English wasn’t their first language.',
    vertical: 'Education',
    orgLabel: 'Education Fellowship',
    mode: 'voice',
    target: 30,
    collected: 12,
    themes: [
      {
        label: 'Mislabeled, not unable.',
        summary: 'English-only testing and placement read a language barrier as low ability, with lasting effects.',
        weightPct: 42,
        answerCount: 5,
        sentiment: -0.5,
        quotes: [
          { code: 'R-2796', text: 'They tested me in English and decided I had a learning disability. I didn’t. I had a language barrier.', attrs: ['Cleveland, OH', 'ELL', 'Immigrant'] },
          { code: 'R-2793', text: 'Los exámenes estandarizados no miden lo que sé. Miden mi inglés.', attrs: ['Fresno, CA', 'ELL', 'Spanish-speaking'] },
        ],
        demographics: { ELL: 5, 'Spanish-speaking': 2, Immigrant: 2 },
      },
      {
        label: 'Kids carried the household.',
        summary: 'Children translated forms, letters and medical visits for their families — adult responsibility at nine.',
        weightPct: 33,
        answerCount: 4,
        sentiment: -0.2,
        quotes: [
          { code: 'R-2799', text: 'I translated my own permission slips and my mom’s doctor letters at nine years old.', attrs: ['Detroit, MI', 'ELL', 'Child of immigrants'] },
        ],
        demographics: { ELL: 4, 'Child of immigrants': 1 },
      },
      {
        label: 'One teacher who tried.',
        summary: 'Positive turning points hinged on a single educator slowing down — and on reframing bilingualism as a strength.',
        weightPct: 25,
        answerCount: 3,
        sentiment: 0.5,
        quotes: [
          { code: 'R-2790', text: 'I tell them the thing nobody told me: your other language is a strength, not a problem.', attrs: ['Newark, NJ', 'ELL', 'Bilingual'] },
        ],
        demographics: { ELL: 3, Bilingual: 1 },
      },
    ],
    sentiment: { positive: 3, neutral: 3, negative: 6, avgIntensity: 0.46 },
    demographics: { ELL: 12, 'Spanish-speaking': 4, Immigrant: 3, '< $20k': 4, '< $30k': 4, '$40–60k': 2, 'No diploma': 1, Bilingual: 1, 'Child of immigrants': 1, 'Detroit, MI': 2, 'Cleveland, OH': 2, 'Newark, NJ': 3, 'Atlanta, GA': 2, 'Fresno, CA': 3 },
    health: { fillRate: 0.4, voiceShare: 1, timeToFillDays: 14, dropOff: 0.22 },
    trends: [
      { period: 'Wk 1', count: 3, avgSentiment: -0.3 },
      { period: 'Wk 2', count: 3, avgSentiment: -0.2 },
      { period: 'Wk 3', count: 3, avgSentiment: 0 },
      { period: 'Wk 4', count: 3, avgSentiment: 0.1 },
    ],
  },
  {
    id: 'vox-contractor',
    title: 'Financial operating systems for small contractors',
    prompt: 'Owners of small, often family-owned contracting businesses.',
    vertical: 'SMB / Economic mobility',
    orgLabel: 'an economic-mobility lab',
    mode: 'text',
    target: 30,
    collected: 12,
    themes: [
      {
        label: 'Cash flow is the killer.',
        summary: 'Net-60 paydays against weekly payroll forced owners onto credit cards the bank wouldn’t replace with credit.',
        weightPct: 41,
        answerCount: 5,
        sentiment: -0.4,
        quotes: [
          { code: 'R-2784', text: 'The job’s done but the GC pays in 60 days, and my guys need to eat on Friday.', attrs: ['Detroit, MI', '$40–60k', 'Employer'] },
          { code: 'R-2781', text: 'The bank wouldn’t give me a line of credit because my income is lumpy. So I run the business on three credit cards.', attrs: ['Fresno, CA', 'Thin credit'] },
        ],
        demographics: { 'Small-business owner': 3, '$40–60k': 3, 'Thin credit': 1 },
      },
      {
        label: 'One ledger that fits a one-person shop.',
        summary: 'Owners wanted a single view of owed/owing/take-home — not $200/mo tools that assume an office manager.',
        weightPct: 34,
        answerCount: 4,
        sentiment: -0.2,
        quotes: [
          { code: 'R-2778', text: 'I just want one place that shows what I’m owed, what I owe, and what’s actually mine to take home.', attrs: ['Detroit, MI', '< $40k', 'Contractor'] },
        ],
        demographics: { Contractor: 4 },
      },
      {
        label: 'Built on family labor.',
        summary: 'Spouses did the books at night; relief came only when owners could finally afford part-time help.',
        weightPct: 25,
        answerCount: 3,
        sentiment: 0,
        quotes: [
          { code: 'R-2774', text: 'When I finally hired a part-time bookkeeper my stress dropped overnight. I just couldn’t afford her until year four.', attrs: ['Detroit, MI', 'Family business', 'Employer'] },
        ],
        demographics: { 'Family business': 2, Employer: 2 },
      },
    ],
    sentiment: { positive: 2, neutral: 5, negative: 5, avgIntensity: 0.4 },
    demographics: { 'Small-business owner': 6, Contractor: 6, '$40–60k': 6, '< $40k': 4, 'Family business': 2, Employer: 2, 'Thin credit': 1, 'Spanish-speaking': 1, 'Detroit, MI': 3, 'Cleveland, OH': 2, 'Newark, NJ': 2, 'Atlanta, GA': 2, 'Fresno, CA': 2 },
    health: { fillRate: 0.4, voiceShare: 0, timeToFillDays: 6, dropOff: 0.08 },
    trends: [
      { period: 'Wk 1', count: 3, avgSentiment: -0.2 },
      { period: 'Wk 2', count: 3, avgSentiment: -0.3 },
      { period: 'Wk 3', count: 3, avgSentiment: -0.1 },
      { period: 'Wk 4', count: 3, avgSentiment: 0.1 },
    ],
  },
];

// Cross-org synthesis — INTERNAL (RBL1) ONLY (brief §2/§7 #6).
export const CROSS_ORG = {
  themes: [
    {
      label: 'Eligible on paper, blocked in practice.',
      summary: 'Across every vertical, people qualified for help they couldn’t actually reach — waitlists, up-front costs, paperwork, distance. The benefit exists; the path to it doesn’t.',
      weightPct: 34,
      answerCount: 23,
      sentiment: -0.55,
      quotes: [
        { code: 'R-2825', text: 'Respite care exists on paper but the waitlist is eleven months long.', attrs: ['Caregiver'] },
        { code: 'R-2820b', text: 'Even the subsidized ones want money up front before the voucher kicks in.', attrs: ['Childcare'] },
      ],
      demographics: { '< $30k': 12, '< $40k': 9, Medicaid: 3 },
    },
    {
      label: 'One person who tried changed the outcome.',
      summary: 'The difference between a bad and survivable experience was repeatedly a single caring individual — a PA, a teacher, a bookkeeper — not a program.',
      weightPct: 26,
      answerCount: 18,
      sentiment: 0.35,
      quotes: [
        { code: 'R-2832', text: 'One person made the whole place survivable.', attrs: ['Correctional'] },
        { code: 'R-2790', text: 'One teacher slowed down and drew pictures for me. That’s the year I caught up.', attrs: ['ELL'] },
      ],
      demographics: { 'Justice-involved': 4, ELL: 3 },
    },
    {
      label: 'Language is an unpriced tax.',
      summary: 'Spanish-speaking respondents across childcare, education and contracting paid a recurring cost in missed deadlines, untranslated forms, and lost trust.',
      weightPct: 22,
      answerCount: 15,
      sentiment: -0.3,
      quotes: [
        { code: 'R-2793', text: 'When the school sent letters home only in English, my family missed every deadline.', attrs: ['ELL'] },
      ],
      demographics: { 'Spanish-speaking': 9, ELL: 7 },
    },
    {
      label: 'People build what systems won’t.',
      summary: 'Sitter-shares, church respite, family bookkeeping — informal networks repeatedly filled the gap formal services left.',
      weightPct: 18,
      answerCount: 13,
      sentiment: 0.1,
      quotes: [
        { code: 'R-2802', text: 'I share a sitter with two other moms on my block. We built what the system wouldn’t give us.', attrs: ['Childcare'] },
      ],
      demographics: { Parent: 5, Caregiver: 4 },
    },
  ] as Theme[],
  trends: [
    { period: 'Wk 1', count: 15, avgSentiment: -0.34 },
    { period: 'Wk 2', count: 19, avgSentiment: -0.42 },
    { period: 'Wk 3', count: 20, avgSentiment: -0.22 },
    { period: 'Wk 4', count: 15, avgSentiment: -0.08 },
  ] as TrendPoint[],
  sentiment: { positive: 12, neutral: 20, negative: 37, avgIntensity: 0.51 } as Sentiment,
};

// Urgent signals — INTERNAL (RBL1) ONLY (brief §5.4). Never served to org view.
export const SIGNALS: Signal[] = [
  { code: 'R-2835', type: 'safety_crisis', severity: 'high', rationale: 'expression of not wanting to live', session: 'Correctional Healthcare', text: 'I honestly don’t want to be here anymore. Nobody inside would listen and I don’t know who to tell now that I’m out.', status: 'new' },
  { code: 'R-2821', type: 'safety_crisis', severity: 'high', rationale: 'acute distress', session: 'Caregiver', text: 'I can’t take this anymore. Some mornings I sit in the car and just cry before I go back inside.', status: 'new' },
  { code: 'R-2831', type: 'fraud_spam', severity: 'medium', rationale: 'non-substantive templated answer', session: 'Correctional Healthcare', text: 'great', status: 'new' },
  { code: 'R-2817', type: 'fraud_spam', severity: 'high', rationale: 'gibberish / keyboard-mash', session: 'Caregiver', text: 'asdf asdf asdf', status: 'new' },
  { code: 'R-2806', type: 'fraud_spam', severity: 'high', rationale: 'spam / link injection', session: 'Navigating child care', text: 'free money click here', status: 'new' },
  { code: 'R-2792', type: 'fraud_spam', severity: 'medium', rationale: 'repeated-token / low-entropy answer', session: 'ELL stories', text: 'test test test test', status: 'new' },
  { code: 'R-2773', type: 'fraud_spam', severity: 'medium', rationale: 'gibberish / keyboard-mash', session: 'Small contractors', text: 'aaaaa', status: 'new' },
];
