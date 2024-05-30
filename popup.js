const previewGallery = document.querySelector(".previewGallery");
const loader = document.querySelector(".loader");
const selectAll = document.querySelector("#selectAll");
const downloadBtn = document.querySelector(".downloadBtn");
const selectingPortion = document.querySelector(".selectingPortion");
const emptyImageListWarning = document.querySelector(".emptyImageListWarning");
const numberOfImages = document.querySelector(".numberOfImages");
const numberOfImageSelected = document.querySelector(".numberOfImageSelected");
const downloadText = document.querySelector(".downloadText");
const downloadingNumber = document.querySelector(".downloadingNumber");
loader.style.display = "block";
downloadBtn.style.pointerEvent = "none";
selectingPortion.style.display = "none";
emptyImageListWarning.style.display = "none";
previewGallery.style.display = "none";
downloadBtn.style.display = "none";
const chromeExtensionName = document.title;

// get all images from host site
const handleGetAllImages = () => {
  // const imageValidator = (url) => {
  //   return ["jpg", "png", "gif", "bmp", "webp", "svg"].includes(
  //     url?.split(".").pop().split("?")[0]
  //   );
  // };
  let allImages = [
    ...new Set(
      Array.from(document.querySelectorAll("img") || [])?.map(
        (item) => item.src
      )
    ),
  ];

  allImages = allImages.filter((item) => !item.includes("fill='none'"));

  let title = location.host.split(".");
  title = title[title.length - 2] || chromeExtensionName;

  return {
    allImages,
    title,
  };
};

const handleSelectedNumberHandler = () => {
  numberOfImageSelected.innerText = Array.from(
    document.querySelectorAll(".eachImg input")
  )?.filter((item) => item.checked).length;
};

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
  handleSelectedNumberHandler();
});

const handleGeneratePreview = (result) => {
  console.log("result ============");
  console.log(result);
  emptyImageListWarning.style.display = "none";
  if (!result || !result[0] || !result[0]["result"]) return;
  const { allImages, title } = result[0]["result"];

  document.querySelector(".hostSiteTitle h3").innerText = title;
  numberOfImages.innerText = `(${allImages.length})`;

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

  handleSelectedNumberHandler();

  document.querySelectorAll(".eachImg")?.forEach((element) => {
    const input = element.querySelector("input");
    input.addEventListener("change", (e) => {
      handleSelectedNumberHandler();
      if (!input.checked) {
        selectAll.checked = false;
        element.classList.remove("active");
      } else {
        element.classList.add("active");
        selectAll.checked = true;

        // if all image is selected then selectAll is checked
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
    try {
      console.log(i);
      const res = await fetch(allImages[i]);
      const blob = await res.blob();
      zip.file(`${hostTitle}_${i}.png`, blob);

      downloadText.innerText = "Generating image...";
      downloadingNumber.innerText = `(${i})`;
    } catch (error) {
      console.log(error.message);
    }
  }
  downloadText.innerText = "download";
  downloadingNumber.innerText = "";

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

  allImages && handleDownload(allImages, title);
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
  // console.log(chrome);

  chrome.action.onClicked.addListener((tab) => {
    console.log(tab);
    console.log(Date.now());
  });
});
