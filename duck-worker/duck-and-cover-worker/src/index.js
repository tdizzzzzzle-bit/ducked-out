/**
 * Duck & Cover — Cloudflare Worker
 * Stripe checkout → Printful manual order (no store product setup needed)
 *
 * Secrets (wrangler secret put):
 *   PRINTFUL_API_KEY
 *   STRIPE_SECRET_KEY
 *   STRIPE_WEBHOOK_SECRET
 */

const SITE_URL = 'https://tdizzzzzzle-bit.github.io';
const DESIGN_BASE_URL = 'https://tdizzzzzzle-bit.github.io/ducked-out';

// Design image files per product
const PRODUCT_IMAGES = {
  gerald:       'Gerald.svg',
  bernard:      'Bernard.svg',
  sid:          'DuckCream.svg',
  bartholomew:  'Bartholomew.svg',
  toby:         'Toby.svg',
};

// Bella+Canvas 3001 catalog variant IDs from Printful
// Format: colorHex:size → variant ID
// No store product setup needed — these are used directly in manual orders
const VARIANTS = {
  '#FFFFFF:S': 4011,  '#FFFFFF:M': 4012,  '#FFFFFF:L': 4013,  '#FFFFFF:XL': 4014,  '#FFFFFF:2XL': 4015,  '#FFFFFF:3XL': 5294,
  '#1C1C1C:S': 4016,  '#1C1C1C:M': 4017,  '#1C1C1C:L': 4018,  '#1C1C1C:XL': 4019,  '#1C1C1C:2XL': 4020,  '#1C1C1C:3XL': 5295,
  '#1A2848:S': 4111,  '#1A2848:M': 4112,  '#1A2848:L': 4113,  '#1A2848:XL': 4114,  '#1A2848:2XL': 4115,  '#1A2848:3XL': 12874,
  '#CC1818:S': 4141,  '#CC1818:M': 4142,  '#CC1818:L': 4143,  '#CC1818:XL': 4144,  '#CC1818:2XL': 4145,  '#CC1818:3XL': 5304,
  '#6B0F1A:S': 4106,  '#6B0F1A:M': 4107,  '#6B0F1A:L': 4108,  '#6B0F1A:XL': 4109,  '#6B0F1A:2XL': 4110,  '#6B0F1A:3XL': 15792,
  '#2D5A27:S': 8451,  '#2D5A27:M': 8452,  '#2D5A27:L': 8453,  '#2D5A27:XL': 8454,  '#2D5A27:2XL': 8455,  '#2D5A27:3XL': 8456,
  '#506028:S': 17203, '#506028:M': 17204, '#506028:L': 17205, '#506028:XL': 17206, '#506028:2XL': 17209, '#506028:3XL': 17208,
  '#E8A820:S': 4081,  '#E8A820:M': 4082,  '#E8A820:L': 4083,  '#E8A820:XL': 4084,  '#E8A820:2XL': 4085,  '#E8A820:3XL': 5299,
  '#FF6600:S': 4126,  '#FF6600:M': 4127,  '#FF6600:L': 4128,  '#FF6600:XL': 4129,  '#FF6600:2XL': 4130,  '#FF6600:3XL': 17210,
  '#6EB4D8:S': 4096,  '#6EB4D8:M': 4097,  '#6EB4D8:L': 4098,  '#6EB4D8:XL': 4099,  '#6EB4D8:2XL': 4100,
  '#2850A0:S': 4171,  '#2850A0:M': 4172,  '#2850A0:L': 4173,  '#2850A0:XL': 4174,  '#2850A0:2XL': 4175,  '#2850A0:3XL': 5307,
  '#B0AEA8:S': 6948,  '#B0AEA8:M': 6949,  '#B0AEA8:L': 6950,  '#B0AEA8:XL': 6951,  '#B0AEA8:2XL': 6952,  '#B0AEA8:3XL': 6953,
  '#464646:S': 8460,  '#464646:M': 8461,  '#464646:L': 8462,  '#464646:XL': 8463,  '#464646:2XL': 8464,  '#464646:3XL': 8465,
  '#2C3C60:S': 8509,  '#2C3C60:M': 8510,  '#2C3C60:L': 8511,  '#2C3C60:XL': 8512,  '#2C3C60:2XL': 8513,  '#2C3C60:3XL': 8514,
  '#141E32:S': 8495,  '#141E32:M': 8496,  '#141E32:L': 8497,  '#141E32:XL': 8498,  '#141E32:2XL': 8499,  '#141E32:3XL': 8500,
  '#3A5EA0:S': 8530,  '#3A5EA0:M': 8531,  '#3A5EA0:L': 8532,  '#3A5EA0:XL': 8533,  '#3A5EA0:2XL': 8534,  '#3A5EA0:3XL': 8535,
  '#4A6A4A:S': 8488,  '#4A6A4A:M': 8489,  '#4A6A4A:L': 8490,  '#4A6A4A:XL': 8491,  '#4A6A4A:2XL': 8492,  '#4A6A4A:3XL': 8493,
  '#CC3333:S': 20681, '#CC3333:M': 20679, '#CC3333:L': 20677, '#CC3333:XL': 20675, '#CC3333:2XL': 20673,
  '#A85CA0:S': 10352, '#A85CA0:M': 10353, '#A85CA0:L': 10354, '#A85CA0:XL': 10355, '#A85CA0:2XL': 10356,
  '#F9C5C9:S': 4136,  '#F9C5C9:M': 4137,  '#F9C5C9:L': 4138,  '#F9C5C9:XL': 4139,  '#F9C5C9:2XL': 4140,  '#F9C5C9:3XL': 5303,
  '#F4A0B0:S': 20680, '#F4A0B0:M': 20678, '#F4A0B0:L': 20676, '#F4A0B0:XL': 20674, '#F4A0B0:2XL': 20672,
  '#7B1240:S': 4041,  '#7B1240:M': 4042,  '#7B1240:L': 4043,  '#7B1240:XL': 4044,  '#7B1240:2XL': 4045,  '#7B1240:3XL': 5298,
  '#BC1010:S': 4061,  '#BC1010:M': 4062,  '#BC1010:L': 4063,  '#BC1010:XL': 4064,  '#BC1010:2XL': 4065,
  '#F2EDD7:S': 14682, '#F2EDD7:M': 14683, '#F2EDD7:L': 14684, '#F2EDD7:XL': 14685, '#F2EDD7:2XL': 14686, '#F2EDD7:3XL': 14687,
  '#FFF5CC:S': 4151,  '#FFF5CC:M': 4152,  '#FFF5CC:L': 4153,  '#FFF5CC:XL': 4154,  '#FFF5CC:2XL': 4155,  '#FFF5CC:3XL': 5305,
  '#6B7A38:S': 4121,  '#6B7A38:M': 4122,  '#6B7A38:L': 4123,  '#6B7A38:XL': 4124,  '#6B7A38:2XL': 4125,  '#6B7A38:3XL': 16340,
  '#009944:S': 4086,  '#009944:M': 4087,  '#009944:L': 4088,  '#009944:XL': 4089,  '#009944:2XL': 4090,  '#009944:3XL': 5300,
  '#00C8C8:S': 4021,  '#00C8C8:M': 4022,  '#00C8C8:L': 4023,  '#00C8C8:XL': 4024,  '#00C8C8:2XL': 4025,  '#00C8C8:3XL': 5296,
  '#2E7D60:S': 22059, '#2E7D60:M': 22060, '#2E7D60:L': 22061, '#2E7D60:XL': 22062, '#2E7D60:2XL': 22063,
  '#4A7CA8:S': 4161,  '#4A7CA8:M': 4162,  '#4A7CA8:L': 4163,  '#4A7CA8:XL': 4164,  '#4A7CA8:2XL': 4165,  '#4A7CA8:3XL': 5306,
  '#5020A0:S': 4166,  '#5020A0:M': 4167,  '#5020A0:L': 4168,  '#5020A0:XL': 4169,  '#5020A0:2XL': 4170,  '#5020A0:3XL': 21456,
  '#C098C8:S': 10368, '#C098C8:M': 10369, '#C098C8:L': 10370, '#C098C8:XL': 10371, '#C098C8:2XL': 10372,
  '#AAE8C0:S': 8502,  '#AAE8C0:M': 8503,  '#AAE8C0:L': 8504,  '#AAE8C0:XL': 8505,  '#AAE8C0:2XL': 8506,  '#AAE8C0:3XL': 8507,
  '#DFC96A:S': 10376, '#DFC96A:M': 10377, '#DFC96A:L': 10378, '#DFC96A:XL': 10379, '#DFC96A:2XL': 10380, '#DFC96A:3XL': 10381,
  '#8C6030:S': 4046,  '#8C6030:M': 4047,  '#8C6030:L': 4048,  '#8C6030:XL': 4049,  '#8C6030:2XL': 4050,
  '#C8B08C:S': 14674, '#C8B08C:M': 14675, '#C8B08C:L': 14676, '#C8B08C:XL': 14677, '#C8B08C:2XL': 14678, '#C8B08C:3XL': 14679,
};

