
// 2D distance
export const findDistance = (p1: {x: number, y: number}, p2: {x: number, y: number}) => {
    return Math.sqrt(Math.pow(p1.x - p2.x, 2) + Math.pow(p1.y - p2.y, 2));
};

// Calculate angle between three points (A, B, C) where B is the vertex
// Returns degrees 0-180
export const calculateAngle = (
    a: {x: number, y: number}, 
    b: {x: number, y: number}, 
    c: {x: number, y: number}
) => {
    const radians = Math.atan2(c.y - b.y, c.x - b.x) - Math.atan2(a.y - b.y, a.x - b.x);
    let angle = Math.abs((radians * 180.0) / Math.PI);
    if (angle > 180.0) {
        angle = 360 - angle;
    }
    return angle;
};

// MediaPipe Pose Landmarks Mapping
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
};

// Simple scoring algorithm based on exercise type
export const getPostureScore = (landmarks: any[], exerciseId: string): { score: number, feedback: string } => {
    if (!landmarks || landmarks.length === 0) return { score: 0, feedback: "No pose detected" };
    
    // We assume 2D landmarks (x, y normalized)
    // Helper to get point
    const getP = (index: number) => landmarks[index];

    let score = 100;
    let feedback = "Good form";

    // --- EXERCISE SPECIFIC LOGIC ---

    if (exerciseId === 'squats_gentle') {
        // FOCUS: Knee depth and Torso alignment
        // Use Left side for calculation (assuming left profile or front view)
        // If visibility of left is poor, could swap to right, but keeping simple for demo.
        
        const hip = getP(LM.LEFT_HIP);
        const knee = getP(LM.LEFT_KNEE);
        const ankle = getP(LM.LEFT_ANKLE);
        const shoulder = getP(LM.LEFT_SHOULDER);

        // 1. Knee Angle (Hip-Knee-Ankle)
        // Standing straight ~ 170-180
        // 90 degrees = thigh parallel to ground
        const kneeAngle = calculateAngle(hip, knee, ankle);

        // 2. Hip Angle / Torso Lean (Shoulder-Hip-Knee)
        // Standing ~ 170-180
        // Leaning forward reduces this angle
        const hipAngle = calculateAngle(shoulder, hip, knee);

        // Thresholds
        if (kneeAngle < 75) {
            score -= 15;
            feedback = "Don't go too deep";
        } else if (kneeAngle > 165) {
            // Standing still
            feedback = "Lower down gently";
        } else {
            // In the active squat range (75 - 165)
            // Check torso
            if (hipAngle < 70) {
                score -= 20;
                feedback = "Keep chest up!";
            } else {
                feedback = "Great stability";
            }
        }
    } 
    
    else if (exerciseId === 'desk_stretch') {
        // FOCUS: Neck release, keeping shoulders down
        const leftShoulder = getP(LM.LEFT_SHOULDER);
        const rightShoulder = getP(LM.RIGHT_SHOULDER);
        const leftEar = getP(LM.LEFT_EAR);
        const rightEar = getP(LM.RIGHT_EAR);

        // 1. Shoulder Level check
        // Ideally y values should be similar. 
        // 0.08 is the normalized threshold for screen space
        const shoulderDiff = Math.abs(leftShoulder.y - rightShoulder.y);
        
        // 2. Head Tilt
        // We want the head to tilt, so ears should NOT be level
        const earDiff = Math.abs(leftEar.y - rightEar.y);

        if (shoulderDiff > 0.08) {
            score -= 15;
            feedback = "Relax your shoulders down";
        } else if (earDiff < 0.02) {
             // Head is straight up
             feedback = "Gently tilt your head";
        } else {
            feedback = "Feel the stretch";
        }
    } 
    
    else if (exerciseId === 'cat_cow') {
        // FOCUS: Spine mobility (Side view usually)
        const shoulder = getP(LM.LEFT_SHOULDER);
        const hip = getP(LM.LEFT_HIP);
        const knee = getP(LM.LEFT_KNEE);

        // Angle of the back relative to the thigh
        const backToThighAngle = calculateAngle(shoulder, hip, knee);

        // Cat-Cow is dynamic, so we mostly check if they are in position
        // If angle is very straight (180), they might be standing straight up
        
        if (backToThighAngle > 160) {
            score -= 10;
            feedback = "Get into table-top position";
        } else {
            // They are likely bent over/seated
            // We just encourage movement for now as curvature is hard to calc with 3 points
            feedback = "Flow with your breath";
        }
    }

    // Clamp score
    return { score: Math.max(0, Math.min(100, score)), feedback };
};
