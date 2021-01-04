import * as uuid from 'uuid'

import { ReceiptItem } from "../models/ReceiptItem";
import { ReceiptAccess } from "../dataLayer/receiptAccess";
import { CreateReceiptRequest } from "../requests/CreateReceiptRequest";
import { parseUserId } from '../auth/utils'
import { createLogger } from '../utils/logger'

const logger = createLogger('auth')
const receiptAccess = new ReceiptAccess()

export async function getAllReceipts(jwtToken: string) : Promise<ReceiptItem[]> {
    return receiptAccess.getAllReceipts(parseUserId(jwtToken))
}

export async function createReceiptItem(
    createReceiptRequest: CreateReceiptRequest,
    jwtToken: string
): Promise<ReceiptItem> {

    const receiptId = uuid.v4()
    const userId = parseUserId(jwtToken)
    logger.info("Creating receipt : " + createReceiptRequest)
    logger.info("User : " + userId)
    
    return await receiptAccess.createReceipt({
        userId: userId,
        receiptId: receiptId,
        createdAt: new Date().toISOString(),
        description: createReceiptRequest.description,
        attachmentUrl: ""
    })
}

export async function deleteReceipt(
    receiptId: string,
    jwtToken: string
): Promise<string> {
    const userId = parseUserId(jwtToken)

    await clearExistingImage(userId, receiptId)
    
    return receiptAccess.deleteReceipt(userId, receiptId)
}

export async function generateUploadUrl(
    receiptId: string,
    jwtToken: string
): Promise<string> {

    const imageId = uuid.v4()
    const userId = parseUserId(jwtToken)
    logger.info("Getting uploadURL")

    // Delete previous image if exists
    await clearExistingImage(userId, receiptId)

    await receiptAccess.updateImageURL(userId, receiptId, imageId)

    return receiptAccess.getUploadUrl(imageId)
}

async function clearExistingImage(userId: string, receiptId: string) {
    const receiptToUpdate = await receiptAccess.getReceipt(userId, receiptId)
    
    if(receiptToUpdate != null && receiptToUpdate.attachmentUrl != "") {
        logger.info("Clearing receipt image : " + receiptToUpdate.attachmentUrl)
        await receiptAccess.deleteImage(receiptToUpdate.attachmentUrl)
    }
}
