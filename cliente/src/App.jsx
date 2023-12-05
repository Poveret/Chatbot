import { useState } from 'react'
import reactLogo from './assets/react.svg'
import viteLogo from '/vite.svg'
import './App.css'

function App() {
  const [count, setCount] = useState(0)

  const consulta = (formData) => {
    console.log(formData);
    const duda = formData.get("duda");
    alert(`You searched for '${duda}'`);
  }

  return (
    <>
      <form action="/dudas" method="post">
        <label for="duda">Escribe tu duda:</label>
        <input type="text" id="duda" name="duda" />
        <button type="submit">Enviar</button>
      </form>
    </>
  )
}

export default App
