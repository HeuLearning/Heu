import Button from "./Button";

export default function NavButtons({ buttonOptions, selectedButton }) {
  return (
    <div className="flex space-x-[12px]">
      {buttonOptions.map((buttonText) =>
        buttonText === selectedButton ? (
          <Button className="bg-white text-typeface_primary drop-shadow-sm text-body-semibold-cap-height">
            {buttonText}
          </Button>
        ) : (
          <Button className="bg-[#F5F5F5] text-typeface_primary text-body-medium-cap-height">
            {buttonText}
          </Button>
        )
      )}
    </div>
  );
}
