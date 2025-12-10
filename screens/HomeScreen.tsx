import React, { useMemo, useState, useEffect } from 'react';
import { UserProfile, DailyStats, EXERCISES, ExercisePreference, RehabArea, RehabMode, RehabDifficultyKey, Goal } from '../types';
import { Play, ChevronRight, Footprints, Flame, CheckCircle, Circle } from 'lucide-react';
import { PieChart, Pie, Cell, ResponsiveContainer } from 'recharts';
import { REHAB_PROTOCOLS, PROTOCOL_SUMMARY_ROWS } from '../data/rehabProtocols';
import { CONDITION_DIETS, GOAL_DIETS, HYDRATION_TIPS, VITAMIN_D_TIPS, CALCIUM_SOURCES } from '../data/bdDietPlans';
import ProfileAvatar from '../components/ProfileAvatar';

interface HomeProps {
  user: UserProfile;
  stats: DailyStats;
  onStartExercise: (exId: string) => void;
  onNavigateToMeals: () => void;
  onUpdateChecklist: (key: string, val: boolean) => void;
  onSaveRehabPreference: (pref: ExercisePreference) => void;
  profileName?: string;
  profileAvatar?: string | null;
  onOpenProfile: () => void;
  onAvatarChange?: (avatarUrl: string) => void;
}


