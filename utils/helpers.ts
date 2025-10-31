
import { Player, Group, Match, MonthlyData, BracketMatch } from '../types';

const PLAYER_NAMES = [
  "Andre Mota", "Arildo", "Arthur", "Ary", "Caio Dias",
  "Claudio", "Cleiton", "Daniel Tomaz", "Diego Rodrigues", "Evaldo",
  "Fernando Garpelli", "Fernando Martin", "Fernando Soares", "Flavio", "Gabriel Abrame",
  "Gilson Santana", "Guilherme Tadini", "Gustavo Granja", "Iramaia", "Joao Claudio",
  "Joao Vicente", "João Orsi", "José Eduardo", "Leo Alves", "Lincoln",
  "Luan", "Lucas Lima", "Luiz Fernando", "Marcelo Bassi", "Marcelo Candido",
  "Marcos Rodrigues", "Mario", "Paulo Soares", "Pedro", "Rafael Brandao",
  "Renan Martin", "Robson Fiusa", "Tadeu Maia", "Thiago Mello", "Tiago Meira"
];

export const SEPTEMBER_RANKING = [
    { name: "Caio Dias", games: 5, wins: 5, losses: 0, sets: 10, gamePoints: 10, total: 70 },
    { name: "Guilherme Tadini", games: 5, wins: 5, losses: 0, sets: 10, gamePoints: 10, total: 70 },
    { name: "Robson Fiusa", games: 5, wins: 5, losses: 0, sets: 10, gamePoints: 10, total: 70 },
    { name: "Claudio", games: 5, wins: 4, losses: 1, sets: 9, gamePoints: 10, total: 59 },
    { name: "Thiago Mello", games: 5, wins: 4, losses: 1, sets: 9, gamePoints: 10, total: 59 },
    { name: "Evaldo", games: 5, wins: 4, losses: 1, sets: 9, gamePoints: 10, total: 59 },
    { name: "Daniel Tomaz", games: 5, wins: 4, losses: 1, sets: 8, gamePoints: 10, total: 58 },
    { name: "Gustavo Granja", games: 5, wins: 4, losses: 1, sets: 8, gamePoints: 10, total: 58 },
    { name: "Lincoln", games: 5, wins: 4, losses: 1, sets: 8, gamePoints: 10, total: 58 },
    { name: "Pedro", games: 5, wins: 4, losses: 1, sets: 8, gamePoints: 10, total: 58 },
    { name: "Ary", games: 5, wins: 3, losses: 2, sets: 7, gamePoints: 10, total: 47 },
    { name: "Gabriel Abrame", games: 5, wins: 3, losses: 2, sets: 7, gamePoints: 10, total: 47 },
    { name: "José Eduardo", games: 5, wins: 3, losses: 2, sets: 7, gamePoints: 10, total: 47 },
    { name: "João Orsi", games: 5, wins: 3, losses: 2, sets: 7, gamePoints: 10, total: 47 },
    { name: "Cleiton", games: 5, wins: 3, losses: 2, sets: 6, gamePoints: 10, total: 46 },
    { name: "Diego Rodrigues", games: 5, wins: 3, losses: 2, sets: 6, gamePoints: 10, total: 46 },
    { name: "Mario", games: 5, wins: 3, losses: 2, sets: 6, gamePoints: 10, total: 46 },
    { name: "Leo Alves", games: 5, wins: 3, losses: 2, sets: 6, gamePoints: 10, total: 46 },
    { name: "Paulo Soares", games: 5, wins: 3, losses: 2, sets: 7, gamePoints: 8, total: 45 },
    { name: "Iramaia", games: 5, wins: 2, losses: 3, sets: 6, gamePoints: 10, total: 36 },
    { name: "Fernando Martin", games: 5, wins: 2, losses: 3, sets: 5, gamePoints: 10, total: 35 },
    { name: "Fernando Soares", games: 5, wins: 2, losses: 3, sets: 5, gamePoints: 10, total: 35 },
    { name: "Luiz Fernando", games: 5, wins: 2, losses: 3, sets: 5, gamePoints: 10, total: 35 },
    { name: "Marcelo Candido", games: 5, wins: 2, losses: 3, sets: 5, gamePoints: 10, total: 35 },
    { name: "Tiago Meira", games: 5, wins: 2, losses: 3, sets: 5, gamePoints: 10, total: 35 },
    { name: "Renan Martin", games: 5, wins: 2, losses: 3, sets: 5, gamePoints: 10, total: 35 },
    { name: "Luan", games: 5, wins: 2, losses: 3, sets: 4, gamePoints: 10, total: 34 },
    { name: "Marcos Rodrigues", games: 5, wins: 2, losses: 3, sets: 4, gamePoints: 10, total: 34 },
    { name: "Lucas Lima", games: 5, wins: 2, losses: 3, sets: 4, gamePoints: 8, total: 32 },
    { name: "Gilson Santana", games: 5, wins: 2, losses: 3, sets: 4, gamePoints: 8, total: 32 },
    { name: "Marcelo Bassi", games: 5, wins: 2, losses: 3, sets: 4, gamePoints: 4, total: 28 },
    { name: "Arthur", games: 5, wins: 1, losses: 4, sets: 4, gamePoints: 10, total: 24 },
    { name: "Flavio", games: 5, wins: 1, losses: 4, sets: 4, gamePoints: 10, total: 24 },
    { name: "Arildo", games: 5, wins: 1, losses: 4, sets: 3, gamePoints: 10, total: 23 },
    { name: "Joao Claudio", games: 5, wins: 1, losses: 4, sets: 3, gamePoints: 10, total: 23 },
    { name: "Rafael Brandao", games: 5, wins: 1, losses: 4, sets: 3, gamePoints: 10, total: 23 },
    { name: "Fernando Garpelli", games: 5, wins: 1, losses: 4, sets: 2, gamePoints: 10, total: 22 },
    { name: "Joao Vicente", games: 5, wins: 0, losses: 5, sets: 2, gamePoints: 10, total: 12 },
    { name: "Andre Mota", games: 5, wins: 0, losses: 5, sets: 0, gamePoints: 10, total: 10 },
    { name: "Tadeu Maia", games: 5, wins: 0, losses: 5, sets: 0, gamePoints: 4, total: 4 },
];


