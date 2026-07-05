(async () => {
  const img = new Image();
  img.crossOrigin = "anonymous";
  img.src = "/res/may2017_puzzle.png";
  await img.decode();

  const src = document.createElement("canvas");
  src.width = img.naturalWidth;
  src.height = img.naturalHeight;
  const sctx = src.getContext("2d");
  sctx.drawImage(img, 0, 0);

  const data = sctx.getImageData(0, 0, src.width, src.height).data;
  const pts = [];

  for (let i = 0; i < data.length; i += 4) {
    pts.push([
      data[i] - 128,       // X = R
      data[i + 1] - 128,   // Y = G
      data[i + 2] - 128    // Z = B
    ]);
  }

  const canvas = document.createElement("canvas");
  canvas.width = 900;
  canvas.height = 900;
  canvas.style.position = "fixed";
  canvas.style.left = "10px";
  canvas.style.top = "10px";
  canvas.style.zIndex = "999999";
  canvas.style.background = "white";
  canvas.style.border = "3px solid red";
  document.body.appendChild(canvas);

  const ctx = canvas.getContext("2d");

  let ax = 0.6;
  let ay = 0.4;
  let az = 0;
  let dragging = false;
  let lastX = 0;
  let lastY = 0;

  canvas.onmousedown = e => {
    dragging = true;
    lastX = e.clientX;
    lastY = e.clientY;
  };

  canvas.onmouseup = () => dragging = false;
  canvas.onmouseleave = () => dragging = false;

  canvas.onmousemove = e => {
    if (!dragging) return;
    ay += (e.clientX - lastX) * 0.01;
    ax += (e.clientY - lastY) * 0.01;
    lastX = e.clientX;
    lastY = e.clientY;
  };

  window.addEventListener("keydown", e => {
    if (e.key === "q") az -= 0.05;
    if (e.key === "e") az += 0.05;
    if (e.key === "+") scale += 0.1;
    if (e.key === "-") scale -= 0.1;
  });

  let scale = 2.3;

  function rotate([x, y, z]) {
    let cx = Math.cos(ax), sx = Math.sin(ax);
    let cy = Math.cos(ay), sy = Math.sin(ay);
    let cz = Math.cos(az), sz = Math.sin(az);

    [y, z] = [y * cx - z * sx, y * sx + z * cx];
    [x, z] = [x * cy + z * sy, -x * sy + z * cy];
    [x, y] = [x * cz - y * sz, x * sz + y * cz];

    return [x, y, z];
  }

  function draw() {
    ctx.fillStyle = "white";
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    const projected = pts.map(p => {
      const [x, y, z] = rotate(p);
      return {
        x: canvas.width / 2 + x * scale,
        y: canvas.height / 2 - y * scale,
        z
      };
    }).sort((a, b) => a.z - b.z);

    for (const p of projected) {
      const shade = Math.max(0, Math.min(255, 120 + p.z));
      ctx.fillStyle = `rgb(${shade},${shade},${shade})`;
      ctx.fillRect(p.x, p.y, 4, 4);
    }

    ctx.fillStyle = "red";
    ctx.font = "16px monospace";
    ctx.fillText("Drag mouse to rotate. Q/E rotate flat. +/- zoom.", 20, 25);

    requestAnimationFrame(draw);
  }

  draw();
})();
