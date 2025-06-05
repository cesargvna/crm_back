import jwt from 'jsonwebtoken';
import  {SECRET} from './config';

if (!SECRET) {
    console.error("Error: Missing JWT_SECRET. Token generation will fail.");
}
const TOKEN_DURATION_MS = 1000 * 60 * 60;
const tokenSign = async (user: any): Promise<string> => {
    try {
      const userForToken = {
        username: user.username,
        id: user.id,
      };
      
      return jwt.sign(userForToken, SECRET, { expiresIn: TOKEN_DURATION_MS / 1000 });
    } catch (error) {
      console.error("Error signing JWT:", error);
      throw new Error("Token generation failed");
    }
};
const getTokenExpireTime = (): number => {
  return Date.now() + TOKEN_DURATION_MS;
};

export {tokenSign,getTokenExpireTime};