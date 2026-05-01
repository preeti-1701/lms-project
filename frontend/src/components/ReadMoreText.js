import React, { useMemo, useState } from 'react';

function ReadMoreText({ text, className = '', fallback = 'No description available.' }) {
  const [expanded, setExpanded] = useState(false);

  const content = useMemo(() => {
    if (text && text.trim()) {
      return text;
    }

    return fallback;
  }, [fallback, text]);

  const canToggle = content !== fallback && content.length > 140;

  return (
    <div className="relative">
      <p
        className={`${className} ${expanded ? '' : 'line-clamp-2 pr-20'}`}
        title={content}
      >
        {content}
      </p>
      {canToggle && !expanded && (
        <button
          type="button"
          onClick={() => setExpanded((value) => !value)}
          aria-expanded={expanded}
          className="absolute bottom-0 right-0 inline-flex rounded-l-full bg-slate-950/90 pl-3 text-sm font-medium text-cyan-300 underline decoration-cyan-400/40 underline-offset-4 transition hover:text-cyan-200"
        >
          Read more
        </button>
      )}
      {canToggle && expanded && (
        <button
          type="button"
          onClick={() => setExpanded((value) => !value)}
          aria-expanded={expanded}
          className="mt-2 inline-flex text-sm font-medium text-cyan-300 underline decoration-cyan-400/40 underline-offset-4 transition hover:text-cyan-200"
        >
          Show less
        </button>
      )}
    </div>
  );
}

export default ReadMoreText;