#!/bin/sh

package() {
  mkdir dist/
  # 简单打包dist
  cp -r index.html style.css player.js favicon.ico img/ dist/
}


setup_ssh() {
  mkdir -p ~/.ssh/
  echo "$SSH_PRIVATE_KEY" > ~/.ssh/"$HOST_KEY".pri.key
  chmod 600 ~/.ssh/"$HOST_KEY".pri.key
  cat >> ~/.ssh/config <<END
Host $HOST_KEY
  HostName $SSH_HOST
  User $SSH_USER
  IdentityFile ~/.ssh/$HOST_KEY.pri.key
  StrictHostKeyChecking no
END
}

sync_files() {
  rsync -avz --progress ./dist/ root:/usr/local/nginx/html/musics/dist/
}

reload_nginx() {
  ssh root "docker exec nginx nginx -s reload"
}