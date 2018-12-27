const functions = require('firebase-functions')
const firebase = require('firebase-admin')
const twilio = require('twilio')
const uuid = require('uuid')

const accountSid = functions.config().twilio.account_id
const authToken = functions.config().twilio.auth_token
const twilioClient = new twilio(accountSid, authToken)

const app = firebase.initializeApp()
const database = firebase.database(app)

exports.sendSMSMessage = functions.database.ref('/messages/{pushId}')
  .onCreate((snapshot, context) => {
    const message = snapshot.val()
    // add recieved at date
    message.receivedAt = new Date().getTime()

    if (message.from === 'agent') {
      console.log('attempting to send text message...')
      twilioClient.messages.create({
        body: message.body,
        to: functions.config().worker.phone,  // Text this number
        from: functions.config().twilio.phone, // From a valid Twilio number
      }).then((message) => console.log('successfully sent twilio message', message.sid))
        .catch((error) => console.log('error sending sms', error))
    }

    // You must return a Promise when performing asynchronous tasks inside a Functions such as
    // writing to the Firebase Realtime Database.
    return snapshot.ref.set(message)
  })

exports.receiveSMSMessage = functions.https.onRequest((request, response) => {
  // e.g. request body is
  // { ToCountry: 'US',
  // ToState: 'WV',
  // SmsMessageSid: 'FE308f4a7e8c21f81f370cda125b111611',
  // NumMedia: '0',
  // ToCity: 'HUNTINGTON',
  // FromZip: 'V7H 1P9',
  // SmsSid: 'SM308f7a7e8c21f81f370cda275b351616',
  // FromState: 'BC',
  // SmsStatus: 'received',
  // FromCity: 'VANCOUVER',
  // Body: 'Hi dude',
  // FromCountry: 'CA',
  // To: '+1304555555',
  // ToZip: '51561',
  // NumSegments: '1',
  // MessageSid: 'AA308f7a7e8c21f81f370ffc245b351611',
  // AccountSid: 'FCg1f4g3a04ac3c250becf01d1db8a649a',
  // From: '+16045555555',
  // ApiVersion: '2010-04-01' }

  console.log('message was sent with', request.body)
  const messageBody = request.body.Body
  // response.send("OK!")
  const newMessage = { id: uuid(), from: 'worker', body: messageBody, to: 'agent', sentAt: new Date().getTime(), receivedAt: new Date().getTime() }
  database.ref(`/messages/${newMessage.id}`).set(newMessage).catch(e => {
    console.log(`failed to send messages\n${e.toString()}`)
    response.send("OK!")
  })
 })
