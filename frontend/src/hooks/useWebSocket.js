import { useEffect, useRef, useCallback } from 'react'
import { Client } from '@stomp/stompjs'
import SockJS from 'sockjs-client'

export function useWebSocket(roomCode, onMessage) {
  const clientRef = useRef(null)
  const cbRef = useRef(onMessage)
  useEffect(() => { cbRef.current = onMessage }, [onMessage])

  useEffect(() => {
    if (!roomCode) return
    const client = new Client({
      webSocketFactory: () => new SockJS(`${import.meta.env.VITE_WS_URL || ''}/ws`),
      reconnectDelay: 3000,
      onConnect: () => {
        client.subscribe(`/topic/room/${roomCode}`, (frame) => {
          try { cbRef.current(JSON.parse(frame.body)) } catch {}
        })
      },
    })
    client.activate()
    clientRef.current = client
    return () => client.deactivate()
  }, [roomCode])

  const send = useCallback((dest, body) => {
    if (clientRef.current?.connected) {
      clientRef.current.publish({ destination: `/app${dest}`, body: JSON.stringify(body) })
    }
  }, [])

  return { send }
}
