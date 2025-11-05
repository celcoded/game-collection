import { useState } from 'react'
import reactLogo from './assets/react.svg'
import viteLogo from '/vite.svg'
import './App.css'
import Home from './pages/Home/Home'
import { BrowserRouter, Route, Routes } from 'react-router-dom'
import Solitaire from './pages/Solitaire/Solitaire'

function App() {

  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Home/>} />
        <Route path="/solitaire" element={<Solitaire/>} />
      </Routes>
    </BrowserRouter>
  )
}

export default App
