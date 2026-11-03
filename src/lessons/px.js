/* ---- Unseen practice sentences (px) ----
 Six new sentences per lesson that never appear on the lesson page. Practice, reviews and path checks
 use them for the listening and sentence-building items, so a pass means the learner can build new
 sentences with the rule, not remember the ones they just read. tools/checks.mjs stops the build if a
 lesson has fewer than 6, or if one repeats a sentence shown on the page.
 Keep each sentence short (5 to 11 words) with one natural word order, because building items accept
 only that order. Index = the lesson's position in its area file. */
var PXD={
sentences:[
 ["Wash your hands before dinner.","My brother drives a blue ute.","Don't touch the hot plate.","We start work at nine.","Let's take the tram to the city.","Please turn off the lights."],
 ["Where does your sister work?","Did you see the fireworks last night?","Who made this delicious cake?","How often do you go swimming?","Are you coming to the party?","What did the doctor say?"],
 ["There is a chemist next to the bank.","There are three bedrooms in our house.","Is there a toilet on this train?","There aren't any eggs in the fridge.","Are there any parks near your school?","There was a storm last night."],
 ["You're from Brisbane, aren't you?","He hasn't finished yet, has he?","The shop opens at nine, doesn't it?","We can't park here, can we?","She was at the meeting, wasn't she?","You won't forget, will you?"],
 ["The man who lives next door is a chef.","This is the shop where I bought my shoes.","I lost the book that you lent me.","She's the friend whose dog bit me.","The bus which goes to the airport is full.","A vet is someone who looks after animals."],
 ["My father, who is seventy, still plays tennis.","Glenelg, which is near the city, has a lovely beach.","Our neighbour, whose son is a doctor, is very kind.","We visited Port Lincoln, where my aunt lives.","The car, which we bought last year, keeps breaking down.","She passed the test, which made her parents proud."],
 ["Looking out of the window, I saw a kangaroo.","Made in Italy, these shoes are very expensive.","Having lost the key, we climbed through the window.","The woman standing at the door is my aunt.","Tired after the trip, she went straight to bed.","Not wanting to be late, I took a taxi."],
 ["It was my sister who found the wallet.","What I love most is the quiet.","It was on Friday that the parcel arrived.","All we need is a bit of luck.","I did lock the door this morning!","What surprised me was the price."],
 ["Never have I eaten such a big breakfast.","Seldom do we see snow in Adelaide.","Rarely does the train arrive on time.","Not until midnight did they get home.","Only then did I understand the problem.","Little did we know what was coming."],
 ["He wanted to stay, but I didn't.","Seen my glasses anywhere?","I'd like to help, but I can't.","Mei can drive, and so can Tom.","Want a lift home?","She said she would call, and she did."]
],
modals:[
 ["My grandma can speak three languages.","Can you help me with this box?","I can't find my phone.","We can meet after work.","Can she come to the party?","They can't swim very well."],
 ["You should drink more water.","He shouldn't stay up so late.","Should we take a taxi?","You should ask your teacher.","Where should I park the car?","You shouldn't eat so much sugar."],
 ["My grandpa could speak four languages.","I couldn't find a parking spot.","We managed to get the last two tickets.","She was able to finish the report on time.","As a child, I couldn't swim.","They didn't manage to fix the leak."],
 ["You have to show your ticket at the gate.","We mustn't make noise after ten.","You don't have to wear a tie.","Are we allowed to take photos here?","I had to work late last night.","Students must hand in their work by Friday."],
 ["The lights are off. They must be asleep.","She isn't answering. She might be in the shower.","He can't be hungry. He just ate.","That could be the answer.","You must be very proud of your son.","It may be cold in the hills tonight."],
 ["The car is covered in dust. It must have been windy.","She might have gone to bed early.","He can't have seen us.","They must have left early.","I may have made a mistake.","You couldn't have known about it."],
 ["The bus will definitely be late today.","It is likely to rain tomorrow.","They probably won't come to the party.","The new café is bound to be busy.","We might move to Darwin next year.","He is unlikely to win the race."],
 ["I should have studied harder for the test.","You could have told me earlier.","We would have helped you.","She shouldn't have bought that car.","They could have won the game.","I would have called, but my phone was dead."],
 ["The train should be here soon.","Prices may well rise again next year.","He'll be at work now.","They'll have finished dinner by now.","She can't possibly be fifty!","The plan could well work."]
],
conditionals:[
 ["If you freeze water, it turns to ice.","If the shop is closed, we'll go tomorrow.","If I see Tom, I'll tell him.","If you press this button, the light comes on.","You'll miss the bus if you don't hurry.","If you're hungry, there's some soup."],
 ["If I won the lottery, I'd buy a house.","If I knew the answer, I'd tell you.","If she had a car, she would drive to work.","What would you do if you lost your job?","If I were taller, I'd play basketball.","We would visit more often if we lived closer."],
 ["We'll go to the beach unless it's windy.","You can borrow my car as long as you're careful.","Pack a raincoat in case it storms.","I won't call unless there's a problem.","Even if it rains, the match will go ahead.","Bring a map in case your phone dies."],
 ["If I had known, I would have helped.","If we had left earlier, we wouldn't have missed the train.","She would have passed if she had studied.","If he hadn't been late, he would have got the job.","If I had saved more, I would be rich now.","If you hadn't called, I would still be asleep."],
 ["I wish I had a garden.","I wish I could sing.","I wish I hadn't sold my old car.","I wish it would stop raining.","If only I had more time!","She wishes she had studied medicine."],
 ["Had I known, I would have called.","Should you need help, just ask.","Were I in your position, I'd say no.","Had they not helped us, we would have failed.","Should the flight be delayed, we'll wait.","Were it not for you, I'd be lost."],
 ["It's time we left for the airport.","I'd rather you didn't smoke inside.","He talks as if he knew everything.","Suppose you lost your phone. What would you do?","What if we painted the room blue?","It's high time you cleaned your room."]
],
passive:[
 ["The house was built in 1950.","Coffee is grown in Brazil.","The road is being fixed.","The winners will be told on Monday.","My bike has been stolen.","The letters are delivered every morning."],
 ["She said she was feeling better.","He told me he lived in Perth.","They said they had finished.","Tom said he would help us.","The teacher told us the test was easy.","My friend said she couldn't come."],
 ["He asked me where I lived.","She asked if I liked coffee.","They asked when the shop opened.","My mum asked whether I had eaten.","The man asked how much the ticket cost.","I asked her what she was doing."],
 ["The doctor advised me to rest.","She promised to call me later.","He offered to carry my bags.","They suggested going to the beach.","My boss asked me to stay late.","The guide warned us not to feed the animals."],
 ["The roof needs to be fixed.","I hate being told what to do.","The work must be finished by Friday.","We had our car washed yesterday.","She got stopped by the police.","The room is going to be painted."],
 ["It is said that the old mill is haunted.","He is thought to be very rich.","The thief is believed to have left the country.","They accused him of lying.","She thanked me for helping her.","It is expected that the bridge will open soon."]
],
patterns:[
 ["I enjoy cooking for my family.","She decided to learn Spanish.","Do you mind opening the window?","We hope to see you soon.","He wants to buy a new car.","They finished eating at nine."],
 ["I went to the shop to buy bread.","She called me to say thank you.","We left early to avoid the traffic.","He's learning English to get a better job.","I need a knife for the bread.","They whispered in order not to wake the baby."],
 ["I stopped eating meat last year.","Remember to buy some bread.","I'll never forget meeting the Prime Minister.","Try turning it off and on again.","She tried to lift the box, but it was too heavy.","I regret telling him the secret."],
 ["I'm waiting for my sister.","Can you listen to me, please?","Our plans depend on the forecast.","She's thinking about moving to Perth.","We talked about the trip.","He apologised for being late."],
 ["Please turn down the music.","I gave up smoking last year.","Can you pick me up at six?","She looks after her little brother.","We ran out of petrol on the highway.","The plane took off on time."],
 ["I used to play the piano.","She's used to getting up early.","You'll get used to the heat.","Did you use to live in Sydney?","I'm not used to driving on the left.","There used to be a park here."],
 ["My grandpa used to work on a farm.","Every summer we would visit the coast.","She used to have long hair.","In 2010, I started university.","At night, Mum would read us stories.","He used to love horror films."],
 ["Please turn the TV off.","Please turn it off.","She looked after her sister's kids.","I ran into an old friend at the shops.","Can you put these books away?","We need to sort out this problem."]
],
nouns:[
 ["She's my aunt. Her house is big.","We are students. Our teacher is nice.","They have a dog. Its name is Max.","I love my job.","Is this your car?","He's from India. His wife is from Fiji."],
 ["I have three brothers.","The boxes are in the garage.","Those men are firefighters.","We need two knives.","The babies are asleep.","Many people came to the party."],
 ["This bag is very heavy.","Are those your shoes?","These flowers smell lovely.","That house is for sale.","Is this seat free?","Those were the days!"],
 ["She has a cat and a dog.","The cat is black.","I need an umbrella.","Can you close the window?","He's an artist.","Where's the nearest bank?"],
 ["Cats sleep a lot.","The cats next door are noisy.","We have dinner at seven.","Life is short.","The life of a farmer is hard.","He goes to work by bus."],
 ["How many apples do you want?","We don't have much time.","Can I have a glass of water?","There isn't any bread left.","He gave me some useful information.","I have two pieces of news."],
 ["I have a few friends in Perth.","There's a little rice in the cupboard.","Few people know the answer.","We have little time.","Can I have a bit of help?","She speaks a few languages."],
 ["This is my mother's car.","The girls' bedroom is upstairs.","The children's shoes are by the door.","We had lunch at Tom's.","My boss's office is small.","The dog's name is Rex."],
 ["She cut herself on the knife.","We enjoyed ourselves at the party.","He fixed the car himself.","Help yourselves to some food.","I sometimes talk to myself.","The children dressed themselves."],
 ["Is the room big enough?","We don't have enough plates.","He isn't old enough to drive.","I didn't run fast enough.","There's enough food for everyone.","Is it warm enough for a swim?"],
 ["The government's decision surprised everyone.","The end of the film was sad.","We bought a ten-dollar ticket.","She works at the car factory.","Have you seen this week's menu?","He has a two-year-old daughter."]
],
adj:[
 ["I usually walk to work.","She's always happy.","We sometimes eat out on Friday.","He never drinks coffee.","They often visit their grandparents.","I'm rarely late for class."],
 ["My bike is older than my car.","This test is easier than the last one.","Darwin is hotter than Hobart.","The red dress is more expensive.","Her cooking is better than mine.","The weather is worse than yesterday."],
 ["This is the oldest building in the city.","She's the tallest girl in the class.","It was the best day of my life.","That's the most beautiful beach I know.","He's the funniest person I know.","Winter is the worst season."],
 ["She's good at fixing bikes.","I'm afraid of spiders.","He's interested in history.","We're worried about the test.","Are you angry with me?","They're proud of their daughter."],
 ["The lecture was boring.","I was bored at the party.","The results were surprising.","She was surprised by the gift.","The game was exciting.","We were excited about the holiday."],
 ["This road is much quieter.","My new job is a lot better.","The test was slightly easier than I expected.","Sydney is far bigger than Adelaide.","It's a bit warmer today.","Your phone is much faster than mine."],
 ["The water was absolutely freezing.","I'm very tired after work.","The soup was absolutely boiling.","The room was very small.","The party was really amazing.","She was completely furious."],
 ["The coffee was so hot.","It was such a long day.","She's so kind to everyone.","They have such a beautiful garden.","He was so tired that he fell asleep.","It was such a nice surprise."],
 ["He works as a bus driver.","She looks like her grandmother.","I used my coat as a pillow.","It sounds like a good plan.","As you can see, the room is ready.","He swims like a fish."]
],
preps:[
 ["I was hungry, so I made a sandwich.","She likes tea, but I like coffee.","We stayed home because it was cold.","I have a cat and a dog.","He was tired, but he kept working.","It was late, so we went home."],
 ["The keys are on the table.","She lives in Melbourne.","I'll meet you at the station.","The shop is on King William Street.","My bag is in the car.","We met at a party."],
 ["My birthday is in July.","The class starts at nine.","We have a test on Monday.","I was born in 1990.","See you next week.","The shop opens at ten."],
 ["Although it was cold, we went swimming.","Despite the rain, we had fun.","I went to work even though I was sick.","In spite of the traffic, we arrived on time.","Despite feeling tired, she finished the race.","Although he's rich, he isn't happy."],
 ["My brother loves sport, whereas I prefer music.","The hotel was old. Even so, we liked it.","Much as I like him, I don't trust him.","The test was difficult. Nevertheless, I passed.","He agreed, albeit slowly.","While some people like winter, others hate it."],
 ["My phone is broken, so I need a new one.","\"Is the shop open?\" \"I don't think so.\"","I said I would help, and I did.","She can swim, but her brother can't.","I wanted to go, but I wasn't able to.","\"Is he coming?\" \"I think so.\""]
],
writing:[
 ["When does the class start?","I work in a hospital.","Help!","I like apples, bananas and grapes.","What's your name?","It's cold. Close the window."],
 ["My birthday is in March.","She speaks Arabic and French.","It's my brother's car.","We're going to Melbourne on Friday.","The dog wagged its tail.","The girls' team won."],
 ["Turn left at the traffic lights.","My favourite colour is green.","We had a barbie in the backyard.","The kids are at the swimming centre.","See you this arvo.","I'll pick up some lollies."]
]
};
(function(){var M={sentences:SX,modals:MX,conditionals:CX,passive:PX,patterns:VX,nouns:NX,adj:AX,preps:RX,writing:WX};
 Object.keys(PXD).forEach(function(a){PXD[a].forEach(function(p,i){if(p&&M[a]&&M[a][i])M[a][i].px=p})})})();
