// Think & Solve: generates a deterministic problem scenario for every lab.
// 5 thinking skills — predict, design, debug, compare, estimate — 2 templates
// per skill per subject, picked by a hash of the module id so every lab gets a
// stable scenario. Difficulty (1–5) scales the framing, not the skill.

export type ThinkSkill = "predict" | "design" | "debug" | "compare" | "estimate";

export interface Scenario {
  skill: ThinkSkill;
  skillIcon: string;
  skillLabel: string;
  prompt: string;      // the problem scenario
  solution: string;    // self-check answer / reasoning
  hint: string;
  xp: number;
}

const SKILL_META: Record<ThinkSkill, { icon: string; label: string; verb: string }> = {
  predict: { icon: "🔮", label: "Predict It!", verb: "Predict" },
  design: { icon: "🏗️", label: "Design It!", verb: "Design" },
  debug: { icon: "🐛", label: "Debug It!", verb: "Debug" },
  compare: { icon: "⚖️", label: "Compare It!", verb: "Compare" },
  estimate: { icon: "📏", label: "Estimate It!", verb: "Estimate" },
};

type Tpl = { prompt: (t: string) => string; solution: string; hint: string };

// 10 templates per subject (2 per skill), keyed by skill order:
// predict, predict, design, design, debug, debug, compare, compare, estimate, estimate
const T: Record<string, Tpl[]> = {
  physics: [
    { prompt: (t) => `A pro soccer player kicks a ball for ${t}. Before they kick, you shout the exact path it will fly. What do you shout?`, solution: "It flies in a curve (a parabola): up fast, slowing at the top, then speeding back down. Kick angle + kick power decide the shape.", hint: "What did the projectile sims show about the path shape?" },
    { prompt: (t) => `Rain is falling straight down, but you're biking to ${t} — so the rain hits you sideways! From your view, which way does the rain travel?`, solution: "Diagonally toward you — your sideways motion adds to the rain's motion. Faster biking = more slanted. That's relative motion!", hint: "Try moving the observer in a relative-motion sim." },
    { prompt: (t) => `Design the kick for ${t}: the goal is far away and there's a wall of defenders. Pick your angle and power and explain why.`, solution: "A higher angle (about 45°) gives maximum distance; enough power to clear the defenders but not so much it sails over the goal.", hint: "In Projectile Motion, which angle made the range biggest?" },
    { prompt: (t) => `Design a pendulum for ${t} that swings exactly 1 time per second. What do you change — string length, mass, or both?`, solution: "Only the length! Mass doesn't matter (bigger push, same swing). A shorter string = faster tick, longer = slower. Tune length until 1 Hz.", hint: "In Pendulum Lab, what happened when you swapped the mass?" },
    { prompt: (t) => `Your friend's wave machine for ${t} makes tiny waves no matter what. They checked frequency and amplitude — what likely got missed?`, solution: "The tension/medium! A slack string or loose spring kills wave speed no matter the frequency. Tighten it and the waves carry.", hint: "What made waves travel faster on the string?" },
    { prompt: (t) => `A swing at ${t} goes 'squeak' at the exact top of every swing. Where is the squeak, in energy words?`, solution: "At the top, motion energy is 0 and stored (potential) energy is max — the seat briefly stops there, so that's where a loose part would rub.", hint: "Where does the swing move slowest?" },
    { prompt: (t) => `Two rocket designs for ${t}: A is heavy with a big engine, B is light with a small engine. Which reaches orbit? Defend it.`, solution: "B, most likely — thrust-to-weight wins. A heavy rocket needs way more force just to lift its own weight. Newton's 2nd law: a = F/m.", hint: "F = ma. Same force, bigger m — what happens to a?" },
    { prompt: (t) => `On the Moon vs Earth, the same pendulum clock for ${t} runs different. Faster or slower on the Moon — and why?`, solution: "Slower! Moon gravity is ~1/6 of Earth's, so the pendulum falls more gently and swings more slowly. Pendulum clocks would lose time on the Moon.", hint: "Gravity pulls the bob back — weaker pull means...?" },
    { prompt: (t) => `Estimate: how much longer does a 2 m pendulum take per swing than a 0.5 m one, for ${t}? Roughly double, triple, or 4×?`, solution: "About 2× — swing time goes with the SQUARE ROOT of length. √(2/0.5) = √4 = 2. It's never linear!", hint: "Square roots grow slower than you think." },
    { prompt: (t) => `A storm is 1 km away. You see lightning, then count 3 seconds until thunder for ${t}. Roughly how fast was the sound traveling?`, solution: "About 333 m/s (1000 m ÷ 3 s). Light got there instantly; sound took 3 s. Rule of thumb: 3 seconds ≈ 1 km.", hint: "Speed = distance ÷ time." },
  ],
  chemistry: [
    { prompt: (t) => `You leave two identical glasses out for ${t}: one with water, one with salt water. Overnight, only one grows crystals. Which — and what are the crystals?`, solution: "The salt water! Water evaporates but salt can't, so it's left behind as cubic salt crystals. Evaporation is a separation trick.", hint: "Which part of salt water can escape into the air?" },
    { prompt: (t) => `In the ${t} workshop, someone mixes 'the same amount' of vinegar and baking soda twice but gets different fizz. What secret ingredient did they change?`, solution: "Concentration (or amount) of one reactant — more vinegar acid or more soda surface area = more collisions per second = bigger fizz.", hint: "Reactions need particles to COLLIDE." },
    { prompt: (t) => `Design a recipe for ${t} that makes the biggest, slowest fizzing foam volcano — choose ingredient amounts and temperature.`, solution: "Warm (not hot) vinegar speeds particles; more baking soda adds fuel; a narrow neck builds pressure; a drop of soap traps bubbles for foam.", hint: "Particle speed + surface area + trapped gas..." },
    { prompt: (t) => `Design a team uniform for ${t} that stays cool in sun and warm in cold — using ONLY materials from a chemistry stockroom.`, solution: "Dark, matte outer layer absorbs sun; an insulating trapped-air layer (like foam or wool polymer fibers) underneath stops heat escaping.", hint: "Absorption vs insulation — which layer does which job?" },
    { prompt: (t) => `A rust-prevention spray for ${t} claims 'works forever'. Your test bike rusts anyway after 2 rainy weeks. What went wrong with the CLAIM?`, solution: "The claim ignored conditions: sprays wear off and moisture + oxygen still reach metal. Fair tests need controlled conditions and a timeline.", hint: "What did the rain do to the spray layer?" },
    { prompt: (t) => `Two students test 'which juice cleans pennies best' for ${t}. One uses dirty pennies, one uses shiny ones. Whose results can you trust — and why?`, solution: "Neither fully — the starting state wasn't controlled. Fair tests change ONE thing (the juice) and keep everything else identical.", hint: "What is a 'controlled variable'?" },
    { prompt: (t) => `Ice tea vs lemonade in the sun for ${t}: which stays cold longer and what does that teach about heat and states of matter?`, solution: "The one that melts slower has more 'stored cold' (bigger ice mass) or insulation. Melting absorbs heat energy — that's why ice drinks stay cold.", hint: "Where does the ice's melting energy come from?" },
    { prompt: (t) => `A mystery powder fizzes with vinegar but not with water for ${t}. Name two safe tests to identify it, and what each result would mean.`, solution: "Vinegar fizz test → carbonate (like baking soda). Iodine test → turns blue-black if starch. Two tests narrow the suspects safely.", hint: "Scientists run MULTIPLE small tests before naming a suspect." },
    { prompt: (t) => `Estimate: how many water molecules fit across a 1 cm drop, for ${t}? Millions, billions, or trillions?`, solution: "Trillions! A water molecule is ~0.0000000003 m wide; 0.01 m ÷ that ≈ 30 billion+ across — and trillions in the whole drop.", hint: "Molecules are unimaginably small." },
    { prompt: (t) => `A ${t} recipe feeds 4 people. How would you scale it EXACTLY for 10 — and which part (counts or ratios) stays fixed?`, solution: "Multiply every ingredient by 2.5 — the RATIO stays fixed. Chemistry recipes are ratios, not counts; change them and the product changes.", hint: "Think of a recipe as a ratio machine." },
  ],
  biology: [
    { prompt: (t) => `A tiny plant on the ${t} windowsill leans hard toward the glass. Predict what it's chasing and what happens if you turn the pot around.`, solution: "It chases light for photosynthesis. Turn the pot and it bends back toward the light over days — plants steer growth with light (phototropism).", hint: "What do leaves need to make food?" },
    { prompt: (t) => `In the ${t} habitat game, someone dumps 50 extra rabbits into a small meadow. Predict the next 3 things that happen.`, solution: "Grass crashes → rabbits starve → predator numbers boom then bust. Ecosystems balance through boom-bust chains.", hint: "Food chain: what eats what?" },
    { prompt: (t) => `Design a zoo enclosure for ${t}'s animal that keeps it healthy — pick space, food, shelter, and one 'wild instinct' feature.`, solution: "Match the wild niche: enough territory, the right diet, shelter for safety, plus enrichment (climbing, digging, hunting games) to express instincts.", hint: "What does the animal DO all day in the wild?" },
    { prompt: (t) => `Design a week of meals for ${t}'s athlete with the right fuel: what should each meal include and why?`, solution: "Carbs before for energy, protein after for muscle repair, water throughout, colorful plants for vitamins. Bodies build from what you feed them.", hint: "Energy now vs building materials later." },
    { prompt: (t) => `A student's 'plant needs soil' experiment for ${t} failed — the seed sprouted in water but then yellowed and stopped. Debug the setup.`, solution: "Water sprouts the seed (stored food), but without soil nutrients it runs out — yellow = nitrogen hunger. Add dilute nutrients: the plant needed more than water.", hint: "Sprouting uses seed food. What happens when it's gone?" },
    { prompt: (t) => `Your ${t} fitness tracker says 40 min of sport = 40 min of rest-equivalent, but you're exhausted. What's the bug in the tracker's logic?`, solution: "It counts minutes, not intensity or recovery needs. Heart rate, muscle repair, and sleep debt matter — one number hides the real story.", hint: "Is all 'exercise time' the same?" },
    { prompt: (t) => `Compare a goldfish bowl vs a pond for ${t}: why does the pond never need cleaning but the bowl does?`, solution: "The pond is an ecosystem — bacteria, plants, and snails recycle waste. The bowl is too small to hold a cleanup crew. Balance beats scrubbing.", hint: "Who 'cleans' in nature?" },
    { prompt: (t) => `Compare the heart of a runner vs a non-runner for ${t}: which pumps more blood per beat, and what does each do on stairs?`, solution: "The runner's bigger, stronger heart pumps more per beat: fewer, bigger beats. On stairs the runner breathes easy; the other gasps — their heart works harder per pump.", hint: "What does training do to muscle — including heart muscle?" },
    { prompt: (t) => `Estimate: how many times does your heart beat in one school day for ${t} (6 hours)?`, solution: "About 70 beats/min × 60 × 6 ≈ 25,000 beats — roughly 25 thousand before the last bell!", hint: "60–80 beats per minute, all day." },
    { prompt: (t) => `Estimate: how many bacteria live on a single fingertip after ${t}? Dozens, millions, or a whole city's worth?`, solution: "Millions — a fingertip carries 1,000–10,000+ bacteria per square cm, and one hand can host over a hundred million. Wash those hands!", hint: "They're microscopic — how many fit on a dot?" },
  ],
  earthspace: [
    { prompt: (t) => `You're packing for a camping trip during ${t}. The forecast says '30% chance of rain.' What does that number actually mean — and do you pack the tent?`, solution: "It means 3 out of 10 similar days get rain somewhere nearby. Pack the tent — 30% isn't 0%!", hint: "Percent of WHAT, out of how many days?" },
    { prompt: (t) => `In the ${t} weather sim, a storm forms over warm ocean. List the 3 ingredients it grabbed, in order.`, solution: "Warm water (fuel/evaporation), rising moist air (convection), and spin from Earth's rotation. Take away any one and the storm dies.", hint: "Warm, wet, spinning..." },
    { prompt: (t) => `Design a Mars base for ${t}: pick 3 systems it must include to keep astronauts alive, and say what each replaces from Earth.`, solution: "Air generator (replaces atmosphere), water recycler (replaces rain/lakes), radiation shelter or underground habitat (replaces magnetic field). Each patches a missing Earth system.", hint: "What does Earth give you for free every day?" },
    { prompt: (t) => `Design the perfect sundial spot for ${t}'s schoolyard: where does it go, which way does its shadow tip point, and when does it fail?`, solution: "Open southern sky (northern hemisphere), shadow tip pointing north at noon, fails on cloudy days and needs seasonal adjustment — Earth's tilt shifts the shadow.", hint: "Where is the sun at noon? Where is it in winter?" },
    { prompt: (t) => `A friend insists seasons come from Earth getting closer to the Sun for ${t}. Debug this idea with one killer fact.`, solution: "When the north has summer, the south has winter — same distance from the Sun! Seasons come from the 23.5° tilt changing how direct sunlight hits.", hint: "What's the weather in Australia right now?" },
    { prompt: (t) => `A ${t} model shows the Moon orbiting Earth in 1 day. Debug the model: what's wrong and what's the real schedule?`, solution: "Real orbit = ~27 days. The model confuses orbit time with phase cycle (~29.5 days, because Earth also moves around the Sun) — and a 1-day Moon would mean monthly eclipse chaos!", hint: "How long between full moons?" },
    { prompt: (t) => `Compare living on the Moon vs Mars for ${t}: pick the harder place and defend it with 2 reasons.`, solution: "Mars is harder: month-long dust storms vs Moon's none, 11-month trip vs 3 days, thinner atmosphere. The Moon at least gets sunlight and quick resupply.", hint: "Distance, weather, and resupply — score both places." },
    { prompt: (t) => `Compare the Sun to a campfire for ${t}: same energy source? What's different about how each makes light?`, solution: "Totally different: fire burns fuel (chemical energy), the Sun fuses hydrogen into helium (nuclear). That's why the Sun can run for billions of years.", hint: "What would happen if the Sun were 'burning' fuel?" },
    { prompt: (t) => `Estimate: how many Earths would fit across the Sun's face, for ${t}?`, solution: "About 109 Earths across the Sun's diameter — and over a million Earths by volume!", hint: "The Sun is 1.4 million km wide; Earth is 12,700." },
    { prompt: (t) => `Estimate: for ${t}, how old are you in Martian years (1 Mars year = 687 Earth days)?`, solution: "Age × 365 ÷ 687 ≈ age × 0.53. A 10-year-old is about 5½ Martian years old.", hint: "Longer orbit = longer year. Divide." },
  ],
  math: [
    { prompt: (t) => `Pizza time for ${t}: 3 friends share 2 pizzas fairly. How much does each person get — and how do you know it's fair?`, solution: "2 ÷ 3 = 2/3 of a pizza each: cut each pizza into 3, everyone takes 1 slice from each. Same amount, proven by counting.", hint: "Cut each pizza into how many pieces?" },
    { prompt: (t) => `A recipe for ${t} needs 3/4 cup sugar but you're doubling it for a class party. What do you measure, using cups you actually own (1, 1/2, 1/4)?`, solution: "3/4 × 2 = 6/4 = 1 1/2 cups: one 1-cup scoop + three 1/4 scoops (or 1/2 + 1/2 + 1/2).", hint: "Double the fraction, then rename it." },
    { prompt: (t) => `Design a secret number code for ${t}: pick a rule ('add 3, then double') and encrypt 4. Now write the DECRYPTION steps in reverse.`, solution: "4 → 7 → 14. Reverse: halve, then subtract 3 → 14→7→4. Inverse operations undo a chain in reverse order.", hint: "Every machine runs backwards with inverse buttons." },
    { prompt: (t) => `Design a fair ticket price for ${t}'s class fair: 40 visitors, $12 booth cost, want $60 profit. Price per ticket?`, solution: "($12 + $60) ÷ 40 = $1.80 per ticket. Charge $2 for a safety margin — and maybe $1 for kids to sell more tickets.", hint: "Cost + profit, then split across tickets." },
    { prompt: (t) => `A ${t} vending machine gives change wrong: pays $1 item costs $0.75 and returns $0.15. Debug: what's the machine's mistaken rule?`, solution: "It subtracted wrong (0.75 − 0.60?) — the correct rule is 1.00 − 0.75 = 0.25. The machine subtracts cost from a wrong 'paid' value.", hint: "Write out the subtraction it should do." },
    { prompt: (t) => `A number pattern machine for ${t} outputs 7, 14, 28, 56... Your friend predicts the next as 62. Debug their thinking.`, solution: "They added 6 instead of DOUBLING. The rule is ×2, so next is 112. Test a rule on ALL the numbers, not just the last pair.", hint: "7→14 is not +7. What operation is it?" },
    { prompt: (t) => `Compare two chores for ${t}: $2/day for 10 days, or $5/day for 3 days. Which pays more — and what math decided it?`, solution: "$20 vs $15 — the $2 chore wins by $5. Multiplication beats guessing; total = rate × days.", hint: "rate × time = total." },
    { prompt: (t) => `Compare a 8-slice $12 pizza vs a 6-slice $9 pizza for ${t}: which gives more pizza per dollar?`, solution: "8/12 = $1.50 per slice vs 6/9 ≈ $1.33 — the 6-slice is cheaper per slice AND per dollar it's nearly a tie; per slice, $9 pizza wins value.", hint: "Price ÷ slices = cost per slice." },
    { prompt: (t) => `Estimate for ${t}: how many times does your heart beat while you do 20 minutes of homework?`, solution: "≈ 70 × 20 = 1,400 beats. Multiplication turns a per-minute rate into a big total fast.", hint: "Per-minute rate × minutes." },
    { prompt: (t) => `Estimate for ${t}: your school gym fits about how many tennis balls? Ball-park it with a smart method.`, solution: "Estimate volume: gym ≈ 3,000 m³, ball ≈ 0.0001 m³ → about 30 million balls with packing air gaps. Order of magnitude is the win.", hint: "Big volume ÷ tiny volume, then round hard." },
  ],
  music: [
    { prompt: (t) => `A ${t} film scene needs 'sad but hopeful' music. Predict what tempo and pitch range you'd reach for, and why.`, solution: "Slow tempo (minor key) for sadness, but a rising melody line for hope. Slow + rising = 'things are hard, but improving'.", hint: "Sad = slow/low. Hopeful = rising. Combine them." },
    { prompt: (t) => `In ${t}, the school bell rings 8 times but the last ring sounds 'wrong'. Predict which note it was and what the ring-mixer did.`, solution: "It was off-pitch — flat or sharp from the pattern. Our ears expect the scale's ladder; one wrong rung jumps out instantly.", hint: "Your ear is a pitch-detective." },
    { prompt: (t) => `Design a 30-second ${t} jingle for the school radio: structure it (intro–hook–end) and pick 2 instruments.`, solution: "4-bar intro, 8-bar hook repeated twice (hooks repeat!), punchy ending. Snappy drums + bright synth/bell carry a short jingle.", hint: "Short songs live on their hook." },
    { prompt: (t) => `Design a practice plan for ${t}'s hardest 4 bars: how many times, in what chunks, with what breaks?`, solution: "Split into 1-bar chunks, 5 slow reps each, then join 2+2, then 4 together; 5-min breaks every 15 min. Chunking beats marathon practice.", hint: "Small bites, then stack them." },
    { prompt: (t) => `Your ${t} recording sounds 'thin and wobbly'. Debug: list 2 likely causes and the fix for each.`, solution: "Wobbly = timing/rhythm against a click track; thin = one layer/low volume — add an octave or a bass layer, and record with a steady beat.", hint: "Timing problems and texture problems are different bugs." },
    { prompt: (t) => `The ${t} drum machine is stuck at 60 BPM but the song is 120 BPM. Debug: what got set wrong and how does it sound?`, solution: "Tempo is half of what it should be — the song sounds slow-motion/drunk. Doubling BPM (or setting the beat note to eighth-notes) fixes it.", hint: "What does BPM control?" },
    { prompt: (t) => `Compare piano vs guitar for ${t}: which starts songs faster and why does one need tuning forever?`, solution: "Piano starts faster (press = note, always in tune-ish); guitar needs tuning constantly (strings stretch with weather and playing). Strings are fussy; hammers are not.", hint: "How does each instrument MAKE its note?" },
    { prompt: (t) => `Compare a $20 recorder vs a $2000 violin for ${t}: why does the violin cost 100× more — and does price = better for a beginner?`, solution: "Violin = carved wood, hand-fit parts, craftsmanship; recorder = molded plastic. For a beginner, the cheap one teaches 95% of the skill — fit matters more than price.", hint: "What are you paying for? Materials? Skill?" },
    { prompt: (t) => `Estimate for ${t}: how many 3-minute songs fit in a 1-hour car ride?`, solution: "60 ÷ 3 = 20 songs — enough for a whole playlist between rest stops.", hint: "Simple division, then round for intros/outros." },
    { prompt: (t) => `Estimate for ${t}: a drummer hits ~4 notes/second. How many notes in a 4-minute drum solo?`, solution: "4 × 60 × 4 = 960 notes — nearly a thousand decisions in 4 minutes!", hint: "Notes per second → per minute → total." },
  ],
  art: [
    { prompt: (t) => `A ${t} poster must grab attention from across the street. Predict which works: light text on white, or yellow text on black — and why?`, solution: "Yellow on black — maximum contrast. Big shapes and contrast read from far away; subtle palettes whisper.", hint: "Which pair can you read from the back of the room?" },
    { prompt: (t) => `Your ${t} painting dries with muddy colors where orange met green. Predict what mixing rule caused it — and how to avoid it next time.`, solution: "Orange + green = mixing all three primaries → mud. Avoid by mixing no more than 2 primaries per patch, or let areas dry before touching.", hint: "What do all THREE primaries make?" },
    { prompt: (t) => `Design a book cover for ${t}'s adventure story: choose subject, 2 colors, 1 font style, and where the eye lands first.`, solution: "One bold hero object (a dragon wing, a lighthouse), high-contrast duo like navy/gold, chunky title font; the eye lands on the brightest spot — the hero.", hint: "One hero, one contrast, one first-look spot." },
    { prompt: (t) => `Design a ${t} flag for a made-up country: 2 colors + 1 symbol, visible at tiny size, and explain each choice.`, solution: "Two high-contrast fields split boldly, one simple centered symbol (star, wave, mountain). Simple survives shrinking; meaning comes from story, not detail.", hint: "Test it at stamp size — what survives?" },
    { prompt: (t) => `Your ${t} drawing's face looks 'off' but you can't say why. Debug: name the 2 most common face-math mistakes.`, solution: "Eyes placed too high (they sit at the middle of the head) and ears/misaligned features not on the eye line. Measure with your pencil, don't guess.", hint: "Where do eyes REALLY sit on a head?" },
    { prompt: (t) => `A ${t} paper tower keeps folding at the same corner. Debug the build: what's the engineering fix?`, solution: "That corner bears uneven load — add a diagonal brace or triangle support, and square the base first. Triangles resist bending; rectangles fold.", hint: "What shape never folds without force?" },
    { prompt: (t) => `Compare drawing from a photo vs from life for ${t}: which teaches more, and what does each hide?`, solution: "Life teaches more — it forces you to turn 3D into 2D yourself. Photos flatten depth AND already picked the lighting for you.", hint: "What work has the photo already done?" },
    { prompt: (t) => `Compare two ${t} logos: a detailed eagle vs a plain swoosh. Which survives being tiny on a phone screen — and why?`, solution: "The swoosh. Tiny sizes destroy detail; bold simple shapes keep their identity. Detail is for posters, simplicity is for icons.", hint: "Shrink both to 24×24 pixels in your head." },
    { prompt: (t) => `Estimate for ${t}: how many brushstrokes fill a 1 m² wall if one stroke covers 10 cm × 2 cm?`, solution: "10 × 2 cm = 20 cm² per stroke; 10,000 cm² ÷ 20 = 500 strokes. Big jobs = huge stroke counts — that's why rollers exist!", hint: "Wall area ÷ stroke area." },
    { prompt: (t) => `Estimate for ${t}: a mural wall is 4 m wide and 2 m tall. How many 40 cm-tile rows does the sketch grid need?`, solution: "2 m ÷ 0.4 m = 5 rows; 4 ÷ 0.4 = 10 columns → 50 tiles. Gridding a mural is just division that artists use every day.", hint: "Divide each wall side by the tile size." },
  ],
  cs: [
    { prompt: (t) => `A ${t} robot must cross a room but stops 1 meter short every time. Predict which command is wrong: move(3), move(5), or turn(90)?`, solution: "move(5) is too small — it under-runs the distance. Measure once (say the room is 6), then move(6). Precise values beat guessing.", hint: "Which command controls DISTANCE?" },
    { prompt: (t) => `In ${t}, a sorting game sorts 10 cards in 5 steps but 100 cards in 80 steps. Predict: what happened to the steps when data grew 10×?`, solution: "Steps grew ~16×, not 10× — that's a quadratic (n²) algorithm. Doubling data QUADRUPLES work. Linear sorts don't behave like this.", hint: "n² grows faster than n." },
    { prompt: (t) => `Design a story-maze for ${t}: 3 rooms, 1 treasure, 1 trap. Write the rule that decides what each room does.`, solution: "Rooms as if/else: if player has key → open treasure; else → show trap message. State (has-key) drives branching.", hint: "What does the program need to REMEMBER?" },
    { prompt: (t) => `Design an algorithm for ${t} that finds the biggest number in a list of any size — no peeking at the whole list at once!`, solution: "Keep a 'champion' variable: start with the first number, walk the list, replace the champion whenever you see bigger. One pass, works for any length.", hint: "You only need to remember ONE number at a time." },
    { prompt: (t) => `Your ${t} loop draws squares forever and freezes the page. Debug: what's missing from 'while (true) { drawSquare() }'?`, solution: "No exit condition — the loop never ends. Add a counter (draw 4, then stop) or an event check. Every loop needs a way out.", hint: "When should it STOP?" },
    { prompt: (t) => `A ${t} program says 'score = score + 1' but the score jumps by 2. Debug: what's really happening?`, solution: "The increment runs twice — the line is inside two nested loops or two listeners both fire. Add a print inside the loop to see the double-fire.", hint: "Count the paths that reach that line." },
    { prompt: (t) => `Compare blocks vs typed code for ${t}: which teaches structure faster, and which scales to real apps?`, solution: "Blocks teach structure fast (no syntax walls), but typed code scales to real apps. Blocks are training wheels — great ones, but eventually you pedal.", hint: "What blocks you in each: ideas or typos?" },
    { prompt: (t) => `Compare storing ${t}'s game art as 5 separate files vs 1 big file: pick one and defend it for a slow-internet game.`, solution: "One file — fewer round-trips beats smaller size on slow links. Games bundle assets for exactly this reason. One request, load once, play.", hint: "Which cost dominates: file size or number of requests?" },
    { prompt: (t) => `Estimate for ${t}: a game runs 60 frames per second. How many frames in a 10-minute play session?`, solution: "60 × 60 × 10 = 36,000 frames — your code runs the whole frame pipeline 36 thousand times. Tiny inefficiencies add up!", hint: "Seconds per minute × minutes." },
    { prompt: (t) => `Estimate for ${t}: your name is 6 letters. About how many different 6-letter names could exist using the alphabet?`, solution: "26⁶ ≈ 309 million — that's why passwords use long strings. Each position multiplies the possibilities.", hint: "26 choices per letter, 6 times. Exponential!" },
  ],
  language: [
    { prompt: (t) => `A ${t} story opens: 'The door creaked open.' Predict what a reader feels — and what 3 words could change the mood completely.`, solution: "Readers feel suspense (what's inside?). Words like 'burst', 'slid', or 'creaked slowly' each flip the mood: danger, calm, or dread. Verbs steer emotion.", hint: "Which word carries the fear — the door or the verb?" },
    { prompt: (t) => `For ${t}, a friend says 'I seen him at the store.' Predict whether a reader notices — and what it costs the story.`, solution: "Readers trip on it, even if they can't name the rule ('I saw'). Grammar errors pull readers OUT of the story world.", hint: "Does the error stop the movie in their head?" },
    { prompt: (t) => `Design a 6-word memoir for ${t} about your best day. Choose every word like it costs a dollar.`, solution: "Example: 'Dad's old bike. My first hill.' Six words that imply a whole day: object + event + feeling. Cutting words forces meaning.", hint: "What's the ONE image that says it all?" },
    { prompt: (t) => `Design a clue chain for ${t}'s mystery: 3 clues the reader gets before the hero solves it. What makes a clue FAIR?`, solution: "Each clue is visible but quiet — the reader COULD solve it. Fairness = the answer was always on the page, just not spotlighted.", hint: "Would a careful reader beat the detective?" },
    { prompt: (t) => `Your ${t} story's dragon is 'nice, then suddenly evil'. Debug the character: what's missing from the middle?`, solution: "A reason and a visible change — motives and small shifts (secrets, a lost egg) make twists earned. Change needs steps, not switches.", hint: "Twists need setup. What did the reader see before?" },
    { prompt: (t) => `A ${t} sentence runs 47 words long and everyone rereads it 3 times. Debug the sentence without losing meaning.`, solution: "Split it at the 'and's, kill repeated phrases, keep the strongest verb. Long isn't wrong — but every extra word must EARN its place.", hint: "How many ideas are fighting in one sentence?" },
    { prompt: (t) => `Compare reading the ${t} book first vs watching its movie first: which grows your imagination more, and what does each decide for you?`, solution: "The book — you cast the movie in your head. The film decides faces and voices; the book leaves the camera work to you.", hint: "Whose job is the picture-making?" },
    { prompt: (t) => `Compare two ${t} openings: 'It was a dark and stormy night...' vs 'The night the lights went out, I found the letter.' Which hooks — and what's the difference?`, solution: "The second: it implies a mystery NOW with a specific moment. Clichés summarize; specific moments create questions the reader must chase.", hint: "Which one makes you ask a question?" },
    { prompt: (t) => `Estimate for ${t}: you read 200 words a minute. How long until you finish a 90-page book at ~250 words/page?`, solution: "22,500 words ÷ 200 ≈ 112 minutes — under 2 hours of reading. Books are smaller than they feel!", hint: "Total words ÷ reading speed." },
    { prompt: (t) => `Estimate for ${t}: how many words do you speak in a school day if you average 100 words per minute of talking?`, solution: "Say you talk 60 minutes total → ~6,000 words. Talking is constant word output — most of it before lunch!", hint: "Guess minutes spent actually talking." },
  ],
  geography: [
    { prompt: (t) => `A letter for ${t} must reach Antarctica. List the journey's stops in order and what each one changes (plane? ship? sled?).`, solution: "Plane to a southern hub (Chile/NZ), ship across the Drake Passage to a coastal station, then sled/aircraft inland. Each leg changes vehicle for terrain.", hint: "Where do roads end?" },
    { prompt: (t) => `A new island erupts from the sea near ${t}. Predict which country claims interest, what maps must update, and who studies it first.`, solution: "The nearest nation + shipping lanes care; maps add the island (charts update); geologists/volcanologists arrive first. New land = instant geography.", hint: "Who has been waiting for land?" },
    { prompt: (t) => `Design a tiny survival kit for ${t}'s desert crossing vs arctic crossing: name 3 items that appear in BOTH and 2 that swap.`, solution: "Both: water, navigation, signal/first-aid. Swap: sun protection + daytime travel (desert) ↔ insulated layers + heat source (arctic). Environment flips the packing list.", hint: "What does each environment attack — heat or cold?" },
    { prompt: (t) => `Design a 'you are here' tourist map for ${t}: which 3 landmarks go first and what scale keeps it pocket-sized?`, solution: "Landmarks by 'can't-miss' rank, large-scale (zoomed) grid for walkability, tiny full-city inset. Tourists need walking detail + orientation, not every street.", hint: "What does a tourist actually DO all day?" },
    { prompt: (t) => `A ${t} quiz map says Brazil borders Chile. Debug with map evidence: why is that impossible?`, solution: "Chile is a thin Pacific strip; Brazil's Amazon side touches the Atlantic — between them sit Peru/Bolivia/Argentina. No shared border exists on any projection.", hint: "Which countries sit between them?" },
    { prompt: (t) => `Your ${t} globe shows Greenland huge and Africa 'normal'. Debug: is the globe broken or is something else going on?`, solution: "Flat maps (Mercator) stretch areas near the poles. Greenland looks Africa-sized but is 14× smaller. The globe is fine — the projection is lying politely.", hint: "Peel an orange flat — what happens to the top?" },
    { prompt: (t) => `Compare river vs mountain borders for ${t}: which changes over time and which makes better 'keep-out' lines?`, solution: "Rivers shift course (messy, living borders); mountains are fixed walls (cleaner defense). That's why so many country lines follow ridges.", hint: "Which one moves on its own?" },
    { prompt: (t) => `Compare living at 30°N vs 30°S for ${t}: same latitude, same life? Name one way the hemispheres differ.`, solution: "Similar sun angle/seasons-in-reverse, but different land/ocean split: 30°S is mostly ocean (Sahara vs open water!), so climates and culture diverge hugely.", hint: "Look at what's actually AT that latitude band." },
    { prompt: (t) => `Estimate for ${t}: a plane flies 900 km/h. Roughly how long from London to New York (~5,500 km)?`, solution: "5,500 ÷ 900 ≈ 6 hours (plus wind! jets ride the jet stream). Great-circle routes + winds decide real flight times.", hint: "Distance ÷ speed, then round." },
    { prompt: (t) => `Estimate for ${t}: about how many people live within 100 km of YOUR home? Thousands, millions, or tens of millions?`, solution: "Depends on density: a big-city kid ≈ millions (10M+ in megacity rings), rural ≈ thousands. Density × area is the estimation engine.", hint: "Area × people per km²." },
  ],
};

