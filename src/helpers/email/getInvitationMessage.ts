import "dotenv/config";

export const getinvitationMessage = (name: string) => {
  return `
    <h4>Hello ${name}.</h4>
    <p>Please join to our website</p>
    <a href="${process.env.INVITATION_WEB_APP || ""}">Therapi web application</a>
  `;
};
