import jsPDF from 'jspdf'
import autoTable from 'jspdf-autotable'
import { saveAs } from 'file-saver'
import * as XLSX from 'xlsx'
import {
  Document, Packer, Paragraph, TextRun, HeadingLevel,
  AlignmentType, PageBreak,
} from 'docx'

// PDF pt sizes — minimum 16pt (≈ 21px) for readability
const PT = {
  title:     28,   // set title
  songTitle: 20,   // each song title
  artist:    16,   // artist name
  body:      16,   // normal text
  label:     14,   // small caps labels (badge, section)
  mono:      15,   // chord lines (Courier)
}

// ─── PDF Export ───────────────────────────────────────────────
export function exportToPDF(songs, setTitle = 'Worship Set') {
  const doc = new jsPDF({ unit: 'pt', format: 'a4' })
  const pageW = doc.internal.pageSize.getWidth()
  const margin = 48
  const contentW = pageW - margin * 2
  let y = 52

  const checkPage = (needed = 30) => {
    if (y + needed > doc.internal.pageSize.getHeight() - 48) {
      doc.addPage(); y = 52
    }
  }

  // ── Set title ──
  doc.setFont('helvetica', 'bold')
  doc.setFontSize(PT.title)
  doc.setTextColor(36, 30, 22)
  doc.text(setTitle, margin, y)
  y += PT.title * 0.5 + 8

  doc.setFont('helvetica', 'normal')
  doc.setFontSize(PT.body)
  doc.setTextColor(130, 110, 90)
  doc.text(
    `Generated ${new Date().toLocaleDateString('en-PH', { dateStyle: 'long' })}  •  ${songs.length} song${songs.length !== 1 ? 's' : ''}`,
    margin, y
  )
  y += 16

  // Divider
  doc.setDrawColor(200, 185, 160)
  doc.setLineWidth(1)
  doc.line(margin, y, pageW - margin, y)
  y += 24

  songs.forEach((song, i) => {
    checkPage(100)

    // ── Song title + type badge ──
    doc.setFont('helvetica', 'bold')
    doc.setFontSize(PT.songTitle)
    doc.setTextColor(36, 30, 22)
    doc.text(`${i + 1}. ${song.title}`, margin, y)

    const badgeColor = song.type === 'praise' ? [232, 93, 53] : [91, 140, 222]
    doc.setFillColor(...badgeColor)
    doc.setTextColor(255, 255, 255)
    doc.setFont('helvetica', 'bold')
    doc.setFontSize(PT.label)
    const badgeText = song.type.toUpperCase()
    const bW = doc.getTextWidth(badgeText) + 12
    doc.roundedRect(pageW - margin - bW, y - PT.label, bW, PT.label + 6, 4, 4, 'F')
    doc.text(badgeText, pageW - margin - bW + 6, y - 1)
    doc.setTextColor(36, 30, 22)
    y += PT.songTitle * 0.6 + 4

    // Artist
    if (song.artist) {
      doc.setFont('helvetica', 'italic')
      doc.setFontSize(PT.artist)
      doc.setTextColor(100, 82, 64)
      doc.text(song.artist, margin, y)
      y += PT.artist * 0.7 + 4
    }

    // Key info
    if (song.originalKey) {
      doc.setFont('helvetica', 'bold')
      doc.setFontSize(PT.body)
      doc.setTextColor(60, 50, 40)
      let keyText = `Key: ${song.originalKey}`
      if (song.performKey && song.performKey !== song.originalKey) {
        keyText += `   →   Perform in: ${song.performKey}`
        doc.text(keyText, margin, y)
        // KEY CHANGE label
        doc.setFillColor(255, 237, 180)
        doc.setTextColor(180, 120, 0)
        doc.setFontSize(PT.label)
        const kW = doc.getTextWidth('⚠ KEY CHANGE') + 10
        doc.roundedRect(margin + doc.getTextWidth(keyText) + 10, y - PT.label + 2, kW, PT.label + 4, 3, 3, 'F')
        doc.text('⚠ KEY CHANGE', margin + doc.getTextWidth(keyText) + 15, y + 1)
      } else {
        doc.text(keyText, margin, y)
      }
      doc.setTextColor(36, 30, 22)
      y += PT.body * 0.7 + 4
    }

    // Tempo / time sig
    const meta = []
    if (song.tempo) meta.push(`♩ ${song.tempo} BPM`)
    if (song.timeSignature) meta.push(song.timeSignature)
    if (meta.length) {
      doc.setFont('helvetica', 'normal')
      doc.setFontSize(PT.body)
      doc.setTextColor(100, 82, 64)
      doc.text(meta.join('     '), margin, y)
      y += PT.body * 0.7 + 4
    }

    // Chords
    if (song.chords) {
      checkPage(40)
      doc.setFont('helvetica', 'bold')
      doc.setFontSize(PT.label)
      doc.setTextColor(130, 110, 90)
      doc.text('CHORDS', margin, y)
      y += PT.label * 0.7 + 6

      doc.setFont('courier', 'normal')
      doc.setFontSize(PT.mono)
      doc.setTextColor(40, 32, 24)
      const chordLines = song.chords.split('\n')
      chordLines.forEach(line => {
        checkPage(PT.mono * 1.4)
        const wrapped = doc.splitTextToSize(line || ' ', contentW)
        wrapped.forEach(l => {
          doc.text(l, margin, y)
          y += PT.mono * 1.3
        })
      })
      y += 4
    }

    // Progressions
    if (song.progressions?.length > 0) {
      checkPage(40)
      doc.setFont('helvetica', 'bold')
      doc.setFontSize(PT.label)
      doc.setTextColor(130, 110, 90)
      doc.text('NUMBER SYSTEM / PROGRESSIONS', margin, y)
      y += PT.label * 0.7 + 6

      song.progressions.forEach(prog => {
        checkPage(PT.body * 1.6)
        doc.setFont('courier', 'normal')
        doc.setFontSize(PT.body)
        doc.setTextColor(40, 32, 24)
        const label = prog.label ? `${prog.label}: ` : ''
        doc.setFont('courier', 'bold')
        doc.text(label, margin, y)
        doc.setFont('courier', 'normal')
        doc.text(prog.pattern, margin + doc.getTextWidth(label), y)
        y += PT.body * 1.3
      })
      y += 4
    }

    // Notes
    if (song.notes) {
      checkPage(40)
      doc.setFont('helvetica', 'italic')
      doc.setFontSize(PT.body)
      doc.setTextColor(100, 80, 60)
      const noteLines = doc.splitTextToSize(`Notes: ${song.notes}`, contentW)
      noteLines.forEach(line => {
        checkPage(PT.body * 1.4)
        doc.text(line, margin, y)
        y += PT.body * 1.3
      })
      y += 4
    }

    // Links
    const links = [...(song.youtubeLinks || []), ...(song.spotifyLinks || [])]
    if (links.length) {
      checkPage(30)
      doc.setFont('helvetica', 'normal')
      doc.setFontSize(PT.body)
      links.forEach(link => {
        checkPage(PT.body * 1.6)
        doc.setTextColor(51, 102, 187)
        doc.textWithLink(`▶ ${link.label || link.url}`, margin, y, { url: link.url })
        y += PT.body * 1.4
      })
    }

    y += 12
    checkPage(20)
    doc.setDrawColor(220, 205, 185)
    doc.setLineWidth(0.5)
    doc.line(margin, y, pageW - margin, y)
    y += 20
  })

  doc.save(`${setTitle.replace(/\s+/g, '_')}.pdf`)
}

