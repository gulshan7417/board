'use client'

import Board from "@/components/Board"
import Toolbar from "@/components/Toolbar"
import { useEffect, useRef, useState } from "react"
import { io } from "socket.io-client"

export default function Home({ params }) {
  const canvasRef = useRef(null)
  const ctx = useRef(null)

  const [color, setColor] = useState("#ffffff")
  const [elements, setElements] = useState([])
  const [history, setHistory] = useState([])
  const [tool, setTool] = useState("pencil")
  const [canvasColor, setCanvasColor] = useState("#121212")
  const [strokeWidth, setStrokeWidth] = useState(5)
  const [fontSize, setFontSize] = useState(16)
  const [fontFamily, setFontFamily] = useState("Arial")

  const [socket, setSocket] = useState(null)
  const [userName, setUserName] = useState("Anonymous")
  const [isLive, setIsLive] = useState(false)
  const [messages, setMessages] = useState([])

  const server = process.env.NEXT_PUBLIC_SERVER_URL
  const connectionOptions = {
    "force new connection": true,
    reconnectionAttempts: "Infinity",
    timeout: 10000,
    transports: ["websocket"],
  }

  useEffect(() => {
    setUserName(localStorage.getItem("userName") || "Anonymous")
    if (params?.roomId?.length !== 20) {
      setIsLive(false)
      return
    }
    setIsLive(true)

    const socket = io(server, connectionOptions)
    setSocket(socket)

    socket.on("updateCanvas", data => {
      setElements(data.updatedElements)
      setCanvasColor(data.canvasColor)
    })
    socket.on("getMessage", msg => setMessages(prev => [...prev, msg]))
    socket.on("ping", () => {
      setTimeout(() => socket.emit("pong"), 120000)
    })

    socket.emit("joinRoom", { roomId: params.roomId, userName })

    return () => {
      socket.disconnect()
    }
  }, [params.roomId])

  const sendMessage = message => {
    if (socket) socket.emit("sendMessage", { message, userName, roomId: params.roomId, socketId: socket.id })
  }

  const updateCanvas = updatedElements => {
    if (socket) socket.emit("updateCanvas", { roomId: params.roomId, userName, updatedElements, canvasColor })
  }

  return (
    <div className="flex flex-col lg:flex-row w-full h-screen overflow-hidden">
      {/* Sidebar Toolbar - sticky/fixed on desktop, toggleable on mobile handled internally */}
      <Toolbar
        color={color}
        setColor={setColor}
        tool={tool}
        setTool={setTool}
        elements={elements}
        setElements={setElements}
        history={history}
        setHistory={setHistory}
        canvasRef={canvasRef}
        strokeWidth={strokeWidth}
        setStrokeWidth={setStrokeWidth}
        canvasColor={canvasColor}
        setCanvasColor={setCanvasColor}
        userName={userName}
        setUserName={setUserName}
        isLive={isLive}
        setIsLive={setIsLive}
        params={params}
        updateCanvas={updateCanvas}
        sendMessage={sendMessage}
        messages={messages}
        socketId={socket?.id}
        fontSize={fontSize}
        setFontSize={setFontSize}
        fontFamily={fontFamily}
        setFontFamily={setFontFamily}
      />

      {/* Main Drawing Board */}
      <div className="flex-1 overflow-hidden">
        <Board
          canvasRef={canvasRef}
          ctx={ctx}
          color={color}
          tool={tool}
          elements={elements}
          setElements={setElements}
          history={history}
          setHistory={setHistory}
          canvasColor={canvasColor}
          strokeWidth={strokeWidth}
          updateCanvas={updateCanvas}
          fontSize={fontSize}
          fontFamily={fontFamily}
        />
      </div>
    </div>
  )
}
