'use client'

import { useEffect, useState } from "react"
import { MdDeleteOutline } from "react-icons/md"
import { FaSave } from "react-icons/fa"
import { AiFillFolderOpen } from "react-icons/ai"
import { toast } from "react-hot-toast"
import { IoMdClose } from "react-icons/io"
import { BiMenu } from "react-icons/bi"
import jsPDF from "jspdf"

const Menu = ({
  clearCanvas,
  setStrokeWidth,
  strokeWidth,
  canvasColor,
  setCanvasColor,
  setElements,
  elements,
  updateCanvas,
  canvasRef // 👈 make sure to pass this from Toolbar
}) => {
  const [showSidebar, setShowSidebar] = useState(true)
  const [saveFormat, setSaveFormat] = useState("ink")

  const saveFile = () => {
    if (!canvasRef?.current) return

    const canvas = canvasRef.current

    if (saveFormat === "ink") {
      const data = JSON.stringify(elements)
      const blob = new Blob([data], { type: 'application/ink' })
      const url = URL.createObjectURL(blob)
      const link = document.createElement('a')
      link.download = 'drawing.ink'
      link.href = url
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
    }

    if (saveFormat === "png") {
      const dataURL = canvas.toDataURL("image/png")
      const link = document.createElement('a')
      link.download = 'drawing.png'
      link.href = dataURL
      link.click()
    }

    if (saveFormat === "pdf") {
      const dataURL = canvas.toDataURL("image/png")
      const pdf = new jsPDF({
        orientation: 'landscape',
        unit: 'px',
        format: [canvas.width, canvas.height]
      })
      pdf.addImage(dataURL, 'PNG', 0, 0, canvas.width, canvas.height)
      pdf.save('drawing.pdf')
    }
  }

  const loadFile = () => {
    const input = document.createElement('input')
    input.type = 'file'
    input.accept = '.ink'
    input.onchange = (event) => {
      const file = event.target.files[0]
      if (file?.name.endsWith('.ink')) {
        const reader = new FileReader()
        reader.onload = (event) => {
          const data = JSON.parse(event.target.result)
          setElements(data)
          updateCanvas(data)
        }
        reader.readAsText(file)
        toast('File Loaded Successfully', {
          icon: '📁',
          style: { borderRadius: '10px', background: '#333', color: '#fff' },
        })
      } else {
        alert('Please select a valid .ink file.')
      }
    }
    input.click()
  }

  useEffect(() => {
    clearCanvas()
  }, [canvasColor])

  return (
    <>
      {!showSidebar && (
        <button
          onClick={() => setShowSidebar(true)}
          className="fixed top-4 right-4 z-40 bg-secondary p-2 rounded-lg shadow-md text-white hover:bg-gray-700"
          title="Open Menu"
        >
          <BiMenu size={24} />
        </button>
      )}

      {showSidebar && (
        <div className="fixed top-0 right-0 h-full w-[260px] bg-secondary p-4 z-30 overflow-y-auto shadow-lg border-l border-gray-700">
          <button
            onClick={() => setShowSidebar(false)}
            className="absolute top-4 right-4 text-white hover:text-gray-300"
            title="Close Menu"
          >
            <IoMdClose size={24} />
          </button>

          <div className="flex flex-col gap-4 mt-8 text-sm text-[#c6cbdc] font-semibold">
            <button
              onClick={clearCanvas}
              className="flex items-center gap-2 p-2 rounded-lg bg-tertiary hover:bg-pink-700 text-white font-bold"
            >
              <MdDeleteOutline size={20} /> Clear Canvas
            </button>

            <div>
              <label className="block mb-1">Select Format</label>
              <select
                value={saveFormat}
                onChange={(e) => setSaveFormat(e.target.value)}
                className="w-full p-1 rounded bg-gray-800 text-white"
              >
                <option value="ink">.ink (editable)</option>
                <option value="png">.png (image)</option>
                <option value="pdf">.pdf (printable)</option>
              </select>
            </div>

            <button
              onClick={saveFile}
              className="flex items-center gap-2 p-2 rounded-lg bg-tertiary hover:bg-blue-700 text-white"
            >
              <FaSave size={15} /> Save File
            </button>

            <button
              onClick={loadFile}
              className="flex items-center gap-2 p-2 rounded-lg bg-tertiary hover:bg-green-700 text-white"
            >
              <AiFillFolderOpen size={17} /> Open File
            </button>

            <div className="mt-4">
              <label className="text-sm">Stroke Width: {strokeWidth}</label>
              <input
                type="range"
                value={strokeWidth}
                onChange={(e) => setStrokeWidth(Number(e.target.value))}
                min={1}
                max={100}
                className="w-full mt-2"
              />
            </div>

            <div className="mt-4">
              <p>Canvas Color</p>
              <div className="flex flex-wrap gap-2 mt-2">
                {["#ffffff", "#000000", "#1f3d36", "#121212"].map(color => (
                  <button
                    key={color}
                    onClick={() => setCanvasColor(color)}
                    className={`w-8 h-8 rounded-lg border ${canvasColor === color ? 'border-primary border-2' : ''}`}
                    style={{ backgroundColor: color }}
                  />
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  )
}

export default Menu
