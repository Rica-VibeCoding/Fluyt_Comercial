import "@/index.css";

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="pt-BR">
      <body className="antialiased">
        <div>
          <h1>Layout Simples - Teste</h1>
          {children}
        </div>
      </body>
    </html>
  );
} 