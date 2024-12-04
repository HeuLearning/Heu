
export type JSONData = {

    type: string;
    student_data: {
        moduleId: number;
        moduleName: string;
        elapsedTime: number;
        exercises: {
            id: number;
            content: {
                instruction: string;
            };
            tags: string;
            question_type: string;
        }[];
        instructor_content: string;
    };
};

export type InstructorContentJSON = {
    instructor_content: string;
};

/* TODO: TypeScript types for each type of exercise content (instruction, multiple choice, etc.)
type ExerciseContent = {
    instruction: string;
    canContinue: boolean;
}*/

export type User = {
    uid: string;
    role: string;
    first_name?: string;
    last_name?: string;
    phone_number?: string;
    email?: string;

    // this prop only exists to function with old backend.
    status?: string;
}

export type Exercise = {
    id: string;
    simple_id: number;
    content: any;
    tags: string;
    question_type: string;
}

export type Module = {
    id: string;
    name: string;
    description: string;
    instructor_content: string;
    suggested_duration_seconds: number;
}

export type Phase = {
    id: string;
    name: string;
    description: string;
    type: string;
}

export type LessonPlan = {
    id: string;
    name: string;
    description: string;
    learner_overview: string;
    instructor_overview: string;
}

export const emptyDBModule = {
    id: '',
    name: '',
    description: '',
    instructor_content: '',
    suggested_duration_seconds: 0,
}