import React, { Component } from 'react'
import * as firebase from 'firebase/app'
import 'firebase/database'
import uuid from 'uuid'

import values from 'lodash/values'
import orderBy from 'lodash/orderBy'

const config = {
  apiKey: process.env.REACT_APP_FIREBASE_API_KEY,
  authDomain: process.env.REACT_APP_FIREBASE_AUTH_DOMAIN,
  databaseURL: process.env.REACT_APP_FIREBASE_DATABASE_URL,
  projectId: process.env.REACT_APP_FIREBASE_PROJECT_ID,
  storageBucket: process.env.REACT_APP_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.REACT_APP_FIREBASE_MESSAGING_SENDER_ID
}

const app = firebase.initializeApp(config)
const database = firebase.database(app)
// firebase.database.enableLogging(true)

const ENTER_KEY = 13

class App extends Component {
  constructor (props) {
    super(props)

    this.state = {
      messages: {},
      text: ''
    }
  }

  componentDidMount () {
    console.log('mounted')
    database.ref('/messages/').on('child_added', (snapshot) => {
      const newMessage = snapshot.val()
      console.log('added', newMessage)
      const messages = { ...this.state.messages, [newMessage.id]: newMessage }
      this.setState({ messages })
    })

    database.ref('/messages/').on('child_changed', (snapshot) => {
      console.log('changed')
      const upddatedMessage = snapshot.val()
      const messages = { ...this.state.messages, [upddatedMessage.id]: upddatedMessage }
      this.setState({ messages })
    })
  }

  handleChange = (event) => {
    this.setState({ text: event.target.value })
  }

  handleKeyUp = (ev) => {
    if (ev.keyCode === ENTER_KEY) {
      this.sendMessage()
      this.form.reset()
    }
  }

  sendMessage = () => {
    // TODO: need to account
    const newMessage = { id: uuid(), from: 'agent', body: this.state.text, to: 'agent', sentAt: new Date().getTime(), receivedAt: new Date().getTime() }
    const messages = { ...this.messages, [newMessage.id]: newMessage }
    this.setState({ messages, text: '' })
    database.ref(`/messages/${newMessage.id}`).set(newMessage).catch(e => {
      alert(`failed to send messages\n${e.toString()}`)
    })
  }

  getMessages = () => {
    return values(orderBy(this.state.messages, ['receivedAt']))
  }

  handleSubmit = (ev) => {
    ev.preventDefault()

    this.sendMessage()
  }

  render() {
    return (
      <div style={styles.root}>
        <header>
          <p>Twilio Chat Demo</p>
        </header>
        <div>
          {this.getMessages().map((message, index) => (
            <div key={index}>{message.from}: {message.body}</div>
          ))}
        </div>
        <form ref={form => this.form = form} style={styles.form} onSubmit={this.handleSubmit}>
          <textarea value={this.state.text} onChange={this.handleChange} onKeyUp={this.handleKeyUp} placeholder="say something"></textarea>
          <button>Send</button>
        </form>
      </div>
    )
  }
}

const styles = {
  root: {
    padding: 10
  },
  form: {
    display: 'flex'
  }
}

export default App
