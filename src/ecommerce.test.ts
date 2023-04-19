import { Client, MCEvent } from '@managed-components/types'
import { mapEcommerceData } from './ecommerce'

describe('mapEcommerceData', () => {
  const mockEvent = new Event('Order Completed') as unknown as MCEvent
  mockEvent.name = 'Order Completed'
  mockEvent.client = {
    title: 'Test Ecommerce',
    language: 'en-GB',
    url: new URL('https://www.someshop.com/'),
    emitter: 'browser',
    userAgent:
      'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/92.0.4488.0 Safari/537.36',
    ip: '2001:8a0:6383:1700:95e3:97c3:d338:890c',
    referer: '',
    fetch: vi.fn(),
    execute: vi.fn(),
    return: vi.fn(),
    get: vi.fn().mockImplementation(key => {
      const cookies: Record<string, string> = {
        _gid: 'GA1.2.1520407294.1621950425',
      }
      return cookies[key]
    }),
    set: vi.fn(),
    attachEvent: vi.fn(),
  } as unknown as Client
  mockEvent.payload = {
    ecommerce: {
      timestamp: 1681938876,
      'zaraz-test-mc_zara__last_page_title': 'test ecommerce',
      snowplow_SNOW__pvid: 'd778886c-5bcd-42db-8374-90d59fd388eb',
      snowplow_SNOW__email: 'null',
      checkout_id: '616727740',
      order_id: '817286897056801',
      affiliation: 'affiliate.com',
      total: 30,
      revenue: 25,
      shipping: 3,
      tax: 2,
      discount: 5,
      coupon: 'winter-sale',
      currency: 'USD',
      products: [
        {
          product_id: '999666321',
          sku: '8251511',
          name: 'Boy’s shoes',
          price: 10,
          quantity: 2,
          category: 'shoes',
        },
        {
          product_id: '742566131',
          sku: '7251567',
          name: 'Blank T-shirt',
          price: 5,
          quantity: 2,
          category: 'T-shirts',
        },
      ],
    },
    name: 'Order Completed',
  }

  it('returns valid request body object', async () => {
    const payload = await mapEcommerceData(mockEvent)
    const expectedPayload = {
      currency: 'USD',
      content_category: undefined,
      content_type: 'product',
      content_ids: ['8251511', '7251567'],
      content_name: 'Boy’s shoes,Blank T-shirt',
      contents: [
        {
          id: '8251511',
          quantity: 2,
          item_price: 10,
        },

        {
          id: '7251567',
          quantity: 2,
          item_price: 5,
        },
      ],
      value: 30,
      order_id: '817286897056801',
      num_items: '2',
    }
    expect(payload).toEqual(expectedPayload)
  })

  it('returns valid request body object for single products too', async () => {
    mockEvent.payload = {
      ecommerce: {
        timestamp: 1681938876,
        'zaraz-test-mc_zara__last_page_title': 'test ecommerce',
        snowplow_SNOW__pvid: 'd778886c-5bcd-42db-8374-90d59fd388eb',
        snowplow_SNOW__email: 'null',
        checkout_id: '616727740',
        order_id: '817286897056801',
        affiliation: 'affiliate.com',
        total: 20,
        revenue: 15,
        shipping: 3,
        tax: 2,
        discount: 5,
        coupon: 'winter-sale',
        currency: 'USD',
        products: [
          {
            product_id: '999666321',
            sku: '8251511',
            name: 'Boy’s shoes',
            price: 10,
            quantity: 2,
            category: 'shoes',
          },
        ],
      },
      name: 'Order Completed',
    }
    const payload = await mapEcommerceData(mockEvent)
    const expectedPayload = {
      currency: 'USD',
      content_category: undefined,
      content_type: 'product',
      content_ids: ['8251511'],
      content_name: 'Boy’s shoes',
      contents: [
        {
          id: '8251511',
          quantity: 2,
          item_price: 10,
        },
      ],
      value: 20,
      order_id: '817286897056801',
      num_items: '1',
    }
    expect(payload).toEqual(expectedPayload)
  })
})
