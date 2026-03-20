const { passwordCheck, usernameCheck, BadInputError } = require('../util/inputCheck.cjs');
const supabase = require('../util/supabase.cjs');

async function validateRegistration(req, res, next) {
  const { username, password, confirmation } = req.body;

  try {
    usernameCheck({
      text: username,
      field: 'username'
    });

    passwordCheck({
      password: { text: password, field: 'password' },
      confirmation: { text: confirmation, field: 'confirmation' }
    });

    const existingUser = await supabase.from('users').select('*').eq('username', username).single();

    if (existingUser.data) {
      throw new BadInputError('username', 'ชื่อผู้ใช้นี้มีอยู่แล้ว');
    }
  }
  catch (err) {
    if (err instanceof BadInputError) {
      return res.status(400).render('register', {
        error: err.renderError,
        previousInput: { username, password, confirmation }
      });
    }

    return res.status(500).redirect('/register');
  }

  next();
}

module.exports = validateRegistration;