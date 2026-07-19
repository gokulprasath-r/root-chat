/* eslint-disable @next/next/no-img-element */

// Avatar: shows the uploaded profile picture when there is one, otherwise a
// coloured circle with the first letter of the name.
export default function Avatar({
  name,
  color,
  size = 44,
  src,
}: {
  name: string;
  color: string;
  size?: number;
  src?: string;
}) {
  if (src) {
    return (
      <img
        src={src}
        alt={name}
        style={{ width: size, height: size }}
        className="flex-shrink-0 rounded-full object-cover"
      />
    );
  }

  return (
    <div
      className="flex flex-shrink-0 items-center justify-center rounded-full font-semibold text-white"
      style={{ width: size, height: size, backgroundColor: color, fontSize: size * 0.4 }}
    >
      {name.charAt(0).toUpperCase()}
    </div>
  );
}
