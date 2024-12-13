import { useState, useEffect } from "react";
import Button from "../all/buttons/Button";
import { usePopUp } from "../all/popups/PopUpContext";
import { useResponsive } from "../all/ResponsiveContext";
import { useButtonBar } from "../all/mobile/ButtonBarContext";
import Textbox from "./Textbox";
import { getGT } from "gt-next";

import { createClient } from "@/utils/supabase/client";
import PopUpContainer from "../all/popups/PopUpContainer";
import MobileDetailView from "../all/mobile/MobileDetailView";
import ButtonBar from "../all/mobile/ButtonBar";


interface TextSubmissionContent{
  instruction: string;
  question: string;
  size: "small" | "big";
  correctAnswer: string;

}

interface TextSubmissionExerciseProps {
  content: TextSubmissionContent;
  onComplete: () => void;
}


export default function TextSubmissionExercise({ 
  content, 
  onComplete,
 
 
}: TextSubmissionExerciseProps) {
  const { isMobile } = useResponsive();
  const t = getGT();
  const [answer, setAnswer] = useState("");
  const [cleared, setCleared] = useState(false);
  const handleComplete = () => {

      onComplete(); 
  };
  const isCorrect = (userAnswer: string): boolean => {
         return userAnswer.toLowerCase().trim() === content.correctAnswer.toLowerCase().trim();
     };
  
  
  return (
    <div>
    
    <h1>{content.instruction}</h1>
   
    <p> {content.question}     </p>

    <Textbox 
    size={"small"} 
    placeholder={"enter answer here"} width={""} 
    value={answer}
    onChange= {(value) => {
                  setAnswer(value);
                  setCleared(false);
                 }} 
    ></Textbox>

   
     <div className="self-end">
     <Button 
       className="button-primary" 
       onClick={() => {
        if (isCorrect(answer)) 
          onComplete();
        else{

        setCleared(true);
        setAnswer("");
        
        }     
      }}
     >
       {"Submit"}
     </Button>
   </div>
   
    <div>
      {cleared &&(<h1>Try again</h1>)}
    </div>

   
     
    
  </div>
  )


    }

// export default function TextSubmissionExercise({
//   instruction,
//   question,
//   size = "big",
//   correctAnswer,
//   onComplete,
// }: TextSubmissionExerciseProps) {
//   const [answer, setAnswer] = useState("");
//   const { showPopUp, hidePopUp, updatePopUp } = usePopUp();
//   const { isMobile } = useResponsive();
//   const { setHandleSubmitAnswer } = useButtonBar();
//   const t = getGT();
//   const supabase = createClient();

//   useEffect(() => {
//     posthog.init(process.env.NEXT_PUBLIC_POSTHOG_KEY!, {
//       api_host: process.env.NEXT_PUBLIC_POSTHOG_HOST,
//       person_profiles: 'identified_only',
//     });
//   }, []);

//   const handleComplete = () => {
//     onComplete();
//     hidePopUp("correct-answer-popup");
//     hidePopUp("incorrect-answer-popup");
//   };

//   const isCorrect = (userAnswer: string): boolean => {
//     return userAnswer.toLowerCase().trim() === correctAnswer.toLowerCase().trim();
//   };

//   const CorrectAnswerContent = () => {
//     return (
//       <p className="text-typeface_primary text-body-regular">
//         {t("class_mode_content.correct_answer_message")}
//       </p>
//     );
//   };

//   const IncorrectAnswerContent = () => {
//     let clearedAnswer = "";
//     return (
//       <div className="space-y-[32px]">
//         <p className="text-typeface_primary text-body-regular">
//           {t("class_mode_content.incorrect_answer_message")}
//         </p>
//         <div className="space-y-[16px]">
//           <p className="text-typeface_primary text-body-medium">
//             {t("class_mode_content.please_type_answers")}
//           </p>
//           <div className={`rounded-[14px] bg-surface_bg_tertiary p-[8px] ${isMobile ? "flex flex-col gap-[24px]" : ""}`}>
//             <Textbox
//               size="small"
//               placeholder={correctAnswer}
//               width="100%"
//               value={clearedAnswer}
//               onChange={(value) => {
//                 clearedAnswer = value;
//                 setAnswer(value);
//                 checkAnswers(clearedAnswer);
//               }}
//             />
//           </div>
//         </div>
//       </div>
//     );
//   };

