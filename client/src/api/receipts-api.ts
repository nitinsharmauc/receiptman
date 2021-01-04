import { apiEndpoint } from '../config'
import { Receipt } from '../types/Receipt';
import { CreateReceiptRequest } from '../types/CreateReceiptRequest';
import Axios from 'axios'

export async function getReceipts(idToken: string): Promise<Receipt[]> {
  console.log('Fetching receipts')

  const response = await Axios.get(`${apiEndpoint}/receipts`, {
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${idToken}`
    },
  })
  console.log('Receipts:', response.data)
  return response.data.items
}

export async function createReceipt(
  idToken: string,
  newReceipt: CreateReceiptRequest
): Promise<Receipt> {
  const response = await Axios.post(`${apiEndpoint}/receipts`,  JSON.stringify(newReceipt), {
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${idToken}`
    }
  })
  return response.data.item
}

export async function deleteReceipt(
  idToken: string,
  receiptId: string
): Promise<void> {
  await Axios.delete(`${apiEndpoint}/receipts/${receiptId}`, {
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${idToken}`
    }
  })
}

export async function getUploadUrl(
  idToken: string,
  receiptId: string
): Promise<string> {
  const response = await Axios.post(`${apiEndpoint}/receipts/${receiptId}/attachment`, '', {
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${idToken}`
    }
  })
  return response.data.uploadUrl
}

export async function uploadFile(uploadUrl: string, file: Buffer): Promise<void> {
  await Axios.put(uploadUrl, file)
}
