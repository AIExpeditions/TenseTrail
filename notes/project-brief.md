# TenseTrail: project brief

Paste the "Project instructions" section into the Project's custom instructions. Add this file and `tensetrail-site.html` to the Project knowledge.

## Project instructions (paste this)

You are helping me build TenseTrail, an English-learning website for adult learners (A1 to C1) with an Adelaide and Australian everyday-life context.

- The site is ONE self-contained HTML file (`tensetrail-site.html`), published as a private Claude artifact. Always edit the latest file and republish to the same artifact so the link stays the same.
- Style: warm, positive, elegant. Purposeful motion and animation that supports understanding. Works on mobile (no horizontal scroll). Respect reduced-motion and dark mode.
- Lessons follow this order: Notice, Rule (4-step mini lesson: idea, see it move, everyday talk, speak), Common mistakes (red/green traffic lights, no strikethroughs), Hear it in real life (large text, generator button), Practise, Write, Watch (one verified YouTube link-out), Remember (spaced review).
- Language: Australian English. Audio has an accent choice (Australian default, British, American) in the 🔊 header menu, with separate male and female voices matched to each speaker's gender. British and American can use in-browser Kokoro studio voices (Apache 2.0, about 90 MB once). Australian uses the device's best Australian voice (no free open Australian model exists).
- Conversation rule: every conversation (Hear it in real life, everyday talk in mini lessons, the generator, Conversation Studio and any future conversational item) has exactly two speakers, one man and one woman, each shown with a name and spoken with a voice that matches their gender.
- Video rule: for each lesson, compare several on-topic candidates and pick the one with the most (or very high) views and likes. Aim for at least 100,000 views; never use a video with only a few hundred or thousand views when a well-watched one exists. Topic fit still comes first. Record views and likes in the brief.
- Before publishing: check grammar and level fit, check every video link with YouTube oEmbed (title and channel), run a headless browser click-through (all routes, practice, mobile width, no errors), then republish.
- Be honest about limits: audio uses the browser's built-in voices (quality varies; Edge "Natural" voices are best). I cannot watch videos, so a teacher should review them.

## What exists (published Version 15)

- Home site with hash routing (Students, Teachers, Skills, Guided path, Library, English Skills).
- Tense Studio: 12 tenses, quizzes (15 questions), mixed quizzes, saved progress, conversation practice with Adelaide scenes, 3 levels, voice picker for male/female Australian voices, a robust speech layer for Edge.
- General Grammar map: 10 areas, about 80 concepts. Open now: Verb tenses and Sentences and questions.
- Sentences and questions (10 lessons, A1 to C1): word order and commands; question forms; there is/there are; question tags; defining relative clauses; non-defining relative clauses; participle clauses; emphasis (cleft sentences, inversion, auxiliaries); inversion after negative adverbials; ellipsis. Each lesson has a verified video, a 9-question practice set and a spaced-review box (1, 3, 7, 14, 30 days, saved on the device).
- Other files: four Present PowerPoint decks, a Present tenses lesson, a Present motion graphic.

## Modal verbs (added in Version 16)

Nine lessons, A1 to C1, in the same eight-step format, with their own saved progress and review box: can and can't; should and shouldn't (advice); past ability; permission and obligation; deductions about the present; deductions about the past; the future: degrees of certainty; past modals (should have, could have, would have); modals: probability. The engine now serves both open areas, so the next area only needs its data.

## Conditionals and wishes (added in Version 17)

Seven lessons, A2 to C1: zero and first; second; unless, as long as and in case; third and mixed; wish and if only; inversion and conditionals; unreal time. The old map item "Conditionals: zero, first and second" was split into two lessons.

Research on the lesson format: reports/Lesson format for grammar teaching.md

## The six remaining grammar areas (added 30 October 2026)

