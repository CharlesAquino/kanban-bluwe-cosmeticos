import { redirect } from 'next/navigation'

export default function HomePage() {
  // Rota /home não é mais usada como dashboard.
  // Redireciona permanentemente para a home real em "/".
  redirect('/')
}
