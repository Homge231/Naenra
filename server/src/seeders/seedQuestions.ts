import path from 'path'
import dotenv from 'dotenv'
dotenv.config({ path: path.resolve(__dirname, '../../.env') })

import { supabase } from '../config/supabase'

export interface QuestionSeedItem {
  question_text: string
  target_word: string
  hint: string
  topic: string
  difficulty: 'A1' | 'A2' | 'B1' | 'B2' | 'C1'
}

export const QUESTION_BANK: QuestionSeedItem[] = [
  // ───────────────────────────────────────────────────────────────────────────
  // 1. DAILY-LIFE (90 Questions: 30 A1/A2, 30 B1/B2, 30 C1)
  // ───────────────────────────────────────────────────────────────────────────
  // DAILY-LIFE: A1 / A2 (30 questions)
  { question_text: 'I drink a glass of fresh ________ every morning with breakfast.', target_word: 'water', hint: 'Essential clear liquid for life', topic: 'daily-life', difficulty: 'A1' },
  { question_text: 'Every night I sleep comfortably in my warm ________.', target_word: 'bed', hint: 'Furniture piece for sleeping', topic: 'daily-life', difficulty: 'A1' },
  { question_text: 'She likes to cook dinner in the spacious ________.', target_word: 'kitchen', hint: 'Room where food is prepared', topic: 'daily-life', difficulty: 'A2' },
  { question_text: 'He wakes up early to walk his friendly ________ in the park.', target_word: 'dog', hint: 'Popular canine household pet', topic: 'daily-life', difficulty: 'A1' },
  { question_text: 'They turn on the ________ to watch their favorite evening show.', target_word: 'tv', hint: 'Abbreviation for television', topic: 'daily-life', difficulty: 'A1' },
  { question_text: 'I always brush my ________ right after eating breakfast.', target_word: 'teeth', hint: 'Hard white structures in the mouth', topic: 'daily-life', difficulty: 'A1' },
  { question_text: 'She put on a thick coat because the weather was very ________.', target_word: 'cold', hint: 'Opposite of hot or warm', topic: 'daily-life', difficulty: 'A1' },
  { question_text: 'We bought fresh fruits and vegetables at the local ________.', target_word: 'market', hint: 'Place where goods are bought and sold', topic: 'daily-life', difficulty: 'A2' },
  { question_text: 'He takes a warm ________ every morning to feel refreshed.', target_word: 'shower', hint: 'Washing body under spraying water', topic: 'daily-life', difficulty: 'A2' },
  { question_text: 'Please lock the front ________ before leaving the house.', target_word: 'door', hint: 'Movable barrier at house entrance', topic: 'daily-life', difficulty: 'A1' },
  { question_text: 'She reads an inspiring ________ before going to sleep.', target_word: 'book', hint: 'Bound set of printed pages', topic: 'daily-life', difficulty: 'A1' },
  { question_text: 'He writes a daily journal entry using a black ink ________.', target_word: 'pen', hint: 'Instrument for writing with ink', topic: 'daily-life', difficulty: 'A1' },
  { question_text: 'The adorable white ________ loves sleeping on the soft rug.', target_word: 'cat', hint: 'Small domesticated feline pet', topic: 'daily-life', difficulty: 'A1' },
  { question_text: 'He sat at his wooden ________ to work on his laptop.', target_word: 'desk', hint: 'Table used for studying or writing', topic: 'daily-life', difficulty: 'A1' },
  { question_text: 'She tied her left ________ lace before going for a run.', target_word: 'shoe', hint: 'Footwear item worn on the foot', topic: 'daily-life', difficulty: 'A1' },
  { question_text: 'The bright morning ________ warmed the quiet living room.', target_word: 'sun', hint: 'Star at the center of our solar system', topic: 'daily-life', difficulty: 'A1' },
  { question_text: 'We hung a beautiful family photo on the living room ________.', target_word: 'wall', hint: 'Vertical structure bounding a room', topic: 'daily-life', difficulty: 'A1' },
  { question_text: 'She poured hot soup into a small ceramic ________.', target_word: 'bowl', hint: 'Round deep dish for liquid food', topic: 'daily-life', difficulty: 'A1' },
  { question_text: 'He loves to ________ fresh pasta for dinner on weekends.', target_word: 'cook', hint: 'Prepare food by heating it', topic: 'daily-life', difficulty: 'A1' },
  { question_text: 'They love taking an evening walk around the city ________.', target_word: 'park', hint: 'Public green area in a town', topic: 'daily-life', difficulty: 'A1' },
  { question_text: 'She turned on the reading ________ beside her bed.', target_word: 'lamp', hint: 'Electric light device', topic: 'daily-life', difficulty: 'A1' },
  { question_text: 'He washes his dirty ________ after eating lunch.', target_word: 'dish', hint: 'Container used for holding or serving food', topic: 'daily-life', difficulty: 'A1' },
  { question_text: 'We cleaned every ________ in the house on Saturday morning.', target_word: 'room', hint: 'Space inside a building bounded by walls', topic: 'daily-life', difficulty: 'A1' },
  { question_text: 'She checked her silver ________ to see what time it was.', target_word: 'watch', hint: 'Small timepiece worn on the wrist', topic: 'daily-life', difficulty: 'A2' },
  { question_text: 'He listens to his favorite music on the ________.', target_word: 'radio', hint: 'Device for receiving audio broadcasts', topic: 'daily-life', difficulty: 'A2' },
  { question_text: 'They enjoy eating fresh ________ together as a family.', target_word: 'food', hint: 'Nutritious substance people or animals eat', topic: 'daily-life', difficulty: 'A1' },
  { question_text: 'She opened the bedroom ________ to let in fresh morning air.', target_word: 'window', hint: 'Opening in a wall fitted with glass', topic: 'daily-life', difficulty: 'A2' },
  { question_text: 'He set his alarm ________ for six o\'clock in the morning.', target_word: 'clock', hint: 'Instrument for measuring and showing time', topic: 'daily-life', difficulty: 'A1' },
  { question_text: 'She put on a beautiful gold ________ for the evening party.', target_word: 'ring', hint: 'Circular band worn as ornament on finger', topic: 'daily-life', difficulty: 'A1' },
  { question_text: 'We keep our fresh food inside the cold ________.', target_word: 'fridge', hint: 'Appliance for keeping food cold', topic: 'daily-life', difficulty: 'A2' },

  // DAILY-LIFE: B1 / B2 (30 questions)
  { question_text: 'Maintaining a healthy balance between work and life requires good ________ management.', target_word: 'time', hint: 'The ongoing sequence of events', topic: 'daily-life', difficulty: 'B1' },
  { question_text: 'Developing a consistent morning ________ helps boost daily productivity.', target_word: 'routine', hint: 'A sequence of regular actions or habits', topic: 'daily-life', difficulty: 'B1' },
  { question_text: 'She decided to ________ her bedroom with warm lights and indoor plants.', target_word: 'decorate', hint: 'Make something look more attractive', topic: 'daily-life', difficulty: 'B1' },
  { question_text: 'Proper hydration and regular exercise contribute to long term ________.', target_word: 'wellness', hint: 'The state of being in good health', topic: 'daily-life', difficulty: 'B2' },
  { question_text: 'He manages household expenses by keeping a strict monthly ________.', target_word: 'budget', hint: 'An estimate of income and expenditure', topic: 'daily-life', difficulty: 'B1' },
  { question_text: 'They spent the weekend organizing and clearing out clutter from the ________.', target_word: 'basement', hint: 'Floor of a building below ground level', topic: 'daily-life', difficulty: 'B2' },
  { question_text: 'Cooking meals at home is usually more ________ than dining out daily.', target_word: 'economical', hint: 'Giving good value for money spent', topic: 'daily-life', difficulty: 'B2' },
  { question_text: 'Setting daily goals helps maintain focus and personal ________.', target_word: 'discipline', hint: 'Practice of training self-control', topic: 'daily-life', difficulty: 'B2' },
  { question_text: 'She felt a deep sense of ________ after finishing all her household chores.', target_word: 'satisfaction', hint: 'Fulfillment of one\'s expectations', topic: 'daily-life', difficulty: 'B2' },
  { question_text: 'Recycling plastic bottles is a simple way to protect our ________.', target_word: 'environment', hint: 'The natural world surrounding us', topic: 'daily-life', difficulty: 'B1' },
  { question_text: 'He marked important personal events on his wall ________.', target_word: 'calendar', hint: 'Chart showing days, weeks, and months', topic: 'daily-life', difficulty: 'B1' },
  { question_text: 'Weekly household ________ keeps the living spaces sanitary and fresh.', target_word: 'cleaning', hint: 'Act of making something free of dirt', topic: 'daily-life', difficulty: 'B1' },
  { question_text: 'Regular physical ________ strengthens muscles and improves cardio health.', target_word: 'exercise', hint: 'Activity requiring physical effort', topic: 'daily-life', difficulty: 'B1' },
  { question_text: 'She loves spending quiet ________ hours reading in the garden.', target_word: 'morning', hint: 'Period of time from sunrise to noon', topic: 'daily-life', difficulty: 'B1' },
  { question_text: 'They gather around the dinner table every ________ to share stories.', target_word: 'evening', hint: 'Period of time at the end of the day', topic: 'daily-life', difficulty: 'B1' },
  { question_text: 'Spending quality time with ________ strengthens personal bonds.', target_word: 'family', hint: 'Group of people related by blood or marriage', topic: 'daily-life', difficulty: 'B1' },
  { question_text: 'He hosted a warm dinner party for his closest ________.', target_word: 'friends', hint: 'People with whom one has a bond of mutual affection', topic: 'daily-life', difficulty: 'B1' },
  { question_text: 'She planted organic tomatoes in her backyard ________.', target_word: 'garden', hint: 'Piece of ground used for growing flowers or vegetables', topic: 'daily-life', difficulty: 'B1' },
  { question_text: 'The master ________ features a large comfortable king size bed.', target_word: 'bedroom', hint: 'Room used primarily for sleeping', topic: 'daily-life', difficulty: 'B1' },
  { question_text: 'Doing laundry and ironing clothes are typical weekly ________.', target_word: 'chores', hint: 'Routine domestic tasks', topic: 'daily-life', difficulty: 'B2' },
  { question_text: 'He prepares a wholesome ________ with eggs, toast, and coffee.', target_word: 'breakfast', hint: 'First meal of the day', topic: 'daily-life', difficulty: 'B1' },
  { question_text: 'Eating a balanced ________ rich in nutrients improves overall vitality.', target_word: 'nutrition', hint: 'Process of providing or obtaining food necessary for health', topic: 'daily-life', difficulty: 'B2' },
  { question_text: 'She practices mindfulness meditation to reduce mental ________.', target_word: 'anxiety', hint: 'Feeling of worry, nervousness, or unease', topic: 'daily-life', difficulty: 'B2' },
  { question_text: 'He set a reminder on his smartphone to stay ________.', target_word: 'organized', hint: 'Arranged systematically or ordered', topic: 'daily-life', difficulty: 'B1' },
  { question_text: 'Good sleep ________ includes turning off electronic screens before bed.', target_word: 'hygiene', hint: 'Conditions or practices conducive to maintaining health', topic: 'daily-life', difficulty: 'B2' },
  { question_text: 'They made a detailed shopping ________ before visiting the supermarket.', target_word: 'checklist', hint: 'List of items to be checked or completed', topic: 'daily-life', difficulty: 'B1' },
  { question_text: 'Living in a quiet neighborhood brings peace and ________.', target_word: 'tranquility', hint: 'Quality or state of being tranquil and calm', topic: 'daily-life', difficulty: 'B2' },
  { question_text: 'She takes supplements to bolster her body\'s immune ________.', target_word: 'system', hint: 'Complex network of cells and organs', topic: 'daily-life', difficulty: 'B1' },
  { question_text: 'He installed energy efficient LED light bulbs throughout the ________.', target_word: 'residence', hint: 'Person\'s home or place of dwelling', topic: 'daily-life', difficulty: 'B2' },
  { question_text: 'Maintaining clear communication prevents domestic ________.', target_word: 'friction', hint: 'Conflict or animosity caused by disagreement', topic: 'daily-life', difficulty: 'B2' },

  // DAILY-LIFE: C1 (30 questions)
  { question_text: 'Adopting a frugal lifestyle requires a subtle ________ in daily spending priorities.', target_word: 'recalibration', hint: 'Adjustment to a standard or system', topic: 'daily-life', difficulty: 'C1' },
  { question_text: 'Modern urban living often creates an ironic sense of social ________ despite physical proximity.', target_word: 'alienation', hint: 'State of feeling isolated or estranged', topic: 'daily-life', difficulty: 'C1' },
  { question_text: 'Her meticulous approach to personal organization bordered on being ________.', target_word: 'fastidious', hint: 'Very attentive to detail and accuracy', topic: 'daily-life', difficulty: 'C1' },
  { question_text: 'Cultivating inner tranquility is an effective defense against daily stress and ________.', target_word: 'tribulation', hint: 'Great trouble or suffering', topic: 'daily-life', difficulty: 'C1' },
  { question_text: 'The gradual accumulation of small daily habits yields a profound ________ over time.', target_word: 'transformation', hint: 'A thorough or dramatic change', topic: 'daily-life', difficulty: 'C1' },
  { question_text: 'A well-balanced sleep schedule provides vital physical and mental ________.', target_word: 'rejuvenation', hint: 'Action of making someone look or feel younger', topic: 'daily-life', difficulty: 'C1' },
  { question_text: 'Navigating domestic responsibilities demands diplomatic tact and constant ________.', target_word: 'compromise', hint: 'Agreement reached by mutual concession', topic: 'daily-life', difficulty: 'C1' },
  { question_text: 'Extravagant consumerism stands in direct opposition to environmental ________.', target_word: 'sustainability', hint: 'Ability to be maintained at a certain rate', topic: 'daily-life', difficulty: 'C1' },
  { question_text: 'His quiet demeanor masked a remarkably sharp capacity for critical ________.', target_word: 'introspection', hint: 'Examination of one\'s own mental states', topic: 'daily-life', difficulty: 'C1' },
  { question_text: 'Maintaining emotional resilience amidst domestic chaos demands enduring ________.', target_word: 'equanimity', hint: 'Mental calmness and composure in difficult situations', topic: 'daily-life', difficulty: 'C1' },
  { question_text: 'Urban lifestyle choices reflect complex socioeconomic ________.', target_word: 'stratification', hint: 'Arrangement or classification into different groups', topic: 'daily-life', difficulty: 'C1' },
  { question_text: 'Her steady composure in emergencies demonstrated profound psychological ________.', target_word: 'fortitude', hint: 'Courage in pain or adversity', topic: 'daily-life', difficulty: 'C1' },
  { question_text: 'Eliminating non-essential possessions promotes spatial and mental ________.', target_word: 'purification', hint: 'Act or process of freeing from blemishes or guilt', topic: 'daily-life', difficulty: 'C1' },
  { question_text: 'The gradual degradation of personal habits often occurs with subtle ________.', target_word: 'insidiousness', hint: 'Quality of being stealthily harmful', topic: 'daily-life', difficulty: 'C1' },
  { question_text: 'Developing emotional maturity involves overcoming innate human ________.', target_word: 'egocentrism', hint: 'Inability to differentiate between self and other', topic: 'daily-life', difficulty: 'C1' },
  { question_text: 'Balancing professional ambition with familial duties creates ongoing personal ________.', target_word: 'dichotomy', hint: 'Division into two contrasting parts', topic: 'daily-life', difficulty: 'C1' },
  { question_text: 'Simple domestic rituals provide a sense of psychological ________.', target_word: 'anchorage', hint: 'Something providing stability or security', topic: 'daily-life', difficulty: 'C1' },
  { question_text: 'Unchecked material accumulation often leads to spiritual ________.', target_word: 'impoverishment', hint: 'State of being made poor or deprived of quality', topic: 'daily-life', difficulty: 'C1' },
  { question_text: 'True wisdom lies in discerning between fleeting desires and enduring ________.', target_word: 'aspirations', hint: 'Hopes or ambitions of achieving something', topic: 'daily-life', difficulty: 'C1' },
  { question_text: 'A chaotic home environment acts as a catalyst for cognitive ________.', target_word: 'fragmentation', hint: 'Process or state of breaking into small parts', topic: 'daily-life', difficulty: 'C1' },
  { question_text: 'Cultivating authentic relationships demands emotional transparency and ________.', target_word: 'vulnerability', hint: 'Quality of being exposed to emotional harm', topic: 'daily-life', difficulty: 'C1' },
  { question_text: 'Her home decor reflected an eclectic blend of cultural ________.', target_word: 'influences', hint: 'Capacities to have an effect on character or development', topic: 'daily-life', difficulty: 'C1' },
  { question_text: 'Self discipline is the primary antidote to habitual ________.', target_word: 'procrastination', hint: 'Action of delaying or postponing something', topic: 'daily-life', difficulty: 'C1' },
  { question_text: 'Living harmoniously with roommates demands mutual respect and spatial ________.', target_word: 'consideration', hint: 'Careful thought or attention to others', topic: 'daily-life', difficulty: 'C1' },
  { question_text: 'The sudden disruption of daily routine caused temporary psychological ________.', target_word: 'disorientation', hint: 'State of feeling lost or confused', topic: 'daily-life', difficulty: 'C1' },
  { question_text: 'Personal wellness encompasses physical, mental, and emotional ________.', target_word: 'equilibrium', hint: 'State of balance between opposing forces', topic: 'daily-life', difficulty: 'C1' },
  { question_text: 'Frugality should not be confused with miserly ________.', target_word: 'parsimony', hint: 'Extreme unwillingness to spend money', topic: 'daily-life', difficulty: 'C1' },
  { question_text: 'Mindful living requires intentional awareness of habitual ________.', target_word: 'behavioral', hint: 'Relating to conduct or actions', topic: 'daily-life', difficulty: 'C1' },
  { question_text: 'Creating an inspiring sanctuary at home fosters creative ________.', target_word: 'proliferation', hint: 'Rapid reproduction or increase in number', topic: 'daily-life', difficulty: 'C1' },
  { question_text: 'A well organized daily schedule optimizes human potential and ________.', target_word: 'efficiency', hint: 'State of achieving maximum productivity', topic: 'daily-life', difficulty: 'C1' },

  // ───────────────────────────────────────────────────────────────────────────
  // 2. CAFE (90 Questions: 30 A1/A2, 30 B1/B2, 30 C1)
  // ───────────────────────────────────────────────────────────────────────────
  // CAFE: A1 / A2 (30 questions)
  { question_text: 'I ordered a hot cup of black ________ at the local bistro.', target_word: 'coffee', hint: 'Popular caffeinated dark beverage', topic: 'cafe', difficulty: 'A1' },
  { question_text: 'She likes her green ________ with a slice of fresh lemon.', target_word: 'tea', hint: 'Infused herbal hot drink', topic: 'cafe', difficulty: 'A1' },
  { question_text: 'The baker served warm, flaky ________ straight from the oven.', target_word: 'bread', hint: 'Staple food made from baked dough', topic: 'cafe', difficulty: 'A1' },
  { question_text: 'He added two spoons of white ________ to sweeten his drink.', target_word: 'sugar', hint: 'Sweet crystalline substance', topic: 'cafe', difficulty: 'A1' },
  { question_text: 'Would you like some cold ________ with your iced coffee?', target_word: 'milk', hint: 'White liquid produced by dairy cows', topic: 'cafe', difficulty: 'A1' },
  { question_text: 'The waiter brought us a slice of chocolate ________ for dessert.', target_word: 'cake', hint: 'Sweet baked dessert food', topic: 'cafe', difficulty: 'A2' },
  { question_text: 'We sat at a small round ________ near the sunny window.', target_word: 'table', hint: 'Piece of furniture with a flat top', topic: 'cafe', difficulty: 'A1' },
  { question_text: 'She ordered a buttery French ________ for breakfast.', target_word: 'croissant', hint: 'Crescent-shaped flaky pastry', topic: 'cafe', difficulty: 'A2' },
  { question_text: 'The friendly ________ took our drink order with a big smile.', target_word: 'waiter', hint: 'Person who serves customers in a cafe', topic: 'cafe', difficulty: 'A2' },
  { question_text: 'He paid the bill using his shiny silver credit ________.', target_word: 'card', hint: 'Plastic payment card', topic: 'cafe', difficulty: 'A1' },
  { question_text: 'They sat on a comfortable wooden ________ in the cozy corner.', target_word: 'chair', hint: 'Seat for one person with a back', topic: 'cafe', difficulty: 'A1' },
  { question_text: 'She ordered a cold glass of iced ________ tea.', target_word: 'lemon', hint: 'Yellow citrus fruit', topic: 'cafe', difficulty: 'A1' },
  { question_text: 'He spread creamy ________ on his warm toasted bread.', target_word: 'butter', hint: 'Yellow dairy product made from milk', topic: 'cafe', difficulty: 'A1' },
  { question_text: 'Would you like a glass of fresh orange ________?', target_word: 'juice', hint: 'Liquid extracted from fruit', topic: 'cafe', difficulty: 'A1' },
  { question_text: 'The chef baked a savory cheese ________ for lunch.', target_word: 'pie', hint: 'Baked dish of pastry dough with savory or sweet filling', topic: 'cafe', difficulty: 'A1' },
  { question_text: 'She sipped her hot cocoa from a ceramic ________.', target_word: 'cup', hint: 'Small bowl-shaped container for drinks', topic: 'cafe', difficulty: 'A1' },
  { question_text: 'He asked the waiter for the lunch ________ to pick his meal.', target_word: 'menu', hint: 'List of dishes available in a restaurant', topic: 'cafe', difficulty: 'A1' },
  { question_text: 'She requested the ________ to pay for her meal.', target_word: 'bill', hint: 'Statement of money owed for goods or services', topic: 'cafe', difficulty: 'A1' },
  { question_text: 'He sprinkled a pinch of ________ on his vegetable soup.', target_word: 'salt', hint: 'White crystalline substance used for seasoning', topic: 'cafe', difficulty: 'A1' },
  { question_text: 'She stirred her coffee using a small silver ________.', target_word: 'spoon', hint: 'Utensil consisting of a small shallow bowl with a handle', topic: 'cafe', difficulty: 'A1' },
  { question_text: 'The cafe serves fresh vegetable ________ with warm garlic bread.', target_word: 'soup', hint: 'Liquid food made by cooking meat or vegetables in stock', topic: 'cafe', difficulty: 'A1' },
  { question_text: 'He loves eating strawberry ________ with vanilla ice cream.', target_word: 'tart', hint: 'Open pastry case containing sweet filling', topic: 'cafe', difficulty: 'A2' },
  { question_text: 'She ordered a cold bottle of mineral ________.', target_word: 'water', hint: 'Clear liquid essential for life', topic: 'cafe', difficulty: 'A1' },
  { question_text: 'They met for a quick lunch at the local ________.', target_word: 'cafe', hint: 'Small restaurant selling light meals and drinks', topic: 'cafe', difficulty: 'A1' },
  { question_text: 'He ordered a crispy grilled cheese ________.', target_word: 'sandwich', hint: 'Food consisting of filling between two slices of bread', topic: 'cafe', difficulty: 'A2' },
  { question_text: 'She wiped the table clean with a paper ________.', target_word: 'napkin', hint: 'Piece of cloth or paper used at meals for wiping fingers', topic: 'cafe', difficulty: 'A2' },
  { question_text: 'The pastry chef prepared a fresh batch of fruit ________.', target_word: 'scones', hint: 'Small unsweetened or lightly sweetened cakes', topic: 'cafe', difficulty: 'A2' },
  { question_text: 'He enjoyed a hot mug of dark ________ cocoa.', target_word: 'hot', hint: 'Having a high temperature', topic: 'cafe', difficulty: 'A1' },
  { question_text: 'She sat outside under a large patio ________.', target_word: 'umbrella', hint: 'Folding canopy supported by a central rod', topic: 'cafe', difficulty: 'A2' },
  { question_text: 'He left a small cash ________ for the polite server.', target_word: 'tip', hint: 'Sum of money given as a reward for service', topic: 'cafe', difficulty: 'A1' },

  // CAFE: B1 / B2 (30 questions)
  { question_text: 'The experienced ________ crafted a perfect heart pattern in the espresso foam.', target_word: 'barista', hint: 'Person who prepares coffee drinks in a cafe', topic: 'cafe', difficulty: 'B1' },
  { question_text: 'Espresso forms the rich foundation for popular beverages like cappuccino and ________.', target_word: 'latte', hint: 'Coffee drink made with espresso and steamed milk', topic: 'cafe', difficulty: 'B1' },
  { question_text: 'Dark roast beans are renowned for their intense flavor and subtle bitter ________.', target_word: 'aftertaste', hint: 'Taste that remains in mouth after eating or drinking', topic: 'cafe', difficulty: 'B2' },
  { question_text: 'Customers love sitting on the outdoor ________ to enjoy the morning sun.', target_word: 'terrace', hint: 'Outdoor paved area adjoining a building', topic: 'cafe', difficulty: 'B1' },
  { question_text: 'The specialty coffee shop sources organic beans directly from ethical ________.', target_word: 'growers', hint: 'Farmers who cultivate crops', topic: 'cafe', difficulty: 'B2' },
  { question_text: 'Cold brew coffee requires hours of slow extraction to reduce natural ________.', target_word: 'acidity', hint: 'Level of acid in a food or drink', topic: 'cafe', difficulty: 'B2' },
  { question_text: 'The aroma of freshly ground Arabica beans filled the cozy ________.', target_word: 'atmosphere', hint: 'Pervasive tone or mood of a place', topic: 'cafe', difficulty: 'B1' },
  { question_text: 'She savored a delicate macaron infused with natural vanilla ________.', target_word: 'extract', hint: 'Concentrated substance obtained by extraction', topic: 'cafe', difficulty: 'B2' },
  { question_text: 'The cafe menu features an assortment of artisanal baked ________.', target_word: 'pastries', hint: 'Sweet baked goods made with dough', topic: 'cafe', difficulty: 'B1' },
  { question_text: 'He ordered a double shot of espresso to combat afternoon ________.', target_word: 'fatigue', hint: 'Extreme tiredness resulting from effort', topic: 'cafe', difficulty: 'B2' },
  { question_text: 'A strong shot of Italian ________ provides a quick surge of energy.', target_word: 'espresso', hint: 'Concentrated coffee brewed by forcing hot water through beans', topic: 'cafe', difficulty: 'B1' },
  { question_text: 'She enjoys her cappuccino with a light dusting of powdered ________.', target_word: 'cinnamon', hint: 'Aromatic spice made from the bark of trees', topic: 'cafe', difficulty: 'B1' },
  { question_text: 'The coffee shop offers alternative dairy options like almond and oat ________.', target_word: 'creamer', hint: 'Liquid or powder substitute for milk or cream', topic: 'cafe', difficulty: 'B1' },
  { question_text: 'Slow drip coffee brewing highlights subtle fruity ________.', target_word: 'flavors', hint: 'Distinctive tastes of food or drink', topic: 'cafe', difficulty: 'B1' },
  { question_text: 'The roaster monitors the batch until the beans reach a rich brown ________.', target_word: 'roast', hint: 'Process of cooking food or beans by dry heat', topic: 'cafe', difficulty: 'B1' },
  { question_text: 'Customers can customize their drinks with sweet caramel ________.', target_word: 'syrup', hint: 'Thick sweet liquid made by dissolving sugar in water', topic: 'cafe', difficulty: 'B1' },
  { question_text: 'The bakery specializes in gluten free desserts and vegan ________.', target_word: 'muffins', hint: 'Individual cup-shaped quick breads', topic: 'cafe', difficulty: 'B1' },
  { question_text: 'He enjoys working remotely on his laptop in quiet urban ________.', target_word: 'cafes', hint: 'Plural of cafe establishments', topic: 'cafe', difficulty: 'B1' },
  { question_text: 'The barista recommends pairing dark chocolate with a bold Ethiopian ________.', target_word: 'coffee', hint: 'Dark caffeinated drink', topic: 'cafe', difficulty: 'B1' },
  { question_text: 'Pour over coffee brewing requires patience and steady water ________.', target_word: 'flow', hint: 'Continuous movement of liquid', topic: 'cafe', difficulty: 'B1' },
  { question_text: 'Decaffeinated coffee provides rich roast flavor without the jittery ________.', target_word: 'effects', hint: 'Results or consequences of an action', topic: 'cafe', difficulty: 'B1' },
  { question_text: 'She treats herself to a slice of cheesecake on special ________.', target_word: 'occasions', hint: 'Particular times or events', topic: 'cafe', difficulty: 'B2' },
  { question_text: 'Fair trade certification guarantees ethical compensation for agricultural ________.', target_word: 'laborers', hint: 'People doing practical or physical work', topic: 'cafe', difficulty: 'B2' },
  { question_text: 'The cafe terrace provides a prime spot for relaxed people ________.', target_word: 'watching', hint: 'Observing people going about their business', topic: 'cafe', difficulty: 'B1' },
  { question_text: 'Freshly roasted beans emit aromatic carbon dioxide during outgassing ________.', target_word: 'phase', hint: 'Distinct stage in a process', topic: 'cafe', difficulty: 'B2' },
  { question_text: 'The barista uses a precise digital scale to measure bean ________.', target_word: 'dosage', hint: 'Measured amount of a substance', topic: 'cafe', difficulty: 'B2' },
  { question_text: 'Artisanal cafes emphasize sustainability by reducing single use plastic ________.', target_word: 'straws', hint: 'Thin tubes for sucking up drink', topic: 'cafe', difficulty: 'B1' },
  { question_text: 'A light breakfast of avocado toast provides sustained morning ________.', target_word: 'vitality', hint: 'State of being strong and active', topic: 'cafe', difficulty: 'B2' },
  { question_text: 'Cold brewing removes harsh tannins resulting in a remarkably smooth ________.', target_word: 'beverage', hint: 'A drink other than water', topic: 'cafe', difficulty: 'B1' },
  { question_text: 'She loves the comforting aroma of roasted hazelnut in her morning ________.', target_word: 'cuppa', hint: 'Informal term for a cup of tea or coffee', topic: 'cafe', difficulty: 'B1' },

  // CAFE: C1 (30 questions)
  { question_text: 'Coffee connoisseurs appreciate the complex floral notes in high altitude ________.', target_word: 'cultivars', hint: 'Plant varieties produced by selective breeding', topic: 'cafe', difficulty: 'C1' },
  { question_text: 'The cafe\'s minimalist interior design radiates sophisticated urban ________.', target_word: 'aesthetic', hint: 'Set of principles underlying artistic work', topic: 'cafe', difficulty: 'C1' },
  { question_text: 'Precise water temperature control is paramount to prevent over-extraction and ________.', target_word: 'astringency', hint: 'Puckering, harsh or bitter taste quality', topic: 'cafe', difficulty: 'C1' },
  { question_text: 'Artisanal roasters carefully monitor the chemical Maillard reaction during coffee ________.', target_word: 'pyrolysis', hint: 'Decomposition of organic materials by high heat', topic: 'cafe', difficulty: 'C1' },
  { question_text: 'The barista achieved flawless microfoam texture required for latte art ________.', target_word: 'embellishment', hint: 'Decorative detail added to make something attractive', topic: 'cafe', difficulty: 'C1' },
  { question_text: 'Rare single origin coffees boast distinctive sensory profiles reflecting their native ________.', target_word: 'terroir', hint: 'Environmental factors affecting crop flavor profile', topic: 'cafe', difficulty: 'C1' },
  { question_text: 'Gourmet chocolatiers combine dark cocoa with espresso to create harmonious ________.', target_word: 'confections', hint: 'Delicately prepared sweet foods', topic: 'cafe', difficulty: 'C1' },
  { question_text: 'The quiet cafe sanctuary offers patrons a welcome reprieve from urban ________.', target_word: 'cacophony', hint: 'Harsh, discordant mixture of sounds', topic: 'cafe', difficulty: 'C1' },
  { question_text: 'Decaffeinated coffee processing requires precise solvent extraction to preserve lipid ________.', target_word: 'integrity', hint: 'State of being whole and undivided', topic: 'cafe', difficulty: 'C1' },
  { question_text: 'Sampling flight trays of micro-lot coffees fosters refined palate ________.', target_word: 'discernment', hint: 'Ability to judge well or perceive fine distinctions', topic: 'cafe', difficulty: 'C1' },
  { question_text: 'The cafe\'s ambient lighting creates an atmosphere of sophisticated ________.', target_word: 'conviviality', hint: 'Quality of being friendly and lively', topic: 'cafe', difficulty: 'C1' },
  { question_text: 'High pressure espresso extraction emulsifies insoluble coffee oils into a rich ________.', target_word: 'crema', hint: 'Reddish-brown froth on top of espresso', topic: 'cafe', difficulty: 'C1' },
  { question_text: 'Specialty coffee grading requires certified Q-graders to conduct rigorous Sensory ________.', target_word: 'cupping', hint: 'Systematic tasting of coffee profiles', topic: 'cafe', difficulty: 'C1' },
  { question_text: 'Artisanal pastry chefs master complex laminated dough techniques for maximum ________.', target_word: 'flakiness', hint: 'State of easily breaking into small thin pieces', topic: 'cafe', difficulty: 'C1' },
  { question_text: 'The barista\'s delicate pour over technique demonstrated impressive procedural ________.', target_word: 'finesse', hint: 'Intricate and refined delicacy', topic: 'cafe', difficulty: 'C1' },
  { question_text: 'Coffee bean roasting represents a delicate equilibrium between science and ________.', target_word: 'craftsmanship', hint: 'Skill in a particular craft', topic: 'cafe', difficulty: 'C1' },
  { question_text: 'Rare Gesha coffee varieties command exorbitant prices due to floral ________.', target_word: 'exuberance', hint: 'Quality of being full of energy, excitement, and cheerfulness', topic: 'cafe', difficulty: 'C1' },
  { question_text: 'The quiet corner table served as a fertile ground for intellectual ________.', target_word: 'discourse', hint: 'Written or spoken communication or debate', topic: 'cafe', difficulty: 'C1' },
  { question_text: 'Gourmet cafe menus curate seasonal offerings with gastronomic ________.', target_word: 'sophistication', hint: 'Quality of being refined and worldly', topic: 'cafe', difficulty: 'C1' },
  { question_text: 'Savoring a fine cup of coffee encourages mindful sensory ________.', target_word: 'appreciation', hint: 'Recognition and enjoyment of good qualities', topic: 'cafe', difficulty: 'C1' },
  { question_text: 'The barista tampered the finely ground coffee with uniform physical ________.', target_word: 'compression', hint: 'Action of compressing or being compressed', topic: 'cafe', difficulty: 'C1' },
  { question_text: 'Over-roasted coffee beans develop unpleasant acrid and empyreumatic ________.', target_word: 'undertones', hint: 'Subtle or subdued qualities or features', topic: 'cafe', difficulty: 'C1' },
  { question_text: 'The establishment prides itself on hospitable customer ________.', target_word: 'engagement', hint: 'Action of engaging or state of being engaged', topic: 'cafe', difficulty: 'C1' },
  { question_text: 'Fine herbal infusions boast therapeutic botanical ________.', target_word: 'properties', hint: 'Attributes or qualities characteristic of something', topic: 'cafe', difficulty: 'C1' },
  { question_text: 'The coffee shop owner sourced vintage mid-century furniture for aesthetic ________.', target_word: 'authenticity', hint: 'Quality of being authentic or genuine', topic: 'cafe', difficulty: 'C1' },
  { question_text: 'Nitro cold brew incorporates nitrogen gas to produce a velvety ________.', target_word: 'effervescence', hint: 'Bubbliness or fizzing in a liquid', topic: 'cafe', difficulty: 'C1' },
  { question_text: 'Mastering espresso extraction demands rigorous empirical ________.', target_word: 'calibration', hint: 'Action of calibrating an instrument or measure', topic: 'cafe', difficulty: 'C1' },
  { question_text: 'The cafe provides a serene sanctuary amidst the metropolis ________.', target_word: 'bustle', hint: 'Excited, noisy, and busy activity', topic: 'cafe', difficulty: 'C1' },
  { question_text: 'Artisanal roasters champion direct trade for economic ________.', target_word: 'equity', hint: 'Quality of being fair and impartial', topic: 'cafe', difficulty: 'C1' },
  { question_text: 'Sampling exotic single-origins expands one\'s gastronomic ________.', target_word: 'horizons', hint: 'Limits of a person\'s knowledge, experience, or interest', topic: 'cafe', difficulty: 'C1' },

  // ───────────────────────────────────────────────────────────────────────────
  // 3. TRAVEL (90 Questions: 30 A1/A2, 30 B1/B2, 30 C1)
  // ───────────────────────────────────────────────────────────────────────────
  // TRAVEL: A1 / A2 (30 questions)
  { question_text: 'We boarded a high speed ________ to travel across the scenic countryside.', target_word: 'train', hint: 'Rail transport vehicle with linked cars', topic: 'travel', difficulty: 'A1' },
  { question_text: 'Don\'t forget to pack your passport and airline ________ before leaving.', target_word: 'ticket', hint: 'Pass granting permission to travel', topic: 'travel', difficulty: 'A1' },
  { question_text: 'They booked an oceanfront room at a luxurious seaside ________.', target_word: 'hotel', hint: 'Establishment providing lodging for travelers', topic: 'travel', difficulty: 'A1' },
  { question_text: 'She loves flying in an airplane to visit foreign ________.', target_word: 'countries', hint: 'Nations with distinct territories', topic: 'travel', difficulty: 'A2' },
  { question_text: 'He carried a heavy blue ________ filled with clothes and shoes.', target_word: 'suitcase', hint: 'Luggage case for carrying clothes', topic: 'travel', difficulty: 'A2' },
  { question_text: 'The sandy white ________ was surrounded by tall palm trees.', target_word: 'beach', hint: 'Shore of a body of water covered with sand', topic: 'travel', difficulty: 'A1' },
  { question_text: 'We rented a compact red ________ to drive around the island.', target_word: 'car', hint: 'Four-wheeled motor vehicle', topic: 'travel', difficulty: 'A1' },
  { question_text: 'She bought a colorful printed ________ to help navigate the city.', target_word: 'map', hint: 'Visual representation of an area or territory', topic: 'travel', difficulty: 'A1' },
  { question_text: 'They spent the afternoon exploring famous historical ________.', target_word: 'museums', hint: 'Buildings exhibiting artifacts of interest', topic: 'travel', difficulty: 'A2' },
  { question_text: 'Always check the local weather ________ before packing your bags.', target_word: 'forecast', hint: 'Prediction of future weather conditions', topic: 'travel', difficulty: 'A2' },
  { question_text: 'We flew on a modern commercial ________ to reach Tokyo.', target_word: 'plane', hint: 'Powered flying vehicle with fixed wings', topic: 'travel', difficulty: 'A1' },
  { question_text: 'She bought a souvenir key ________ to remember her trip.', target_word: 'ring', hint: 'Small metal ring for holding keys', topic: 'travel', difficulty: 'A1' },
  { question_text: 'He loves taking photos of scenic mountain ________.', target_word: 'views', hint: 'Sights or panoramas of landscape', topic: 'travel', difficulty: 'A1' },
  { question_text: 'They took a relaxing ferry ________ across the bay.', target_word: 'boat', hint: 'Small water vessel for traveling on water', topic: 'travel', difficulty: 'A1' },
  { question_text: 'She reserved a window ________ on the morning flight.', target_word: 'seat', hint: 'Place arranged for sitting in a vehicle', topic: 'travel', difficulty: 'A1' },
  { question_text: 'He loves camping under the stars in his new ________.', target_word: 'tent', hint: 'Portable shelter made of canvas or nylon', topic: 'travel', difficulty: 'A1' },
  { question_text: 'They went hiking up a steep green ________.', target_word: 'hill', hint: 'Naturally raised area of land, smaller than a mountain', topic: 'travel', difficulty: 'A1' },
  { question_text: 'She swam in the crystal clear blue ________.', target_word: 'lake', hint: 'Large body of water surrounded by land', topic: 'travel', difficulty: 'A1' },
  { question_text: 'They took a guided walking ________ of the old town.', target_word: 'tour', hint: 'Journey for pleasure in which several places are visited', topic: 'travel', difficulty: 'A1' },
  { question_text: 'He packed his casual summer ________ for the tropical island.', target_word: 'clothes', hint: 'Items worn to cover the body', topic: 'travel', difficulty: 'A2' },
  { question_text: 'She captured stunning sunrise ________ with her DSLR camera.', target_word: 'photos', hint: 'Pictures produced using a camera', topic: 'travel', difficulty: 'A1' },
  { question_text: 'We stayed at a charming bed and breakfast in the coastal ________.', target_word: 'town', hint: 'Urban area smaller than a city', topic: 'travel', difficulty: 'A1' },
  { question_text: 'He took a long road ________ across the countryside.', target_word: 'trip', hint: 'Journey or excursion, especially for pleasure', topic: 'travel', difficulty: 'A1' },
  { question_text: 'She loves exploring vibrant night ________ while traveling.', target_word: 'markets', hint: 'Open air street markets operating at night', topic: 'travel', difficulty: 'A2' },
  { question_text: 'He packed his sturdy hiking ________ for the mountain trek.', target_word: 'boots', hint: 'Sturdy footwear covering foot and ankle', topic: 'travel', difficulty: 'A2' },
  { question_text: 'They arrived at the international ________ two hours early.', target_word: 'airport', hint: 'Complex where aircraft take off and land', topic: 'travel', difficulty: 'A2' },
  { question_text: 'She bought a postal ________ to send to her grandmother.', target_word: 'card', hint: 'Card for sending a message by mail without envelope', topic: 'travel', difficulty: 'A1' },
  { question_text: 'He paid for his subway ride using a daily transit ________.', target_word: 'pass', hint: 'Ticket giving permission to travel on public transport', topic: 'travel', difficulty: 'A1' },
  { question_text: 'We enjoyed a sunset cruise along the peaceful ________.', target_word: 'river', hint: 'Large natural stream of water flowing to sea', topic: 'travel', difficulty: 'A1' },
  { question_text: 'She loves collecting post cards from every historic ________.', target_word: 'city', hint: 'Large human settlement', topic: 'travel', difficulty: 'A1' },

  // TRAVEL: B1 / B2 (30 questions)
  { question_text: 'You must present an official ________ at customs when entering a foreign country.', target_word: 'passport', hint: 'Official travel document certifying identity and nationality', topic: 'travel', difficulty: 'B1' },
  { question_text: 'Exploring ancient ruins offers a fascinating glimpse into past ________.', target_word: 'civilizations', hint: 'Advanced stages of human social development', topic: 'travel', difficulty: 'B2' },
  { question_text: 'Budget travelers often stay in a communal ________ to save money.', target_word: 'hostel', hint: 'Inexpensive lodging offering shared dorm rooms', topic: 'travel', difficulty: 'B1' },
  { question_text: 'Hiring a knowledgeable local ________ enriches the historical tour experience.', target_word: 'guide', hint: 'Person who shows tourists around places of interest', topic: 'travel', difficulty: 'B1' },
  { question_text: 'Flight delays and lost luggage are common travel ________ to anticipate.', target_word: 'disruptions', hint: 'Disturbances or problems interrupting an event', topic: 'travel', difficulty: 'B2' },
  { question_text: 'Ecotourism encourages responsible travel that respects natural ________.', target_word: 'ecosystems', hint: 'Biological communities of interacting organisms', topic: 'travel', difficulty: 'B2' },
  { question_text: 'We enjoyed a breathtaking panoramic ________ from the mountain summit.', target_word: 'viewpoint', hint: 'Position affording a good view of surrounding scenery', topic: 'travel', difficulty: 'B1' },
  { question_text: 'The airline offers generous checked baggage ________ for international flights.', target_word: 'allowance', hint: 'Amount of something permitted or granted', topic: 'travel', difficulty: 'B2' },
  { question_text: 'Backpackers often seek off the beaten path ________ far from tourist crowds.', target_word: 'destinations', hint: 'Places to which someone is traveling', topic: 'travel', difficulty: 'B1' },
  { question_text: 'Immersing oneself in local customs fosters genuine cultural ________.', target_word: 'appreciation', hint: 'Recognition of the value or quality of something', topic: 'travel', difficulty: 'B2' },
  { question_text: 'Before traveling abroad, ensure your tourist ________ is valid and approved.', target_word: 'visa', hint: 'Endorsement on passport granting entry into a country', topic: 'travel', difficulty: 'B1' },
  { question_text: 'We collected our heavy bags at the airport luggage ________.', target_word: 'carousel', hint: 'Conveyor belt carrying luggage for arriving passengers', topic: 'travel', difficulty: 'B2' },
  { question_text: 'She booked a round trip ticket with a short two hour ________ in Paris.', target_word: 'layover', hint: 'Period of waiting between connecting flights', topic: 'travel', difficulty: 'B1' },
  { question_text: 'The historic city center features narrow paved ________ dating back centuries.', target_word: 'streets', hint: 'Public roads in a city or town', topic: 'travel', difficulty: 'B1' },
  { question_text: 'Traveling during off peak seasons helps avoid crowded tourist ________.', target_word: 'hotspots', hint: 'Popular places of intense activity or interest', topic: 'travel', difficulty: 'B1' },
  { question_text: 'He loves trying authentic street food from local night ________.', target_word: 'vendors', hint: 'Persons or traders offering goods for sale', topic: 'travel', difficulty: 'B1' },
  { question_text: 'The travel agency arranged a customized travel ________ for our group.', target_word: 'itinerary', hint: 'Planned route or journey details', topic: 'travel', difficulty: 'B2' },
  { question_text: 'She loves capturing spontaneous candid moments with her travel ________.', target_word: 'camera', hint: 'Device for recording visual images', topic: 'travel', difficulty: 'B1' },
  { question_text: 'Crossing multiple time zones often causes temporary sleep ________.', target_word: 'disruption', hint: 'Interruption to a regular process or activity', topic: 'travel', difficulty: 'B2' },
  { question_text: 'They hiked along a scenic alpine ________ to reach the waterfall.', target_word: 'trail', hint: 'Marked path through a countryside or forest', topic: 'travel', difficulty: 'B1' },
  { question_text: 'The boutique resort boasts a luxurious infinity pool overlooking the ________.', target_word: 'ocean', hint: 'Vast expanse of salt water covering most of earth', topic: 'travel', difficulty: 'B1' },
  { question_text: 'Tourists must pass through border control and mandatory customs ________.', target_word: 'inspection', hint: 'Careful examination or scrutiny', topic: 'travel', difficulty: 'B2' },
  { question_text: 'She converted her currency at the airport exchange ________.', target_word: 'counter', hint: 'Long flat surface over which transactions are conducted', topic: 'travel', difficulty: 'B1' },
  { question_text: 'He loves exploring historical castles and ancient medieval ________.', target_word: 'fortresses', hint: 'Military strongholds or fortified places', topic: 'travel', difficulty: 'B2' },
  { question_text: 'Pack lightweight breathable fabrics for warm tropical ________.', target_word: 'climates', hint: 'Weather conditions prevailing in an area over a long period', topic: 'travel', difficulty: 'B1' },
  { question_text: 'The coastal village is famous for its vibrant fishing ________.', target_word: 'harbor', hint: 'Sheltered port for ships and boats', topic: 'travel', difficulty: 'B1' },
  { question_text: 'She enjoys embarking on spontaneous weekend ________ to nearby towns.', target_word: 'getaways', hint: 'Short vacations or escapes', topic: 'travel', difficulty: 'B1' },
  { question_text: 'Travel insurance provides financial protection against unforeseen flight ________.', target_word: 'cancellations', hint: 'Annulment or stopping of scheduled events', topic: 'travel', difficulty: 'B2' },
  { question_text: 'The mountain pass offers spectacular vistas of surrounding glacier ________.', target_word: 'valleys', hint: 'Low areas of land between hills or mountains', topic: 'travel', difficulty: 'B1' },
  { question_text: 'Learning basic conversational phrases in the local language builds ________.', target_word: 'rapport', hint: 'Harmonious relationship in which people understand each other', topic: 'travel', difficulty: 'B2' },

  // TRAVEL: C1 (30 questions)
  { question_text: 'Solo travel across unfamiliar continents fosters self reliance and personal ________.', target_word: 'autonomy', hint: 'Freedom from external control or influence', topic: 'travel', difficulty: 'C1' },
  { question_text: 'The ancient cobblestone alleys of the historic quarter exude timeless charm and ________.', target_word: 'picturesqueness', hint: 'Visually attractive quality like a picture', topic: 'travel', difficulty: 'C1' },
  { question_text: 'Traversing arid deserts demands meticulous route planning and physical ________.', target_word: 'endurance', hint: 'Capacity to withstand difficult conditions', topic: 'travel', difficulty: 'C1' },
  { question_text: 'Cultural immersion challenges ingrained ethnocentric perspective and promotes global ________.', target_word: 'cosmopolitanism', hint: 'State of being familiar with many different countries', topic: 'travel', difficulty: 'C1' },
  { question_text: 'Navigating bureaucratic visa requirements requires patience and relentless ________.', target_word: 'perseverance', hint: 'Persistence in doing something despite difficulty', topic: 'travel', difficulty: 'C1' },
  { question_text: 'The remote island sanctuary remains unmarred by commercialization and environmental ________.', target_word: 'degradation', hint: 'Process of being damaged or deteriorated', topic: 'travel', difficulty: 'C1' },
  { question_text: 'Experiencing severe jet lag causes temporary circadian ________ and disorientation.', target_word: 'desynchronization', hint: 'Disruption of synchronized internal rhythms', topic: 'travel', difficulty: 'C1' },
  { question_text: 'The intrepid explorer documented unmapped terrain with scholarly ________.', target_word: 'meticulousness', hint: 'Extreme care and precision in execution', topic: 'travel', difficulty: 'C1' },
  { question_text: 'Traveling beyond comfort zones inspires profound existential ________ and self-discovery.', target_word: 'enlightenment', hint: 'State of gaining deep insight and understanding', topic: 'travel', difficulty: 'C1' },
  { question_text: 'The majestic alpine landscape evokes awe and sublime spiritual ________.', target_word: 'transcendence', hint: 'Existence or experience beyond normal physical boundaries', topic: 'travel', difficulty: 'C1' },
  { question_text: 'Exploring pristine wilderness areas reinforces ecological ________.', target_word: 'stewardship', hint: 'Job of supervising or taking care of environmental resources', topic: 'travel', difficulty: 'C1' },
  { question_text: 'The heritage site preservation balances tourism revenue with historical ________.', target_word: 'authenticity', hint: 'Quality of being genuine or authentic', topic: 'travel', difficulty: 'C1' },
  { question_text: 'Cross-cultural travel experiences dissolve provincial prejudices and ideological ________.', target_word: 'parochialism', hint: 'Narrow or limited outlook or scope', topic: 'travel', difficulty: 'C1' },
  { question_text: 'Voyaging through remote archipelagoes demands navigational ________.', target_word: 'competence', hint: 'Ability to do something successfully or efficiently', topic: 'travel', difficulty: 'C1' },
  { question_text: 'The architectural grandeur of the ancient cathedral commands solemn ________.', target_word: 'reverence', hint: 'Deep respect for someone or something', topic: 'travel', difficulty: 'C1' },
  { question_text: 'High-altitude mountaineering poses severe risks of hypoxia and pulmonary ________.', target_word: 'edema', hint: 'Condition characterized by excess watery fluid in cavities or tissues', topic: 'travel', difficulty: 'C1' },
  { question_text: 'The travel memoir provided insightful socio-political ________.', target_word: 'commentary', hint: 'Series of comments or explanations', topic: 'travel', difficulty: 'C1' },
  { question_text: 'Visiting solemn historical memorials invokes poignant emotional ________.', target_word: 'resonance', hint: 'Quality of evoking enduring emotions or memories', topic: 'travel', difficulty: 'C1' },
  { question_text: 'Long distance pilgrimage walks require mental fortitude and spiritual ________.', target_word: 'resilience', hint: 'Capacity to recover quickly from difficulties', topic: 'travel', difficulty: 'C1' },
  { question_text: 'The expedition team navigated treacherous rapids with tactical ________.', target_word: 'precision', hint: 'Fact or quality of being exact and accurate', topic: 'travel', difficulty: 'C1' },
  { question_text: 'Rapid urban development threatens the architectural heritage of historic ________.', target_word: 'districts', hint: 'Areas of a country or city having distinct characteristics', topic: 'travel', difficulty: 'C1' },
  { question_text: 'The remote monastic retreat offered absolute solitude and contemplative ________.', target_word: 'seclusion', hint: 'State of being private and away from other people', topic: 'travel', difficulty: 'C1' },
  { question_text: 'International travel broadens one\'s intellectual perspective and cultural ________.', target_word: 'sophistication', hint: 'Quality of being refined and cultured', topic: 'travel', difficulty: 'C1' },
  { question_text: 'Immersion in indigenous traditions demands respectful anthropologic ________.', target_word: 'sensitivity', hint: 'Quality of being sensitive to cultural nuances', topic: 'travel', difficulty: 'C1' },
  { question_text: 'The dramatic coastal fjords were sculpted by millennia of glacial ________.', target_word: 'erosion', hint: 'Process of eroding or being eroded by wind or water', topic: 'travel', difficulty: 'C1' },
  { question_text: 'Over-tourism degrades the tranquility and ecological balance of fragile ________.', target_word: 'sanctuaries', hint: 'Places of safety or nature reserves', topic: 'travel', difficulty: 'C1' },
  { question_text: 'The adventurer documented uncharted cave systems with subterranean ________.', target_word: 'exploration', hint: 'Action of traveling through an unfamiliar area to learn about it', topic: 'travel', difficulty: 'C1' },
  { question_text: 'Experiencing diverse cultural norms fosters open minded interpersonal ________.', target_word: 'adaptability', hint: 'Quality of being able to adjust to new conditions', topic: 'travel', difficulty: 'C1' },
  { question_text: 'The vintage train journey recalled the nostalgic luxury of golden age ________.', target_word: 'travel', hint: 'Action of moving from one place to another', topic: 'travel', difficulty: 'C1' },
  { question_text: 'True wanderlust stems from an insatiable desire for existential ________.', target_word: 'discovery', hint: 'Act or process of finding something new', topic: 'travel', difficulty: 'C1' }
]

