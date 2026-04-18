import { toPng } from 'html-to-image'
import jsPDF from 'jspdf'

type PageSize = {
  widthMm: number
  heightMm: number
}

export const exportCardsToPdf = async (
  faceElements: (HTMLDivElement | null)[],
  pageSize: PageSize,
  onProgress?: (progress: { current: number; total: number }) => void
) => {
  const elements = faceElements.filter(Boolean) as HTMLDivElement[]
  if (!elements.length) return

  const pdf = new jsPDF({
    orientation: 'landscape',
    unit: 'mm',
    format: [pageSize.widthMm, pageSize.heightMm]
  })

  for (let i = 0; i < elements.length; i += 1) {
    const element = elements[i]
    const dataUrl = await toPng(element, {
      pixelRatio: 3,
      cacheBust: true
    })

    if (i > 0) {
      pdf.addPage([pageSize.widthMm, pageSize.heightMm], 'landscape')
    }

    pdf.addImage(dataUrl, 'PNG', 0, 0, pageSize.widthMm, pageSize.heightMm)
    onProgress?.({ current: i + 1, total: elements.length })
  }

  pdf.save('client-cards-cr80.pdf')
}