// Fallback for any subject without dedicated templates (defensive; all 10 are covered)
const GENERIC: Tpl[] = T.physics;

function hashStr(s: string): number {
  let h = 0;
  for (let i = 0; i < s.length; i++) h = (h * 31 + s.charCodeAt(i)) >>> 0;
  return h;
}

/**
 * Deterministic scenario for a lab. Same id → same scenario, forever.
 * `title` personalizes the prompt so scenarios mention the actual lab topic.
 */
export function scenarioFor(moduleId: string, subjectId: string, title: string, difficulty: number): Scenario {
  const pool = T[subjectId] ?? GENERIC;
  const h = hashStr(moduleId);
  const idx = h % pool.length;
  const tpl = pool[idx];
  // Templates are ordered 2 per skill: 0-1 predict, 2-3 design, 4-5 debug, 6-7 compare, 8-9 estimate
  const skillOrder: ThinkSkill[] = ["predict", "design", "debug", "compare", "estimate"];
  const skill = skillOrder[Math.floor(idx / 2) % 5];
  const meta = SKILL_META[skill];
  return {
    skill,
    skillIcon: meta.icon,
    skillLabel: meta.label,
    prompt: tpl.prompt(title),
    solution: tpl.solution,
    hint: tpl.hint,
    xp: 20 + Math.min(3, Math.max(0, (difficulty ?? 1) - 1)) * 5,
  };
}

export const THINK_SKILLS: Array<{ id: ThinkSkill; icon: string; label: string }> = (
  Object.keys(SKILL_META) as ThinkSkill[]
).map((k) => ({ id: k, icon: SKILL_META[k].icon, label: SKILL_META[k].label }));
