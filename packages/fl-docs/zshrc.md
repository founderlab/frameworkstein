# Some aliases and things for your shell. Add to .bash_profile or .zshrc

```
# Custom stuff
# ------------

cd ~/
export PATH="/usr/local/bin:$PATH"
export EDITOR="sbl"

DISABLE_AUTO_TITLE="true"
PR_TITLEBAR=''
set-window-title() {
  window_title="\033];${PWD##*/}\007"
  echo -ne "$window_title"
}
set-window-title
precmd () {set-window-title}


# zsh
# ------

bindkey -e
bindkey '[C' forward-word
bindkey '[D' backward-word
alias fuck='eval $(thefuck $(fc -ln -1))' #https://github.com/nvbn/thefuck


# Node
# ------

# source $(brew --prefix nvm)/nvm.sh
# remove when nvm bug fixed https://github.com/creationix/nvm/issues/855
# nvm use --delete-prefix v4.1.2

alias ns='npm start'
alias nt='npm test'
alias ds='npm run dev'
alias dds='DEBUG=true npm run dev'
alias dw='npm run watch'
alias de='rm -rf ./lib && npx babel ./src --watch --out-dir ./lib'
alias nb='npm run build; git add .; c "build"; p'
alias rinm='rm -rf node_models && npm install'
function mt() { NODE_ENV=test UNIT=true mocha $1 --compilers coffee:coffee-script/register  --reporter nyan --timeout 120000; }
function npm-i-all() { find . -name package.json -maxdepth 2 -print -execdir rm -rf node_modules/ \; && find . -name package.json -maxdepth 2 -execdir npm install \; }


# Git
# ------

function git-pull-all() { find . -maxdepth 1 -type d -print -execdir git --git-dir={}/.git --work-tree=$PWD/{} pull \; }
function github-init-here() { git init; git remote add origin git@github.com:founderlab/${PWD##*/}.git; git pull; git checkout -f master; }
function bitbucket-init-here() { git init; git remote add origin git@bitbucket.org:founderlab/${PWD##*/}.git; git pull; git checkout -f master; }
function link-this() {
  local dir=$PWD
  local link="../../../_${PWD##*/}"
  echo "Checking out $link to $dir"
  if [ -e $link ]
  then
    rm $link
  fi
  ln -s $dir $link
}
function github-this() {
  link-this
  github-init-here
}
function bitbucket-this() {
  link-this
  bitbucket-init-here
}
alias c="git add . && git commit -am"
alias co="git checkout"
alias p="git push"
alias gs="git status"


# Android
# ------
export ANDROID_HOME=/usr/local/opt/android-sdk

```