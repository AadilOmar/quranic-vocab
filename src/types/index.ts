export type Word = {
  id: string; // e.g. "1:1:1" (surah:ayah:position)
  surahId: number;
  ayahId: number;
  position: number;
  arabic: string;
  transliteration: string;
  translation: string; // word-level meaning
  lemma: string;
  root: string;
  pos: string; // e.g. "noun", "verb", "particle"
};

export type Ayah = {
  id: number;
  surahId: number;
  translation: string;
  words: Word[];
};

export type Surah = {
  id: number;
  arabicName: string;
  englishName: string;
  meaning: string;
  ayahCount: number;
  ayahs: Ayah[];
};
