export default {
  async fetch(request, env, ctx) {
    const url = new URL(request.url);
    
    const corsHeaders = {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
    };

    if (request.method === 'OPTIONS') {
      return new Response(null, { headers: corsHeaders });
    }

    if (url.pathname === '/create-payment' && request.method === 'POST') {
      try {
        const body = await request.json();
        const { fineId, amount, callbackUrl } = body;

        if (!fineId || !amount || !callbackUrl) {
          return new Response(JSON.stringify({
            success: false,
            message: 'Missing required fields: fineId, amount, callbackUrl'
          }), {
            status: 400,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' }
          });
        }

        const transactionId = `MOCK${Date.now()}${Math.random().toString(36).substring(7).toUpperCase()}`;
        const orderId = `ORDER${Date.now()}`;
        const qrUrl = `https://img.vietqr.io/image/970422-0123456789-compact2.png?amount=${amount}&addInfo=${encodeURIComponent(`PAYMENT ${fineId.slice(-8)}`)}`;

        // Gửi callback ngay lập tức
        ctx.waitUntil(
          sendCallback(callbackUrl, {
            orderId,
            transactionId,
            fineId,
            amount,
            status: 'SUCCESS',
            paidAt: new Date().toISOString()
          })
        );

        return new Response(JSON.stringify({
          success: true,
          message: 'Payment order created successfully',
          data: {
            orderId,
            transactionId,
            qr_url: qrUrl,
            amount,
            status: 'PENDING',
            note: 'Payment callback will be sent immediately'
          }
        }), {
          status: 200,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        });

      } catch (error) {
        return new Response(JSON.stringify({
          success: false,
          message: error.message
        }), {
          status: 500,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        });
      }
    }

    if (url.pathname === '/query-payment' && request.method === 'POST') {
      try {
        const body = await request.json();
        const { orderId } = body;

        if (!orderId) {
          return new Response(JSON.stringify({
            success: false,
            message: 'Missing orderId'
          }), {
            status: 400,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' }
          });
        }

        return new Response(JSON.stringify({
          success: true,
          data: {
            orderId,
            status: 'SUCCESS',
            paidAt: new Date().toISOString()
          }
        }), {
          status: 200,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        });

      } catch (error) {
        return new Response(JSON.stringify({
          success: false,
          message: error.message
        }), {
          status: 500,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        });
      }
    }

    return new Response(JSON.stringify({
      service: 'Mock Payment Gateway',
      version: '1.0',
      endpoints: {
        createPayment: 'POST /create-payment',
        queryPayment: 'POST /query-payment'
      }
    }), {
      status: 200,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
  }
};

async function sendCallback(callbackUrl, paymentData) {
  try {
    await fetch(callbackUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(paymentData)
    });
  } catch (error) {
    console.error('Callback error:', error.message);
  }
}