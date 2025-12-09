import React from 'react';
import { DailyStats, UserProfile } from '../types';
import { BarChart, Bar, XAxis, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import { LogOut, Zap, Clock, TrendingUp } from 'lucide-react';

interface DashboardProps {
    allStats: DailyStats[];
    onLogout: () => void;
    user: UserProfile;
}

const DashboardScreen: React.FC<DashboardProps> = ({ allStats, onLogout, user }) => {
    // Transform daily stats for chart
    const data = allStats.slice(-7).map(s => ({
        day: new Date(s.date).toLocaleDateString('en-US', { weekday: 'short' }),
        distance: s.distanceMeters,
        mins: s.workouts.reduce((acc, curr) => acc + (curr.durationSeconds / 60), 0)
    }));

    // Get all workouts sorted by date (newest first)
    const allWorkouts = allStats
        .flatMap(stat => stat.workouts.map(w => ({ ...w, date: stat.date })))
        .sort((a, b) => b.timestamp - a.timestamp);

    const todayStats = allStats[allStats.length - 1];
    const totalWorkouts = allStats.reduce((acc, curr) => acc + curr.workouts.length, 0);
    const totalMinutes = allWorkouts.reduce((acc, w) => acc + w.durationSeconds / 60, 0);
    const avgScore = allWorkouts.length > 0 
        ? Math.round(allWorkouts.reduce((acc, w) => acc + w.avgPostureScore, 0) / allWorkouts.length)
        : 0;

    return (
        <div className="pb-24 pt-6 px-4 max-w-5xl mx-auto">
            {/* Header */}
            <div className="flex justify-between items-center mb-8">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900">Your Progress</h1>
                    <p className="text-gray-500 text-sm mt-1">Keep up the great work!</p>
                </div>
                <button onClick={onLogout} className="p-3 bg-gray-100 text-gray-600 rounded-full hover:bg-gray-200 transition-colors">
                    <LogOut size={22} />
                </button>
            </div>

            {/* Key Stats */}
            <div className="grid grid-cols-3 gap-4 mb-8">
                <div className="bg-gradient-to-br from-blue-50 to-blue-100 p-5 rounded-2xl border border-blue-200 shadow-sm">
                    <div className="flex items-center justify-between mb-2">
                        <div className="text-gray-600 text-xs uppercase font-bold">Total Workouts</div>
                        <Zap size={18} className="text-blue-600" />
                    </div>
                    <div className="text-3xl font-bold text-blue-700">{totalWorkouts}</div>
                    <div className="text-xs text-gray-500 mt-2">exercises completed</div>
                </div>

                <div className="bg-gradient-to-br from-orange-50 to-orange-100 p-5 rounded-2xl border border-orange-200 shadow-sm">
                    <div className="flex items-center justify-between mb-2">
                        <div className="text-gray-600 text-xs uppercase font-bold">Total Time</div>
                        <Clock size={18} className="text-orange-600" />
                    </div>
                    <div className="text-3xl font-bold text-orange-700">{Math.floor(totalMinutes)}<span className="text-lg font-normal">m</span></div>
                    <div className="text-xs text-gray-500 mt-2">across all sessions</div>
                </div>

                <div className="bg-gradient-to-br from-teal-50 to-teal-100 p-5 rounded-2xl border border-teal-200 shadow-sm">
                    <div className="flex items-center justify-between mb-2">
                        <div className="text-gray-600 text-xs uppercase font-bold">Avg Score</div>
                        <TrendingUp size={18} className="text-teal-600" />
                    </div>
                    <div className="text-3xl font-bold text-teal-700">{avgScore}<span className="text-lg font-normal">/100</span></div>
                    <div className="text-xs text-gray-500 mt-2">posture accuracy</div>
                </div>
            </div>

            {/* Charts */}
            <div className="bg-white p-6 rounded-3xl shadow-sm border border-gray-100 mb-8">
                <h3 className="text-lg font-bold text-gray-900 mb-4">Weekly Activity</h3>
                <div className="h-48 w-full">
                    <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={data}>
                            <XAxis dataKey="day" axisLine={false} tickLine={false} tick={{fontSize: 12, fill: '#9ca3af'}} />
                            <Tooltip 
                                cursor={{fill: 'transparent'}} 
                                contentStyle={{borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)', background: 'white'}}
                                formatter={(value: any) => typeof value === 'number' ? value.toFixed(0) : value}
                            />
                            <Bar dataKey="distance" radius={[8, 8, 0, 0]} fill="#0d9488">
                                {data.map((entry, index) => (
                                    <Cell key={`cell-${index}`} fill={index === data.length - 1 ? '#0d9488' : '#d1fdf4'} />
                                ))}
                            </Bar>
                        </BarChart>
                    </ResponsiveContainer>
                </div>
            </div>

            {/* Workout History */}
            <div className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden">
                <div className="p-6 border-b border-gray-100">
                    <h3 className="text-lg font-bold text-gray-900">Recent Workouts</h3>
                </div>

                {allWorkouts.length > 0 ? (
                    <div className="divide-y divide-gray-100">
                        {allWorkouts.slice(0, 15).map((workout, idx) => {
                            const workoutDate = new Date(workout.date);
                            const isToday = new Date().toDateString() === workoutDate.toDateString();
                            const timeStr = `${Math.floor(workout.durationSeconds / 60)}m ${(workout.durationSeconds % 60).toString().padStart(2, '0')}s`;
                            
                            return (
                                <div key={idx} className="p-4 hover:bg-gray-50 transition-colors">
                                    <div className="flex items-center justify-between">
                                        <div className="flex-1">
                                            <div className="font-semibold text-gray-900">{workout.exerciseName}</div>
                                            <div className="flex gap-3 mt-2 text-sm">
                                                <span className="text-gray-500 flex items-center gap-1">
                                                    <Clock size={14} />
                                                    {timeStr}
                                                </span>
                                                <span className="text-gray-500">
                                                    {isToday ? 'Today' : workoutDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                                                </span>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-4">
                                            {workout.repsCompleted && (
                                                <div className="text-right">
                                                    <div className="text-2xl font-bold text-purple-600">{workout.repsCompleted}</div>
                                                    <div className="text-xs text-gray-500 uppercase font-bold">Reps</div>
                                                </div>
                                            )}
                                            <div className={`text-right p-3 rounded-xl ${
                                                workout.avgPostureScore >= 80 ? 'bg-green-50' :
                                                workout.avgPostureScore >= 70 ? 'bg-yellow-50' :
                                                'bg-orange-50'
                                            }`}>
                                                <div className={`text-2xl font-bold ${
                                                    workout.avgPostureScore >= 80 ? 'text-green-600' :
                                                    workout.avgPostureScore >= 70 ? 'text-yellow-600' :
                                                    'text-orange-600'
                                                }`}>
                                                    {Math.round(workout.avgPostureScore)}
                                                </div>
                                                <div className="text-xs text-gray-500 uppercase font-bold">Score</div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                ) : (
                    <div className="p-12 text-center">
                        <div className="text-5xl mb-4">🏃</div>
                        <p className="text-gray-600 font-medium mb-2">No workouts yet</p>
                        <p className="text-gray-500 text-sm">Complete your first exercise session to see your progress here!</p>
                    </div>
                )}
            </div>

            <div className="text-center text-xs text-gray-400 mt-8">
                Data saved locally. Cloud sync available in Pro version.
            </div>
        </div>
    );
};

export default DashboardScreen;