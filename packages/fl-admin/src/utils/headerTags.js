export default (props) => ({

  meta: [
    {charset: 'utf-8'},
    {'http-equiv': 'X-UA-Compatible', content: 'IE=edge'},
    {name: 'viewport', content: 'width=device-width, initial-scale=1'},

    {name: 'msapplication-TileImage', content: '/public/favicons/mstile-144x144.png'},
    {name: 'msapplication-config', content: '/public/favicons/browserconfig.xml'},
    {name: 'theme-color', content: '#ffffff'},
  ],

  link: [
    {rel: 'apple-touch-icon', sizes: '57x57', href: '/public/favicons/apple-touch-icon-57x57.png'},
    {rel: 'apple-touch-icon', sizes: '60x60', href: '/public/favicons/apple-touch-icon-60x60.png'},
    {rel: 'apple-touch-icon', sizes: '72x72', href: '/public/favicons/apple-touch-icon-72x72.png'},
    {rel: 'apple-touch-icon', sizes: '76x76', href: '/public/favicons/apple-touch-icon-76x76.png'},
    {rel: 'apple-touch-icon', sizes: '114x114', href: '/public/favicons/apple-touch-icon-114x114.png'},
    {rel: 'apple-touch-icon', sizes: '120x120', href: '/public/favicons/apple-touch-icon-120x120.png'},
    {rel: 'apple-touch-icon', sizes: '144x144', href: '/public/favicons/apple-touch-icon-144x144.png'},
    {rel: 'apple-touch-icon', sizes: '152x152', href: '/public/favicons/apple-touch-icon-152x152.png'},
    {rel: 'apple-touch-icon', sizes: '180x180', href: '/public/favicons/apple-touch-icon-180x180.png'},
    {rel: 'icon', type: 'image/png', href: '/public/favicons/favicon-32x32.png', sizes: '32x32'},
    {rel: 'icon', type: 'image/png', href: '/public/favicons/android-chrome-192x192.png', sizes: '192x192'},
    {rel: 'icon', type: 'image/png', href: '/public/favicons/favicon-96x96.png', sizes: '96x96'},
    {rel: 'icon', type: 'image/png', href: '/public/favicons/favicon-16x16.png', sizes: '16x16'},
    {rel: 'manifest', href: '/public/favicons/manifest.json'},
    {rel: 'mask-icon', href: '/public/favicons/safari-pinned-tab.svg" color="#5bbad5'},
    {rel: 'shortcut icon', href: '/public/favicons/favicon.ico'},
  ],

})
