export async function uploadSignatureImage(file: Blob): Promise<string> {
  const formData = new FormData();
  formData.append('file', file);

  const response = await fetch('/api/upload', {
    method: 'POST',
    body: formData,
  });

  if (!response.ok) {
    throw new Error('Failed to upload signature');
  }

  const data = await response.json();
  return data.url;
} 