//   const checkAnswers = (clearedAnswer: string) => {
//     if (isCorrect(clearedAnswer) && isMobile) {
//       updatePopUp(
//         "incorrect-answer-popup",
//         <div>
//           <div
//             className="fixed inset-0 z-10"
//             onClick={() => {
//               hidePopUp("incorrect-answer-popup");
//             }}
//           />
//           <MobileDetailView
//             buttonBar={true}
//             backgroundColor="bg-surface_bg_highlight"
//             className="bottom-0 z-50 max-h-[570px] overflow-y-auto px-[16px] pb-[32px] pt-[16px]"
//             headerContent={
//               <div className="flex h-[40px] w-full flex-col justify-center">
//                 <h3 className="text-typeface_primary text-h3">
//                   {t("class_mode_content.well_done")}
//                 </h3>
//               </div>
//             }
//           >
//             <CorrectAnswerContent />
//             <div className="-ml-[16px]">
//               <ButtonBar
//                 primaryButtonText={t("button_content.continue")}
//                 primaryButtonOnClick={handleComplete}
//                 primaryButtonDisabled={false}
//               />
//             </div>
//           </MobileDetailView>
//         </div>,
//       );
//     } else if (isCorrect(clearedAnswer)) {
//       updatePopUp(
//         "incorrect-answer-popup",
//         <PopUpContainer
//           header={t("class_mode_content.well_done")}
//           primaryButtonText={t("button_content.continue")}
//           primaryButtonOnClick={handleComplete}
//           popUpId="incorrect-answer-popup"
//         >
//           <CorrectAnswerContent />
//         </PopUpContainer>,
//       );
//     }
//   };

//   const handleSubmit = async () => {
//     const correct = isCorrect(answer);

//     const {
//       data: { user },
//     } = await supabase.auth.getUser();

//     posthog.capture('submissions', {
//       timestamp: new Date().toISOString(),
//       correct,
//       question: question,
//       answer,
//     });

//     if (correct) {
//       showPopUp({
//         id: "correct-answer-popup",
//         content: (
//           <PopUpContainer
//             header={t("class_mode_content.well_done")}
//             primaryButtonText={t("button_content.continue")}
//             primaryButtonOnClick={handleComplete}
//             popUpId="correct-answer-popup"
//           >
//             <CorrectAnswerContent />
//           </PopUpContainer>
//         ),
//         container: null,
//         style: {
//           overlay: "overlay-high",
//         },
//         height: "auto",
//       });
//     } else {
//       showPopUp({
//         id: "incorrect-answer-popup",
//         content: (
//           <PopUpContainer
//             header={t("class_mode_content.try_again")}
//             primaryButtonText={t("button_content.continue")}
//             primaryButtonDisabled={true}
//             primaryButtonOnClick={handleComplete}
//             popUpId="incorrect-answer-popup"
//             closeButton={false}
//           >
//             <IncorrectAnswerContent />
//           </PopUpContainer>
//         ),
//         container: null,
//         style: {
//           overlay: "overlay-high",
//         },
//         height: "auto",
//       });
//     }
//   };

//   if (isMobile) {
//     useEffect(() => {
//       setHandleSubmitAnswer(() => handleSubmit);
//     }, [answer]);
//   }

//   return (
//     <div className="flex flex-col gap-[32px]">
//       <p className="text-typeface_primary text-body-regular">{instruction}</p>
//       <p className="text-typface_primary text-h3">{question}</p>
//       <div className="flex flex-col gap-2">
//         <Textbox
//           size={size}
//           placeholder={t("class_mode_content.enter_text_here")}
//           width="100%"
//           value={answer}
//           onChange={(value) => {
//             setAnswer(value);
//           }}
//         />
//       </div>
//       {!isMobile && (
//         <div className="self-end">
//           <Button 
//             className="button-primary" 
//             onClick={handleSubmit}
//             disabled={!answer}
//           >
//             {t("button_content.submit_answer")}
//           </Button>
//         </div>
//       )}
//     </div>
//   );
// }
