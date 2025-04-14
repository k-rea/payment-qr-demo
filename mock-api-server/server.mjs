import express from 'express';
import cors from 'cors';
import { v4 as uuidv4 } from 'uuid';
import fetch from 'node-fetch';
import jwt from 'jsonwebtoken';
import fs from 'fs';
import dotenv from 'dotenv';

dotenv.config();

const app = express();
const port = process.env.PORT || 4000;

app.use(cors());
app.use(express.json());

const APPSYNC_URL = process.env.APPSYNC_API_URL;

const mutation = `
  mutation UpdatePaymentStatus($reservation_id: ID!, $status: String!) {
    updatePaymentStatus(reservation_id: $reservation_id, status: $status) {
      reservation_id
      status
    }
  }
`;

app.post('/api/qr', async (req, res) => {
  const reservationId = uuidv4();
  const privateKey = fs.readFileSync('private.pem');

  const token = jwt.sign(
    {
      reservation_id: reservationId,
      expired_at: Math.floor(Date.now() / 1000) + 60 * 5,
    },
    privateKey,
    {
      algorithm: 'RS256',
    }
  );

  const variables = {
    reservation_id: reservationId,
    status: 'PENDING',
  };

  try {
    const result = await fetch(APPSYNC_URL, {
      method: 'POST',
      headers: {
        // Lambda Authorizerの場合、Authorizationヘッダーにトークンを設定
        'Authorization': token,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        query: mutation,
        variables,
      }),
    });

    const json = await result.json();

    if (json.errors) {
      console.error('GraphQL errors:', json.errors);
      return res.status(500).json({ error: 'Failed to update payment status' });
    }

    console.log('✅ Mutation success:', json.data.updatePaymentStatus);
    res.json({
      reservation_id: reservationId,
      token,
    });
  } catch (error) {
    console.error('❌ Error calling AppSync:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

app.post('/api/payment', async (req, res) => {
  const { reservation_id } = req.body;

  if (!reservation_id) {
    return res.status(400).json({ error: 'Reservation ID is required in request body' });
  }

  const privateKey = fs.readFileSync('private.pem');

  // 認証用トークンを生成
  const token = jwt.sign(
    {
      reservation_id: reservation_id,
      expired_at: Math.floor(Date.now() / 1000) + 60 * 5,
    },
    privateKey,
    {
      algorithm: 'RS256',
    }
  );

  const variables = {
    reservation_id: reservation_id,
    status: 'PAID', // ステータスをPAIDに更新
  };

  try {
    const result = await fetch(APPSYNC_URL, {
      method: 'POST',
      headers: {
        'Authorization': token,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        query: mutation,
        variables,
      }),
    });

    const json = await result.json();

    if (json.errors) {
      console.error('GraphQL errors:', json.errors);
      return res.status(500).json({ error: 'Failed to update payment status' });
    }

    console.log('✅ Payment completed:', json.data.updatePaymentStatus);
    res.json({
      success: true,
      message: 'Payment status updated to PAID',
      data: json.data.updatePaymentStatus
    });
  } catch (error) {
    console.error('❌ Error updating payment status:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

app.listen(port, () => {
  console.log(`QR API Server is running on http://localhost:${port}`);
});
