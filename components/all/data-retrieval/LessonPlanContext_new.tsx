
import { createClient } from "@/utils/supabase/client";
import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';


const supabase = createClient();


// Define the context types
interface ModuleOverview {
    id: string;
    name?: string;
    description?: string;
    duration: number;
    index: number;
}

interface PhaseOverview {
    id: string;
    name?: string;
    description?: string;
    type: string;
    index: number;
    modules: ModuleOverview[];
}

export interface LessonSummary {
    id: string;
    name?: string;
    description?: string;
    phases: PhaseOverview[];
}

interface LessonSummaryContextType {
    lessonSummary: LessonSummary | null;
    loading: boolean;
    error: string | null;
}

const LessonSummaryContext = createContext<LessonSummaryContextType | undefined>(undefined);

export const useLessonSummary = (): LessonSummaryContextType => {
    const context = useContext(LessonSummaryContext);
    if (!context) {
        throw new Error('useLessonSummary must be used within a LessonSummaryProvider');
    }
    return context;
};

interface LessonSummaryProviderProps {
    children: ReactNode;
    lessonPlanID: string;
}

// Provider component
export const LessonSummaryProvider: React.FC<LessonSummaryProviderProps> = ({ children, lessonPlanID }) => {
    const [lessonSummary, setLessonSummary] = useState<LessonSummary | null>(null);
    const [loading, setLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const fetchLessonSummary = async () => {
            setLoading(true);
            setError(null);

            try {
                const { data: phaseData, error: phaseError } = await supabase
                    .from('lesson_plan_phases')
                    .select(`
            phase_id,
            phase_order,
            phases_new(id, name, description, type)
          `)
                    .eq('lesson_plan_id', lessonPlanID)
                    .order('phase_order', { ascending: true });

                if (phaseError) throw phaseError;

                const phaseOverviewPromises = phaseData.map(async (phase) => {
                    const { data: moduleData, error: moduleError } = await supabase
                        .from('phase_modules')
                        .select(`
      module_id,
      module_order,
      modules_new(id, name, description, duration)
    `)
                        .eq('phase_id', phase.phase_id)
                        .order('module_order', { ascending: true });

                    if (moduleError) throw moduleError;

                    // Now checking if moduleData contains an array and we need to map through it
                    const modules: ModuleOverview[] = moduleData.map((module) => {
                        const modulesNew = module.modules_new; // module.modules_new is an object, not an array
                        return {
                            id: modulesNew.id, // Now safely access the 'id' property of the modules_new object
                            name: modulesNew.name,
                            description: modulesNew.description,
                            duration: modulesNew.duration,
                            index: module.module_order,
                        };
                    });

                    return {
                        id: phase.phases_new.id,
                        name: phase.phases_new.name,
                        description: phase.phases_new.description,
                        type: phase.phases_new.type,
                        index: phase.phase_order,
                        modules, // Now modules are correctly mapped
                    };
                });



                const phases: PhaseOverview[] = await Promise.all(phaseOverviewPromises);

                setLessonSummary({
                    id: lessonPlanID,
                    name: null, // If `name` and `description` are stored in `lesson_plans_new`, include them here.
                    description: null,
                    phases,
                });
            } catch (err: any) {
                setError(err.message || 'An error occurred while fetching the lesson summary.');
            } finally {
                setLoading(false);
            }
        };

        fetchLessonSummary();
    }, [lessonPlanID]);

    return (
        <LessonSummaryContext.Provider value={{ lessonSummary, loading, error }}>
            {children}
        </LessonSummaryContext.Provider>
    );
};
