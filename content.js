// const imageExtensions = ["jpg", "png", "gif", "bmp"];
// let allImages = [
//   ...new Set(
//     [...document?.querySelectorAll("img")]?.map((item) =>
//       JSON.stringify({
//         src: item.src,
//         alt: item.alt,
//       })
//     )
//   ),
// ];
// allImages = allImages.map((item) => JSON.parse(item));
// allImages = allImages.filter((item) => {
//   const imgSrcArr = item?.src?.split(".");
//   if (imageExtensions.includes(imgSrcArr[imgSrcArr?.length - 1])) {
//     return {
//       src: item.src,
//       alt: item.alt,
//     };
//   }
// });

// chrome?.runtime?.sendMessage({ from: "content", data: allImages });
