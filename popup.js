const previewGallery = document.querySelector(".previewGallery");
const loader = document.querySelector(".loader");
const selectAll = document.querySelector("#selectAll");
const downloadBtn = document.querySelector(".downloadBtn");
const selectingPortion = document.querySelector(".selectingPortion");
const emptyImageListWarning = document.querySelector(".emptyImageListWarning");
loader.style.display = "block";
downloadBtn.style.pointerEvent = "none";
selectingPortion.style.display = "none";
emptyImageListWarning.style.display = "none";
previewGallery.style.display = "none";
downloadBtn.style.display = "none";
const chromeExtensionName = document.title;

selectAll.addEventListener("change", (e) => {
  const eachImgs = document.querySelectorAll(".eachImg");
  eachImgs.forEach((element) => {
    if (selectAll.checked) {
      element.querySelector("input").checked = true;
      element.classList.add("active");
    } else {
      element.querySelector("input").checked = false;
      element.classList.remove("active");
    }
  });
});

// get all images from host site
const handleGetAllImages = () => {
  let allImages = [
    ...new Set([...document.querySelectorAll("img")]?.map((item) => item.src)),
  ];
  let hostName = location.host.split(".");
  hostName = hostName[hostName.length - 2] || chromeExtensionName;
  return {
    allImages: allImages.filter((item) => {
      const imgSrcArr = item?.split(".");
      if (
        ["jpg", "png", "gif", "bmp"].includes(imgSrcArr[imgSrcArr?.length - 1])
      )
        return item;
    }),
    title: hostName,
  };
};

const handleGeneratePreview = (result) => {
  emptyImageListWarning.style.display = "none";
  if (!result || !result[0] || !result[0]["result"]) return;
  const { allImages, title } = result[0]["result"];

  document.querySelector(".hostSiteTitle h3").innerText = title;

  if (!allImages || !allImages.length) {
    emptyImageListWarning.style.display = "block";
    loader.style.display = "none";
    downloadBtn.style.display = "none";
  } else {
    emptyImageListWarning.style.display = "none";
    loader.style.display = "none";
    downloadBtn.style.display = "block";
    selectingPortion.style.display = "";
    previewGallery.style.display = "";
  }

  // previewGallery
  previewGallery.innerHTML = "";
  allImages.forEach((item, i) => {
    previewGallery.innerHTML += `
        <label for="previewImg_${i}" class="eachImg active">
          <input type="checkbox" name="previewImg" id="previewImg_${i}" checked=true hidden />
          <div class="imgWrapper">
            <img src=${item} alt="" />
          </div>
        </label>
      `;
  });

  document.querySelectorAll(".eachImg")?.forEach((element) => {
    const input = element.querySelector("input");
    input.addEventListener("change", (e) => {
      if (input.checked === false) {
        selectAll.checked = false;
        element.classList.remove("active");
      } else {
        element.classList.add("active");
        selectAll.checked = true;
        document.querySelectorAll(".eachImg input").forEach((element) => {
          if (!element.checked) {
            selectAll.checked = false;
            return;
          }
        });
      }
    });
  });
};

// zipping and downloading option
const handleDownload = async (allImages, hostTitle) => {
  const zip = new JSZip();

  for (let i in allImages) {
    const res = await fetch(allImages[i]);
    const blob = await res.blob();
    zip.file(`${hostTitle}_${i}.png`, blob);
  }

  zip.generateAsync({ type: "blob" }).then((content) => {
    chrome.downloads.download({
      url: URL.createObjectURL(content),
      filename: `${hostTitle}_images.zip`,
      saveAs: false,
    });
  });
};

downloadBtn.addEventListener("click", () => {
  const allImages = [...document.querySelectorAll(".previewGallery .eachImg")]
    .filter((item) => item.querySelector("input").checked)
    .map((item) => item.querySelector("img").src);

  const title = document.querySelector(".hostSiteTitle h3").innerText;

  handleDownload(allImages, title);
});

// getting current host tab and getting access for scripting.
chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
  const activeTab = tabs[0];

  if (activeTab.url && activeTab.url.startsWith("chrome")) return;
  chrome.scripting.executeScript(
    {
      target: { tabId: activeTab.id },
      function: handleGetAllImages,
    },
    (result) => handleGeneratePreview(result)
  );
});
