import dotenv from 'dotenv';
dotenv.config();

const REQUIRED_ENV_VARS = ["PORT", "JWT_SECRET"];

REQUIRED_ENV_VARS.forEach((varName) => {
  if (!process.env[varName]) {
    console.error(`Error: Missing environment variable: ${varName}`);
    process.exit(1);
  }
});

const PORT = Number(process.env.PORT);
const SECRET = process.env.JWT_SECRET as string;

export { PORT, SECRET };
