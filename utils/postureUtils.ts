import { NormalizedLandmark } from '@mediapipe/tasks-vision';

type PoseLm = NormalizedLandmark;
type Point3D = { x: number; y: number; z: number };

// ---------- BASIC HELPERS ----------

// 2D distance
export const findDistance = (
  p1: { x: number; y: number },
  p2: { x: number; y: number }
) => {
  return Math.sqrt(Math.pow(p1.x - p2.x, 2) + Math.pow(p1.y - p2.y, 2));
};

// Convert MediaPipe landmark => 3D point (if visible)
const toPoint3D = (lm: PoseLm | undefined): Point3D | null =>
  lm && lm.visibility !== undefined && lm.visibility > 0.5
    ? { x: lm.x, y: lm.y, z: lm.z || 0 }
    : null;

// Angle between three 3D points (A-B-C) in degrees (0–180)
const angleBetweenPoints = (a: Point3D, b: Point3D, c: Point3D): number => {
  const ab = { x: a.x - b.x, y: a.y - b.y, z: a.z - b.z };
  const cb = { x: c.x - b.x, y: c.y - b.y, z: c.z - b.z };
  const dot = ab.x * cb.x + ab.y * cb.y + ab.z * cb.z;
  const magAB = Math.hypot(ab.x, ab.y, ab.z);
  const magCB = Math.hypot(cb.x, cb.y, cb.z);
  const cos = dot / (magAB * magCB || 1);
  return (Math.acos(Math.max(-1, Math.min(1, cos))) * 180) / Math.PI;
};

// Legacy 2D method for backward compatibility (not used in new logic but kept)
export const calculateAngle = (
  a: { x: number; y: number },
  b: { x: number; y: number },
  c: { x: number; y: number }
) => {
  const radians =
    Math.atan2(c.y - b.y, c.x - b.x) - Math.atan2(a.y - b.y, a.x - b.x);
  let angle = Math.abs((radians * 180.0) / Math.PI);
  if (angle > 180.0) {
    angle = 360 - angle;
  }
  return angle;
};

// ---------- LANDMARK INDEX MAP ----------

const LM = {
  NOSE: 0,
  LEFT_EYE_INNER: 1,
  LEFT_EYE: 2,
  LEFT_EYE_OUTER: 3,
  RIGHT_EYE_INNER: 4,
  RIGHT_EYE: 5,
  RIGHT_EYE_OUTER: 6,
  LEFT_EAR: 7,
  RIGHT_EAR: 8,
  MOUTH_LEFT: 9,
  MOUTH_RIGHT: 10,
  LEFT_SHOULDER: 11,
  RIGHT_SHOULDER: 12,
  LEFT_ELBOW: 13,
  RIGHT_ELBOW: 14,
  LEFT_WRIST: 15,
  RIGHT_WRIST: 16,
  LEFT_PINKY: 17,
  RIGHT_PINKY: 18,
  LEFT_INDEX: 19,
  RIGHT_INDEX: 20,
  LEFT_THUMB: 21,
  RIGHT_THUMB: 22,
  LEFT_HIP: 23,
  RIGHT_HIP: 24,
  LEFT_KNEE: 25,
  RIGHT_KNEE: 26,
  LEFT_ANKLE: 27,
  RIGHT_ANKLE: 28,
  LEFT_HEEL: 29,
  RIGHT_HEEL: 30,
  LEFT_FOOT_INDEX: 31,
  RIGHT_FOOT_INDEX: 32,
} as const;

// ---------- JOINT ANGLES & METRICS ----------

interface JointAngles {
  neckFlexion?: number; // head vs upper-back
  trunkAngle?: number;  // shoulders-hips-knees
  leftKnee?: number;
  rightKnee?: number;
  leftHip?: number;
  rightHip?: number;
  leftElbow?: number;
  rightElbow?: number;
  shoulderTilt?: number; // signed, >0 right shoulder lower, <0 left shoulder lower
}

const midPoint = (a: Point3D, b: Point3D): Point3D => ({
  x: (a.x + b.x) / 2,
  y: (a.y + b.y) / 2,
  z: (a.z + b.z) / 2,
});

