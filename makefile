include env.sh

APP=whos-your-mate-app
APP_TAG=latest

USER_API_ADDRESS=${USER}@${HOST}
SSH_DEPLOY_PATH=${USER_API_ADDRESS}:${DEPLOY_PATH}

deploy: build-image rsync-img2server rsync-dcompose2server clean

build-image:
	set -e; docker build --platform="linux/amd64" -t ${APP}:${APP_TAG} -f dockerfile .
	docker save ${APP}:${APP_TAG} > ${APP}.tar

rsync-img2server:
	set -e; rsync -avzh --chmod=F700 $(APP).tar ${SSH_DEPLOY_PATH}; ssh ${USER_API_ADDRESS} 'docker load -i ${DEPLOY_PATH}/$(APP).tar; rm ${DEPLOY_PATH}/$(APP).tar'

rsync-dcompose2server:
	set -e; rsync -avzh --chmod=F600 docker-compose.yml ${SSH_DEPLOY_PATH}/

clean:
	rm -rf ${APP}.tar
	docker rmi ${APP}:${APP_TAG}