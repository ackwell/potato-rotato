import {faGithub} from '@fortawesome/free-brands-svg-icons'
import {FontAwesomeIcon} from '@fortawesome/react-fontawesome'
import styles from './header.module.css'
import imgKofi from './kofi.png'

export function Header() {
	return (
		<header className={styles.header}>
			<h1 className={styles.title}>Potato Rotato</h1>
			<div className={styles.icons}>
				<a href="https://ko-fi.com/ackwell" target="_blank" rel="noreferrer">
					<img
						src={imgKofi}
						alt="Support me on Ko-fi"
						className={styles.icon}
					/>
				</a>
				<a
					href="https://github.com/ackwell/potato-rotato"
					target="_blank"
					rel="noreferrer"
				>
					<FontAwesomeIcon
						icon={faGithub}
						title="Contribute on Github"
						className={styles.icon}
					/>
				</a>
			</div>
		</header>
	)
}
