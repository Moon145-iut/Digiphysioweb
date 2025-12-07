import { RehabProtocol, RehabArea } from '../types';

const demoImage = 'https://images.unsplash.com/photo-1579751626657-72bc17010498?auto=format&fit=crop&w=600&q=80';
const demoVideo = 'https://www.youtube.com/watch?v=HnC7T0G7JrE';

export const REHAB_PROTOCOLS: Record<RehabArea, RehabProtocol> = {
  neck: {
    id: 'neck',
    title: 'Neck Pain – Standard Physiotherapy Protocol',
    summary:
      'Blend daily mobility work with light isometrics and postural retraining. Progress from pain-calming drills to endurance and scapular strength.',
    meta: {
      frequency: '5–6 days/week',
      sets: '2–3',
      reps: '10–12',
      hold: '15–20 sec for stretches',
      commonExercises: 'Chin tucks, isometrics, scapular retraction, wall angels'
    },
    difficulty: {
      easy: {
        duration: '15–20 min',
        focus: 'Pain relief, gentle mobility, light activation',
        summary:
          'Ease stiffness and calm symptoms with supported chin tucks, upper trapezius and levator releases, plus short isometrics.',
        sections: [
          {
            title: 'Mobility & Stretching',
            exercises: [
              {
                id: 'neck_easy_chin_tucks',
                name: 'Chin Tucks',
                reps: '10 reps × 2',
                description: 'Seated or standing. Gently glide the chin backward to create a “double chin,” pause, then relax.',
                imageUrl: demoImage
              },
              {
                id: 'neck_easy_upper_trap',
                name: 'Upper Trapezius Stretch',
                reps: '20 sec × 2',
                description: 'Sit tall, gently pull head toward shoulder to lengthen the opposite side.',
                hold: 'Hold 20 seconds gently.',
                videoUrl: demoVideo
              },
              {
                id: 'neck_easy_levator',
                name: 'Levator Scapula Stretch',
                reps: '20 sec × 2',
                description: 'Rotate head 45° toward armpit, pull gently downward to stretch back of neck.',
                hold: '20 seconds each side'
              },
              {
                id: 'neck_easy_isometric_press',
                name: 'Isometric Neck Press',
                reps: '5 sec hold × 5 directions',
                description: 'Press forehead, back of head, and sides into your palm without movement.'
              }
            ]
          },
          {
            title: 'Light Strength',
            exercises: [
              {
                id: 'neck_easy_side_bend',
                name: 'Neck Side Bending Stretch',
                reps: '20 sec × 2',
                description: 'Keep shoulders relaxed, drop ear toward shoulder for gentle lengthening.'
              },
              {
                id: 'neck_easy_rotation',
                name: 'Neck Rotation Stretch',
                reps: '20 sec × 2',
                description: 'Rotate chin toward shoulder, hold when a mild stretch is felt.'
              }
            ]
          }
        ]
      },
      medium: {
        duration: '20–30 min',
        focus: 'Strengthening and functional stability',
        summary:
          'Stack scapular endurance and dynamic posture work after mobility to reinforce neck control for daily tasks.',
        sections: [
          {
            title: 'Strength & Posture',
            exercises: [
              {
                id: 'neck_medium_chin_tuck',
                name: 'Chin Tucks',
                reps: '12 reps × 3',
                description: 'Use a towel roll against a wall for added feedback and alignment.'
              },
              {
                id: 'neck_medium_scap_retraction',
                name: 'Shoulder Blade Squeeze',
                reps: '12 reps × 2',
                description: 'Pinch shoulder blades back/down without shrugging.'
              },
              {
                id: 'neck_medium_wall_angels',
                name: 'Wall Angels',
                reps: '10 reps × 2',
                description: 'Slide arms overhead while maintaining head and ribs against the wall.'
              }
            ]
          },
          {
            title: 'Mobility / Stretch',
            exercises: [
              {
                id: 'neck_medium_rotation',
                name: 'Neck Rotation Stretch',
                reps: '20 sec × 2',
                description: 'Slow, controlled rotations finishing with a gentle stretch.'
              },
              {
                id: 'neck_medium_wall_extension',
                name: 'Standing Back Extension',
                reps: '10 reps',
                description: 'Hands on low back, extend through upper thoracic spine to counter desk posture.'
              }
            ]
          }
        ]
      },
      hard: {
        duration: '30–40 min',
        focus: 'Strength + endurance for long days and training',
        summary:
          'Combine band-resisted chin work, wall angels, prone Y-T-W, and longer isometrics to bulletproof posture.',
        sections: [
          {
            title: 'Advanced Strength',
            exercises: [
              {
                id: 'neck_hard_band_chin',
                name: 'Chin Tucks with Resistance Band',
                reps: '12 reps × 3',
                description: 'Anchor light band at forehead, glide head backward maintaining neutral spine.'
              },
              {
                id: 'neck_hard_wall_angels',
                name: 'Wall Angels',
                reps: '15 reps × 3',
                description: 'Slow tempo, emphasize rib control and scapular glide.'
              },
              {
                id: 'neck_hard_prone_ytw',
                name: 'Prone Y-T-W',
                reps: '10 reps per position',
                description: 'Face down on bench, raise arms into Y, T, W shapes focusing on lower trap activation.'
              },
              {
                id: 'neck_hard_isometric_side',
                name: 'Isometric Side Neck Hold',
                reps: '10 sec × 5 each direction',
                description: 'Press head into hand or resistance band to build endurance.'
              }
            ]
          }
        ]
      }
    }
  },
  back: {
    id: 'back',
    title: 'Back Pain (Lower Back) – Standard Physiotherapy Protocol',
    summary:
      'Mix mobility (cat–cow, child’s pose) with core stability (bird dog, glute bridge) and gradual endurance planks.',
    meta: {
      frequency: '4–6 days/week',
      sets: '2–3',
      reps: '10–15',
      commonExercises: 'Cat–cow, pelvic tilts, bird dog, glute bridge'
    },
    difficulty: {
      easy: {
        duration: '15–20 min',
        focus: 'Calm tissue, restore gentle lumbar motion',
        summary:
          'Open up flexion/extension tolerance with cat–cow, pelvic tilts, and supported stretches.',
        sections: [
          {
            title: 'Mobility',
            exercises: [
              {
                id: 'back_easy_cat_cow',
                name: 'Cat–Cow',
                reps: '10–12 reps',
                description: 'Alternate rounding and extending spine with breath.'
              },
              {
                id: 'back_easy_pelvic_tilt',
                name: 'Pelvic Tilts',
                reps: '12 reps × 2',
                description: 'Supine, gently flatten and arch low back to groove lumbar control.'
              },
              {
                id: 'back_easy_child_pose',
                name: 'Child’s Pose',
                reps: '20 sec hold',
                description: 'Sink hips toward heels, lengthen through low back.'
              },
              {
                id: 'back_easy_knee_to_chest',
                name: 'Knee-to-Chest Stretch',
                reps: '20 sec each',
                description: 'Hug one knee toward chest, hold, switch sides.'
              }
            ]
          }
        ]
      },
      medium: {
        duration: '20–30 min',
        focus: 'Strengthening and functional control',
        summary:
          'Build glute/core activation with bridges, bird dogs, and dead bugs before progressing to planks.',
        sections: [
          {
            title: 'Strength / Core',
            exercises: [
              {
                id: 'back_medium_glute_bridge',
                name: 'Glute Bridge',
                reps: '12 reps × 3',
                description: 'Squeeze glutes at top, avoid lumbar overextension.'
              },
              {
                id: 'back_medium_bird_dog',
                name: 'Bird Dog',
                reps: '10 reps × 2',
                description: 'Reach opposite arm/leg in-line, pause for control.'
              },
              {
                id: 'back_medium_dead_bug',
                name: 'Dead Bug',
                reps: '10 reps × 2',
                description: 'Maintain rib-to-floor contact while lowering opposite limbs.'
              },
              {
                id: 'back_medium_hip_flexor',
                name: 'Hip Flexor Stretch',
                reps: '20 sec each',
                description: 'Half-kneeling, shift hips forward to lengthen front of hip.'
              },
              {
                id: 'back_medium_standing_extension',
                name: 'Standing Back Extension',
                reps: '10 reps',
                description: 'Hands on hips, gently extend through lumbar spine.'
              }
            ]
          }
        ]
      },
      hard: {
        duration: '30–40 min',
        focus: 'Strength + endurance',
        summary:
          'Challenge stability with bridge marches, bird dogs, planks, and controlled lumbar extension.',
        sections: [
          {
            title: 'Advanced Strength',
            exercises: [
              {
                id: 'back_hard_bridge_march',
                name: 'Glute Bridge March',
                reps: '12 reps × 3',
                description: 'Hold bridge and alternate marching legs without pelvic drop.'
              },
              {
                id: 'back_hard_bird_dog',
                name: 'Bird Dog (Slow)',
                reps: '10 reps × 3',
                description: 'Slow 3-second reach and return tempo.'
              },
              {
                id: 'back_hard_side_plank',
                name: 'Side Plank',
                reps: '20–30 sec × 2',
                description: 'Stack shoulders/hips, keep spine neutral.'
              },
              {
                id: 'back_hard_forearm_plank',
                name: 'Forearm Plank',
                reps: '20–30 sec × 2',
                description: 'Brace core, don’t let pelvis sag.'
              },
              {
                id: 'back_hard_superman',
                name: 'Modified Superman',
                reps: '10 reps × 2',
                description: 'Lift arms slightly off floor keeping glutes and core engaged.'
              },
              {
                id: 'back_hard_hamstring_stretch',
                name: 'Hamstring Stretch',
                reps: '25 sec hold',
                description: 'Use strap or towel to gently lengthen posterior chain.'
              }
            ]
          }
        ]
      }
    }
  },
  knee: {
    id: 'knee',
    title: 'Knee Pain – Standard Physiotherapy Protocol',
    summary:
      'Improve quadriceps activation, hip support, and controlled closed-chain strength with progressive drills.',
    meta: {
      frequency: '4–6 days/week',
      sets: '2–3',
      reps: '12–15',
      commonExercises: 'Quad sets, straight-leg raise, hamstring curls, mini squats'
    },
    difficulty: {
      easy: {
        duration: '15–20 min',
        focus: 'Pain phase: re-activate quads and stretch calf/hamstring',
        summary:
          'Gentle quad sets, straight leg raises, and stretches reduce swelling sensitivity and restore motion.',
        sections: [
          {
            title: 'Activation & Stretch',
            exercises: [
              {
                id: 'knee_easy_quad_set',
                name: 'Quad Sets',
                reps: '12 reps × 2',
                description: 'Press back of knee into towel, hold squeeze for 3 seconds.'
              },
              {
                id: 'knee_easy_slr',
                name: 'Straight Leg Raise',
                reps: '10 reps × 2',
                description: 'Keep knee locked, lift to 30–40°, lower slowly.'
              },
              {
                id: 'knee_easy_hamstring_stretch',
                name: 'Hamstring Stretch',
                reps: '20 sec each',
                description: 'Seated or lying, hinge forward until mild tension.'
              },
              {
                id: 'knee_easy_calf_stretch',
                name: 'Calf Stretch',
                reps: '20 sec',
                description: 'Use wall or step, keep heel down.'
              }
            ]
          }
        ]
      },
      medium: {
        duration: '20–30 min',
        focus: 'Strengthening and functional phase',
        summary:
          'Add resistance with light weights/bands, progress to mini squats and step ups for daily demands.',
        sections: [
          {
            title: 'Strength',
            exercises: [
              {
                id: 'knee_medium_slr_weighted',
                name: 'Straight Leg Raise (1–2 kg)',
                reps: '12 reps × 2',
                description: 'Add ankle weight if pain-free.'
              },
              {
                id: 'knee_medium_side_leg_raise',
                name: 'Side-Lying Leg Raise',
                reps: '12 reps × 2 each',
                description: 'Keep hips stacked, lift to hip height.'
              },
              {
                id: 'knee_medium_mini_squat',
                name: 'Mini Squat (40°)',
                reps: '10–12 reps × 2',
                description: 'Hands on countertop, shift hips back, keep knees in line with toes.'
              },
              {
                id: 'knee_medium_step_up',
                name: 'Low Step-Ups',
                reps: '10 reps each leg',
                description: 'Drive through heel, control lowering.'
              },
              {
                id: 'knee_medium_wall_sit',
                name: 'Wall Sit',
                reps: '20–25 sec × 2',
                description: 'Stop if pain >3/10, maintain even weight.'
              }
            ]
          }
        ]
      },
      hard: {
        duration: '30–40 min',
        focus: 'Strength + endurance',
        summary:
          'Progress to weighted single-leg drills, chair squats, lateral band walks, and longer wall sits.',
        sections: [
          {
            title: 'Advanced Strength & Control',
            exercises: [
              {
                id: 'knee_hard_weighted_slr',
                name: 'Weighted Straight Leg Raise (2–3 kg)',
                reps: '12 reps × 3',
                description: 'Slow eccentric lowering to build tendon tolerance.'
              },
              {
                id: 'knee_hard_single_bridge',
                name: 'Single-Leg Glute Bridge',
                reps: '10 reps × 2',
                description: 'Keep pelvis level, drive through heel.'
              },
              {
                id: 'knee_hard_chair_squat',
                name: 'Chair Squat (50–60°)',
                reps: '12–15 reps × 2',
                description: 'Tap chair lightly, stand with even weight.'
              },
              {
                id: 'knee_hard_lateral_band',
                name: 'Lateral Band Walk',
                reps: '10 steps × 2 each direction',
                description: 'Band above knees, maintain small squat.'
              },
              {
                id: 'knee_hard_step_down',
                name: 'Step-Down Control',
                reps: '10 reps × 2 each',
                description: 'Slow 3-count descent from low step.'
              },
              {
                id: 'knee_hard_wall_sit',
                name: 'Wall Sit',
                reps: '30–40 sec × 2',
                description: 'Aim for parallel thighs if pain-free.'
              }
            ]
          }
        ]
      }
    }
  }
};

export const PROTOCOL_SUMMARY_ROWS = Object.values(REHAB_PROTOCOLS).map((protocol) => ({
  id: protocol.id,
  label: protocol.title.split('–')[0].trim(),
  frequency: protocol.meta.frequency,
  sets: protocol.meta.sets,
  reps: protocol.meta.reps,
  common: protocol.meta.commonExercises
}));
