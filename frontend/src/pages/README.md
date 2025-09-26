# Pages

This directory contains page components for the Proof Anchor frontend.

## Available Pages

- `HomePage.jsx` - Main landing page
- `ProofPage.jsx` - Proof generation and verification page
- `HistoryPage.jsx` - Proof history and status page

## Usage

These pages can be used with React Router for multi-page navigation:

```jsx
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { HomePage } from "./pages/HomePage";
import { ProofPage } from "./pages/ProofPage";
```
