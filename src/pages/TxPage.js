import React, { Component } from 'react'
import { connect } from 'react-redux'
import { RaisedButton } from 'material-ui'
import TxForm from '../components/forms/TxForm'
import { transaction } from '../redux/tx/tx'

const mapStateToProps = (state) => ({
  isWalletUploaded: !!state.get('tx').wallet,
  wallet: state.get('tx').wallet
})

const mapDispatchToProps = (dispatch) => ({
  tx: (value, data, gasPrice, block, wallet, password) => dispatch(transaction(value, data, gasPrice, block, wallet, password))
})

@connect(mapStateToProps, mapDispatchToProps)
class TxPage extends Component {
  handleSubmit = (values) => {
    this.props.tx(
      values.get('value'),
      values.get('data'),
      values.get('gasPrice'),
      values.get('block'),
      this.props.wallet,
      values.get('password'),
    )
    console.log('submit', values)
  }

  handleSend = () => {
    this.refs.txForm.getWrappedInstance().submit()
  }

  render () {
    return (
      <div style={{width: '600px', margin: '50px auto 0'}}>
        <TxForm ref='txForm' onSubmit={this.handleSubmit} />

        <RaisedButton
          label={'Send'}
          style={{margin: '30px 0 0'}}
          primary
          fullWidth
          disabled={!this.props.isWalletUploaded}
          onTouchTap={this.handleSend} />

      </div>
    )
  }
}

export default TxPage
