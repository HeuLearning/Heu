/* NOTE: For stricter validation, we may want to use
a custom UUID library to define the type of 'id' in
these constructs. Avoids assigning non-UUID values,
and can be validated in a type-safe way.
*/
interface ModuleOverview {
  id: string; // UUID
  name?: string;
  description?: string;
  duration: number; // int4
  index: number;
}

interface PhaseOverview {
  id: string; // UUID
  name?: string;
  description?: string;
  type: string;
  index: number;
  modules: ModuleOverview[];
}

export interface LessonSummary {
  id: string; // UUID
  name?: string;
  description?: string;
  phases: PhaseOverview[];
}


export const dummyLessonSummary: LessonSummary = {
    id: "123e4567-e89b-12d3-a456-426614174000", // UUID for Lesson Plan
    name: "Introduction to TypeScript",
    description: "A foundational lesson on TypeScript.",
    phases: [
      {
        id: "phase-uuid-1",
        name: "Phase 1: Basics",
        description: "Learn the basics of TypeScript, including syntax and types.",
        type: "Lecture", // Type of phase, e.g., Lecture, Practical, Review
        index: 1, // Order of the phase
        modules: [
          {
            id: "module-uuid-1",
            name: "Introduction to Types",
            description: "Understanding basic types in TypeScript.",
            duration: 30, // Duration in minutes
            index: 5, // Module order (not sequential)
          },
          {
            id: "module-uuid-2",
            name: "Variables and Constants",
            description: "Understanding variables and constants in TypeScript.",
            duration: 20, // Duration in minutes
            index: 11, // Module order (not sequential)
          },
        ],
      },
      {
        id: "phase-uuid-2",
        name: "Phase 2: Advanced Topics",
        description: "Dive deeper into more advanced features of TypeScript.",
        type: "Workshop",
        index: 2,
        modules: [
          {
            id: "module-uuid-3",
            name: "Interfaces and Types",
            description: "Learn about defining types with interfaces.",
            duration: 45,
            index: 2, // Module order (not sequential)
          },
          {
            id: "module-uuid-4",
            name: "Generics in TypeScript",
            description: "Understanding and using generics in TypeScript.",
            duration: 60,
            index: 8, // Module order (not sequential)
          },
        ],
      },
    ],
};