// Compute joint angles from landmarks
const getJointAngles = (landmarks: PoseLm[]): JointAngles => {
  const out: JointAngles = {};

  const nose = toPoint3D(landmarks[LM.NOSE]);
  const lShoulder = toPoint3D(landmarks[LM.LEFT_SHOULDER]);
  const rShoulder = toPoint3D(landmarks[LM.RIGHT_SHOULDER]);
  const lHip = toPoint3D(landmarks[LM.LEFT_HIP]);
  const rHip = toPoint3D(landmarks[LM.RIGHT_HIP]);
  const lKnee = toPoint3D(landmarks[LM.LEFT_KNEE]);
  const rKnee = toPoint3D(landmarks[LM.RIGHT_KNEE]);
  const lAnkle = toPoint3D(landmarks[LM.LEFT_ANKLE]);
  const rAnkle = toPoint3D(landmarks[LM.RIGHT_ANKLE]);
  const lElbow = toPoint3D(landmarks[LM.LEFT_ELBOW]);
  const rElbow = toPoint3D(landmarks[LM.RIGHT_ELBOW]);
  const lWrist = toPoint3D(landmarks[LM.LEFT_WRIST]);
  const rWrist = toPoint3D(landmarks[LM.RIGHT_WRIST]);

  // Neck flexion & shoulder tilt
  if (lShoulder && rShoulder) {
    const shouldersMid = midPoint(lShoulder, rShoulder);

    if (nose) {
      // neck flexion: shouldersMid-(fake vertical)-nose
      out.neckFlexion = angleBetweenPoints(
        { x: shouldersMid.x, y: shouldersMid.y + 0.1, z: shouldersMid.z },
        shouldersMid,
        nose
      );
    }

    // shoulder tilt vs horizontal (signed)
    const dy = rShoulder.y - lShoulder.y;
    const dx = (rShoulder.x - lShoulder.x) || 1e-6;
    out.shoulderTilt = (Math.atan2(dy, dx) * 180) / Math.PI;
  }

  // Trunk angle (roughly spine flexion)
  if (lShoulder && rShoulder && lHip && rHip && lKnee && rKnee) {
    const shouldersMid = midPoint(lShoulder, rShoulder);
    const hipsMid = midPoint(lHip, rHip);
    const kneeMid = midPoint(lKnee, rKnee);
    out.trunkAngle = angleBetweenPoints(shouldersMid, hipsMid, kneeMid);
  }

  // Knee angles
  if (lHip && lKnee && lAnkle) {
    out.leftKnee = angleBetweenPoints(lHip, lKnee, lAnkle);
  }
  if (rHip && rKnee && rAnkle) {
    out.rightKnee = angleBetweenPoints(rHip, rKnee, rAnkle);
  }

  // Hip angles
  if (lShoulder && lHip && lKnee) {
    out.leftHip = angleBetweenPoints(lShoulder, lHip, lKnee);
  }
  if (rShoulder && rHip && rKnee) {
    out.rightHip = angleBetweenPoints(rShoulder, rHip, rKnee);
  }

  // Elbow angles
  if (lShoulder && lElbow && lWrist) {
    out.leftElbow = angleBetweenPoints(lShoulder, lElbow, lWrist);
  }
  if (rShoulder && rElbow && rWrist) {
    out.rightElbow = angleBetweenPoints(rShoulder, rElbow, rWrist);
  }

  return out;
};

// ---------- RULE-BASED SCORING ----------

interface Rule {
  id: string;
  joint: keyof JointAngles;
  target: number;
  tolerance: number;
  weight: number;
  badMessage: string;
}

const rulesByExercise: Record<string, Rule[]> = {
  // Neck / desk stretch (sitting)
  desk_stretch: [
    {
      id: 'neck-tilt',
      joint: 'neckFlexion',
      target: 160,
      tolerance: 20,
      weight: 1,
      badMessage: 'Gently tilt your head to the side, not too much.',
    },
    {
      id: 'shoulder-level',
      joint: 'shoulderTilt',
      target: 0,
      tolerance: 5,
      weight: 0.7,
      badMessage: 'Keep both shoulders level and relaxed.',
    },
  ],

  // Gentle mini-squats
  squats_gentle: [
    {
      id: 'squat-depth-left',
      joint: 'leftKnee',
      target: 100,
      tolerance: 20,
      weight: 0.5,
      badMessage: 'Bend your knees deeper (around 90 degrees).',
    },
    {
      id: 'squat-depth-right',
      joint: 'rightKnee',
      target: 100,
      tolerance: 20,
      weight: 0.5,
      badMessage: 'Bend your knees deeper (around 90 degrees).',
    },
    {
      id: 'shoulder-level',
      joint: 'shoulderTilt',
      target: 0,
      tolerance: 5,
      weight: 0.7,
      badMessage: 'Keep your shoulders level while you squat.',
    },
  ],

  // Cat-Cow (on all fours)
  cat_cow: [
    {
      id: 'trunk-flex',
      joint: 'trunkAngle',
      target: 100,
      tolerance: 25,
      weight: 1,
      badMessage: 'Move your spine through a bigger arch and curl.',
    },
    {
      id: 'shoulder-level',
      joint: 'shoulderTilt',
      target: 0,
      tolerance: 8,
      weight: 0.5,
      badMessage: 'Keep shoulders roughly level as you move.',
    },
  ],
};

