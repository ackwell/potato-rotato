module.exports = {
	extends: [
		'react-app',
		'react-app/jest',
		'prettier',
		'plugin:import/typescript',
	],
	rules: {
		'import/no-internal-modules': [
			'error',
			{allow: ['jotai/**', '@reach/**/*.css']},
		],
		'import/order': ['error', {alphabetize: {order: 'asc'}}],
	},
}
