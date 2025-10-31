
import React from 'react';
import { SEPTEMBER_RANKING } from '../utils/helpers';
import { CalendarIcon } from './icons';

export const PreviousMonthRanking: React.FC = () => {
  const getRowColor = (rank: number) => {
    const groupIndex = Math.floor((rank - 1) / 4);
    const colorIndex = groupIndex % 3;
    
    switch (colorIndex) {
      case 0:
        return 'bg-green-600/20'; // Green
      case 1:
        return 'bg-yellow-500/20'; // Yellow
      case 2:
        return 'bg-blue-600/20'; // Blue
      default:
        return '';
    }
  };

  return (
    <div className="bg-slate-800 rounded-lg shadow-lg p-4 lg:p-6">
      <h2 className="text-2xl font-bold text-cyan-400 mb-6 border-b border-slate-700 pb-3 flex items-center gap-3">
        <CalendarIcon className="w-6 h-6" />
        Classificação Final - Setembro
      </h2>
      <div className="overflow-y-auto max-h-[calc(100vh-250px)]">
        <div className="overflow-x-auto">
            <table className="w-full text-left text-xs sm:text-sm min-w-[480px]">
            <thead className="sticky top-0 bg-slate-800 z-10">
                <tr>
                <th className="p-2 font-semibold text-slate-400 text-center">#</th>
                <th className="p-2 font-semibold text-slate-400">Jogador</th>
                <th className="p-2 font-semibold text-slate-400 text-center" title="Jogos Disputados">J</th>
                <th className="p-2 font-semibold text-slate-400 text-center" title="Vitórias">V</th>
                <th className="p-2 font-semibold text-slate-400 text-center" title="Derrotas">D</th>
                <th className="p-2 font-semibold text-slate-400 text-center" title="Sets Ganhos">SG</th>
                <th className="p-2 font-semibold text-slate-400 text-center" title="Pontos por Jogo">PJ</th>
                <th className="p-2 font-semibold text-slate-400 text-center" title="Total">Pts</th>
                </tr>
            </thead>
            <tbody>
                {SEPTEMBER_RANKING.map((player, index) => {
                const rank = index + 1;
                return (
                    <tr key={player.name} className={`transition-colors ${getRowColor(rank)}`}>
                    <td className={`p-2 text-center font-bold text-slate-300`}>{rank}</td>
                    <td className="p-2 text-slate-300 font-medium whitespace-nowrap">{player.name}</td>
                    <td className="p-2 text-center font-mono text-slate-400">{player.games}</td>
                    <td className="p-2 text-center font-mono text-green-400">{player.wins}</td>
                    <td className="p-2 text-center font-mono text-red-400">{player.losses}</td>
                    <td className="p-2 text-center font-mono text-slate-400">{player.sets}</td>
                    <td className="p-2 text-center font-mono text-slate-400">{player.gamePoints}</td>
                    <td className="p-2 text-center font-bold font-mono text-cyan-400">{player.total}</td>
                    </tr>
                );
                })}
            </tbody>
            </table>
        </div>
      </div>
    </div>
  );
};