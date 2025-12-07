import React, { useState } from 'react';
import { AlertTriangle, ArrowRight, Camera, ClipboardList, Loader2, Pill } from 'lucide-react';
import { specialistSummary, getSpecialistQuestions } from '../services/geminiService';

type SpecialistView = 'MENU' | 'MODE_PICK' | 'CAMERA' | 'QUESTIONNAIRE' | 'RESULT';

type QuestionType = 'scale' | 'choice' | 'text';

interface QuestionTemplate {
    id: string;
    type: QuestionType;
    options?: string[];
    defaultPrompt: string;
}

interface SpecialistQuestion extends QuestionTemplate {
    prompt: string;
}

interface MedicationAdvice {
    name: string;
    detail: string;
}

const QUESTION_TEMPLATES: QuestionTemplate[] = [
    {
        id: 'painScale',
        type: 'scale',
        defaultPrompt: 'On a scale of 0-10, how intense is your {area} pain right now?',
    },
    {
        id: 'trigger',
        type: 'choice',
        options: [
            'After waking up',
            'After sitting 30+ min',
            'During workouts',
            'By end of the day',
        ],
        defaultPrompt: 'When does your {area} discomfort spike the most?',
    },
    {
        id: 'nerve',
        type: 'choice',
        options: ['No, never', 'Occasionally', 'Frequently'],
        defaultPrompt: 'Do you notice tingling, numbness, or weakness spreading away from your {area} region?',
    },
    {
        id: 'selfCare',
        type: 'text',
        defaultPrompt: 'What treatments, stretches, or medications have you already tried for your {area} symptoms?',
    },
];

const MEDICATION_LIBRARY: Record<string, MedicationAdvice[]> = {
    Neck: [
        {
            name: 'Topical diclofenac 1% gel',
            detail: 'Thin layer up to four times daily to calm facet joint irritation. Avoid broken skin.',
        },
        {
            name: 'OTC NSAID (Ibuprofen 200 mg)',
            detail: 'Short 3-5 day course with food to limit inflammation. Skip if kidney, ulcer, or heart issues.',
        },
    ],
    Shoulder: [
        {
            name: 'Topical menthol or lidocaine patch',
            detail: 'Provides temporary analgesia for rotator cuff or bursitis flares.',
        },
        {
            name: 'Acetaminophen 500 mg',
            detail: 'Use up to every 6 hours (max 3,000 mg/day) when NSAIDs are not tolerated.',
        },
    ],
    Knee: [
        {
            name: 'Naproxen sodium 220 mg',
            detail: 'Longer acting NSAID that can calm synovitis. Take with meals and adequate hydration.',
        },
        {
            name: 'Glucosamine-chondroitin supplement',
            detail: 'Daily course may support joint cartilage over 6-8 weeks. Stop if stomach upset occurs.',
        },
    ],
    DEFAULT: [
        {
            name: 'OTC NSAID (Ibuprofen or Naproxen)',
            detail: 'Short courses help most musculoskeletal flare-ups. Always take with food and follow label dosing.',
        },
        {
            name: 'Topical diclofenac gel',
            detail: 'Localized anti-inflammatory relief with minimal systemic exposure.',
        },
    ],
};

