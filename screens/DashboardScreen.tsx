import React from 'react';
import { DailyStats, UserProfile } from '../types';
import { BarChart, Bar, XAxis, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import { LogOut } from 'lucide-react';

interface DashboardProps {
    allStats: DailyStats[];
    onLogout: () => void;
    user: UserProfile;
}

const DashboardScreen: React.FC<DashboardProps> = ({ allStats, onLogout, user }) => {
    // Transform daily stats for chart
    // Ensure we have last 7 days even if empty
    const data = allStats.slice(-7).map(s => ({
        day: new Date(s.date).toLocaleDateString('en-US', { weekday: 'short' }),
        distance: s.distanceMeters,
        mins: s.workouts.reduce((acc, curr) => acc + (curr.durationSeconds / 60), 0)
    }));

    return (
        <div className="pb-24 pt-6 px-4">
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-2xl font-bold">Progress</h1>
                <button onClick={onLogout} className="p-2 bg-gray-100 text-gray-600 rounded-full">
                    <LogOut size={20} />
                </button>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-2 gap-4 mb-8">
                <div className="bg-white p-4 rounded-2xl shadow-sm border border-gray-100">
                    <div className="text-gray-400 text-xs uppercase font-bold mb-1">Steps Today</div>
                    <div className="text-2xl font-bold text-gray-800">{allStats[allStats.length-1]?.distanceMeters || 0}</div>
                </div>
                <div className="bg-white p-4 rounded-2xl shadow-sm border border-gray-100">
                    <div className="text-gray-400 text-xs uppercase font-bold mb-1">Calories</div>
                    <div className="text-2xl font-bold text-gray-800">~{Math.floor((allStats[allStats.length-1]?.distanceMeters || 0) * 0.04)}</div>
                </div>
                <div className="bg-white p-4 rounded-2xl shadow-sm border border-gray-100 col-span-2">
                    <div className="text-gray-400 text-xs uppercase font-bold mb-1">Total Workouts</div>
                    <div className="text-3xl font-bold text-teal-600">{allStats.reduce((acc, curr) => acc + curr.workouts.length, 0)}</div>
                </div>
            </div>

            {/* Charts */}
            <div className="bg-white p-5 rounded-2xl shadow-sm border border-gray-100 mb-6">
                <h3 className="font-bold text-gray-800 mb-4">Activity (meters)</h3>
                <div className="h-40 w-full">
                    <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={data}>
                            <XAxis dataKey="day" axisLine={false} tickLine={false} tick={{fontSize: 12, fill: '#9ca3af'}} />
                            <Tooltip cursor={{fill: 'transparent'}} contentStyle={{borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)'}} />
                            <Bar dataKey="distance" radius={[4, 4, 0, 0]}>
                                {data.map((entry, index) => (
                                    <Cell key={`cell-${index}`} fill={index === data.length - 1 ? '#0d9488' : '#e5e7eb'} />
                                ))}
                            </Bar>
                        </BarChart>
                    </ResponsiveContainer>
                </div>
            </div>

            <div className="text-center text-xs text-gray-400 mt-8">
                Data saved locally. <br /> Cloud sync available in Pro version.
            </div>
        </div>
    );
};

export default DashboardScreen;