# FounderLab environment setup (mac)

### Install these things if you haven't already:

1.  [Homebrew](https://brew.sh) - A package manager for mac. Use it from the command line. Whenever you need to install something, try doing so with brew first (with `brew install xxx`).

2.  [Node](https://nodejs.org) - Install with `brew install node`. This will also install [npm](https://www.npmjs.com/).

3.  [Mongodb](https://www.mongodb.org/) - Install with `brew install mongodb`. We use mongo for our database needs while developing because it's super simple.
    Make it run on startup:
    `$ ln -sfv /usr/local/opt/mongodb/*.plist ~/Library/LaunchAgents`
    And start it now:
    `$ launchctl load ~/Library/LaunchAgents/homebrew.mxcl.mongodb.plist`
    Also grab [Robomongo](http://robomongo.org/) - It's a mongodb GUI. Not available on homebrew, you'll have to download it from the site.

4.  [PostgreSQL](http://www.postgresql.org/) - Install with `brew install postgres`. We'll use Postgres when moving from development to staging. Install [pgAdmin](http://www.pgadmin.org/download/macosx.php) for a GUI.

5.  [Redis](http://redis.io/) - Install with `brew install redis`. Redis is a fast key value store. Used for caching and storing session data.

6.  Global Node packages

    Install a few global packages
    `npm i -g nodemon babel@5.x.x mocha webpack istanbul react-native-cli frameworkstein`

    Linting packages - we'll use these in sublime to help keep our javascript in line with our style guide. Just run this command for now.
    `npm i -g eslint babel-eslint eslint-plugin-react eslint-config-airbnb eslint-config-founderlab`

7.  [Sublime](http://www.sublimetext.com/3) - Probably the most popular text editor these days. Make sure you have version 3. See sublime_setup.md for specific config. Atom or vim or whatever is fine too of course if you already have a preference.

8.  [iTerm2](http://iterm2.com/) - Download this (again, it's not on homebrew) and use it instead of the Terminal app on mac.
    
    [oh-my-zsh](http://ohmyz.sh/) - Install via the script if you don't have a nice shell already. This replaces bash with zsh with a bunch of nice configs already set up.

9.  [ssh key setup](https://confluence.atlassian.com/bitbucket/set-up-ssh-for-git-728138079.html) - Use this method for git authentication. You can come back to this later.

10.  (Native only) [react-native android setup](https://facebook.github.io/react-native/docs/android-setup.html). You can come back to this later too.
