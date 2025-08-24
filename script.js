 

async function sendFileToServer(file, endpoint) {
  const animationContainer = document.getElementById('animationContainer');
  const status = document.getElementById('status');
  let originalSizeElement = document.getElementById('originalSize');
  let reducedSizeElement = document.getElementById('reducedSize');
  const compressionRatioElement = document.getElementById('compressionRatio');
    if(endpoint=='http://localhost:8080/decode'){
        let temp = originalSizeElement;
        originalSizeElement =reducedSizeElement;
        reducedSizeElement = temp
    }
  // Store original file size
  const originalSize = file.size;
  originalSizeElement.textContent = formatFileSize(originalSize);

 //return file name
   let newFileName;
  if (endpoint === 'http://localhost:8080/encode') {
    // For compression: compressed.extension
    newFileName = `compressed.huff`;
  } else if (endpoint === 'http://localhost:8080/decode') {
    // For decompression: decompressed.extension
    const fileExt = file.name.split('.').pop();
    newFileName = `decompressed.${fileExt}`;
  } else {
    newFileName = file.name;
  }


 
  animationContainer.style.display = 'block';
  status.textContent = "Processing...";

  // Clear previous results
  reducedSizeElement.textContent = '';
  compressionRatioElement.textContent = '';

  const arrayBuffer = await file.arrayBuffer();
  try {
    const response = await fetch(endpoint, {
      method: 'POST',
      headers: { 'Content-Type': 'application/octet-stream' },
      body: arrayBuffer
    });

    if (!response.ok) throw new Error('Server error');

    const blob = await response.blob();
    const url = URL.createObjectURL(blob);

    // Calculate and display compression results
    const reducedSize = blob.size;
    reducedSizeElement.textContent = formatFileSize(reducedSize);
    
    let compressionRatio = ((originalSize - reducedSize) / originalSize * 100).toFixed(1);
    if(originalSize<reducedSize){
        compressionRatio = ((reducedSize - originalSize) / reducedSize * 100).toFixed(1);
    }
    compressionRatioElement.textContent = `${compressionRatio}%`;

    const a = document.createElement('a');
    a.href = url;
    a.download = newFileName;
    a.click();
    
    status.textContent = "Done!";
  } catch (err) {
    status.textContent = "Error: " + err.message;
    console.error(err);
  } finally {
    animationContainer.style.display = 'none';
  }
}

function compressFile() {
  const file = document.getElementById('fileInput').files[0];
  if (!file) return alert("Please select a file to compress.");
  sendFileToServer(file, 'http://localhost:8080/encode');
}

function decompressFile() {
  const file = document.getElementById('fileInput').files[0];
  if (!file) return alert("Please select a file to decompress.");
  sendFileToServer(file, 'http://localhost:8080/decode');
}

// Helper function to format file sizes
function formatFileSize(bytes) {
  if (bytes < 1024) return bytes + ' bytes';
  else if (bytes < 1048576) return (bytes / 1024).toFixed(2) + ' KB';
  else return (bytes / 1048576).toFixed(2) + ' MB';

}


