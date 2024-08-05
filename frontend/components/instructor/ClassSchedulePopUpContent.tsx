import PopUp from "./PopUp";
import XButton from "./XButton";
import ShowMoreButton from "./ShowMoreButton";
import ClassItemDetailed from "./ClassItemDetailed";

export default function ClassSchedulePopUpContainer({ modules }) {
  return (
    <div>
      <div className="flex flex-col gap-[12px]">
        <ShowMoreButton
          title="Past perfect + Kitchen Vocabulary"
          subtitle="10:00 - 10:15"
          childrenStyling="px-[8px] pt-[24px] pb-[12px] gap-[24px]"
        >
          {modules.map((module) => (
            <ClassItemDetailed
              number={module.id}
              title={module.title}
              description={module.description}
            />
          ))}
        </ShowMoreButton>
        <ShowMoreButton
          title="Grammatical Conjugation"
          subtitle="10:15 - 10:30"
          childrenStyling="px-[8px] py-[24px] gap-[24px]"
        >
          blah
        </ShowMoreButton>
        <ShowMoreButton
          title="Grammatical Conjugation"
          subtitle="10:30 - 10:45"
          childrenStyling="px-[8px] py-[24px] gap-[24px]"
        >
          blah
        </ShowMoreButton>
        <ShowMoreButton
          title="Grammatical Conjugation"
          subtitle="10:45 - 11:00"
          childrenStyling="px-[8px] py-[24px] gap-[24px]"
        >
          blah
        </ShowMoreButton>
      </div>
    </div>
  );
}
