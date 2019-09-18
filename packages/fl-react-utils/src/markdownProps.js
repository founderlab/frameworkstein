/* eslint-disable react/prop-types */
import React from 'react'

export default {
  escapeHtml: true,
  renderers: {
    link: props => <a href={props.href} target="_blank" rel="noopener noreferrer">{props.children}</a>,
    image: props => <img alt="embed" className="mw-100" src={props.src} />,
  },
}
