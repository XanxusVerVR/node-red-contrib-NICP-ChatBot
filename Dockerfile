ARG NODE_VERSION=8.16.0-stretch
FROM node:${NODE_VERSION}

# 安裝git和創造.ssh資料夾路徑
RUN apt-get update -y \
    && apt-get install --no-install-recommends build-essential git -y \
    && rm -rf /var/lib/apt/lists/* \
    && mkdir -p /root/.ssh
COPY ./.ssh /root/.ssh

# Home directory for Node-RED application source code.
RUN mkdir -p /usr/src/node-red \
# User data directory (就是.node-red), contains flows, config and nodes.
    && mkdir -p /data/nodes

# 建置NICP專案
COPY ./NICP/ /data/nodes/node-red-contrib-FCF-ChatBot
RUN cd /data/nodes/node-red-contrib-FCF-ChatBot \
    && npm uninstall eddystone-beacon lirc_node \
    && rm -rf NICP-Beacon.html NICP-Beacon.js lirc.html lirc.js \
    && npm install \
    && mkdir -p /data/projects \
    && cd /data/projects \
    && git clone ssh://git@140.121.196.20:4183/XanxusVer.V.R/NICP-Rewabo-NodeRED-Flow.git

# 設置工作目錄
WORKDIR /usr/src/node-red

# package.json contains Node-RED NPM module and node dependencies
COPY package.json /usr/src/node-red/
RUN npm install
COPY settings.js .config.json /data/

# User configuration directory volume
EXPOSE 1880

# Environment variable holding file path for flows configuration
ENV FLOWS=flows.json
ENV NODE_PATH=/usr/src/node-red/node_modules:/data/node_modules

CMD ["npm", "start", "--", "--userDir", "/data"]