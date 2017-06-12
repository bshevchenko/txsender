import React, { Component } from 'react'
import { connect } from 'react-redux'
import { RaisedButton } from 'material-ui'
import { Field, reduxForm } from 'redux-form/immutable'
import { TextField } from 'redux-form-material-ui'
import { setWallet } from '../../redux/tx/tx'

const mapStateToProps = (state) => ({
  isWalletUploaded: !!state.get('tx').wallet,
  initialValues: {}
})

const mapDispatchToProps = (dispatch) => ({
  setWallet: (wallet) => dispatch(setWallet(wallet))
})

@connect(mapStateToProps, mapDispatchToProps, null, {withRef: true})
@reduxForm({form: 'TxForm', validate: (values) => {
  const errors = {}
  console.log('validation', values)
  return errors
}})
class TxPage extends Component {
  handleFileUploaded = (e) => {
    this.props.setWallet(JSON.parse(e.target.result))
  }

  handleUploadFile = (e) => {
    const file = e.target.files[0]
    const reader = new FileReader()
    reader.onload = this.handleFileUploaded
    reader.readAsText(file)
  }

  render () {
    return (
      <form onSubmit={this.handleSubmit}>
        <Field component={TextField} style={{width: '100%'}} name='value' floatingLabelText='Value' />
        <Field component={TextField} style={{width: '100%'}} name='data' floatingLabelText='Data' />
        <Field component={TextField} style={{width: '100%'}} name='gasPrice' floatingLabelText='Gas Price' />
        <Field component={TextField} style={{width: '100%'}} name='block' floatingLabelText='Block Number' />

        <input type='file' ref='walletFile' name='wallet' style={{margin: '30px 0 0'}}
               onChange={this.handleUploadFile}/>

        <TextField
          ref='passwordInput'
          floatingLabelText='Enter password'
          type='password'
          required
          fullWidth />

      </form>
    )
  }
}

export default TxPage
