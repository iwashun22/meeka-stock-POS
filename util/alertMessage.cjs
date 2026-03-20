function setAlertMessages(req, messageArr, toSession = true) {
  const messages = messageArr.map(arr => {
    return {
      text: arr[0],
      type: arr[1] || 'success'
    }
  });

  if (!toSession) {
    return messages;
  }
  req.session.messages = messages;
}

function getAlertMessages(req) {
  const messages = req.session.messages || [];

  delete req.session.messages;
  return messages;
}

module.exports = {
  setAlertMessages,
  getAlertMessages
}