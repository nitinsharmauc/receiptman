import * as AWS  from 'aws-sdk'
import * as AWSXRay from 'aws-xray-sdk'
import { DocumentClient } from 'aws-sdk/clients/dynamodb'
import { createLogger } from '../utils/logger'

const logger = createLogger('auth')
const XAWS = AWSXRay.captureAWS(AWS)

import { ReceiptItem } from '../models/ReceiptItem'

export class ReceiptAccess {

  constructor(
    private readonly docClient: DocumentClient = createDynamoDBClient(),
    private readonly s3 = new AWS.S3({signatureVersion: 'v4'}),
    private readonly receiptTable = process.env.RECEIPT_TABLE,
    private readonly bucketName = process.env.IMAGES_S3_BUCKET,
    private readonly urlExpiration = process.env.SIGNED_URL_EXPIRATION
    ) {
  }

  async getAllReceipts(userId: string): Promise<ReceiptItem[]> {
    logger.info('Getting all receipts for ' + userId)

    const result = await this.docClient.query({
      TableName: this.receiptTable,
      KeyConditionExpression: 'userId = :userId',
      ExpressionAttributeValues: {
        ':userId': userId
      },
      ScanIndexForward: false
    }).promise()
  
    const items = result.Items
    return items as ReceiptItem[]
  }

  async getReceipt(userId: string, receiptId: string): Promise<ReceiptItem> {
    logger.info('Getting receipt for ' + receiptId)

    const result = await this.docClient.query({
      TableName: this.receiptTable,
      KeyConditionExpression: 'userId = :userId and receiptId = :receiptId',
      ExpressionAttributeValues: {
        ':userId': userId,
        ':receiptId': receiptId
      }
    }).promise()
  
    const items = result.Items as ReceiptItem[]
    if (items.length > 0) {
      return items[0]
    }
    return null
  }

  async createReceipt(receiptItem: ReceiptItem): Promise<ReceiptItem> {
    await this.docClient.put({
      TableName: this.receiptTable,
      Item: receiptItem
    }).promise()

    logger.info("Create receipt done.")
    return receiptItem
  }

  async deleteReceipt(userId: string, receiptId: string): Promise<string> {
    await this.docClient.delete({
      TableName: this.receiptTable,
      Key: {
        "userId": userId,
        "receiptId": receiptId
      },
    }
    ).promise()
    return ""
  }

  async updateImageURL(userId: string, receiptId: string, imageId: string): Promise<string> {
    const imageURL =  this.getImageURL(imageId)

    await this.docClient.update({
      TableName: this.receiptTable,
      Key: {
          "userId": userId,
          "receiptId": receiptId
      },
      UpdateExpression: 'set attachmentUrl = :url',
      ExpressionAttributeValues: {
          ':url': imageURL
        },
      ReturnValues: 'UPDATED_NEW'
    }).promise()

    return imageURL
  }

  getUploadUrl(imageId: string) {
    return this.s3.getSignedUrl('putObject', {
      Bucket: this.bucketName,
      Key: imageId,
      Expires: this.urlExpiration
    })
  }

  async deleteImage(imageURL: string) {
    logger.info("Deleting image : ", imageURL)
    const imageId = imageURL.split(`/`)[3]
    logger.info("imageId is : ", imageId)
    
    await this.s3.deleteObject({
      Bucket: this.bucketName,
      Key: imageId
    }).promise()
  }

  getImageURL(imageId: string) {
    return `https://${this.bucketName}.s3.amazonaws.com/${imageId}`
  }
}

function createDynamoDBClient() {
  if (process.env.IS_OFFLINE) {
    logger.info('Creating a local DynamoDB instance')
    return new AWS.DynamoDB.DocumentClient({
      region: 'localhost',
      endpoint: 'http://localhost:8000'
    })
  }

  return new XAWS.DynamoDB.DocumentClient()
}


