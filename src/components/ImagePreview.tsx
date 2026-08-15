import { useEffect, useState } from "react";

export default function ImagePreview({ url }: { url: string }) {
  const [broken, setBroken] = useState(false);

  useEffect(() => {
    setBroken(false);
  }, [url]);

  return (
    <div className="image-preview">
      {url && !broken ? (
        <img src={url} alt="" onError={() => setBroken(true)} />
      ) : (
        <span className="muted">{url ? "Can't load image" : "No image"}</span>
      )}
    </div>
  );
}
