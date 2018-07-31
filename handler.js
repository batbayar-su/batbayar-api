'use strict';

const AWS = require('aws-sdk');
const SES = new AWS.SES();

function validateOrigin(testOrigin) {
  const VALID_ORIGINS = ['http://localhost:3000', 'http://batbayar.ml'];
  return VALID_ORIGINS.filter(origin => origin === testOrigin)[0] || VALID_ORIGINS[0];
}

function sendEmail(formData, callback) {
  const emailParams = {
    Source: 'batbayar.sukhbaatar@gmail.com',
    ReplyToAddresses: [formData.reply_to],
    Destination: {
      ToAddresses: ['batbayar.sukhbaatar@gmail.com'],
    },
    Message: {
      Body: {
        Text: {
          Charset: 'UTF-8',
          Data: `${formData.message}\n\nName: ${formData.name}\nEmail: ${formData.reply_to}`,
        },
      },
      Subject: {
        Charset: 'UTF-8',
        Data: formData.subject,
      },
    },
  };

  SES.sendEmail(emailParams, callback);
}

module.exports.contactMailer = (event, context, callback) => {
  const origin = validateOrigin(event.headers.Origin || event.headers.origin);
  const formData = JSON.parse(event.body);

  sendEmail(formData, function(err, data) {
    const response = {
      statusCode: err ? 500 : 200,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': origin,
      },
      body: JSON.stringify({
        message: err ? err.message : data,
      }),
    };

    callback(null, response);
  });
};
