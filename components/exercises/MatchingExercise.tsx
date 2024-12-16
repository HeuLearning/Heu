import React, { useState, useEffect } from "react";
import {
  DndContext,
  closestCenter,
  useSensors,
  useSensor,
  PointerSensor,
  MouseSensor,
  TouchSensor,
  DragEndEvent,
  useDraggable,
  useDroppable,
} from "@dnd-kit/core";
import Badge from "../all/Badge";
import { getGT } from "gt-next";

interface MatchingExerciseContent {
  instruction: string;
  left_side: string[];
  right_side: string[];
  correct_answer: string[][];
}

interface MatchingExerciseProps {
  content: MatchingExerciseContent;
  onComplete: () => void;
}

function MatchingExercise({ content, onComplete }: MatchingExerciseProps) {
  const t = getGT();
  
  const handleComplete = () => {
    onComplete();
  };

  // Create state for draggable and droppable items
  const [dropItems, setDropItems] = useState<string[]>(
    Array.from({ length: content.left_side.length }, () => "")
  );
  const [dragItems, setDragItems] = useState<string[]>(
    Array.from({ length: content.right_side.length }, () => "")
  );

  // Initialize sensors for drag and drop
  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(MouseSensor),
    useSensor(TouchSensor)
  );

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;

    if (over && active.id !== over.id) {
      // Find the index of the dropped element
      const dropItemIndex = content.left_side.indexOf(over.id as string);

      // Set the dropped item in the corresponding drop position
      const updatedDropItems = [...dropItems];
      updatedDropItems[dropItemIndex] = active.id as string;

      setDropItems(updatedDropItems);
    }
  };

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCenter} // Detect closest center for matching
      onDragEnd={handleDragEnd} // Handle when the drag ends
    >
      <div style={{ display: "flex", alignItems: "flex-start" }}>
        {/* Draggable Items */}
        <div style={{ marginRight: "20px" }}>
          {content.right_side.map((item, index) => {
            const { attributes, listeners, setNodeRef } = useDraggable({
              id: item, // Unique ID for each draggable item
            });

            return (
              <div
                ref={setNodeRef}
                key={item}
                style={{
                  padding: "8px",
                  backgroundColor: "#f0f0f0",
                  border: "1px solid #ddd",
                  borderRadius: "5px",
                  marginBottom: "10px",
                  cursor: "move",
                }}
              >
                <div className="flex items-center gap-[8px]">
                  <Badge
                    bgColor="var(--surface_bg_secondary)"
                    textColor="text-typeface_primary"
                  >
                    <p className="uppercase">{String.fromCharCode(65 + index)}</p>
                  </Badge>
                  {item}
                </div>
              </div>
            );
          })}
        </div>

        {/* Drop Zones */}
        <div>
          {content.left_side.map((item, index) => {
            const { setNodeRef } = useDroppable({
              id: item,
            });

            return (
              <div
                key={item}
                ref={setNodeRef}
                style={{
                  display: "flex",
                  alignItems: "center",
                  marginBottom: "10px",
                  padding: "5px",
                  border: "1px solid #ddd",
                  borderRadius: "5px",
                  width: "300px",
                  backgroundColor: dropItems[index] ? "#e0f7fa" : "#fff",
                }}
              >
                {/* Drop Zone */}
                <div
                  style={{
                    width: "30px",
                    height: "30px",
                    marginRight: "10px",
                    backgroundColor: "#e0e0e0",
                    borderRadius: "5px",
                    border: "1px solid #ddd",
                    display: "flex",
                    justifyContent: "center",
                    alignItems: "center",
                    cursor: "pointer",
                  }}
                >
                  <span>+</span>
                </div>

                {/* Placeholder or Dropped Item */}
                <div
                  style={{
                    padding: "8px",
                    backgroundColor: "#fff",
                    border: "1px solid #ddd",
                    borderRadius: "5px",
                    width: "100%",
                  }}
                >
                  {dropItems[index] ? (
                    content.right_side[content.right_side.indexOf(dropItems[index])]
                  ) : (
                    "Drag item here"
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Completion Button */}
      <button onClick={handleComplete} style={{ marginTop: "20px" }}>
        {t("button_content.continue")}
      </button>
    </DndContext>
  );
}

export default MatchingExercise;


//   const CorrectAnswerContent = () => {
//     return (
//       <p className="text-typeface_primary text-body-regular">
//         {t("class_mode_content.correct_answer_message")}
//       </p>
//     );
//   };

//   const IncorrectAnswerContent = () => {
//     let wrongAnswers: number[] = [];
//     let clearedAnswers = [...userAnswers]; // Create a local copy of answers
//     console.log(userAnswers);

//     userAnswers.forEach((answer, index) => {
//       if (
//         cleanString(answer.toLowerCase()) !==
//         cleanString(correct_answer.map((pair) => pair[1])[index].toLowerCase())
//       ) {
//         wrongAnswers.push(index);
//         clearedAnswers[index] = ""; // Clear the answer locally
//       }
//     });

//     console.log(wrongAnswers);

//     console.log("cleared" + clearedAnswers);

//     return (
//       <div className="space-y-[32px]">
//         <p className="text-typeface_primary text-body-regular">
//           {t("class_mode_content.incorrect_answer_message")}
//         </p>
//         <div className="space-y-[16px]">
//           <p className="text-typeface_primary text-body-medium">
//             {t("class_mode_content.please_type_answers")}
//           </p>
//           <div
//             className={`rounded-[14px] bg-surface_bg_tertiary p-[4px] ${isMobile && "flex flex-col gap-[12px]"} `}
//           >
//             {wrongAnswers.map((index) => {
//               const question = left_side[index];
//               return (
//                 <div
//                   className={`flex flex-col ${isMobile && "gap-[8px]"}`}
//                   key={index}
//                 >
//                   <div className="flex items-center gap-[8px]">
//                     <Badge
//                       bgColor="var(--surface_bg_secondary)"
//                       textColor="text-typeface_primary"
//                     >
//                       <p className="uppercase">{index + 1}</p>
//                     </Badge>
//                     <p className="text-typeface_primary text-body-semibold">
//                       {question}
//                     </p>
//                   </div>
//                   <div className="flex gap-[4px]">
//                     <Textbox
//                       size="small"
//                       placeholder={correct_answer.map((pair) => pair[1])[index]}
//                       width={String(
//                         correct_answer.map((pair) => pair[1])[index].length *
//                           10 +
//                           48,
//                       )}
//                       value={clearedAnswers[index]}
//                       onChange={(value) => {
//                         clearedAnswers[index] = value;
//                         checkAnswer(clearedAnswers);
//                       }}
//                     />
//                   </div>
//                 </div>
//               );
//             })}
//           </div>
//         </div>
//       </div>
//     );
//   };

//   const cleanString = (str: string) =>
//     str.toLowerCase().replace(/[^a-z0-9]/g, "");

//   const isCorrect = (answers: string[]) => {
//     return (
//       cleanString(answers.join("").toLowerCase().trim()) ===
//       cleanString(
//         correct_answer
//           .map((pair) => pair[1])
//           .join("")
//           .toLowerCase()
//           .trim(),
//       )
//     );
//   };

//   const checkAnswer = (clearedAnswers: string[]) => {
//     setUserAnswers(clearedAnswers);
//     if (isCorrect(clearedAnswers) && isMobile) {
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
//                   {t("class_mode_content.oops")}
//                 </h3>
//               </div>
//             }
//           >
//             <IncorrectAnswerContent />
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
//     } else if (isCorrect(clearedAnswers)) {
//       setUserAnswers(clearedAnswers);
//       updatePopUp(
//         "incorrect-answer-popup",
//         <PopUpContainer
//           header={t("class_mode_content.try_again")}
//           primaryButtonText={t("button_content.continue")}
//           primaryButtonOnClick={handleComplete}
//           popUpId="incorrect-answer-popup"
//         >
//           <IncorrectAnswerContent />
//         </PopUpContainer>,
//       );
//     }
//   };

//   const PickOptionsContent = ({
//     clickedIndex,
//     userAnswers,
//   }: {
//     clickedIndex: number;
//     userAnswers: string[];
//   }) => {
//     console.log("user answers");
//     console.log(userAnswers);
//     return (
//       <div>
//         <div
//           className="fixed inset-0 z-10"
//           onClick={() => {
//             hidePopUp("options-pop-up");
//           }}
//         />
//         <MobileDetailView
//           backgroundColor="bg-surface_bg_highlight"
//           className="bottom-0 z-50 overflow-y-auto px-[16px] pt-[16px]"
//           height={380}
//           headerContent={
//             <div className="flex h-[40px] w-full flex-col items-center justify-center">
//               <h3 className="text-typeface_primary text-body-medium">
//                 {t("class_mode_content.pick_an_option")}
//               </h3>
//             </div>
//           }
//         >
//           <div className="flex flex-col gap-[8px] rounded-[14px] bg-surface_bg_tertiary p-[8px]">
//             {right_side.map((option, index) => {
//               return (
//                 <WordBankItem
//                   id={option}
//                   onClick={() => handleSelectOption(clickedIndex, index)}
//                   disabled={userAnswers.includes(option)}
//                 >
//                   <div className="flex items-center gap-[8px]">
//                     <Badge
//                       bgColor={
//                         userAnswers.includes(option)
//                           ? "var(--surface_bg_tertiary)"
//                           : "var(--surface_bg_secondary)"
//                       }
//                       textColor={
//                         userAnswers.includes(option)
//                           ? "text-typeface_tertiary"
//                           : "text-typeface_primary"
//                       }
//                     >
//                       {String.fromCharCode(65 + index)}
//                     </Badge>
//                     {option}
//                   </div>
//                 </WordBankItem>
//               );
//             })}
//           </div>
//         </MobileDetailView>
//       </div>
//     );
//   };

//   const handleSelectOption = (clickedIndex: number, index: number) => {
//     setUserAnswers((prevAnswers) => {
//       const newAnswers = [...prevAnswers];
//       newAnswers[clickedIndex] = right_side[index];

//       // Update the popup with the new answers
//       updatePopUpWithNewAnswers(clickedIndex, newAnswers);

//       console.log("new answers");
//       console.log(newAnswers);

//       return newAnswers;
//     });
//   };

//   const updatePopUpWithNewAnswers = (
//     clickedIndex: number,
//     newAnswers: string[],
//   ) => {
//     updatePopUp(
//       "options-pop-up",
//       <PickOptionsContent
//         clickedIndex={clickedIndex}
//         userAnswers={newAnswers}
//       />,
//     );
//   };

//   const showOptionsPopUp = (clickedIndex: number) => {
//     showPopUp({
//       id: "options-pop-up",
//       content: (
//         <PickOptionsContent
//           clickedIndex={clickedIndex}
//           userAnswers={userAnswers}
//         />
//       ),
//       container: null, // Ensure this ID exists in your DOM
//       style: {
//         overlay: "overlay-medium",
//       },
//       height: "auto",
//     });
//   };

//   if (isMobile) {
//     return (
//       <div className="flex flex-col gap-[32px]">
//         <p className="text-typeface_primary text-body-regular">{instruction}</p>
//         {left_side.map((question, index) => {
//           return (
//             <div className="flex flex-col rounded-[14px] bg-surface_bg_tertiary p-[4px]">
//               <div key={index} className="mb-[16px] flex w-fit items-center">
//                 <div className="flex items-center gap-[8px] px-[10px]">
//                   <Badge
//                     bgColor="var(--surface_bg_secondary)"
//                     textColor="text-typeface_primary"
//                   >
//                     {index + 1}
//                   </Badge>
//                   <p className="text-typeface_primary text-body-semibold">
//                     {question}
//                   </p>
//                 </div>
//               </div>
//               {userAnswers[index] === "" ? (
//                 <div
//                   className="border-1px min-h-[44px] flex-1 cursor-pointer rounded-[10px] bg-surface_bg_highlight outline-dashed-surface_border_primary"
//                   onClick={() => showOptionsPopUp(index)}
//                 >
//                   <div>{"                 "}</div>
//                 </div>
//               ) : (
//                 <WordBankItem
//                   id={String(index + 1)}
//                   x={true}
//                   xButtonOnClick={() => {
//                     setUserAnswers((prevAnswers) => {
//                       const newAnswers = [...prevAnswers];
//                       newAnswers[index] = "";
//                       return newAnswers;
//                     });
//                     updatePopUpWithNewAnswers(index, userAnswers);
//                   }}
//                 >
//                   <div className="flex items-center gap-[8px]">
//                     <Badge
//                       bgColor="var(--surface_bg_secondary)"
//                       textColor="text-typeface_primary"
//                     >
//                       {String.fromCharCode(
//                         65 +
//                           right_side.findIndex(
//                             (item) => item === userAnswers[index],
//                           ),
//                       )}
//                     </Badge>
//                     {userAnswers[index]}
//                   </div>
//                 </WordBankItem>
//               )}
//             </div>
//           );
//         })}
//       </div>
//     );
//   }

//   return (
//     <div className="flex flex-col">
//       <p className="text-typeface_primary text-h3">{instruction}</p>
//       <div className="flex h-full w-full items-center justify-center gap-[16px] bg-white p-[24px]">
//         <div className="flex w-[243px] flex-col gap-[4px]">
//           {/* questions */}
//           {left_side.map((string, index) => {
//             return (
//               <WordBankItem id={String(index + 1)}>
//                 <div className="flex items-center gap-[8px]">
//                   <Badge
//                     bgColor="var(--surface_bg_secondary)"
//                     textColor="text-typeface_primary"
//                   >
//                     <p className="uppercase">{index + 1}</p>
//                   </Badge>
//                   {string}
//                 </div>
//               </WordBankItem>
//             );
//           })}
//         </div>
//         <DndContext
//           sensors={sensors}
//           onDragEnd={handleDragEnd}
//           collisionDetection={closestCenter}
//         >
//           <div className="flex gap-[16px]">
//             <div className="flex w-[263px] flex-col gap-[4px] rounded-[14px] bg-surface_bg_secondary p-[4px]">
//               {/* droppable area */}
//               {dropItems.map((item) => (
//                 <WordBankItem
//                   key={item.id}
//                   id={item.id}
//                   droppable={item.droppable}
//                   x={item.x}
//                   xButtonOnClick={() => handleDragDropReset(item.id)}
//                 >
//                   {item.content}
//                 </WordBankItem>
//               ))}
//             </div>
//             <div className="relative flex w-[263px] flex-col rounded-[14px] bg-surface_bg_secondary p-[4px]">
//               <div className="z-[2] flex w-full flex-col gap-[4px]">
//                 {/* word bank */}
//                 {dragItems.map((item) => (
//                   <WordBankItem
//                     key={item.id}
//                     id={item.id}
//                     draggable={item.draggable}
//                     x={item.x}
//                   >
//                     {item.content}
//                   </WordBankItem>
//                 ))}
//               </div>
//               <div className="border-1px absolute left-0 top-0 z-[0] flex w-[263px] flex-col gap-[4px] rounded-[14px] border-dashed border-surface_border_primary p-[4px]">
//                 {placeholders.map((item) => (
//                   <WordBankItem
//                     key={item.id}
//                     id={item.id}
//                     droppable={item.droppable}
//                     placeholder={item.placeholder}
//                   />
//                 ))}
//               </div>
//             </div>
//           </div>
//         </DndContext>
//       </div>
//       <div className="self-end">
//         {!isMobile && (
//           <Button className="button-primary" onClick={handleSubmit}>
//             {t("button_content.submit_answer")}
//           </Button>
//         )}
//       </div>
//     </div>
//   );
// }

// export default MatchingExercise;
