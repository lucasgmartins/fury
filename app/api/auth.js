'use strict';


//###################################
// NPM MODULES
//###################################

const _            = require('lodash');
const { google }   = require('googleapis');
const MailComposer = require('nodemailer/lib/mail-composer');
const mongoose     = require('mongoose');

const Conversation = mongoose.model('conversation');

//###################################
// VALIDATIONS
//###################################

//###################################
// LOCAL MODULES
//###################################

//###################################
// CONST
//###################################

//###################################
// API
//###################################

let token = ''

const agoogle =  {
  method  : '*',
  path    : '/bell/door',
  options: {
    auth: {
      strategy: 'google',
      mode: 'try'
    },
    handler: async function (request, h) {

      if (!request.auth.isAuthenticated)
        return 'Authentication failed due to: ' + request.auth.error.message;

      token = request.auth.artifacts.access_token;

      const authObj = new google.auth.OAuth2();
      authObj.setCredentials({ access_token: token });

      const gmail  = google.gmail({ version: 'v1', auth: authObj });
      const x      = await gmail.users.threads.list({ userId: 'me', auth: authObj});

      // console.log(x);

      // await selectedEmail(authObj, 'Bruno', 'lucas.martins@redspark.io', 'Engineer', 'Software Engineer II');

      await replyEmail(authObj, 'Bruno', 'lucas.martins@redspark.io');

      return '<pre>' + JSON.stringify(request.auth.credentials, null, 4) + '</pre>';
    }
  }
};

async function selectedEmail(auth, name, to, team, role) {

  const subject     = '🤘 Olá, você foi selecionado para o processo seletivo da redspark.';
  const utf8Subject = `=?utf-8?B?${Buffer.from(subject).toString('base64')}?=`;

  const html        = `Olá Lucas, <br /><br />
    Meu nome é Fury, um robô do time de recrutamento da redspark, sou responsável por encontrar o melhor horário para bater um papo com nosso time de ${team} sobre a vaga de ${role}.
    Gostaria de sugerir horários para podermos que o time venha a conhecer você melhor. <br /><br />

    Você pode responder com a hora que melhor funciona pra você? <br /><br />

    Se esses horários não funcionarem pra você, me informe os melhores horários e buscaremos alternativas.<br /><br />
    Estamos ansiosos pela sua resposta. 🤘❤️😎 <br /><br />

    Abraços
    Fury
  `

  const emailParams = {
    from    : 'From: Lucas Martins <lucas.martins@redspark.io>',
    to      : `${name} <${to}>`,
    subject : utf8Subject,
    html    : html
  }

  const mail = await new MailComposer(emailParams).compile().build()

  const gmail  = google.gmail({ version: 'v1', auth });

  const res = await gmail.users.messages.send({
    userId: 'me',
    requestBody: {
      raw: mail
        .toString('base64')
        .replace(/\+/g, '-')
        .replace(/\//g, '_')
        .replace(/=+$/, '')
    },
    auth
  });

  const newMessage = {
    message_id  : res.data.id,
    created_at  : Date.now()
  }

  return Conversation.create({ thread_id: res.data.threadId, emails: [newMessage] });
}

async function replyEmail(auth, name, to, team, role) {

  const subject     = 'Sim'; //Olá, você foi selecionado para o processo seletivo da redspark. 2
  const utf8Subject = `=?utf-8?B?${Buffer.from(subject).toString('base64')}?=`;

  const html        = `Olá Lucas, <br /><br />,
    Xurubleblas

    Abraços
    Fury
  `

  const gmail  = google.gmail({ version: 'v1', auth });

  const conversation = await Conversation.findOne();
  const threadId     = conversation.thread_id;

  const emailParams = {
    from        : 'From: Lucas Martins <lucas.martins@redspark.io>',
    to          : `${name} <${to}>`,
    subject     : utf8Subject,
    html        : html,
    references  : threadId,
    inReplyTo   : threadId
  }

  const mail = await new MailComposer(emailParams).compile().build()

  const res = await gmail.users.messages.send({
    userId: 'me',
    requestBody: {
      raw: mail
        .toString('base64')
        .replace(/\+/g, '-')
        .replace(/\//g, '_')
        .replace(/=+$/, ''),
      threadId: threadId
    },
    auth
  });

  const newConversation = {
    message_id  : res.data.id,
    created_at  : Date.now()
  }

  conversation.emails.push(newConversation);

  return conversation.save();
}

module.exports = [
  agoogle
];