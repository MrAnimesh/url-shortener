import { jwtDecode, JwtPayload } from "jwt-decode";

interface AccessTokenClaims extends JwtPayload {
  sub?: string;
}

const getNameFromEmail = (email: string) => {
  return email.split("@")[0] || email;
};

export const getLoggedInUserName = () => {
  const username = localStorage.getItem("username");
  if (username) return username;

  const email = localStorage.getItem("email");
  if (email) return getNameFromEmail(email);

  const token = localStorage.getItem("accessToken");
  if (!token) return "User";

  try {
    const claims = jwtDecode<AccessTokenClaims>(token);
    if (claims.sub) return getNameFromEmail(claims.sub);
  } catch {
    return "User";
  }

  return "User";
};