// ─── XLS Export ───────────────────────────────────────────────
export function exportToXLS(songs, setTitle = 'Worship Set') {
  const rows = songs.map((song, i) => ({
    '#': i + 1,
    Title: song.title,
    Artist: song.artist || '',
    Type: song.type,
    'Original Key': song.originalKey || '',
    'Perform Key': song.performKey || '',
    'Key Changed': song.performKey && song.performKey !== song.originalKey ? 'YES ⚠' : '',
    'Tempo (BPM)': song.tempo || '',
    'Time Sig': song.timeSignature || '',
    Chords: song.chords || '',
    Progressions: (song.progressions || []).map(p => `${p.label ? p.label + ': ' : ''}${p.pattern}`).join(' | '),
    Notes: song.notes || '',
    'YouTube': (song.youtubeLinks || []).map(l => l.url).join('\n'),
    'Spotify': (song.spotifyLinks || []).map(l => l.url).join('\n'),
  }))

  const ws = XLSX.utils.json_to_sheet(rows)
  const wb = XLSX.utils.book_new()
  XLSX.utils.book_append_sheet(wb, ws, 'Songs')

  ws['!cols'] = [
    { wch: 4 }, { wch: 28 }, { wch: 20 }, { wch: 10 }, { wch: 12 },
    { wch: 12 }, { wch: 12 }, { wch: 10 }, { wch: 10 }, { wch: 40 },
    { wch: 30 }, { wch: 35 }, { wch: 35 }, { wch: 35 },
  ]

  XLSX.writeFile(wb, `${setTitle.replace(/\s+/g, '_')}.xlsx`)
}

// ─── DOCX Export ──────────────────────────────────────────────
// DOCX half-points: 1pt = 2 half-points. Min 16pt = size 32.
const DOCX_PT = {
  title:     52,  // 26pt
  songTitle: 40,  // 20pt
  artist:    34,  // 17pt
  body:      32,  // 16pt  ← minimum readable
  label:     28,  // 14pt
  mono:      30,  // 15pt
}

