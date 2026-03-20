const { validPasswordInput, validUsernameInput } = require('./regexCheck.cjs');
// const bcrypt = require('bcrypt');

/**
 *
 * @param {Object} username
 * @param {string} username.text
 * @param {string} username.field
 */
function usernameCheck(username) {
  if (!validUsernameInput(username.text)) {
    throw new BadInputError(
      username.field,
      'ชื่อผู้ใช้ต้องประกอบด้วย ตัวอักษรภาษาอังกฤษ และตัวเลขเท่านั้น'
    );
  }
  if (username.text.length < 4) {
    throw new BadInputError(
      username.field,
      'ชื่อผู้ใช้ต้องมีความยาวอย่างน้อย 4 ตัวอักษร'
    );
  }
}

/**
 * 
 * @param {Object} passwords
 * @param {Object} passwords.password
 * @param {string} passwords.password.text
 * @param {string} passwords.password.field
 * @param {Object} passwords.confirmation
 * @param {string} passwords.confirmation.text
 * @param {string} passwords.confirmation.field
 * @param {string} passwords.oldPassword
 */
function passwordCheck(passwords) {
  const { password, confirmation, oldPassword } = passwords;

  if (!validPasswordInput(password.text)) {
    throw new BadInputError(
      password.field,
      'รหัสผ่านต้องประกอบด้วย ตัวอักษรภาษาอังกฤษ ตัวเลข หรืออักขระพิเศษ !@#$%^&*()_+-="\'/ เท่านั้น'
    );
  }

  if (password.text.length < 6) {
    throw new BadInputError(
      password.field,
      'รหัสผ่านต้องมีความยาวอย่างน้อย 6 ตัวอักษร'
    );
  }

  if (oldPassword && oldPassword === password.text) {
    throw new BadInputError(
      password.field,
      'กรุณาตั้งรหัสผ่านใหม่ที่ไม่ซ้ำกับรหัสเดิม'
    );
  }

  if (password.text !== confirmation.text) {
    throw new BadInputError(
      confirmation.field,
      'รหัสผ่านและการยืนยันรหัสผ่านไม่ตรงกัน'
    );
  }
}

class BadInputError extends Error {
  /**
   *
   * @param {string} field
   * @param {string} message 
   */
  constructor(field, message) {
    super("Bad input requested");
    this.renderError = {
      on: field,
      message: message
    };
  }
}

module.exports = {
  passwordCheck,
  usernameCheck,
  BadInputError
};