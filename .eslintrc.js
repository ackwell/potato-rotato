module.exports = {
	extends: [
		'react-app',
		'react-app/jest',
		'prettier',
		'plugin:import/typescript',
	],
	rules: {
		'import/no-internal-modules': 'error',
		'import/order': ['error', {alphabetize: {order: 'asc'}}],
	},
}
