import React, { useEffect, useState, useMemo } from "react";
import { useResponsive } from "../ResponsiveContext";
import InstructorContent from "@/components/exercises/InstructorContent";
import ButtonBar from "../mobile/ButtonBar";
import { getGT } from "gt-next";

interface ClassModeContentInstructorProps {
    instructor_content: string;
}

function ClassModeContentInstructor({ instructor_content }: ClassModeContentInstructorProps) {
    const t = getGT();
    const { isMobile } = useResponsive();

    return (
        <div>
            <div className="flex h-full w-full items-center justify-center">
                <div className="flex flex-col">
                    <InstructorContent
                        instruction={instructor_content}
                    />
                </div>
            </div>
            {isMobile && (
                <div className="-ml-[16px]">
                    <ButtonBar
                        primaryButtonText={t("button_content.continue")}
                        primaryButtonClassName="button-primary"
                        primaryButtonOnClick={() => { }} // what the fuck
                        secondaryContent={
                            <div className="flex items-center gap-[4px] pl-[8px]">
                                <svg
                                    width="16"
                                    height="16"
                                    viewBox="0 0 16 16"
                                    fill="none"
                                    xmlns="http://www.w3.org/2000/svg"
                                >
                                    <path
                                        fillRule="evenodd"
                                        clipRule="evenodd"
                                        d="M8 14C11.3137 14 14 11.3137 14 8C14 4.68629 11.3137 2 8 2C4.68629 2 2 4.68629 2 8C2 11.3137 4.68629 14 8 14ZM7.25 4V8V8.31066L7.46967 8.53033L9.96967 11.0303L11.0303 9.96967L8.75 7.68934V4H7.25Z"
                                        fill="var(--typeface_primary)"
                                    />
                                </svg>
                                <p className="whitespace-nowrap text-typeface_primary text-body-semibold">
                                    x mins left
                                </p>
                            </div>
                        }
                    />
                </div>
            )}
        </div>
    );
}

export default React.memo(ClassModeContentInstructor);