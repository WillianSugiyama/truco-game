type Card = {
  card: string;
  suite: string;
};

type Deck = Card[];

const cards = ['A', '2', '3', 'Q', 'J', 'K'];
const suites = ['spades', 'hearts', 'diamonds', 'clubs'];

const deck: Deck = [];

for (let card of cards) {
  for (let suite of suites) {
    deck.push({
      card,
      suite
    });
  }
}

const shuffle = (deck: Deck) => {
  const shuffledDeck = [...deck];
  for (let i = shuffledDeck.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * i);
    const temp = shuffledDeck[i];
    shuffledDeck[i] = shuffledDeck[j];
    shuffledDeck[j] = temp;
  }
  return shuffledDeck;
}

const shuffledDeck = shuffle(deck);

console.log(shuffledDeck[0]);