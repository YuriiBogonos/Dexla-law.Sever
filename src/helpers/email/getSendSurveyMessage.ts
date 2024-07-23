export const getSendSurveyMessage = (fullName: string, link: string) => {
  return `
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Activation Code</title>
      <style>
        body {
          font-family: 'Arial', sans-serif;
          margin: 0;
          padding: 0;
          background-color: #f4f4f4;
        }

        .container {
          background-color: yellowgreen;
          max-width: 600px;
          margin: 20px auto;
          padding: 20px;
          border-radius: 8px;
          box-shadow: 0 0 10px rgba(0, 0, 0, 0.1);
        }
        
        h2 {
          color: black;
        }

        p {
          font-size: 16px;
          margin-bottom: 20px;
          color: black;
        }

        .code {
          max-width: 100px;
          padding: 10px 20px;
          text-decoration: none;
          background-color: #4a4a4a;
          color: #fff;
          border-radius: 5px;
          margin: 0 auto;
          text-align: center;
        }
      </style>
    </head>
    <body>
      <div class="container">
        <h2>Dear ${fullName}</h2>
        <p>You recently brought in a therapist</p>
        <a href="${link}">Please answer the questions</a>
        <p>This will help us improve our service</p>
        <br />
        <p>It will take no more than 5 minutes of your time</p>
      </div>
    </body>
    </html>
  `;
};
