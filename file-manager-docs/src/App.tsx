import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Layout from './components/Layout';
import Home from './pages/Home';
import MarkdownPage from './pages/MarkdownPage';

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Layout />}>
          <Route index element={<Home />} />
          <Route path="installation" element={<MarkdownPage id="installation" />} />
          <Route path="usage" element={<MarkdownPage id="usage" />} />
          <Route path="providers" element={<MarkdownPage id="providers" />} />
          <Route path="router" element={<MarkdownPage id="router" />} />
          <Route path="schema" element={<MarkdownPage id="schema" />} />
          <Route path="utilities" element={<MarkdownPage id="utilities" />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}
