import "./globals.css";

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
        <title>Auth App</title>
        <meta name="description" content="Authentication system" />
      </head>
      <body>
        {children}
      </body>
    </html>
  );
}
