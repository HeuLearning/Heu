export default function ProfilePic({ size = 32 }) {
  return (
    <div>
      <div style={{ width: size, height: size }}>
        <svg
          style={{ width: "100%", height: "100%" }}
          viewBox="0 0 32 32"
          xmlns="http://www.w3.org/2000/svg"
        >
          <circle cx="16" cy="16" r="16" fill="#5C56E3" />
        </svg>
      </div>
    </div>
  );
}
