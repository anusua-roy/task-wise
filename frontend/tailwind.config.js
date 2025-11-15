/** @type {import('tailwindcss').Config} */
module.exports = {
    // Point Tailwind to all files that use Tailwind classes
    content: [
        "./index.html",
        "./src/**/*.{js,ts,jsx,tsx}",
    ],
    theme: {
        extend: {
            fontFamily: {
                // Ensure Inter is the default sans font, matching the file generation requirement
                sans: ['Inter', 'sans-serif'],
            },
        },
    },
    plugins: [],
}