const CORS = {
  'Access-Control-Allow-Origin': SITE_URL,
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type',
};

// ─────────────────────────────────────────────
export default {
  async fetch(request, env) {
    const url = new URL(request.url);
    if (request.method === 'OPTIONS') return new Response(null, { headers: CORS });
    if (url.pathname === '/create-checkout' && request.method === 'POST') return handleCreateCheckout(request, env);
    if (url.pathname === '/webhook'         && request.method === 'POST') return handleWebhook(request, env);
    if (url.pathname === '/')               return new Response('🦆 Duck & Cover Worker is live.', { status: 200 });
    return new Response('Not found', { status: 404 });
  },
};

// ─────────────────────────────────────────────
async function handleCreateCheckout(request, env) {
  try {
    const { productId, productName, color, colorName, size, price } = await request.json();
    if (!productId || !color || !size || !price) return json({ error: 'Missing required fields' }, 400);

    const params = new URLSearchParams({
      mode:                                                   'payment',
      'payment_method_types[]':                              'card',
      'success_url':                                          `${SITE_URL}/ducked-out/success.html?session_id={CHECKOUT_SESSION_ID}`,
      'cancel_url':                                           `${SITE_URL}/ducked-out/shop.html`,
      'line_items[0][price_data][currency]':                 'usd',
      'line_items[0][price_data][product_data][name]':       `${productName} — ${colorName} / ${size}`,
      'line_items[0][price_data][product_data][description]': 'Hand-drawn duck tee on Bella+Canvas 3001, fulfilled by Printful',
      'line_items[0][price_data][unit_amount]':              String(Math.round(price * 100)),
      'line_items[0][quantity]':                             '1',
      'shipping_address_collection[allowed_countries][]':    'US',
      'metadata[productId]':                                 productId,
      'metadata[color]':                                     color,
      'metadata[colorName]':                                 colorName,
      'metadata[size]':                                      size,
    });

    const res = await fetch('https://api.stripe.com/v1/checkout/sessions', {
      method: 'POST',
      headers: { 'Authorization': `Bearer ${env.STRIPE_SECRET_KEY}`, 'Content-Type': 'application/x-www-form-urlencoded' },
      body: params.toString(),
    });

    const session = await res.json();
    if (!res.ok) throw new Error(session.error?.message || 'Stripe error');
    return json({ url: session.url }, 200);

  } catch (err) {
    console.error('Checkout error:', err.message);
    return json({ error: err.message }, 500);
  }
}

