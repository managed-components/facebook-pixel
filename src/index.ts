import { ComponentSettings, Manager } from '@managed-components/types'
import { getEcommerceRequestBody } from './ecommerce'
import { getRequestBody } from './track'

const sendEvent = async (payload: any, settings: ComponentSettings) => {
  const property = payload.custom_data.property || settings.property
  const graphEndpoint = `https://graph.facebook.com/v14.0/${property}/events`

  const requestBody = {
    data: [payload],
    access_token: payload.custom_data.accessToken || settings.accessToken,
    ...(settings.testKey && {
      test_event_code: settings.testKey,
    }),
  }

  fetch(graphEndpoint, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(requestBody),
  })
}

export default async function (manager: Manager, settings: ComponentSettings) {
  manager.addEventListener('event', async event => {
    const request = await getRequestBody('event', event, settings)
    sendEvent(request, settings)
  })

  manager.addEventListener('pageview', async event => {
    const request = await getRequestBody('pageview', event, settings)
    sendEvent(request, settings)
  })

  manager.addEventListener('ecommerce', async event => {
    const request = await getEcommerceRequestBody(event, settings)
    sendEvent(request, settings)
  })
}
