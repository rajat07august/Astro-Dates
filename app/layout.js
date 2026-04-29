import './globals.css';

export const metadata = {
  title: 'Celestial Eclipse Finder | 2008–2060',
  description:
    'Search every solar and lunar eclipse from 2008 to 2060. Offline-capable, beautifully designed celestial dashboard.',
  keywords: ['eclipse', 'solar eclipse', 'lunar eclipse', 'astronomy', 'celestial events'],
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>
        <div className="nebula" />
        <div className="stars" />
        {children}
      </body>
    </html>
  );
}
