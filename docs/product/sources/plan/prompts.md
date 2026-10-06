# Laoshu Laoshi v2: prompt drafts

Status: first drafts, Sun 4 Oct 2026, evening. Written by Fable. **None of these has been run.**
Amended Mon 5 Oct 2026: prompts 10 to 12 added (a drama episode, a neighbour from a book, today's game), with their checks. See `experiments-2026-10-05.md` for how to try them. They are written to be tried on Luna tomorrow against Tom's real list and real page photos, and changed.

Goes with `design.md` section 5, which lists every model call and when it happens. This file has the ones that are prompts to a language model: nine from 4 Oct and three added on 5 Oct.

Implementation order and copyable **build** prompts: [build-prompts.md](build-prompts.md). Reproducible content runs: [experiment-run-sheet.md](experiment-run-sheet.md). These are different from the content prompt drafts below.

### Contracts for using these drafts (5 Oct evening)

The drafts remain untested on this branch. Caller/checker rules before publication:

- `KNOWN` comes from individual word/sense/reading records, not every queued/imported entry. Sure, learned, queued and deliberately selected unfamiliar words remain distinct. Imported READY/LEARNED labels alone do not prove knowledge.
- Names in `PEOPLE` or a generated cast sheet are explicitly introduced/allowed vocabulary (R137). Calling them known in a prompt does not create learner evidence.
- `extra_words` are proposals; declaration alone never adds them to the learner record or permits an unaccounted word. Appropriate approval and the actual running-word unfamiliar budget include their uses. Easy input allows zero unfamiliar words. Necessary lesson companions are introduced, not assumed known.
- Model word boundaries and pinyin do not certify themselves: B00 checks dictionary readings and adjacent compound ambiguity independently. Prompt 7 repairs returned text within the same policy; repair advice is not repaired output.
- Prompt 8 must be adapted and logged in full for the neighbour/topic; its current block still names the mouse/story. Prompt 9 matches replies, but due skill, unaided recall, no screen leakage, confirmation and duplicate limits govern evidence (R59a–R59c, R64a, R65, R73).
- R21's source-pages/text description conflicts with R33a/prompt 1's scanned-text discard. G12 in the backlog preserves that decision; B03 provisionally extracts vocabulary with temporary scanned text. Described original sources have a separate retention policy.

Basis: the existing app's sentence prompt (`src/lib/sentences/generation/prompts.ts` in the app repo) and its companion-word prompt. What is carried over, and what is changed, is said first.

---

## 1. What the existing prompt got right, and what changes

**Kept**

1. **Declare before you use.** The model lists any word it needs beyond the allowed set, with a reason, before writing. This is what stopped it dodging needed words with stilted sentences (我家有猫 for 我家有一只猫).
2. **Natural everyday Mandarin is the bar,** stated ahead of the vocabulary limit, with bad and good examples side by side.
3. **Pinyin as tone numbers with spaces.** Code converts to marks.
4. **A "done when" line** at the end, stating the finishing condition.
5. **The correction turn:** the code check's findings go back, with two allowed fixes: declare the word, or rewrite to something equally natural.
6. **A worked example of the output** in the prompt.

**Changed**

1. **The model outputs words, not strings.** Every sentence comes back as a list of words, each with its pinyin. This gives the spaces between words for free (R43a), lines pinyin up with each word, and lets the check compare word by word without a separate word-splitter that might split differently.
2. **The model is never given a percentage.** Code turns the level into a short list of new words and how often each should appear.
3. **New words are handed in, not only declared.** For stories the unknown words are chosen from the learner's queue (R39a). Declaring remains, as the way to ask for one more.
4. **Shouting removed.** The old prompt leans on capitals and warning signs, written for weaker models. These drafts state each rule once and plainly. If Luna slips, add emphasis back to the one rule it slipped on.
5. **Dictionary tones only.** The model writes each word's own tones. Code applies the spoken changes for 不, 一 and paired third tones, so the pinyin can be checked against a dictionary.

**A known weakness of word-by-word output:** the model could pass the check by splitting an unknown word into known single characters (尿布 as 尿 and 布). The check should also look for dictionary words formed by neighbouring pieces. Worth one test tomorrow.

---

## 2. Shared blocks

These are pasted into the prompts below where a name in double braces appears.

### {{WORD_FORMAT}}

```
Write every Chinese sentence as a list of words, in order. Each word is an
object with the characters and the pinyin:

  {"w": "尿布", "p": "niao4 bu4"}

- One object per word as a Chinese speaker would divide the sentence. Keep a
  word whole: 尿布 is one word, not 尿 and 布.
- Pinyin uses tone numbers 1 to 4, with 5 for a neutral tone, and a space
  between syllables. Write ü as v.
- Give each word its dictionary tones. Do not apply tone changes for 不, 一 or
  paired third tones; that is done afterwards.
- Punctuation is its own object with no pinyin: {"w": "。"}
```

### {{NATURAL}}

```
The bar is natural everyday mainland Mandarin: what a parent would really say
at home to a small child or about one. If a native speaker would not say it,
do not write it.

Do not dodge a word to stay inside the learner's vocabulary:
- Dodging: 我家有猫 / 这是照片
- Natural: 我家有一只猫 / 这是一张照片

If the natural sentence needs a word you have not been given, either ask for
it in "extra_words" with a reason, or write a different sentence that is
equally natural. Never a stunted workaround.
```

### {{PEOPLE}}

```
People and characters. Their names count as known words.
- {{LEARNER_NAME}}: the learner, a dad. 爸爸 to his daughter.
- {{CHILD_NAME}}: his daughter, a toddler.
- 妈妈: her mum.
- 老鼠老师: the mouse teacher. In English always "Laoshu Laoshi". He.
- 王{{DOG_NAME}}: a friendly dog. He.
- 李{{CAT_NAME}}: a friendly cat. She.
```

### {{KNOWN}}

A plain comma-separated list of the characters of every word the piece may use freely. Which words go in depends on the call:

- **Lesson sentences, easy stories, conversations:** only words the schedule is sure of (R53, R66).
- **Medium and hard stories:** every word in the record.

---

## 3. The prompts

Each has: what it is for, what code passes in, the prompt, and what to try tomorrow.

### Prompt 1. Read a page

**For:** a photo of a book page becomes its text and its words (R18). Fast model with vision. The learner is waiting.
**Passed in:** the image.

```
This is a photo of one page or spread from a children's book that the learner
owns. Read the text printed on it.

1. Copy the text exactly as printed, line by line. Do not correct, complete,
   translate or tidy it. If part of a line is hidden, blurred or cut off,
   copy what you can read and add that line's number to "unsure".
2. Ignore page numbers, publisher marks and text inside the pictures unless
   it is part of the story.
3. If the text is Chinese, also give it as words.
   {{WORD_FORMAT}}
   Add a short English meaning to each word, as it is used on this page.
4. If the text is English, leave "words" empty.

Respond with JSON only:
{
  "language": "zh",
  "lines": ["星期六，他吃了一块巧克力蛋糕。"],
  "unsure": [],
  "words": [
    {"w": "星期六", "p": "xing1 qi1 liu4", "en": "Saturday"},
    {"w": "，"},
    {"w": "他", "p": "ta1", "en": "he"},
    {"w": "吃", "p": "chi1", "en": "to eat"},
    {"w": "了", "p": "le5", "en": "(completed action)"},
    {"w": "一", "p": "yi1", "en": "one"},
    {"w": "块", "p": "kuai4", "en": "piece (measure word)"},
    {"w": "巧克力", "p": "qiao3 ke4 li4", "en": "chocolate"},
    {"w": "蛋糕", "p": "dan4 gao1", "en": "cake"},
    {"w": "。"}
  ]
}

If there is no readable text, return empty "lines" and "words".
Done when every printed line of story text is in "lines" and, for Chinese,
every word of it is in "words" in order.
```

**Try tomorrow:** the real caterpillar pages (text over pictures, die-cut pages, glare). Count wrong or missing characters per page. Check how it divides 毛毛虫, 巧克力蛋糕, measure words. Compare one call against two (read, then divide).

The page text is used to get the words and is then thrown away; only the word list is stored. (R33a)

### Prompt 2. Resolve a word

**For:** whatever the learner typed becomes one or more candidate words, each with the companion words it needs (R20, R24, R25). Fast model. The learner is waiting.
**Passed in:** the typed text; `{{KNOWN}}` (the whole record).

```
A learner of Mandarin, a dad with a toddler, wants to add a word to his
course. He typed:

  {{TYPED}}

It may be English, Chinese characters, or pinyin with or without tones. It may
be a word his daughter said, so consider toddler words and family talk.

1. Work out which Mandarin word or words he most likely means. If there is
   one clear answer, give one. If there are real alternatives that a parent
   would need to choose between, give up to four, most likely first, and say
   in "note" what distinguishes each (for nappy: 尿布 is the general and
   cloth word; 纸尿裤 is a disposable one).
2. Use the everyday spoken word, not a formal or written one.
3. For each choice, give "accept": the English answers that should count as
   right when he is later asked what the word means. Lower case. Include
   British and American forms.
4. For each choice, list its companion words: the words he needs in order to
   use it in a natural sentence. Typically a measure word, the verb it goes
   with, or an object it acts on. Give only what is essential, at most
   three. Leave out any word already in his vocabulary, listed below.
5. If it looks like a typo, resolve to what he meant and say so in "note".

Words he already has:
{{KNOWN}}

Respond with JSON only:
{
  "choices": [
    {
      "w": "尿布", "p": "niao4 bu4",
      "en": "nappy (cloth, or nappies in general)",
      "accept": ["nappy", "diaper", "cloth nappy", "cloth diaper"],
      "note": "The general word. Use this for cloth nappies.",
      "companions": [
        {"w": "换", "p": "huan4", "en": "to change", "why": "换尿布 is how you say change a nappy"},
        {"w": "块", "p": "kuai4", "en": "piece (measure word)", "why": "measure word for a cloth nappy"}
      ]
    }
  ]
}

Done when each choice is a word a mainland parent would really use, and every
companion is both essential and absent from his vocabulary.
```

**Try tomorrow:** nappy, sock, potty, dummy, "bao bao", "抱抱", a deliberate typo, a word with two readings (长, 觉), a word already in his list. Qing judges the choices and companions.

### Prompt 3. Propose an order

**For:** from a book's new words, which to learn first and why (R26). Strong model, ahead of time.
**Passed in:** the book's words not in the record, each with how many times it appears; `{{KNOWN}}`; how many to propose (from the pace rule).

```
A dad learning Mandarin has added a children's book he reads with his toddler.
Below are the words in the book that he does not know yet, with how many
times each appears.

Choose the {{N}} he should learn first, in order, and put the rest in a
sensible order after them.

Rank by, in this order:
1. Use at home. Words he will say or hear every day with a small child come
   first.
2. What it unlocks. A measure word or verb that several other words in the
   list depend on comes before them.
3. How often it appears in this book.

Give each of the first {{N}} a reason of at most eight words, written to him,
that he will see beside the word. Say what the word is good for, not that it
is important.

New words in the book:
{{BOOK_WORDS_WITH_COUNTS}}

Words he already has:
{{KNOWN}}

Respond with JSON only:
{
  "first": [
    {"w": "饿", "why": "You'll say this at every meal"},
    {"w": "只", "why": "Needed to count animals; in the book 6 times"}
  ],
  "then": ["茧", "蝴蝶"]
}

Done when every new word appears exactly once across "first" and "then".
```

**Try tomorrow:** the caterpillar book's list. Does 茧 (cocoon) sink and 饿 (hungry) rise? Are the reasons something Tom would nod at?

### Prompt 4. Write a source book

**For:** a described scenario becomes a natural picture book, whose job is to surface the right vocabulary (R19, R23). Strong model, ahead of time. **No vocabulary limit.**
**Passed in:** the description.

```
Write a short Chinese picture book for a toddler, on this subject:

  {{DESCRIPTION}}

Write it the way a good picture book published in mainland China would be
written: natural, warm, concrete, in the words a parent really uses with a
small child. Do not simplify it for a foreign learner. Its purpose is to
contain the real vocabulary of this situation, so name the actual things and
actions involved.

- 8 pages, one to three short sentences each.
- A small story with a beginning, a middle and an end. Not a list of objects.
- Repeat the key words across pages, as picture books do.

{{PEOPLE}}

{{WORD_FORMAT}}

Respond with JSON only:
{
  "title": {"words": [ ... ], "en": "..."},
  "pages": [
    {"words": [ ... ], "en": "English for this page"}
  ]
}

Done when a Chinese parent could read it aloud to a two-year-old without
changing a word.
```

**Try tomorrow:** "a nappy change", "the walk to nursery", "bath time". Qing reads them aloud: would she say this to Bea?

### Prompt 5. Write a lesson

**For:** example sentences and a picture idea for one new word (R5). The direct descendant of the existing sentence prompt. Strong model, ahead of time; checked by code; rewritten by prompt 7 if it fails.
**Passed in:** the word; `{{KNOWN}}` (sure words only); companions already accepted for this word.

```
Write a short lesson for one new Mandarin word. The learner is a dad at
beginner level with a toddler at home.

The new word:
  {{WORD}} ({{PINYIN}}): {{MEANING}}

Write 3 example sentences. Each must use the new word. Apart from the new
word, use only:
- the words he knows, listed below
- these companion words, which he is learning alongside it: {{COMPANIONS}}

{{NATURAL}}

Guidance:
- Set the sentences in his life at home with his daughter.
- Make the three different in shape: for example a statement, a question, and
  something he might say to her.
- The first sentence should be the shortest and make the meaning obvious.
- Length: about {{CHAR_RANGE}} characters each.

Also describe one picture that shows what the word means, in one English
sentence, for an illustrator. A simple scene with one clear subject. No text
in the picture.

{{PEOPLE}}

{{WORD_FORMAT}}

Words he knows:
{{KNOWN}}

Respond with JSON only:
{
  "extra_words": [
    {"w": "块", "p": "kuai4", "en": "piece (measure word)", "why": "measure word for a cloth nappy"}
  ],
  "sentences": [
    {"words": [ ... ], "en": "Dad changes the nappy."}
  ],
  "picture": "A dad kneeling on a rug, holding up a clean cloth nappy, a toddler lying on a changing mat beside him."
}

Done when there are 3 natural sentences, each containing the new word, and
every other word is known, a companion, or listed in "extra_words".
```

**Try tomorrow:** 尿布, 袜子, 饿, 毛毛虫, a measure word, a verb. Count check failures on first try. Qing rates each sentence: natural, stilted, or wrong.

Words in `extra_words` are offered to the learner as companions (R25, R29). They are not silently added.

### Prompt 6. Write a story

**For:** the learner's reading at easy, medium or hard (R30 to R45, R53, R66 to R69). Strong model, ahead of time; checked by code; rewritten by prompt 7.
**Passed in:** level; the setting (a source book's subject, or a part of his day); `{{KNOWN}}`; words to feature (due or recently learned); new words with how many times each should appear (empty for easy); page count and length.

Code works out the new words before calling: for a hard story of 120 words at 5%, that is six uses of new words, so two new words three times each.

```
Write a short Chinese story for one learner to read. He is a dad at beginner
level. He will read it himself, and may read it aloud to his toddler.

Setting: {{SETTING}}

This is a new story. If the setting names a book, write about the same things
and characters in the same world, with new events. Do not retell the book.

Vocabulary. Use only:

A. Words he knows:
{{KNOWN}}

B. Words to feature. He has learned these recently. Work each into the story
   at least once, in a sentence where its meaning is clear:
{{FEATURE_WORDS}}

C. New words. He has not met these. Use each one the number of times shown,
   on different pages, in different sentences. The first time each appears,
   the sentence and the picture should make its meaning guessable. Where it
   helps, add a few known words that explain it:
{{NEW_WORDS_WITH_COUNTS}}

{{EXTRA_RULE}}

{{NATURAL}}

Shape:
- {{PAGES}} pages, about {{WORDS_PER_PAGE}} words each.
- A story: someone wants something, something happens, it ends. Warm, a
  little funny, fit for a two-year-old's attention.
- Short sentences. Repetition with small changes from page to page is good;
  it is how picture books work.

For each page, describe one picture in one English sentence for an
illustrator: who is there, what they are doing, where. Keep recurring
characters looking the same. No text in the picture.

{{PEOPLE}}

{{WORD_FORMAT}}

Respond with JSON only:
{
  "title": {"words": [ ... ], "en": "..."},
  "extra_words": [],
  "wished_for": [],
  "pages": [
    {"words": [ ... ], "en": "English for this page", "picture": "..."}
  ]
}

Done when every word in the story is from A, B, C or "extra_words", each C
word appears the stated number of times, and the story reads naturally aloud.
```

`{{EXTRA_RULE}}` is one of:

- **Easy:** `Use no other words at all. "extra_words" must be empty. If you wanted a word you could not use, list it in "wished_for" with the reason; it will be offered to him to learn.`
- **Medium or hard:** `If natural Chinese needs one more word, you may use up to {{MAX_EXTRA}} others. List each in "extra_words" with its meaning and a reason before using it.`

**Try tomorrow:** one easy, one medium, one hard, from Tom's real list, set in the caterpillar book's world. Measure: check failures on first try; passes within two rewrites; whether new words land the stated number of times. Qing rates naturalness per page. This is the prompt the whole product stands on, so it gets the most of tomorrow.

### Prompt 7. Rewrite after the check

**For:** fixing a lesson, story or conversation that failed the code check (R38). Sent as the next turn in the same conversation, so the model sees its own draft. At most twice.
**Passed in:** the check's report.

```
A check of your draft found problems. Fix them and return the whole piece
again in the same JSON format.

Words used that are not allowed:
{{VIOLATIONS}}
  (each line: the word, the page or sentence it is in)

New words used the wrong number of times:
{{COUNT_PROBLEMS}}
  (each line: the word, times wanted, times used)

Pinyin that does not match the characters:
{{PINYIN_PROBLEMS}}

For each word that is not allowed, do one of these:
1. Rewrite that sentence a different way that is equally natural and uses
   only allowed words.
2. If the piece permits extra words and natural Chinese really needs this
   one, add it to "extra_words" with a reason.

Do not fix a sentence by making it stilted or incomplete. Change as little as
you need to; leave sentences that passed as they are.

Done when the same check would pass.
```

**Try tomorrow:** how often one rewrite is enough; whether rewrites make the text worse.

### Prompt 8. Plan a conversation

**For:** a spoken conversation with the mouse, written whole before it starts (R70 to R71c, R58, R74). Strong model, ahead of time; checked by code.
**Passed in:** the story it is about; `{{KNOWN}}` (sure words only); the words due for English to Chinese.

Drafted as a straight line of five questions. Each has a few acceptable answers and the same next question whatever he says. It cannot dead-end.

```
Plan a short spoken conversation between Laoshu Laoshi, the mouse teacher,
and a beginner learner of Mandarin. It is about a story he has just read,
given below. He will speak his answers aloud.

Write 5 questions for the mouse to ask, in order. For each question:

- "ask": the mouse's question. One short sentence. It will be spoken slowly.
- "answers": 2 to 4 answers a learner at his level might give. Short,
  natural, different from each other.
- "reply": what the mouse says after any acceptable answer. A few warm words,
  and a natural full-sentence version of the answer. Never a comment on
  pronunciation or tones.
- "simpler": the same question asked more simply, for when he is not
  understood.
- "either_or": the question as a choice between two answers.
- "give": the mouse gives the answer himself and moves on.

Target words. He is due to practise producing these. Write the questions so
that a good answer needs one of them:
{{DUE_WORDS}}
A target word must not appear in the question that asks for it, nor in
"simpler". He has to recall it, not copy it. It may appear in "either_or" and
"give".

Use only the words he knows, listed below, and the target words. Nothing else.

{{NATURAL}}

{{PEOPLE}}

{{WORD_FORMAT}}

The story:
{{STORY_TEXT}}

Words he knows:
{{KNOWN}}

Respond with JSON only:
{
  "opening": {"words": [ ... ], "en": "..."},
  "turns": [
    {
      "target": "尿布",
      "ask": {"words": [ ... ], "en": "What does Dad change?"},
      "answers": [
        {"words": [ ... ], "en": "A nappy."},
        {"words": [ ... ], "en": "Dad changes the nappy."}
      ],
      "reply": {"words": [ ... ], "en": "Yes! Dad changes the nappy."},
      "simpler": {"words": [ ... ], "en": "..."},
      "either_or": {"words": [ ... ], "en": "A nappy or a sock?"},
      "give": {"words": [ ... ], "en": "..."}
    }
  ],
  "closing": {"words": [ ... ], "en": "..."}
}

Done when there are 5 turns, every word is known or a target, and no target
word appears in its own "ask" or "simpler".
```

**Try tomorrow:** a plan from one of the stories made by prompt 6. Qing plays Tom and answers out loud: do her natural answers fall within "answers"?

Code adds one more check here: the target word is absent from its own question (R59a).

### Prompt 9. Match a reply

**For:** deciding which planned answer his spoken words are closest to (R71a). Fast model. The learner is waiting, so this is short.
**Passed in:** the question; the planned answers; the transcript of what he said.

```
A beginner learner of Mandarin was asked a question and answered aloud. Below
are the question, the answers that were expected, and a transcript of what he
said. The transcript comes from speech recognition and may contain wrong
characters that sound similar to what he meant.

Decide whether what he said is an acceptable answer to the question. It is
acceptable if it means the same as one of the expected answers, or is another
correct answer to the question, even if short, incomplete or slightly
ungrammatical. Judge by sound and meaning, not by exact characters.

Question: {{ASK}}
Expected answers:
{{ANSWERS}}
He said: {{TRANSCRIPT}}
Target word: {{TARGET}}

Respond with JSON only:
{
  "ok": true,
  "said_target": true
}

"said_target" is true only if he clearly said the target word.
Say nothing about his pronunciation.
```

**Try tomorrow:** Qing's own beginner-style answers through the recogniser; then Tom's, if he has ten minutes. Include wrong answers, silence, and English.

`said_target` is a candidate interpretation only. Evidence additionally needs the learner's confirmed transcript, the correct due skill, unaided recall with no target shown elsewhere on screen, and the shared duplicate policy (R59a–R59c, R64a, R65, R73). Revealed/tapped answers do not count as recall; an omitted target is never automatically a fail.

---

### Prompts 10 to 12: added Mon 5 Oct 2026

Written by Fable at midday on 5 Oct for the experiments in `experiments-2026-10-05.md`. **None has been run.** They follow the same conventions as prompts 1 to 9 and use the same shared blocks.

### Prompt 10. Write a drama episode

**For:** one episode of a short drama (R106 to R110). Strong model, ahead of time; checked by code; rewritten by prompt 7.
**Passed in:** the series premise in one English sentence (written by a person, or taken from the neighbour's `secret`); the cast, each with a fixed description (from prompt 11 or the standing cast); the place; `{{KNOWN}}` (every word in the record, as for a medium story); words to feature, which are words in his record that need more review (R107); new words with how many times each should appear; `{{MAX_EXTRA}}`, the most undeclared-in-advance words allowed (start at 2); the episode number and how many the series has; the story so far and the question the last episode left open (empty for episode 1).

The form is the Chinese short drama, played for laughs: melodrama about something very small.

```
Write one episode of a very short comic drama in Chinese, for one learner to
watch. He is a dad at beginner level. It should make him laugh, and make him
want tomorrow's episode.

Series: {{SERIES_PREMISE}}
This is episode {{N}} of {{TOTAL}}.
The story so far: {{SO_FAR}}
The question left open last time: {{OPEN_QUESTION}}

Cast. Use only these characters. Their names count as known words:
{{CAST}}

Place: {{PLACE}}

How the form works:
- The stakes are enormous and the subject is tiny. A missing sock, the last
  dumpling, who ate the cake. Everyone treats it as life and death.
- The first line is the hook: an accusation, a discovery, a door opening.
- One reversal: whoever looked guilty turns out not to be, or the thing
  everyone believed turns out false.
- Stop at the peak. End on a new question. Never answer it in this episode.
  {{FINALE_RULE}}
- One or two catchphrases that come back. Repetition is welcome: "是你！"
  "不是我！" is exactly right.
- 6 to 10 spoken lines. Each line is short enough to say in one breath.

Vocabulary. Use only:

A. Words he knows:
{{KNOWN}}

B. Words to feature. He knows these but needs more practice with them. Use
   each at least once:
{{FEATURE_WORDS}}

C. New words. He is learning these today. Use each the number of times
   shown, in lines where the action makes the meaning clear:
{{NEW_WORDS_WITH_COUNTS}}

If natural Chinese needs one more word, you may use up to {{MAX_EXTRA}}
others. List each in "extra_words" with its meaning and a reason before
using it.

{{NATURAL}}

For each line also give:
- "shot": one of "wide", "close", "reaction", "snap_zoom".
- "pose": the speaker's pose, one of "neutral", "shocked", "furious", "smug",
  "pleading".
- "say_it": two or three English words on how the line is delivered
  ("whispered, horrified").
- "picture": one English sentence describing the frame for an illustrator:
  who is there, what they are doing. No text in the picture.
- "motion": one English sentence on what moves in the shot, kept small:
  a head turning, a hand rising, a slow push in.

{{WORD_FORMAT}}

Respond with JSON only:
{
  "title": {"words": [ ... ], "en": "..."},
  "extra_words": [],
  "lines": [
    {"speaker": "...", "words": [ ... ], "en": "...", "shot": "...",
     "pose": "...", "say_it": "...", "picture": "...", "motion": "..."}
  ],
  "reversal_at": 4,
  "open_question": {"words": [ ... ], "en": "..."},
  "next_time": "One English sentence for the writer of the next episode."
}

"reversal_at" is the number of the line where the reversal lands, counting
from 1.

Done when every word is from A, B, C or "extra_words", each C word appears
the stated number of times, "reversal_at" points at a real line, and (unless
this is the last episode) the last line leaves a question that the episode
does not answer.
```

`{{FINALE_RULE}}` is empty except for the last episode, where it is: `This is the last episode. Answer every open question, with a final twist, and end warmly.`

**Try this afternoon:** episode 1 of a series about the caterpillar and a missing chocolate cake, with the neighbour from prompt 11. Then episode 2 from its `next_time`, to see whether the thread holds. Measure: check failures on first try; whether the reversal and the cliffhanger are really there; Qing's reaction. One thing to watch: melodrama may suit a small vocabulary well, because its lines are short, emphatic and repeated. That is a hunch and this is its first test.

### Prompt 11. Make a neighbour from a source book

**For:** filling a neighbour slot from something the learner brought (R90, R90a). Strong model, ahead of time; Chinese lines checked by code.
**Passed in:** the source book's subject and its vocabulary list, marked known or new for this learner; `{{KNOWN}}` (sure words only, as for a conversation); the words he is learning today.

```
A learner of Mandarin has brought a book into his language-learning world:
{{BOOK_SUBJECT}}

Invent the neighbour who moves in because of it. The neighbour is a character
from the book's world, or someone who belongs in it. They live in the house
next door, in a small friendly town where everyone speaks only Chinese. He
will visit them, talk with them, give them gifts, and watch dramas on their
TV. A two-year-old may be watching over his shoulder.

The book's words:
{{BOOK_WORDS}}

Give the neighbour:
- "name": a short Chinese name that suits them.
- "what": what kind of creature or person they are, in English.
- "look": one English paragraph that fixes how they look, for an illustrator
  who must draw them the same way every time: shape, colours, one or two
  things they always wear or carry. Soft ink and watercolour picture-book
  style. No text.
- "house": one English sentence describing their living room, which has a TV.
- "nature": three English words for their personality.
- "catchphrase": one short line they say often.
- "loves": three things they would love as a gift. Each must be a word he
  knows or is learning today; prefer ones that come from the book. He will
  learn what they love by listening to them.
- "secret": one English sentence. Something small they are hiding, for the
  drama writers to use.
- "greetings": three short things they might say when he walks in today. At
  least one should mention something they love, without saying "I love".
- "missed_you": one line for when he has been away a while. Glad to see him.
  No reproach.

Every Chinese line may use only these words, the words he is learning today,
and the neighbour's own name:
{{KNOWN}}
Learning today: {{TODAY_WORDS}}

{{NATURAL}}

{{WORD_FORMAT}}

Respond with JSON only:
{
  "name": {"words": [ ... ], "en": "..."},
  "what": "...", "look": "...", "house": "...", "nature": ["...", "...", "..."],
  "catchphrase": {"words": [ ... ], "en": "..."},
  "loves": [{"w": "...", "p": "...", "en": "..."}],
  "secret": "...",
  "greetings": [{"words": [ ... ], "en": "..."}],
  "missed_you": {"words": [ ... ], "en": "..."}
}

Done when every Chinese line uses only allowed words, every "loves" word is
allowed, and "look" states a shape, the colours, and at least one thing
always worn or carried.
```

**Try this afternoon:** the Chinese Very Hungry Caterpillar, with Tom's real list. Measure: check failures; whether two pictures from the same `look` match; whether Qing would want to visit.

`missed_you` is where R100 lives: no streak count, a neighbour who is glad he is back.

### Prompt 12. Today's game

Two calls, so the Chinese can be checked before any game is written around it.

**12a. The game's words and lines.** Strong or fast model; checked by code.
**Passed in:** the genre; the theme; `{{KNOWN}}` (sure words only); today's words.

```
Prepare the Chinese for a tiny game a beginner will play once, for about 90
seconds, on his phone. Genre: {{GENRE}}. Theme: {{THEME}}.

Write what the game needs for this genre:
{{GENRE_NEEDS}}

Also write the game's few on-screen instructions in Chinese: a title, one
line saying what to do, the label for the game's main button, a line for
winning, and a line for trying again. Keep each to a few words.

For each item give a "role": what it is in the game. For example "suspect",
"crime", "falls", "wanted", "pair", "story_line" or "statement".

Use only these words, and today's words:
{{KNOWN}}
Today's words: {{TODAY_WORDS}}

{{NATURAL}}

{{WORD_FORMAT}}

Respond with JSON only:
{
  "ui": {"title": {...}, "how": {...}, "action": {...}, "win": {...}, "again": {...}},
  "items": [ {"id": "a1", "words": [ ... ], "en": "...", "role": "..."} ],
  "answer": "the id or ids that are correct, where the genre has an answer"
}
Each of "title", "how", "action", "win" and "again" is {"words": [ ... ], "en": "..."}.

Done when every word is allowed and the game could be played with nothing
but these lines.
```

`{{GENRE_NEEDS}}`, one per genre. A first selection to try (assumed):

- **Whodunnit:** `A small crime. Three suspects, each with one or two lines. Exactly one is lying, and a careful reader can tell which. Mark the culprit in "answer".`
- **Feed the neighbour:** `Eight things that fall from the top of the screen, each named in Chinese. One line from the neighbour saying what they want today. Mark the wanted things in "answer".`
- **Pairs:** `Six pairs to match: a Chinese word or short phrase with the picture idea it names. Give the picture idea in "en".`
- **Put it in order:** `One tiny story in five lines, to be dragged into the right order. Give them in the right order; the game will shuffle.`
- **True or silly:** `Ten short statements about the theme. Half are true in the story's world and half are absurd. Mark the true ones in "answer".`

**12b. The game itself.** Strong model, one attempt.
**Passed in:** the genre; `{{GENRE_PLAY}}`; the checked JSON from 12a as `{{DATA}}`, to which code has added a `pm` field beside every `p` with the pinyin in tone marks; `{{CAST_LOOK}}`, the `look` paragraph of any character who appears (empty if none).

```
Write a complete small game as a single HTML file. It will be played once,
for about 90 seconds, by a tired dad holding a phone in one hand. Make it
charming.

Genre: {{GENRE}}
What happens: {{GENRE_PLAY}}
Characters to draw, if any: {{CAST_LOOK}}

The game's Chinese is given below as DATA. Paste it into the file exactly as
given, as one JavaScript constant named DATA.

Rules for the Chinese:
- Every Chinese character the player sees must come from DATA. Do not write
  any Chinese of your own, anywhere, including in comments.
- Show a word's characters large, with its pinyin small above. Use each
  word's "pm" field for the pinyin; do not write pinyin yourself.
- Every label and button is one of the "ui" lines. The main button uses
  "action".
- English may appear only where DATA gives "en", and only after a tap on the
  Chinese, as help.

Rules for the game:
- One file. No network requests, no libraries, no external images or fonts.
  Draw with HTML, CSS and inline SVG. Simple shapes with character.
- Portrait, 390 pixels wide, everything reachable by one thumb in the lower
  two thirds of the screen. Touch first; mouse and keyboard also work.
- Every game action has a keyboard equivalent and visible focus. Cards and
  moving items can be selected with keys; dragging has buttons or keys as an
  alternative. The game can be finished using only the keyboard, with no trap.
- It can always be finished. There is no way to lose for good: a wrong move
  gets a gentle wobble and another go.
- It ends within two minutes with the "win" line and a small celebration.
- When it ends, call: window.parent.postMessage({type: "game_done"}, "*")
- No sound that needs a file. A short generated beep is fine.
- No local storage, no cookies.

DATA:
{{DATA}}

Respond with the HTML file only, starting with <!doctype html>.

Done when the file runs as it stands, can be played to the end with one
thumb, and shows no Chinese that is not in DATA.
```

`{{GENRE_PLAY}}` says in two or three plain sentences how that genre plays (assumed wording, to be tuned):

- **Whodunnit:** `Show the crime. Show the three suspects as simple characters. Tapping a suspect shows what they say. Under each is the "action" button, which accuses them. The right one gives the win line; a wrong one shakes their head and the player tries again.`
- **Feed the neighbour:** `The neighbour sits at the bottom and says what they want. Things drift down from the top, each labelled. Tapping a wanted thing feeds it to the neighbour, who is delighted. Tapping an unwanted one makes them pull a face. It ends when every wanted thing has been fed.`
- **Pairs:** `Twelve face-down cards. Six show a word and six show a simple drawing of what it names. Turning over a word and its drawing keeps them up. It ends when all are matched.`
- **Put it in order:** `Five lines of a story, shuffled, as cards. The player drags them into order. When the order is right the story plays through once as a tiny slideshow.`
- **True or silly:** `Statements appear one at a time. Two big buttons: a tick and a laughing face. A right call makes the scene react. It ends after ten.`

**Checks code runs on the result, before Tom sees it:**

1. The file loads with no console errors in a boxed frame with no network.
2. Every Chinese string in the file appears in DATA.
3. No `fetch`, `XMLHttpRequest`, `import`, external `src` or `href`.
4. The `game_done` message can be reached.

**Try this afternoon:** three genres, one attempt each, no fixing by hand. Record which ran first time. If fewer than three do, the fallback is a fixed, tested game shell per genre into which only DATA is dropped; Astra then writes the look and the small variations and never the rules.

Today's game is play. Nothing in it reaches the schedule (R103).

---

## 4. Not prompts to a language model

- **Pictures.** Code builds the picture request from a fixed house-style paragraph, a fixed description of each recurring character, and the one-sentence `picture` from prompts 5 and 6. The style paragraph needs writing and two test runs to see whether the characters hold.
- **Speech.** Azure, from the characters. Slowed for lessons and the mouse; normal speed for easy stories.
- **Transcription.** The recogniser, told the language is Mandarin.

## 5. What the code check does

Run on the output of prompts 5, 6 and 8, and from 5 Oct prompts 10, 11 and 12a, before anything is stored.

1. Every word is in the allowed set for this piece (known, feature, new, companions, declared extras, names, punctuation, numbers).
2. Each new word appears the stated number of times.
3. Extra words are within the limit for the level.
4. Each word's pinyin matches a dictionary reading of its characters.
5. No allowed-looking run of single characters forms a dictionary word that is not allowed (the splitting dodge in section 1).
6. For lessons: every sentence contains the new word. For conversations: no target word in its own question.

7. For dramas (prompt 10): 6 to 10 lines; every speaker is in the cast; every pose and shot is one of the allowed values. (added 5 Oct)
8. For a neighbour (prompt 11) and a game's words (prompt 12a): every Chinese line uses only the allowed words. The game file itself has its own checks, listed under prompt 12. (added 5 Oct)

Fail goes to prompt 7 with the findings. Prompt 7 was written for vocabulary findings; the structural ones in items 7 and 8 go back the same way as plain sentences ("11 lines; the limit is 10"), which needs trying. Two failed rewrites and the piece is dropped and logged.

## 6. Tomorrow, in order

1. Prompt 6 (story), because everything new depends on it.
2. Prompt 1 (read a page), on the real photos.
3. Prompts 2 and 5 (resolve a word, lesson), on nappy.
4. Prompt 8, then 9, if there is time.
5. Prompts 3 and 4 last; they are the least risky.

For each: about 20 cases from Tom's real list, the code check, and Qing's ear. (spec-v1's workshop method, kept)

## 7. Monday afternoon, 5 Oct

The order above was written on Sunday for Monday. Since then the demo has changed shape (`spec-v2.md` section 4). The order for the afternoon is the order of `experiments-2026-10-05.md`: prompt 1, prompt 5, prompt 11, prompt 10, prompt 12, then prompts 8 and 9 with the neighbour in place of the mouse.