43 lessons in the same eight-step format, A1 to C1: Passive and reported speech (6), Verb patterns and phrasal verbs (8), Nouns, pronouns and articles (11), Adjectives and adverbs (9), Prepositions and linking words (6), Writing and usage (3). Every grammar area on the map now has lessons.

## Find Your Level, 20-item practice, feedback, search and teacher tools (added 31 October 2026)

**Find Your Level** (English Skills menu, `#/level`) is a computer-adaptive placement test, A1 to C2.
- Model: 3-parameter logistic IRT with fixed slope (a = 1.4) and guessing (c = 0.25 for four options). Difficulties come from each item's target level (A1 -2.6, A2 -1.4, B1 -0.2, B2 1.0, C1 2.2, C2 3.4 logits, spread ±0.3 within a level). They are expert estimates, not calibrated on real learners yet.
- Start: an optional CEFR "can do" self-assessment sets the prior (DIALANG-style); "not sure" starts at B1.
- Scoring: EAP ability estimate on a grid after every answer, with its standard error.
- Item choice: most information at the current estimate, picked at random from the best 3 (exposure control), with content balancing (grammar 38%, vocabulary 22%, everyday language 10%, reading 15%, listening 15%). Only one question per reading passage.
- Stop: SE 0.45 or less after at least 15 items, or 30 items. "I don't know" is offered to reduce guessing; very fast answering is flagged.
- Bank: 128 items (grammar, vocabulary, functional language, 8 reading passages, 18 two-speaker listening dialogues, one man and one woman each, max two plays).
- Result: CEFR level with low/mid/high, 0 to 100 score, 80% range, skills profile, weak grammar areas, "start here" lesson links, answer review, history on the device, resume after stopping.
- Simulation (150 simulated learners per level, answering by the model): exact level 67 to 78%, within one level 100%, 20 to 24 questions on average. This only shows the engine works under its own assumptions. Real calibration needs data from real learners.
- Sources: Cambridge Linguaskill adaptive design; Rasch CAT stopping rules (rasch.org); DIALANG self-assessment.

**Practice** now has 20 questions per lesson in six styles: choose (4), which is correct (2 or 3), type the missing word (3), build the sentence (6), correct the mistake (1 or 2), listen and type (3, three plays). Mistakes that differ only in punctuation become "which is correct" items. Contractions are accepted either way when typing.

**Speaking and writing feedback** (user chose the hybrid):
- On the device, for everyone: word and sentence counts, 24 common learner-error patterns, capital letters and full stops, and whether the lesson's target grammar words appear. Speech recognition (Chrome, Edge, Safari) fills the text in Speak mode, and the Notice step has a read-aloud check showing which words the computer understood.
- Claude, for signed-in claude.ai viewers who allow it (artifact `sample` capability): marks against five CEFR-based criteria with a level for each, quoted corrections, two strengths, two next steps and an improved version. The page drops any correction that does not quote the learner's exact words. Pronunciation is never judged.

**Smart search** (header button, "/" or Ctrl+K, and on the Grammar Studio page): indexes 69 lessons, 12 tenses, 9 tense map topics, 10 areas and 6 pages with aliases. Typo tolerant (Damerau-Levenshtein, prefix and trigram), "Did you mean", keyboard navigation.

**From the improvement plan:** Continue button, streak and weekly goal on the Grammar Studio page; sticky step bar on each lesson with "skip to practice"; Worksheet PDF for every lesson (six sections plus answer key); Presentation mode (big-text slides with reveal, arrow keys or swipe); area cheat sheet PDF; 20-question area test with a certificate PDF at 16/20. Not done (need a server or more content): accounts, class codes and results, teacher notes, quiz builder, class game mode, ACSF mapping, translations.

## Lesson videos (re-picked 31 October 2026 by views and likes)

Counts come from the Return YouTube Dislike API, which mirrors YouTube's public view and like numbers, on 31 October 2026. Titles and channels were checked with oEmbed. Video content was not watched. One lesson is under 100,000 views: Ellipsis (59,000), the most-watched on-topic video found.

