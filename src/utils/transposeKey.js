// Chromatic scale
const NOTES = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B']
const FLAT_NOTES = ['C', 'Db', 'D', 'Eb', 'E', 'F', 'Gb', 'G', 'Ab', 'A', 'Bb', 'B']

export const ALL_KEYS = ['C', 'C#', 'Db', 'D', 'D#', 'Eb', 'E', 'F', 'F#', 'Gb', 'G', 'G#', 'Ab', 'A', 'A#', 'Bb', 'B']

export const COMMON_KEYS = ['C', 'D', 'E', 'F', 'G', 'A', 'B', 'Bb', 'Eb', 'Ab', 'Db', 'F#']

function getNoteIndex(note) {
  const idx = NOTES.indexOf(note)
  if (idx !== -1) return idx
  return FLAT_NOTES.indexOf(note)
}

export function transposeChord(chord, semitones) {
  if (!chord) return chord
  // Match root note (e.g. C, C#, Db, etc.)
  const match = chord.match(/^([A-G][b#]?)(.*)$/)
  if (!match) return chord
  const [, root, rest] = match
  const idx = getNoteIndex(root)
  if (idx === -1) return chord
  const newIdx = ((idx + semitones) % 12 + 12) % 12
  // Use flats or sharps based on original
  const useFlats = root.includes('b') || ['F', 'Bb', 'Eb', 'Ab', 'Db', 'Gb'].includes(root)
  const newRoot = useFlats ? FLAT_NOTES[newIdx] : NOTES[newIdx]
  return newRoot + rest
}

export function transposeChordLine(line, semitones) {
  if (!line || semitones === 0) return line
  // Split by spaces and transpose each chord token
  return line.split(/(\s+)/).map(token => {
    if (/^\s+$/.test(token)) return token
    return transposeChord(token, semitones)
  }).join('')
}

export function getSemitones(fromKey, toKey) {
  const from = getNoteIndex(fromKey)
  const to = getNoteIndex(toKey)
  if (from === -1 || to === -1) return 0
  return ((to - from) + 12) % 12
}

export function transposeAllChords(chordsText, fromKey, toKey) {
  if (!chordsText || fromKey === toKey) return chordsText
  const semitones = getSemitones(fromKey, toKey)
  return chordsText.split('\n').map(line => transposeChordLine(line, semitones)).join('\n')
}
