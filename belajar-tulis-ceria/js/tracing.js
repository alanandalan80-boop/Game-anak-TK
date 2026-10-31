const Tracing = (() => {
  let canvas, ctx, current = "A", mode = "trace", drawing = false, points = [], guideVisible = true;
  let width = 0, height = 0, completedCallback = null;
  const guideColor = "#d8d4eb";
  function init(canvasEl, callback) {
    canvas = canvasEl; ctx = canvas.getContext("2d"); completedCallback = callback;
    resize();
    canvas.addEventListener("pointerdown", start);
    canvas.addEventListener("pointermove", move);
    window.addEventListener("pointerup", end);
    window.addEventListener("resize", resize);
  }
  function resize() {
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    const old = (mode === "free") ? null : current;
    const dpr = window.devicePixelRatio || 1;
    width = rect.width; height = rect.height;
    canvas.width = Math.max(1, Math.round(width*dpr)); canvas.height = Math.max(1, Math.round(height*dpr));
    ctx.setTransform(dpr,0,0,dpr,0,0);
    draw();
  }
  function setMode(nextMode, value) { mode = nextMode; if (value !== undefined) current = String(value); points = []; guideVisible = true; draw(); }
  function setItem(value) { current = String(value); points = []; guideVisible = true; draw(); }
  function clear() { points = []; draw(); }
  function showGuide() { guideVisible = true; draw(); }
  function getTargetRect() {
    const text = current;
    const fontSize = Math.min(height * (text.length > 1 ? .48 : .72), width * (text.length > 1 ? .25 : .65));
    ctx.font = `900 ${fontSize}px Nunito, sans-serif`;
    const measured = ctx.measureText(text).width;
    return {x:(width-measured)/2,y:height*.62,fontSize,measured};
  }
  function drawGuide() {
    if (!guideVisible || mode !== "trace") return;
    const r = getTargetRect();
    ctx.save(); ctx.textAlign = "center"; ctx.textBaseline = "alphabetic";
    ctx.font = `900 ${r.fontSize}px Nunito, sans-serif`;
    ctx.lineWidth = 3; ctx.setLineDash([8,9]); ctx.strokeStyle = guideColor;
    ctx.strokeText(current, width/2, r.y);
    ctx.setLineDash([]); ctx.lineWidth = 1.5; ctx.strokeStyle = "#aaa3d6";
    ctx.strokeText(current, width/2, r.y);
    ctx.fillStyle = "#48c78e"; ctx.beginPath(); ctx.arc(width/2-r.measured/2, r.y-r.fontSize*.75, 7, 0, Math.PI*2); ctx.fill();
    ctx.restore();
  }
  function draw() {
    if (!ctx) return;
    ctx.clearRect(0,0,width,height);
    ctx.fillStyle = "#fffdf8"; ctx.fillRect(0,0,width,height);
    ctx.strokeStyle = "#f0ecdf"; ctx.lineWidth = 1;
    for(let y=height*.25;y<height;y+=height*.25){ctx.beginPath();ctx.moveTo(0,y);ctx.lineTo(width,y);ctx.stroke();}
    drawGuide();
    if(points.length){
      ctx.save();ctx.strokeStyle=mode==="free"?(window.freePenColor||"#ff668e"):"#7767ed";
      ctx.lineWidth=mode==="free"?(window.freePenSize||8):Math.max(5,width*.012);
      ctx.lineCap="round";ctx.lineJoin="round";ctx.beginPath();ctx.moveTo(points[0].x,points[0].y);
      for(let i=1;i<points.length;i++){if(points[i].break){ctx.moveTo(points[i].x,points[i].y)}else ctx.lineTo(points[i].x,points[i].y)}
      if(points.length===1)ctx.lineTo(points[0].x+.1,points[0].y+.1);
      ctx.stroke();ctx.restore();
    }
  }
  function coords(e){const r=canvas.getBoundingClientRect();return{x:e.clientX-r.left,y:e.clientY-r.top};}
  function start(e){if(e.button!==undefined&&e.button!==0)return;drawing=true;canvas.setPointerCapture?.(e.pointerId);points.push(coords(e));draw();e.preventDefault();}
  function move(e){if(!drawing)return;points.push(coords(e));draw();e.preventDefault();}
  function end(){if(!drawing)return;drawing=false;if(mode==="trace"&&completedCallback)completedCallback(points.length);draw();}
  function getEffort(){return Math.min(1, points.length/65);}
  function undo(){if(!points.length)return;points.pop();while(points.length && !points[points.length-1].break)points.pop();draw();}
  function exportImage(){return canvas.toDataURL("image/png");}
  return {init,setMode,setItem,clear,showGuide,getEffort,undo,exportImage};
})();
