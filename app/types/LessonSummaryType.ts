/* NOTE: For stricter validation, we may want to use
a custom UUID library to define the type of 'id' in
these constructs. Avoids assigning non-UUID values,
and can be validated in a type-safe way.
*/


/*interface ModuleOverview {
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

// note: This sequential, but non-consecutive index is getting annoying.
// Let's ensure that this always has corrected indices.
export const dummyLessonSummary = {
  id: "88f059a0-66e8-40df-bb50-70b3096df015",
  name: "TestNewDB Lesson Plan 1",
  description: "description of TestNewDB lesson plan 1",
  phases: [
    {
      id: "7ea7d7ba-aae2-4598-a257-504103175bcf",
      name: "TestNewDB phase 1",
      description: "phase 1 description",
      type: "placeholder_type",
      index: 10,
      modules: [
        {
          id: "141dfcd6-cc41-4b82-9bd6-49ffe20de191",
          name: "TestNewDB Module 1",
          description: "description of module 1",
          duration: 30,
          index: 10
        },
        {
          id: "bdc85abe-e1fc-4c87-9281-a4a601eb95f6",
          name: "TestiNewDB Module 2",
          description: "description of module 2",
          duration: 20,
          index: 20
        },
        {
          id: "4d978b1a-e8e1-49a9-9aec-dbe4f3635e5c",
          name: "TestNewDB Module 3",
          description: "description of module 3",
          duration: 30,
          index: 30
        }
      ]
    },
    {
      id: "d1120706-4ae9-469b-9536-d53e52f14f2f",
      name: "TestNewDB phase 2",
      description: "phase 2 description",
      type: "placeholder_type",
      index: 20,
      modules: [
        {
          id: "e574967d-486f-439a-9445-1b6a0444686c",
          name: "TestNewDB Module 4",
          description: "description of module 4",
          duration: 20,
          index: 40
        },
        {
          id: "95a6dad1-1de5-4263-b7f7-5e53710e451d",
          name: "TestNewDB Module 5",
          description: "description of module 5",
          duration: 20,
          index: 50
        }
      ]
    }
  ]
};


const noMoreModules: ModuleOverview =
    {
        id: "",
        name: "No More Modules",
        description: "No modules remaining.",
        duration: 20,
        index: 0
    };

const emptyPhase: PhaseOverview =
    {
        id: "",
        name: "Phase not found",
        description: "No phase found.",
        type: "",
        index: 0,
        modules: [],
    }
    */

interface LessonModule {
  id: string; // UUID of the module
  name?: string;
  description?: string;
  duration: number;
  phaseIndex: number;
  moduleIndex: number;
}

interface LessonPhase {
  id: string; // UUID of the phase
  name?: string;
  description?: string;
  type: string;
}

const lessonModules: LessonModule[] = [
  {
    id: "141dfcd6-cc41-4b82-9bd6-49ffe20de191",
    name: "TestNewDB Module 1",
    description: "description of module 1",
    duration: 30,
    phaseIndex: 0,
    moduleIndex: 0
  },
  {
    id: "bdc85abe-e1fc-4c87-9281-a4a601eb95f6",
    name: "TestiNewDB Module 2",
    description: "description of module 2", 
    duration: 20,
    phaseIndex: 0,
    moduleIndex: 1
  },
  {
    id: "4d978b1a-e8e1-49a9-9aec-dbe4f3635e5c",
    name: "TestNewDB Module 3",
    description: "description of module 3",
    duration: 30,
    phaseIndex: 0,
    moduleIndex: 2
  },
  {
    id: "e574967d-486f-439a-9445-1b6a0444686c",
    name: "TestNewDB Module 4",
    description: "description of module 4",
    duration: 20,
    phaseIndex: 1,
    moduleIndex: 0
  },
  {
    id: "95a6dad1-1de5-4263-b7f7-5e53710e451d", 
    name: "TestNewDB Module 5",
    description: "description of module 5",
    duration: 20,
    phaseIndex: 1,
    moduleIndex: 1
  }
];


const lessonPhases: LessonPhase[] = [
  {
    id: "7ea7d7ba-aae2-4598-a257-504103175bcf",
    name: "TestNewDB phase 1",
    description: "phase 1 description",
    type: "placeholder_type",
    phaseIndex: 0
  },
  {
    id: "d1120706-4ae9-469b-9536-d53e52f14f2f",
    name: "TestNewDB phase 2", 
    description: "phase 2 description",
    type: "placeholder_type",
    phaseIndex: 1
  }
];





export function findNextModule(
    lessonSummary: LessonSummary, 
    currentModuleId: string, 
    direction: "next" | "previous" = "next"
): ModuleOverview {
    let currentPhase: PhaseOverview | undefined;
    let currentModule: ModuleOverview | undefined;

    for (const phase of lessonSummary.phases) {
        currentModule = phase.modules.find(module => module.id === currentModuleId);
        if (currentModule) {
            currentPhase = phase;
            break;
        }
    }

    if (!currentPhase || !currentModule) {
        return noMoreModules;
    }

    const sortedCurrentPhaseModules = [...currentPhase.modules].sort((a, b) => a.index - b.index);
    const sortedPhases = [...lessonSummary.phases].sort((a, b) => a.index - b.index);
    const currentPhaseIndex = sortedPhases.findIndex(phase => phase.id === currentPhase!.id);

    if (direction === "next") {
        const nextModuleInCurrentPhase = sortedCurrentPhaseModules.find(
            module => module.index > currentModule!.index
        );

        if (nextModuleInCurrentPhase) {
            return nextModuleInCurrentPhase;
        }

        // If no next module in current phase, look for modules in subsequent phases
        for (let i = currentPhaseIndex + 1; i < sortedPhases.length; i++) {
            const phase = sortedPhases[i];
            if (phase.modules.length > 0) {
                return phase.modules.sort((a, b) => a.index - b.index)[0];
            }
        }

        return noMoreModules;
    } else {
        const previousModuleInCurrentPhase = [...sortedCurrentPhaseModules]
            .reverse()
            .find(module => module.index < currentModule!.index);

        if (previousModuleInCurrentPhase) {
            return previousModuleInCurrentPhase;
        }

        // If no previous module in current phase, look for modules in preceding phases
        for (let i = currentPhaseIndex - 1; i >= 0; i--) {
            const phase = sortedPhases[i];
            if (phase.modules.length > 0) {
                return phase.modules.sort((a, b) => b.index - a.index)[0];
            }
        }

        return noMoreModules;
    }
}

export function findPhaseMatchingModuleID(lessonSummary: LessonSummary, moduleID: string): PhaseOverview {
    for (const phase of lessonSummary.phases) {
        const moduleFound = phase.modules.find(module => module.id === moduleID);
        
        if (moduleFound) {
            return phase;
        }
    }
    
    return emptyPhase;
}


export function findModuleSpecialIndex(lessonSummary: LessonSummary, moduleID: string): number {
  for (const phase of lessonSummary.phases) {
    const targetModule = phase.modules.find(module => module.id === moduleID);
    
    if (targetModule) {
      const sortedModules = [...phase.modules].sort((a, b) => a.index - b.index);

      return sortedModules.findIndex(module => module.id === moduleID) + 1;
    }
  }
  
  return -1;
}