/* ---- Guided path data: units and unit tasks ----
   Plain data only, so tools/tasks.mjs can load it to build the feedback Worker's task list.
   PTU: [level, unit name, can-do, lesson ids]. Lesson ids: g:<area>:<index>, t:<index>, k:<skill>:<topic>. */
var PTU=[
 ["A1","First sentences","I can say simple sentences about myself and my day.",["g:sentences:0","g:nouns:0","t:0","g:adj:0","g:nouns:1","k:r:0"]],
 ["A1","People and things","I can talk about people, things and what is happening now.",["g:nouns:2","g:nouns:3","t:1","g:modals:0","k:l:0"]],
 ["A1","Joining ideas","I can join ideas, talk about the future and write a short message.",["g:preps:0","t:8","g:writing:0","k:s:0","k:w:0"]],
 ["A2","Questions and the past","I can ask questions and tell a simple story about the past.",["g:sentences:2","g:sentences:1","g:preps:1","g:preps:2","t:4","t:5"]],
 ["A2","Shopping and things","I can talk about amounts, prices and whose things are whose.",["g:nouns:5","g:nouns:6","g:nouns:4","g:nouns:7","k:r:1","k:l:1"]],
 ["A2","Comparing and describing","I can compare things and say how I feel about them.",["g:adj:1","g:adj:2","g:adj:3","g:adj:4","t:2","k:s:1"]],
 ["A2","Advice and plans","I can give advice and talk about plans and their results.",["g:modals:1","g:conditionals:0","g:patterns:0","g:patterns:1","k:w:1"]],
 ["B1","Experiences and habits","I can talk about my experiences and how life used to be.",["t:3","t:6","g:patterns:5","g:patterns:6","g:modals:2","g:sentences:3"]],
 ["B1","Rules and good guesses","I can explain rules and make good guesses about what is happening.",["g:modals:3","k:r:2","k:l:2","g:modals:4","g:modals:5","g:modals:6"]],
 ["B1","Future and conditions","I can talk about future plans and imagine different situations.",["t:9","t:10","g:conditionals:1","g:conditionals:2","k:s:2","k:w:2"]],
 ["B1","Describing in detail","I can describe people, places and things in more detail.",["g:sentences:4","g:sentences:5","g:adj:5","g:adj:6","g:adj:7","g:adj:8","g:nouns:8"]],
 ["B1","Reporting and the passive","I can say what other people said and what was done.",["g:passive:0","g:passive:1","g:passive:2","g:passive:3","g:nouns:9","g:preps:3"]],
 ["B1","Verb patterns and writing","I can use common verb patterns and write clear, correct sentences.",["g:patterns:2","g:patterns:3","g:patterns:4","g:writing:1","g:writing:2"]],
 ["B2","Looking back","I can talk about past regrets and how things could have been different.",["t:7","g:conditionals:3","g:conditionals:4","g:modals:7","k:r:3"]],
 ["B2","Work and the future","I can handle work conversations and talk about long-term plans.",["t:11","k:l:3","k:s:3","k:w:3"]],
 ["C1","Formal reporting","I can follow and use the formal language of news and reports.",["g:passive:4","g:passive:5","g:nouns:10","g:sentences:6","k:r:4","k:l:4"]],
 ["C1","Emphasis and nuance","I can add emphasis and talk about unreal and possible situations.",["g:sentences:7","g:sentences:8","g:conditionals:5","g:conditionals:6","g:modals:8","k:s:4"]],
 ["C1","Polished writing","I can write smooth, well-linked texts without repeating myself.",["g:preps:4","g:preps:5","g:sentences:9","g:patterns:7","k:w:4"]]
];
/* Unit tasks: one real-life writing or speaking task per unit, marked by the AI teacher (Gemini). */
var PTTK=["Write about yourself: your name, where you live in Adelaide, your job or study, and what you usually do on Saturdays.",
"Describe a photo of your family or friends. Who are they? What are they doing in the photo? What can they do well?",
"Write a message to a friend. Invite them to the Central Market on Saturday. Say what you will do there. Use and, but, because or so.",
"Tell the story of your last weekend. Where did you go? What were you doing when something interesting happened? Then write two questions to ask a friend about their weekend.",
"You are having a barbecue for six friends. Write what you need to buy (how much of each thing) and whose things people are bringing.",
"Compare two places in or near Adelaide (for example Glenelg and Hahndorf). Which is better for a day out, and why? How did you feel the last time you went?",
"A friend is moving to Adelaide next month. Give them advice. What should they do first? What will happen if they don't get a metroCARD? What do they need to remember?",
"How has your life changed since you came to Australia, or since you were a child? What did you use to do? What have you done that you are proud of?",
"Your neighbour's lights have been off for a week, the mail is piling up and the car is gone. Write what must, might or can't be happening, and what rules people have to follow in your street.",
"Write about the next five years. What will you be doing? What will you have achieved? What would you do if you won $10,000?",
"Describe a person who has helped you. Use relative clauses (who, which, where) so a reader can picture them clearly.",
"Report a conversation you had this week: what the other person said and asked you. Then describe something that was built or changed in your area recently.",
"Write an email to the organiser of a short course in Adelaide. Say what you enjoy doing and what you are interested in learning, and ask two questions. Check your capitals and apostrophes.",
"Think of a decision you regret, or a lucky escape. What would have happened if you had acted differently? What do you wish you had done?",
"Write a short cover letter for a job in Adelaide. Describe your experience, and say what you will have achieved by the end of your first year.",
"Write a short news report about a local event in Adelaide (real or imagined). Use reporting structures such as \"It is believed that...\" and \"is said to have...\".",
"Write a persuasive paragraph about a change Adelaide needs. Use emphasis (What we need is..., Never have we...) and at least one sentence about an unreal or possible situation.",
"Write a smooth, well-linked paragraph about public transport in Adelaide. Avoid repeating words, and use contrast linkers and ellipsis where they sound natural."];
var PTWD={A1:"30 to 60",A2:"50 to 80",B1:"80 to 120",B2:"120 to 160",C1:"150 to 200"};
/* The exact task text a unit task sends for teacher feedback (the Worker only marks known texts). */
function ptTkText(ui){return PTTK[ui]+" Write or say "+PTWD[PTU[ui][0]]+" words."}
