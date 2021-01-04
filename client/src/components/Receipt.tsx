import dateFormat from 'dateformat'
import { History } from 'history'
import update from 'immutability-helper'
import * as React from 'react'
import {
  Button,
  Checkbox,
  Divider,
  Grid,
  Header,
  Icon,
  Input,
  Image,
  Loader
} from 'semantic-ui-react'

import { createReceipt, deleteReceipt, getReceipts } from '../api/receipts-api'
import Auth from '../auth/Auth'
import { Receipt } from '../types/Receipt'

interface ReceiptsProps {
  auth: Auth
  history: History
}

interface ReceiptsState {
  receipts: Receipt[]
  newReceiptName: string
  loadingReceipts: boolean
}

export class Receipts extends React.PureComponent<ReceiptsProps, ReceiptsState> {
  state: ReceiptsState = {
    receipts: [],
    newReceiptName: '',
    loadingReceipts: true
  }

  handleNameChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    this.setState({ newReceiptName: event.target.value })
  }

  onEditButtonClick = (receiptId: string) => {
    console.log("Editing receipt : " + receiptId)
    this.props.history.push(`/receipts/${receiptId}/edit`)
  }

  onReceiptCreate = async (event: React.ChangeEvent<HTMLButtonElement>) => {
    try {
      const newReceipt = await createReceipt(this.props.auth.getIdToken(), {
        description: this.state.newReceiptName,
      })
      this.setState({
        receipts: [...this.state.receipts, newReceipt],
        newReceiptName: ''
      })
    } catch {
      alert('Receipt creation failed')
    }
  }

  onReceiptDelete = async (receiptId: string) => {
    try {
      await deleteReceipt(this.props.auth.getIdToken(), receiptId)
      this.setState({
        receipts: this.state.receipts.filter(receipt => receipt.receiptId != receiptId)
      })
    } catch {
      alert('Receipt deletion failed')
    }
  }

  async componentDidMount() {
    try {
      const receipts = await getReceipts(this.props.auth.getIdToken())
      this.setState({
        receipts: receipts,
        loadingReceipts: false
      })
    } catch (e) {
      alert(`Failed to fetch receipts: ${e.message}`)
    }
  }

  render() {
    return (
      <div>
        <Header as="h1">Receipts</Header>

        {this.renderCreateReceiptInput()}

        {this.rendereReceipts()}
      </div>
    )
  }

  renderCreateReceiptInput() {
    return (
      <Grid.Row>
        <Grid.Column width={16}>
          <Input
            action={{
              color: 'teal',
              labelPosition: 'left',
              icon: 'add',
              content: 'New Receipt',
              onClick: this.onReceiptCreate
            }}
            fluid
            actionPosition="left"
            placeholder="To change the world..."
            onChange={this.handleNameChange}
          />
        </Grid.Column>
        <Grid.Column width={16}>
          <Divider />
        </Grid.Column>
      </Grid.Row>
    )
  }

  rendereReceipts() {
    if (this.state.loadingReceipts) {
      return this.renderLoading()
    }

    return this.renderReceiptList()
  }

  renderLoading() {
    return (
      <Grid.Row>
        <Loader indeterminate active inline="centered">
          Loading Receipts
        </Loader>
      </Grid.Row>
    )
  }

  renderReceiptList() {
    return (
      <Grid padded>
        {this.state.receipts.map((receipt, pos) => {
          return (
            <Grid.Row key={receipt.receiptId}>
              <Grid.Column width={10} verticalAlign="middle">
                {receipt.description}
              </Grid.Column>
              {receipt.attachmentUrl && (
                <Image src={receipt.attachmentUrl} size="small" wrapped />
              )}
              <Grid.Column width={1} floated="right">
                <Button
                  icon
                  color="blue"
                  onClick={() => this.onEditButtonClick(receipt.receiptId)}
                >
                  <Icon name="pencil" />
                </Button>
              </Grid.Column>
              <Grid.Column width={1} floated="right">
                <Button
                  icon
                  color="red"
                  onClick={() => this.onReceiptDelete(receipt.receiptId)}
                >
                  <Icon name="delete" />
                </Button>
              </Grid.Column>
              <Grid.Column width={16}>
                <Divider />
              </Grid.Column>
            </Grid.Row>
          )
        })}
      </Grid>
    )
  }
}
