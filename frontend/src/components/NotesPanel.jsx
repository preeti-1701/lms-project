import { useState } from "react";

export default function NotesPanel({ courseId }) {
  const [notes, setNotes] = useState(
    localStorage.getItem(`notes-${courseId}`) || ""
  );

  const handleSave = (val) => {
    setNotes(val);
    localStorage.setItem(`notes-${courseId}`, val);
  };

  return (
    <div className="mt-4">
      <textarea
        value={notes}
        onChange={(e) => handleSave(e.target.value)}
        className="w-full border p-2 rounded"
        placeholder="Write notes..."
      />
    </div>
  );
}