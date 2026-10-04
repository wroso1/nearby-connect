import { useState, useEffect, useRef } from 'react';
import { io } from 'socket.io-client';

const SOCKET_URL = 'http://localhost:4000';

export default function ChatModal({ currentUser, targetUser, onClose }) {
  const [messages, setMessages] = useState([]);
  const [text, setText] = useState('');
  const socketRef = useRef(null);
  const bottomRef = useRef(null);

  // Room ID determinista para que ambos usuarios caigan en la misma sala
  const roomId = [currentUser.id, targetUser.id].sort().join('-');

  useEffect(() => {
    const socket = io(SOCKET_URL);
    socketRef.current = socket;
    socket.emit('join_chat', { roomId });
    socket.on('receive_message', (msg) => {
      setMessages((prev) => [...prev, msg]);
    });
    return () => socket.disconnect();
  }, [roomId]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const send = () => {
    const msg = text.trim();
    if (!msg || !socketRef.current) return;
    const payload = {
      roomId,
      senderId: currentUser.id,
      senderName: currentUser.nombre,
      message: msg,
    };
    socketRef.current.emit('send_message', payload);
    setMessages((prev) => [
      ...prev,
      { ...payload, timestamp: new Date().toISOString() },
    ]);
    setText('');
  };

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
      <div className="bg-white w-full max-w-md rounded-xl shadow-lg flex flex-col max-h-[80vh]">
        {/* Encabezado */}
        <div className="flex items-center justify-between p-3 border-b">
          <div className="flex items-center gap-2">
            <img
              src={targetUser.foto_url || 'https://via.placeholder.com/40'}
              alt={targetUser.nombre}
              className="w-9 h-9 rounded-full object-cover"
            />
            <span className="font-semibold">{targetUser.nombre}</span>
          </div>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 text-2xl leading-none"
          >
            ×
          </button>
        </div>

        {/* Mensajes */}
        <div className="flex-1 overflow-y-auto p-3 space-y-2">
          {messages.length === 0 && (
            <p className="text-gray-400 text-sm text-center">
              Empieza la conversación 👋
            </p>
          )}
          {messages.map((m, i) => (
            <div
              key={i}
              className={`flex ${
                m.senderId === currentUser.id ? 'justify-end' : 'justify-start'
              }`}
            >
              <div
                className={`max-w-[75%] px-3 py-2 rounded-lg text-sm ${
                  m.senderId === currentUser.id
                    ? 'bg-teal-600 text-white'
                    : 'bg-gray-200 text-gray-800'
                }`}
              >
                {m.message}
              </div>
            </div>
          ))}
          <div ref={bottomRef} />
        </div>

        {/* Entrada */}
        <div className="p-3 border-t flex gap-2">
          <input
            value={text}
            onChange={(e) => setText(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && send()}
            placeholder="Escribe un mensaje..."
            className="flex-1 border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-teal-500"
          />
          <button
            onClick={send}
            className="bg-teal-600 text-white px-4 py-2 rounded-lg hover:bg-teal-700"
          >
            Enviar
          </button>
        </div>
      </div>
    </div>
  );
}
