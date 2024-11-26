import { UUID } from "crypto";
import { eachMinuteOfInterval } from "date-fns";

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
    uid: UUID;
    role: string;
    first_name?: string;
    last_name?: string;
    phone_number?: string;
    email?: string;
}

export type Exercise = {
    id: UUID;
    simple_id: number;
    content: any;
    tags: string;
    question_type: string;
}

export type Module = {
    id: UUID;
    name: string;
    description: string;
    instructor_content: string;
    suggested_duration_seconds: number;
}

export type Phase = {
    id: UUID;
    name: string;
    description: string;
    type: string;
}

export type LessonPlan = {
    id: UUID;
    name: string;
    description: string;
    learner_overview: string;
    instructor_overview: string;
}