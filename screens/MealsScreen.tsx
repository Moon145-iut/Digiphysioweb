
import React, { useState } from 'react';
import { ChevronLeft, Play, Sparkles, Flame, Dumbbell, Droplet, ChevronRight, X, Utensils, Camera, Wheat } from 'lucide-react';
import { MealDef, Ingredient, FoodAnalysisResult } from '../types';
import { MEALS_DATA } from '../constants';
import { analyzeFoodPhoto } from '../services/geminiService';

interface MealsScreenProps {
  onBack?: () => void;
  setContext: (ctx: string) => void;
}

const MealsScreen: React.FC<MealsScreenProps> = ({ onBack, setContext }) => {
  const [selectedCategory, setSelectedCategory] = useState('Salmon');
  const [selectedMeal, setSelectedMeal] = useState<MealDef | null>(null);

  // AI Food Analysis State
  const [analyzingFood, setAnalyzingFood] = useState(false);
  const [foodResult, setFoodResult] = useState<FoodAnalysisResult | null>(null);
  const [foodImage, setFoodImage] = useState<string | null>(null);

  // Derive categories from data safely
  const categories = Array.from(new Set(MEALS_DATA.map(m => m.category)));

  const handleMealClick = (meal: MealDef) => {
    setSelectedMeal(meal);
    setContext(`Viewing meal recipe: ${meal.name}. Calories: ${meal.calories}.`);
  };

  const closeDetail = () => {
    setSelectedMeal(null);
    setContext("Browsing meals");
  };

  const handleFoodUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setAnalyzingFood(true);
      const reader = new FileReader();
      reader.onloadend = async () => {
        const base64 = reader.result as string;
        setFoodImage(base64); // Store image for display
        const result = await analyzeFoodPhoto(base64);
        setFoodResult(result);
        setAnalyzingFood(false);
        setContext(`Analyzed food: ${result.name}. Calories: ${result.calories}`);
      };
      reader.readAsDataURL(e.target.files[0]);
    }
  };

  const closeFoodModal = () => {
    setFoodResult(null);
    setFoodImage(null);
    setContext("Browsing meals");
  };

  const filteredMeals = MEALS_DATA.filter(m => m.category === selectedCategory);

  return (
    <div className="min-h-screen bg-white text-gray-900 pb-28 font-sans relative w-full max-w-5xl mx-auto px-4 sm:px-6 lg:px-12">
      
      {/* MEAL DETAIL OVERLAY */}
      {selectedMeal && (
        <div className="fixed inset-0 z-50 bg-white/95 backdrop-blur-sm overflow-y-auto animate-fade-in px-4">
          <div className="max-w-4xl mx-auto">
             {/* Header Image */}
             <div className="relative h-72 w-full">
                <img src={selectedMeal.image} className="w-full h-full object-cover" alt={selectedMeal.name} />
                <div className="absolute inset-0 bg-gradient-to-b from-transparent to-white"></div>
                <button onClick={closeDetail} className="absolute top-4 left-4 p-2 bg-white/80 backdrop-blur-md rounded-full text-gray-800 hover:bg-white transition-colors border border-gray-200">
                    <ChevronLeft size={24} />
                </button>
             </div>

             <div className="px-6 -mt-12 relative z-10 pb-10">
                <div className="flex gap-2 mb-2">
                    {selectedMeal.tags.map(tag => (
                        <span key={tag} className="px-3 py-1 bg-gray-100 rounded-full text-[10px] font-bold uppercase tracking-wider text-teal-600">
                            {tag}
                        </span>
                    ))}
                </div>
                <h1 className="text-3xl font-bold mb-6 leading-tight">{selectedMeal.name}</h1>

                {/* Nutritional Value */}
                <div className="bg-white rounded-3xl p-5 mb-6 shadow border border-gray-200">
                    <div className="flex justify-between items-center mb-4">
                        <h3 className="font-bold text-lg text-teal-600">Nutritional Value</h3>
                        <Sparkles size={16} className="text-teal-600" />
                    </div>
                    
                    <div className="space-y-4 text-sm">
                        <div className="flex justify-between items-center border-b border-gray-200 pb-2">
                             <div className="flex items-center gap-3 text-gray-600">
                                 <Flame size={18} className="text-orange-500" /> Calories
                             </div>
                             <span className="font-mono font-bold text-lg">{selectedMeal.calories}</span>
                        </div>
                        <div className="flex justify-between items-center border-b border-gray-200 pb-2">
                             <div className="flex items-center gap-3 text-gray-600">
                                 <Dumbbell size={18} className="text-blue-500" /> Protein
                             </div>
                             <span className="font-mono font-bold text-lg">{selectedMeal.protein}</span>
                        </div>
                        <div className="flex justify-between items-center border-b border-gray-200 pb-2">
                             <div className="flex items-center gap-3 text-gray-600">
                                 <Droplet size={18} className="text-yellow-500" /> Fat
                             </div>
                             <span className="font-mono font-bold text-lg">{selectedMeal.fat}</span>
                        </div>
                        <div className="flex justify-between items-center">
                             <div className="flex items-center gap-3 text-gray-600">
                                 <Utensils size={18} className="text-amber-600" /> Carbs
                             </div>
                             <span className="font-mono font-bold text-lg">{selectedMeal.carbs}</span>
                        </div>
                    </div>

                    <div className="mt-4 pt-4 border-t border-gray-200">
                         <div className="text-xs text-gray-500 mb-2">Instructions</div>
                         <p className="text-gray-600 text-sm leading-relaxed">
                            {selectedMeal.instructions.join(' ')}
                         </p>
                    </div>
                </div>

                {/* Ingredients */}
                <div className="mb-6">
                    <div className="flex justify-between items-center mb-3">
                        <h3 className="font-bold text-lg">Ingredients</h3>
                        <ChevronRight size={20} className="text-gray-500" />
                    </div>
                    <div className="space-y-2">
                        {selectedMeal.ingredients.map((ing, idx) => (
                            <div key={idx} className="flex items-center justify-between p-3 bg-white rounded-xl border border-gray-200 shadow-sm">
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center text-xs font-bold text-gray-500">
                                        {idx + 1}
                                    </div>
                                    <span className="font-medium text-gray-800 capitalize">{ing.name}</span>
                                </div>
                                <span className="text-gray-500 text-sm">{ing.amount}</span>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Video Tutorial Placeholder */}
                <div className="relative rounded-2xl overflow-hidden h-48 bg-gray-900 border border-gray-200 group cursor-pointer">
                    <img src={selectedMeal.image} className="w-full h-full object-cover opacity-70" alt="Video" />
                    <div className="absolute inset-0 flex flex-col items-center justify-center">
                        <div className="w-12 h-12 bg-teal-500 rounded-full flex items-center justify-center text-gray-900 mb-2 shadow-lg group-hover:scale-110 transition-transform">
                            <Play fill="currentColor" size={20} className="ml-1" />
                        </div>
                        <span className="font-bold text-white shadow-black drop-shadow-md">Video Tutorial</span>
                    </div>
                    <div className="absolute bottom-2 right-2 bg-black/30 px-2 py-1 rounded text-xs font-mono text-gray-900">{selectedMeal.time}</div>
                </div>

             </div>
          </div>
        </div>
      )}

      {/* AI SCAN RESULT OVERLAY */}
      {foodResult && (
        <div className="fixed inset-0 z-50 bg-white/95 backdrop-blur-sm flex flex-col animate-fade-in overflow-y-auto px-4">
          <div className="max-w-4xl mx-auto">
            {/* Image Header */}
            <div className="relative h-72 w-full shrink-0">
                 {foodImage && <img src={foodImage} className="w-full h-full object-cover" alt="Meal" />}
                 <div className="absolute inset-0 bg-gradient-to-b from-transparent to-white"></div>
                 <button onClick={closeFoodModal} className="absolute top-4 left-4 p-2 bg-white/80 border border-gray-200 backdrop-blur-md rounded-full text-gray-700">
                     <X size={24} />
                 </button>
            </div>

            <div className="px-6 -mt-12 relative z-10 pb-10">
                <h1 className="text-3xl font-bold mb-2">{foodResult.name}</h1>
                <div className="flex gap-2 mb-6">
                    {foodResult.tags.map(tag => (
                        <span key={tag} className="px-3 py-1 bg-gray-100 border border-gray-200 rounded-full text-xs text-gray-600">
                            {tag}
                        </span>
                    ))}
                </div>

                {/* Nutritional Value Card */}
                <div className="bg-white rounded-2xl p-4 mb-6 border border-gray-200 shadow-sm">
                    <div className="flex justify-between items-center mb-4">
                        <h3 className="font-bold text-lg text-teal-600">Nutritional Value</h3>
                        <Sparkles size={16} className="text-teal-600" />
                    </div>
                    
                    <div className="space-y-3">
                        <div className="flex justify-between items-center border-b border-gray-200 pb-2">
                             <div className="flex items-center gap-2 text-gray-600">
                                 <Flame size={16} className="text-orange-500" /> Calories
                             </div>
                             <span className="font-mono font-bold">{foodResult.calories}</span>
                        </div>
                        <div className="flex justify-between items-center border-b border-gray-200 pb-2">
                             <div className="flex items-center gap-2 text-gray-600">
                                 <Dumbbell size={16} className="text-blue-500" /> Protein
                             </div>
                             <span className="font-mono font-bold">{foodResult.protein}</span>
                        </div>
                        <div className="flex justify-between items-center border-b border-gray-200 pb-2">
                             <div className="flex items-center gap-2 text-gray-600">
                                 <Droplet size={16} className="text-yellow-500" /> Fat
                             </div>
                             <span className="font-mono font-bold">{foodResult.fat}</span>
                        </div>
                        <div className="flex justify-between items-center">
                             <div className="flex items-center gap-2 text-gray-600">
                                 <Wheat size={16} className="text-amber-600" /> Carbs
                             </div>
                             <span className="font-mono font-bold">{foodResult.carbs}</span>
                        </div>
                    </div>
                </div>

                {/* Ingredients */}
                <div className="mb-6">
                    <div className="flex justify-between items-center mb-3">
                        <h3 className="font-bold text-lg">Ingredients</h3>
                        <ChevronRight size={20} className="text-gray-500" />
                    </div>
                    <div className="bg-white rounded-2xl p-2 space-y-1">
                        {foodResult.ingredients.map((ing, idx) => (
                            <div key={idx} className="flex items-center gap-3 p-3 bg-white rounded-xl">
                                <div className="w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center text-xs font-bold text-gray-500">
                                    {idx + 1}
                                </div>
                                <span className="font-medium text-gray-700 capitalize">{ing}</span>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Health Tips / Instructions */}
                <div className="mb-6">
                     <h3 className="font-bold text-lg mb-3">Specialist Tips</h3>
                     <div className="bg-teal-50 border border-teal-100 rounded-2xl p-4 text-teal-900 text-sm leading-relaxed">
                         <div className="flex items-center gap-2 mb-2 text-teal-700 font-bold">
                             <Sparkles size={16} /> FlexiPhysio AI
                         </div>
                         {foodResult.healthTips}
                     </div>
                </div>
            </div>
          </div>
        </div>
      )}

      {/* Main List Screen */}
      <div className="pt-12">
        <h1 className="text-2xl font-bold mb-1">Meals!</h1>
        <p className="text-gray-500 text-sm mb-6">Choose From Any of the Given Categories!</p>

        {/* Scan Button Card */}
        <label className="block mb-6 relative h-32 rounded-3xl border-2 border-dashed border-[#bef264]/50 bg-white flex flex-col items-center justify-center cursor-pointer hover:bg-gray-100 transition-colors group">
             <div className="w-12 h-12 bg-[#bef264] rounded-full flex items-center justify-center text-[#141519] mb-2 shadow-lg group-hover:scale-110 transition-transform">
                 {analyzingFood ? <div className="animate-spin w-6 h-6 border-2 border-[#141519] border-t-transparent rounded-full"/> : <Camera size={24} />}
             </div>
             <span className="text-[#bef264] font-bold text-sm">{analyzingFood ? "Analyzing..." : "Scan Meal"}</span>
             <span className="text-gray-500 text-xs">AI Nutritional Analysis</span>
             <input type="file" accept="image/*" className="hidden" onChange={handleFoodUpload} disabled={analyzingFood} />
        </label>

        {/* Categories */}
        <div className="flex gap-3 overflow-x-auto no-scrollbar mb-6">
            {categories.map(cat => (
                <button 
                    key={cat}
                    onClick={() => setSelectedCategory(cat)}
                    className={`px-6 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-all ${
                        selectedCategory === cat 
                        ? 'bg-[#bef264] text-[#141519] font-bold' 
                        : 'bg-white text-gray-500 border border-gray-200'
                    }`}
                >
                    {cat}
                </button>
            ))}
        </div>

        {/* Vertical List */}
        <div className="space-y-4">
            {filteredMeals.map(meal => (
                <div 
                    key={meal.id} 
                    onClick={() => handleMealClick(meal)}
                    className="flex bg-white p-3 rounded-2xl border border-gray-200 gap-4 cursor-pointer active:scale-[0.98] transition-transform hover:border-[#bef264]/50"
                >
                    <img src={meal.image} className="w-24 h-24 rounded-xl object-cover bg-gray-800" alt={meal.name} />
                    <div className="flex-1 flex flex-col justify-center">
                        <h3 className="font-bold text-gray-900 text-base mb-1 leading-snug">{meal.name}</h3>
                        <div className="flex gap-2 mb-2">
                             {meal.tags.slice(0,2).map(t => (
                                 <span key={t} className="text-[10px] bg-gray-100 px-2 py-0.5 rounded text-gray-500">{t}</span>
                             ))}
                        </div>
                        <div className="flex items-center text-xs text-[#bef264] font-medium">
                            <Sparkles size={12} className="mr-1" /> {meal.calories} Cal
                        </div>
                    </div>
                    <div className="flex items-center pr-2">
                        <div className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center text-gray-900">
                            <ChevronRight size={16} />
                        </div>
                    </div>
                </div>
            ))}
            
            {/* Fallback if empty */}
            {filteredMeals.length === 0 && (
                <div className="text-center text-gray-500 py-10">
                    No meals found for this category.
                </div>
            )}
        </div>
      </div>
    </div>
  );
};

export default MealsScreen;
