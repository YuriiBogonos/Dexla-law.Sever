export const getResetPasswordMessage = (resetCode: number) => {
  return `
    <h4>Hello, this is a confirm code for reset password.</h4>
    <p>Reset password code</p>
    <p>${resetCode}</p>
    <br />
    <p>If you did not request this code, please ignore this email.</p>
  `;
};
