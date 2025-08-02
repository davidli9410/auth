import jwt from "jsonwebtoken";
import dotenv from "dotenv";

dotenv.config();

interface UserData {
    id: string;
    email: string;
}

const createAuthTokens = (user: UserData): {accessToken: string, refreshToken: string} => {
    const accessToken = jwt.sign(user, process.env.ACCESS_TOKEN_SECRET || "default_access_token_secret", {expiresIn: "5m"});
    const refreshToken = jwt.sign(user, process.env.REFRESH_TOKEN_SECRET || "default_refresh_token_secret", {expiresIn: "10d"});
    
    return {accessToken, refreshToken};
};

export default createAuthTokens;