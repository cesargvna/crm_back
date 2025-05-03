import jwt from 'jsonwebtoken';
import  {SECRET} from './config';

if (!SECRET) {
    console.error("Error: Missing JWT_SECRET. Token generation will fail.");
}
const tokenSign = async (user: any): Promise<string> => {
    try {
      const userForToken = {
        username: user.username,
        id: user.id,
      };
      
      return jwt.sign(userForToken, SECRET, { expiresIn: 60 * 60 });
    } catch (error) {
      console.error("Error signing JWT:", error);
      throw new Error("Token generation failed");
    }
};

export {tokenSign};