export const parseScore = (score: string, player1Id: number, player2Id: number): { [playerId: number]: number } => {
  if (!score || score.trim() === '') {
    return { [player1Id]: 0, [player2Id]: 0 };
  }

  const sets = score.trim().split(/\s+/);
  let p1SetsWon = 0;
  let p2SetsWon = 0;

  for (const set of sets) {
    const games = set.split('-').map(g => parseInt(g, 10));
    if (games.length === 2 && !isNaN(games[0]) && !isNaN(games[1])) {
      if (games[0] > games[1]) {
        p1SetsWon++;
      } else if (games[1] > games[0]) {
        p2SetsWon++;
      }
    }
  }

  return {
    [player1Id]: p1SetsWon,
    [player2Id]: p2SetsWon,
  };
};

export const generateInitialData = (): { players: Player[]; monthlyData: MonthlyData[] } => {
  const rankingMap = new Map(SEPTEMBER_RANKING.map(p => [p.name, p]));

  const players: Player[] = PLAYER_NAMES.map((name, index) => {
    const stats = rankingMap.get(name);
    if (!stats) {
      // Fallback for any name mismatch
      return {
        id: index + 1, name,
        totalPoints: 0, wins: 0, losses: 0, gamesPlayed: 0, setsWon: 0, pointsFromGames: 0,
        monthlyPoints: 0, monthlyWins: 0, monthlyLosses: 0, monthlyGamesPlayed: 0, monthlySetsWon: 0, monthlyPointsFromGames: 0,
        totalWoWins: 0, totalWoLosses: 0, monthlyWoWins: 0, monthlyWoLosses: 0,
      };
    }
    return {
      id: index + 1,
      name,
      // Overall stats from September
      totalPoints: stats.total,
      wins: stats.wins,
      losses: stats.losses,
      gamesPlayed: stats.games,
      setsWon: stats.sets,
      pointsFromGames: stats.gamePoints,
      totalWoWins: 0, // Tracking starts from October
      totalWoLosses: 0,
      // Reset monthly stats for the new month (October)
      monthlyPoints: 0,
      monthlyWins: 0,
      monthlyLosses: 0,
      monthlyGamesPlayed: 0,
      monthlySetsWon: 0,
      monthlyPointsFromGames: 0,
      monthlyWoWins: 0,
      monthlyWoLosses: 0,
    };
  });

  const sortedPlayers = [...players].sort((a, b) => {
      if (b.totalPoints !== a.totalPoints) return b.totalPoints - a.totalPoints;
      return a.name.localeCompare(b.name); // Alphabetical tie-breaker
  });
  
  const groups: Group[] = [];
  const matches: Match[] = [];
  const playersPerGroup = 4;
  const numGroups = Math.ceil(players.length / playersPerGroup);
  const octoberMonthId = 1; 

  for (let i = 0; i < numGroups; i++) {
    const groupPlayerIds = sortedPlayers.slice(i * playersPerGroup, (i + 1) * playersPerGroup).map(p => p.id);
    const group: Group = { id: i + 1, name: `Grupo ${i + 1}`, playerIds: groupPlayerIds };
    groups.push(group);
    
    for (let j = 0; j < groupPlayerIds.length; j++) {
      for (let k = j + 1; k < groupPlayerIds.length; k++) {
        const p1Id = groupPlayerIds[j];
        const p2Id = groupPlayerIds[k];
        matches.push({ 
          id: `m${octoberMonthId}-g${group.id}-p${p1Id}-vs-p${p2Id}`, 
          player1Id: p1Id, 
          player2Id: p2Id, 
          winnerId: null, 
          score: '', 
          isWO: false 
        });
      }
    }
  }

  const octoberMonthData: MonthlyData = {
    id: octoberMonthId,
    name: 'Outubro',
    groups,
    matches
  };

  return { players, monthlyData: [octoberMonthData] };
};

