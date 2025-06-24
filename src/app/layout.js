import "./globals.css";
import { Itim, Caveat } from "next/font/google";
import { Toaster } from "react-hot-toast";

const itim = Itim({
  subsets: ["latin"],
  weight: "400",
});

export const caveat = Caveat({
  subsets: ["latin"],
  weight: "400",
  variable: "--font-caveat"
});

export const metadata = {
  title: "board",
  description: "A collaborative whiteboard for everyone.",
  manifest: "/manifest.json",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className={`${itim.className} ${caveat.variable}`}>
        <Toaster />
        {children}
      </body>
    </html>
  );
}
