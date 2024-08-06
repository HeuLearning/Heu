export default function ImageCard({
  imageLink,
  audio = false,
  checkbox = false,
  caption,
}) {
  return (
    <div className="flex h-[128px] w-[128px] flex-col items-center gap-[8px]">
      <img
        className="rounded-[10px]"
        src="https://media.istockphoto.com/id/1444929379/photo/square-wooden-mock-up-with-sofa-and-green-plants-on-white-wall-in-living-room-3d-illustration.jpg?b=1&s=612x612&w=0&k=20&c=UYpyRLHPyuXcA9EltpNvsl58NXrggXq53jdwhmLFNbE="
      />
      <p className="text-typeface_primary text-body-medium">{caption}</p>
    </div>
  );
}
