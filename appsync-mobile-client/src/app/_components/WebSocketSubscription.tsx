'use client'
// サブスクリプションを直接 WebSocket で実装するコンポーネント
import {useEffect, useState} from "react";
import {gql, useSubscription} from "@apollo/client";

const SUBSCRIBE_PAYMENT_STATUS = gql`
  subscription OnPaymentStatusChanged($reservation_id: ID!) {
    onPaymentStatusChanged(reservation_id: $reservation_id) {
      reservation_id
      status
    }
  }
`;


export const WebSocketSubscription = (
  {
    reservationId,
    token,
  }: {
  reservationId: string
  token: string
}) => {
  const [status, setStatus] = useState('更新待ち中...')
  // const [isConnected, setIsConnected] = useState(false)
  const [error, setError] = useState<string | null>(null)
  // const wsRef = useRef<WebSocket | null>(null)

  // useSubscriptionでサブスクリプションを設定
  const { data, loading, error: subscriptionError } = useSubscription(SUBSCRIBE_PAYMENT_STATUS, {
    variables: { reservation_id: reservationId },
    context: {
      headers: {
        Authorization: token,
      },
    },
    onData: d => console.log("data", d),
    onError: e => console.log("onError", e),
    shouldResubscribe: true,
  })

  // サブスクリプションがエラーを返した場合の処理
  useEffect(() => {
    if (subscriptionError) {
      console.error('サブスクリプションエラー:', subscriptionError)
      setError(`エラー: ${subscriptionError.message}`)
    }
  }, [subscriptionError])

  // サーバーからのレスポンスを受け取って状態を更新
  useEffect(() => {
    if (data && data.onPaymentStatusChanged) {
      const paymentStatus = data.onPaymentStatusChanged
      setStatus(`ステータス: ${paymentStatus.status}`)
    }
  }, [data])

  // // WebSocket 接続を確立する関数
  // const setupWebSocket = useCallback(() => {
  //   try {
  //     console.log('WebSocket接続を開始...')
  //
  //     // 既存の接続をクリーンアップ
  //     if (wsRef.current) {
  //       wsRef.current.close()
  //     }
  //
  //     const headerObj = {
  //       Authorization: token,
  //       host: '4bqv4uguxveh3axcyi2e2omljy.appsync-api.ap-northeast-1.amazonaws.com', // GraphQLエンドポイントのHost
  //     }
  //
  //     const payloadObj = {} // payloadは空でOK
  //
  //     const headerBase64 = btoa(JSON.stringify(headerObj))
  //     const payloadBase64 = btoa(JSON.stringify(payloadObj))
  //     const wsUrl = `wss://4bqv4uguxveh3axcyi2e2omljy.appsync-realtime-api.ap-northeast-1.amazonaws.com/graphql?header=${headerBase64}&payload=${payloadBase64}`
  //
  //     // WebSocket接続を開始
  //     const ws = new WebSocket(wsUrl, 'graphql-ws')
  //     console.log('WebSocket URL:', wsUrl)
  //
  //     // 接続が開いた時の処理
  //     ws.onopen = () => {
  //       // connection_init で AppSync が求める payload を送信
  //       console.log('WebSocket接続が開きました')
  //       ws.send(
  //         JSON.stringify({
  //           type: 'connection_init',
  //         })
  //       )
  //       console.log('connection_initを送信:')
  //
  //       const payload = JSON.stringify({
  //         id: '1',
  //         type: 'start',
  //         payload: {
  //           query: ON_PAYMENT_STATUS_CHANGED,
  //           variables: {
  //             reservation_id: reservationId,
  //           },
  //         },
  //       })
  //       console.log("request payload:", payload)
  //
  //       ws.send(payload)
  //     }
  //
  //     // メッセージ受信時の処理
  //     ws.onmessage = (event) => {
  //       console.log('WebSocketメッセージを受信:', event.data)
  //       try {
  //         const data = JSON.parse(event.data)
  //
  //         // 接続確認
  //         if (data.type === 'connection_ack') {
  //           console.log('接続が確認されました', data)
  //         }
  //
  //         // サブスクリプションデータ
  //         if (data.type === 'data' && data.payload?.data?.onPaymentStatusChanged) {
  //           const paymentStatus = data.payload.data.onPaymentStatusChanged
  //           console.log('ステータス更新:', paymentStatus)
  //           setStatus(`ステータス: ${paymentStatus.status}`)
  //         }
  //
  //         // エラー処理
  //         if (data.type === 'error') {
  //           console.error('サブスクリプションエラー:', data.payload)
  //           setError(`エラー: ${JSON.stringify(data.payload)}`)
  //         }
  //       } catch (err) {
  //         console.error('メッセージの解析エラー:', err)
  //       }
  //     }
  //
  //     // エラー発生時の処理
  //     ws.onerror = (e) => {
  //       console.error('WebSocketエラー:', e)
  //       setIsConnected(false)
  //       setError('WebSocket接続エラーが発生しました')
  //     }
  //
  //     // 接続が閉じた時の処理
  //     ws.onclose = (e) => {
  //       console.log('WebSocket接続が閉じられました:', e)
  //       setIsConnected(false)
  //
  //       // 異常終了の場合は再接続を試みる
  //       if (!e.wasClean) {
  //         console.log('接続が異常終了しました。再接続を試みます...')
  //         setTimeout(setupWebSocket, 3000)
  //       }
  //     }
  //
  //     wsRef.current = ws
  //   } catch (err) {
  //     console.error('WebSocket設定エラー:', err)
  //     setError(`WebSocket設定エラー: ${err instanceof Error ? err.message : String(err)}`)
  //   }
  // }, [reservationId, token])
  //
  // // コンポーネントマウント時にWebSocket接続を開始
  // useEffect(() => {
  //   if (reservationId && token) {
  //     setupWebSocket()
  //   }
  //
  //   // クリーンアップ関数
  //   return () => {
  //     if (wsRef.current) {
  //       wsRef.current.close()
  //       wsRef.current = null
  //     }
  //   }
  // }, [reservationId, token, setupWebSocket])

  return (
    <div className="p-4 border rounded bg-gray-50">
      <div className="flex items-center space-x-2">
        <span className={`inline-block w-3 h-3 rounded-full ${loading ? 'bg-yellow-500 animate-pulse' : 'bg-green-500'}`}></span>
        <span>{loading ? '接続状態を確認中...' : '接続済み - 更新待ち'}</span>
      </div>

      <p className="mt-2">{status}</p>

      {error && (
        <div className="mt-3 p-2 bg-red-100 border border-red-300 rounded text-sm">
          <p className="text-red-700">{error}</p>
        </div>
      )}

      {loading && (
        <p className="mt-2 text-yellow-500">サブスクリプションのデータを待っています...</p>
      )}
    </div>
  )
}
