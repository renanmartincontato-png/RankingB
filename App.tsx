
import React, { useState, useMemo, useCallback, useEffect, useRef } from 'react';
import { Player, Match, MonthlyData, Group, BracketMatch } from './types';
import { PlayerRankingTable } from './components/PlayerRankingTable';
import { MonthView } from './components/MonthView';
import { MasterBracket } from './components/MasterBracket';
import { PreviousMonthRanking } from './components/PreviousMonthRanking';
import { MatchResultModal } from './components/MatchResultModal';
import { WoStatsTable } from './components/WoStatsTable';
import { parseScore, generateMasterBracket } from './utils/helpers';
import { INITIAL_STATE } from './utils/initialState';
import { DownloadIcon, UploadIcon, TrophyIcon, TournamentIcon, CalendarIcon, UserSlashIcon } from './components/icons';

const LOCAL_STORAGE_KEY = 'tennisRankingApp';
type ActiveView = 'monthly' | 'master' | 'previous' | 'wo-stats';

// Sychronous data loader function to run BEFORE the first render.
// This eliminates the race condition that caused the infinite loading screen.
const loadInitialAppState = () => {
  try {
    const savedStateJSON = localStorage.getItem(LOCAL_STORAGE_KEY);
    if (savedStateJSON) {
      const savedState = JSON.parse(savedStateJSON);
      // Basic validation to ensure the loaded data is not corrupted
      if (savedState.players && savedState.monthlyData && savedState.currentMonthIndex !== undefined) {
        console.log("Data loaded from localStorage.");
        // Ensure masterBracket exists as it was added later
        savedState.masterBracket = savedState.masterBracket || [];
        return savedState;
      }
    }
  } catch (error) {
    console.error("Failed to load or parse from localStorage, using initial state.", error);
    // Clear corrupted localStorage if parsing fails
    localStorage.removeItem(LOCAL_STORAGE_KEY);
  }
  
  // If anything fails (no stored data, corrupted data), return the bundled initial state.
  console.log("Loading from bundled initial state.");
  return INITIAL_STATE;
};


