import { useState } from "react";
import { Film } from "lucide-react";

export default function Poster({ url, title }) {
  const [errored, setErrored] = useState(false);

  if (!url || url === "N/A" || errored) {
    return (
      <div className="poster poster--empty">
        <Film size={28} strokeWidth={1.5} />
        <span>{title}</span>
      </div>
    );
  }

  return (
    <img
      src={url}
      alt={title}
      onError={() => setErrored(true)}
      className="poster"
    />
  );
}