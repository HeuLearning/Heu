import ClassModeHeaderBar from "./ClassModeHeaderBar";
import { useState, useEffect, useRef, useCallback } from "react";

import { getGT } from "gt-next";
import { createClient } from "../../../utils/supabase/client";
import { Exercise } from "@/app/types/db-types";
import { useRouter } from "next/navigation";
import ClassModeContentStudent from "./ClassModeContent-Student";
import BackButton from "../buttons/BackButton";
import MobileDetailView from "../mobile/MobileDetailView";
import { useUserRole } from "../data-retrieval/UserRoleContext";


interface ClassModeContainerProps {
    sessionId: string;
}

export default function ClassModeContainerStudent({
    sessionId,
}: ClassModeContainerProps) {
    const dashboardHeight = window.innerHeight - 64 - 16;
    const t = getGT();
    const supabase = createClient();

    const [isLoading, setIsLoading] = useState<boolean>(true);
    /* * * * * * * * * * * * * * * THIS IS TEMPORARY * * * * * * * * * * * * * * * * * */
    // in the future, this will come from a provider
    const [lessonID, setLessonID] = useState<string>('fbd0f0af-da43-4d1c-a0d6-c85ba18d07b0');
    /* * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * */

    const { UID } = useUserRole();
    const [activeModuleID, setActiveModuleID] = useState<string>('');
    const [exercises, setExercises] = useState<Exercise[]>([]);
    const [activeModuleInfo, setActiveModuleInfo] = useState<{ name: string; description: string; id: string }>({ name: '', description: '', id: '' });


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
        //if algorithms are module-to-module, algorithm processing happens in this step, between exercise retrieval and setExercises().
        if (!activeModuleID || !UID) return;

        const retrieveActiveModule = async () => {
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
                setActiveModuleInfo(moduleData);
            }

            const retrieveProgress = async () => {
                // initial check for if user has already completed exercises in this module
                try {
                    const url = `/api/completeExercise?userID=${UID}&lessonID=${lessonID}&moduleID=${activeModuleID}`;
                    const response = await fetch(url, { method: 'GET' });
                    if (!response.ok) {
                        throw new Error('Failed to fetch data');
                    }
                    const data = await response.json();
                    // returning list of ids
                    const parsed = JSON.parse(JSON.stringify(data.data));
                    return Object.keys(parsed);
                } catch (error) {
                    console.error('Error during GET request:', error);
                }
            }

            const retrieveActiveModuleExercises = async (completedExerciseIDs: string[]) => {
                const { data: exerciseData, error: exercisesError } = await supabase
                    .rpc('get_exercises_by_module', { module_id_input: activeModuleID });
                if (exercisesError) {
                    console.error(`Error fetching exercises: ${exercisesError.message}`);
                    return;
                }

                // remove exercises we've already completed
                const filteredExerciseData = exerciseData.filter(
                    (exercise: Exercise) => !completedExerciseIDs.includes(exercise.id)
                );
                setExercises(filteredExerciseData);
            }

            const completedExerciseIDs = await retrieveProgress();
            await retrieveActiveModuleDetails();
            await retrieveActiveModuleExercises(completedExerciseIDs || []);
            setIsLoading(false);
        }

        retrieveActiveModule();


    }, [UID, activeModuleID]);

    useEffect(() => {
        // setup dynamic DB update of activeModuleID
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
                    setActiveModuleID(newModuleID);
                }
            )
            .subscribe();

        return () => {
            subscription.unsubscribe();
        };
    }, [lessonID]);

    const redisDeleteAll = async () => {
        console.log(`Deleting all entries from Redis.`);
        fetch('/api/completeExercise', {
            method: 'DELETE'
        });
    }

    const router = useRouter();
    const handleBack = () => {
        router.push("dashboard");
    };

    if (!isLoading) {
        return (
            <div>
                <div className="relative">
                    <MobileDetailView
                        buttonBar={true}
                        headerContent={
                            <div className="relative flex w-full flex-col gap-[16px]">
                                <div className="flex h-[44px] w-full items-center justify-center">
                                    <h3 className="text-typeface_primary text-body-medium">
                                        {activeModuleInfo.name}
                                    </h3>
                                    <BackButton
                                        variation="button-secondary"
                                        onClick={handleBack}
                                        className="absolute left-0"
                                    />
                                </div>
                            </div>
                        }
                        backgroundColor="bg-surface_bg_highlight"
                        className="px-[16px] pt-[16px]"
                    >
                        <button onClick={redisDeleteAll}>{"[ REDIS DELETE ALL ]"}</button>
                        <ClassModeContentStudent exercises={exercises} UID={UID} lessonID={lessonID} activeModuleID={activeModuleID} />
                    </MobileDetailView>
                </div>
            </div>
        )
    } else {
        return (
            <div>
                classmodecontainer student
                Loading...
            </div>
        )
    }
};






