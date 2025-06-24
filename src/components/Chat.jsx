'use client'
import { useEffect, useState } from "react"
import { BsFillChatSquareTextFill } from "react-icons/bs"
import { IoClose } from "react-icons/io5"

const Chat = ({ isLive, sendMessage, messages, socketId }) => {
  const [chatMessage, setChatMessage] = useState("")
  const [unreadMessages, setUnreadMessages] = useState(0)
  const [show, setShow] = useState(false)

  useEffect(() => {
    if (!show && messages.length > 0 && messages[messages.length - 1].socketId !== socketId) {
      setUnreadMessages(prev => prev + 1)
    }
  }, [messages])

  useEffect(() => {
    if (show) setUnreadMessages(0)
  }, [show])

  const handelSubmit = (e) => {
    e.preventDefault()
    if (chatMessage === '') return
    sendMessage(chatMessage)
    setChatMessage('')
  }

  return (
    <div className="relative">
      {isLive && (
        <button
          onClick={() => setShow(!show)}
          className="fixed top-4 right-[30px] z-40 bg-secondary hover:bg-opacity-70 text-white font-bold py-2 px-4 rounded-full relative"
        >
          <BsFillChatSquareTextFill className="text-2xl text-primary" />
          {unreadMessages > 0 && (
            <div className="absolute -top-1 -right-1 text-[12px] text-white font-bold bg-red-400 px-1 rounded-full">
              {unreadMessages}
            </div>
          )}
        </button>
      )}

      {show && (
        <div className="fixed top-[60px] right-4 w-full max-w-[320px] h-[90vh] sm:right-[250px] sm:h-[600px] z-50 bg-secondary shadow-xl flex flex-col justify-between rounded-lg">
          {/* Header */}
          <div className="bg-primary p-4 text-white flex justify-between items-center rounded-t-lg">
            <h1 className="text-xl font-bold">Chat</h1>
            <button
              onClick={() => setShow(false)}
              className="hover:text-gray-300"
            >
              <IoClose size={24} />
            </button>
          </div>

          {/* Messages */}
          <div className="flex-1 p-4 overflow-y-auto space-y-4">
            {messages.map((message, index) => (
              message.socketId === socketId ? (
                <div key={index} className="flex justify-end">
                  <div className="bg-primary text-white px-4 py-2 rounded-2xl max-w-[80%] break-words">
                    {message.message}
                  </div>
                </div>
              ) : (
                <div key={index} className="flex flex-col items-start">
                  <p className="text-xs text-gray-400">{message.userName}</p>
                  <div className="bg-tertiary text-white px-4 py-2 rounded-2xl max-w-[80%] break-words">
                    {message.message}
                  </div>
                </div>
              )
            ))}
          </div>

          {/* Input Box */}
          <form onSubmit={handelSubmit} className="p-4 border-t border-gray-600 flex gap-2">
            <input
              value={chatMessage}
              onChange={(e) => setChatMessage(e.target.value)}
              className="flex-1 bg-gray-200 text-gray-800 p-2 rounded-lg focus:outline-none"
              placeholder="Type your message..."
            />
            <button
              type="submit"
              className="bg-primary hover:bg-opacity-70 text-white font-bold px-4 py-2 rounded-lg"
            >
              Send
            </button>
          </form>
        </div>
      )}
    </div>
  )
}

export default Chat
