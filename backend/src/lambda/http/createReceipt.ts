import 'source-map-support/register'

import { APIGatewayProxyEvent, APIGatewayProxyHandler, APIGatewayProxyResult } from 'aws-lambda'

import { CreateReceiptRequest } from '../../requests/CreateReceiptRequest'
import { createReceiptItem } from '../../businessLogic/receipt'
import { createLogger } from '../../utils/logger'

const logger = createLogger('auth')

export const handler: APIGatewayProxyHandler = async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
  const newReceipt: CreateReceiptRequest = JSON.parse(event.body)
  logger.info("Creating Receipt ", newReceipt)
  const authorization = event.headers.Authorization
  const split = authorization.split(' ')
  const jwtToken = split[1]

  const receipt = await createReceiptItem(newReceipt, jwtToken)
  logger.info("Created Receipt", newReceipt)

  return {
    statusCode: 201,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Credentials': true
    },
    body: JSON.stringify({
      item: receipt
    })
  }
}