// ---------- POSTURE ANALYSIS & VOICE CUES ----------

export interface PostureAnalysis {
  score: number;
  feedback: string;
  key?: string;      // stable ID for voice throttling
  cues?: string[];   // optional extra corrections to show in UI
}

interface DirectionalCue {
  key: string;
  feedback: string;
}

const getDirectionalCue = (
  angles: JointAngles,
  exerciseId: string,
  landmarks: PoseLm[]
): DirectionalCue | null => {
  const nose = toPoint3D(landmarks[LM.NOSE]);
  const lShoulder = toPoint3D(landmarks[LM.LEFT_SHOULDER]);
  const rShoulder = toPoint3D(landmarks[LM.RIGHT_SHOULDER]);
  const lHip = toPoint3D(landmarks[LM.LEFT_HIP]);
  const rHip = toPoint3D(landmarks[LM.RIGHT_HIP]);
  const lKnee = toPoint3D(landmarks[LM.LEFT_KNEE]);
  const rKnee = toPoint3D(landmarks[LM.RIGHT_KNEE]);

  // Helper to avoid repeating
  const hasShoulders = lShoulder && rShoulder;
  const hasHips = lHip && rHip;

  // ---- 1) Neck side-bend / head off-center ----
  if (nose && hasShoulders) {
    const shouldersMid = midPoint(lShoulder!, rShoulder!);
    const neckOffset = nose.x - shouldersMid.x; // + => head to right

    if (Math.abs(neckOffset) > 0.04) {
      if (neckOffset > 0) {
        // head to right
        return {
          key: 'neck_shift_right',
          feedback: 'Bring your head slightly to your left to center it.',
        };
      } else {
        return {
          key: 'neck_shift_left',
          feedback: 'Bring your head slightly to your right to center it.',
        };
      }
    }
  }

  // ---- 2) Shoulder level (uses computed angle) ----
  if (angles.shoulderTilt !== undefined && Math.abs(angles.shoulderTilt) > 4) {
    if (angles.shoulderTilt > 0) {
      // right shoulder lower
      return {
        key: 'right_shoulder_low',
        feedback: 'Lift your right shoulder a bit to keep them level.',
      };
    } else {
      return {
        key: 'left_shoulder_low',
        feedback: 'Lift your left shoulder a bit to keep them level.',
      };
    }
  }

  // ---- 3) Trunk lateral lean (shoulders over hips) ----
  if (hasShoulders && hasHips) {
    const shouldersMid = midPoint(lShoulder!, rShoulder!);
    const hipsMid = midPoint(lHip!, rHip!);
    const trunkOffset = shouldersMid.x - hipsMid.x; // + => upper body to right

    if (Math.abs(trunkOffset) > 0.04) {
      if (trunkOffset > 0) {
        return {
          key: 'trunk_right',
          feedback: 'Shift your upper body slightly to your left to stay centered.',
        };
      } else {
        return {
          key: 'trunk_left',
          feedback: 'Shift your upper body slightly to your right to stay centered.',
        };
      }
    }
  }

  // ---- 4) Squat-specific depth & symmetry cues ----
  if (exerciseId === 'squats_gentle') {
    const { leftKnee, rightKnee, trunkAngle } = angles;

    if (leftKnee !== undefined && rightKnee !== undefined) {
      const avgKnee = (leftKnee + rightKnee) / 2;

      if (avgKnee > 130) {
        return {
          key: 'squat_deeper',
          feedback: 'Bend your knees a bit more, like sitting back onto a chair.',
        };
      }
      if (avgKnee < 80) {
        return {
          key: 'squat_too_deep',
          feedback: "Don't go too deep - stop around a right-angle at the knees.",
        };
      }

      // Asymmetry between legs
      const diff = leftKnee - rightKnee;
      if (Math.abs(diff) > 15) {
        if (diff > 0) {
          return {
            key: 'knee_match_right',
            feedback: 'Straighten your left leg slightly to match your right.',
          };
        } else {
          return {
            key: 'knee_match_left',
            feedback: 'Straighten your right leg slightly to match your left.',
          };
        }
      }
    }

    if (trunkAngle !== undefined && trunkAngle < 80) {
      return {
        key: 'squat_lean_forward',
        feedback: 'Keep your chest up – avoid leaning too far forward.',
      };
    }
  }

  // ---- 5) Cat-Cow: encourage bigger spine movement ----
  if (exerciseId === 'cat_cow') {
    const { trunkAngle } = angles;
    if (trunkAngle !== undefined && trunkAngle > 90 && trunkAngle < 110) {
      return {
        key: 'catcow_more_range',
        feedback: 'Use a bigger range: really arch, then really round your spine.',
      };
    }
  }

  return null;
};

