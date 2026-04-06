"use client";

import { Word } from "@/types";

type Props = {
  word: Word;
  isSelected: boolean;
  isSaved: boolean;
  onTap: (word: Word) => void;
};

export default function ArabicWord({ word, isSelected, isSaved, onTap }: Props) {
  return (
    <span
      onClick={() => onTap(word)}
      onContextMenu={(e) => e.preventDefault()}
      translate="no"
      style={{ WebkitTouchCallout: "none", WebkitUserSelect: "none" }}
      className={`
        inline-block cursor-pointer rounded px-1 py-0.5 mx-0.5
        text-2xl leading-loose font-arabic transition-colors duration-150
        select-none touch-manipulation
        ${isSelected
          ? "bg-amber-200 text-amber-900"
          : "hover:bg-amber-50 active:bg-amber-100"
        }
        ${isSaved && !isSelected && word.lemma ? "underline decoration-amber-400 decoration-2 underline-offset-4" : ""}
      `}
    >
      {word.arabic}
    </span>
  );
}
