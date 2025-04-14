'use client'

import { useState} from 'react'
import {ApolloProvider, ApolloClient, NormalizedCacheObject} from '@apollo/client'
import {WebSocketSubscription} from "@/app/_components/WebSocketSubscription";
import {createApolloClient} from "@/app/_lib/createApolloClientByAwsAppsync";


// メインコンポーネント
export default function Home() {
  const [reservationId, setReservationId] = useState('')
  const [token, setToken] = useState('')
  const [client, setClient] = useState<ApolloClient<NormalizedCacheObject> | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // QRコード発行処理
  const handleCreateReservation = async () => {
    try {
      setIsLoading(true)
      setError(null)

      const res = await fetch('http://localhost:4000/api/qr', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        }
      })

      if (!res.ok) {
        throw new Error(`HTTPエラー ${res.status}`)
      }

      const data = await res.json()

      if (!data.reservation_id || !data.token) {
        throw new Error('サーバーからの応答が無効です')
      }

      console.log('予約ID:', data.reservation_id)
      console.log('トークン（先頭部分）:', data.token.substring(0, 15) + '...')

      setReservationId(data.reservation_id)
      setToken(data.token)

      // ApolloClientを作成
      const newClient = createApolloClient(data.token)
      setClient(newClient)
    } catch (err) {
      console.error('予約の作成に失敗しました:', err)
      setError(err instanceof Error ? err.message : '予約の作成に失敗しました')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <main className="p-8 max-w-xl mx-auto space-y-6">
      <h1 className="text-2xl font-bold">🧾 AppSync QR 決済デモ</h1>

      <button
        onClick={handleCreateReservation}
        disabled={isLoading}
        className={`px-4 py-2 rounded ${
          isLoading ? 'bg-gray-400' : 'bg-blue-600 hover:bg-blue-700'
        } text-white`}
      >
        {isLoading ? '処理中...' : '🎫 QRコード発行'}
      </button>

      {error && (
        <div className="p-3 bg-red-100 border border-red-400 text-red-700 rounded">
          {error}
        </div>
      )}

      {reservationId && (
        <div className="space-y-2 p-4 border rounded bg-gray-50">
          <p><strong>予約ID:</strong> {reservationId}</p>
          <p><strong>トークン:</strong> <span className="font-mono text-xs break-all">{token.substring(0, 20)}...</span></p>
        </div>
      )}

      {client && reservationId && token && (
        <ApolloProvider client={client}>
          <WebSocketSubscription
            reservationId={reservationId}
            token={token}
          />
        </ApolloProvider>
      )}
    </main>
  )
}
