import { NavLink } from 'react-router-dom'

const NAV_ITEMS = [
  { to: '/', label: '홈' },
  { to: '/calendar', label: '캘린더' },
  { to: '/feedback', label: '피드백' },
]

function NavBar() {
  return (
    <nav className="fixed bottom-0 left-0 right-0 flex justify-around border-t border-gray-200 bg-white py-2">
      {NAV_ITEMS.map((item) => (
        <NavLink
          key={item.to}
          to={item.to}
          className={({ isActive }) =>
            `text-sm ${isActive ? 'font-semibold text-purple-600' : 'text-gray-500'}`
          }
        >
          {item.label}
        </NavLink>
      ))}
    </nav>
  )
}

export default NavBar
