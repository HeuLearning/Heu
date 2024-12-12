import { Exercise } from "@/app/types/db-types";
import { LessonModule } from "@/app/types/LessonSummaryType";
import { Router, useRouter } from "next/router";
import ClassModeContentStudent from "../class-mode/ClassModeContent-Student";
import { Route } from "next";
import { AppRouterInstance } from "next/dist/shared/lib/app-router-context.shared-runtime";

interface MobileClassModeContainerProps {
    exercises: Exercise[];
    lessonModules: LessonModule[];
    router: AppRouterInstance;
}

export default function MobileClassModeContainer({ exercises, lessonModules, router }: MobileClassModeContainerProps) {
    const handleBack = () => {
        router.push("dashboard");
    };

    return (
        <div>
            Hello World
            <button onClick={handleBack}>{'[ go back ]'}</button>
            <ClassModeContentStudent exercises={exercises} />
        </div>
    )
}