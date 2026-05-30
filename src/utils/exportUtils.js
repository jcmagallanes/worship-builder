import jsPDF from 'jspdf'
import autoTable from 'jspdf-autotable'
import { saveAs } from 'file-saver'
import * as XLSX from 'xlsx'
import { Document, Packer, Paragraph, TextRun, HeadingLevel, Table, TableRow, TableCell, WidthType, BorderStyle, AlignmentType, PageBreak } from 'docx'

// ─── PDF Export ───────────────────────────────────────────────
export function exportToPDF(songs, setTitle = 'Worship Set') {
  const doc = new jsPDF({ unit: 'mm', format: 'a4' })
  const pageW = doc.internal.pageSize.getWidth()
  const margin = 15
  let y = 20

  // Header
  doc.setFont('helvetica', 'bold')
  doc.setFontSize(22)
  doc.setTextColor(36, 30, 22)
  doc.text(setTitle, margin, y)
  y += 8

  doc.setFont('helvetica', 'normal')
  doc.setFontSize(9)
  doc.setTextColor(120, 100, 80)
  doc.text(`Generated ${new Date().toLocaleDateString('en-PH', { dateStyle: 'long' })}  •  ${songs.length} songs`, margin, y)
  y += 6

  // Divider
  doc.setDrawColor(200, 180, 150)
  doc.setLineWidth(0.3)
  doc.line(margin, y, pageW - margin, y)
  y += 8

  songs.forEach((song, i) => {
    // Check page space
    if (y > 260) {
      doc.addPage()
      y = 20
    }

    // Song number + title
    doc.setFont('helvetica', 'bold')
    doc.setFontSize(13)
    doc.setTextColor(36, 30, 22)
    doc.text(`${i + 1}. ${song.title}`, margin, y)

    // Type badge
    const badgeColor = song.type === 'praise' ? [232, 93, 53] : [91, 140, 222]
    doc.setFillColor(...badgeColor)
    doc.setTextColor(255, 255, 255)
    doc.setFont('helvetica', 'bold')
    doc.setFontSize(7)
    const badgeText = song.type.toUpperCase()
    const bW = doc.getTextWidth(badgeText) + 4
    doc.roundedRect(pageW - margin - bW, y - 5, bW, 5.5, 1, 1, 'F')
    doc.text(badgeText, pageW - margin - bW + 2, y - 0.5)
    doc.setTextColor(36, 30, 22)
    y += 5

    // Artist
    if (song.artist) {
      doc.setFont('helvetica', 'italic')
      doc.setFontSize(9)
      doc.setTextColor(100, 80, 60)
      doc.text(song.artist, margin, y)
      y += 5
    }

    // Key info
    if (song.originalKey) {
      doc.setFont('helvetica', 'normal')
      doc.setFontSize(9)
      doc.setTextColor(80, 80, 80)
      let keyText = `Key: ${song.originalKey}`
      if (song.performKey && song.performKey !== song.originalKey) {
        keyText += `  →  Perform in: ${song.performKey}  ⚠ KEY CHANGE`
      }
      doc.text(keyText, margin, y)
      y += 5
    }

    // Tempo / Time
    const meta = []
    if (song.tempo) meta.push(`♩ ${song.tempo} BPM`)
    if (song.timeSignature) meta.push(`${song.timeSignature}`)
    if (meta.length) {
      doc.setFontSize(8)
      doc.setTextColor(100, 80, 60)
      doc.text(meta.join('   '), margin, y)
      y += 5
    }

    // Chords
    if (song.chords) {
      doc.setFont('courier', 'normal')
      doc.setFontSize(8)
      doc.setTextColor(40, 40, 40)
      const chordLines = song.chords.split('\n').slice(0, 8)
      chordLines.forEach(line => {
        if (y > 270) { doc.addPage(); y = 20 }
        doc.text(line, margin, y)
        y += 4
      })
      if (song.chords.split('\n').length > 8) {
        doc.text('...', margin, y)
        y += 4
      }
    }

    // Progressions
    if (song.progressions && song.progressions.length > 0) {
      if (y > 265) { doc.addPage(); y = 20 }
      doc.setFont('helvetica', 'bold')
      doc.setFontSize(8)
      doc.setTextColor(60, 60, 60)
      doc.text('PROGRESSIONS', margin, y)
      y += 4
      song.progressions.forEach(prog => {
        if (y > 270) { doc.addPage(); y = 20 }
        doc.setFont('courier', 'normal')
        doc.setFontSize(8)
        doc.setTextColor(40, 40, 40)
        doc.text(`${prog.label ? prog.label + ': ' : ''}${prog.pattern}`, margin, y)
        y += 4
      })
    }

    // Notes
    if (song.notes) {
      if (y > 265) { doc.addPage(); y = 20 }
      doc.setFont('helvetica', 'italic')
      doc.setFontSize(8)
      doc.setTextColor(100, 80, 60)
      const noteLines = doc.splitTextToSize(`Notes: ${song.notes}`, pageW - margin * 2)
      noteLines.forEach(line => {
        if (y > 270) { doc.addPage(); y = 20 }
        doc.text(line, margin, y)
        y += 4
      })
    }

    // Media links
    const links = [...(song.youtubeLinks || []), ...(song.spotifyLinks || [])]
    if (links.length > 0) {
      if (y > 265) { doc.addPage(); y = 20 }
      doc.setFont('helvetica', 'normal')
      doc.setFontSize(8)
      doc.setTextColor(60, 100, 180)
      links.forEach(link => {
        if (y > 270) { doc.addPage(); y = 20 }
        doc.textWithLink(`▶ ${link.label || link.url}`, margin, y, { url: link.url })
        y += 4
      })
    }

    y += 6
    // Separator
    doc.setDrawColor(220, 200, 170)
    doc.setLineWidth(0.2)
    doc.line(margin, y, pageW - margin, y)
    y += 6
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
    'Key Changed': song.performKey && song.performKey !== song.originalKey ? 'YES' : '',
    'Tempo (BPM)': song.tempo || '',
    'Time Signature': song.timeSignature || '',
    Chords: song.chords || '',
    Progressions: (song.progressions || []).map(p => `${p.label ? p.label + ': ' : ''}${p.pattern}`).join(' | '),
    Notes: song.notes || '',
    'YouTube Links': (song.youtubeLinks || []).map(l => l.url).join('\n'),
    'Spotify Links': (song.spotifyLinks || []).map(l => l.url).join('\n'),
  }))

  const ws = XLSX.utils.json_to_sheet(rows)
  const wb = XLSX.utils.book_new()
  XLSX.utils.book_append_sheet(wb, ws, 'Songs')

  // Column widths
  ws['!cols'] = [
    { wch: 4 }, { wch: 30 }, { wch: 20 }, { wch: 10 }, { wch: 12 },
    { wch: 12 }, { wch: 12 }, { wch: 10 }, { wch: 14 }, { wch: 40 },
    { wch: 30 }, { wch: 30 }, { wch: 35 }, { wch: 35 },
  ]

  XLSX.writeFile(wb, `${setTitle.replace(/\s+/g, '_')}.xlsx`)
}