const SpecialistScreen: React.FC = () => {
    const [view, setView] = useState<SpecialistView>('MENU');
    const [area, setArea] = useState('');
    const [loading, setLoading] = useState(false);
    const [questionLoading, setQuestionLoading] = useState(false);
    const [result, setResult] = useState('');
    const [questions, setQuestions] = useState<SpecialistQuestion[]>([]);
    const [answers, setAnswers] = useState<Record<string, string>>({});
    const [cameraCompleted, setCameraCompleted] = useState(false);
    const [cameraNotes, setCameraNotes] = useState('');
    const [medications, setMedications] = useState<MedicationAdvice[]>([]);

    const runAssessment = async (selectedArea: string) => {
        setArea(selectedArea);
        setView('MODE_PICK');
        setCameraCompleted(false);
        setCameraNotes('');
        setAnswers({});
        setResult('');
        setMedications(MEDICATION_LIBRARY[selectedArea] || MEDICATION_LIBRARY.DEFAULT);

        setQuestionLoading(true);
        try {
            const aiPrompts = await getSpecialistQuestions(selectedArea);
            const built = QUESTION_TEMPLATES.map((template, index) => ({
                ...template,
                prompt: (aiPrompts[index] || template.defaultPrompt).replace('{area}', selectedArea.toLowerCase()),
            }));
            setQuestions(built);
        } catch (error) {
            setQuestions(
                QUESTION_TEMPLATES.map((template) => ({
                    ...template,
                    prompt: template.defaultPrompt.replace('{area}', selectedArea.toLowerCase()),
                }))
            );
        } finally {
            setQuestionLoading(false);
        }
    };

    const handleAnswerChange = (id: string, value: string) => {
        setAnswers((prev) => ({ ...prev, [id]: value }));
    };

    const submitAssessment = async () => {
        if (!area) return;
        setLoading(true);
        const structuredAnswers: Record<string, string> = {};
        questions.forEach((q) => {
            structuredAnswers[q.prompt] = answers[q.id] || 'Not provided';
        });
        structuredAnswers.cameraScan = cameraCompleted
            ? `Camera scan completed. Notes: ${cameraNotes || 'Normal range of motion with mild stiffness.'}`
            : 'Camera scan skipped.';

        const summary = await specialistSummary(area, structuredAnswers);
        setResult(summary);
        setLoading(false);
        setView('RESULT');
    };

    const baseContainer = "w-full max-w-4xl mx-auto px-4 sm:px-6 lg:px-10";

    const cameraView = (
        <div className={`${baseContainer} pt-10`}>
            <button onClick={() => setView('MODE_PICK')} className="text-sm text-gray-500 mb-4">
                &larr; Back
            </button>
            <h2 className="text-2xl font-bold mb-2">Camera Mobility Scan ({area})</h2>
            <p className="text-gray-500 mb-4">
                Position your device so the affected region is visible. Follow the slow movement prompts below or skip this step anytime.
            </p>
            <div className="bg-gray-900 rounded-2xl h-60 flex flex-col items-center justify-center text-white mb-4">
                <Camera size={42} className="opacity-60 mb-4" />
                <p className="font-semibold">Camera optional</p>
                <p className="text-sm text-gray-300">Hold each pose for 5 seconds</p>
            </div>
            <div className="space-y-3 text-gray-700 mb-4">
                <div className="p-3 bg-gray-50 rounded-xl border border-gray-100">
                    1. Turn or bend slowly until you feel the first sign of discomfort.
                </div>
                <div className="p-3 bg-gray-50 rounded-xl border border-gray-100">
                    2. Hold the end range for a breath. Note any shakiness or compensation.
                </div>
                <div className="p-3 bg-gray-50 rounded-xl border border-gray-100">
                    3. Repeat twice to confirm if pain eases or worsens.
                </div>
            </div>
            <label className="block mb-2 text-sm font-semibold text-gray-700">Quick notes</label>
            <textarea
                className="w-full rounded-2xl border border-gray-200 p-3 resize-none h-28 focus:ring-2 focus:ring-teal-500 outline-none"
                placeholder="Example: Able to rotate 60 degrees before pulling sensation."
                value={cameraNotes}
                onChange={(e) => setCameraNotes(e.target.value)}
            />
            <div className="mt-6 space-y-3">
                <button
                    onClick={() => {
                        setCameraCompleted(true);
                        if (!cameraNotes) {
                            setCameraNotes('Completed guided ROM check without major compensation.');
                        }
                        setView('MODE_PICK');
                    }}
                    className="w-full py-4 bg-teal-600 text-white rounded-2xl font-semibold shadow-lg"
                >
                    Save camera findings
                </button>
                <button
                    onClick={() => {
                        setCameraCompleted(false);
                        setView('QUESTIONNAIRE');
                    }}
                    className="w-full py-3 text-teal-600 rounded-2xl font-semibold border border-teal-200"
                >
                    Skip camera, answer questions
                </button>
            </div>
        </div>
    );

    const questionnaireView = (
        <div className={`${baseContainer} pt-10`}>
            <button onClick={() => setView('MODE_PICK')} className="text-sm text-gray-500 mb-4">
                &larr; Back
            </button>
            <h2 className="text-2xl font-bold mb-2">Symptom Questionnaire</h2>
            <p className="text-gray-500 mb-6">
                These questions are generated by our AI specialist to capture the nuances of your {area.toLowerCase()} symptoms.
            </p>
            {questionLoading ? (
                <div className="flex items-center justify-center h-40 text-gray-500">
                    <Loader2 className="animate-spin mr-2" /> Loading questions...
                </div>
            ) : (
                <div className="space-y-5">
                    {questions.map((q) => (
                        <div key={q.id} className="p-4 rounded-2xl bg-white shadow border border-gray-100">
                            <p className="font-medium text-gray-800 mb-3">{q.prompt}</p>
                            {q.type === 'scale' && (
                                <div>
                                    <input
                                        type="range"
                                        min={0}
                                        max={10}
                                        value={answers[q.id] ?? '5'}
                                        onChange={(e) => handleAnswerChange(q.id, e.target.value)}
                                        className="w-full accent-teal-500"
                                    />
                                    <div className="text-sm text-gray-500 mt-1">
                                        Current rating: {answers[q.id] ?? '5'}
                                    </div>
                                </div>
                            )}
                            {q.type === 'choice' && q.options && (
                                <div className="grid grid-cols-2 gap-2">
                                    {q.options.map((option) => {
                                        const selected = answers[q.id] === option;
                                        return (
                                            <button
                                                type="button"
                                                key={option}
                                                onClick={() => handleAnswerChange(q.id, option)}
                                                className={`text-sm px-3 py-2 rounded-xl border ${
                                                    selected
                                                        ? 'border-teal-500 bg-teal-50 text-teal-700'
                                                        : 'border-gray-200 text-gray-600'
                                                }`}
                                            >
                                                {option}
                                            </button>
                                        );
                                    })}
                                </div>
                            )}
                            {q.type === 'text' && (
                                <textarea
                                    className="w-full rounded-xl border border-gray-200 p-3 resize-none focus:ring-2 focus:ring-teal-500 outline-none"
                                    rows={4}
                                    placeholder="Describe what has and has not helped."
                                    value={answers[q.id] ?? ''}
                                    onChange={(e) => handleAnswerChange(q.id, e.target.value)}
                                />
                            )}
                        </div>
                    ))}
                </div>
            )}

            <button
                onClick={submitAssessment}
                disabled={loading || questionLoading}
                className="w-full mt-8 py-4 bg-teal-600 text-white rounded-2xl font-semibold shadow-lg disabled:opacity-60"
            >
                {loading ? 'Analyzing...' : 'Complete Specialist Assessment'}
            </button>
        </div>
    );

    if (view === 'MENU') {
        return (
            <div className={`${baseContainer} pb-24 pt-10 space-y-6`}>
                <h1 className="text-2xl font-bold">Specialist Hub</h1>
                <p className="text-gray-500">AI-guided assessments with optional camera analysis.</p>

                <div className="space-y-4">
                    <button
                        onClick={() => runAssessment('Neck')}
                        className="w-full bg-white p-5 rounded-2xl shadow-sm border border-gray-200 text-left flex justify-between items-center group active:scale-95 transition-all"
                    >
                        <div>
                            <div className="font-bold text-lg text-gray-800">Neck & Shoulder</div>
                            <div className="text-sm text-gray-500">Desk tightness, cervicogenic headaches</div>
                        </div>
                        <div className="bg-gray-100 p-2 rounded-full group-hover:bg-teal-100 group-hover:text-teal-600 transition-colors">
                            <ArrowRight size={20} />
                        </div>
                    </button>
                    <button
                        onClick={() => runAssessment('Knee')}
                        className="w-full bg-white p-5 rounded-2xl shadow-sm border border-gray-200 text-left flex justify-between items-center group active:scale-95 transition-all"
                    >
                        <div>
                            <div className="font-bold text-lg text-gray-800">Knee Health</div>
                            <div className="text-sm text-gray-500">Running, squatting, or ACL recovery</div>
                        </div>
                        <div className="bg-gray-100 p-2 rounded-full group-hover:bg-teal-100 group-hover:text-teal-600 transition-colors">
                            <ArrowRight size={20} />
                        </div>
                    </button>
                    <button
                        onClick={() => runAssessment('Shoulder')}
                        className="w-full bg-white p-5 rounded-2xl shadow-sm border border-gray-200 text-left flex justify-between items-center group active:scale-95 transition-all"
                    >
                        <div>
                            <div className="font-bold text-lg text-gray-800">Upper Back & Shoulder</div>
                            <div className="text-sm text-gray-500">Rotator cuff or posture fatigue</div>
                        </div>
                        <div className="bg-gray-100 p-2 rounded-full group-hover:bg-teal-100 group-hover:text-teal-600 transition-colors">
                            <ArrowRight size={20} />
                        </div>
                    </button>
                </div>

                <div className="mt-4 bg-blue-50 p-4 rounded-xl flex gap-3 items-start">
                    <AlertTriangle className="text-blue-600 shrink-0" size={20} />
                    <p className="text-sm text-blue-800">
                        This feature provides educational insights only. It is <strong>not a medical diagnosis</strong>. Always seek in-person care for severe or persistent pain.
                    </p>
                </div>
            </div>
        );
    }

    if (view === 'MODE_PICK') {
        return (
            <div className={`${baseContainer} pt-10 space-y-6`}>
                <button onClick={() => setView('MENU')} className="text-sm text-gray-500">
                    &larr; Back
                </button>
                <div className="bg-white rounded-3xl p-5 shadow-sm border border-gray-100">
                    <p className="text-sm text-gray-500 mb-1">Selected area</p>
                    <h2 className="text-2xl font-bold text-gray-900">{area}</h2>
                    <p className="text-gray-500 text-sm mt-2">
                        Complete a quick camera scan, fill out the questionnaire, or do both for richer insights.
                    </p>
                    {cameraCompleted && (
                        <div className="mt-3 px-3 py-2 rounded-xl bg-teal-50 text-teal-700 text-sm font-medium inline-block">
                            Camera notes saved
                        </div>
                    )}
                </div>
                <div className="space-y-4">
                    <button
                        onClick={() => setView('CAMERA')}
                        className="w-full rounded-2xl border border-gray-200 p-4 flex items-center gap-4 bg-white shadow-sm"
                    >
                        <div className={`w-12 h-12 rounded-2xl flex items-center justify-center ${cameraCompleted ? 'bg-teal-100 text-teal-600' : 'bg-gray-100 text-gray-500'}`}>
                            <Camera />
                        </div>
                        <div className="text-left">
                            <p className="text-lg font-semibold text-gray-900">Camera posture scan</p>
                            <p className="text-sm text-gray-500">Optional motion capture with skip option</p>
                        </div>
                        <ArrowRight className="ml-auto text-gray-400" size={18} />
                    </button>
                    <button
                        onClick={() => setView('QUESTIONNAIRE')}
                        className="w-full rounded-2xl border border-gray-200 p-4 flex items-center gap-4 bg-white shadow-sm"
                    >
                        <div className="w-12 h-12 rounded-2xl flex items-center justify-center bg-teal-50 text-teal-600">
                            <ClipboardList />
                        </div>
                        <div className="text-left">
                            <p className="text-lg font-semibold text-gray-900">Symptom questionnaire</p>
                            <p className="text-sm text-gray-500">
                                {questionLoading ? 'Fetching AI questions...' : 'Clinician-grade prompts from our AI'}
                            </p>
                        </div>
                        <ArrowRight className="ml-auto text-gray-400" size={18} />
                    </button>
                </div>
            </div>
        );
    }

    if (view === 'CAMERA') {
        return cameraView;
    }

    if (view === 'QUESTIONNAIRE') {
        return questionnaireView;
    }

    return (
        <div className={`${baseContainer} pt-10 space-y-6`}>
            <h2 className="text-2xl font-bold text-teal-700">Assessment result</h2>
            <div className="bg-white p-6 rounded-3xl shadow border border-gray-100">
                <p className="whitespace-pre-line text-gray-700">{result}</p>
            </div>
            <div className="bg-gray-50 p-5 rounded-3xl border border-gray-200">
                <div className="flex items-center gap-2 mb-3">
                    <Pill className="text-teal-600" size={18} />
                    <h3 className="text-gray-900 font-semibold">Medication ideas to discuss</h3>
                </div>
                <div className="space-y-3">
                    {medications.map((med) => (
                        <div key={med.name} className="p-3 rounded-2xl bg-white border border-gray-100">
                            <p className="font-semibold text-gray-900">{med.name}</p>
                            <p className="text-sm text-gray-600">{med.detail}</p>
                        </div>
                    ))}
                </div>
                <p className="text-xs text-gray-500 mt-3">
                    Always confirm dosage, allergies, and interactions with your doctor or pharmacist before starting medication.
                </p>
            </div>
            <button
                onClick={() => setView('MENU')}
                className="w-full py-4 bg-gray-200 text-gray-800 rounded-2xl font-bold"
            >
                Start another assessment
            </button>
        </div>
    );
};

export default SpecialistScreen;
