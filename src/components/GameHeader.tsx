"use client";

import React, { ReactNode } from "react";
import Link from "next/link";

interface GameHeaderProps {
  title: string;
  icon: string;
  actions?: ReactNode;
}

export default function GameHeader({ title, icon, actions }: GameHeaderProps) {
  return (
    <header className="app-header">
      <div className="header-content">
        <div className="logo-area">
          <Link href="/" className="back-btn" title="กลับหน้าหลัก">
            🏠
          </Link>
          <span className="logo-icon">{icon}</span>
          <h1>{title}</h1>
        </div>
        {actions && (
          <div className="header-actions" style={{ display: "flex", gap: "10px" }}>
            {actions}
          </div>
        )}
      </div>
    </header>
  );
}
