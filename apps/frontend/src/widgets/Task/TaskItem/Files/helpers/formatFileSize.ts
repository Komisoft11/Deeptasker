export function formatFileSize(sizeInBytes: number) {
  if (sizeInBytes === 0) return '0 Bytes'
  const sizes = ['Б', 'Кб', 'Мб', 'Гб', 'Тб']
  const i = Math.floor(Math.log(sizeInBytes) / Math.log(1024))
  const formattedSize = parseFloat((sizeInBytes / Math.pow(1024, i)).toFixed(2))
  return `${formattedSize} ${sizes[i]}`
}
