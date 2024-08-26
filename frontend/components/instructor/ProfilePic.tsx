export default function ProfilePic({ size = 32, isMobile = false }) {
  if (isMobile && size === 32) {
    return (
      <div style={{ width: size, height: size }}>
        <svg
          style={{ width: "100%", height: "100%" }}
          viewBox="0 0 32 32"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <circle cx="16" cy="16" r="16" fill="#C2ABFB" />
        </svg>
      </div>
    );
  }
  return (
    <div style={{ width: size, height: size }}>
      <svg
        style={{ width: "100%", height: "100%" }}
        viewBox="0 0 32 32"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <circle cx="16" cy="16" r="12" fill="#C2ABFB" />
      </svg>
    </div>
  );
}
