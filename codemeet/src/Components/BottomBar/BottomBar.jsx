import React from 'react'

import { FontAwesomeIcon } from "@fortawesome/react-fontawesome"
import { faLinkedin } from "@fortawesome/free-brands-svg-icons"
import { faGithub } from "@fortawesome/free-brands-svg-icons"

import "./BottomBar.css"

export default function BottomBar() {
    return (
        <div className="contact-links">
            <span className="email"><code>Reach Out!</code></span>
            <a href="https://github.com/rm206" target="_blank" rel="noopener noreferrer">
                <FontAwesomeIcon icon={faGithub} className="icon" size="3x" />
            </a>
            <a href="https://www.linkedin.com/in/rishabh-mediratta/" target="_blank" rel="noopener noreferrer">
                <FontAwesomeIcon icon={faLinkedin} className="icon" size="3x" />
            </a>
            <span className="email"><code>panicpark60 [at] gmail [dot] com</code></span>
        </div>
    )
}