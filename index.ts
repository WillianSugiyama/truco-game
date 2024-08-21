import readline from 'node:readline';

type Card = {
  card: string;
  suite: string;
};

type Deck = Card[];

type CardWithPower = Card & { power: number };

type PlayerCards = {
  player: number;
  cards: Card[];
}

type PlayerCardsWithPower = {
  player: number;
  cards: CardWithPower[];
};

type RoundResult = {
  winner: number;
  playedCards: Card[];
};

const cards = ['A', '2', '3', 'Q', 'J', 'K'];
const suites = ['spades', 'hearts', 'diamonds', 'clubs'];

const deck: Deck = [];

for (let card of cards) {
  for (let suite of suites) {
    deck.push({
      card,
      suite,
    });
  }
}

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

function askQuestion(query: string): Promise<string> {
  return new Promise((resolve) => {
    rl.question(query, (answer) => {
      resolve(answer.trim());
    });
  });
}

const shuffle = (deck: Deck): Deck => {
  const shuffledDeck = [...deck];
  for (let i = shuffledDeck.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * i);
    const temp = shuffledDeck[i];
    shuffledDeck[i] = shuffledDeck[j];
    shuffledDeck[j] = temp;
  }
  return shuffledDeck;
}

const giveCardsToPlayers = (deck: Deck, joker: Card, players: number, cards: number): PlayerCards[] => {
  const playersCards: PlayerCards[] = [];
  const removedJoker = deck.filter(card => card.card !== joker.card && card.suite !== joker.suite);

  for (let i = 0; i < players; i++) {
    const playerCards = [];
    for (let j = 0; j < cards; j++) {
      playerCards.push(pickRandomCard(removedJoker));
    }
    playersCards.push({
      player: i + 1,
      cards: playerCards,
    });
  }

  return playersCards;
}

const pickRandomCard = (deck: Deck): Card => {
  const randomIndex = Math.floor(Math.random() * deck.length);
  const randomCard = deck[randomIndex];
  deck.splice(randomIndex, 1);
  return randomCard;
}

const calculateCardPowers = (vira: Card, playersCards: PlayerCards[]): PlayerCardsWithPower[] => {
  const standardOrder = ['Q', 'J', 'K', 'A', '2', '3'];
  const suitePriority = ['clubs', 'hearts', 'spades', 'diamonds'];

  const getManilha = (vira: string): string => {
    const index = standardOrder.indexOf(vira);
    return index === -1 ? '' : standardOrder[(index + 1) % standardOrder.length];
  };

  const getCardPower = (card: Card): number => {
    const manilha = getManilha(vira.card);

    if (card.card === manilha) {
      return 10 - suitePriority.indexOf(card.suite);
    } else {
      const fixedOrder = ['3', '2', 'A', 'K', 'J', 'Q', '7', '6', '5', '4'];
      const index = fixedOrder.indexOf(card.card);
      if (index === -1) return 0;
      return 6 - Math.min(index, 5);
    }
  };

  return playersCards.map(player => ({
    ...player,
    cards: player.cards.map(card => ({
      ...card,
      power: getCardPower(card)
    }))
  }));
};

async function playRound(playersCards: PlayerCardsWithPower[], startingPlayer: number): Promise<RoundResult> {
  console.log(`Jogador ${startingPlayer} inicia a rodada.`);

  const playedCards: CardWithPower[] = [];
  const playerOrder = [...Array(4)].map((_, i) => (startingPlayer + i - 1) % 4 + 1);

  for (const player of playerOrder) {
    const playerHand = playersCards.find(p => p.player === player)!;
    let playedCard: CardWithPower;

    if (player === 1) {  // Jogador humano
      console.log("\nSuas cartas:");
      playerHand.cards.forEach((card, index) => {
        console.log(`${index + 1}: ${card.card} de ${card.suite} (poder: ${card.power})`);
      });

      let cardIndex: number;
      do {
        const choice = await askQuestion("Escolha o número da carta que deseja jogar: ");
        cardIndex = parseInt(choice) - 1;
      } while (isNaN(cardIndex) || cardIndex < 0 || cardIndex >= playerHand.cards.length);

      playedCard = playerHand.cards.splice(cardIndex, 1)[0];
    } else {
      playedCard = playerHand.cards.pop()!; // AI joga a última carta da mão
    }

    playedCards.push(playedCard);
    console.log(`Jogador ${player} jogou: ${playedCard.card} de ${playedCard.suite} (poder: ${playedCard.power})`);
  }

  const winningCard = playedCards.reduce((max, card) => card.power > max.power ? card : max);
  const winner = playerOrder[playedCards.indexOf(winningCard)];

  return { winner, playedCards };
}

async function game() {
  const PLAYERS_COUNT = 4;
  const GIVEN_CARDS = 3;
  const GAME_ROUNDS = 3;

  const shuffledDeck = shuffle(deck);

  const getJokerCard = pickRandomCard(shuffledDeck);
  const playersCards = giveCardsToPlayers(shuffledDeck, getJokerCard, PLAYERS_COUNT, GIVEN_CARDS);
  const playersCardsWithPower = calculateCardPowers(getJokerCard, playersCards);

  console.log('O Vira é:', getJokerCard);
  console.log('Suas cartas:', playersCardsWithPower[0].cards);

  let teamWins = [0, 0];
  let startingPlayer = 1;

  for (let round = 1; round <= GAME_ROUNDS; round++) {
    console.log(`\nRodada ${round}:`);
    const roundResult = await playRound(playersCardsWithPower, startingPlayer);
    console.log('Cartas jogadas:', roundResult.playedCards);
    console.log('Vencedor da rodada:', roundResult.winner);

    const winningTeam = roundResult.winner % 2 === 1 ? 0 : 1;
    teamWins[winningTeam]++;

    startingPlayer = roundResult.winner;

    if (teamWins[winningTeam] === 2) {
      console.log(`\nA dupla ${winningTeam + 1} (jogadores ${winningTeam === 0 ? '1 e 3' : '2 e 4'}) venceu o jogo!`);
      return winningTeam + 1;
    }
  }

  const winningTeam = teamWins[0] > teamWins[1] ? 1 : 2;
  console.log(`\nA dupla ${winningTeam} (jogadores ${winningTeam === 1 ? '1 e 3' : '2 e 4'}) venceu o jogo!`);
  return winningTeam;
}

game().then(() => {
  console.log("Jogo terminado!");
  process.exit(0);
}).catch((error) => {
  console.error("Ocorreu um erro:", error);
  process.exit(1);
});