"use client";
import { useEffect, useRef, useState } from "react";

// Draws multi-line text properly on canvas
function drawMultilineText(ctx, text, x, y, lineHeight = 24) {
  const lines = text.split("\n");
  lines.forEach((line, index) => {
    ctx.fillText(line, x, y + index * lineHeight);
  });
}

// Detects if (x, y) is within a shape
function hitTest(el, x, y) {
  switch (el.type) {
    case "rect":
      return x >= el.x && x <= el.x + el.width && y >= el.y && y <= el.y + el.height;
    case "circle":
      const dx = x - el.x, dy = y - el.y;
      return dx * dx + dy * dy <= el.radius * el.radius;
    case "text":
      const width = el.text.split("\n").reduce((w, line) => Math.max(w, line.length * el.fontSize * 0.6), 0);
      const height = el.text.split("\n").length * el.fontSize;
      return x >= el.x && x <= el.x + width && y >= el.y - el.fontSize && y <= el.y + height;
    case "line":
      const { x1, y1, x2, y2 } = el;
      const A = { x: x - x1, y: y - y1 };
      const B = { x: x2 - x1, y: y2 - y1 };
      const lenB2 = B.x * B.x + B.y * B.y;
      const t = Math.max(0, Math.min(1, (A.x * B.x + A.y * B.y) / lenB2));
      const proj = { x: x1 + B.x * t, y: y1 + B.y * t };
      const pdx = x - proj.x, pdy = y - proj.y;
      return pdx * pdx + pdy * pdy <= 6 * 6;
    case "pencil":
    case "eraser":
      return el.points.some(p => {
        const dx = p.x - x, dy = p.y - y;
        return dx * dx + dy * dy < 10 * 10;
      });
    default:
      return false;
  }
}