// ─── DOCX Export ──────────────────────────────────────────────
export async function exportToDOCX(songs, setTitle = 'Worship Set') {
  const children = []

  // Title
  children.push(
    new Paragraph({
      text: setTitle,
      heading: HeadingLevel.HEADING_1,
      spacing: { after: 200 },
    }),
    new Paragraph({
      children: [
        new TextRun({
          text: `Generated ${new Date().toLocaleDateString('en-PH', { dateStyle: 'long' })}  •  ${songs.length} songs`,
          color: '886644',
          size: 18,
          italics: true,
        }),
      ],
      spacing: { after: 400 },
    })
  )

  songs.forEach((song, i) => {
    // Song title
    children.push(
      new Paragraph({
        children: [
          new TextRun({ text: `${i + 1}. ${song.title}`, bold: true, size: 26 }),
          new TextRun({ text: `  [${song.type.toUpperCase()}]`, color: song.type === 'praise' ? 'e85d35' : '5b8cde', size: 20, bold: true }),
        ],
        spacing: { before: 300, after: 60 },
      })
    )

    if (song.artist) {
      children.push(new Paragraph({
        children: [new TextRun({ text: song.artist, italics: true, color: '664422', size: 20 })],
        spacing: { after: 80 },
      }))
    }

    // Key
    if (song.originalKey) {
      let keyStr = `Key: ${song.originalKey}`
      if (song.performKey && song.performKey !== song.originalKey) {
        keyStr += `  →  Perform in: ${song.performKey}  ⚠ KEY CHANGE`
      }
      children.push(new Paragraph({
        children: [new TextRun({ text: keyStr, size: 18, color: '443322', bold: true })],
        spacing: { after: 80 },
      }))
    }

    // Tempo
    const meta = []
    if (song.tempo) meta.push(`♩ ${song.tempo} BPM`)
    if (song.timeSignature) meta.push(song.timeSignature)
    if (meta.length) {
      children.push(new Paragraph({
        children: [new TextRun({ text: meta.join('   '), size: 18, color: '664422' })],
        spacing: { after: 80 },
      }))
    }

    // Chords
    if (song.chords) {
      children.push(new Paragraph({
        children: [new TextRun({ text: 'CHORDS', bold: true, size: 16, color: '443322' })],
        spacing: { after: 40 },
      }))
      song.chords.split('\n').forEach(line => {
        children.push(new Paragraph({
          children: [new TextRun({ text: line || ' ', font: 'Courier New', size: 18 })],
          spacing: { after: 20 },
        }))
      })
    }

    // Progressions
    if (song.progressions && song.progressions.length > 0) {
      children.push(new Paragraph({
        children: [new TextRun({ text: 'PROGRESSIONS', bold: true, size: 16, color: '443322' })],
        spacing: { before: 100, after: 40 },
      }))
      song.progressions.forEach(prog => {
        children.push(new Paragraph({
          children: [
            new TextRun({ text: prog.label ? `${prog.label}: ` : '', bold: true, font: 'Courier New', size: 18 }),
            new TextRun({ text: prog.pattern, font: 'Courier New', size: 18 }),
          ],
          spacing: { after: 40 },
        }))
      })
    }

    // Notes
    if (song.notes) {
      children.push(new Paragraph({
        children: [new TextRun({ text: `Notes: ${song.notes}`, italics: true, size: 18, color: '664422' })],
        spacing: { before: 100, after: 40 },
      }))
    }

    // Links
    const links = [...(song.youtubeLinks || []), ...(song.spotifyLinks || [])]
    if (links.length) {
      links.forEach(link => {
        children.push(new Paragraph({
          children: [new TextRun({ text: `▶ ${link.label || link.url}`, size: 18, color: '3355aa' })],
          spacing: { after: 40 },
        }))
      })
    }

    // Spacer
    children.push(new Paragraph({ text: '', spacing: { after: 200 } }))
  })

  const doc = new Document({
    sections: [{ children }],
  })

  const blob = await Packer.toBlob(doc)
  saveAs(blob, `${setTitle.replace(/\s+/g, '_')}.docx`)
}
