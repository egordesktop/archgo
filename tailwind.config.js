/** @type {import('tailwindcss').Config} */
export default {
	content: [
		"./index.html",
		"./src/**/*.{js,ts,jsx,tsx}",
	],
	theme: {
		extend: {
			colors: {
				terracota: "#D06224",
				chile: "#AE431E",
				olive: "#8A8635",
				sunset: "#EAC891",
				'text-primary': "#333333",
				'border-light': "#e0e0e0",
				'border-selected': "#e1d0b8",
				'bg-selected': "#f5e6d3",
			},
			fontFamily: {
				'inter': ['Inter', 'sans-serif'],
			},
			spacing: {
				'15': '60px',
			},
		},
	},
	plugins: [],
}