### Sentences and questions

| Lesson | Level | ID | Title | Channel | Views | Likes |
|---|---|---|---|---|---|---|
| Basic word order and commands | A1 | OserH3YLBgg | English Sentence Structure: Subject, Verb, Object (SVO) | English Evolution Step 1 | 101,653 | 1,589 |
| Question forms | A2 | nsBneISa-Y0 | Mini English Lessons: How to form questions in English | British Council France | 216,168 | 4,235 |
| There is and there are | A2 | buj0TVeyj7k | When to Use 'There is' or 'There are' in English | EnglishTonight | 338,592 | 2,749 |
| Question tags | B1 | plvBNpPKkTc | Grammar: Question tags - BBC English Masterclass | BBC Learning English | 171,283 | 3,339 |
| Relative clauses: defining | B1 | 1iC_rULeuZc | Defining relative clauses - 6 Minute Grammar | BBC Learning English | 206,678 | 3,499 |
| Relative clauses: non-defining | B1 | a_mFlafGyy8 | Defining and Non-Defining Relative Clauses - English Grammar Lesson | Oxford English Now | 822,866 | 18,071 |
| Participle clauses | C1 | RuTSOQ9kIdY | Participle clauses: BBC English Class | BBC Learning English | 108,201 | 2,606 |
| Emphasis: cleft sentences, inversion and auxiliaries | C1 | P7dcdEoNA_E | Grammar: Giving emphasis in English - BBC English Masterclass | BBC Learning English | 230,736 | 4,684 |
| Inversion after negative adverbials | C1 | TO2CtYcFYWg | “Never have I”, “Little did I know”, “Not only is” / English Word Order Inversion | Learn English with Gill · engVid | 216,942 | 5,334 |
| Ellipsis | C1 | K5l-sdHmEH4 | Informal English with ellipsis | Canguro English | 59,032 | 2,118 |

### Modal verbs

| Lesson | Level | ID | Title | Channel | Views | Likes |
|---|---|---|---|---|---|---|
| Can, can't and other basic modals | A1 | SeLYwHeOodM | Can Can't Cannot / Learn English Grammar / Basic English Lesson by Woodward English | Woodward English | 1,146,802 | 13,916 |
| Should and shouldn't: advice | A2 | -N9te6dUqjw | SHOULD or SHOULDN'T for Giving Advice, Suggestions, and Opinions / English Modal Verbs | Sparkle English | 210,948 | 2,526 |
| Past ability: could, was able to, managed to | B1 | _X-9UGsR8T0 | Could vs Was able to - English In A Minute | BBC Learning English | 132,209 | 3,190 |
| Modals: permission and obligation | B1 | HUXXgVElADg | 'Have To' and 'must' - 6 Minute Grammar | BBC Learning English | 167,257 | 4,114 |
| Modals: deductions about the present | B1 | u6hEQdGGMuc | How to use modal verbs of deduction - English In A Minute | BBC Learning English | 233,156 | 4,966 |
| Modals: deductions about the past | B1 | hBogiz8JWWo | An Introduction to Past Modals: must have, should have, would have, and could have | Learn English with Bob the Canadian | 206,046 | 10,282 |
| The future: degrees of certainty | B1 | 15gAhQ0q0Mc | How to use "Bound to" - English Grammar | Learn English with Papa Teach Me | 152,437 | 6,971 |
| Past modals: should have, could have, would have | B2 | 56Gsym70j-A | Using Would Have, Could Have, Should Have - English Grammar Lesson | Oxford Online English | 626,265 | 13,842 |
| Modals: probability | C1 | ZXN3wROCpfs | 'May', 'might' and 'could' - 6 Minute Grammar | BBC Learning English | 185,417 | 4,483 |

### Conditionals and wishes

