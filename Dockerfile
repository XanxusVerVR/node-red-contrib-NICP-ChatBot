ARG NODE_VERSION=8.16.0-stretch
FROM node:${NODE_VERSION}

# 安裝ssh和git
RUN apt-get -y update && apt-get upgrade -y && apt-get -y install --no-install-recommends build-essential git ssh vim
RUN mkdir -p /root/.ssh
COPY ./.ssh /root/.ssh

# Home directory for Node-RED application source code.
RUN mkdir -p /usr/src/node-red

# User data directory (就是.node-red), contains flows, config and nodes.
RUN mkdir -p /data/nodes

# 建置NICP專案
COPY ./NICP/ /data/nodes/node-red-contrib-FCF-ChatBot
RUN cd /data/nodes/node-red-contrib-FCF-ChatBot \
    && npm uninstall eddystone-beacon \
    && rm -rf NICP-Beacon.html NICP-Beacon.js \
    && npm install \
    && mkdir -p /data/projects \
    && cd /data/projects \
    && git clone ssh://git@140.121.196.20:4183/XanxusVer.V.R/NICP-Rewabo-NodeRED-Flow.git

# 設置工作目錄
WORKDIR /usr/src/node-red

# Add node-red user so we aren't running as root.
RUN useradd --home-dir /usr/src/node-red --no-create-home node-red \
    && chown -R node-red:node-red /data \
    && chown -R node-red:node-red /usr/src/node-red

USER node-red

# package.json contains Node-RED NPM module and node dependencies
COPY package.json /usr/src/node-red/
RUN npm install
COPY settings.js /data
COPY .config.json /data

# User configuration directory volume
EXPOSE 1880

# Environment variable holding file path for flows configuration
ENV FLOWS=flows.json
ENV NODE_PATH=/usr/src/node-red/node_modules:/data/node_modules

CMD ["npm", "start", "--", "--userDir", "/data"]