export async function seedQuestions() {
  console.log(`🌱 Starting Expanded Question Bank Seeder (${QUESTION_BANK.length} Total Questions: 90 daily-life, 90 cafe, 90 travel)...`)
  try {
    // 1. Wipe existing questions to ensure clean distribution
    const { error: deleteErr } = await supabase
      .from('questions')
      .delete()
      .neq('id', '00000000-0000-0000-0000-000000000000')

    if (deleteErr) {
      console.warn('⚠️ Warning wiping existing questions:', deleteErr.message)
    }

    let inserted = 0
    let failed = 0

    // Insert in batches of 30 for speed
    const batchSize = 30
    for (let i = 0; i < QUESTION_BANK.length; i += batchSize) {
      const chunk = QUESTION_BANK.slice(i, i + batchSize).map(q => ({
        question_text: q.question_text,
        target_word: q.target_word.toLowerCase(),
        hint: q.hint,
        topic: q.topic,
        category: q.topic,
        difficulty: q.difficulty
      }))

      const { error } = await supabase
        .from('questions')
        .insert(chunk)

      if (error) {
        console.warn(`⚠️ Batch insert failed at index ${i}:`, error.message)
        failed += chunk.length
      } else {
        inserted += chunk.length
      }
    }

    console.log(`✅ Finished seeding expanded questions! Successfully inserted ${inserted} questions (${failed} failed).`)
  } catch (err) {
    console.error('❌ Error during question seeding:', err)
  }
}

// Auto-run if executed directly via CLI
if (require.main === module) {
  seedQuestions().then(() => process.exit(0))
}
