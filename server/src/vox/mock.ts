// Synthetic mock data (brief §8). There is no live traffic yet, so Vox is driven
// by synthetic answers. The five SESSION TOPICS are real (drawn from RBL1's past
// engagement sessions); the ANSWERS are synthetic — realistic voices for a
// low-income, lived-experience population, varied in length/sentiment/demographic.
//
// Orgs are labelled with NEUTRAL descriptors (brief §8.2) — never the real
// coordinator names. Planted triggers (brief §8.3) prove the urgent-signal path;
// one deliberately thin demographic slice (brief §8.4) proves §6 suppression.

export type MockAnswer = {
  text: string;
  lang?: 'en' | 'es';
  attrs: string[]; // anonymized chips: city-level geo, income band, benefit, lived-exp, kids, language
  mode: 'text' | 'voice';
  // planted trigger for the urgent-signal demo, if any (brief §8.3)
  plant?: 'safety_crisis' | 'fraud_spam';
};

export type MockSession = {
  id: string;
  title: string;
  prompt: string;
  vertical: string;
  orgLabel: string; // neutral coordinator descriptor (§8.2)
  mode: 'text' | 'voice';
  target: number;
  answers: MockAnswer[];
};

// Demographic chip pools used to vary profiles across answers.
const CITY = ['Detroit, MI', 'Cleveland, OH', 'Newark, NJ', 'Atlanta, GA', 'Fresno, CA'];
const INCOME = ['< $20k', '< $30k', '< $40k', '$40–60k'];

