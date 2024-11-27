import { createPrivateKey } from "crypto";
import { SignJWT } from "jose";
import NextAuth from "next-auth";
import KakaoProvider from "next-auth/providers/kakao";
import NaverProvider from "next-auth/providers/naver";
import AppleProvider from "next-auth/providers/apple";

const getAppleToken = async () => {
  const key = `-----BEGIN PRIVATE KEY-----\n${process.env.AUTH_APPLE_SECRET}\n-----END PRIVATE KEY-----`;
  const appleToken = await new SignJWT({})
    .setAudience("https://appleid.apple.com")
    .setIssuer(process.env.AUTH_APPLE_TEAM_ID)
    .setIssuedAt(Math.floor(Date.now() / 1000))
    .setExpirationTime(Math.floor(Date.now() / 1000) + 3600 * 2) // 2시간 유효
    .setSubject(process.env.AUTH_APPLE_ID)
    .setProtectedHeader({
      alg: "ES256",
      kid: process.env.AUTH_APPLE_KEY_ID,
    })
    .sign(createPrivateKey(key));
  return appleToken;
};

const handler = async (req, res) =>
  NextAuth(req, res, {
    secret: process.env.NEXTAUTH_SECRET,
    cookies: {
      pkceCodeVerifier: {
        name: "next-auth.pkce.code_verifier",
        options: {
          httpOnly: true,
          sameSite: "none",
          path: "/",
          secure: true,
        },
      },
    },
    providers: [
      AppleProvider({
        clientId: process.env.AUTH_APPLE_ID,
        clientSecret: await getAppleToken(), // 동적으로 생성된 JWT 사용
        profile(profile) {
          return {
            id: profile.sub,
            email: profile.email,
            from: "apple",
          };
        },
      }),
      KakaoProvider({
        clientId: process.env.AUTH_KAKAO_ID,
        clientSecret: process.env.AUTH_KAKAO_SECRET,
      }),
      NaverProvider({
        clientId: process.env.AUTH_NAVER_ID,
        clientSecret: process.env.AUTH_NAVER_SECRET,
      }),
    ],
    callbacks: {
      async jwt({ token, user }) {
        return { ...token, ...user };
      },
      async session({ session, token }) {
        session.user = token;
        return session;
      },
    },
  });

export { handler as GET, handler as POST };
