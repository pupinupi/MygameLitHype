const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");

const img = new Image();
img.src = "board.jpg";

img.onload = ()=>{
  ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
};
