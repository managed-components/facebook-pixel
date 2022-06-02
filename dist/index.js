var g = Object.create
var i = Object.defineProperty
var C = Object.getOwnPropertyDescriptor
var E = Object.getOwnPropertyNames
var b = Object.getPrototypeOf,
  S = Object.prototype.hasOwnProperty
var M = (e, t) => {
    for (var n in t) i(e, n, { get: t[n], enumerable: !0 })
  },
  h = (e, t, n, r) => {
    if ((t && typeof t == 'object') || typeof t == 'function')
      for (let o of E(t))
        !S.call(e, o) &&
          o !== n &&
          i(e, o, {
            get: () => t[o],
            enumerable: !(r = C(t, o)) || r.enumerable,
          })
    return e
  }
var v = (e, t, n) => (
    (n = e != null ? g(b(e)) : {}),
    h(
      t || !e || !e.__esModule
        ? i(n, 'default', { value: e, enumerable: !0 })
        : n,
      e
    )
  ),
  A = e => h(i({}, '__esModule', { value: !0 }), e)
var N = {}
M(N, { default: () => I })
module.exports = A(N)
var p = v(require('crypto'))
var u = (e = {}, t = '') =>
  Object.keys(e).reduce((n, r) => {
    let o = t.length ? `${t}.` : ''
    return (
      typeof e[r] == 'object' &&
      !Array.isArray(e[r]) &&
      e[r] !== null &&
      Object.keys(e[r]).length > 0
        ? Object.assign(n, u(e[r], o + r))
        : Array.isArray(e[r]) && e[r] !== null
        ? e[r].forEach((s, a) => {
            typeof s == 'object' && s !== null
              ? Object.assign(n, u(s, o + r + '.' + a))
              : (n[o + r + '.' + a] = s)
          })
        : (n[o + r] = e[r]),
      n
    )
  }, {})
var P = {
    em: { hashed: !0 },
    ph: { hashed: !0 },
    fn: { hashed: !0 },
    ln: { hashed: !0 },
    db: { hashed: !0 },
    ge: { hashed: !0 },
    ct: { hashed: !0 },
    st: { hashed: !0 },
    zp: { hashed: !0 },
    country: { hashed: !0 },
    external_id: { hashed: !0 },
    subscription_id: {},
    fb_login_id: {},
    lead_id: {},
  },
  l = e => {
    let { client: t } = e
    return (
      'fb.' +
      (t.url.hostname
        ? t.url.hostname.split('.').length - 1
        : t.url.href.split('/')[2].split('.').length - 1) +
      '.' +
      new Date().valueOf() +
      '.'
    )
  },
  w = e => {
    let t = l(e) + String(Math.round(2147483647 * Math.random()))
    return e.client.set('fb-pixel', t), t
  },
  q = e => {
    let { client: t } = e,
      n = t.get('fb-click') || ''
    return (
      t.url.searchParams?.get('fbclid') &&
        ((n = l(e) + t.url.searchParams.get('fbclid')), t.set('fb-click', n)),
      n
    )
  },
  B = (e, t) => {
    let { client: n, payload: r } = e,
      o = String(Math.round(Math.random() * 1e17)),
      s = e.client.get('fb-pixel') || w(e),
      a = {
        event_name: r.ev || e.name || e.type,
        event_id: o,
        action_source: 'website',
        event_time: n.timestamp && Math.floor(n.timestamp / 1e3),
        event_source_url: n.url.href,
        data_processing_options: [],
        user_data: {
          fbp: s,
          ...(!t.hideClientIP && {
            client_user_agent: n.userAgent,
            client_ip_address: n.ip,
          }),
        },
        custom_data: {},
      }
    return delete r.ev, a
  },
  c = async (e, t) => {
    let { payload: n } = e,
      r = q(e),
      o = B(e, t),
      s = new TextEncoder()
    for (let [a, f] of Object.entries(P)) {
      let d = n[a]
      if (d) {
        if (f.hashed) {
          let _ = s.encode(d.trim().toLowerCase())
          d = await p.createHash('sha256').update(_).digest('hex')
        }
        ;(o.user_data[a] = d), delete n[a]
      }
    }
    return r && (o.user_data.fbc = r), (o.custom_data = u(n)), o
  }
var O = {
    'Order Completed': 'Purchase',
    'Product Added': 'AddToCart',
    'Products Searched': 'Search',
    'Checkout Started': 'InitiateCheckout',
    'Payment Info Entered': 'AddPaymentInfo',
    'Product Added to Wishlist': 'AddToWishlist',
    'Product Viewed': 'ViewContent',
  },
  k = e =>
    [...(e.products?.map(t => t.name) || []), ...((e.name && [e.name]) || [])]
      .filter(t => t)
      .join(),
  x = e => [
    ...(e.products?.map(t => t.sku || t.product_id) || []),
    ...(((e.sku || e.product_id) && [e.sku || e.product_id]) || []),
  ],
  R = e => e.value || e.price || e.total || e.revenue,
  T = e => {
    let { payload: t, client: n } = e,
      r = {}
    return (
      (r.currency = t.currency),
      (r.content_type = 'product'),
      (r.content_ids = x(t)),
      (r.content_name = k(t)),
      (r.content_category = t.category),
      (r.value = R(t)),
      t.order_id && (r.order_id = t.order_id),
      e.name &&
        ['Checkout Started', 'Order Completed'].includes(e.name) &&
        (r.num_items = (t.products?.length || 1).toString()),
      e.name === 'Products Searched' && (r.search_string = n.url.search),
      r
    )
  },
  y = async (e, t) => {
    let n = await c(e, t)
    return (
      (n.event_name = O[e.name || ''] || e.name),
      delete n.custom_data.eventName,
      (n.custom_data = { ...n.custom_data, ...T(e) }),
      n
    )
  }
var m = async (e, t) => {
  let r = `https://graph.facebook.com/v13.0/${t.property}/events`,
    o = {
      data: [e],
      access_token: t.accessToken,
      ...(t.testKey && { test_event_code: t.testKey }),
    }
  fetch(r, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(o),
  })
}
async function I(e, t) {
  e.addEventListener('event', async n => {
    let r = await c(n, t)
    m(r, t)
  }),
    e.addEventListener('pageview', async n => {
      let r = await c(n, t)
      m(r, t)
    }),
    e.addEventListener('ecommerce', async n => {
      let r = await y(n, t)
      m(r, t)
    })
}
0 && (module.exports = {})
