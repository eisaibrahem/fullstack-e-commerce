"use client";

import { useState } from "react";

const gradients = [
  "from-blue-500 to-purple-600",
  "from-emerald-500 to-teal-600",
  "from-orange-500 to-red-600",
  "from-pink-500 to-rose-600",
  "from-cyan-500 to-blue-600",
  "from-violet-500 to-indigo-600",
  "from-amber-500 to-orange-600",
  "from-lime-500 to-green-600",
];

function getGradient(name: string) {
  let hash = 0;
  for (let i = 0; i < name.length; i++) {
    hash = name.charCodeAt(i) + ((hash << 5) - hash);
  }
  return gradients[Math.abs(hash) % gradients.length];
}

export function ProductImage({
  src,
  alt,
  className = "",
}: {
  src?: string | null;
  alt: string;
  className?: string;
}) {
  const [error, setError] = useState(false);

  if (!src || error) {
    const gradient = getGradient(alt);
    return (
      <div
        className={`bg-gradient-to-br ${gradient} flex items-center justify-center ${className}`}
      >
        <span className="text-white text-4xl font-bold uppercase">
          {alt?.charAt(0) || "?"}
        </span>
      </div>
    );
  }

  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={src}
      alt={alt}
      className={className}
      onError={() => setError(true)}
    />
  );
}
