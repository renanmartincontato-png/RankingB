
import React from 'react';
import { MonthlyData, Player } from '../types';
import { GroupCard } from './GroupCard';

interface MonthViewProps {
  monthData: MonthlyData;
  players: Player[];
  onMatchClick: (match: any) => void;
}

export const MonthView: React.FC<MonthViewProps> = ({ monthData, players, onMatchClick }) => {
  return (
    <div className="w-full h-full">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4 gap-4">
            {monthData.groups.map(group => {
            const groupMatches = monthData.matches.filter(match => {
                const groupPlayerIds = new Set(group.playerIds);
                return groupPlayerIds.has(match.player1Id) && groupPlayerIds.has(match.player2Id);
            });
            return (
                <GroupCard
                key={group.id}
                group={group}
                players={players}
                matches={groupMatches}
                onMatchClick={onMatchClick}
                />
            );
            })}
        </div>
    </div>
  );
};