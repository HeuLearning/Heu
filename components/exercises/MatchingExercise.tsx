import React, { useState, useEffect } from "react";
import WordBankItem from "../../components/exercises/WordBankItem";

import Badge from "../all/Badge";
import Button from "../all/buttons/Button";

import { usePopUp } from "../all/popups/PopUpContext";
import PopUpContainer from "../all/popups/PopUpContainer";
import Textbox from "./Textbox";
import MobileDetailView from "../all/mobile/MobileDetailView";
import ButtonBar from "../all/mobile/ButtonBar";
import { useButtonBar } from "../all/mobile/ButtonBarContext";
import { getGT } from "gt-next";
import dictionary from "@/dictionary";
import { createClient } from "@/utils/supabase/client";
import posthog from 'posthog-js'


interface MatchingExerciseProps {
  instruction: string;
  left_side: string[];
  right_side: string[];
  correct_answer: string[][];
  onComplete: () => void;
}

function MatchingExercise({
  instruction,
  left_side,
  right_side,
  correct_answer,
  onComplete,
}: MatchingExerciseProps) {

  const { showPopUp, updatePopUp, hidePopUp } = usePopUp();
  const t = getGT();
  const supabase = createClient();

  const handleComplete = () => {
    onComplete();
    hidePopUp("correct-answer-popup");
    hidePopUp("incorrect-answer-popup");
  };

  useEffect(() => {
    posthog.init(process.env.NEXT_PUBLIC_POSTHOG_KEY!, {
      api_host: process.env.NEXT_PUBLIC_POSTHOG_HOST,
      person_profiles: 'identified_only',
    });
  }, []);



  const [userAnswers, setUserAnswers] = useState<string[]>(
    Array.from({ length: left_side.length }, () => ""),
  );





  useEffect(() => {
    console.log(userAnswers);
  }, [userAnswers]);


  const { setHandleSubmitAnswer } = useButtonBar();

  useEffect(() => {
    const handleClick = () => {
      if (isCorrect(userAnswers)) {
        showPopUp({
          id: "correct-answer-popup",
          content: (
            <div>
              <div
                className="fixed inset-0 z-10"
                onClick={() => {
                  hidePopUp("correct-answer-popup");
                }}
              />
              <MobileDetailView
                buttonBar={true}
                backgroundColor="bg-surface_bg_highlight"
                className="bottom-0 z-50 max-h-[216px] px-[16px] pt-[16px]"
                headerContent={
                  <div className="flex h-[40px] w-full flex-col justify-center">
                    <h3 className="text-typeface_primary text-h3">
                      {t("class_mode_content.well_done")}
                    </h3>
                  </div>
                }
              >
                <CorrectAnswerContent />
                <div className="-ml-[16px]">
                  <ButtonBar
                    primaryButtonText={t("button_content.continue")}
                    primaryButtonOnClick={handleComplete}
                  />
                </div>
              </MobileDetailView>
            </div>
          ),
          container: null, // Ensure this ID exists in your DOM
          style: {
            overlay: "overlay-high",
          },
          height: "auto",
        });
      } else {
        showPopUp({
          id: "incorrect-answer-popup",
          content: (
            <div>
              <div
                className="fixed inset-0 z-10"
                onClick={() => {
                  hidePopUp("incorrect-answer-popup");
                }}
              />
              <MobileDetailView
                buttonBar={true}
                height={500}
                backgroundColor="bg-surface_bg_highlight"
                className="bottom-0 z-50 overflow-y-auto px-[16px] pt-[16px]"
                headerContent={
                  <div className="flex h-[40px] w-full flex-col justify-center">
                    <h3 className="text-typeface_primary text-h3">
                      {t("class_mode_content.oops")}
                    </h3>
                  </div>
                }
              >
                <IncorrectAnswerContent />
                <div className="-ml-[16px]">
                  <ButtonBar
                    primaryButtonText={t("button_content.continue")}
                    primaryButtonOnClick={handleComplete}
                    primaryButtonDisabled={true}
                  />
                </div>
              </MobileDetailView>
            </div>
          ),
          container: null, // Ensure this ID exists in your DOM
          style: {
            overlay: "overlay-high",
          },
          height: "auto",
        });
      }
    };

    setHandleSubmitAnswer(() => handleClick);

    return () => setHandleSubmitAnswer(() => () => { });
  }, [setHandleSubmitAnswer, userAnswers]);


  const handleSubmit = async () => {
    console.log(userAnswers);

    const correct = isCorrect(userAnswers);

    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser();

    posthog.capture('submissions', {
      timestamp: new Date().toISOString(),
      correct,
      question: instruction,
      userAnswers,
    });


    if (correct) {
      showPopUp({
        id: "correct-answer-popup",
        content: (
          <PopUpContainer
            header={t("class_mode_content.well_done")}
            primaryButtonText={t("button_content.continue")}
            primaryButtonOnClick={handleComplete}
            popUpId="correct-answer-popup"
          >
            <CorrectAnswerContent />
          </PopUpContainer>
        ),
        container: null,
        style: {
          overlay: "overlay-high",
        },
        height: "auto",
      });
    } else {
      showPopUp({
        id: "incorrect-answer-popup",
        content: (
          <PopUpContainer
            header={t("class_mode_content.try_again")}
            primaryButtonText={t("button_content.continue")}
            primaryButtonDisabled={true}
            primaryButtonOnClick={handleComplete}
            popUpId="incorrect-answer-popup"
            closeButton={false}
          >
            <IncorrectAnswerContent />
          </PopUpContainer>
        ),
        container: null,
        style: {
          overlay: "overlay-high",
        },
        height: "auto",
      });
    }
  };

  const CorrectAnswerContent = () => {
    return (
      <p className="text-typeface_primary text-body-regular">
        {t("class_mode_content.correct_answer_message")}
      </p>
    );
  };

  const IncorrectAnswerContent = () => {
    let wrongAnswers: number[] = [];
    let clearedAnswers = [...userAnswers]; // Create a local copy of answers

    userAnswers.forEach((answer, index) => {
      if (
        cleanString(answer.toLowerCase()) !==
        cleanString(correct_answer.map((pair) => pair[1])[index].toLowerCase())
      ) {
        wrongAnswers.push(index);
        clearedAnswers[index] = ""; // Clear the answer locally
      }
    });

    return (
      <div className="space-y-[32px]">
        <p className="text-typeface_primary text-body-regular">
          {t("class_mode_content.incorrect_answer_message")}
        </p>
        <div className="space-y-[16px]">
          <p className="text-typeface_primary text-body-medium">
            {t("class_mode_content.please_type_answers")}
          </p>
          <div className="rounded-[14px] bg-surface_bg_tertiary py-[16px] flex flex-col gap-[24px]">
            {wrongAnswers.map((index) => {
              const question = left_side[index];
              return (
                <div key={index} className="flex flex-col gap-[16px]">
                  <div className="flex items-center">
                    <div className="flex items-center px-[10px]">
                      <Badge
                        bgColor="var(--surface_bg_secondary)"
                        textColor="text-typeface_primary"
                      >
                        {index + 1}
                      </Badge>
                    </div>
                    <div className="flex items-center">
                      <p className="text-typeface_primary text-body-semibold">
                        {question}
                      </p>
                    </div>
                  </div>
                  <div className="w-full px-[10px]">
                    <Textbox
                      size="small"
                      placeholder={correct_answer.map((pair) => pair[1])[index]}
                      width="100%"
                      value={clearedAnswers[index]}
                      onChange={(value) => {
                        clearedAnswers[index] = value;
                        checkAnswer(clearedAnswers);
                      }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    );
  };

  const cleanString = (str: string) =>
    str.toLowerCase().replace(/[^a-z0-9]/g, "");

  const isCorrect = (answers: string[]) => {
    return (
      cleanString(answers.join("").toLowerCase().trim()) ===
      cleanString(
        correct_answer
          .map((pair) => pair[1])
          .join("")
          .toLowerCase()
          .trim(),
      )
    );
  };

  const checkAnswer = (clearedAnswers: string[]) => {
    setUserAnswers(clearedAnswers);
    if (isCorrect(clearedAnswers)) {
      updatePopUp(
        "incorrect-answer-popup",
        <div>
          <div
            className="fixed inset-0 z-10"
            onClick={() => {
              hidePopUp("incorrect-answer-popup");
            }}
          />
          <MobileDetailView
            buttonBar={true}
            backgroundColor="bg-surface_bg_highlight"
            className="bottom-0 z-50 max-h-[570px] overflow-y-auto px-[16px] pb-[32px] pt-[16px]"
            headerContent={
              <div className="flex h-[40px] w-full flex-col justify-center">
                <h3 className="text-typeface_primary text-h3">
                  {t("class_mode_content.well_done")}
                </h3>
              </div>
            }
          >
            <CorrectAnswerContent />
            <div className="-ml-[16px]">
              <ButtonBar
                primaryButtonText={t("button_content.continue")}
                primaryButtonOnClick={handleComplete}
                primaryButtonDisabled={false}
              />
            </div>
          </MobileDetailView>
        </div>,
      );
    }
  };

  const PickOptionsContent = ({
    clickedIndex,
    userAnswers,
  }: {
    clickedIndex: number;
    userAnswers: string[];
  }) => {
    console.log("user answers");
    console.log(userAnswers);
    return (
      <div>
        <div
          className="fixed inset-0 z-10"
          onClick={() => {
            hidePopUp("options-pop-up");
          }}
        />
        <MobileDetailView
          backgroundColor="bg-surface_bg_highlight"
          className="bottom-0 z-50 overflow-y-auto px-[16px] pt-[16px]"
          height={380}
          headerContent={
            <div className="flex h-[40px] w-full flex-col items-center justify-center">
              <h3 className="text-typeface_primary text-body-medium">
                {t("class_mode_content.pick_an_option")}
              </h3>
            </div>
          }
        >
          <div className="flex flex-col gap-[8px] rounded-[14px] bg-surface_bg_tertiary p-[8px]">
            {right_side.map((option, index) => {
              return (
                <WordBankItem
                  id={option}
                  onClick={() => handleSelectOption(clickedIndex, index)}
                  disabled={userAnswers.includes(option)}
                >
                  <div className="flex items-center gap-[8px]">
                    <Badge
                      bgColor={
                        userAnswers.includes(option)
                          ? "var(--surface_bg_tertiary)"
                          : "var(--surface_bg_secondary)"
                      }
                      textColor={
                        userAnswers.includes(option)
                          ? "text-typeface_tertiary"
                          : "text-typeface_primary"
                      }
                    >
                      {String.fromCharCode(65 + index)}
                    </Badge>
                    {option}
                  </div>
                </WordBankItem>
              );
            })}
          </div>
        </MobileDetailView>
      </div>
    );
  };

  const handleSelectOption = (clickedIndex: number, index: number) => {
    setUserAnswers((prevAnswers) => {
      const newAnswers = [...prevAnswers];
      newAnswers[clickedIndex] = right_side[index];

      // Update the popup with the new answers
      updatePopUpWithNewAnswers(clickedIndex, newAnswers);

      console.log("new answers");
      console.log(newAnswers);

      return newAnswers;
    });
  };

  const updatePopUpWithNewAnswers = (
    clickedIndex: number,
    newAnswers: string[],
  ) => {
    updatePopUp(
      "options-pop-up",
      <PickOptionsContent
        clickedIndex={clickedIndex}
        userAnswers={newAnswers}
      />,
    );
  };

  const showOptionsPopUp = (clickedIndex: number) => {
    showPopUp({
      id: "options-pop-up",
      content: (
        <PickOptionsContent
          clickedIndex={clickedIndex}
          userAnswers={userAnswers}
        />
      ),
      container: null, // Ensure this ID exists in your DOM
      style: {
        overlay: "overlay-medium",
      },
      height: "auto",
    });
  };


  return (
    <div className="flex flex-col gap-[32px]">
      <p className="text-typeface_primary text-body-regular">{instruction}</p>
      {left_side.map((question, index) => {
        return (
          <div className="flex flex-col rounded-[14px] bg-surface_bg_tertiary p-[4px]">
            <div key={index} className="mb-[16px] flex w-fit items-center">
              <div className="flex items-center gap-[8px] px-[10px] mt-[10px]">
                <Badge
                  bgColor="var(--surface_bg_secondary)"
                  textColor="text-typeface_primary"
                >
                  {index + 1}
                </Badge>
                <p className="text-typeface_primary text-body-semibold">
                  {question}
                </p>
              </div>
            </div>
            {userAnswers[index] === "" ? (
              <div
                className="border-1px min-h-[44px] flex-1 cursor-pointer rounded-[10px] bg-surface_bg_highlight outline-dashed-surface_border_primary"
                onClick={() => showOptionsPopUp(index)}
              >
                <div>{"                 "}</div>
              </div>
            ) : (
              <WordBankItem
                id={String(index + 1)}
                x={true}
                xButtonOnClick={() => {
                  setUserAnswers((prevAnswers) => {
                    const newAnswers = [...prevAnswers];
                    newAnswers[index] = "";
                    return newAnswers;
                  });
                  updatePopUpWithNewAnswers(index, userAnswers);
                }}
              >
                <div className="flex items-center gap-[8px]">
                  <Badge
                    bgColor="var(--surface_bg_secondary)"
                    textColor="text-typeface_primary"
                  >
                    {String.fromCharCode(
                      65 +
                      right_side.findIndex(
                        (item) => item === userAnswers[index],
                      ),
                    )}
                  </Badge>
                  {userAnswers[index]}
                </div>
              </WordBankItem>
            )}
          </div>
        );
      })}
    </div>
  );



}

export default MatchingExercise;
