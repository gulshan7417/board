'use client'

import { useEffect, useRef, useState } from "react"
import { tools } from "@/assets"
import { TwitterPicker, SliderPicker } from "react-color"
import { LuUndo2, LuRedo2 } from "react-icons/lu"
import { BiMenu } from "react-icons/bi"
import Menu from "./Menu"
import Session from "./Session"
import Chat from "./Chat"

const Toolbar = ({
  color, setColor,
  tool, setTool,
  elements, setElements,
  history, setHistory,
  canvasRef,
  strokeWidth, setStrokeWidth,
  canvasColor, setCanvasColor,
  userName, setUserName,
  isLive, setIsLive,
  params,
  updateCanvas,
  sendMessage,
  messages,
  socketId,
}) => {
  const [showColorPicker, setShowColorPicker] = useState(false)
  const [showToolbar, setShowToolbar] = useState(true)
  const colorPickerRef = useRef(null)

  useEffect(() => {
    const handler = event => {
      if (colorPickerRef.current && !colorPickerRef.current.contains(event.target)) {
        setShowColorPicker(false)
      }
    }
    if (showColorPicker) document.addEventListener("mousedown", handler)
    return () => document.removeEventListener("mousedown", handler)
  }, [showColorPicker])

  const clearCanvas = () => {
    const ctx = canvasRef.current?.getContext("2d")
    ctx.fillStyle = canvasColor
    ctx.fillRect(0, 0, canvasRef.current.width, canvasRef.current.height)
    setElements([])
    setHistory([])
    updateCanvas([])
  }

  const undo = () => {
    if (!elements.length) return
    setHistory(prev => [...prev, elements.at(-1)])
    setElements(prev => prev.slice(0, -1))
  }

  const redo = () => {
    if (!history.length) return
    setElements(prev => [...prev, history.at(-1)])
    setHistory(prev => prev.slice(0, -1))
  }

  return (
    <>
      {!showToolbar && (
        <button
          onClick={() => setShowToolbar(true)}
          className="fixed top-4 left-4 z-50 bg-secondary p-2 rounded-lg shadow-md text-white hover:bg-gray-700 lg:hidden"
          title="Open Toolbar"
        >
          <BiMenu size={24} />
        </button>
      )}

      {showToolbar && (
        <div className="fixed top-0 left-0 h-full w-[80vw] max-w-[220px] z-40 bg-black flex flex-col items-center py-6 gap-6 lg:w-[150px]">
          <button
            onClick={() => setShowToolbar(false)}
            className="lg:hidden absolute top-3 right-3 text-white hover:text-gray-400"
            title="Close Toolbar"
          >
            ✕
          </button>

          <div className="text-primary font-bold text-xl lg:text-[25px]">WhiteBoard</div>

          <div className="flex flex-col bg-secondary rounded-xl p-2 gap-2 items-center">
            {tools.map((item, i) => (
              <button
                key={i}
                onClick={() => setTool(item.value)}
                className={`text-2xl p-2 rounded-lg w-10 h-10 flex items-center justify-center
                  ${tool === item.value ? "bg-tertiary text-primary" : "text-gray-400 hover:bg-slate-600"}`}
                title={item.title}
              >
                {item.icon}
              </button>
            ))}

            <div
              title="Pick color"
              style={{ backgroundColor: color }}
              className="w-8 h-8 rounded cursor-pointer border"
              onClick={() => setShowColorPicker(v => !v)}
            />

            {showColorPicker && (
              <div ref={colorPickerRef} className="absolute left-[180px] z-50 bg-[#222] p-2 rounded shadow-lg">
                <TwitterPicker
                  triangle="hide"
                  color={color}
                  onChangeComplete={c => setColor(c.hex)}
                  colors={[
                    "#f44336","#e91e63","#673ab7","#2196f3","#00bcd4",
                    "#4caf50","#ffc107","#ff5722","#795548","#607d8b",
                    "#000000","#ffffff"
                  ]}
                />
                <SliderPicker color={color} onChangeComplete={c => setColor(c.hex)} />
              </div>
            )}
          </div>

          <div className="flex flex-col bg-secondary rounded-xl p-2 gap-2 items-center">
            <button onClick={undo} title="Undo" className="text-2xl text-gray-400 hover:text-white"><LuUndo2 /></button>
            <button onClick={redo} title="Redo" className="text-2xl text-gray-400 hover:text-white"><LuRedo2 /></button>
          </div>

          <div className="mt-auto mb-6 flex flex-col gap-4">
            <Session {...{ userName, setUserName, isLive, setIsLive, params }} />
            <Chat {...{ isLive, sendMessage, messages, socketId }} />
            <Menu {...{ clearCanvas, setStrokeWidth, strokeWidth, setCanvasColor, canvasColor, elements, setElements, updateCanvas, canvasRef }} />
          </div>
        </div>
      )}
    </>
  )
}

export default Toolbar
