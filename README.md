# NICP Docker Build
### 執行建置Image檔：
    docker build -t nicp-node-red:v1 .
###### 建置中可能遇到的問題：

    Cloning into 'NICP-Rewabo-NodeRED-Flow'...
    @@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@
    @         WARNING: UNPROTECTED PRIVATE KEY FILE!          @
    @@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@
    Permissions 0664 for '/root/.ssh/id_rsa' are too open.
    It is required that your private key files are NOT accessible by others.
    This private key will be ignored.
    Load key "/root/.ssh/id_rsa": bad permissions
    Permission denied, please try again.
    Permission denied, please try again.
    Permission denied (publickey,password).
    fatal: Could not read from remote repository.

    Please make sure you have the correct access rights
    and the repository exists.
###### 可能因.ssh權限太開放，將他的權限降低：
    sudo chmod -R 700 .ssh
# 執行容器
    docker run -d -p 1880:1880 --name nicp-node-red1 nicp-node-red:v1
# 停止容器
	docker stop nicp-node-red1
# 刪除容器
	docekr rm nicp-node-red1
# 用certbot取得憑證
	sudo certbot --nginx certonly
###### 注：可以只選xanxus-node-red.cf這個(前面沒有www的)