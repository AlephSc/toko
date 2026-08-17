import './globals.css';

export const metadata = {
  title: 'LiquidStore - Digital Assets',
  description: 'Premium digital goods with glassmorphism aesthetic',
};

export default function RootLayout({ children }) {
  return (
    <html lang="id">
      <body className="relative min-h-screen">
        <div className="liquid-bg">
          <div className="liquid-blob bg-indigo-600 w-96 h-96 top-10 left-10" />
          <div className="liquid-blob bg-fuchsia-600 w-[450px] h-[450px] bottom-10 right-10 animation-delay-2000" />
          <div className="liquid-blob bg-cyan-600 w-80 h-80 top-1/2 left-1/3 animation-delay-4000" />
        </div>
        {children}
      </body>
    </html>
  );
}
