import { Request, Response } from "express";

export class CustomError extends Error {
  code: number;

  constructor(message: string, code: number) {
    super(message);

    this.code = code;
  }
}

export const errorHandler = async (
  error: Error | CustomError | unknown,
  req: Request,
  res: Response,
) => {
  try {
    console.log(`🚀 error:, ${error}`);
    console.log(`🚀 endpoint:, ${req.headers.host}${req.originalUrl}`);
    console.log(`🚀 cookies:, ${req.cookies}`);
    console.log(`🚀 body:, ${req.body}`);
  } catch { /* empty */ }
  
  if (error instanceof CustomError) {
    const { code, message } = error;

    res.statusCode = code;

    res.json({
      message,
      endpoint: `${req.headers.host}${req.originalUrl}`,
    });

    return;
  }

  if (error instanceof Error) {
    res.statusCode = 500;
    res.json({ message: error.message });

    return;
  }

  res.statusCode = 500;
  res.json({ message: "Unknown internal server error!" });
};

export const sendResposeMessage = (res: Response, message: string, statusCode: number) => { 
  res.status(statusCode);
  res.json({ message });
};
