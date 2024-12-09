import ClassModeHeaderBar from "./ClassModeHeaderBar";
import { useState, useEffect, useRef, useCallback } from "react";

import { getGT } from "gt-next";
import { createClient } from "../../../utils/supabase/client";
import { Exercise } from "@/app/types/db-types";
import { json } from "stream/consumers";
import { useRouter } from "next/navigation";
import ClassModeContentStudent from "./ClassModeContent-Student";
import { dummyLessonModules, dummyLessonPhases, LessonModule, LessonPhase } from "@/app/types/LessonSummaryType";


interface ClassModeContainerProps {
    sessionId: string;
}

export default function ClassModeContainerStudent({
    sessionId,
}: ClassModeContainerProps) {
    const dashboardHeight = window.innerHeight - 64 - 16;
    const t = getGT();
    const supabase = createClient();


    /* * * * * * * * * * * * * * * THIS IS TEMPORARY * * * * * * * * * * * * * * * * * */
    // in the future, this will come from a provider
    //const lessonModules: LessonModule[] = dummyLessonModules;
    //const lessonPhases: LessonPhase[] = dummyLessonPhases;
    const [lessonID, setLessonID] = useState<string>('7dd187ee-7bd7-4d6a-b161-0ce45b79bfae');
    /* * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * */

    const [lessonInProgress, setLessonInProgress] = useState<boolean>(true);
    const [activeModuleID, setActiveModuleID] = useState<string>('');
    const [exercises, setExercises] = useState<Exercise[]>([]);
    const [moduleInfo, setModuleInfo] = useState<{ name: string; description: string; id: string }>({ name: '', description: '', id: '' });

    const [lessonModuleIndex, setLessonModuleIndex] = useState<number>(0);
    const [lessonPhaseIndex, setLessonPhaseIndex] = useState<number>(0);


    useEffect(() => {
        // initial moduleID retrieval and updating connected_members
        if (!lessonID) return;
        const retrieveActiveModuleID = async () => {
            const { data, error } = await supabase
                .from('lessons_new')
                .select('active_module_id')
                .eq('id', lessonID)
                .single();
            if (error) {
                console.error(`Error fetching initial module ID of ${lessonID}: ${error}`);
                return;
            }
            console.log(`retrieved active module ID of ${data.active_module_id}`);
            setActiveModuleID(data.active_module_id);
        }
        const connectAsMember = async () => {
            // post to API route with {sessionID, userID, lessonID}
            return;
        }

        retrieveActiveModuleID();
    }, [lessonID]);

    useEffect(() => {
        // module content DB retrieval
        //if algorithms are module-to=module, algorithm processing happens in this step, between exercise retrieval and setExercises().
        if (!activeModuleID) return;
        const retrieveActiveModuleDetails = async () => {
            const { data: moduleData, error: moduleError } = await supabase
                .from('modules_new')
                .select('id, name, description')
                .eq('id', activeModuleID)
                .single();

            if (moduleError) {
                console.error(`Error fetching module details: ${moduleError}`);
                return;
            }
            console.log(`retrieved module details of ${JSON.stringify(moduleData)}`);
            setModuleInfo(moduleData);
        }

        const retrieveActiveModuleExercises = async () => {
            console.log(`activeModuleID is ${activeModuleID}`);
            const { data: exercises, error: exercisesError } = await supabase
                .from('exercises_new')
                .select('id, simple_id, content, tags, question_type, module_exercises!inner(module_id)')
                .eq('module_exercises.module_id', activeModuleID); // Supabase, annoyingly, returns a nested structure when you do a join query.
            //                                                        I filter after the join because I don't want to flatmap the exercises.
            //                                                                      (I'm praying SQL optimizes the query on the backend)
            if (exercisesError) {
                console.error(`Error fetching exercises: ${exercisesError.message}`);
                return;
            }
            console.log(`return value of exercises is ${JSON.stringify(exercises)}`)
            setExercises(exercises.map(({ module_exercises, ...exerciseWithoutModuleExercises }) => exerciseWithoutModuleExercises));
            // [ only important for nerds ]
            //      If you setExercises(exercises), TypeScript will actually keep you from accessing exercises.module_exercises.
            //      However, the excess information will still be stored in exercises. This is excess stored info, so I remove it here.
        }
        retrieveActiveModuleDetails();
        retrieveActiveModuleExercises();
    }, [activeModuleID]);

    useEffect(() => {
        // setup dynamic DB update of activeModuleID, lessonInProgress
        if (!lessonID) return;

        const channelName = `lessons_new:lessonId-${lessonID}`;

        const subscription = supabase
            .channel(channelName)
            .on(
                'postgres_changes',
                {
                    event: 'UPDATE',
                    schema: 'public',
                    table: 'lessons_new',
                    filter: `id=eq.${lessonID}`,
                },
                (payload) => {
                    const newModuleID = payload.new.active_module_id;
                    const newLessonInProgress = payload.new.in_progress;
                    setActiveModuleID(newModuleID);
                    setLessonInProgress(newLessonInProgress);
                }
            )
            .subscribe();

        return () => {
            subscription.unsubscribe();
        };
    }, [lessonID]);


    const router = useRouter();
    const handleBack = () => {
        router.push("dashboard");
    };

    const redisTest = async () => {
        try {
            console.log(`testing redis`);
            const response = await fetch('/api/completeExercise', {
                method: 'POST',
            });
            if (!response.ok) {
                throw new Error('Network response was not ok');
            }
            const data = await response.json();
            console.log('Response from API:', data);

        } catch (error) {
            console.error('Error:', error);
        }
    };

    if (activeModuleID != '') {
        /*if (isMobile) {
            return (
                <MobileClassModeContainer {...sharedProps}>
                    <div className="items-center">
                        <ButtonBarProvider value={val}>
                            <ClassModeContent jsonData={jsonData} />
                        </ButtonBarProvider>
                    </div>
                </MobileClassModeContainer>
            );
        }*/
        return (
            <div
                id="class-mode-container"
                style={{ height: dashboardHeight }}
                className="relative mb-4 ml-4 mr-4 flex flex-col rounded-[20px] bg-surface_bg_highlight p-[10px]"
            >
                <button onClick={redisTest}>{'[ Click me to test redis ]'} </button>
                <ClassModeHeaderBar
                    onBack={handleBack}
                    title={t("class_mode_content.classroom")}
                    rightSide={'nothing in the right side for now'
                    }
                />
                <ClassModeContentStudent exercises={exercises} />
            </div>
        );

    } else {
        return (
            <div>
                Loading...
            </div>
        )
    }
};