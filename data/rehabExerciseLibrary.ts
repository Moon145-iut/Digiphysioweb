import { ExerciseDef } from '../types';
import { REHAB_PROTOCOLS } from './rehabProtocols';

const DEFAULT_THUMBNAIL = 'https://images.unsplash.com/photo-1518611012118-696072aa579a?auto=format&fit=crop&w=600&q=80';

const library: Record<string, ExerciseDef> = {};

Object.values(REHAB_PROTOCOLS).forEach((protocol) => {
  Object.entries(protocol.difficulty).forEach(([difficultyKey, plan]) => {
    plan.sections.forEach((section) => {
      section.exercises.forEach((exercise) => {
        if (library[exercise.id]) return;
        library[exercise.id] = {
          id: exercise.id,
          title: exercise.name,
          description: exercise.description,
          durationMin: exercise.durationMin ?? 3,
          tags: [
            protocol.title.split('–')[0].trim(),
            difficultyKey.toUpperCase(),
            section.title,
          ],
          thumbnail: exercise.imageUrl || DEFAULT_THUMBNAIL,
          targetJoints: exercise.targetJoints || ['shoulder', 'hip'],
        };
      });
    });
  });
});

export const REHAB_EXERCISE_LIBRARY = library;

export const getRehabExerciseDef = (id: string): ExerciseDef | undefined => {
  return REHAB_EXERCISE_LIBRARY[id];
};
