import React from 'react';

export default function SharedLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <head>
        <title>Shared File - RoleReady</title>
      </head>
      <body>
        {children}
      </body>
    </html>
  );
}


