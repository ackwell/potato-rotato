import {TooltipProvider} from '@xivanalysis/tooltips'
import React from 'react'
import ReactDOM from 'react-dom'
import {App} from './App'

ReactDOM.render(
	<React.StrictMode>
		<TooltipProvider>
			<App />
		</TooltipProvider>
	</React.StrictMode>,
	document.getElementById('root'),
)
