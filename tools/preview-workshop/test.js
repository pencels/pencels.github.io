let loadedImages = [];

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

  loadImages(files);
}

async function modLastByte(file) {
  const buf = await file.arrayBuffer();
  const arr = new Uint8Array(buf);
  arr[arr.byteLength - 1] = 0x21;
  return arr;
}

async function loadImages(imgs) {
  loadedImages = imgs;
  const preview = document.querySelector("#preview");
  const newPreview = document.createElement('div');
  newPreview.id = "preview";

  for (const img of imgs) {
    const imgElem = document.createElement("img");
    imgElem.src = URL.createObjectURL(img);
    newPreview.appendChild(imgElem);
  }

  showDownloadButton();
  preview.replaceWith(newPreview);
}

function showDownloadButton() {
  document.querySelector("button#download").className = '';
}

async function download() {
  console.log(loadedImages);
  var zip = new JSZip();

  for (const img of loadedImages) {
    const modImg = await modLastByte(img);
    zip.file(img.name, modImg, { binary: true });
  }

  const zipped = await zip.generateAsync({ type: "blob" });
  const url = URL.createObjectURL(zipped);

  const anchor = document.createElement('a');
  anchor.href = url;
  anchor.download = 'images.zip';

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