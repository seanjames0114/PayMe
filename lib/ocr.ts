export async function extractTextFromImage(
  imageFile: File,
  onProgress?: (progress: number) => void
): Promise<string> {
  const { createWorker } = await import('tesseract.js')

  const worker = await createWorker('eng', 1, {
    logger: (m) => {
      if (m.status === 'recognizing text' && onProgress) {
        onProgress(Math.round(m.progress * 100))
      }
    },
  })

  const imageUrl = URL.createObjectURL(imageFile)
  const { data } = await worker.recognize(imageUrl)
  URL.revokeObjectURL(imageUrl)
  await worker.terminate()

  return data.text
}
