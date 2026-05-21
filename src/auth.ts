import NextAuth from "next-auth"
import { PrismaAdapter } from "@auth/prisma-adapter"
import { prisma } from "@/lib/prisma"
import { authConfig } from "./auth.config"
import { DEFAULT_SETTINGS_FIRST_LOGIN, DefaultEwalletLayout, DefaultListrikLayout } from "@/lib/constanta"

export const { handlers, signIn, signOut, auth } = NextAuth({
  adapter: PrismaAdapter(prisma),
  session: { strategy: "jwt", maxAge: 1 * 24 * 60 * 60, updateAge: 0 },
  ...authConfig,
  callbacks: {
    ...authConfig.callbacks,
    async jwt({ token, user, trigger }) {
      if (user) {
        token.role = (user as any).role || "user";
        token.sub = user.id as string;
      }

      // Cek database
      if (token?.sub) {
        const userExists = await prisma.user.findUnique({
          where: { id: token.sub as string },
          select: { id: true }
        });

        // Jika user "ghaib", hancurkan token dengan paksa
        if (!userExists) {
          return null; // Balikkan null untuk memberitahu Auth.js bahwa ini invalid
        }
      }
      return token;
    },

    async session({ session, token }) {
      // Jika jwt mengembalikan null, token di sini akan null. 
      // Kita harus proteksi agar tidak error.
      if (token && session.user) {
        session.user.id = token.sub as string;
        (session.user as any).role = token.role as string;
      } else {
        // Jika token null, kembalikan null agar session hancur total
        return null as any;
      }
      
      return session;
    },
  },
  events: {
    async createUser({ user }) {
      if (!user.id) {
        console.error("Gagal membuat settings: User ID tidak ditemukan.");
        return;
      }

      try {
        await prisma.settings.create({
          data: {
            userId: user.id,
            data: DEFAULT_SETTINGS_FIRST_LOGIN 
          }
        });

        await prisma.layout.createMany({
          data: [
            {
              name: "Layout E-Wallet Default",
              userId: user.id,
              isDefault: true,
              config: DefaultEwalletLayout as any
            },
            {
              name: "Layout Token Listrik Default",
              userId: user.id,
              isDefault: false,
              config: DefaultListrikLayout as any
            }
          ]
        });
        console.log(`Settings dan Layout otomatis dibuat untuk user: ${user.id}`);
      } catch (error) {
        console.error("Gagal membuat settings dan Layout default:", error);
      }
    }
  }
})