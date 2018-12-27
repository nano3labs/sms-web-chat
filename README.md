# Twilio Chat Example

Sample project demonstrating create a conversation from web => sms and from sms => web.

It takes advantage of the twilio api and firebase realtime database. Please sign up to both accounts

## Install

1. Create a new firebase project
2. Create a new twilio account with a phone number
3. Download the project to your local environment using `git clone`
4. `cp .env.sample .env`
5. Fill in the secrets in .env file using your firebase credentials
6. Set cloud functions envrionment variables using the following command (make sure you replace the placeholders):

    ```bash
    firebase functions:config:set worker.phone=+16045555555 twilio.phone=+13045555555 twilio.account_id=<TWILIO_ACCOUNT_ID> twilio.auth_token=<TWILIO_AUTH_TOKEN>
    ```
7. Build react production project (for deployment) using `yarn build`
8. Deploy the cloud functions to firebase `firebase deploy`
9. On twilio, configure a webhook to hit the receiveSMSMessage cloud function url
10. Go to website advertised by step 8

## Running

```bash
yarn start
```

Type a message in the textbox, hit enter and you should receive a text. If you reply to back via text, you should be able to see the message on webchat
