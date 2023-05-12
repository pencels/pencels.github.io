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

  console.log(files);

  loadImages(files);
}

function loadImages(imgs) {
    const preview = document.querySelector("#preview");
    const newPreview = document.createElement('div');
    newPreview.id = "preview";

    for (const img of imgs) {
        const imgElem = document.createElement("img");
        imgElem.src = URL.createObjectURL(img);
        newPreview.appendChild(imgElem);
    }

    preview.replaceWith(newPreview);
}

function dragOverHandler(ev) {
  console.log("File(s) in drop zone");

  // Prevent default behavior (Prevent file from being opened)
  ev.preventDefault();
}