// ─────────────────────────────────────────────
async function handleWebhook(request, env) {
  const signature = request.headers.get('stripe-signature');
  const body      = await request.text();

  let event;
  try {
    event = await verifyStripeWebhook(body, signature, env.STRIPE_WEBHOOK_SECRET);
  } catch (err) {
    return json({ error: 'Invalid signature' }, 400);
  }

  if (event.type === 'checkout.session.completed') {
    try { await placePrintfulOrder(event.data.object, env); }
    catch (err) { console.error('Printful order failed:', err.message); }
  }

  return json({ received: true }, 200);
}

// ─────────────────────────────────────────────
async function verifyStripeWebhook(body, signature, secret) {
  if (!signature) throw new Error('Missing stripe-signature');
  const parts     = signature.split(',');
  const timestamp = parts.find(p => p.startsWith('t='))?.slice(2);
  const sigHash   = parts.find(p => p.startsWith('v1='))?.slice(3);
  if (!timestamp || !sigHash) throw new Error('Malformed signature');
  const key = await crypto.subtle.importKey('raw', new TextEncoder().encode(secret), { name: 'HMAC', hash: 'SHA-256' }, false, ['sign']);
  const mac = await crypto.subtle.sign('HMAC', key, new TextEncoder().encode(`${timestamp}.${body}`));
  const expected = Array.from(new Uint8Array(mac)).map(b => b.toString(16).padStart(2, '0')).join('');
  if (expected !== sigHash) throw new Error('Signature mismatch');
  return JSON.parse(body);
}

// ─────────────────────────────────────────────
async function placePrintfulOrder(session, env) {
  const { productId, color, size } = session.metadata;
  const shipping = session.shipping_details;
  const address  = shipping?.address;

  if (!address) { console.error('No shipping address in session:', session.id); return; }

  // Look up catalog variant ID
  const variantKey = `${color}:${size}`;
  const variantId  = VARIANTS[variantKey];
  if (!variantId) {
    console.error(`No variant found for ${variantKey} — add it to VARIANTS`);
    return;
  }

  // Get design file URL
  const imageFile = PRODUCT_IMAGES[productId];
  if (!imageFile) { console.error(`No image for product: ${productId}`); return; }
  const imageUrl = `${DESIGN_BASE_URL}/${imageFile}`;

  // Create manual order directly — no store product needed
  const order = {
    external_id: session.id,
    recipient: {
      name:         shipping.name,
      address1:     address.line1,
      address2:     address.line2 || '',
      city:         address.city,
      state_code:   address.state,
      country_code: address.country,
      zip:          address.postal_code,
      email:        session.customer_details?.email || '',
    },
    items: [{
      variant_id: variantId,
      quantity:   1,
      files: [{
        url:       imageUrl,
        placement: 'front',
      }],
    }],
  };

  const res = await fetch('https://api.printful.com/orders', {
    method:  'POST',
    headers: { 'Authorization': `Bearer ${env.PRINTFUL_API_KEY}`, 'Content-Type': 'application/json' },
    body:    JSON.stringify(order),
  });

  const result = await res.json();
  if (!res.ok) throw new Error(`Printful: ${JSON.stringify(result.error || result)}`);
  console.log(`✅ Printful order ${result.result.id} for Stripe ${session.id}`);
}

// ─────────────────────────────────────────────
function json(data, status = 200) {
  return new Response(JSON.stringify(data), { status, headers: { ...CORS, 'Content-Type': 'application/json' } });
}
