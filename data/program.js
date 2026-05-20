export const PROGRAM = {
  mon: { name: "Monday", focus: "Upper Body A", accent: "#2563eb", exercises: [
    { id: "m1", name: "DB bench press", target: "3 × 8-10", sets: 3,
      how: "Lie on your back on the bench, a dumbbell in each hand at chest level. Press them straight up until your arms are extended, then lower under control.",
      muscle: "Chest, front shoulders, triceps" },
    { id: "m2", name: "One-arm DB row", target: "3 × 10/side", sets: 3,
      how: "Put one knee and the same-side hand on the bench so your back is flat and roughly parallel to the floor. With the other hand, pull the dumbbell up toward your hip, then lower. Do all reps, then switch sides.",
      muscle: "Back, biceps" },
    { id: "m3", name: "DB shoulder press", target: "3 × 10", sets: 3,
      how: "Seated upright, dumbbells at shoulder height. Press straight overhead until arms extend, then lower back to shoulders.",
      muscle: "Shoulders, triceps" },
    { id: "m4", name: "DB bicep curl", target: "2 × 12", sets: 2,
      how: "Dumbbells at your sides, palms facing forward. Bend at the elbow to curl them up toward your shoulders, then lower under control.",
      muscle: "Biceps" },
    { id: "m5", name: "DB skull crusher", target: "2 × 12", sets: 2,
      how: "Lie on the bench, arms pointing straight up with a dumbbell in each hand. Bend only at the elbows to lower the weights toward your forehead, then extend back up.",
      muscle: "Triceps" } ] },
  tue: { name: "Tuesday", focus: "Lower Body A", accent: "#16a34a", exercises: [
    { id: "t1", name: "Goblet squat", target: "3 × 10-12", sets: 3,
      how: "Hold one dumbbell (or the kettlebell) vertically against your chest with both hands, like a goblet. Squat down keeping your chest up, then stand.",
      muscle: "Quads, glutes" },
    { id: "t2", name: "DB Romanian deadlift", target: "3 × 10", sets: 3,
      how: "Stand holding dumbbells in front of your thighs, knees only slightly bent. Push your hips backward and let the dumbbells slide down your legs, keeping your back flat. Stand up by squeezing your glutes. Hips move back, not down.",
      muscle: "Hamstrings, glutes" },
    { id: "t3", name: "DB walking lunge", target: "3 × 10/side", sets: 3,
      how: "A dumbbell in each hand at your sides. Step forward into a lunge until both knees are about 90°, then step through with the other leg and repeat — walking forward.",
      muscle: "Legs, glutes" },
    { id: "t4", name: "DB calf raise", target: "3 × 15", sets: 3,
      how: "Stand holding dumbbells. Push up onto the balls of your feet as high as you can, then lower slowly.",
      muscle: "Calves" },
    { id: "t5", name: "Plank", target: "3 × 40s", sets: 3,
      how: "Face-down, weight on your forearms and toes, body in a straight rigid line. Hold for the time shown — don't let your hips sag or pike up.",
      muscle: "Core" } ] },
  wed: { name: "Wednesday", focus: "Active Recovery", accent: "#9333ea", recovery: [
    "Kettlebell swings — 5 × 15", "Mobility / stretching — 15 min",
    "Optional brisk walk", "Light core work" ] },
  thu: { name: "Thursday", focus: "Upper Body B", accent: "#2563eb", exercises: [
    { id: "h1", name: "Incline DB press", target: "3 × 8-10", sets: 3,
      how: "Same as a bench press, but set the backrest to an incline (about 30–45°). Shifts the work toward your upper chest.",
      muscle: "Upper chest, shoulders, triceps" },
    { id: "h2", name: "DB chest-supported row", target: "3 × 10", sets: 3,
      how: "Lie face-down on an inclined bench so your chest is supported, a dumbbell hanging from each hand. Pull both up toward your hips, then lower.",
      muscle: "Back, biceps" },
    { id: "h3", name: "DB lateral raise", target: "3 × 12", sets: 3,
      how: "Stand with a dumbbell in each hand at your sides. With a slight elbow bend, raise both arms out to the sides until roughly shoulder height — like wings — then lower slowly. Keep the weight light.",
      muscle: "Side shoulders" },
    { id: "h4", name: "Hammer curl", target: "2 × 12", sets: 2,
      how: "Like a bicep curl, but your palms face each other the whole time, as if holding two hammers.",
      muscle: "Biceps, forearms" },
    { id: "h5", name: "DB overhead extension", target: "2 × 12", sets: 2,
      how: "Seated or standing, hold one dumbbell with both hands overhead. Lower it behind your head by bending the elbows, then extend back up.",
      muscle: "Triceps" } ] },
  fri: { name: "Friday", focus: "Lower Body B", accent: "#16a34a", exercises: [
    { id: "f1", name: "DB Bulgarian split squat", target: "3 × 8/side", sets: 3,
      how: "Stand a stride-length in front of the bench, resting the top of one foot behind you on it. Lower straight down on the front leg, then drive back up. Start light or with no weight.",
      muscle: "Quads, glutes" },
    { id: "f2", name: "DB deadlift", target: "3 × 10", sets: 3,
      how: "Dumbbells start on the floor beside your feet. Hinge at the hips and bend the knees to pick them up, stand up tall, then lower them back down with a flat back.",
      muscle: "Whole posterior chain" },
    { id: "f3", name: "DB step-up", target: "3 × 10/side", sets: 3,
      how: "Stand facing the bench, dumbbells at your sides. Step one foot fully onto the bench and drive up until standing on it, then step back down. Switch sides.",
      muscle: "Legs, glutes" },
    { id: "f4", name: "DB hip thrust", target: "3 × 12", sets: 3,
      how: "Sit on the floor with your upper back against the bench, a dumbbell across your hips. Drive your hips up until your body is a flat tabletop, squeeze your glutes, then lower.",
      muscle: "Glutes" },
    { id: "f5", name: "Lying leg raise", target: "3 × 12", sets: 3,
      how: "Lie flat on your back, legs straight, hands under your lower back. Raise both legs toward the ceiling, then lower slowly without letting them touch the floor.",
      muscle: "Lower abs" } ] },
  sat: { name: "Weekend", focus: "Full Rest", accent: "#78716c", rest: true }
};

export const DAY_ORDER = ["mon", "tue", "wed", "thu", "fri", "sat"];

export function findExercise(dayKey, exId) {
  const day = PROGRAM[dayKey];
  if (!day || !day.exercises) return null;
  return day.exercises.find(e => e.id === exId);
}