export const generateMasterBracket = (contenders: Player[]): BracketMatch[] => {
  if (contenders.length < 16) return [];

  const bracket: BracketMatch[] = [];
  
  // Standard tournament seeding
  const seeds = [0, 15, 7, 8, 4, 11, 3, 12, 5, 10, 2, 13, 6, 9, 1, 14];
  
  // Round of 16
  for (let i = 0; i < 8; i++) {
    bracket.push({
      id: `R16-${i}`,
      round: 'R16',
      matchIndex: i,
      player1Id: contenders[seeds[i * 2]].id,
      player2Id: contenders[seeds[i * 2 + 1]].id,
      winnerId: null,
      score: '',
    });
  }

  // Quarterfinals
  for (let i = 0; i < 4; i++) {
    bracket.push({
      id: `QF-${i}`,
      round: 'QF',
      matchIndex: i,
      player1Id: null,
      player2Id: null,
      winnerId: null,
      score: '',
      sourceMatch1Id: `R16-${i * 2}`,
      sourceMatch2Id: `R16-${i * 2 + 1}`,
    });
  }

  // Semifinals
  for (let i = 0; i < 2; i++) {
    bracket.push({
      id: `SF-${i}`,
      round: 'SF',
      matchIndex: i,
      player1Id: null,
      player2Id: null,
      winnerId: null,
      score: '',
      sourceMatch1Id: `QF-${i * 2}`,
      sourceMatch2Id: `QF-${i * 2 + 1}`,
    });
  }

  // Final
  bracket.push({
    id: 'F-0',
    round: 'F',
    matchIndex: 0,
    player1Id: null,
    player2Id: null,
    winnerId: null,
    score: '',
    sourceMatch1Id: 'SF-0',
    sourceMatch2Id: 'SF-1',
  });
  
  return bracket;
};