import React, { Component } from 'react'
import { connect } from 'react-redux'
import { Field, reduxForm } from 'redux-form/immutable'
import { TextField } from 'redux-form-material-ui'
import { Checkbox } from 'material-ui'
import { setWallet, toggleURL } from '../../redux/tx/tx'

const mapStateToProps = (state) => ({
  isWalletUploaded: !!state.get('tx').wallet,
  urls: state.get('tx').urls,
  initialValues: {}
})

const mapDispatchToProps = (dispatch) => ({
  setWallet: (wallet) => dispatch(setWallet(wallet)),
  toggleURL: (url, add) => dispatch(toggleURL(url, add))
})

@connect(mapStateToProps, mapDispatchToProps, null, {withRef: true})
@reduxForm({form: 'TxForm', validate: (values) => {
  const errors = {}
  return errors
}})
class TxPage extends Component {
  handleFileUploaded = (e) => {
    const jsonWallet = JSON.parse(e.target.result)
    if (jsonWallet.hasOwnProperty('Crypto')) {
      jsonWallet['crypto'] = jsonWallet.Crypto
    }
    this.props.setWallet(jsonWallet)
  }

  handleUploadFile = (e) => {
    const file = e.target.files[0]
    const reader = new FileReader()
    reader.onload = this.handleFileUploaded
    reader.readAsText(file)
  }

  handleURLCheck = (e, isInputChecked) => {
    this.props.toggleURL(e.target.value, isInputChecked)
  }

  render () {
    return (
      <form onSubmit={this.handleSubmit}>
        <Field component={TextField} style={{width: '100%'}} name='to' floatingLabelText='To' />
        <Field component={TextField} style={{width: '100%'}} name='value' floatingLabelText='Value' />
        <Field component={TextField} style={{width: '100%'}} name='data' floatingLabelText='Data' />
        <Field component={TextField} style={{width: '100%'}} name='gasPrice' floatingLabelText='Gas Price' />
        <Field component={TextField} style={{width: '100%'}} name='block' floatingLabelText='Block Number' />

        <input type='file' ref='walletFile' name='wallet' style={{margin: '30px 0 0'}}
               onChange={this.handleUploadFile}/>

        <Field component={TextField} style={{width: '100%'}} type='password' name='password' floatingLabelText='Password' />

        <div style={{marginTop: '30px', marginBottom: '20px'}}>
          {this.props.urls.entrySeq().map(([url, checked]) => (
            <Checkbox key={url} label={url} value={url} onCheck={this.handleURLCheck} checked={!!checked} />
          ))}
        </div>
      </form>
    )
  }
}

export default TxPage