export default function Board({
    canvasRef, ctx,
    color, tool,
    elements, setElements,
    history, setHistory,
    canvasColor,
    strokeWidth,
    updateCanvas
  }) {
    // refs & state
    const isDrawing = useRef(false);
    const startX = useRef(0), startY = useRef(0);
    const [inputBox, setInputBox] = useState(null);
    const [inputText, setInputText] = useState("");
    const [editingIndex, setEditingIndex] = useState(null);
  
    const fontSize = 30;
    const fontFamily = "Caveat";
  const [selectedIndex, setSelectedIndex] = useState(null);
  const [dragStart, setDragStart] = useState(null);

  useEffect(() => {
    const handleKey = e => {
      if ((e.key === "Delete" || e.key === "Backspace") && selectedIndex !== null) {
        e.preventDefault();
        const next = elements.filter((_, idx) => idx !== selectedIndex);
        setElements(next);
        updateCanvas(next);
        setSelectedIndex(null);
      }
    };
    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, [selectedIndex, elements]);

  useEffect(() => {
    const canvas = canvasRef.current;
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    ctx.current = canvas.getContext("2d");
    drawAll();
  }, [elements, canvasColor, selectedIndex]);

  const drawAll = () => {
    const context = ctx.current;
    context.fillStyle = canvasColor;
    context.fillRect(0, 0, canvasRef.current.width, canvasRef.current.height);

    elements.forEach((el, i) => {
      context.strokeStyle = el.color;
      context.fillStyle = el.color;
      context.lineWidth = el.strokeWidth || 2;
      context.setLineDash(tool === "select" && i === selectedIndex ? [5, 3] : []);

      switch (el.type) {
        case "pencil":
        case "eraser":
          context.beginPath();
          el.points.forEach((p, j) => j === 0 ? context.moveTo(p.x, p.y) : context.lineTo(p.x, p.y));
          context.stroke();
          break;
        case "line":
          context.beginPath();
          context.moveTo(el.x1, el.y1);
          context.lineTo(el.x2, el.y2);
          context.stroke();
          break;
        case "rect":
          context.strokeRect(el.x, el.y, el.width, el.height);
          break;
        case "circle":
          context.beginPath();
          context.arc(el.x, el.y, el.radius, 0, 2 * Math.PI);
          context.stroke();
          break;
        case "text":
          context.font = el.font;
          context.fillStyle = el.color;
          drawMultilineText(context, el.text, el.x, el.y, el.fontSize);
          break;
      }

      context.setLineDash([]);
    });
  };

  const handleMouseDown = e => {
    const { offsetX: x, offsetY: y } = e.nativeEvent;
    startX.current = x;
    startY.current = y;
    isDrawing.current = true;

    if (tool === "pencil" || tool === "eraser") {
      const newEl = {
        type: tool,
        color: tool === "eraser" ? canvasColor : color,
        strokeWidth,
        points: [{ x, y }]
      };
      setElements(prev => [...prev, newEl]);
    } else if (tool === "select") {
      const idx = elements.findIndex(el => hitTest(el, x, y));
      if (idx >= 0) {
        setSelectedIndex(idx);
        setDragStart({ x, y });
      }
    }
  };

  const handleMouseMove = e => {
    if (!isDrawing.current) return;
    const { offsetX: x, offsetY: y } = e.nativeEvent;

    if (tool === "pencil" || tool === "eraser") {
      setElements(prev => {
        const copy = [...prev];
        copy[copy.length - 1].points.push({ x, y });
        return copy;
      });
    } else if (tool === "select" && selectedIndex !== null && dragStart) {
      const dx = x - dragStart.x, dy = y - dragStart.y;
      setDragStart({ x, y });

      setElements(prev => {
        const copy = [...prev];
        const el = { ...copy[selectedIndex] };

        if (el.type === "line") {
          el.x1 += dx; el.y1 += dy;
          el.x2 += dx; el.y2 += dy;
        } else if (["rect", "circle", "text"].includes(el.type)) {
          el.x += dx; el.y += dy;
        } else if (el.points) {
          el.points = el.points.map(p => ({ x: p.x + dx, y: p.y + dy }));
        }

        copy[selectedIndex] = el;
        return copy;
      });
    }
  };

  const handleMouseUp = e => {
    const { offsetX: x, offsetY: y } = e.nativeEvent;
    isDrawing.current = false;

    if (tool === "select") {
      setDragStart(null);
      updateCanvas(elements);
    } else if (["line", "rect", "circle"].includes(tool)) {
      const newEl = {
        type: tool,
        x1: startX.current, y1: startY.current, x2: x, y2: y,
        x: Math.min(startX.current, x),
        y: Math.min(startY.current, y),
        width: Math.abs(x - startX.current),
        height: Math.abs(y - startY.current),
        radius: Math.hypot(x - startX.current, y - startY.current),
        color, strokeWidth
      };
      const el = {
        line: { type: "line", x1: newEl.x1, y1: newEl.y1, x2: newEl.x2, y2: newEl.y2, color, strokeWidth },
        rect: { type: "rect", x: newEl.x, y: newEl.y, width: newEl.width, height: newEl.height, color, strokeWidth },
        circle: { type: "circle", x: startX.current, y: startY.current, radius: newEl.radius, color, strokeWidth }
      }[tool];
      const next = [...elements, el];
      setElements(next);
      updateCanvas(next);
      setHistory([]);
    } else if (tool === "text") {
      setInputBox({
        x: x,
        y: y,
        width: 200,
        height: fontSize + 10
      });
      setInputText("");
    }
  };

  const handleInputConfirm = () => {
    if (!inputText.trim()) {
      setInputBox(null);
      return;
    }
    const newEl = {
      type: "text",
      x: inputBox.x,
      y: inputBox.y + fontSize,
      text: inputText,
      color,
      font: `${fontSize}px "${fontFamily}", cursive`,
      fontSize
    };
    const next = [...elements, newEl];
    setElements(next);
    updateCanvas(next);
    setInputBox(null);
    setInputText("");
    setHistory([]);
  };

  return (
    <div className="relative w-screen h-screen">
      <canvas
        ref={canvasRef}
        className="absolute inset-0"
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
      />
      {inputBox && (
       <textarea
       style={{
         position: "absolute",
         top: inputBox.y,
         left: inputBox.x,
         width: inputBox.width,
         font: `${fontSize}px "${fontFamily}", cursive`,
         color,
         backgroundColor: "transparent",
         border: "none",
         outline: "none",
         padding: 0,
         resize: "none",
         overflow: "hidden",
         caretColor: color,
         zIndex: 1000,
         lineHeight: `${fontSize + 4}px`
       }}
       autoFocus
       value={inputText}
       rows={inputText.split("\n").length || 1}
       onChange={(e) => setInputText(e.target.value)}
       onBlur={handleInputConfirm}
     />
     
      )}
    </div>
  );
}
