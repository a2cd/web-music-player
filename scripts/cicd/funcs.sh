#!/bin/sh

package() {
  mkdir dist/
  # 简单打包dist
  cp -r index.html style.css player.js favicon.ico img/ dist/
}


setup_ssh() {
  mkdir -p ~/.ssh/
  echo "$SSH_PRIVATE_KEY" > ~/.ssh/github_actions.pri.key
  chmod 600 ~/.ssh/github_actions.pri.key
  cat >> ~/.ssh/config <<END
Host remote-server
  HostName $SSH_HOST
  User $SSH_USER
  IdentityFile ~/.ssh/github_actions.pri.key
  StrictHostKeyChecking no
END
}

sync_files() {
  rsync -avz --progress ./dist/ remote-server:/usr/local/nginx/html/musics/dist/
}

reload_nginx() {
  ssh remote-server "docker exec nginx nginx -s reload"
}
