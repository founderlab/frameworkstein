import 'fl-admin/css/index.scss'
import 'react-select/dist/react-select.css'
import 'react-datetime/css/react-datetime.css'

import { getRoutes } from 'fl-admin'
import render from './render'
import configureAdmin from '../shared/configureAdmin'

configureAdmin()
render(getRoutes)