const HomeScreen: React.FC<HomeProps> = ({
  user,
  stats,
  onStartExercise,
  onNavigateToMeals,
  onUpdateChecklist,
  onSaveRehabPreference,
  profileName,
  profileAvatar,
  onOpenProfile,
  onAvatarChange,
}) => {
  // Data for the Ring Chart
  const pieData = [
    { name: 'Completed', value: stats.distanceMeters },
    { name: 'Remaining', value: Math.max(0, 4000 - stats.distanceMeters) },
  ];
  const COLORS = ['#0d9488', '#e5e7eb']; // Teal and soft gray

  type HabitEntry = {
    id: string;
    label: string;
    icon: string;
    children?: HabitEntry[];
  };

  const BASE_HABIT_GROUPS: HabitEntry[] = [
    { id: 'water', label: 'Drink 8 glasses of water', icon: '\u{1F4A7}' },
    { id: 'fruit', label: 'Eat a fruit', icon: '\u{1F34E}' },
    { id: 'protein', label: 'Protein with lunch', icon: '\u{1F357}' },
  ];

  const initialArea: RehabArea = user.exercisePreference?.area ?? 'neck';
  const initialMode: RehabMode = user.exercisePreference?.mode ?? 'EASY';
  const [selectedArea, setSelectedArea] = useState<RehabArea>(initialArea);
  const [selectedMode, setSelectedMode] = useState<RehabMode>(initialMode);

  useEffect(() => {
    if (user.exercisePreference) {
      if (user.exercisePreference.area !== selectedArea) {
        setSelectedArea(user.exercisePreference.area);
      }
      if (user.exercisePreference.mode !== selectedMode) {
        setSelectedMode(user.exercisePreference.mode);
      }
    }
  }, [user.exercisePreference?.area, user.exercisePreference?.mode]);

  const rehabPlan = REHAB_PROTOCOLS[selectedArea];
  const difficultyKey: RehabDifficultyKey = selectedMode.toLowerCase() as RehabDifficultyKey;
  const rehabDifficulty = rehabPlan.difficulty[difficultyKey];

  const AREA_OPTIONS: { id: RehabArea; label: string }[] = [
    { id: 'neck', label: 'Neck Pain' },
    { id: 'back', label: 'Lower Back Pain' },
    { id: 'knee', label: 'Knee Pain' },
  ];

  const MODE_OPTIONS: { id: RehabMode; label: string; description: string }[] = [
    { id: 'EASY', label: 'Easy', description: 'Pain relief & mobility' },
    { id: 'MEDIUM', label: 'Medium', description: 'Strength + stability' },
    { id: 'HARD', label: 'Hard', description: 'Endurance & power' },
  ];

  const updatePreference = (area: RehabArea, mode: RehabMode) => {
    onSaveRehabPreference({ area, mode });
  };

  const areaDietMap: Record<RehabArea, string> = {
    neck: 'shoulder',
    back: 'lower_back',
    knee: 'knee',
  };

  const goalDietMap: Record<Goal, string> = {
    REDUCE_PAIN: 'reduce_pain',
    FLEXIBILITY: 'flexibility',
    POSTURE: 'posture',
    ACTIVE: 'active',
  };

  const conditionDiet = useMemo(() => {
    const planId = areaDietMap[selectedArea] || 'general';
    return CONDITION_DIETS.find((plan) => plan.id === planId) || CONDITION_DIETS.find((plan) => plan.id === 'general');
  }, [selectedArea]);

  const primaryGoal = user.goals?.[0];
  const goalDiet = useMemo(() => {
    if (!primaryGoal) return null;
    const planId = goalDietMap[primaryGoal];
    return GOAL_DIETS.find((plan) => plan.id === planId) || null;
  }, [primaryGoal]);

  const slugify = (text: string) =>
    text
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '_')
      .replace(/^_+|_+$/g, '');

  const dietHabits = useMemo<HabitEntry[]>(() => {
    const groups: HabitEntry[] = [];
    const makeChildren = (parentId: string, items: string[]) =>
      items.map((item, idx) => ({
        id: `${parentId}_${slugify(item)}_${idx}`,
        label: item,
        icon: '•',
      }));

    if (conditionDiet) {
      const condId = `condition_${conditionDiet.id}`;
      groups.push({
        id: `diet_${conditionDiet.id}_breakfast`,
        label: `${conditionDiet.title} Breakfast`,
        icon: '🍳',
        children: makeChildren(`${condId}_breakfast`, conditionDiet.breakfast),
      });
      groups.push({
        id: `diet_${conditionDiet.id}_lunch`,
        label: `${conditionDiet.title} Lunch`,
        icon: '🍱',
        children: makeChildren(`${condId}_lunch`, conditionDiet.lunch),
      });
      groups.push({
        id: `diet_${conditionDiet.id}_dinner`,
        label: `${conditionDiet.title} Dinner`,
        icon: '🍽️',
        children: makeChildren(`${condId}_dinner`, conditionDiet.dinner),
      });
    }
    if (goalDiet) {
      const goalBase = `goal_${goalDiet.id}`;
      groups.push({
        id: `${goalBase}_breakfast`,
        label: `${goalDiet.title} Breakfast`,
        icon: '⭐',
        children: makeChildren(`${goalBase}_breakfast`, goalDiet.meals.breakfast),
      });
      groups.push({
        id: `${goalBase}_lunch`,
        label: `${goalDiet.title} Lunch`,
        icon: '🍽️',
        children: makeChildren(`${goalBase}_lunch`, goalDiet.meals.lunch),
      });
      groups.push({
        id: `${goalBase}_dinner`,
        label: `${goalDiet.title} Dinner`,
        icon: '🌙',
        children: makeChildren(`${goalBase}_dinner`, goalDiet.meals.dinner),
      });
    }
    return groups;
  }, [conditionDiet, goalDiet]);

  const supplementalHabits: HabitEntry[] = [
    { id: 'hydration_focus', label: HYDRATION_TIPS[0], icon: '💧' },
    { id: 'vit_d_focus', label: VITAMIN_D_TIPS[0], icon: '🌞' },
    { id: 'calcium_focus', label: `Calcium: ${CALCIUM_SOURCES[0]}`, icon: '🦴' },
  ];

  const habitGroups = [...BASE_HABIT_GROUPS, ...dietHabits, ...supplementalHabits];
  const welcomeName = (profileName || user.name || 'Guest').split(' ')[0];
  const avatarSrc =
    profileAvatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${profileName || user.name}`;

  // Filter exercises based on Pain Area
  const recommendedExercises = useMemo(() => {
    // If no specific pain areas or just GENERAL, show all/default set
    if (
      !user.painAreas ||
      user.painAreas.length === 0 ||
      (user.painAreas.length === 1 && user.painAreas.includes('GENERAL'))
    ) {
      return EXERCISES.slice(0, 3);
    }

    const filtered = EXERCISES.filter((ex) => {
      const tags = ex.tags.map((t) => t.toUpperCase());

      // Map KNEE pain to Knee exercises
      if (user.painAreas.includes('KNEE') && tags.includes('KNEE')) return true;

      // Map LOWER_BACK to Lower Back exercises
      if (user.painAreas.includes('LOWER_BACK') && tags.includes('LOWER BACK')) return true;

      // Map UPPER_BACK or SHOULDER to Neck/Shoulder exercises
      // 'desk_stretch' has tag 'Neck'
      if (
        (user.painAreas.includes('UPPER_BACK') || user.painAreas.includes('SHOULDER')) &&
        (tags.includes('NECK') || tags.includes('SHOULDER') || tags.includes('UPPER BACK'))
      )
        return true;

      return false;
    });

    // Fallback: if filtering returns nothing (rare), show default list
    return filtered.length > 0 ? filtered : EXERCISES.slice(0, 3);
  }, [user.painAreas]);

  return (
    <div className="min-h-screen bg-white text-gray-900 pb-28 font-sans w-full mx-auto max-w-5xl px-4 sm:px-6 lg:px-12">
      {/* Header */}
      <div className="pt-10 mb-6 flex justify-between items-center flex-wrap gap-4">
        <div className="flex items-center gap-3 flex-1">
          <ProfileAvatar
            uid={user.id}
            avatarUrl={profileAvatar || null}
            name={profileName || user.name}
            onAvatarChange={onAvatarChange}
          />
          <div className="text-left">
            <h1 className="text-xl font-bold leading-tight text-gray-900">Welcome {profileName || welcomeName}!</h1>
            <p className="text-gray-500 text-sm">Tap avatar to upload photo</p>
          </div>
        </div>
        <button onClick={onOpenProfile} className="flex-shrink-0 px-4 py-2 bg-teal-500 hover:bg-teal-600 text-white rounded-lg text-sm font-medium transition">
          Profile
        </button>
      </div>

      {/* Summary Cards */}
      <div className="grid gap-4 md:grid-cols-2 mb-6">
        <div className="bg-white rounded-3xl p-6 shadow border border-gray-200">
          <div className="flex justify-between items-start mb-2">
            <div>
              <h3 className="text-gray-500 text-sm font-medium">Steps</h3>
              <div className="flex items-baseline gap-1 text-2xl font-bold text-gray-900">
                {Math.floor(stats.distanceMeters * 1.3)}
                <span className="text-gray-500 text-sm font-normal">/ 10000</span>
              </div>
            </div>
          </div>
          {/* Progress Bar */}
          <div className="w-full bg-gray-200 rounded-full h-4 overflow-hidden relative">
            <div
              className="bg-teal-500 h-full rounded-full transition-all duration-1000"
              style={{ width: `${Math.min(((stats.distanceMeters * 1.3) / 10000) * 100, 100)}%` }}
            ></div>
          </div>
        </div>

        <div className="bg-white rounded-3xl p-6 shadow border border-gray-200 flex flex-col sm:flex-row gap-4">
          <div className="flex-1 space-y-4">
            <h3 className="text-gray-500 text-sm font-medium">Daily Report</h3>

            <div>
              <div className="text-xs text-gray-500">Steps</div>
              <div className="text-sm font-bold text-teal-600">
                {Math.floor(stats.distanceMeters * 1.3)} <span className="text-gray-500 font-normal">/ 10000</span>
              </div>
            </div>

            <div>
              <div className="text-xs text-gray-500">Calories</div>
              <div className="text-sm font-bold text-teal-600">
                {Math.floor(stats.distanceMeters * 0.05)} <span className="text-gray-500 font-normal">/ 700 Cal</span>
              </div>
            </div>

            <div>
              <div className="text-xs text-gray-500">Distance</div>
              <div className="text-sm font-bold text-teal-600">
                {stats.distanceMeters.toFixed(1)} <span className="text-gray-500 font-normal">/ 4000 m</span>
              </div>
            </div>
          </div>

          {/* Ring Chart */}
          <div className="w-28 h-28 sm:w-32 sm:h-32 relative flex items-center justify-center mx-auto">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={pieData}
                  cx="50%"
                  cy="50%"
                  innerRadius={35}
                  outerRadius={50}
                  startAngle={90}
                  endAngle={-270}
                  dataKey="value"
                  stroke="none"
                >
                  {pieData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
              </PieChart>
            </ResponsiveContainer>
            {/* Inner Circles Visual Hack to match design */}
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
              <div className="w-14 h-14 rounded-full border-4 border-gray-200 opacity-50"></div>
            </div>
          </div>
        </div>
      </div>

      {/* Daily Habits Checklist */}
      <div className="mb-4">
        <div className="bg-white rounded-3xl p-6 shadow border border-gray-200">
          <h3 className="text-gray-500 text-sm font-medium mb-4">Daily Habits & Meals</h3>
          <div className="space-y-3">
            {habitGroups.map((habit) => {
              const hasChildren = habit.children && habit.children.length > 0;
              const isDone = hasChildren
                ? habit.children!.every((child) => stats.checklist[child.id])
                : !!stats.checklist[habit.id];

              return (
                <div key={habit.id} className="rounded-2xl border border-gray-200 bg-white">
                  <div
                    className={`flex items-center gap-3 p-3 ${
                      hasChildren ? 'cursor-default' : 'cursor-pointer'
                    }`}
                    onClick={() => {
                      if (!hasChildren) {
                        onUpdateChecklist(habit.id, !isDone);
                      }
                    }}
                  >
                    <div className="w-8 h-8 flex items-center justify-center text-xl">{habit.icon}</div>
                    <div className="flex-1 text-sm text-gray-800 font-medium">{habit.label}</div>
                    <div className={`${isDone ? 'text-teal-600' : 'text-gray-400'}`}>
                      {isDone ? <CheckCircle size={20} /> : <Circle size={20} />}
                    </div>
                  </div>
                  {hasChildren && (
                    <div className="pl-11 pr-4 pb-3 space-y-2">
                      {habit.children!.map((child) => {
                        const childDone = !!stats.checklist[child.id];
                        return (
                          <button
                            key={child.id}
                            onClick={() => onUpdateChecklist(child.id, !childDone)}
                            className={`w-full flex items-center justify-between rounded-2xl border px-3 py-2 text-left text-sm ${
                              childDone ? 'border-teal-200 bg-teal-50 text-gray-900' : 'border-gray-200 hover:border-gray-300'
                            }`}
                          >
                            <span className="flex items-center gap-2">
                              <span className="text-base">{child.icon}</span>
                              {child.label}
                            </span>
                            <span className={`${childDone ? 'text-teal-600' : 'text-gray-400'}`}>
                              {childDone ? <CheckCircle size={16} /> : <Circle size={16} />}
                            </span>
                          </button>
                        );
                      })}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Workouts List (Filtered) */}
      <div className="mb-4 flex-1">
        <div className="bg-white rounded-3xl p-6 shadow border border-gray-200 min-h-[300px]">
          <h3 className="text-gray-500 text-sm font-medium mb-4">Recommended Workouts</h3>

          <div className="space-y-3">
            {recommendedExercises.map((ex, idx) => {
              const icons = [Footprints, Flame, Play];
              const Icon = icons[idx % icons.length];
              const colors = ['text-teal-600', 'text-orange-400', 'text-sky-500'];
              const color = colors[idx % colors.length];

              return (
                <button
                  key={ex.id}
                  onClick={() => onStartExercise(ex.id)}
                  className="w-full flex items-center justify-between bg-white border border-gray-200 p-4 rounded-2xl group hover:bg-gray-50 transition-colors"
                >
                  <div className="flex items-center gap-4">
                    <div className={`w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center ${color}`}>
                      <Icon size={20} fill={idx === 2 ? 'currentColor' : 'none'} />
                    </div>
                    <div className="text-left">
                      <div className="font-bold text-sm text-gray-800">{ex.title}</div>
                      <div className="text-xs text-gray-500">
                        {ex.durationMin} min {'\u2022'} {ex.tags[0]}
                      </div>
                    </div>
                  </div>
                  <ChevronRight size={20} className="text-gray-400 group-hover:text-gray-700" />
                </button>
              );
            })}

            {recommendedExercises.length === 0 && (
              <div className="text-center text-gray-500 py-4 text-sm">No specific exercises found.</div>
            )}
          </div>
        </div>
      </div>

      {/* Personalized Rehab Protocol */}
      <div className="mb-6">
        <div className="bg-white rounded-3xl p-6 shadow border border-gray-200">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
            <div>
              <h3 className="text-lg font-semibold text-gray-900">Personalized Rehab Plan</h3>
              <p className="text-sm text-gray-500">Choose a pain focus and difficulty to review the daily protocol.</p>
            </div>
            <div className="flex flex-wrap gap-2">
              {MODE_OPTIONS.map((mode) => {
                const isActive = selectedMode === mode.id;
                return (
                  <button
                    key={mode.id}
                    onClick={() => {
                      setSelectedMode(mode.id);
                      updatePreference(selectedArea, mode.id);
                    }}
                    className={`px-4 py-2 rounded-full text-sm font-semibold border transition ${
                      isActive ? 'bg-teal-600 text-white border-teal-600' : 'bg-white text-gray-600 border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    {mode.label}
                  </button>
                );
              })}
            </div>
          </div>
          <div className="mt-4 flex flex-wrap gap-2">
            {AREA_OPTIONS.map((area) => {
              const active = selectedArea === area.id;
              return (
                <button
                  key={area.id}
                  onClick={() => {
                    setSelectedArea(area.id);
                    updatePreference(area.id, selectedMode);
                  }}
                  className={`px-4 py-2 rounded-2xl text-sm font-semibold border transition ${
                    active ? 'bg-gray-900 text-white border-gray-900' : 'bg-gray-100 text-gray-700 border-gray-200 hover:bg-gray-200'
                  }`}
                >
                  {area.label}
                </button>
              );
            })}
          </div>
          <div className="mt-6 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between text-sm text-gray-600">
            <div>
              <strong className="text-gray-900">{rehabPlan.title}</strong>
              <span className="block text-xs text-gray-500">{rehabPlan.summary}</span>
            </div>
            <div className="flex flex-wrap gap-4">
              <span>Frequency: <strong>{rehabPlan.meta.frequency}</strong></span>
              <span>Sets: <strong>{rehabPlan.meta.sets}</strong></span>
              <span>Reps: <strong>{rehabPlan.meta.reps}</strong></span>
            </div>
          </div>

          <div className="mt-6 grid gap-4 md:grid-cols-2">
            {rehabDifficulty.sections.map((section) => (
              <div key={`${section.title}-${selectedMode}`} className="border border-gray-200 rounded-2xl p-4">
                <div className="flex items-center justify-between mb-3">
                  <div>
                    <h4 className="font-semibold text-gray-900">{section.title}</h4>
                    {section.description && <p className="text-xs text-gray-500">{section.description}</p>}
                  </div>
                  <span className="text-xs uppercase tracking-wide text-teal-600">{rehabDifficulty.focus}</span>
                </div>
                <div className="space-y-3">
                  {section.exercises.map((exercise) => (
                    <div key={exercise.id} className="p-3 rounded-xl bg-gray-50 border border-gray-100 flex flex-col gap-2">
                      <div className="flex justify-between items-start gap-3">
                        <div>
                          <p className="font-semibold text-sm text-gray-900">{exercise.name}</p>
                          <p className="text-xs text-teal-600 font-medium">
                            {exercise.reps}
                            {exercise.hold ? ` • ${exercise.hold}` : ''}
                          </p>
                        </div>
                        <button
                          onClick={() => onStartExercise(exercise.id)}
                          className="text-xs font-semibold text-teal-700 bg-white border border-teal-200 rounded-full px-3 py-1 hover:bg-teal-600 hover:text-white transition"
                        >
                          Start Session
                        </button>
                      </div>
                      <p className="text-xs text-gray-600 leading-relaxed">{exercise.description}</p>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Summary Table */}
      <div className="mb-6">
        <div className="bg-white rounded-3xl p-6 shadow border border-gray-200">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-lg font-semibold text-gray-900">Protocol Quick Reference</h3>
              <p className="text-sm text-gray-500">Frequency, sets, reps, and staple moves per pain area.</p>
            </div>
          </div>
          <div className="overflow-x-auto">
            <table className="min-w-full text-sm">
              <thead>
                <tr className="text-left text-gray-500 border-b border-gray-100">
                  <th className="py-2 pr-4 font-medium">Pain Type</th>
                  <th className="py-2 pr-4 font-medium">Frequency</th>
                  <th className="py-2 pr-4 font-medium">Sets</th>
                  <th className="py-2 pr-4 font-medium">Reps</th>
                  <th className="py-2 font-medium">Common Exercises</th>
                </tr>
              </thead>
              <tbody>
                {PROTOCOL_SUMMARY_ROWS.map((row) => (
                  <tr key={row.id} className="border-b border-gray-50 text-gray-700">
                    <td className="py-3 pr-4 font-semibold text-gray-900">{row.label}</td>
                    <td className="py-3 pr-4">{row.frequency}</td>
                    <td className="py-3 pr-4">{row.sets}</td>
                    <td className="py-3 pr-4">{row.reps}</td>
                    <td className="py-3">{row.common}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
     
             

      {/* Meals Link (Visual only, to match design hierarchy) */}
      <div className="pb-4">
        <div className="flex justify-between items-center px-2 mb-2">
          <span className="text-gray-500 text-sm">Meals</span>
          <button onClick={onNavigateToMeals} className="text-teal-600 text-sm">
            View all
          </button>
        </div>
        <div className="flex gap-4 overflow-x-auto no-scrollbar pb-2">
          <div className="w-16 h-16 rounded-2xl bg-white border border-gray-200 flex items-center justify-center text-2xl">
            {'\u{1F957}'}
          </div>
          <div className="w-16 h-16 rounded-2xl bg-white border border-gray-200 flex items-center justify-center text-2xl">
            {'\u{1F357}'}
          </div>
          <div className="w-16 h-16 rounded-2xl bg-white border border-gray-200 flex items-center justify-center text-2xl">
            {'\u{1F373}'}
          </div>
          <div className="w-16 h-16 rounded-2xl bg-white border border-gray-200 flex items-center justify-center text-2xl">
            {'\u{1F951}'}
          </div>
        </div>
      </div>
    </div>
  );
};

export default HomeScreen;
