let loadedImages = [];
const ACCEPTED_FILE_TYPES = [
  'image/gif',
  'image/png',
]

function dropHandler(ev) {
  console.log("File(s) dropped");

  // Prevent default behavior (Prevent file from being opened)
  ev.preventDefault();

  const files = [];
  if (ev.dataTransfer.items) {
    // Use DataTransferItemList interface to access the file(s)
    [...ev.dataTransfer.items].forEach((item, i) => {
      // If dropped items aren't files, reject them
      if (item.kind === "file") {
        const file = item.getAsFile();
        files.push(file);
        console.log(`… file[${i}].name = ${file.name}`);
      }
    });
  } else {
    // Use DataTransfer interface to access the file(s)
    [...ev.dataTransfer.files].forEach((file, i) => {
      files.push(file);
      console.log(`… file[${i}].name = ${file.name}`);
    });
  }
  const images = [];
  const otherFiles = [];
  for (const file of files) {
    if (ACCEPTED_FILE_TYPES.includes(file.type)) {
      images.push(file);
    } else {
      otherFiles.push(file);
    }
  }

  if (images.length > 0) {
    loadImages(images);
  }

  if (otherFiles.length > 0) {
    document.querySelector("#message").innerHTML = 'The following files were ignored as they are not of the right type (png, gif):\n' + otherFiles.map(f => `- ${f.name}`).join('\n');
  } else {
    document.querySelector("#message").innerHTML = '';
  }
}

async function modLastByte(file) {
  const buf = await file.arrayBuffer();
  const arr = new Uint8Array(buf);
  arr[arr.byteLength - 1] = 0x21;
  return arr;
}

async function loadImages(imgs) {
  console.log(imgs);
  loadedImages = imgs;
  const preview = document.querySelector("#preview");
  const newPreview = document.createElement('div');
  newPreview.id = "preview";

  for (const img of imgs) {
    const imgElem = document.createElement("img");
    imgElem.setAttribute('draggable', false);
    imgElem.src = URL.createObjectURL(img);
    newPreview.appendChild(imgElem);
  }

  showPreview();
  preview.replaceWith(newPreview);
}

function showPreview() {
  document.querySelector("#preview-section").className = '';
}

async function download() {
  var zip = new JSZip();

  let name, file;

  if (loadedImages.length == 1) {
    name = loadedImages[0].name;
    file = loadedImages[0];
  } else {
    for (const img of loadedImages) {
      const modImg = await modLastByte(img);
      zip.file(img.name, modImg, { binary: true });
    }

    name = 'images.zip';
    file = await zip.generateAsync({ type: "blob" });
  }

  const url = URL.createObjectURL(file);

  const anchor = document.createElement('a');
  anchor.href = url;
  anchor.download = name;

  document.body.appendChild(anchor);
  anchor.click();
  document.body.removeChild(anchor);

  URL.revokeObjectURL(url);
}

function dragOverHandler(ev) {
  console.log("File(s) in drop zone");

  // Prevent default behavior (Prevent file from being opened)
  ev.preventDefault();
}