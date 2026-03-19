function setAlertMessages(req, messageArr) {
  const messages = messageArr.map(arr => {
    return {
      text: arr[0],
      type: arr[1] || 'success'
    }
  });

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