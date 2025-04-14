import * as jwt from 'jsonwebtoken';

const publicKey = Buffer.from(process.env.PUBLIC_KEY_BASE64!, 'base64').toString('utf-8');

export const handler = async (event: { authorizationToken: string; headers: { [key: string]: string } }) => {
  console.log("Lambda関数が実行されました");
  console.log("リクエストの詳細:", event);
  const token = event.authorizationToken;
  console.log("トークン:", token);

  if (!token) throw new Error('Unauthorized');

  try {
    const decoded = jwt.verify(token, publicKey, { algorithms: ['RS256'] }) as {
      reservation_id: string;
      expired_at: number;
    };
    console.log("デコードされたトークン:", decoded);

    if (decoded.expired_at < Math.floor(Date.now() / 1000)) {
      throw new Error('Token expired');
    }

    console.log("処理が正常に完了しました");
    return {
      isAuthorized: true,
      resolverContext: {
        reservation_id: decoded.reservation_id,
      },
    };
  } catch (err) {
    console.error('JWT verify failed', err);
    throw new Error('Unauthorized');
  }
};
