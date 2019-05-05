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