export async function exportToDOCX(songs, setTitle = 'Worship Set') {
  const children = []

  // Set title
  children.push(
    new Paragraph({
      children: [new TextRun({ text: setTitle, bold: true, size: DOCX_PT.title, font: 'DM Sans' })],
      spacing: { after: 160 },
    }),
    new Paragraph({
      children: [new TextRun({
        text: `Generated ${new Date().toLocaleDateString('en-PH', { dateStyle: 'long' })}  •  ${songs.length} songs`,
        color: '886644', size: DOCX_PT.body, italics: true, font: 'Calibri',
      })],
      spacing: { after: 360 },
    })
  )

  songs.forEach((song, i) => {
    // Song title
    children.push(new Paragraph({
      children: [
        new TextRun({ text: `${i + 1}. ${song.title}`, bold: true, size: DOCX_PT.songTitle, font: 'DM Sans' }),
        new TextRun({ text: `  [${song.type.toUpperCase()}]`, bold: true, size: DOCX_PT.label, font: 'DM Sans', color: song.type === 'praise' ? 'e85d35' : '5b8cde' }),
      ],
      spacing: { before: 360, after: 80 },
    }))

    if (song.artist) children.push(new Paragraph({
      children: [new TextRun({ text: song.artist, italics: true, size: DOCX_PT.artist, color: '664422', font: 'Calibri' })],
      spacing: { after: 80 },
    }))

    // Key
    if (song.originalKey) {
      const keyChanged = song.performKey && song.performKey !== song.originalKey
      children.push(new Paragraph({
        children: [
          new TextRun({ text: `Key: ${song.originalKey}`, bold: true, size: DOCX_PT.body, font: 'Calibri' }),
          ...(keyChanged ? [
            new TextRun({ text: `   →   Perform in: ${song.performKey}`, bold: true, size: DOCX_PT.body, font: 'Calibri' }),
            new TextRun({ text: '   ⚠ KEY CHANGE', bold: true, size: DOCX_PT.body, color: 'b45300', font: 'Calibri' }),
          ] : []),
        ],
        spacing: { after: 80 },
      }))
    }

    // Tempo
    const meta = []
    if (song.tempo) meta.push(`♩ ${song.tempo} BPM`)
    if (song.timeSignature) meta.push(song.timeSignature)
    if (meta.length) children.push(new Paragraph({
      children: [new TextRun({ text: meta.join('     '), size: DOCX_PT.body, color: '664422', font: 'Calibri' })],
      spacing: { after: 120 },
    }))

    // Chords
    if (song.chords) {
      children.push(new Paragraph({
        children: [new TextRun({ text: 'CHORDS', bold: true, size: DOCX_PT.label, color: '9c8866', font: 'Calibri' })],
        spacing: { before: 120, after: 60 },
      }))
      song.chords.split('\n').forEach(line => {
        children.push(new Paragraph({
          children: [new TextRun({ text: line || ' ', font: 'Courier New', size: DOCX_PT.mono })],
          spacing: { after: 40 },
        }))
      })
    }

    // Progressions
    if (song.progressions?.length > 0) {
      children.push(new Paragraph({
        children: [new TextRun({ text: 'NUMBER SYSTEM / PROGRESSIONS', bold: true, size: DOCX_PT.label, color: '9c8866', font: 'Calibri' })],
        spacing: { before: 160, after: 60 },
      }))
      song.progressions.forEach(prog => {
        children.push(new Paragraph({
          children: [
            new TextRun({ text: prog.label ? `${prog.label}: ` : '', bold: true, font: 'Courier New', size: DOCX_PT.mono }),
            new TextRun({ text: prog.pattern, font: 'Courier New', size: DOCX_PT.mono }),
          ],
          spacing: { after: 60 },
        }))
      })
    }

    // Notes
    if (song.notes) children.push(new Paragraph({
      children: [new TextRun({ text: `Notes: ${song.notes}`, italics: true, size: DOCX_PT.body, color: '664422', font: 'Calibri' })],
      spacing: { before: 120, after: 80 },
    }))

    // Links
    const links = [...(song.youtubeLinks || []), ...(song.spotifyLinks || [])]
    links.forEach(link => {
      children.push(new Paragraph({
        children: [new TextRun({ text: `▶ ${link.label || link.url}`, size: DOCX_PT.body, color: '3355aa', font: 'Calibri' })],
        spacing: { after: 60 },
      }))
    })

    children.push(new Paragraph({ text: '', spacing: { after: 280 } }))
  })

  const doc = new Document({ sections: [{ children }] })
  const blob = await Packer.toBlob(doc)
  saveAs(blob, `${setTitle.replace(/\s+/g, '_')}.docx`)
}