export const SESSIONS: MockSession[] = [
  // 1) Correctional Healthcare — Justice / Health
  {
    id: 'vox-correctional',
    title: 'Correctional Healthcare',
    prompt: 'Discussing your experience with healthcare while incarcerated.',
    vertical: 'Justice / Health',
    orgLabel: 'Health Research Org',
    mode: 'voice',
    target: 40,
    answers: [
      { text: 'I put in three sick-call slips for a tooth that was abscessed. By the time anyone saw me, half my jaw was swollen. They gave me ibuprofen and sent me back.', attrs: ['Cleveland, OH', '< $20k', 'Justice-involved', 'Medicaid'], mode: 'voice' },
      { text: 'The nurses were actually kind. The problem was never the people, it was that there was one of them for the whole unit.', attrs: ['Detroit, MI', '< $30k', 'Justice-involved'], mode: 'voice' },
      { text: 'They took me off my blood pressure meds for two weeks because the paperwork didn’t transfer. Nobody would tell me why.', attrs: ['Newark, NJ', '< $20k', 'Justice-involved', 'Chronic condition'], mode: 'voice' },
      { text: 'You learn fast that saying you’re in pain gets you labeled a drug-seeker. So you stop asking and you just sit with it.', attrs: ['Atlanta, GA', '< $30k', 'Justice-involved'], mode: 'voice' },
      { text: 'Honestly the mental health side was nonexistent. I asked to talk to someone for months. I am out now and I still carry that.', attrs: ['Fresno, CA', '< $20k', 'Justice-involved', 'Veteran'], mode: 'voice' },
      { text: 'Co-pay was five dollars a visit. Doesn’t sound like much until you make twelve cents an hour. People rationed their own care.', attrs: ['Cleveland, OH', '< $20k', 'Justice-involved'], mode: 'voice' },
      { text: 'I honestly don’t want to be here anymore. Nobody inside would listen and I don’t know who to tell now that I’m out.', attrs: ['Detroit, MI', '< $20k', 'Justice-involved'], mode: 'voice', plant: 'safety_crisis' },
      { text: 'They lost my insulin schedule during a transfer. I was throwing up for a day before anyone checked my sugar.', attrs: ['Newark, NJ', '< $30k', 'Justice-involved', 'Chronic condition'], mode: 'voice' },
      { text: 'When I got out nobody gave me my records or a single prescription to bridge me. I walked out with nothing.', attrs: ['Atlanta, GA', '< $20k', 'Justice-involved', 'Reentry'], mode: 'voice' },
      { text: 'The one good thing: a PA who actually remembered my name and followed up. One person made the whole place survivable.', attrs: ['Fresno, CA', '< $30k', 'Justice-involved'], mode: 'voice' },
      { text: 'great', attrs: ['Detroit, MI', '< $30k', 'Justice-involved'], mode: 'text', plant: 'fraud_spam' },
      { text: 'I had a lump for months and kept being told to fill out another form. Out here a doctor saw it in one visit and was alarmed.', attrs: ['Cleveland, OH', '< $20k', 'Justice-involved', 'Woman'], mode: 'voice' },
      { text: 'Dental was the worst. Their only fix for anything was to pull the tooth. I lost three I could have kept.', attrs: ['Newark, NJ', '< $20k', 'Justice-involved'], mode: 'voice' },
      { text: 'I felt invisible in there. Like my body wasn’t worth the paperwork.', attrs: ['Atlanta, GA', '< $30k', 'Justice-involved'], mode: 'voice' },
      { text: 'Getting my chronic meds restarted after release took six weeks of phone calls. Six weeks off medication I need daily.', attrs: ['Fresno, CA', '< $20k', 'Reentry', 'Chronic condition'], mode: 'voice' },
      { text: 'They’d call it a clinic visit but it was a guard standing there the whole time. You don’t say what’s really wrong.', attrs: ['Detroit, MI', '< $30k', 'Justice-involved'], mode: 'voice' },
    ],
  },
  // 2) Caregiver — Health / Caregiving
  {
    id: 'vox-caregiver',
    title: 'Caregiver for an aging or disabled family member',
    prompt: 'Accessing respite care, support groups, and educational materials.',
    vertical: 'Health / Caregiving',
    orgLabel: 'a foundation-housed venture studio',
    mode: 'text',
    target: 35,
    answers: [
      { text: 'I haven’t had a full night’s sleep in two years. Respite care exists on paper but the waitlist is eleven months long.', attrs: ['Atlanta, GA', '< $30k', 'Caregiver', 'Parent of 2'], mode: 'text' },
      { text: 'Nobody explained how to lift my mother safely. I threw my back out and now I’m the one who needs care.', attrs: ['Detroit, MI', '< $40k', 'Caregiver'], mode: 'text' },
      { text: 'The support group on Thursdays saved me. Just being in a room with people who get it.', attrs: ['Cleveland, OH', '$40–60k', 'Caregiver'], mode: 'text' },
      { text: 'I quit my job to care for my dad and now we’re both on my mom’s income. The system pays strangers but not family.', attrs: ['Newark, NJ', '< $30k', 'Caregiver', 'Lost income'], mode: 'text' },
      { text: 'I can’t take this anymore. Some mornings I sit in the car and just cry before I go back inside.', attrs: ['Fresno, CA', '< $20k', 'Caregiver'], mode: 'text', plant: 'safety_crisis' },
      { text: 'Everything is a PDF written at a college reading level. I just need a one-page checklist of what to do.', attrs: ['Atlanta, GA', '< $30k', 'Caregiver', 'ELL'], mode: 'text' },
      { text: 'Medicaid covered the home aide but she quit and they took three months to send another. I covered those months alone.', attrs: ['Detroit, MI', '< $30k', 'Caregiver', 'Medicaid'], mode: 'text' },
      { text: 'asdf asdf asdf', attrs: ['Cleveland, OH', '< $40k', 'Caregiver'], mode: 'text', plant: 'fraud_spam' },
      { text: 'I love him, he’s my husband, but dementia means I’ve lost the person and gained a full-time job at the same time.', attrs: ['Newark, NJ', '$40–60k', 'Caregiver', 'Senior'], mode: 'text' },
      { text: 'A free training on managing medications would change my life. I’m terrified I’ll mix up his pills.', attrs: ['Fresno, CA', '< $30k', 'Caregiver'], mode: 'text' },
      { text: 'The respite voucher was great when I finally got it. The problem was every approved provider was an hour away.', attrs: ['Atlanta, GA', '< $40k', 'Caregiver', 'No car'], mode: 'text' },
      { text: 'I’m 19 and caring for my disabled brother while my mom works two jobs. There’s nothing out there built for someone my age.', attrs: ['Detroit, MI', '< $20k', 'Caregiver', 'Youth caregiver'], mode: 'text' },
      { text: 'They keep sending me to a hotline that sends me to a website that sends me to a form. I gave up.', attrs: ['Cleveland, OH', '< $30k', 'Caregiver'], mode: 'text' },
      { text: 'My church group does more real respite than any agency. They just show up and sit with her.', attrs: ['Newark, NJ', '< $40k', 'Caregiver'], mode: 'text' },
    ],
  },
  // 3) Navigating child care — Family / Childcare
  {
    id: 'vox-childcare',
    title: 'Navigating child care',
    prompt: 'Parents navigating child care and current/former licensed providers.',
    vertical: 'Family / Childcare',
    orgLabel: 'a family-economics nonprofit',
    mode: 'text',
    target: 40,
    answers: [
      { text: 'A single calendar that shows which centers actually have open spots. I call ten places and they’re all full or never call back.', attrs: ['Detroit, MI', '< $40k', 'Parent of 2', 'WIC'], mode: 'text' },
      { text: 'Cost. Even the subsidized ones want money up front before the voucher kicks in, and I don’t have it on the 1st.', attrs: ['Detroit, MI', '< $30k', 'Single parent', 'Medicaid'], mode: 'text' },
      { text: 'Hours. Everything closes at 5 and my shift ends at 6. Night-shift parents have nothing.', attrs: ['Cleveland, OH', '< $40k', 'Parent', 'Works nights'], mode: 'text' },
      { text: 'I was a licensed provider for nine years and I closed because the paperwork paid less than the work. The state made it impossible.', attrs: ['Newark, NJ', '$40–60k', 'Former provider'], mode: 'text' },
      { text: 'Transportation. The good center is 40 minutes by bus each way. By the time I drop off I’m late for work.', attrs: ['Atlanta, GA', '< $30k', 'No car', 'Parent'], mode: 'text' },
      { text: 'Honestly just knowing it’s safe. I toured one place that scared me. I’d pay for trust.', attrs: ['Fresno, CA', '< $40k', 'Parent of 1'], mode: 'text' },
      { text: 'The subsidy cliff is brutal. I got a raise of $40 a week and lost a voucher worth $900 a month.', attrs: ['Detroit, MI', '$40–60k', 'Parent of 3', 'Subsidy cliff'], mode: 'text' },
      { text: 'My provider speaks Spanish and that’s the only reason I trust leaving my son. Finding that is almost impossible.', attrs: ['Cleveland, OH', '< $30k', 'Spanish-speaking', 'Parent of 2'], lang: 'es', mode: 'text' },
      { text: 'I run a home daycare and I love these kids, but I haven’t had a raise in five years while my food costs doubled.', attrs: ['Newark, NJ', '< $40k', 'Current provider'], mode: 'text' },
      { text: 'Waitlists. I got on three lists when I was pregnant and my daughter is two now with no spot.', attrs: ['Atlanta, GA', '< $30k', 'Parent of 1'], mode: 'text' },
      { text: 'free money click here', attrs: ['Fresno, CA', '< $40k', 'Parent'], mode: 'text', plant: 'fraud_spam' },
      { text: 'Infant care specifically. Everyone takes 3-and-up. For under-1 there is basically nothing I can afford.', attrs: ['Detroit, MI', '< $30k', 'Parent of 1', 'Infant'], mode: 'text' },
      { text: 'The application was 14 pages and needed documents I had to take a day off work to go get in person.', attrs: ['Cleveland, OH', '< $40k', 'Single parent'], mode: 'text' },
      { text: 'I share a sitter with two other moms on my block. We built what the system wouldn’t give us.', attrs: ['Newark, NJ', '< $40k', 'Parent of 2'], mode: 'text' },
      { text: 'Necesito cuidado infantil con horario flexible. Trabajo turnos que cambian cada semana y nada se ajusta a eso.', lang: 'es', attrs: ['Fresno, CA', '< $30k', 'Spanish-speaking', 'Parent of 2'], mode: 'text' },
    ],
  },
  // 4) English Language Learner stories — Education (some Spanish)
  {
    id: 'vox-ell',
    title: 'English Language Learner stories',
    prompt: 'People who struggled in school because English wasn’t their first language.',
    vertical: 'Education',
    orgLabel: 'Education Fellowship',
    mode: 'voice',
    target: 30,
    answers: [
      { text: 'They put me in the back of the class and basically forgot about me for a year. I wasn’t dumb, I just couldn’t follow yet.', attrs: ['Fresno, CA', '< $30k', 'ELL', 'Immigrant'], mode: 'voice' },
      { text: 'Me daba vergüenza levantar la mano. Sabía la respuesta pero no las palabras en inglés, y se reían.', lang: 'es', attrs: ['Newark, NJ', '< $20k', 'ELL', 'Spanish-speaking'], mode: 'voice' },
      { text: 'My parents couldn’t help with homework so I translated my own permission slips and my mom’s doctor letters at nine years old.', attrs: ['Detroit, MI', '< $30k', 'ELL', 'Child of immigrants'], mode: 'voice' },
      { text: 'One teacher slowed down and drew pictures for me. That’s the year I caught up. It only took one person trying.', attrs: ['Atlanta, GA', '< $40k', 'ELL'], mode: 'voice' },
      { text: 'They tested me in English and decided I had a learning disability. I didn’t. I had a language barrier.', attrs: ['Cleveland, OH', '< $20k', 'ELL', 'Immigrant'], mode: 'voice' },
      { text: 'Los exámenes estandarizados no miden lo que sé. Miden mi inglés. Reprobé cosas que entendía perfectamente.', lang: 'es', attrs: ['Fresno, CA', '< $30k', 'ELL', 'Spanish-speaking'], mode: 'voice' },
      { text: 'I dropped out at 16 because I was three grades behind and ashamed. Got my GED at 29. I wish someone had caught me earlier.', attrs: ['Newark, NJ', '< $20k', 'ELL', 'No diploma'], mode: 'voice' },
      { text: 'The ESL class was a closet with one aide for thirty kids speaking eight languages. It was babysitting, not teaching.', attrs: ['Detroit, MI', '< $30k', 'ELL'], mode: 'voice' },
      { text: 'My accent followed me into adulthood. People still talk slower and louder at me like I can’t think.', attrs: ['Atlanta, GA', '$40–60k', 'ELL', 'Immigrant'], mode: 'voice' },
      { text: 'test test test test', attrs: ['Cleveland, OH', '< $30k', 'ELL'], mode: 'voice', plant: 'fraud_spam' },
      { text: 'When the school sent letters home only in English, my family missed every deadline. Nobody offered to translate.', attrs: ['Fresno, CA', '< $20k', 'ELL', 'Spanish-speaking'], mode: 'voice' },
      { text: 'I’m bilingual now and I tutor ELL kids. I tell them the thing nobody told me: your other language is a strength, not a problem.', attrs: ['Newark, NJ', '< $40k', 'ELL', 'Bilingual'], mode: 'voice' },
    ],
  },
  // 5) Financial operating systems for small contractors — SMB / Economic mobility
  {
    id: 'vox-contractor',
    title: 'Financial operating systems for small contractors',
    prompt: 'Owners of small, often family-owned contracting businesses.',
    vertical: 'SMB / Economic mobility',
    orgLabel: 'an economic-mobility lab',
    mode: 'text',
    target: 30,
    answers: [
      { text: 'I do my books in a shoebox and a notebook. By tax time I’ve lost half my receipts and probably overpay every year.', attrs: ['Atlanta, GA', '$40–60k', 'Small-business owner', 'Contractor'], mode: 'text' },
      { text: 'Cash flow is the killer. The job’s done but the GC pays in 60 days, and my guys need to eat on Friday.', attrs: ['Detroit, MI', '$40–60k', 'Small-business owner', 'Employer'], mode: 'text' },
      { text: 'Every software wants $200 a month and assumes I have an office manager. I’m the estimator, the foreman, and the bookkeeper.', attrs: ['Cleveland, OH', '< $40k', 'Small-business owner'], mode: 'text' },
      { text: 'Bidding is a guess. I have no idea what my real costs are per job, so I either lose the bid or lose money winning it.', attrs: ['Newark, NJ', '$40–60k', 'Contractor'], mode: 'text' },
      { text: 'The bank wouldn’t give me a line of credit because my income is lumpy. So I run the business on three credit cards.', attrs: ['Fresno, CA', '< $40k', 'Small-business owner', 'Thin credit'], mode: 'text' },
      { text: 'It’s a family business. My wife does invoices at night after her own shift. We’re both exhausted.', attrs: ['Atlanta, GA', '$40–60k', 'Family business'], mode: 'text' },
      { text: 'I just want one place that shows what I’m owed, what I owe, and what’s actually mine to take home. That doesn’t exist for guys like me.', attrs: ['Detroit, MI', '< $40k', 'Contractor'], mode: 'text' },
      { text: 'Quotes in English are fine but my suppliers and half my crew work in Spanish. Nothing handles both.', attrs: ['Fresno, CA', '< $40k', 'Spanish-speaking', 'Contractor'], lang: 'es', mode: 'text' },
      { text: 'I missed a quarterly tax payment I didn’t know I owed and the penalty wiped out a month of profit.', attrs: ['Newark, NJ', '$40–60k', 'Small-business owner'], mode: 'text' },
      { text: 'Honestly I don’t trust apps with my money after I got burned by one that held my deposits for a week.', attrs: ['Cleveland, OH', '< $40k', 'Contractor'], mode: 'text' },
      { text: 'aaaaa', attrs: ['Atlanta, GA', '$40–60k', 'Contractor'], mode: 'text', plant: 'fraud_spam' },
      { text: 'When I finally hired a part-time bookkeeper my stress dropped overnight. I just couldn’t afford her until year four.', attrs: ['Detroit, MI', '$40–60k', 'Employer', 'Family business'], mode: 'text' },
    ],
  },
];

// Flatten sessions to ~100 answers. Each becomes a coded id (R-####) at the data
// layer, exactly like the org responses surface (org.ts).
export function allMockAnswers(): { session: MockSession; answer: MockAnswer; index: number }[] {
  const out: { session: MockSession; answer: MockAnswer; index: number }[] = [];
  let i = 0;
  for (const s of SESSIONS) for (const a of s.answers) out.push({ session: s, answer: a, index: i++ });
  return out;
}

export const MOCK_CITIES = CITY;
export const MOCK_INCOME = INCOME;
