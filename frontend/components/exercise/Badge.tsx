const Badge = ({ number }) => {
  return (
    <div
      className="bg-[#EDEDED] text-[#292929]"
      style={{
        width: "24px",
        height: "24px",
        borderRadius: "50%", // Make sure it's a perfect circle
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        boxSizing: "border-box", // Ensure padding/border is within 24px
        padding: "0", // No padding
        margin: "0", // No margin
        flexShrink: "0", // Prevent shrinking
      }}
    >
      <span
        className="font-semibold"
        style={{
          fontSize: "14px", // Ensure the font size is as required
          lineHeight: "16.94px", // Ensure the line height is as required
          letterSpacing: "-2%",
          fontWeight: 600,
          fontFamily: "Inter, sans-serif",
        }}
      >
        {number}
      </span>
    </div>
  );
};

export default Badge;