const App: React.FC = () => {
  // Initialize state synchronously with data from our loader function.
  // This ensures the app has data from the very first render.
  const [initialAppState] = useState(loadInitialAppState);

  const [players, setPlayers] = useState<Player[]>(initialAppState.players);
  const [monthlyData, setMonthlyData] = useState<MonthlyData[]>(initialAppState.monthlyData);
  const [currentMonthIndex, setCurrentMonthIndex] = useState<number>(initialAppState.currentMonthIndex);
  const [masterBracket, setMasterBracket] = useState<BracketMatch[]>(initialAppState.masterBracket);
  
  const [activeView, setActiveView] = useState<ActiveView>('monthly');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedGroupMatch, setSelectedGroupMatch] = useState<Match | null>(null);
  const [selectedBracketMatch, setSelectedBracketMatch] = useState<BracketMatch | null>(null);
  const [saveStatus, setSaveStatus] = useState<'idle' | 'saved'>('idle');
  
  const saveStatusTimeoutRef = useRef<number | null>(null);
  const importInputRef = useRef<HTMLInputElement>(null);
  const isInitialMount = useRef(true);


  // Effect to save data to localStorage whenever it changes (for admin use)
  useEffect(() => {
    // Don't save on the very first render, as we just loaded the data.
    // This is a minor optimization to prevent unnecessary writes.
    if (isInitialMount.current) {
        isInitialMount.current = false;
        return;
    }
      
    try {
      const stateToSave = { players, monthlyData, currentMonthIndex, masterBracket };
      localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(stateToSave));
      setSaveStatus('saved');
    } catch (error) {
      console.error("Could not save state to localStorage", error);
    }
  }, [players, monthlyData, currentMonthIndex, masterBracket]);

  useEffect(() => {
    if (saveStatus === 'saved') {
      if (saveStatusTimeoutRef.current) clearTimeout(saveStatusTimeoutRef.current);
      saveStatusTimeoutRef.current = window.setTimeout(() => setSaveStatus('idle'), 2000);
    }
    return () => {
      if (saveStatusTimeoutRef.current) clearTimeout(saveStatusTimeoutRef.current);
    };
  }, [saveStatus]);

  const currentMonth = monthlyData[currentMonthIndex];

  const allMatchesPlayed = useMemo(() => {
    if (!currentMonth) return false;
    return currentMonth.matches.every(m => m.winnerId !== null);
  }, [currentMonth]);

  const masterContenders = useMemo(() => {
    const sorted = [...players].sort((a, b) => {
      if (b.totalPoints !== a.totalPoints) return b.totalPoints - a.totalPoints;
      return a.name.localeCompare(b.name);
    });
    return sorted.slice(0, 16);
  }, [players]);

  useEffect(() => {
    if (masterContenders.length === 16 && masterBracket.length === 0) {
      setMasterBracket(generateMasterBracket(masterContenders));
    }
  }, [masterContenders, masterBracket]);


  const handleGroupMatchClick = (match: Match) => {
    setSelectedGroupMatch(match);
    setIsModalOpen(true);
  };
  
  const handleBracketMatchClick = (match: BracketMatch) => {
    if (match.player1Id && match.player2Id) {
        setSelectedBracketMatch(match);
        setIsModalOpen(true);
    }
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedGroupMatch(null);
    setSelectedBracketMatch(null);
  };

  const handleSaveGroupMatchResult = (
    matchToUpdate: Match,
    newWinnerId: number,
    newScore: string,
    newIsWO: boolean
  ) => {
    const originalMatch = currentMonth.matches.find(m => m.id === matchToUpdate.id);
    if (!originalMatch) return;

    const updatedPlayersMap: Map<number, Player> = new Map(players.map(p => [p.id, { ...p }]));

    // Revert points if match was already played
    if (originalMatch.winnerId) {
      const oldWinnerId = originalMatch.winnerId;
      const oldLoserId = oldWinnerId === originalMatch.player1Id ? originalMatch.player2Id : originalMatch.player1Id;
      const oldWinner = updatedPlayersMap.get(oldWinnerId)!;
      const oldLoser = updatedPlayersMap.get(oldLoserId)!;
      const wasWO = originalMatch.isWO;

      if (wasWO) {
        oldWinner.totalWoWins -= 1;
        oldWinner.monthlyWoWins -= 1;
        oldLoser.totalWoLosses -= 1;
        oldLoser.monthlyWoLosses -= 1;
      }

      const oldSetCounts = parseScore(originalMatch.score, originalMatch.player1Id, originalMatch.player2Id);
      
      const oldSets = wasWO ? [] : originalMatch.score.trim().split(/\s+/);
      const wasSuperTiebreakMatch = oldSets.length === 3;
      
      const oldWinnerSetPoints = wasSuperTiebreakMatch ? 1 : oldSetCounts[oldWinnerId];
      const winnerPointsToRevert = (10 + 2 + oldWinnerSetPoints);

      oldWinner.wins -= 1;
      oldWinner.monthlyWins -= 1;
      oldWinner.gamesPlayed -= 1;
      oldWinner.monthlyGamesPlayed -= 1;
      oldWinner.pointsFromGames -= 2;
      oldWinner.monthlyPointsFromGames -= 2;
      oldWinner.setsWon -= oldSetCounts[oldWinnerId];
      oldWinner.monthlySetsWon -= oldSetCounts[oldWinnerId];
      oldWinner.totalPoints -= winnerPointsToRevert;
      oldWinner.monthlyPoints -= winnerPointsToRevert;

      oldLoser.losses -= 1;
      oldLoser.monthlyLosses -= 1;
      oldLoser.gamesPlayed -= 1;
      oldLoser.monthlyGamesPlayed -= 1;
      
      if (!wasWO) {
          const oldLoserSetPoints = wasSuperTiebreakMatch ? 1 : oldSetCounts[oldLoserId];
          const loserPointsToRevert = (2 + oldLoserSetPoints);
          oldLoser.pointsFromGames -= 2;
          oldLoser.monthlyPointsFromGames -= 2;
          oldLoser.setsWon -= oldSetCounts[oldLoserId];
          oldLoser.monthlySetsWon -= oldSetCounts[oldLoserId];
          oldLoser.totalPoints -= loserPointsToRevert;
          oldLoser.monthlyPoints -= loserPointsToRevert;
      }
    }

    // Apply new points
    const newWinner = updatedPlayersMap.get(newWinnerId)!;
    const newLoserId = newWinnerId === matchToUpdate.player1Id ? matchToUpdate.player2Id : matchToUpdate.player1Id;
    const newLoser = updatedPlayersMap.get(newLoserId)!;

    if (newIsWO) {
        newWinner.totalWoWins += 1;
        newWinner.monthlyWoWins += 1;
        newLoser.totalWoLosses += 1;
        newLoser.monthlyWoLosses += 1;
    }

    const newSetCounts = parseScore(newScore, matchToUpdate.player1Id, matchToUpdate.player2Id);
    const newSets = newIsWO ? [] : newScore.trim().split(/\s+/);
    const isSuperTiebreakMatch = newSets.length === 3;
    const winnerSetPoints = isSuperTiebreakMatch ? 1 : newSetCounts[newWinnerId];
    const loserSetPoints = isSuperTiebreakMatch ? 1 : newSetCounts[newLoserId];
    const winnerPointsToAdd = (10 + 2 + winnerSetPoints);

    newWinner.wins += 1;
    newWinner.monthlyWins += 1;
    newWinner.gamesPlayed += 1;
    newWinner.monthlyGamesPlayed += 1;
    newWinner.pointsFromGames += 2;
    newWinner.monthlyPointsFromGames += 2;
    newWinner.setsWon += newSetCounts[newWinnerId];
    newWinner.monthlySetsWon += newSetCounts[newWinnerId];
    newWinner.totalPoints += winnerPointsToAdd;
    newWinner.monthlyPoints += winnerPointsToAdd;
    
    newLoser.losses += 1;
    newLoser.monthlyLosses += 1;
    newLoser.gamesPlayed += 1;
    newLoser.monthlyGamesPlayed += 1;

    if (!newIsWO) {
        const loserPointsToAdd = (2 + loserSetPoints);
        newLoser.pointsFromGames += 2;
        newLoser.monthlyPointsFromGames += 2;
        newLoser.setsWon += newSetCounts[newLoserId];
        newLoser.monthlySetsWon += newSetCounts[newLoserId];
        newLoser.totalPoints += loserPointsToAdd;
        newLoser.monthlyPoints += loserPointsToAdd;
    }
    
    // Ensure no stats go below zero after corrections
    for (const player of updatedPlayersMap.values()){
        Object.keys(player).forEach(key => {
            const value = player[key as keyof Player];
            if (typeof value === 'number' && value < 0) {
                 (player as any)[key] = 0;
            }
        });
    }

    setPlayers(Array.from(updatedPlayersMap.values()));

    setMonthlyData(prevData => {
      const newMonthlyData = [...prevData];
      const currentMonthData = { ...newMonthlyData[currentMonthIndex] };
      currentMonthData.matches = currentMonthData.matches.map(m =>
        m.id === matchToUpdate.id ? { ...m, winnerId: newWinnerId, score: newScore, isWO: newIsWO } : m
      );
      newMonthlyData[currentMonthIndex] = currentMonthData;
      return newMonthlyData;
    });

    handleCloseModal();
  };

  const handleSaveBracketResult = (
    matchToUpdate: BracketMatch,
    newWinnerId: number,
    newScore: string
  ) => {
    setMasterBracket(prevBracket => {
        const newBracket = prevBracket.map(m => 
            m.id === matchToUpdate.id 
                ? { ...m, winnerId: newWinnerId, score: newScore }
                : m
        );

        const nextRoundMatch = newBracket.find(
            m => m.sourceMatch1Id === matchToUpdate.id || m.sourceMatch2Id === matchToUpdate.id
        );

        if (nextRoundMatch) {
            if (nextRoundMatch.sourceMatch1Id === matchToUpdate.id) {
                nextRoundMatch.player1Id = newWinnerId;
            } else {
                nextRoundMatch.player2Id = newWinnerId;
            }
        }
        return newBracket;
    });
    handleCloseModal();
  };
  
  const handleAdvanceMonth = () => {
    if (!allMatchesPlayed) {
        alert("Todos os jogos do mês devem ser concluídos antes de avançar.");
        return;
    }
    
    const sortedPlayers = [...players].sort((a, b) => {
        if (b.totalPoints !== a.totalPoints) return b.totalPoints - a.totalPoints;
        return a.name.localeCompare(b.name);
    });
    
    const playersForNewMonth = players.map(p => ({ ...p, monthlyPoints: 0, monthlyWins: 0, monthlyLosses: 0, monthlyGamesPlayed: 0, monthlySetsWon: 0, monthlyPointsFromGames: 0, monthlyWoWins: 0, monthlyWoLosses: 0 }));
    setPlayers(playersForNewMonth);
    
    const newMonthId = currentMonth.id + 1;
    const newGroups: Group[] = [];
    const newMatches: Match[] = [];
    const playersPerGroup = 4;
    const numGroups = Math.ceil(players.length / playersPerGroup);
    
    for (let i = 0; i < numGroups; i++) {
        const groupPlayerIds = sortedPlayers.slice(i * playersPerGroup, (i + 1) * playersPerGroup).map(p => p.id);
        const group: Group = { id: i + 1, name: `Grupo ${i + 1}`, playerIds: groupPlayerIds };
        newGroups.push(group);

        for (let j = 0; j < groupPlayerIds.length; j++) {
            for (let k = j + 1; k < groupPlayerIds.length; k++) {
                const player1Id = groupPlayerIds[j];
                const player2Id = groupPlayerIds[k];
                newMatches.push({ id: `m${newMonthId}-g${group.id}-p${player1Id}-vs-p${player2Id}`, player1Id, player2Id, winnerId: null, score: '', isWO: false });
            }
        }
    }
    
    const monthNames = ["Janeiro", "Fevereiro", "Março", "Abril", "Maio", "Junho", "Julho", "Agosto", "Setembro", "Outubro", "Novembro", "Dezembro"];
    // Starting from October (index 9)
    const newMonthName = monthNames[(9 + newMonthId -1) % 12];

    const nextMonth: MonthlyData = { id: newMonthId, name: newMonthName, groups: newGroups, matches: newMatches };

    setMonthlyData(prev => [...prev, nextMonth]);
    setCurrentMonthIndex(prev => prev + 1);
  };

  const handleExportData = () => {
    const dataToSave = { players, monthlyData, currentMonthIndex, masterBracket };
    const dataStr = JSON.stringify(dataToSave, null, 2);
    const blob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'ranking-tenis-backup.json';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const handleImportData = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const text = e.target?.result as string;
        const importedData = JSON.parse(text);

        if (importedData.players && importedData.monthlyData && importedData.currentMonthIndex !== undefined) {
          setPlayers(importedData.players);
          setMonthlyData(importedData.monthlyData);
          setCurrentMonthIndex(importedData.currentMonthIndex);
          setMasterBracket(importedData.masterBracket || []);
          alert("Dados importados com sucesso! Os dados agora estão salvos no seu navegador.");
        } else {
          throw new Error("Arquivo JSON inválido ou corrompido.");
        }
      } catch (error) {
        alert(`Erro ao importar dados: ${error instanceof Error ? error.message : 'Unknown error'}`);
      } finally {
        if (importInputRef.current) importInputRef.current.value = "";
      }
    };
    reader.readAsText(file);
  };

  const matchForModal = useMemo(() => {
    if (selectedGroupMatch) return { type: 'group', match: selectedGroupMatch };
    if (selectedBracketMatch) return { type: 'bracket', match: selectedBracketMatch };
    return null;
  }, [selectedGroupMatch, selectedBracketMatch]);
  
  const playersForModal = useMemo(() => {
    if (!matchForModal) return null;
    const p1 = players.find(p => p.id === matchForModal.match.player1Id);
    const p2 = players.find(p => p.id === matchForModal.match.player2Id);
    if (!p1 || !p2) return null;
    return { player1: p1, player2: p2 };
  }, [matchForModal, players]);

  // If, for some catastrophic reason, there's no current month, show an error.
  // This should not happen with the new synchronous loading logic.
  if (!currentMonth) {
    return (
      <div className="flex items-center justify-center h-screen bg-slate-900 text-red-400">
          <div className="text-center">
              <h2 className="text-2xl font-bold mb-2">Erro Crítico</h2>
              <p>Não foi possível carregar os dados do mês atual. Tente limpar o cache do navegador ou contate o administrador.</p>
          </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      <header className="bg-slate-800/80 backdrop-blur-sm p-4 shadow-lg sticky top-0 z-20">
          <div className="container mx-auto flex flex-col sm:flex-row justify-between items-center gap-4 sm:gap-2">
              <h1 className="text-xl sm:text-2xl font-bold text-cyan-400 text-center sm:text-left">Gerenciador de Ranking de Tênis</h1>
              
              <div className="flex items-center space-x-2 bg-slate-700 p-1 rounded-lg">
                  <button onClick={() => setActiveView('monthly')} className={`px-3 py-1.5 text-sm font-semibold rounded-md flex items-center gap-2 transition-colors ${activeView === 'monthly' ? 'bg-cyan-600 text-white' : 'text-slate-300 hover:bg-slate-600/50'}`}><TrophyIcon className="w-4 h-4" />Ranking Mensal</button>
                  <button onClick={() => setActiveView('master')} className={`px-3 py-1.5 text-sm font-semibold rounded-md flex items-center gap-2 transition-colors ${activeView === 'master' ? 'bg-cyan-600 text-white' : 'text-slate-300 hover:bg-slate-600/50'}`}><TournamentIcon className="w-4 h-4" />Master</button>
                  <button onClick={() => setActiveView('previous')} className={`px-3 py-1.5 text-sm font-semibold rounded-md flex items-center gap-2 transition-colors ${activeView === 'previous' ? 'bg-cyan-600 text-white' : 'text-slate-300 hover:bg-slate-600/50'}`}><CalendarIcon className="w-4 h-4" />Mês Anterior</button>
                  <button onClick={() => setActiveView('wo-stats')} className={`px-3 py-1.5 text-sm font-semibold rounded-md flex items-center gap-2 transition-colors ${activeView === 'wo-stats' ? 'bg-cyan-600 text-white' : 'text-slate-300 hover:bg-slate-600/50'}`}><UserSlashIcon className="w-4 h-4" />W.O.</button>
              </div>

              <div className="flex items-center space-x-2 sm:space-x-4">
                <button onClick={handleExportData} className="p-2 rounded-full bg-slate-700 hover:bg-slate-600 transition" title="Exportar Dados (Salvar Backup)"><DownloadIcon className="w-5 h-5" /></button>
                <button onClick={() => importInputRef.current?.click()} className="p-2 rounded-full bg-slate-700 hover:bg-slate-600 transition" title="Importar Dados (Restaurar Backup)"><UploadIcon className="w-5 h-5" /></button>
                <input type="file" accept=".json" ref={importInputRef} onChange={handleImportData} className="hidden" />

                <div className="relative w-28 text-center">
                  <span className="font-semibold text-lg">{currentMonth.name}</span>
                  <span className={`absolute top-full left-1/2 -translate-x-1/2 mt-1 text-xs text-green-400 transition-opacity duration-300 ${saveStatus === 'saved' ? 'opacity-100' : 'opacity-0'}`} aria-live="polite">✔ Salvo</span>
                </div>
                <button onClick={handleAdvanceMonth} disabled={!allMatchesPlayed} className="px-4 py-2 rounded-md bg-cyan-600 text-white font-semibold hover:bg-cyan-500 disabled:bg-slate-500 disabled:cursor-not-allowed transition-all" title={!allMatchesPlayed ? "Conclua todos os jogos para avançar" : "Avançar para o próximo mês"}>Avançar Mês</button>
              </div>
          </div>
      </header>
      <main className="container mx-auto p-4 lg:p-6">
        <div className="grid grid-cols-1 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          <div className="lg:col-span-1 xl:col-span-1">
            <PlayerRankingTable players={players} />
          </div>
          <div className="lg:col-span-2 xl:col-span-3">
            {activeView === 'monthly' && currentMonth && <MonthView monthData={currentMonth} players={players} onMatchClick={handleGroupMatchClick} />}
            {activeView === 'master' && <MasterBracket players={players} contenders={masterContenders} bracketData={masterBracket} onMatchClick={handleBracketMatchClick} />}
            {activeView === 'previous' && <PreviousMonthRanking />}
            {activeView === 'wo-stats' && <WoStatsTable players={players} />}
          </div>
        </div>
      </main>

      {isModalOpen && matchForModal && playersForModal && (
        <MatchResultModal
          match={{
            ...matchForModal.match,
            isWO: matchForModal.type === 'group' ? (matchForModal.match as Match).isWO : false,
          }}
          player1={playersForModal.player1}
          player2={playersForModal.player2}
          onClose={handleCloseModal}
          onSave={(_match, winnerId, score, isWO) => {
            const currentMatchForModal = matchForModal;
            if (currentMatchForModal?.type === 'group') {
              handleSaveGroupMatchResult(currentMatchForModal.match as Match, winnerId, score, isWO);
            } else if (currentMatchForModal?.type === 'bracket') {
              handleSaveBracketResult(currentMatchForModal.match as BracketMatch, winnerId, score);
            }
          }}
          isBracketMatch={matchForModal.type === 'bracket'}
        />
      )}
    </div>
  );
};

export default App;