| Lesson | Level | ID | Title | Channel | Views | Likes |
|---|---|---|---|---|---|---|
| Conditionals: zero and first | A2 | K-MKAjvvcsw | How to use the zero and first conditional - 6 Minute Grammar | BBC Learning English | 108,899 | 1,530 |
| Conditionals: second | B1 | 3OuqzHxlrHc | The second conditional - 6 Minute Grammar | BBC Learning English | 156,566 | 3,173 |
| Unless, as long as and in case | B1 | Or_Zm7QdSgc | 'Unless' vs 'As long as': What's the difference? English In A Minute | BBC Learning English | 109,139 | 3,694 |
| Conditionals: third and mixed | B2 | P4_kqBsj2sE | How to use the third conditional - 6 Minute Grammar | BBC Learning English | 149,516 | 2,410 |
| Wishes: wish and if only | B2 | LJcXRxy-nDU | Grammar: 5 different ways to use 'wish' in English | BBC Learning English | 162,780 | 4,565 |
| Inversion and conditionals | C1 | 4K0npnSYjJE | English Grammar - Inversion: "Had I known...", "Should you need..." | Adam’s English Lessons · engVid | 1,079,928 | 24,083 |
| Unreal time | C1 | QMAcLQ7joQo | English grammar - UNREAL PAST (if, if only, wish, it's time) | Your English Web | 118,944 | 2,778 |

### Passive and reported speech

| Lesson | Level | ID | Title | Channel | Views | Likes |
|---|---|---|---|---|---|---|
| Passives | B1 | nI5zaB6QL-o | Present and past passives - 6 Minute Grammar | BBC Learning English | 133,586 | 2,509 |
| Reported speech: statements | B1 | EHzsmf2vgws | Grammar: Introduction to Reported Speech | English with Jag | 220,461 | 1,470 |
| Reported speech: questions | B1 | Hm-Kls1n8h0 | Intermediate English #20: Reported Questions / Easy English at Home | Easy English at Home | 132,238 | 3,851 |
| Reported speech: reporting verbs | B1 | Pu_3OgQxe2s | 6 Minute Vocabulary: How to use English reporting verbs like 'insist', 'demand' and 'advise' | BBC Learning English | 130,383 | 1,955 |
| Advanced passives review | C1 | gSCHPqp_igs | Where to Use PASSIVE VOICE - Advanced English Grammar | Learn English Lab | 608,871 | 12,433 |
| Patterns with reporting verbs | C1 | dbpAP2Eeqs0 | Passive reporting structures: BBC English Class | BBC Learning English | 157,083 | 2,550 |

### Verb patterns and phrasal verbs

| Lesson | Level | ID | Title | Channel | Views | Likes |
|---|---|---|---|---|---|---|
| Verbs followed by -ing or infinitive | A2 | ohR163PgEK4 | Verb patterns - 6 Minute Grammar | BBC Learning English | 334,402 | 6,175 |
| Infinitive of purpose | A2 | DPmjYD6Qi5I | Learn English Grammar: Infinitives of Purpose | English with Alex · engVid | 191,800 | 5,906 |
| Verbs followed by -ing or infinitive: change of meaning | B1 | XZupSm_EyHA | Grammar: 'stop buying' or 'stop to buy'? - BBC English Masterclass | BBC Learning English | 244,000 | 5,563 |
| Verbs and prepositions | B1 | s_VjtqfAdX0 | PREPOSITIONS IN ENGLISH: Learn 20 Verbs with Prepositions | English with Alex · engVid | 325,275 | 15,087 |
| Phrasal verbs | B1 | Op0UETzQ6g0 | What is an English phrasal verb? Phrasal verbs with Georgie | BBC Learning English | 152,558 | 4,675 |
| Different uses of used to | B1 | BGVl_nTJY7A | USED TO/ BE USED TO/ GET USED TO - English grammar | Arnel's Everyday English | 1,301,827 | 49,528 |
| Past habits: used to, would and the past simple | B1 | tN35Lqcpsuk | “I used to…” & “I would…”: Talking about the past in English | English with Ronnie · EnglishLessons4U with engVid | 388,487 | 17,287 |
| Word order in phrasal verbs | C1 | FBmjH6nh5-k | How to use phrasal verbs type 1, 2, 3 & 4 - 6 Minute Grammar | BBC Learning English | 160,580 | 2,524 |

### Nouns, pronouns and articles

| Lesson | Level | ID | Title | Channel | Views | Likes |
|---|---|---|---|---|---|---|
| Personal pronouns and possessive adjectives | A1 | l89qYOSXKck | ESL Personal Pronouns and Possessive Adjectives | HELP - Helpful English Learning Place | 400,143 | 4,772 |
| Plural nouns | A1 | L4B7XxuJO6A | Singular & Plural Nouns – English Grammar Lessons | Ellii (formerly ESL Library) | 1,172,037 | 16,119 |
| This, that, these and those | A1 | RDVsQWJLlpM | This, that, these, those - Demonstratives | Crown Academy of English | 430,141 | 4,679 |
| Articles: a, an, the | A1 | ryRu8zFCKZE | Articles - 6 Minute Grammar | BBC Learning English | 128,211 | 3,294 |
| Articles: the or no article | A2 | azrYbrC-xXg | English Grammar: When NOT to use an article – 9 rules | Adam's English Lessons · engVid | 515,840 | 19,422 |
| Countable and uncountable nouns | A2 | xnG57RzZoIo | Countable and uncountable nouns: food. A Mini English Lesson | British Council / English | 197,343 | 2,630 |
| Quantifiers: few, a few, little, a bit of | A2 | gCklrNN80vI | Talking About Quantity in English - A FEW, A LITTLE, FEW, LITTLE | English with Alex · engVid | 477,954 | 5,308 |
| Possessive 's | A2 | 1LmIxiETWgM | Apostrophe S - Possessive Nouns in English | Woodward English | 473,747 | 8,018 |
| Reflexive pronouns | B1 | rcfNpTUIJjA | Using 'Myself', Yourself, Ourselves, Themselves Correctly - Reflexive Pronouns - Grammar lesson | Learn English / Let's Talk - Free English Lessons | 252,995 | 2,916 |
| Using enough | B1 | q4xfTdojGEM | How To Use TOO & ENOUGH / English Grammar Lesson | mmmEnglish | 608,281 | 15,129 |
| Possession and noun modifiers | C1 | gOrEF0RPpv0 | Don't Miss This! Introduction to Compound Nouns | English Rankers | 171,449 | 2,277 |

### Adjectives and adverbs

| Lesson | Level | ID | Title | Channel | Views | Likes |
|---|---|---|---|---|---|---|
| Adverbs of frequency | A1 | vAHD0rqlj8I | Adverbs of Frequency in English - Meaning, Word Order and Examples | Woodward English | 747,414 | 10,615 |
| Comparative adjectives | A2 | wXiD0FdON7k | Comparative Adjectives – English Grammar Lessons | Ellii (formerly ESL Library) | 2,263,890 | 33,314 |
| Superlative adjectives | A2 | yFWVbV3fd3I | English Grammar - Superlative Adjectives - biggest, best, most beautiful, etc. | English with Ronnie · EnglishLessons4U with engVid | 667,364 | 7,096 |
| Adjectives and prepositions | A2 | gN5HOpQDkOA | Adjectives and Prepositions / Learn British English with Lucy | English with Lucy | 814,555 | 23,980 |
| Adjectives ending in -ed and -ing | A2 | eFlQAEd_AKA | I am BORED or I am BORING? / Use -ED vs -ING Adjectives Correctly! | English with Lucy | 389,043 | 15,189 |
| Modifying comparatives | B1 | Fr83ObluJ2A | English Grammar: Modifying Comparatives - a lot, far more, much, a little, slightly | ENGLISH with James · engVid | 149,514 | 1,723 |
| Adjectives: gradable and non-gradable | B1 | _eGg9kc4u7g | Extreme Adjectives in English: English Grammar Lesson | Espresso English | 143,351 | 1,581 |
| Intensifiers: so and such | B1 | eTRrfTfnvY8 | English Grammar Lessons - Using So and Such / Learn English for Free | Learn English / Let's Talk - Free English Lessons | 268,431 | 4,505 |
| Using as and like | B1 | 6nDEvB5eWDU | English Grammar: Comparing with LIKE & AS | Adam's English Lessons · engVid | 861,636 | 19,934 |

### Prepositions and linking words

| Lesson | Level | ID | Title | Channel | Views | Likes |
|---|---|---|---|---|---|---|
| Linking words: and, but, because, so | A1 | rC1eKv7omas | And, But, So, Or, Because (conjunctions) | Mark Kulek ESL | 121,253 | 2,124 |
| Prepositions of place: in, on, at | A2 | wkmKA2zGn6k | Prepositions of place - in, at, on - English grammar / English In A Minute | BBC Learning English | 373,116 | 8,292 |
| Prepositions of time: at, in, on | A2 | fRrVkXG0-v4 | Prepositions of Time – English Grammar Lessons | Ellii (formerly ESL Library) | 1,392,888 | 22,554 |
| Contrasting ideas: although, despite | B1 | no_LhGoOvVs | English Grammar: Contrast Words, Although & Despite | Daniel Byrnes | 123,921 | 2,092 |
| Contrasting ideas (advanced) | C1 | PccESvY9H58 | Linking words of contrast: BBC English Class | BBC Learning English | 101,937 | 1,967 |
| Avoiding repetition in a text | C1 | kbd_CajdXaw | How to use SO & NEITHER in English: "So do I", "Neither am I"... | English with Emma · engVid | 836,016 | 29,259 |

### Writing and usage

| Lesson | Level | ID | Title | Channel | Views | Likes |
|---|---|---|---|---|---|---|
| Punctuation basics | A1 | gfYq2ng9s4E | English Punctuation Guide - English Writing Lesson | Oxford Online English | 954,974 | 23,677 |
| Capital letters and apostrophes | B1 | YDB2Maro5H8 | How to Use Apostrophes Properly: The Definitive Guide / English Grammar & Punctuation Lesson | English with Lucy | 251,078 | 9,583 |
| British and American English | B1 | BG017jvhB7I | Differences between American & British spelling | Business English Benjamin · engVid | 137,769 | 2,149 |

## Roadmap

1. Grammar map complete (all 10 areas). Next: teacher review of the new content, and related-topic links between areas.
2. Reading, Writing, Speaking and Listening skill pages.
3. Past and Future tense PowerPoint decks and motion graphics.
4. Teacher view and class codes (needs a backend, so it is not possible in a single artifact).
5. Optional: pre-recorded neural audio (needs a script run on a computer with internet access).

## Known limits and open items

- Australian audio uses the device's voices, so quality depends on the device. British and American studio voices were tested headlessly, not on a real phone.
- The new areas teach Australian usage where it differs (on the weekend, on King William Street, program, ute, servo).
- Grammar content, answer keys and generated conversations were written and tested by Claude. A teacher should review them.
- PDF download of worksheets has not been tested in a real browser. Lesson worksheets, cheat sheets and certificates were generated and checked headlessly.
- Placement test difficulties are expert estimates. Calibrate them with real learner data before treating results as more than a guide.
- Claude feedback only works when the page is opened on claude.ai by a signed-in viewer; it uses the viewer's own Claude usage. Microphone access may be blocked inside the artifact frame; the page then asks learners to type.
- Speech features were not tested with a real microphone.
- Level label "A3" in the conversation practice is not a CEFR level (it means a confident, idiom-rich level). Consider renaming it B1.
- Artifact links are private until shared from the artifact's Share menu.
