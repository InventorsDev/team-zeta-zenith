import { SunIcon, MoonIcon } from '@heroicons/react/24/outline';
import { useTheme } from '~/context/ThemeContext';

export function ThemeToggle() {
  const { theme, toggleTheme } = useTheme();

  const handleClick = () => {
    console.log('Theme toggle clicked, current theme:', theme);
    toggleTheme();
  };

  return (
    <button
      onClick={handleClick}
      type="button"
      className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
      aria-label={theme === 'light' ? 'Switch to dark mode' : 'Switch to light mode'}
      title={theme === 'light' ? 'Switch to dark mode' : 'Switch to light mode'}
    >
      {theme === 'light' ? (
        <MoonIcon className="h-5 w-5 text-gray-600 dark:text-gray-400" aria-hidden="true" />
      ) : (
        <SunIcon className="h-5 w-5 text-yellow-500 dark:text-yellow-400" aria-hidden="true" />
      )}
    </button>
  );
}