// Advanced scoring with rules + directional cues
export const getPostureScore = (
  landmarks: PoseLm[],
  exerciseId: string
): PostureAnalysis => {
  const rules = rulesByExercise[exerciseId] || [];

  if (!landmarks || landmarks.length === 0) {
    return { score: 0, feedback: 'No pose detected', key: 'no_pose' };
  }

  const angles = getJointAngles(landmarks);

  // If no rules defined, just be positive
  if (!rules.length) {
    return { score: 100, feedback: 'Keep going, great form!', key: 'no_rules' };
  }

  let totalScore = 0;
  let totalWeight = 0;
  let worstRule: { rule: Rule; localScore: number } | null = null;

  for (const rule of rules) {
    const val = angles[rule.joint];
    if (val === undefined) continue;

    const diff = Math.abs(val - rule.target);
    const normalized = Math.min(diff / rule.tolerance, 2);
    const localScore = Math.max(0, 100 * (1 - normalized)); // 0–100

    totalScore += localScore * rule.weight;
    totalWeight += rule.weight;

    if (!worstRule || localScore < worstRule.localScore) {
      worstRule = { rule, localScore };
    }
  }

  if (!totalWeight) {
    return {
      score: 100,
      feedback: 'Move a bit closer to the camera.',
      key: 'no_joints',
    };
  }

  const finalScore = totalScore / totalWeight;

  // MAIN feedback + key
  let feedback = 'Perfect form!';
  let key = 'good';
  const cues: string[] = [];

  // 1) Try to give detailed directional cue
  const directional = getDirectionalCue(angles, exerciseId, landmarks);
  if (directional) {
    feedback = directional.feedback;
    key = directional.key;
    cues.push(directional.feedback);
  }

  // 2) Then the "worst" violated rule as a secondary cue
  if (worstRule && worstRule.localScore < 85) {
    cues.push(worstRule.rule.badMessage);
    if (!directional) {
      feedback = worstRule.rule.badMessage;
      key = worstRule.rule.id;
    }
  }

  // 3) Mild issues but not terrible
  if (!directional && (!worstRule || worstRule.localScore >= 85) && finalScore < 90) {
    feedback = 'Almost there - tiny posture adjustment needed.';
    key = 'minor_adjust';
  }

  return {
    score: finalScore,
    feedback,
    key,
    cues: Array.from(new Set(cues)),
  };
};

// ---------- REP COUNTING (unchanged, but uses angles) ----------

interface RepCounterState {
  reps: number;
  lastState: 'up' | 'down' | 'unknown';
  stateConfidence: number;
}

export const detectRepTransition = (
  angles: JointAngles,
  exerciseId: string,
  state: RepCounterState
): RepCounterState => {
  let currentState: 'up' | 'down' | 'unknown' = 'unknown';

  if (exerciseId === 'squats_gentle') {
    const avgKnee =
      angles.leftKnee && angles.rightKnee
        ? (angles.leftKnee + angles.rightKnee) / 2
        : undefined;
    if (avgKnee !== undefined) {
      currentState = avgKnee < 110 ? 'down' : 'up';
    }
  } else if (exerciseId === 'desk_stretch') {
    if (angles.neckFlexion !== undefined) {
      currentState = angles.neckFlexion < 170 ? 'down' : 'up';
    }
  } else if (exerciseId === 'cat_cow') {
    if (angles.trunkAngle !== undefined) {
      currentState = angles.trunkAngle < 120 ? 'down' : 'up';
    }
  }

  const newState = { ...state };

  if (currentState !== 'unknown' && currentState !== state.lastState) {
    if (state.lastState !== 'unknown') {
      newState.reps += 1;
    }
    newState.lastState = currentState;
    newState.stateConfidence = 1;
  }

  return newState;
};
