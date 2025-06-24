'use client'

import Image from "next/image"
import { useEffect, useState } from "react"
import live from "@/assets/live.svg"
import { useRouter } from "next/navigation"
import { nanoid } from "nanoid"
import { toast } from "react-hot-toast"
import { IoClose } from "react-icons/io5"
import { BiBroadcast } from "react-icons/bi"

const Session = ({ userName, setUserName, isLive, setIsLive, params }) => {
  const router = useRouter()
  const [show, setShow] = useState(false)

  const startSession = () => {
    setShow(false)
    const roomId = nanoid(20)
    router.push(`/room/${roomId}`)
  }

  useEffect(() => {
    if (isLive) setShow(true)
  }, [isLive])

  return (
    <div className="relative">
      {/* Toggle Button */}
      {!show && (
        <button
          onClick={() => setShow(true)}
          className="fixed top-4 right-80 z-40 bg-primary text-white font-bold py-2 px-4 rounded-full hover:bg-opacity-80 flex items-center gap-2"
        >
          <BiBroadcast size={18} />
          Live Session
        </button>
      )}

      {/* Sidebar Panel */}
      {show && (
        <div className="fixed top-0 right-[300px] w-[340px] h-[600px] bg-secondary text-white shadow-xl z-50 p-5 flex flex-col gap-4">
          {/* Close Button */}
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-bold">Live Session</h2>
            <button onClick={() => setShow(false)} className="text-white hover:text-gray-300">
              <IoClose size={28} />
            </button>
          </div>

          <div className="flex justify-center">
            <Image src={live} width={100} height={100} alt="Live" />
          </div>

          <div className="flex flex-col gap-2">
            <label className="text-sm font-semibold">Your Name</label>
            <input
              value={userName}
              onChange={(e) => {
                setUserName(e.target.value)
                localStorage.setItem("userName", e.target.value)
              }}
              type="text"
              placeholder="Your name"
              className="border border-gray-300 text-black rounded-lg p-2"
            />
          </div>

          {isLive && (
            <div className="flex flex-col gap-2">
              <label className="text-sm font-semibold">Share Join Link</label>
              <p className="text-xs text-gray-400">Anyone with this link can join the session</p>
              <div className="flex gap-2">
                <input
                  value={`${window.location.origin}/room/${params.roomId}`}
                  readOnly
                  className="border border-gray-300 text-black rounded-lg p-2 w-full"
                />
                <button
                  onClick={() => {
                    navigator.clipboard.writeText(`${window.location.origin}/room/${params.roomId}`)
                    toast("Copied to Clipboard", {
                      icon: "📋",
                      style: { borderRadius: "10px", background: "#333", color: "#fff" },
                    })
                  }}
                  className="bg-primary px-3 py-2 text-white rounded-md text-sm"
                >
                  Copy
                </button>
              </div>
            </div>
          )}

          <div className="mt-auto">
            {isLive ? (
              <button
                onClick={() => {
                  setIsLive(false)
                  router.push("/")
                }}
                className="w-full bg-red-500 hover:bg-opacity-80 text-white font-bold py-2 px-4 rounded-lg"
              >
                Stop Session
              </button>
            ) : (
              <button
                onClick={startSession}
                className="w-full bg-primary hover:bg-opacity-80 text-white font-bold py-2 px-4 rounded-lg"
              >
                Start Session
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  )
}

export default Session
