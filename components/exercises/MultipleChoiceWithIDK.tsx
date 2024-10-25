import { useState, useEffect } from "react";
import Button from "../all/buttons/Button";
import { usePopUp } from "../all/popups/PopUpContext";
import { useResponsive } from "../all/ResponsiveContext";
import { useButtonBar } from "../all/mobile/ButtonBarContext";
import { getGT } from "gt-next";
import posthog from 'posthog-js';
import { createClient } from "@/utils/supabase/client";

interface MultipleChoiceWithIDKProps {
  instruction: string;
  question: string;
  options: string[];
  correct_answer: string;
  onComplete: () => void;
}

export default function MultipleChoiceWithIDK({
  instruction,
  question,
  options,
  correct_answer,
  onComplete,
}: MultipleChoiceWithIDKProps) {
  const [selectedOption, setSelectedOption] = useState<string | null>(null);
  const [isDontKnow, setIsDontKnow] = useState(false);
  const { showPopUp, hidePopUp } = usePopUp();
  const { isMobile } = useResponsive();
  const { setHandleSubmitAnswer } = useButtonBar();
  const t = getGT();
  const supabase = createClient();

  useEffect(() => {
    posthog.init(process.env.NEXT_PUBLIC_POSTHOG_KEY!, {
      api_host: process.env.NEXT_PUBLIC_POSTHOG_HOST,
      person_profiles: 'identified_only',
    });
  }, []);

  const handleOptionSelect = (option: string) => {
    setSelectedOption(option);
    setIsDontKnow(false);
  };

  const handleDontKnow = () => {
    setSelectedOption(null);
    setIsDontKnow(true);
  };

  const handleSubmit = () => {
    if (isDontKnow) {
      onComplete();
      return;
    }

    if (selectedOption === correct_answer) {
      if (!isMobile) {
        showPopUp({
          id: "correct-answer-popup",
          content: (
            <div className="p-4">
              <h3 className="mb-2 text-lg font-bold">{t("class_mode_content.well_done")}</h3>
              <p>{t("class_mode_content.correct_answer")}</p>
              <Button className="mt-4" onClick={() => { hidePopUp("correct-answer-popup"); onComplete(); }}>
                {t("button_content.continue")}
              </Button>
            </div>
          ),
          container: null,
          style: { overlay: "overlay-high" },
          height: "auto",
        });
      } else {
        onComplete();
      }
    } else {
      if (!isMobile) {
        showPopUp({
          id: "incorrect-answer-popup",
          content: (
            <div className="p-4">
              <h3 className="mb-2 text-lg font-bold">{t("class_mode_content.oops")}</h3>
              <p>{t("class_mode_content.incorrect_answer")}</p>
              <p>{t("class_mode_content.correct_answer_is", { answer: correct_answer })}</p>
              <Button className="mt-4" onClick={() => { hidePopUp("incorrect-answer-popup"); onComplete(); }}>
                {t("button_content.continue")}
              </Button>
            </div>
          ),
          container: null,
          style: { overlay: "overlay-high" },
          height: "auto",
        });
      } else {
        onComplete();
      }
    }
  };

  useEffect(() => {
    if (isMobile) {
      setHandleSubmitAnswer(() => handleSubmit);
    }
  }, [isMobile, selectedOption, isDontKnow]);

  return (
    <div className="space-y-4">
      <div className="text-lg font-semibold">{instruction}</div>
      <div className="text-base">{question}</div>
      <div className="space-y-2">
        {options.map((option, index) => (
          <div key={index} className="flex items-center space-x-2">
            <input
              type="radio"
              id={`option-${index}`}
              name="multipleChoice"
              value={option}
              checked={selectedOption === option}
              onChange={() => handleOptionSelect(option)}
              className="h-4 w-4"
            />
            <label htmlFor={`option-${index}`} className="text-sm">{option}</label>
          </div>
        ))}
      </div>
      <div className="flex items-center space-x-4">
        <Button
          className={`px-4 py-2 ${isDontKnow ? 'bg-gray-300' : 'bg-blue-500 text-white'}`}
          onClick={handleDontKnow}
        >
          {t("button_content.i_dont_know")}
        </Button>
        {!isMobile && (
          <Button className="bg-green-500 px-4 py-2 text-white" onClick={handleSubmit}>
            {t("button_content.submit_answer")}
          </Button>
        )}
      </div>
    </div>
  );
}
