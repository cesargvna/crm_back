import jwt from 'jsonwebtoken';
import { SECRET } from './config';

if (!SECRET) {
  console.error("Error: Missing JWT_SECRET. Token generation will fail.");
}

interface TokenPayload {
  id: string;
  username: string;
  tenantId: string;
  roleId: string;
}

const tokenSign = async (user: TokenPayload): Promise<string> => {
  try {
    return jwt.sign(user, SECRET, { expiresIn: "1d" }); // duración más expresiva
  } catch (error) {
    console.error("Error signing JWT:", error);
    throw new Error("Token generation failed");
  }
};

export { tokenSign };
