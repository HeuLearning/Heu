import { Exercise } from "@/app/types/db-types";
import { LessonModule } from "@/app/types/LessonSummaryType";
import { useRouter } from "next/router";
import ClassModeContentStudent from "../class-mode/ClassModeContent-Student";

interface MobileClassModeContainerProps {
    exercises: Exercise[];
    lessonModules: LessonModule[];
}

export default function MobileClassModeContainerDELETE({ exercises, lessonModules }: MobileClassModeContainerProps) {
    const router = useRouter();
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